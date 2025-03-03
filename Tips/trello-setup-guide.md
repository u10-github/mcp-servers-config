# Trello MCPサーバー設定ガイド

このガイドでは、Trello MCPサーバーの設定と使用方法について説明します。

## 目次

1. [前提条件](#前提条件)
2. [環境設定](#環境設定)
3. [サーバー起動スクリプト](#サーバー起動スクリプト)
4. [よくある問題と解決策](#よくある問題と解決策)
5. [使用方法](#使用方法)

## 前提条件

- Node.js（推奨バージョン: 16.x以上）
- npm（Node.jsとともにインストール）
- Trello API Key と Token（開発中はダミー値でも可）

## 環境設定

### 1. APIキーとトークンの設定

Trello MCPサーバーを使用するには、TrelloのAPIキーとトークンが必要です。これらは以下の2つの方法で設定できます：

#### 方法1: 環境変数を使用

```bash
export TRELLO_API_KEY=あなたのAPIキー
export TRELLO_TOKEN=あなたのトークン
```

#### 方法2: .envファイルを使用

プロジェクトのルートディレクトリに`.env`ファイルを作成し、以下の内容を追加します：

```
TRELLO_API_KEY=あなたのAPIキー
TRELLO_TOKEN=あなたのトークン
```

**注意**: 開発中であれば、実際の値がなくてもダミー値（例：`xxx`）で動作します。

## サーバー起動スクリプト

Trello MCPサーバーは、特別なスクリプトを使用して起動します。このスクリプトは、環境変数またはconfigファイルから認証情報を読み取り、サーバーを起動します。

### ES Modules形式のスクリプト (run-trello.mjs)

```javascript
// ESモジュール形式のTrello MCPサーバー起動スクリプト
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
  
  // サーバー起動 - trelloディレクトリ内のbuild/index.jsを指定
  const serverPath = path.join(__dirname, 'trello', 'build', 'index.js');
  
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
```

このスクリプトを保存したら、以下のコマンドで実行します：

```bash
node run-trello.mjs
```

## よくある問題と解決策

### モジュールが見つからないエラー (MODULE_NOT_FOUND)

**症状**: `Error: Cannot find module '/path/to/trello/build/index.js'`のようなエラーが表示される

**解決策**:
1. ディレクトリ構造を確認してください。trelloディレクトリとその中のbuildフォルダが存在することを確認します。
2. スクリプト内のパスが正しいか確認してください。必要に応じて、絶対パスに変更します。
3. プロジェクトが正しくビルドされているか確認してください。

### CommonJSとESモジュールの互換性問題

**症状**: `SyntaxError: Cannot use import statement outside a module`のようなエラーが表示される

**解決策**:
1. ファイル拡張子が`.js`の場合は`.mjs`に変更します。
2. package.jsonに`"type": "module"`を追加します。
3. `.js`のまま使用したい場合は、`import`文を`require()`に変更します。

### サーバー起動時のエラー

**症状**: サーバー起動時に予期しないエラーが発生する

**解決策**:
1. Node.jsのバージョンを確認してください（推奨: 16.x以上）。
2. 必要なパッケージがすべてインストールされているか確認してください。
3. 環境変数が正しく設定されているか確認してください。

## 使用方法

Trello MCPサーバーが正常に起動すると、以下のメッセージが表示されます：

```
Trello MCPサーバーを起動しています...
Trello MCP server running on stdio.
```

これで、AI Assistantを通じてTrello機能を使用できるようになります。以下のような機能が利用可能です：

1. ボードの取得: `mcp__get_boards`
2. リストの取得: `mcp__get_lists`
3. カードの取得: `mcp__get_cards`
4. カードの詳細取得: `mcp__get_card_details`
5. カードの更新: `mcp__update_card`

### 使用例

```
AI Assistantに：「私のTrelloボードを表示してください」と依頼します。
```

正常に動作していれば、AIはTrelloボードの一覧を表示します。

---

このガイドは、Trello MCPサーバーのセットアップと使用に関する基本的な情報を提供します。詳細については、公式ドキュメントを参照してください。 