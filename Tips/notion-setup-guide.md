# Notion MCPサーバー セットアップガイド

このガイドでは、Cursor AIアシスタントと連携するためのNotion MCPサーバーのセットアップ方法について説明します。

## 準備

### 必要なもの

1. Node.js（バージョン14以上推奨）
2. npm（Node.jsに付属）
3. Notionアカウントと有効なAPIトークン（インテグレーション）
4. Cursor（AI拡張エディタ）

### NotionのAPIトークンの取得方法

1. [Notion Developers](https://www.notion.so/my-integrations) にアクセス
2. 「+ 新しいインテグレーション」をクリック
3. インテグレーション名を入力（例：「Cursor AI Assistant」）
4. ワークスペースを選択
5. 機能に「読み取り」と「挿入」の権限を選択
6. 「送信」をクリック
7. 表示されたシークレットトークンをコピー
8. Notionページでインテグレーションを共有（接続したいページの「...」→「共有」→インテグレーション名を追加）

## インストール手順

### 1. Notionサーバーのインストール

npmを使用してグローバルにインストールします：

```bash
npm install -g @notionhq/client @makenotion/notion-mcp-server
```

### 2. プロジェクトのセットアップ

1. プロジェクトディレクトリを作成（例：`mcp-servers`）
2. その中にNotion用のディレクトリを作成（例：`notion-server`）

```bash
mkdir -p mcp-servers/notion-server
cd mcp-servers/notion-server
```

### 3. 設定ファイルの作成

#### A) .envファイルの作成

```bash
echo "NOTION_API_TOKEN=あなたのAPIトークン" > .env
```

#### B) 起動スクリプトの作成（run-notion.js）

```javascript
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * Notionサーバー起動スクリプト
 */

// 環境変数からNOTION_API_TOKENを取得、または.envファイルから読み込む
function getToken() {
  // まず環境変数をチェック
  if (process.env.NOTION_API_TOKEN) {
    console.log('環境変数からNOTION_API_TOKENを取得しました');
    return process.env.NOTION_API_TOKEN;
  }
  
  // 環境変数になければ.envファイルを確認
  try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      console.log('.envファイルを読み込んでいます...');
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const tokenMatch = envContent.match(/NOTION_API_TOKEN=(.+)(\r?\n|$)/);
      if (tokenMatch && tokenMatch[1]) {
        return tokenMatch[1].trim();
      }
    }
    console.error('警告: NOTION_API_TOKENが環境変数または.envファイルに見つかりませんでした');
    console.error('.envファイルを作成して、NOTION_API_TOKEN=あなたのトークン を追加してください');
    process.exit(1);
  } catch (error) {
    console.error('.envファイルの読み込みエラー:', error.message);
    process.exit(1);
  }
}

// Notionサーバーのモジュールパスを取得
function getModulePath() {
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    if (process.env.APPDATA) {
      return path.join(process.env.APPDATA, 'npm', 'node_modules', '@makenotion', 'notion-mcp-server', 'dist', 'index.js');
    } else {
      return path.join(process.env.USERPROFILE || 'C:\\Users\\' + process.env.USERNAME, 'AppData', 'Roaming', 'npm', 'node_modules', '@makenotion', 'notion-mcp-server', 'dist', 'index.js');
    }
  } else {
    return path.join(process.env.HOME || '/usr/local', '.npm', 'node_modules', '@makenotion', 'notion-mcp-server', 'dist', 'index.js');
  }
}

// トークンを取得
const notionToken = getToken();
if (!notionToken) {
  console.error('有効なNOTION_API_TOKENが見つかりませんでした。処理を中止します。');
  process.exit(1);
}

// 環境変数を設定してサーバーを起動
const env = { ...process.env, NOTION_API_TOKEN: notionToken };

// モジュールパスを取得
const modulePath = getModulePath();

console.log('Notion MCPサーバーを起動しています...');
console.log(`使用モジュール: ${modulePath}`);

// 実行オプション
const nodeOptions = ['--experimental-modules']; // ES Modulesをサポート

// サーバーを起動
try {
  const proc = spawn('node', [...nodeOptions, modulePath], {
    env: env,
    stdio: 'inherit',
    shell: true
  });

  proc.on('error', (err) => {
    console.error('サーバー起動エラー:', err);
    console.error('対処法: npm install -g @notionhq/client @makenotion/notion-mcp-server コマンドでパッケージを再インストールしてみてください');
  });

  proc.on('exit', (code) => {
    if (code !== 0) {
      console.error(`サーバーが終了コード ${code} で終了しました`);
      console.error('異常終了した場合は、トークンが有効か確認してください');
    }
  });
  
  // 終了イベントを処理
  process.on('SIGINT', () => {
    console.log('サーバーを終了しています...');
    proc.kill('SIGINT');
  });
} catch (error) {
  console.error('サーバー起動中に致命的なエラーが発生しました:', error.message);
  process.exit(1);
}
```

#### C) バッチファイルの作成（Windowsの場合）

```bash
echo "@echo off" > notion-server.bat
echo "node \"%~dp0run-notion.js\"" >> notion-server.bat
```

## Cursorの設定

Cursorの設定画面で以下の内容を登録します：

1. アシスタント設定を開く
2. MCPサーバーの追加ボタンをクリック
3. 以下の情報を入力：
   - **名前**: Notion
   - **タイプ**: command
   - **コマンド**: `node --experimental-modules C:/パス/notion-server/run-notion.js`
   または
   - **コマンド**: `C:/パス/notion-server/notion-server.bat`
4. 保存して有効化

## 動作確認

1. Cursorを再起動するか、MCPサーバーの再接続を行う
2. アシスタントに以下のようなNotion関連の指示を出す：
   - 「ページを作成して」
   - 「データベースを検索して」
   - 「コメントを追加して」

## Notionインテグレーションのページ共有

Notionの重要な点として、インテグレーションはデフォルトでは**どのページにもアクセスできません**。アクセスさせたいページや各データベースごとに明示的に共有設定を行う必要があります：

1. アクセスさせたいNotionページを開く
2. 右上の「···」（詳細メニュー）をクリック
3. 「共有」を選択
4. インテグレーションの名前を検索
5. 「招待」をクリック

## トラブルシューティング

### サーバーが起動しない場合

1. APIトークンが正しいことを確認
2. モジュールパスが正しいことを確認：
   ```bash
   npm list -g | grep notion-mcp-server
   ```
3. Node.jsのバージョンを確認（v14以上推奨）：
   ```bash
   node --version
   ```
4. 必要に応じてパッケージを再インストール：
   ```bash
   npm uninstall -g @makenotion/notion-mcp-server
   npm install -g @notionhq/client @makenotion/notion-mcp-server
   ```

### 「Access denied」または「Object not found」エラー

1. APIトークンが有効かどうか確認
2. インテグレーションが該当のページに共有されているか確認
3. ページIDが正しいことを確認（形式：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx）

### その他のヒント

- パスにはバックスラッシュではなくフォワードスラッシュを使用する（`C:/path` のように）
- パスに空白や特殊文字がある場合は引用符で囲む
- バッチファイルを使用すると、パスの問題を回避しやすくなる

## Notionサーバーで利用可能な機能

MCPサーバーを設定すると、Cursor AIアシスタントで以下のNotion機能が利用可能になります：

1. `notion_append_block_children` - ブロックに子ブロックを追加
2. `notion_retrieve_block` - ブロックを取得
3. `notion_retrieve_block_children` - ブロックの子要素を取得
4. `notion_delete_block` - ブロックを削除
5. `notion_retrieve_page` - ページを取得
6. `notion_update_page_properties` - ページのプロパティを更新
7. `notion_create_database` - データベースを作成
8. `notion_query_database` - データベースをクエリ
9. `notion_retrieve_database` - データベースを取得
10. `notion_update_database` - データベースを更新
11. `notion_create_database_item` - データベースに項目を作成
12. `notion_create_comment` - コメントを作成
13. `notion_retrieve_comments` - コメントを取得
14. `notion_search` - 検索

## 参考リンク

- [Notion API ドキュメント](https://developers.notion.com/)
- [Node.js ドキュメント](https://nodejs.org/ja/docs/)
- [Notion Developers](https://www.notion.so/my-integrations) 