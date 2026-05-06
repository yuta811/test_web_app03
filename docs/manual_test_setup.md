# 実機操作テスト環境

新しいタスク開始時は、まず次を実行してください（毎回同じ手順でOK）。

```bash
npm run test:bootstrap
```

このコマンドは以下を順に実行します。
- `npm install`
- `npx playwright install chromium`
- `npx playwright install-deps chromium`（失敗時は必要な再実行コマンドを表示）

## 1) セットアップ（手動実行したい場合）
```bash
npm install
npx playwright install chromium
sudo npx playwright install-deps chromium
```

> `libatk-1.0.so.0` などの不足エラーは、OS依存パッケージ未導入が原因です。

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

- `npm test` は `npm run test:e2e` を実行します。
- `test:e2e` は `npx playwright test` を使うため、`node_modules/.bin` 依存の失敗を避けられます。

Playwright 設定は `playwright.config.js` を参照。
