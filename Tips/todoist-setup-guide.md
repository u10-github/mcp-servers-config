# Todoist MCPサーバー セットアップガイド

このガイドでは、Cursor AIアシスタントと連携するためのTodoist MCPサーバーのセットアップ方法について説明します。

## 準備

### 必要なもの

1. Node.js（バージョン14以上推奨）
2. npm（Node.jsに付属）
3. Todoistアカウントと有効なAPIトークン
4. Cursor（AI拡張エディタ）

### TodoistのAPIトークンの取得方法

1. [Todoist](https://todoist.com/) にログイン
2. 右上のプロフィールアイコンをクリック
3. 「設定」を選択
4. 左メニューから「連携サービス」を選択
5. 「開発者向け」セクションの「APIトークン」をコピー

## インストール手順

### 1. Todoistサーバーのインストール

npmを使用してグローバルにインストールします：

```bash
npm install -g @abhiz123/todoist-mcp-server
```

### 2. プロジェクトのセットアップ

1. プロジェクトディレクトリを作成（例：`mcp-servers`）
2. その中にTodoist用のディレクトリを作成（例：`todoist-server`）

```bash
mkdir -p mcp-servers/todoist-server
cd mcp-servers/todoist-server
```

### 3. 設定ファイルの作成

#### A) .envファイルの作成

```bash
echo "TODOIST_API_TOKEN=あなたのAPIトークン" > .env
```

#### B) 起動スクリプトの作成（run-todoist.js）

```javascript
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * Todoistサーバー起動スクリプト
 */

// 環境変数からTODOIST_API_TOKENを取得、または.envファイルから読み込む
function getToken() {
  // まず環境変数をチェック
  if (process.env.TODOIST_API_TOKEN) {
    console.log('環境変数からTODOIST_API_TOKENを取得しました');
    return process.env.TODOIST_API_TOKEN;
  }
  
  // 環境変数になければ.envファイルを確認
  try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      console.log('.envファイルを読み込んでいます...');
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const tokenMatch = envContent.match(/TODOIST_API_TOKEN=(.+)(\r?\n|$)/);
      if (tokenMatch && tokenMatch[1]) {
        return tokenMatch[1].trim();
      }
    }
    console.error('警告: TODOIST_API_TOKENが環境変数または.envファイルに見つかりませんでした');
    console.error('.envファイルを作成して、TODOIST_API_TOKEN=あなたのトークン を追加してください');
    process.exit(1);
  } catch (error) {
    console.error('.envファイルの読み込みエラー:', error.message);
    process.exit(1);
  }
}

// Todoistサーバーのモジュールパスを取得
function getModulePath() {
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    if (process.env.APPDATA) {
      return path.join(process.env.APPDATA, 'npm', 'node_modules', '@abhiz123', 'todoist-mcp-server', 'dist', 'index.js');
    } else {
      return path.join(process.env.USERPROFILE || 'C:\\Users\\' + process.env.USERNAME, 'AppData', 'Roaming', 'npm', 'node_modules', '@abhiz123', 'todoist-mcp-server', 'dist', 'index.js');
    }
  } else {
    return path.join(process.env.HOME || '/usr/local', '.npm', 'node_modules', '@abhiz123', 'todoist-mcp-server', 'dist', 'index.js');
  }
}

// トークンを取得
const todoistToken = getToken();
if (!todoistToken) {
  console.error('有効なTODOIST_API_TOKENが見つかりませんでした。処理を中止します。');
  process.exit(1);
}

// 環境変数を設定してサーバーを起動
const env = { ...process.env, TODOIST_API_TOKEN: todoistToken };

// モジュールパスを取得
const modulePath = getModulePath();

console.log('Todoist MCPサーバーを起動しています...');
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
    console.error('対処法: npm install -g @abhiz123/todoist-mcp-server コマンドでパッケージを再インストールしてみてください');
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
echo "@echo off" > todoist-server.bat
echo "node \"%~dp0run-todoist.js\"" >> todoist-server.bat
```

## Cursorの設定

Cursorの設定画面で以下の内容を登録します：

1. アシスタント設定を開く
2. MCPサーバーの追加ボタンをクリック
3. 以下の情報を入力：
   - **名前**: Todoist
   - **タイプ**: command
   - **コマンド**: `node --experimental-modules C:/パス/todoist-server/run-todoist.js`
   または
   - **コマンド**: `C:/パス/todoist-server/todoist-server.bat`
4. 保存して有効化

## 動作確認

1. Cursorを再起動するか、MCPサーバーの再接続を行う
2. アシスタントに以下のようなタスク管理の指示を出す：
   - 「新しいタスクを作成して」
   - 「今日のタスク一覧を表示して」
   - 「タスクを完了としてマークして」

## トラブルシューティング

### サーバーが起動しない場合

1. APIトークンが正しいことを確認
2. モジュールパスが正しいことを確認：
   ```bash
   npm list -g | grep todoist-mcp-server
   ```
3. Node.jsのバージョンを確認（v14以上推奨）：
   ```bash
   node --version
   ```
4. 必要に応じてパッケージを再インストール：
   ```bash
   npm uninstall -g @abhiz123/todoist-mcp-server
   npm install -g @abhiz123/todoist-mcp-server
   ```

### 「Failed to create client」エラー

1. APIトークンが有効かどうか確認
2. .envファイルのフォーマットが正しいか確認（余分な空白がないか）
3. コマンドラインで直接トークンを指定してみる：
   ```bash
   TODOIST_API_TOKEN=あなたのトークン node --experimental-modules パス/to/index.js
   ```

### その他のヒント

- パスにはバックスラッシュではなくフォワードスラッシュを使用する（`C:/path` のように）
- パスに空白や特殊文字がある場合は引用符で囲む
- バッチファイルを使用すると、パスの問題を回避しやすくなる

## Todoistサーバーで利用可能な機能

MCPサーバーを設定すると、Cursor AIアシスタントで以下のTodoist機能が利用可能になります：

1. `todoist_create_task` - 新しいタスクを作成
2. `todoist_get_tasks` - タスクの一覧を取得
3. `todoist_update_task` - 既存のタスクを更新
4. `todoist_delete_task` - タスクを削除
5. `todoist_complete_task` - タスクを完了としてマーク

## 参考リンク

- [Todoist API ドキュメント](https://developer.todoist.com/rest/v2/)
- [Node.js ドキュメント](https://nodejs.org/ja/docs/)
- [MCP サーバープロジェクト](https://github.com/abhiz123/todoist-mcp-server) 