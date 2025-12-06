function registerScripts() {
  chrome.scripting.registerContentScripts([
    {
      id: "overlay-normal",
      matches: ["<all_urls>"],
      excludeMatches: ["*://*.lego.com/*", "*://*.bambulab.com/*"],
      js: ["overlay.js"],
      runAt: "document_idle",
    },
    {
      id: "overlay-safe",
      matches: ["*://*.lego.com/*", "*://*.bambulab.com/*"],
      js: ["overlay_safe.js"],
      runAt: "document_idle",
    },
  ]);
}

// Register when extension starts
chrome.runtime.onStartup.addListener(registerScripts);
// Also register when installed or updated
chrome.runtime.onInstalled.addListener(registerScripts);
