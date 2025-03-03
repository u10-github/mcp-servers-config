import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

// __dirnameの代替として現在のファイルのディレクトリパスを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 環境変数からTrello APIキーとトークンを取得、または.envファイルから読み込む
function getCredentials() {
  const credentials = {
    apiKey: null,
    token: null
  };
  
  // まず環境変数をチェック
  if (process.env.TRELLO_API_KEY && process.env.TRELLO_TOKEN) {
    credentials.apiKey = process.env.TRELLO_API_KEY;
    credentials.token = process.env.TRELLO_TOKEN;
    return credentials;
  }
  
  // 環境変数になければ.envファイルを確認
  try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      
      const apiKeyMatch = envContent.match(/TRELLO_API_KEY=(.+)(\r?\n|$)/);
      if (apiKeyMatch && apiKeyMatch[1]) {
        credentials.apiKey = apiKeyMatch[1].trim();
      }
      
      const tokenMatch = envContent.match(/TRELLO_TOKEN=(.+)(\r?\n|$)/);
      if (tokenMatch && tokenMatch[1]) {
        credentials.token = tokenMatch[1].trim();
      }
    }
  } catch (error) {
    console.error('環境変数の読み込みエラー:', error);
  }
  
  return credentials;
}

// サーバー起動用関数
function startServer() {
  const credentials = getCredentials();
  
  if (!credentials.apiKey || !credentials.token) {
    console.error('エラー: Trello認証情報が設定されていません。');
    console.error('環境変数または.envファイルにTRELLO_API_KEYとTRELLO_TOKENを設定してください。');
    process.exit(1);
  }
  
  // 環境変数をセット
  const env = { 
    ...process.env, 
    TRELLO_API_KEY: credentials.apiKey,
    TRELLO_TOKEN: credentials.token
  };
  
  console.log('Trello MCPサーバーを起動しています...');
  
  // サーバー起動 - buildディレクトリ内のindex.jsを指定（ファイル移動に伴う修正）
  const serverPath = path.join(__dirname, 'build', 'index.js');
  
  // パスが存在するか確認
  if (!fs.existsSync(serverPath)) {
    console.error(`エラー: サーバーファイルが見つかりません: ${serverPath}`);
    console.error('プロジェクトが正しくビルドされているか確認してください。');
    process.exit(1);
  }
  
  // サーバー起動
  const proc = spawn('node', [serverPath], {
    env: env,
    stdio: 'inherit',
    shell: true
  });
  
  proc.on('error', (error) => {
    console.error('サーバー起動エラー:', error);
  });
}

// サーバーを起動
startServer(); 