# 技術コンテキスト: MCP Servers

## 使用技術

### 【プラットフォーム】「動作環境」
- **OS**: Windows 10/11 (Build 26100)
- **シェル**: Git Bash (C:\Program Files\Git\bin\bash.exe)
- **Node.js**: v20.11.1
- **npm**: 10.2.4

### 【開発環境】「開発ツール」
- **IDE**: Cursor (VS Code ベース)
- **パッケージマネージャー**: npm, uvx
- **バージョン管理**: Git

### 【MCPプロトコル】「通信仕様」
- **Model Context Protocol**: AI モデルとツール間の標準通信プロトコル
- **通信方式**: stdio, SSE (Server-Sent Events)
- **設定ファイル**: JSON形式 (.cursor/mcp.json, claude_desktop_config.json)

## 技術的制約

### 【依存関係管理】「パッケージ管理」
- グローバルインストールが必要なパッケージあり
- npmキャッシュ破損による実行エラーの可能性
- 絶対パス指定による安定化が必要

### 【パス解決】「実行環境」
- Windows環境でのnpx実行時の問題
- 相対パスよりも絶対パス指定が安定
- ユーザーディレクトリのパス表記（C:\Users\{username}\AppData\...）

## セキュリティ考慮事項

- APIキーの環境変数管理
- ファイルアクセス権限の制御
- ネットワーク通信の制限 