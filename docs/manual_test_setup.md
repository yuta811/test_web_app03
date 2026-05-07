# 実機操作テスト環境

新しいタスク開始直後（`node_modules` が空の状態）でも、`npm test` だけで Playwright E2E が実行できるようにしています。

## 0) 最短手順（推奨）
```bash
npm test
```

`npm test` 実行時に `pretest` が先に走り、自動で `npm install` されます。
これにより「新しいタスクごとに `@playwright/test` が見つからない」エラーを回避できます。

## 1) 初回セットアップを明示的に実行する場合
```bash
npm run test:bootstrap
```

このコマンドは以下を順に実行します。
- `npm install`
- `npx --no-install playwright install chromium`
- `npx --no-install playwright install-deps chromium`（失敗時は必要な再実行コマンドを表示）

## 2) ローカル起動（手動操作）
```bash
npx http-server . -p 4173 -c-1
```

ブラウザで `http://127.0.0.1:4173` を開いて操作します。

- 画面タップ/マウス押下: 走行加速（地上）
- 押下を離す: ジャンプ

## 3) E2E テスト
```bash
npm test
```

- `npm test` は `pretest` → `test:e2e` の順で実行されます。
- `test:e2e` は `npx --no-install playwright test` を使い、タスク環境で別バージョンの Playwright が勝手に入る事故を防ぎます。

Playwright 設定は `playwright.config.js` を参照。
