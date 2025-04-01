# Playwright MCP Server

このプロジェクトは、【Playwright】「ブラウザ自動化ツール」を使用したMCPサーバーを提供します。

## 機能

- ブラウザの自動操作
- スクリーンショットの取得
- テストコードの生成
- Webスクレイピング
- JavaScriptの実行

## インストール済みパッケージ

- @executeautomation/playwright-mcp-server

## 使用方法

サーバーを起動するには：

```bash
npx @executeautomation/playwright-mcp-server
```

## 設定

設定は`config.json`ファイルで管理されています：

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    }
  }
}
``` 