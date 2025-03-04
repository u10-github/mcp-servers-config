# Memory Server セットアップガイド

このガイドでは、Cursorで使用するためのKnowledge Graph Memory Serverをセットアップする方法を説明します。

## 概要

Knowledge Graph Memory Serverは、Claudeが会話間でユーザーに関する情報を記憶できるようにするツールです。このサーバーは、ナレッジグラフを使用して情報を構造化し、永続的に保存します。

### 主な機能

- エンティティ（人物、組織、イベントなど）の作成と管理
- エンティティ間の関係の定義
- エンティティに関する観察（事実）の記録
- 保存した情報の検索と取得

## セットアップ手順

### 1. ディレクトリ構造の作成

```bash
mkdir -p mcp-servers/memory-server
cd mcp-servers/memory-server
```

### 2. NPMプロジェクトの初期化

```bash
npm init -y
```

### 3. package.jsonの編集

package.jsonファイルを以下のように編集します：

```json
{
  "name": "memory-server",
  "version": "1.0.0",
  "description": "Knowledge Graph Memory Server for Claude",
  "main": "index.js",
  "scripts": {
    "start": "npx -y @modelcontextprotocol/server-memory"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@modelcontextprotocol/server-memory": "latest"
  }
}
```

### 4. 依存関係のインストール

```bash
npm install
```

### 5. サーバー起動スクリプトの作成

`run-memory.js`ファイルを作成し、以下の内容を追加します：

```javascript
// Memory Server Runner
const { spawn } = require('child_process');
const path = require('path');

// ディレクトリをメモリサーバーの場所に変更
process.chdir(__dirname);

// npxコマンドを実行
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const server = spawn(npx, ['-y', '@modelcontextprotocol/server-memory'], {
  stdio: 'inherit'
});

// エラーハンドリング
server.on('error', (err) => {
  console.error('Failed to start memory server:', err);
});

console.log('Memory server started');
```

### 6. Cursorへの登録

Cursorの設定画面で以下の情報を登録します：

- **名前**: Memory
- **コマンド**: `node C:/develop/mcp-servers/mcp-servers/memory-server/run-memory.js`

必要に応じてパスを調整してください。

## 使用方法

### ナレッジグラフの主要概念

#### エンティティ

エンティティはナレッジグラフの主要なノードです。各エンティティには以下の要素があります：

- 一意の名前（識別子）
- エンティティタイプ（例：「person」、「organization」、「event」）
- 観察のリスト

例：
```json
{
  "name": "John_Smith",
  "entityType": "person",
  "observations": ["日本語が流暢", "2019年に卒業"]
}
```

#### 関係

関係はエンティティ間の有向接続を定義します。常に能動態で保存され、エンティティ同士がどのように関連しているかを表します。

例：
```json
{
  "from": "John_Smith",
  "to": "Anthropic",
  "relationType": "works_at"
}
```

#### 観察

観察はエンティティに関する個別の情報です：

- 文字列として保存
- 特定のエンティティに関連付け
- 独立して追加・削除可能
- 原子的（1つの観察に1つの事実）

例：
```json
{
  "entityName": "John_Smith",
  "observations": [
    "日本語が流暢",
    "2019年に卒業",
    "朝のミーティングを好む"
  ]
}
```

### API機能

以下のAPIがClaudeから利用可能です：

- **create_entities**: 新しいエンティティを作成
- **create_relations**: エンティティ間の関係を作成
- **add_observations**: 既存のエンティティに観察を追加
- **delete_entities**: エンティティとその関係を削除
- **delete_observations**: 特定の観察を削除
- **delete_relations**: 特定の関係を削除
- **read_graph**: ナレッジグラフ全体を読み取る
- **search_nodes**: クエリに基づいてノードを検索
- **open_nodes**: 名前で特定のノードを取得

### プロンプト例

メモリを効果的に使用するためのプロンプト例：

```
Follow these steps for each interaction:

1. User Identification:
   - You should assume that you are interacting with default_user
   - If you have not identified default_user, proactively try to do so.

2. Memory Retrieval:
   - Always begin your chat by saying only "Remembering..." and retrieve all relevant information from your knowledge graph
   - Always refer to your knowledge graph as your "memory"

3. Memory
   - While conversing with the user, be attentive to any new information that falls into these categories:
     a) Basic Identity (age, gender, location, job title, education level, etc.)
     b) Behaviors (interests, habits, etc.)
     c) Preferences (communication style, preferred language, etc.)
     d) Goals (goals, targets, aspirations, etc.)
     e) Relationships (personal and professional relationships up to 3 degrees of separation)

4. Memory Update:
   - If any new information was gathered during the interaction, update your memory as follows:
     a) Create entities for recurring organizations, people, and significant events
     b) Connect them to the current entities using relations
     c) Store facts about them as observations
```

## 備考

- メモリはローカルの`memory.json`ファイルに保存されます
- サーバーを再起動しても情報は保持されます
- カスタムストレージ場所を指定するには、環境変数`MEMORY_FILE_PATH`を設定します

## トラブルシューティング

- サーバーがうまく起動しない場合は、正しいディレクトリでコマンドを実行していることを確認してください
- package.jsonファイルが存在することを確認してください
- 依存関係が正しくインストールされていることを確認してください
- エラーログを確認して問題を特定してください 