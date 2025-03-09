# 非エンジニアでもできる！Cursor×SupabaseのMCPサーバー接続ガイド

こんにちは！皆さんは[Cursor](https://cursor.sh/)エディタでAIアシスタントを使っていますか？最近、Cursorでは「MCP」という機能が追加され、AIがデータベースに直接アクセスできるようになりました。この機能を使えば、AIがSQLを書いてくれたり、データベースの構造を理解してくれたりするんです。素晴らしいですよね！

ただ、この設定がちょっと難しい...。特にSupabaseというクラウドデータベースサービスを使う場合は、いくつかの落とし穴があります。私も最初はかなり苦戦しました。でも大丈夫、このガイドを読めば、エンジニアでなくても簡単に設定できるようになります！

## 🚀 すぐに始めたい人向け：Cursorに渡すプロンプト

時間がない方のために、まずはCursorに渡すだけで自動設定してくれるプロンプトを紹介します。このプロンプトをコピーして、適宜`[あなたのフォルダパス]`などを変更してください。

```
Supabase MCPサーバーを[あなたのフォルダパス]に設定してください。

以下の手順で行ってください：
1. GitHubからalexander-zuev/supabase-mcp-serverをクローンする
2. 必要な依存関係をインストールする
3. .envファイルを作成・設定する
4. バッチファイル（run-supabase.bat）を作成する
5. MCPサーバーの起動テストを行う

Supabaseから必要な情報を取得するには：
- プロジェクト参照ID：ダッシュボードURLの「https://supabase.com/dashboard/project/xxxxxxxx」の「xxxxxxxx」部分
- データベースパスワード：設定→データベース→Database passwordから取得
- リージョン：接続文字列の「aws-0-[リージョン名].pooler.supabase.com」からリージョン名を抽出（例：ap-northeast-1）
- アクセストークン：設定→API→Project API keysからservice_role_keyを取得

最終的に.envファイルには以下の情報が必要です：
SUPABASE_PROJECT_REF=あなたのプロジェクト参照ID
SUPABASE_DB_PASSWORD=あなたのDBパスワード
SUPABASE_REGION=あなたのリージョン（例：ap-northeast-1）
SUPABASE_ACCESS_TOKEN=あなたのアクセストークン
SUPABASE_SERVICE_ROLE_KEY=あなたのサービスロールキー
```

## 📚 前提知識：SupabaseとMCPサーバーの関係

まず、基本的な用語と概念を整理しておきましょう：

- **Supabase**：PostgreSQLデータベースを簡単に使えるクラウドサービス
- **MCP（Model Context Protocol）**：AIモデルがツールを使うための標準プロトコル
- **MCPサーバー**：AIがデータベースなどにアクセスするための中継役

Cursorは直接データベースに接続できません。そこで、MCPサーバーという「通訳」が必要になります。今回使う「alexander-zuev/supabase-mcp-server」は、SupabaseとCursorをつなぐための素晴らしいMCPサーバーです。

## 🔍 必要な情報の集め方

Supabaseから以下の情報を集める必要があります：

### 1. プロジェクト参照ID
- Supabaseダッシュボードを開く
- URLを確認：`https://supabase.com/dashboard/project/あなたのプロジェクト参照ID`
- この「あなたのプロジェクト参照ID」部分をメモ

### 2. データベースパスワード
- ダッシュボードの左メニューから「設定」→「データベース」を選択
- 「Database password」セクションでパスワードを確認（または「Reset database password」で新しいパスワードを生成）

### 3. リージョン
- 同じく「設定」→「データベース」を選択
- 「Connection string」セクションで接続文字列を確認
- `aws-0-[リージョン名].pooler.supabase.com`の部分にリージョンが含まれています
- 例：`aws-0-ap-northeast-1.pooler.supabase.com`なら`ap-northeast-1`がリージョン

### 4. サービスロールキーとアクセストークン
- 「設定」→「API」を選択
- 「Project API keys」セクションで`service_role`キーをメモ
- アクセストークンは「設定」→「アカウント」→「アクセストークン」で生成できます

## 🛠️ MCPサーバーの設定手順

### ステップ1：リポジトリのクローン

GitHubからalexander-zuev/supabase-mcp-serverをクローンします：

```bash
mkdir -p mcp-servers
cd mcp-servers
git clone https://github.com/alexander-zuev/supabase-mcp-server.git alexander-supabase-mcp
cd alexander-supabase-mcp
```

### ステップ2：環境のセットアップ

Python環境を設定します：

```bash
python -m venv .venv
.venv\Scripts\activate  # Windowsの場合
source .venv/bin/activate  # Mac/Linuxの場合
pip install -e .
```

### ステップ3：.envファイルの設定

`.env`ファイルを作成し、以下の内容を設定します：

```
# Supabase MCP Server Environment Configuration
SUPABASE_PROJECT_REF=あなたのプロジェクト参照ID
SUPABASE_DB_PASSWORD=あなたのDBパスワード
SUPABASE_REGION=あなたのリージョン（例：ap-northeast-1）
SUPABASE_ACCESS_TOKEN=あなたのアクセストークン
SUPABASE_SERVICE_ROLE_KEY=あなたのサービスロールキー
```

### ステップ4：起動スクリプトの作成

#### バッチファイルの役割と必要性

MCPサーバーを簡単に起動するためにバッチファイルが必要です。このファイルがあることで以下のメリットがあります：

- **自動環境設定**: Python仮想環境を自動的に有効化し、必要な環境変数を読み込みます
- **起動の簡素化**: 複数のコマンドを1つのファイルにまとめることで、毎回同じコマンドを入力する手間を省きます
- **Cursorとの連携**: Cursorの設定画面で単一コマンドとして指定できるため、AIアシスタントがMCPサーバーを利用できるようになります
- **パス問題の解決**: 正しいディレクトリに自動的に移動するため、どこからスクリプトを実行しても正常に動作します

バッチファイルがないと、毎回手動でコマンドを入力する必要があり、Cursorとの連携も難しくなります。

Windows用にバッチファイル`run-supabase.bat`を作成します：

```bat
@echo off
cd /d %~dp0
echo Starting Supabase MCP Server...
call .venv\Scripts\activate.bat
python -m supabase_mcp.main
```

Mac/Linux用にシェルスクリプト`run-supabase.sh`を作成する場合：

```bash
#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Supabase MCP Server..."
source .venv/bin/activate
python -m supabase_mcp.main
```

### ステップ5：Cursor側の設定

1. Cursorを開く
2. 左下の「User Settings」を選択
3. 「AI」→「MCP Servers」を選択
4. 「Add Server」をクリック
5. 名前（例：alexander-supabase）とコマンド（例：`cmd /c C:\path\to\mcp-servers\alexander-supabase-mcp\run-supabase.bat`）を入力
6. 「Save」をクリック

#### ⚠️ 重要：Cursorのコマンド設定の制限について

**注意点**: CursorのMCPサーバー設定では、コマンドにオプションや引数を柔軟に設定することが難しい場合があります。特に環境変数の設定や複雑なコマンドラインオプションを必要とするMCPサーバーでは問題が発生することがあります。

#### 🚨 特に注意！環境変数設定ではよくつまずきます

**多くの人がはまる落とし穴**: Cursor設定画面では環境変数を直接設定する方法がありません。これは非常に多くのユーザーがはまる問題です。例えば以下のようなコマンドは**絶対に動作しません**：

```
# これは動作しません！
env SUPABASE_DB_PASSWORD=mypassword python -m supabase_mcp.main

# これも動作しません！
SUPABASE_REGION=ap-northeast-1 python -m supabase_mcp.main
```

**具体例**: 多くのMCPサーバーでは、特定のAPI鍵や接続情報を環境変数として設定する必要があります。例えば「Brave Search MCP」を設定しようとして以下のようなコマンドを入れても機能しません：

```
env BRAVE_API_KEY=my-api-key npx -y @modelcontextprotocol/server-brave-search
```

これを試みると、「API key not found」や「Environmental variable not set」のようなエラーが発生し、何時間も原因究明に時間を費やすことになりかねません。

**必ず守るべき解決策**:
- **バッチファイル/シェルスクリプトの使用**: 上記の`run-supabase.bat`のように、必要なすべての設定を含むバッチファイルやシェルスクリプトを作成し、それを指定することで回避できます
- **環境変数設定ファイル**: `.env`ファイルに設定を記述し、バッチファイル内で読み込むようにします
- **フルパスの使用**: コマンドパスには必ず絶対パスを使用してください
- **引用符の注意**: パスに空白が含まれる場合は、正しく引用符で囲む必要があります（例：`cmd /c "C:\My Path\run-supabase.bat"`）

これらの制限は、Cursor側の仕様によるものです。将来的にはより柔軟な設定方法が提供される可能性がありますが、現時点ではバッチファイルを使用する方法が最も安定しています。

## 🔄 接続テスト

設定が完了したら、MCPサーバーの接続テストをしましょう：

1. Cursorでプロジェクトを開く
2. MCPサーバーを選択（左下のステータスバーからアクセス可能）
3. 以下のようなプロンプトをAIに送信：

```
データベーススキーマを取得して、その概要を説明してください。
```

成功すると、AIがデータベースに接続し、スキーマ情報を返してくれます！

## 🔍 トラブルシューティング

接続に失敗する場合は、以下を確認してください：

1. **リージョンの確認**：接続文字列から正確なリージョンを抽出できていますか？
2. **パスワードの再確認**：特殊文字が含まれている場合は正しくエスケープされていますか？
3. **再起動の確認**：設定変更後はMCPサーバーを必ず再起動してください
4. **接続方法の切り替え**：接続に問題がある場合は、完全な接続文字列を使用してみてください

   **具体例：**
   
   現在の設定：
   ```
   SUPABASE_PROJECT_REF=abcd1234
   SUPABASE_DB_PASSWORD=MyPassword123
   SUPABASE_REGION=ap-northeast-1
   ...その他の設定...
   ```
   
   完全な接続文字列を使った設定：
   ```
   # 以下のいずれかを.envファイルに追加（既存の設定と併用可）
   
   # 直接データベースに接続する場合
   DATABASE_URL=postgresql://postgres:MyPassword123@db.abcd1234.supabase.co:5432/postgres
   
   # または、プーラー経由で接続する場合
   DATABASE_URL=postgresql://postgres:MyPassword123@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
   ```
   
   この完全な接続文字列を使うと、MCPサーバーが個別の設定値から接続情報を組み立てる必要がなくなり、接続の問題が解決することがあります。特に、パスワードに特殊文字が含まれている場合や、リージョン設定が複雑な場合に効果的です。

## 📝 付録：失敗事例と解決策

### 失敗事例1：「Tenant or user not found」エラー
- **問題**：設定は正しいのに接続エラーが発生
- **解決策**：リージョン設定を確認。多くの場合、デフォルトの`us-east-1`ではなく、実際のプロジェクトのリージョン（例：`ap-northeast-1`）を設定する必要があります

### 失敗事例2：設定情報はあるのにサーバーが起動しない
- **問題**：バッチファイルが正しく動作しない
- **解決策**：パスに空白や特殊文字が含まれていないか確認。また、`cd /d %~dp0`コマンドが正しく設定されているか確認

### 失敗事例3：一部のコマンドだけ動作する
- **問題**：APIコマンドは動くがデータベースコマンドが動かない
- **解決策**：MCPサーバーの設計上、接続情報に問題があっても一部のコマンドは動作します。正確な接続情報を設定し、サーバーを再起動すると解決することが多いです

### 失敗事例4：パスワードリセット後も接続できない
- **問題**：パスワードをリセットしても接続エラーが続く
- **解決策**：完全な接続文字列を使用してみる。`DATABASE_URL=postgresql://postgres:[パスワード]@db.[プロジェクト参照ID].supabase.co:5432/postgres`のような形式で設定すると解決することがあります

### 失敗事例5：Cursorのコマンド設定問題
- **問題**：Cursorの設定画面でMCPサーバーのコマンドに環境変数やオプションを設定しようとすると機能しない
- **解決策**：バッチファイル（Windowsの場合）またはシェルスクリプト（Mac/Linuxの場合）を作成し、その中にすべてのコマンド、オプション、環境変数設定を含めます。そのファイルをCursorのコマンド設定に指定することで、直接オプションを渡す必要がなくなります。
- **例**：
  ```bat
  @echo off
  cd /d %~dp0
  rem 必要な環境変数を設定
  set MY_API_KEY=api_key_value
  set DEBUG_MODE=true
  echo Starting MCP Server...
  call .venv\Scripts\activate.bat
  python -m supabase_mcp.main --option1 value1 --option2 value2
  ```

---

これで、Cursor×SupabaseのMCP設定は完了です！AIがあなたのデータベースを理解し、より具体的な支援ができるようになりました。何か問題があれば、コメントで教えてください。それでは、AIとのデータベース会話をお楽しみください！ 