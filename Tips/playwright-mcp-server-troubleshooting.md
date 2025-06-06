# Playwright MCP Server トラブルシューティングガイド

## エラー名・現象
**UUID モジュール エラー / MCP Server 接続失敗**
- `Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'uuid/dist/esm/max.js'`
- `MCP server playwright-mcp has tools with invalid parameters`
- `Server disconnected` 状態

## 発生状況
- **日時**: 2025年1月 (Windows環境)
- **環境**: 
  - Windows 10/11 (Build 26100)
  - Node.js v20.11.1
  - npm 10.2.4
  - Cursor IDE
- **関連コード**: `@executeautomation/playwright-mcp-server`

## エラー内容

### 主要エラーメッセージ
```bash
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\yutoo\AppData\Local\npm-cache\_npx\[hash]\node_modules\uuid\dist\esm\max.js'
```

### 設定での問題
```json
# 問題のある設定
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    }
  }
}
```

## 原因

### 1. **依存関係の問題**
- npm キャッシュの破損
- UUID モジュールの ESM (ECMAScript Modules) 解決エラー
- npx 実行時の一時ディレクトリでのモジュール解決失敗

### 2. **Windows環境特有の問題**
- npx のパス解決機構がWindows環境で不安定
- 一時キャッシュディレクトリの権限・アクセス問題
- パス区切り文字（バックスラッシュ）の処理問題

### 3. **MCP設定の問題**
- 相対パス指定による実行環境の不確実性
- プロセス間通信での環境変数継承の問題

## 解決策

### 手順1: npmキャッシュのクリア
```bash
npm cache clean --force
```

### 手順2: グローバルインストール
```bash
npm install -g @executeautomation/playwright-mcp-server
```

### 手順3: 絶対パス設定への変更

#### パス確認コマンド
```bash
# Node.js パス確認
where node
# → C:\Program Files\nodejs\node.exe

# グローバルパッケージディレクトリ確認
npm root -g
# → C:\Users\yutoo\AppData\Roaming\npm\node_modules
```

#### 修正後の設定
```json
{
  "mcpServers": {
    "playwright": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "C:\\Users\\yutoo\\AppData\\Roaming\\npm\\node_modules\\@executeautomation\\playwright-mcp-server\\dist\\index.js"
      ]
    }
  }
}
```

### 手順4: 動作確認
- Cursor 再起動
- MCP サーバー接続状態確認
- ツール数の確認 (31 tools enabled)

## 学び・注意点

### ✅ **ベストプラクティス**
1. **絶対パス使用**: Windows環境では npx より安定
2. **グローバルインストール**: 依存関係の問題を回避
3. **段階的診断**: 環境→依存関係→設定→実行の順で確認
4. **キャッシュクリア**: 問題発生時の初期対応として有効

### ⚠️ **注意事項**
- **パス表記**: Windows では `\\` エスケープが必要
- **ユーザー名**: パス内のユーザー名は環境依存
- **Node.js バージョン**: 互換性確認が重要
- **権限**: 管理者権限での実行が必要な場合あり

### 🔄 **予防策**
- 定期的な npm キャッシュクリア
- パッケージの最新バージョン監視
- 設定ファイルのバックアップ維持
- 環境変数の適切な管理

## 関連情報

### 参考リンク
- [executeautomation/mcp-playwright Issues](https://github.com/executeautomation/mcp-playwright/issues)
- [Microsoft Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [MCP Installation Guide](https://executeautomation.github.io/mcp-playwright/docs/local-setup/Installation)

### 類似問題
- GitHub Issue #109: "Start server fails with error"
- GitHub Issue #64: NVM/NPM connection issues
- Medium記事: "Solution for MCP Servers Connection Issues with NVM/NPM"

### 適用可能なケース
この解決策は以下の場合にも適用可能：
- 他のMCPサーバーでの同様エラー
- Node.js パッケージの依存関係問題
- Windows環境でのnpx実行問題一般 