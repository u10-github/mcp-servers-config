# MCP サーバー設定ガイド

## 1. GitHub MCP サーバー設定

### 環境変数の設定
1.  ファイルを開きます
2. `GITHUB_TOKEN=your_personal_access_token_here` の部分を、実際の GitHub Personal Access Token に置き換えます
3. Personal Access Token は GitHub の Settings → Developer settings → Personal access tokens で取得できます

### Cursor での設定
Cursor アプリでの設定手順:
1. 設定メニューを開く
2. MCP 設定セクションに移動
3. "Add Server" を選択
4. 名前: `GitHub Repository Manager`
5. コマンド: `node /c/develop/mcp-servers/github-server/github-files/index.js`

## 2. Notion MCP サーバー設定

### 環境変数の設定
1. Notion Integration Token を取得します:
   - https://www.notion.so/my-integrations にアクセス
   - 「+ New integration」をクリックして新しいインテグレーションを作成
   - 名前を入力し、必要な権限を選択
   - 生成されたシークレットをコピー
2.  ファイルを開く
3. `NOTION_API_TOKEN=your_notion_integration_token_here` の部分を、実際の Notion Integration Token に置き換える

### Cursor での設定
Cursor アプリでの設定手順:
1. 設定メニューを開く
2. MCP 設定セクションに移動
3. "Add Server" を選択
4. 名前: `Notion Project Database`
5. コマンド: `npx -y @suekou/mcp-notion-server`
6. 環境変数: `NOTION_API_TOKEN` に実際のトークンを設定

## 3. Notion ワークスペースの設定

1. Notion にログインし、新しいページを作成します (例: 「FCG-Todo Project」)
2. 以下のデータベースを作成します:
   a. タスク管理データベース
      - タスク名 (Title)
      - 状態 (Select: 完了/進行中/未着手)
      - 優先度 (Select: 高/中/低)
      - カテゴリー (Multi-select)
      - 担当者 (Person)
      - 期限 (Date)
   b. プロジェクト状況データベース
   c. 技術Tipsデータベース
3. 各データベースページで、右上の「...」→「Add connections」→先ほど作成した統合を選択して接続します

## 4. 動作確認

### GitHub MCP の動作確認
Cursor を開き、以下のようなプロンプトを試してください:
```
私のリポジトリ一覧を表示してください。
```

### Notion MCP の動作確認
Cursor を開き、以下のようなプロンプトを試してください:
```
Notion のタスク一覧を表示してください。
```

## 5. トラブルシューティング

### GitHub MCP サーバーの問題
- GitHub トークンが正しく設定されているか確認してください
- トークンに適切な権限（repo, read:user）が付与されているか確認してください

### Notion MCP サーバーの問題
- Notion トークンが正しく設定されているか確認してください
- 統合が対象のページやデータベースに招待されているか確認してください
- ファイアウォールが Notion API へのアクセスをブロックしていないか確認してください
