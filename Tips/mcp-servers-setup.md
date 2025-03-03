# MCPサーバーセットアップのTips

このドキュメントは、MCPサーバー（Various Multichannel Platform Server）のセットアップ過程で得られた教訓やヒントをまとめたものです。

## 目次

1. [一般的な設定のヒント](#一般的な設定のヒント)
   - [MCPサーバーの基本](#mcpサーバーの基本)
   - [起動スクリプトの重要性](#起動スクリプトの重要性)
   - [環境変数の設定](#環境変数の設定)
   - [パッケージのインストール](#パッケージのインストール)
2. [Todoistサーバーの設定](#todoistサーバーの設定)
   - [インストール方法](#インストール方法)
   - [設定方法](#設定方法)
   - [重要な教訓](#重要な教訓)
   - [起動スクリプト (run-todoist.js)](#起動スクリプト-run-todoistjs)
3. [Notionサーバーの設定](#notionサーバーの設定)
   - [インストール方法](#インストール方法-1)
   - [設定方法](#設定方法-1)
   - [起動スクリプト](#起動スクリプト)
   - [起動スクリプト (run-notion.js)](#起動スクリプト-run-notionjs)
4. [トラブルシューティング](#トラブルシューティング)
5. [よくある問題と解決策](#よくある問題と解決策)

## 一般的な設定のヒント

### MCPサーバーの基本

- MCPサーバーは、AIプラットフォーム（例：Cursor）と外部サービスを連携させるための中間サーバーです
- 各サービス（Todoist, Notion, GitHub等）は個別のMCPサーバーを必要とします
- サーバーは通常、標準入出力（stdio）を通じて通信を行います

### 起動スクリプトの重要性

MCPサーバーを安定して運用するには、カスタム起動スクリプトの作成が**必須**であることが多いです：

- **環境変数管理**: APIトークンを環境変数または.envファイルから安全に読み込み
- **エラーハンドリング**: 適切なエラーメッセージを表示し、問題解決を容易に
- **クロスプラットフォーム対応**: WindowsとMac/Linux両方で動作するスクリプト
- **安定した起動**: サーバープロセスを適切に管理

基本的な起動スクリプトテンプレート（サービス名を置き換えて使用）：

```javascript
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// APIトークンを取得（環境変数または.envファイルから）
function getToken() {
  const tokenName = 'SERVICE_API_TOKEN'; // 例: TODOIST_API_TOKEN, NOTION_API_TOKEN
  
  // 環境変数をチェック
  if (process.env[tokenName]) {
    return process.env[tokenName];
  }
  
  // .envファイルを確認
  try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const tokenMatch = envContent.match(new RegExp(`${tokenName}=(.+)(\\r?\\n|$)`));
      if (tokenMatch && tokenMatch[1]) {
        return tokenMatch[1].trim();
      }
    }
  } catch (error) {
    console.error('環境変数の読み込みエラー:', error);
  }
  
  return null;
}

// サーバー起動
function startServer() {
  const tokenName = 'SERVICE_API_TOKEN'; // 例: TODOIST_API_TOKEN
  const packageName = 'package-name'; // 例: @abhiz123/todoist-mcp-server
  
  const token = getToken();
  
  if (!token) {
    console.error(`エラー: ${tokenName}が設定されていません。`);
    console.error(`環境変数または.envファイルに${tokenName}を設定してください。`);
    process.exit(1);
  }
  
  // 環境変数を設定
  const env = { ...process.env };
  env[tokenName] = token;
  
  // npxコマンドを検出
  const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  
  console.log('サーバーを起動しています...');
  
  // サーバープロセスを起動
  const proc = spawn(npxCommand, ['-y', packageName], {
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

このスクリプトを個々のMCPサーバー用に調整して、安定した運用を実現してください。

### 環境変数の設定

環境変数は以下の方法で設定できます：

1. システム環境変数として設定（永続的）
2. .envファイルに記述（プロジェクト単位）
3. コマンド実行時に指定（一時的）

```bash
# Windows PowerShellでの一時的な環境変数設定
$env:TODOIST_API_TOKEN = "あなたのトークン"

# Windows コマンドプロンプトでの一時的な環境変数設定
set TODOIST_API_TOKEN=あなたのトークン

# Unix系での一時的な環境変数設定
export TODOIST_API_TOKEN="あなたのトークン"
```

### パッケージのインストール

グローバルインストールされたパッケージは通常以下の場所にあります：

- Windows: `C:/Users/{ユーザー名}/AppData/Roaming/npm/node_modules/`
- Mac/Linux: `/usr/local/lib/node_modules/` または `~/.npm/node_modules/`

## Todoistサーバーの設定

### インストール方法

```bash
npm install -g @abhiz123/todoist-mcp-server
```

### 設定方法

1. `.env`ファイルに`TODOIST_API_TOKEN`を設定する方法:
   ```
   TODOIST_API_TOKEN=あなたのTodoistAPIトークン
   ```

2. Cursorの設定方法:
   - **名前**: Todoist
   - **タイプ**: command
   - **コマンド**: `node C:/path/to/todoist-server/run-todoist.js`
   
   例（実際に動作確認済み）:
   ```
   node C:/develop/mcp-servers/todoist-server/run-todoist.js
   ```

   注意点:
   - 絶対パスを使用することが重要です
   - 多くの場合、`--experimental-modules`フラグは不要です
   - パスセパレータには、Windowsでもフォワードスラッシュ(`/`)を使用できます
   
   別の方法:
   - **コマンド**: `C:/path/to/todoist-server/todoist-server.bat`（バッチファイルがある場合）

### 重要な教訓

- **要点1**: 多くの場合、`--experimental-modules`フラグは不要です。必要な場合はエラーメッセージで通知されます
- **要点2**: パスに空白や特殊文字がある場合、二重引用符で囲むことで解決できます
- **要点3**: 起動スクリプト（Node.js）を使用することで、環境変数の読み込みやエラー処理を改善できます
- **要点4**: **絶対パス**を使用することが非常に重要です。相対パスではCursorでの動作が不安定になります
- **要点5**: Windowsでも**フォワードスラッシュ**（`/`）を使用するとパス解決の問題が減ります

### 起動スクリプト (run-todoist.js)

実際のセットアップでは、起動スクリプトを作成することが必要です。これにより、APIトークンの取得や適切な環境設定が行えます。以下は基本的な起動スクリプト例です：

```javascript
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
  } catch (error) {
    console.error('環境変数の読み込みエラー:', error);
  }
  
  return null;
}

// サーバー起動用関数
function startServer() {
  const token = getToken();
  
  if (!token) {
    console.error('エラー: TODOIST_API_TOKENが設定されていません。');
    console.error('環境変数または.envファイルにTODOIST_API_TOKENを設定してください。');
    process.exit(1);
  }
  
  // 環境変数をセット
  const env = { ...process.env, TODOIST_API_TOKEN: token };
  
  // npxコマンドを検出（WindowsとUnix系で異なる）
  const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  
  console.log('Todoistサーバーを起動しています...');
  
  // サーバー起動
  const proc = spawn(npxCommand, ['-y', '@abhiz123/todoist-mcp-server'], {
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

このスクリプトの重要なポイント：

1. **APIトークンの取得**: 環境変数と.envファイルの両方からAPIトークンを取得できます
2. **エラーハンドリング**: トークンがない場合や起動エラーの場合に適切なメッセージを表示
3. **クロスプラットフォーム対応**: WindowsとUnix系OSの両方で動作するように設計
4. **環境変数の継承**: 既存の環境変数を維持しながらTODOIST_API_TOKENを追加

このスクリプトを `run-todoist.js` として保存し、上記の「Cursorの設定方法」のようにコマンドに指定して使用します。

## Notionサーバーの設定

### インストール方法

```bash
npm install -g @suekou/mcp-notion-server
```

### 設定方法

Notionサーバーも同様に環境変数またはファイルから`NOTION_API_TOKEN`を読み込みます。

### 起動スクリプト

Notionサーバーは、npxコマンドを使用して起動します：

```javascript
const proc = spawn(npxCommand, ['-y', '@suekou/mcp-notion-server'], {
  env: env,
  stdio: 'inherit',
  shell: true
});
```

### 起動スクリプト (run-notion.js)

Todoistサーバーと同様に、Notionサーバーも起動スクリプトを使用することで安定した運用が可能になります。以下は`run-notion.js`の例です：

```javascript
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// 環境変数からNOTION_API_TOKENを取得、または.envファイルから読み込む
function getToken() {
  // まず環境変数をチェック
  if (process.env.NOTION_API_TOKEN) {
    return process.env.NOTION_API_TOKEN;
  }
  
  // 環境変数になければ.envファイルを確認
  try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const tokenMatch = envContent.match(/NOTION_API_TOKEN=(.+)(\r?\n|$)/);
      if (tokenMatch && tokenMatch[1]) {
        return tokenMatch[1].trim();
      }
    }
  } catch (error) {
    console.error('環境変数の読み込みエラー:', error);
  }
  
  return null;
}

// サーバー起動用関数
function startServer() {
  const token = getToken();
  
  if (!token) {
    console.error('エラー: NOTION_API_TOKENが設定されていません。');
    console.error('環境変数または.envファイルにNOTION_API_TOKENを設定してください。');
    process.exit(1);
  }
  
  // 環境変数をセット
  const env = { ...process.env, NOTION_API_TOKEN: token };
  
  // npxコマンドを検出（WindowsとUnix系で異なる）
  const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  
  console.log('Notionサーバーを起動しています...');
  
  // サーバー起動
  const proc = spawn(npxCommand, ['-y', '@suekou/mcp-notion-server'], {
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

Cursorの設定方法:
- **名前**: Notion
- **タイプ**: command
- **コマンド**: `node C:/path/to/notion-server/run-notion.js`

例（Todoistの動作を参考に）:
```
node C:/develop/mcp-servers/notion-server/run-notion.js
```

注意点:
- 絶対パスを使用することが重要です
- パスセパレータには、Windowsでもフォワードスラッシュ(`/`)を使用できます
- パスにスペースが含まれる場合は引用符で囲んでください

このスクリプトを使用することで、環境変数の管理やエラーハンドリングが容易になり、サーバーの信頼性が向上します。

## トラブルシューティング

### モジュールが見つからない問題

エラーメッセージ: `MODULE_NOT_FOUND`

解決策:
1. パッケージが正しくインストールされているか確認
2. パスが正しいか確認
3. 必要に応じて再インストール:
   ```bash
   npm install -g @abhiz123/todoist-mcp-server
   ```

### パス解決の問題

解決策:
1. 絶対パスを使用する
2. Windows環境ではバックスラッシュをエスケープするか、フォワードスラッシュを使用
3. スペースを含むパスは引用符で囲む

### ES Modules関連の問題

解決策:
1. `--experimental-modules`フラグを使用
2. `type: "module"`を指定したパッケージでは、.mjsファイル拡張子またはフラグが必要な場合がある

### 起動スクリプト関連の問題

エラーメッセージ: `Error: spawn npx ENOENT` または `環境変数が設定されていません`

解決策:
1. Node.jsバージョンが最新であることを確認（v14以上推奨）
2. npmとnpxが正しくインストールされているか確認
3. スクリプト内のパッケージ名が正しいか確認
4. Windows環境では`npx.cmd`、Unix系では`npx`を使用
5. APIトークンが正しく設定されているか確認

### 起動スクリプトのデバッグ方法

問題が発生した場合のデバッグ手順:

1. コンソール出力を増やす:
   ```javascript
   console.log('環境変数:', process.env.TODOIST_API_TOKEN ? 'トークンあり' : 'トークンなし');
   console.log('パッケージパス:', __dirname);
   console.log('プラットフォーム:', process.platform);
   ```

2. 別のコマンド実行方法を試す:
   ```javascript
   // 代替コマンド実行方法
   const { execSync } = require('child_process');
   try {
     execSync(`npx -y @abhiz123/todoist-mcp-server`, { 
       env: env, 
       stdio: 'inherit',
       shell: true
     });
   } catch (error) {
     console.error('実行エラー:', error);
   }
   ```

## よくある問題と解決策

### 1. 「サーバー起動エラー」や「Failed to create client」

考えられる原因:
- APIトークンが無効または見つからない
- 環境変数が正しく設定されていない

解決策:
- 有効なAPIトークンを確認
- 環境変数またはenvファイルを確認

### 2. モジュールパスの問題

考えられる原因:
- npmのグローバルインストールパスが異なる
- パス内にスペースや特殊文字がある

解決策:
- 実際のモジュールパスを確認: `npm list -g`
- 絶対パスとダブルクォーテーションを使用

### 3. 起動スクリプトでの問題

考えられる原因:
- npm/npxのバージョンの互換性問題
- Windowsとのパス区切り文字の違い
- 環境変数の継承に関する問題

解決策:
- スクリプト内でデバッグ情報を表示: `console.log('debug:', process.env)`
- `spawn`の代わりに`exec`/`execSync`を使用してみる
- プラットフォーム固有の条件分岐を追加する

### 4. サーバーへの接続問題

考えられる原因:
- サーバーが起動しているが、Cursorと通信できない
- パスの指定方法が正しくない

解決策:
- サーバースクリプトの`stdio`設定が正しいか確認
- Cursorの設定でコマンドパスが正しいか確認（**絶対パスを使用**）
- サーバーログを確認して通信エラーを特定
- コマンド例: `node C:/develop/mcp-servers/todoist-server/run-todoist.js`

### 5. パスに関する問題

考えられる原因:
- Windowsのバックスラッシュ（`\`）によるエスケープ問題
- 相対パスの解決問題
- パスにスペースや特殊文字が含まれている

解決策:
- **絶対パス**を使用する: `C:/develop/mcp-servers/...`
- フォワードスラッシュ（`/`）を使用する
- パスにスペースがある場合は引用符で囲む: `"C:/My Path/..."`
- 環境によっては管理者権限が必要な場合がある

### 6. その他のヒント

- Node.jsのバージョンを確認する: `node --version`
- npmのバージョンを確認する: `npm --version`
- 起動スクリプトを使ってエラーハンドリングを改善する
- バッチファイルを使って複雑なコマンドをシンプルにする 