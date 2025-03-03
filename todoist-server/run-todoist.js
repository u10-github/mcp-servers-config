const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// 環境変数からTODOIST_API_TOKENを取得、または.envファイルから読み込む
function getToken() {
  // まず環境変数をチェック
  if (process.env.TODOIST_API_TOKEN) {
    return process.env.TODOIST_API_TOKEN;
  }
  
  // 環境変数になければ.envファイルを確認
  try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const tokenMatch = envContent.match(/TODOIST_API_TOKEN=(.+)(\r?\n|$)/);
      if (tokenMatch && tokenMatch[1]) {
        return tokenMatch[1].trim();
      }
    }
    console.error('TODOIST_API_TOKENが環境変数または.envファイルに見つかりませんでした');
    console.error('.envファイルを作成して、TODOIST_API_TOKEN=あなたのトークン を追加してください');
    process.exit(1);
  } catch (error) {
    console.error('.envファイルの読み込みエラー:', error.message);
    process.exit(1);
  }
}

// トークンを取得
const todoistToken = getToken();

// 環境変数を設定してサーバーを起動
const env = { ...process.env, TODOIST_API_TOKEN: todoistToken };

console.log('Todoist MCPサーバーを起動しています...');

// Windows環境ではnodeの実行方法を調整
const isWindows = process.platform === 'win32';
const nodeModule = path.resolve(process.env.APPDATA, 'npm/node_modules/@abhiz123/todoist-mcp-server/dist/index.js');

const proc = spawn('node', [nodeModule], {
  env: env,
  stdio: 'inherit',
  shell: true
});

proc.on('error', (err) => {
  console.error('サーバー起動エラー:', err);
});

proc.on('exit', (code) => {
  if (code !== 0) {
    console.error(`サーバーが終了コード ${code} で終了しました`);
  }
}); 