# MCPサーバーとTrello連携の概要

このドキュメントでは、MCPサーバーとTrelloの連携に関する重要なポイントと、実際に発生した問題の解決策についてまとめています。

## MCPサーバーとは

MCP（Multimodal Capability Provider）サーバーは、AI Assistantに外部サービスとの連携機能を提供するサーバーです。Trello、GitHub、Notion、Todoistなど、様々なサービスと連携できます。

## Trello連携の基本

### 1. セットアップの流れ

1. MCPサーバーのコードを取得する
2. 必要な依存関係をインストールする
3. Trello APIキーとトークンを設定する
4. サーバーを起動する
5. AI Assistantを通じてTrello機能を使用する

### 2. 必要な認証情報

- **Trello API Key**: Trello開発者ポータルから取得
- **Trello Token**: APIキーを使用して生成

**開発時の注意**: 開発中や単にサーバーを起動するだけであれば、ダミー値（例: "xxx"）でも動作します。

## 実際のトラブルシューティング事例

### 問題1: モジュールが見つからないエラー

**エラーメッセージ**:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/path/to/run-trello.js'
```

**原因**:
ファイルパスの指定が間違っているか、ファイルが存在しない場所を参照していました。

**解決策**:
1. 正しいディレクトリから実行していることを確認
2. ファイルの存在を確認
3. 絶対パスではなく相対パスを使用

### 問題2: ESモジュール形式の問題

**エラーメッセージ**:
```
SyntaxError: Cannot use import statement outside a module
```

**原因**:
NodeJSのデフォルト形式はCommonJSですが、`import`文を使用するコードはESモジュール形式です。

**解決策**:
以下のいずれかの方法で解決できます：
1. ファイルの拡張子を`.js`から`.mjs`に変更
2. 最も近い親ディレクトリのpackage.jsonに`"type": "module"`を追加
3. ESモジュール形式ではなく、CommonJS形式（require）に変更

実際に`.js`から`.mjs`に変更することで問題が解決しました。

### 問題3: サーバーパスの問題

**エラーメッセージ**:
```
Error: サーバーファイルが見つかりません: /path/to/trello/build/index.js
```

**原因**:
Trelloサーバーのビルドファイルへのパスが正しく設定されていませんでした。

**解決策**:
スクリプト内のパスを以下のように修正しました：
```javascript
const serverPath = path.join(__dirname, 'trello', 'build', 'index.js');
```
ディレクトリ構造に応じて適切なパスを設定することが重要です。

## 重要なポイント

1. **ES ModulesとCommonJSの違い**
   - ESモジュール: `import/export`文を使用（`.mjs`拡張子または`"type": "module"`が必要）
   - CommonJS: `require/module.exports`を使用（従来の`.js`拡張子）

2. **環境変数の扱い**
   - 環境変数を直接設定する方法と、`.env`ファイルを使用する方法があります
   - 開発中はダミーの値でも動作します

3. **ディレクトリ構造**
   - MCPサーバーのコードは特定のディレクトリ構造を前提としている場合があります
   - ファイルパスが正しく設定されていることを確認しましょう

4. **サーバー起動の確認**
   - 正常に起動すると「Trello MCP server running on stdio.」というメッセージが表示されます
   - このメッセージが表示されない場合は、エラーが発生している可能性があります

## AI Assistantでの利用方法

サーバーが正常に起動すると、AI Assistantで以下のような機能が利用可能になります：

- ボードの一覧表示
- リストの取得
- カードの取得と操作
- カードの詳細情報の取得
- カード情報の更新

例えば、AI Assistantに「私のTrelloボードを表示して」などと依頼することで、Trelloの情報を取得できます。

---

このドキュメントはMCPサーバーとTrello連携に関する基本的な情報と、実際に発生した問題の解決策についてまとめたものです。さらに詳細な情報については、公式ドキュメントや「trello-setup-guide.md」をご参照ください。 