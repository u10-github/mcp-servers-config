# MCP Servers Configuration for Cursor

このリポジトリは、[Cursor IDE](https://cursor.sh/)で使用するための複数のMCPサーバー設定を含んでいます。Model Context Protocol (MCP)を活用して、AIアシスタント機能を拡張します。

## 含まれるMCPサーバー

このリポジトリには以下のMCPサーバー設定が含まれています：

- **GitHub Repository Manager**: GitHubリポジトリの管理、検索、ファイル操作などの機能
- **Notion Project Database**: Notionデータベースやページの操作、ブロック管理などの機能
- **Brave Search**: Braveエンジンを使用したウェブ検索とローカル検索機能

## セットアップ方法

### 必要条件

- Node.js v16以上
- Cursor IDE最新版
- 各サービス（GitHub, Notion）のAPIトークン

### インストール手順

1. このリポジトリをクローンします：

```bash
git clone https://github.com/yourusername/mcp-servers-config.git
cd mcp-servers-config
```

2. 各サーバーディレクトリで環境変数を設定します：

#### GitHub

```bash
cd github-server
# 必要に応じて.envファイルを作成します
echo "GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here" > .env
```

#### Notion

```bash
cd notion-server
# 必要に応じて.envファイルを作成します
echo "NOTION_API_TOKEN=your_token_here" > .env
```

3. Cursor IDEの設定で、各MCPサーバーを以下のように追加します：

#### GitHub MCP Server

- **コマンド**: `node`
- **引数**: `C:/develop/mcp-servers/github-server/src/github/dist/index.js`

#### Notion MCP Server

- **コマンド**: `node`
- **引数**: `C:/develop/mcp-servers/notion-server/run-notion.js`

#### Brave MCP Server

- **コマンド**: `node`
- **引数**: `C:/develop/MCP-brave/dist/index.js`

## 使用方法

Cursor IDE内でAIアシスタントを使用する際に、これらのMCPサーバーが提供する追加機能を利用できます：

- GitHubリポジトリの検索や操作
- Notionデータベースの操作
- Braveを使用したウェブ検索

## 免責事項

このリポジトリは個人的な使用のために作成されたものであり、公式のCursor IDEプロジェクトではありません。API使用時には各サービスの利用規約を遵守してください。 