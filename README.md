# techbeans Tools

開発者向けの便利なツールコレクション。Next.js 15とReact 19で構築された、モダンで使いやすいWebアプリケーションです。

## 概要

techbeans Toolsは、日常の開発作業で必要となる様々なユーティリティツールを一箇所に集約したプラットフォームです。JSONの整形、画像の変換、パスワード生成など、開発者が頻繁に使用するツールをブラウザ上で簡単に利用できます。

## 機能一覧

### 🛠️ 開発ツール
- **JSON整形・検証**: JSONデータの整形、検証、圧縮
- **エンコード/デコード**: Base64、URL、HTML、JSONのエンコード・デコード
- **HTML整形**: HTMLコードの自動整形とインデント調整
- **Mermaidエディタ**: リアルタイムでダイアグラムを作成・編集

### 🎨 デザインツール
- **カラーピッカー**: カラーホイールを使用した直感的な色選択とパレット生成
- **画像変換**: 画像とBase64の相互変換（ドラッグ&ドロップ対応）

### 🔐 セキュリティツール
- **ハッシュ生成**: MD5、SHA-1、SHA-256、SHA-512ハッシュの生成
- **パスワード生成**: 暗号学的に安全なパスワードの生成（強度表示付き）

### 🌐 その他のツール
- **QRコード生成**: テキストやURLからQRコードを生成
- **タイムスタンプ変換**: Unixタイムスタンプと日時の相互変換
- **タイムゾーン変換**: 世界15都市の時刻を即座に変換

## 技術スタック

- **フレームワーク**: [Next.js 15](https://nextjs.org/) (App Router)
- **言語**: TypeScript、React 19
- **スタイリング**: Tailwind CSS v4
- **UIコンポーネント**: Radix UI、shadcn/ui
- **コードエディタ**: Monaco Editor
- **その他**: js-beautify、mermaid、@nuintun/qrcode

## セットアップ

### 必要な環境
- Node.js 18.0.0以上
- Yarn（推奨）またはnpm

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/techbeansjp/tb-tools.git
cd tb-tools/frontend

# 依存関係のインストール
yarn install
```

### 開発サーバーの起動

```bash
yarn dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアクセスしてください。

## 開発コマンド

```bash
# 開発サーバーの起動
yarn dev

# プロダクションビルドの作成
yarn build

# プロダクションサーバーの起動
yarn start

# コードのリント
yarn lint
```

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── tools/             # 各ツールのページ
│   └── layout.tsx         # ルートレイアウト
├── components/
│   ├── layout/            # レイアウトコンポーネント
│   ├── tools/             # 各ツールのコンポーネント
│   └── ui/                # 共通UIコンポーネント
├── lib/                   # ユーティリティ関数
└── types/                 # TypeScript型定義
```

## 新しいツールの追加方法

1. `src/app/tools/{tool-name}/page.tsx` にページコンポーネントを作成
2. `src/components/tools/{tool-name}/` にツールコンポーネントを作成
3. `src/components/layout/Sidebar.tsx` にナビゲーションエントリを追加
4. ページコンポーネントからツールコンポーネントをインポートして表示

## コントリビューション

プルリクエストを歓迎します！以下のガイドラインに従ってください：

1. フォークしてフィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
2. 変更をコミット (`git commit -m 'Add amazing feature'`)
3. ブランチにプッシュ (`git push origin feature/amazing-feature`)
4. プルリクエストを作成

### コーディング規約

- TypeScriptの型定義を必ず使用
- Tailwind CSSのユーティリティクラスを優先使用
- コンポーネントは関数コンポーネントで記述
- 既存のパターンとスタイルに従う

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## リンク

- **GitHub**: [https://github.com/techbeansjp/tb-tools](https://github.com/techbeansjp/tb-tools)
- **組織**: [techbeans.jp](https://techbeans.jp)

## 今後の予定

以下のツールの実装を予定しています：
- テキスト変換ツール
- 正規表現テスター
- 文字数カウンター
- IPアドレス確認ツール
- URLクエリパラメータ解析ツール

---

Made with ❤️ by [techbeans.jp](https://techbeans.jp)
