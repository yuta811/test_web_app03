# 実機操作テスト環境

## 1) セットアップ
```bash
npm install
npx playwright install chromium
```

## 2) ローカル起動（手動操作）
```bash
npx http-server . -p 4173 -c-1
```

ブラウザで `http://127.0.0.1:4173` を開いて操作します。

- 画面タップ/マウス押下: 走行加速（地上）
- 押下を離す: ジャンプ

## 3) E2E テスト
```bash
npm run test:e2e
```

Playwright 設定は `playwright.config.js` を参照。
