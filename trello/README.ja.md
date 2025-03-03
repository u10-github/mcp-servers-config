# Trello MCP サーバー

このリポジトリは、Trello APIと連携するためのModel Context Protocol (MCP) サーバーの実装です。

## 前提条件

* Node.js 18.x以上
* npmまたはyarn
* TrelloのAPI認証情報（APIキーとトークン）

## インストール方法

```bash
# 依存関係のインストール
npm install

# プロジェクトのビルド
npm run build
```

## 設定方法

1. `.env`ファイルに`TRELLO_API_KEY`と`TRELLO_TOKEN`を設定します:
   ```
   TRELLO_API_KEY=あなたのTrello APIキー
   TRELLO_TOKEN=あなたのTrelloトークン
   ```

2. Cursorの設定方法:
   - **名前**: Trello
   - **タイプ**: command
   - **コマンド**: `node C:/develop/mcp-servers/trello/run-trello.js`
   
   注意点:
   - 絶対パスを使用することが重要です
   - パスセパレータには、Windowsでもフォワードスラッシュ(`/`)を使用できます

## 利用可能なコマンド

```bash
# 依存関係のインストール
npm install

# プロジェクトのビルド
npm run build

# サーバーの起動
node run-trello.js
```

## MCP ツール

### get_boards

認証されたユーザーのすべてのTrelloボードを取得します。

```
// 入力パラメータは不要
```

### get_lists

指定されたボードからすべてのリストを取得します。

```json
{
  "request": {
    "board_id": string // ボードのID
  }
}
```

### get_cards

ボードまたは特定のリストからカードを取得します。

```json
{
  "request": {
    "board_id": string,    // ボードのID
    "list_id"?: string     // オプション: 特定のリストのID
  }
}
```

### get_card_details

特定のカードの詳細情報を取得します。

```json
{
  "request": {
    "card_id": string      // カードのID
  }
}
```

## トラブルシューティング

### APIキーまたはトークンが無効

エラーメッセージ: `サーバー起動エラー` または `Failed to create client`

解決策:
- 有効なAPIキーとトークンを確認
- 環境変数または.envファイルを確認

### パスの問題

考えられる原因:
- パス内にスペースや特殊文字がある
- 相対パスを使用している

解決策:
- **絶対パス**を使用する: `C:/develop/mcp-servers/trello/...`
- フォワードスラッシュ(`/`)を使用する
- パスにスペースがある場合は引用符で囲む: `"C:/My Path/..."`

### その他のヒント

- Node.jsのバージョンを確認する: `node --version`
- npmのバージョンを確認する: `npm --version`
- 起動スクリプトを使ってエラーハンドリングを改善する 