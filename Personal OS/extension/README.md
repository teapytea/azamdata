# Personal OS Account Scanner

This Microsoft Edge extension captures user-approved account discovery evidence and sends it to the paired Personal OS account.

## Install in Edge

1. Extract the downloaded ZIP.
2. Open `edge://extensions`.
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select the extracted `personal-os-edge-extension` folder.
5. Open Personal OS → Connections, generate a pairing code, and enter it in the extension.

## Scan workflow

- Open Google connected apps and click **Scan current page**.
- Open the Gmail discovery search, wait for results, then scan. Scroll and scan again for additional result pages; duplicate evidence is ignored.
- Open an AI provider's account, billing, or usage page and scan to verify its current status.

The extension never reads or transmits passwords, cookies, authentication tokens, or complete email bodies. It stores only its own revocable Personal OS device token in extension-local storage.

Finance transaction email is intentionally outside this extension. The scheduled Google Apps Script bridge under `google-apps-script/` handles labeled BCA and BSI notifications according to BAB 10 of the project specification.
