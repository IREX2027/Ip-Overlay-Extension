# IP Address Overlay (Browser Extension)

Shows public and private IPv4/IPv6 addresses in a small overlay inside the browser.

**This repository contains a small Manifest V3 browser extension.**

**Files of interest:**

- `manifest.json` — extension metadata and permissions
- `background.js` — service worker background logic
- `overlay.js` — overlay UI and injection logic
- `icons/icon.png` — extension icon

**Install / Load (Developer)**

1. Open Chrome/Edge and go to the Extensions page:

```powershell
# Chrome
Start-Process "chrome" "chrome://extensions"
# Edge
Start-Process "msedge" "edge://extensions"
```

2. Enable **Developer mode** and click **Load unpacked**.
3. Select the folder `c:\Users\holde\Desktop\ip-overlay-extension`.

The extension icon should appear in the toolbar once loaded.

**Usage**

- Click the extension icon to open the overlay (if the extension shows a popup) or to toggle behaviors provided by the extension.
- The overlay displays detected public and private IP addresses. Public IP lookups are performed using the configured host endpoints.

**Safe Mode (for high-security sites)**

Safe Mode is provided for use on sites where external network calls or DOM injection may be restricted or undesired (for example, pages with strict Content Security Policy or where organizational policy forbids third-party network requests).

When Safe Mode is enabled the extension will:

- Avoid making external public-IP network requests (e.g., `api.ipify.org`).
- Limit displayed information to locally-detectable addresses where possible.
- Refrain from injecting the overlay into pages that appear to have strict security policies or where injection fails.

Safe Mode activation

Safe Mode is automatically enabled for certain high-security sites where external network calls or DOM injection are likely to be blocked or undesirable. The extension detects site security posture (for example, strict Content Security Policy or other indicators) and will limit its behavior on those sites.

Notes:

- There is no manual toggle in the extension by default; Safe Mode activation is automatic for affected sites.
- If you need different behavior for a specific site, disable the extension for that site via the browser's site controls or update extension settings (if available).

Notes about Safe Mode

- Enabling Safe Mode improves privacy and reduces external network activity, but may limit the extension's ability to show the public IP address.
- The exact behavior depends on the implementation in `background.js` and `overlay.js` — Safe Mode only affects network/injection behavior if the extension code respects the `safeMode` flag (the README documents the intended behavior).

Privacy & Security

- This extension requests permission to call public IP lookup hosts and to inject a small overlay. It stores any local settings in the browser's `chrome.storage.local` area.
- If you need a stricter privacy posture, enable Safe Mode and avoid loading the extension on sensitive pages.

Troubleshooting

- No icon shown: confirm `icons/icon.png` exists and the extension was loaded via **Load unpacked**.
- Overlay not appearing on a page: the page may have strict CSP or blocked script injection; Safe Mode or site restrictions may also affect injection.
- Public IP not shown: check network connectivity and whether Safe Mode is enabled.

Contributing

If you want to add an explicit Options page or popup toggle for Safe Mode, open a PR that:

- Adds `options_ui` or a `default_popup` in `manifest.json`.
- Adds a small UI to read/write `chrome.storage.local.safeMode`.

License

Include your license here.
