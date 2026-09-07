import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.resolve(__dirname, '..');

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
    const commitMsg = 'feat: Dedicated Streaming Platform Hubs with horizontal & vertical desktop banners, live AI releases sync, host group privacy and Escrow Guarantee protection';
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

  // 5. Try push if token/remote is configured
  const token = process.env.GITHUB_TOKEN || process.argv[2];
  try {
    const currentBranch = await git.currentBranch({ fs, dir, fullname: false });
    console.log(`🌿 Current Branch: ${currentBranch}`);

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
