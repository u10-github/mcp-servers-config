# MCPサーバー概要と設定ガイド

## MCPサーバーとは

MCP（Model Control Protocol）サーバーは、AI支援ツール（例：Cursor AI）と外部サービス（例：Todoist、Notion、GitHub）を接続するための中間層です。これにより、AIアシスタントが外部APIと連携して、タスク管理や文書作成などのアクションを実行できるようになります。

各サービスごとに専用のMCPサーバーが必要で、標準入出力（stdio）を通じてAIプラットフォームと通信します。

## 対応サービス一覧

現在、Cursor AIでは以下のサービス用のMCPサーバーが利用可能です：

1. **Todoist** - タスク管理
2. **Notion** - 知識ベース・文書管理
3. **GitHub** - コード管理とバージョン管理
4. **検索サービス（Brave）** - ウェブ検索機能

## 共通セットアップ手順

各MCPサーバーに共通する基本的なセットアップ手順は以下の通りです：

1. **Node.jsとnpmのインストール**：
   - [Node.js公式サイト](https://nodejs.org/)からインストーラーをダウンロード
   - インストール後、以下のコマンドで確認
     ```bash
     node --version
     npm --version
     ```

2. **プロジェクト構造の作成**：
   ```bash
   mkdir -p mcp-servers
   cd mcp-servers
   ```

3. **各サービス用のディレクトリ作成**：
   ```bash
   mkdir -p todoist-server notion-server github-server
   ```

4. **環境変数の設定**：
   - 方法1: システム全体の環境変数として設定
   - 方法2: プロジェクト固有の`.env`ファイルに設定
   - 方法3: コマンドラインで一時的に設定

5. **MCPサーバーの起動**:
   ```bash
   node --experimental-modules path/to/mcp-server/index.js
   ```

6. **Cursorの設定**：
   - 設定 > アシスタント設定 > MCPサーバーの追加

## 環境変数の設定方法

### Windows

**システム環境変数として設定**:
1. スタートボタンを右クリック > システム > システムの詳細設定
2. 「環境変数」ボタンをクリック
3. 「新規」ボタンをクリック
4. 変数名（例：`TODOIST_API_TOKEN`）と値を入力

**コマンドラインで一時的に設定**:
```bash
set TODOIST_API_TOKEN=your_token_here
```

**PowerShellで一時的に設定**:
```powershell
$env:TODOIST_API_TOKEN="your_token_here"
```

### macOS/Linux

**システム環境変数として設定**:
```bash
echo "export TODOIST_API_TOKEN=your_token_here" >> ~/.bashrc
source ~/.bashrc
```

**コマンドラインで一時的に設定**:
```bash
export TODOIST_API_TOKEN=your_token_here
```

### .envファイルを使用

どのOSでも、プロジェクトディレクトリに`.env`ファイルを作成することで、そのプロジェクト固有の環境変数を設定できます：

```
# .envファイルの例
TODOIST_API_TOKEN=your_todoist_token
NOTION_API_TOKEN=your_notion_token
GITHUB_TOKEN=your_github_token
```

Node.jsアプリケーションで`.env`ファイルを読み込むには、通常`dotenv`パッケージを使用します：

```javascript
require('dotenv').config();
// これにより、.envファイルの内容がprocess.envに読み込まれます
```

## トラブルシューティング

### 一般的な問題

1. **モジュールが見つからないエラー**:
   ```
   Error: Cannot find module '/path/to/module'
   ```
   
   **解決策**:
   - グローバルインストールの場所を確認
     - Windows: `%APPDATA%\npm\node_modules`
     - macOS/Linux: `/usr/local/lib/node_modules`
   - パッケージを再インストール
     ```bash
     npm uninstall -g package-name
     npm install -g package-name
     ```

2. **パス解決の問題**:
   
   **解決策**:
   - バックスラッシュではなくフォワードスラッシュを使用 (`C:/path` など)
   - パスに空白や特殊文字がある場合は引用符で囲む
   - `path.join()` や `path.resolve()` を使用してパスを構築
   - バッチファイルでは `%~dp0` を使用して相対パスを解決

3. **「サーバーに接続できません」エラー**:
   
   **解決策**:
   - サーバーが正常に起動しているか確認
   - APIトークンが有効か確認
   - Cursor設定でコマンドパスが正しいか確認

4. **ES Modules関連のエラー**:
   
   **解決策**:
   - `--experimental-modules` フラグを使用
   - `package.json` に `"type": "module"` が含まれているか確認
   - `.mjs` 拡張子を使用

## サーバー起動スクリプトの作成

各サービス用に起動を簡略化するスクリプトを作成すると便利です。以下はテンプレートです：

```javascript
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// 環境変数またはenvファイルからトークンを取得
function getToken(tokenName) {
  if (process.env[tokenName]) {
    console.log(`環境変数から${tokenName}を取得しました`);
    return process.env[tokenName];
  }
  
  try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const tokenMatch = envContent.match(new RegExp(`${tokenName}=(.+)(\\r?\\n|$)`));
      if (tokenMatch && tokenMatch[1]) {
        return tokenMatch[1].trim();
      }
    }
    console.error(`警告: ${tokenName}が見つかりませんでした`);
    process.exit(1);
  } catch (error) {
    console.error('.envファイルの読み込みエラー:', error.message);
    process.exit(1);
  }
}

// モジュールパスを取得
function getModulePath(packagePath) {
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    if (process.env.APPDATA) {
      return path.join(process.env.APPDATA, 'npm', 'node_modules', ...packagePath.split('/'));
    } else {
      return path.join(process.env.USERPROFILE || 'C:\\Users\\' + process.env.USERNAME, 
                      'AppData', 'Roaming', 'npm', 'node_modules', ...packagePath.split('/'));
    }
  } else {
    return path.join(process.env.HOME || '/usr/local', '.npm', 'node_modules', ...packagePath.split('/'));
  }
}

// サービス設定
const SERVICE_CONFIG = {
  // サービス名に応じて設定を変更
  'todoist': {
    tokenName: 'TODOIST_API_TOKEN',
    packagePath: '@abhiz123/todoist-mcp-server/dist/index.js'
  },
  'notion': {
    tokenName: 'NOTION_API_TOKEN',
    packagePath: '@makenotion/notion-mcp-server/dist/index.js'
  },
  'github': {
    tokenName: 'GITHUB_TOKEN',
    packagePath: 'github-mcp-server/dist/index.js'
  }
};

// サービス名（コマンドライン引数または設定）からサービス設定を取得
const serviceName = process.argv[2] || 'todoist';  // デフォルトはtodoist
const config = SERVICE_CONFIG[serviceName];

if (!config) {
  console.error(`エラー: サービス "${serviceName}" は未対応です`);
  console.error('対応サービス: ' + Object.keys(SERVICE_CONFIG).join(', '));
  process.exit(1);
}

// トークンを取得
const token = getToken(config.tokenName);
if (!token) {
  console.error(`有効な${config.tokenName}が見つかりませんでした。処理を中止します。`);
  process.exit(1);
}

// 環境変数を設定
const env = { ...process.env, [config.tokenName]: token };

// モジュールパスを取得
const modulePath = getModulePath(config.packagePath);

console.log(`${serviceName} MCPサーバーを起動しています...`);
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
  });

  proc.on('exit', (code) => {
    if (code !== 0) {
      console.error(`サーバーが終了コード ${code} で終了しました`);
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

## グローバルパッケージのインストール場所

各OSでのグローバルパッケージのデフォルトのインストール場所：

### Windows
- `%APPDATA%\npm\node_modules` （通常は `C:\Users\ユーザー名\AppData\Roaming\npm\node_modules`）

### macOS
- `/usr/local/lib/node_modules`（Homebrewでインストールした場合）
- `~/.npm/node_modules`（npmデフォルト）

### Linux
- `/usr/local/lib/node_modules`（システム全体の場合）
- `~/.npm/node_modules`（ユーザー固有の場合）

## バッチファイルのヒント（Windows）

Windowsでサーバーの起動を簡略化するためのバッチファイルの例：

```batch
@echo off
echo MCPサーバーを起動しています...

setlocal

rem カレントディレクトリを取得
set "SCRIPT_DIR=%~dp0"

rem .envファイルが存在する場合に読み込む
if exist "%SCRIPT_DIR%.env" (
    for /F "tokens=1,2 delims==" %%G in (%SCRIPT_DIR%.env) do (
        set "%%G=%%H"
    )
    echo .envファイルを読み込みました
)

rem サーバーを起動
node --experimental-modules "%SCRIPT_DIR%run-server.js" %*

endlocal
```

## まとめ

1. MCPサーバーは、AIアシスタントと外部サービスを連携させるための重要な中間層です
2. 各サービスごとに専用のMCPサーバーをセットアップする必要があります
3. 適切な環境変数とAPIトークンの設定が必須です
4. 起動スクリプトとバッチファイルを使用すると、セットアップと管理が容易になります
5. Cursor設定で正しいコマンドとパスを設定することで、AIアシスタントがサービスを利用できるようになります

より詳細な情報については、各サービス固有のセットアップガイドを参照してください：

- [Todoist MCPサーバー セットアップガイド](./todoist-setup-guide.md)
- [Notion MCPサーバー セットアップガイド](./notion-setup-guide.md) 