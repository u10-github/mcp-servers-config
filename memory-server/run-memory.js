// Memory Server Runner
const { spawn } = require('child_process');
const path = require('path');

// ディレクトリをメモリサーバーの場所に変更
process.chdir(__dirname);

// npxコマンドを実行
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const server = spawn(npx, ['-y', '@modelcontextprotocol/server-memory'], {
  stdio: 'inherit'
});

// エラーハンドリング
server.on('error', (err) => {
  console.error('Failed to start memory server:', err);
});

console.log('Memory server started'); 