import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.resolve(__dirname, '..');

function resolveToken() {
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim()) return process.env.GITHUB_TOKEN.trim();
  if (process.argv[2] && process.argv[2].trim() && !process.argv[2].startsWith('-')) return process.argv[2].trim();
  
  if (process.platform === 'win32') {
    try {
      const psScript = path.resolve(dir, 'scratch', 'get_cred.ps1');
      if (fs.existsSync(psScript)) {
        const out = execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', psScript], { encoding: 'utf8' });
        if (out && out.trim()) return out.trim();
      }
    } catch (e) {
      console.warn('⚠️ Token resolution warning:', e.message);
    }
  }
  return null;
}

async function deploy() {
  console.log('📦 Starting Git Status & Deploy Workflow for GamesBoy.net...');
  console.log(`📁 Workspace Directory: ${dir}`);

  // 1. Get status matrix of all files
  const FILE = 0, WORKDIR = 2, STAGE = 3;
  const status = await git.statusMatrix({ fs, dir });

  const changedFiles = status.filter(row => row[WORKDIR] !== row[STAGE]);
  console.log(`📊 Detected ${changedFiles.length} modified/new files:`);
  changedFiles.forEach(row => {
    console.log(`   • ${row[FILE]} (Status: workdir=${row[WORKDIR]}, stage=${row[STAGE]})`);
  });

  if (changedFiles.length === 0) {
    console.log('✨ Working directory is clean. No uncommitted changes.');
  } else {
    // 2. Add all changed files
    for (const [filepath, head, workdir, stage] of changedFiles) {
      if (workdir === 0) {
        // Deleted file
        await git.remove({ fs, dir, filepath });
        console.log(`   ❌ Removed: ${filepath}`);
      } else {
        // Added or modified file
        await git.add({ fs, dir, filepath });
        console.log(`   ➕ Staged: ${filepath}`);
      }
    }

    // 3. Commit
    const commitMsg = process.argv[3] || 'feat: automated commit and deploy - master rules and platform updates';
    const sha = await git.commit({
      fs,
      dir,
      author: {
        name: 'nftencuetas-eng',
        email: 'nftencuetas@gmail.com'
      },
      message: commitMsg
    });
    console.log(`✅ Committed successfully! SHA: ${sha}`);
  }

  // 4. Check remotes
  const remotes = await git.listRemotes({ fs, dir });
  console.log('🌐 Configured Remotes:', remotes);

  // 5. Push to remote
  const token = resolveToken();
  try {
    const currentBranch = await git.currentBranch({ fs, dir, fullname: false });
    console.log(`🌿 Current Branch: ${currentBranch}`);

    if (!token) {
      console.warn('⚠️ Push notice: No GitHub token resolved. Commit created locally but not pushed.');
      return;
    }

    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: currentBranch || 'main',
      onAuth: () => ({ username: token })
    });
    console.log('🚀 Push Result:', pushResult);
    console.log('🎉 Successfully pushed changes to remote repository! Railway deployment triggered.');
  } catch (pushErr) {
    console.warn(`⚠️ Push notice: ${pushErr.message}`);
  }
}

deploy().catch(err => {
  console.error('❌ Deploy error:', err);
});
