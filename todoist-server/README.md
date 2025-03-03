# Todoist MCP Server

このディレクトリには、Todoistと連携するMCPサーバーの設定ファイルが含まれています。

## ファイルの説明

- `run-todoist.js` - Todoistサーバーを起動するためのNode.jsスクリプト
- `.env` - 環境変数の設定ファイル（APIトークンを設定）
- `todoist-server.bat` - Windows用のバッチファイル（代替の起動方法）

## 設定方法

1. `.env`ファイルを編集し、Todoistの有効なAPIトークンを設定します：
   ```
   TODOIST_API_TOKEN=あなたのTodoistAPIトークン
   ```

2. Cursorの設定で以下のように設定します：
   - **名前**: Todoist
   - **タイプ**: command
   - **コマンド**: `node C:/develop/mcp-servers/todoist-server/run-todoist.js`

## 起動方法

Cursorから直接起動するか、以下のいずれかの方法で手動起動できます：

1. Node.jsスクリプトで起動：
   ```
   node run-todoist.js
   ```

2. バッチファイルで起動（Windows）：
   ```
   todoist-server.bat
   ```

## トラブルシューティング

サーバーが起動しない場合：

1. APIトークンが正しく設定されているか確認してください
2. Node.jsがインストールされていることを確認してください
3. 必要なパッケージがインストールされていることを確認してください：
   ```
   npm install -g @abhiz123/todoist-mcp-server
   ``` 