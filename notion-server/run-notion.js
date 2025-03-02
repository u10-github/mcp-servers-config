const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// .envファイルからNOTION_API_TOKENを読み込む
function readTokenFromEnvFile() {
  try {
    // 現在のディレクトリにある.envファイルを読み込む
    const envPath = path.resolve(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    
    // NOTION_API_TOKEN=の行を探して値を抽出
    const tokenMatch = envContent.match(/NOTION_API_TOKEN=(.+)(\r?\n|$)/);
    if (tokenMatch && tokenMatch[1]) {
      return tokenMatch[1].trim();
    } else {
      console.error('NOTION_API_TOKENが.envファイルに見つかりませんでした');
      process.exit(1);
    }
  } catch (error) {
    console.error('.envファイルの読み込みエラー:', error.message);
    process.exit(1);
  }
}

// トークンを取得
const notionToken = readTokenFromEnvFile();

// 環境変数を設定してサーバーを起動
const env = { ...process.env, NOTION_API_TOKEN: notionToken };

console.log('Notion MCPサーバーを起動しています...');

// Windows環境ではnpxがnpx.cmdとして存在する場合がある
const isWindows = process.platform === 'win32';
const npxCommand = isWindows ? 'npx.cmd' : 'npx';

const proc = spawn(npxCommand, ['-y', '@suekou/mcp-notion-server'], {
  env: env,
  stdio: 'inherit',
  shell: true // シェル経由で実行することで、PATHが適切に解決される
});

proc.on('error', (err) => {
  console.error('サーバー起動エラー:', err);
});

proc.on('exit', (code) => {
  if (code !== 0) {
    console.error(`サーバーが終了コード ${code} で終了しました`);
  }
}); 