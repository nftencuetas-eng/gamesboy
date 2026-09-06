import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.resolve(__dirname, '..');

const token = process.env.GITHUB_TOKEN || process.argv[2];

async function push() {
  if (!token) {
    console.log('⚠️ No token provided. Run: node scripts/push_with_token.js <YOUR_GITHUB_TOKEN>');
    return;
  }

  console.log('🚀 Pushing commits to https://github.com/nftencuetas-eng/gamesboy.git...');
  const res = await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    ref: 'main',
    onAuth: () => ({ username: token })
  });
  console.log('✅ Push success! Railway build triggered automatically.');
}

push().catch(err => {
  console.error('❌ Push error:', err.message);
});
