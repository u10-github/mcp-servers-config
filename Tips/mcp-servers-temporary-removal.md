# MCPサーバーの一時的な削除

このメモは、設定済みのMCPサーバーを一時的に削除または無効化したい場合の情報をまとめたものです。

## 設定済みMCPサーバーのリスト

### MCP-Brave

- **ツール名**: MCP-Brave
- **利用可能なツール**: 
  - brave_web_search
  - brave_local_search
- **コマンド**: 
  ```
  node C:/develop/MCP-brave/dist/index.js
  ```

### GitHub Repository Manager

- **ツール名**: GitHub Repository Manager
- **利用可能なツール**:
  - create_or_update_file
  - search_repositories
  - create_repository
  - get_file_contents
  - push_files
  - create_issue
  - create_pull_request
  - fork_repository
  - create_branch
  - list_commits
  - list_issues
  - update_issue
  - add_issue_comment
  - search_code
  - search_issues
  - search_users
  - get_issue
- **コマンド**:
  ```
  node C:/develop/mcp-servers/github-server/src/github/dist/index.js
  ```

### Notion Project Database

- **ツール名**: Notion Project Database
- **利用可能なツール**:
  - notion_append_block_children
  - notion_retrieve_block
  - notion_retrieve_block_children
  - notion_delete_block
  - notion_retrieve_page
  - notion_update_page_properties
  - notion_list_all_users
  - notion_retrieve_user
  - notion_retrieve_bot_user
  - notion_create_database
  - notion_query_database
  - notion_retrieve_database
  - notion_update_database
  - notion_create_database_item
  - notion_create_comment
  - notion_retrieve_comments
  - notion_search
- **コマンド**:
  ```
  node C:/develop/mcp-servers/notion-server/run-notion.js
  ```

### Todoist

- **ツール名**: Todoist
- **状態**: 無効 (Disabled)
- **コマンド**:
  ```
  node C:/develop/mcp-servers/todoist-server/run-todoist.js
  ```

### Trello

- **ツール名**: Trello
- **状態**: 無効 (Disabled)
- **コマンド**:
  ```
  node C:\develop\mcp-servers\trello\run-trello.mjs
  ```

### Supabase

- **ツール名**: Supabase
- **状態**: 無効 (Disabled)
- **利用可能なツール**: なし
- **コマンド**:
  ```
  python C:/develop/mcp-servers/supabase-server/supabase_mcp/main.py
  ```

### Memory

- **ツール名**: memory
- **状態**: 有効 (Enabled)
- **利用可能なツール**: 
  - create_entities
  - create_relations
  - add_observations
  - delete_entities
  - delete_observations
  - delete_relations
  - read_graph
  - search_nodes
  - open_nodes
- **コマンド**:
  ```
  node C:/develop/mcp-servers/memory-server/run-memory.js
  ```

## MCPサーバーの一時的な削除方法

Cursorで設定されているMCPサーバーを一時的に削除または無効化する方法：

1. サーバー名の横にある編集ボタン（ペンアイコン）をクリック
2. 無効化（Disable）ボタンをクリック
3. 完全に削除する場合は、削除ボタン（ゴミ箱アイコン）をクリック

必要になったときは、上記の情報を使って再度設定することができます。

## 再設定時の注意点

- コマンドが正確であることを確認してください
- サーバーが参照するディレクトリが存在することを確認してください
- 再設定後、Cursorの再起動が必要な場合があります 