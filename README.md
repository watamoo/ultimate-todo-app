# 究極のTodoアプリ

最新のNext.js、React、TypeScript、Prisma、shadcn/uiを使用した高機能なTodoアプリ。

![スクリーンショット](https://via.placeholder.com/800x450.png?text=Ultimate+Todo+App)

## 技術スタック

- TypeScript ^5.0.0
- Next.js ^15.1.3
- React ^19.0.0
- Tailwind CSS ^3.4.17
- shadcn/ui ^2.1.8
- SQLite ^3.0.0
- Prisma ^5.0.0

## 機能

- タスクの作成、読取、更新、削除（CRUD）
- タスクのカテゴリ分け
- 優先度設定
- 期限管理
- タスクのフィルタリングと検索
- ドラッグ&ドロップでの並べ替え
- ダークモード対応
- レスポンシブデザイン

## セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/watamoo/ultimate-todo-app.git
cd ultimate-todo-app

# 依存パッケージのインストール
npm install

# データベースのセットアップ
npx prisma migrate dev --name init

# 開発サーバーの起動
npm run dev
```

## 使い方

### タスク管理

- **新規タスク作成**: タスク一覧上部の「+」ボタンをクリックし、タスク情報を入力して作成
- **タスク編集**: 各タスクの編集アイコンをクリックして更新
- **タスク削除**: 各タスクのゴミ箱アイコンをクリックして削除
- **ステータス変更**: チェックボックスをクリックして完了/未完了を切り替え
- **並べ替え**: タスクをドラッグ&ドロップして順序を変更

### カテゴリー管理

- **新規カテゴリー作成**: カテゴリー一覧上部の「+」ボタンをクリックし、名前と色を設定
- **カテゴリー編集**: 各カテゴリーの編集アイコンをクリックして更新
- **カテゴリー削除**: 各カテゴリーのゴミ箱アイコンをクリックして削除

### フィルタリングと検索

- **検索**: 検索バーを使用してタスクをテキストで検索
- **カテゴリーフィルター**: 特定のカテゴリーに属するタスクのみを表示
- **優先度フィルター**: 優先度に基づいてタスクをフィルタリング
- **ステータスフィルター**: 完了/未完了のタスクをフィルタリング

## プロジェクト構造

```
./
├── prisma/                  # Prismaスキーマと設定
├── public/                  # 静的アセット
└── src/
    ├── app/                 # ページコンポーネント
    │   └── api/            # APIルート
    ├── components/          # 再利用可能なコンポーネント
    │   ├── todo/           # Todoアプリのコンポーネント
    │   ├── ui/             # 基本UI要素
    │   └── theme-provider.tsx # テーマプロバイダー
    ├── lib/                # ユーティリティ関数とヘルパー
    │   ├── prisma/         # Prismaクライアント
    │   └── utils/          # 汎用ユーティリティ
    ├── types/              # TypeScript型定義
    └── styles/             # グローバルスタイル
```

## コントリビューション

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ライセンス

MIT
