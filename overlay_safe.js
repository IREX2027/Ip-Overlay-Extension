(async function () {
  if (document.getElementById("ip-overlay-safe")) return;

  // Root box
  const box = document.createElement("div");
  box.id = "ip-overlay-safe";
  Object.assign(box.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#333",
    color: "white",
    padding: "12px 16px",
    borderRadius: "10px",
    fontFamily: "Segoe UI, Roboto, sans-serif",
    fontSize: "13px",
    zIndex: "999999",
    maxWidth: "260px",
    lineHeight: "1.4",
    boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
  });

  // Header
  const header = document.createElement("div");
  Object.assign(header.style, {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  });

  const title = document.createElement("strong");
  title.textContent = "🌐 Secure Mode IP Overlay";

  const btnRow = document.createElement("div");
  Object.assign(btnRow.style, { display: "flex", gap: "8px" });

  const settingsBtn = document.createElement("button");
  settingsBtn.textContent = "⚙️";
  Object.assign(settingsBtn.style, {
    cursor: "pointer",
    fontSize: "16px",
    background: "transparent",
    border: "none",
    color: "inherit",
  });

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  Object.assign(closeBtn.style, {
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    background: "transparent",
    border: "none",
    color: "inherit",
  });

  btnRow.appendChild(settingsBtn);
  btnRow.appendChild(closeBtn);
  header.appendChild(title);
  header.appendChild(btnRow);
  box.appendChild(header);

  // Content
  const content = document.createElement("div");
  content.style.display = "flex";
  content.style.flexDirection = "column";
  content.style.gap = "8px";
  box.appendChild(content);

  const infoRow = document.createElement("div");
  infoRow.style.display = "flex";
  infoRow.style.justifyContent = "space-between";
  infoRow.style.alignItems = "center";
  infoRow.style.gap = "8px";

  const infoTitle = document.createElement("div");
  infoTitle.textContent = "Loading IPs…";
  infoTitle.style.fontSize = "13px";
  infoRow.appendChild(infoTitle);

  const btns = document.createElement("div");
  btns.style.display = "flex";
  btns.style.gap = "6px";

  const refreshBtn = document.createElement("button");
  refreshBtn.textContent = "⟳";
  Object.assign(refreshBtn.style, {
    cursor: "pointer",
    padding: "4px",
    borderRadius: "6px",
    border: "none",
    background: "#444",
    color: "inherit",
  });
  btns.appendChild(refreshBtn);
  // (removed copy button here; Copy action is available in Settings)

  infoRow.appendChild(btns);
  content.appendChild(infoRow);

  const list = document.createElement("div");
  list.style.display = "flex";
  list.style.flexDirection = "column";
  list.style.gap = "6px";
  content.appendChild(list);

  document.body.appendChild(box);

  // Drag helper: make an element draggable by a handle
  function makeDraggable(el, handle) {
    handle = handle || el;
    handle.style.cursor = "move";
    // mark whether user has manually moved this element
    el.__manuallyMoved = false;
    let startX, startY, startLeft, startTop;
    function onMouseDown(e) {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      // convert to left/top so we can move freely
      el.style.left = rect.left + "px";
      el.style.top = rect.top + "px";
      el.style.right = "";
      el.style.bottom = "";
      el.style.position = "fixed";
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseFloat(el.style.left || 0);
      startTop = parseFloat(el.style.top || 0);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
    function onMouseMove(e) {
      // note: this element is being moved by the user
      el.__manuallyMoved = true;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      el.style.left = startLeft + dx + "px";
      el.style.top = startTop + dy + "px";
      // dispatch a custom event so other UI (settings popup) can follow
      try {
        const ev = new CustomEvent("overlay-drag", {
          detail: {
            el,
            left: parseFloat(el.style.left || 0),
            top: parseFloat(el.style.top || 0),
          },
        });
        document.dispatchEvent(ev);
      } catch (e) {}
    }
    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
    handle.addEventListener("mousedown", onMouseDown);
  }

  // make main box draggable via its header
  makeDraggable(box, header);

  // Settings popup (richer UI)
  const settingsPopup = document.createElement("div");
  Object.assign(settingsPopup.style, {
    position: "fixed",
    bottom: "80px",
    right: "20px",
    background: "#222",
    color: "white",
    padding: "12px",
    borderRadius: "10px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
    fontSize: "13px",
    fontFamily: "Segoe UI, Roboto, sans-serif",
    zIndex: "1000000",
    display: "none",
    maxWidth: "320px",
  });

  settingsPopup.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <strong style="font-size:14px;">Safe Settings</strong>
      <button id="sp-close" style="cursor:pointer; font-weight:bold; background:transparent; border:none; color:inherit; font-size:16px;">×</button>
    </div>
    <div style="display:flex; gap:8px; margin-bottom:8px;">
      <label style="display:flex; gap:6px; align-items:center;"><input id="mask-ip" type="checkbox"> Mask IPs</label>
      <label style="display:flex; gap:6px; align-items:center;"><input id="minimal-mode" type="checkbox"> Minimal</label>
    </div>
    <div style="margin-bottom:8px;"><strong>Refresh:</strong>
      <div style="display:flex; gap:8px; margin-top:6px;">
        <button id="refresh-now" style="padding:6px; border-radius:6px; border:none; background:#444; color:inherit;">Now</button>
        <select id="refresh-interval" style="padding:6px; border-radius:6px; background:#333; color:inherit; border:none;">
          <option value="0">Manual</option>
          <option value="30">30s</option>
          <option value="60">1m</option>
          <option value="300">5m</option>
        </select>
      </div>
    </div>
    <div style="margin-bottom:8px;"><strong>Appearance:</strong>
      <div style="display:flex; gap:8px; margin-top:6px;">
        <label style="display:flex; gap:6px; align-items:center;"><input id="theme-dark" name="theme" type="radio" checked> Dark</label>
        <label style="display:flex; gap:6px; align-items:center;"><input id="theme-white" name="theme" type="radio"> White</label>
      </div>
    </div>
    <div style="margin-bottom:8px;"><strong>Actions:</strong>
      <div style="display:flex; gap:8px; margin-top:6px;">
        <button id="copy-ip" style="padding:6px; border-radius:6px; border:none; background:#444; color:inherit;">Copy IP</button>
        <button id="open-logs" style="padding:6px; border-radius:6px; border:none; background:#444; color:inherit;">Open Logs</button>
      </div>
    </div>
  `;

  document.body.appendChild(settingsPopup);

  // Settings persistence helpers (chrome.storage.local preferred, fallback to localStorage)
  function saveSettings(obj) {
    try {
      if (window.chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ ipOverlaySettings: obj });
      } else {
        localStorage.setItem("ipOverlaySettings", JSON.stringify(obj));
      }
    } catch (e) {
      try {
        localStorage.setItem("ipOverlaySettings", JSON.stringify(obj));
      } catch (e) {}
    }
  }

  function loadSettings() {
    return new Promise((resolve) => {
      try {
        if (
          window.chrome &&
          chrome.storage &&
          chrome.storage.local &&
          chrome.storage.local.get
        ) {
          chrome.storage.local.get("ipOverlaySettings", (res) => {
            const v =
              res && res.ipOverlaySettings ? res.ipOverlaySettings : null;
            if (v) resolve(v);
            else
              resolve({
                mask: false,
                minimal: false,
                theme: "dark",
                interval: 0,
              });
          });
          return;
        }
      } catch (e) {}
      try {
        const raw = localStorage.getItem("ipOverlaySettings");
        if (raw) resolve(JSON.parse(raw));
        else
          resolve({ mask: false, minimal: false, theme: "dark", interval: 0 });
      } catch (e) {
        resolve({ mask: false, minimal: false, theme: "dark", interval: 0 });
      }
    });
  }

  // Button wiring and settings positioning/animation
  const spClose = settingsPopup.querySelector("#sp-close");
  settingsBtn.addEventListener("click", () => {
    const isHidden =
      settingsPopup.style.display === "none" ||
      settingsPopup.style.display === "";
    if (isHidden) {
      // position settings popup to the right (or left if not enough space)
      const br = box.getBoundingClientRect();
      settingsPopup.style.display = "block";
      // hide during measurement to avoid flicker
      settingsPopup.style.visibility = "hidden";
      settingsPopup.style.right = "";
      settingsPopup.style.bottom = "";
      // force layout so offset measurements are available
      const popupRect = settingsPopup.getBoundingClientRect();
      const popupW =
        popupRect.width || parseInt(settingsPopup.style.maxWidth, 10) || 320;
      const popupH = popupRect.height || 200;

      const preferredLeft = br.left + br.width + 8;
      let left;
      if (preferredLeft + popupW > window.innerWidth - 8) {
        // place to left
        left = Math.max(8, br.left - popupW - 8);
      } else {
        left = preferredLeft;
      }

      // align bottom of settings with bottom of main box
      let top = br.top + br.height - popupH;
      // clamp into viewport
      top = Math.max(8, Math.min(top, window.innerHeight - popupH - 8));

      settingsPopup.style.left = left + "px";
      settingsPopup.style.top = top + "px";
      settingsPopup.style.visibility = "";

      // opening animation
      try {
        settingsPopup.animate(
          [
            { opacity: 0, transform: "translateY(6px) scale(0.98)" },
            { opacity: 1, transform: "translateY(0) scale(1)" },
          ],
          {
            duration: 160,
            easing: "cubic-bezier(.2,.9,.2,1)",
            fill: "forwards",
          }
        );
      } catch (e) {}
    } else {
      settingsPopup.style.display = "none";
    }
  });
  spClose.addEventListener("click", () => {
    settingsPopup.style.display = "none";
  });
  closeBtn.addEventListener("click", () => {
    settingsPopup.remove();
    box.remove();
  });

  // make settings popup draggable by its header
  makeDraggable(settingsPopup, settingsPopup.firstElementChild);
  // Fetch public IPs (safe mode version) with timeouts
  async function getPublicIPsSafe() {
    const result = { ipv4: null, ipv6: null, errors: [] };
    // Helper: fetch with AbortController timeout
    async function fetchWithTimeout(url, timeoutMs = 8000) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        return await res.text();
      } catch (err) {
        clearTimeout(timer);
        throw err;
      }
    }

    try {
      result.ipv4 = await fetchWithTimeout("https://api.ipify.org", 8000);
    } catch (e) {
      result.errors.push({
        when: Date.now(),
        type: "ipv4-fetch",
        message: String(e),
      });
    }
    try {
      result.ipv6 = await fetchWithTimeout("https://api64.ipify.org", 8000);
    } catch (e) {
      result.errors.push({
        when: Date.now(),
        type: "ipv6-fetch",
        message: String(e),
      });
    }
    return result;
  }

  // Utility functions
  function maskIP(ip) {
    if (!ip) return "N/A";
    // simple masking: keep first and last octet/group depending on IPv4/IPv6
    if (ip.includes(".")) {
      const parts = ip.split(".");
      if (parts.length === 4) return `${parts[0]}.***.***.${parts[3]}`;
      return "***.***.***.***";
    }
    // IPv6: keep first and last hextet
    const parts = ip.split(":");
    if (parts.length >= 2) return `${parts[0]}:...:${parts[parts.length - 1]}`;
    return "****:****:****";
  }

  let lastIPs = { ipv4: null, ipv6: null };

  // simple in-memory logs buffer
  const logs = [];
  // declare logsPanel early to avoid TDZ when appendLog is called before DOM creation
  let logsPanel = null;
  function appendLog(entry) {
    const ts = new Date().toISOString();
    logs.unshift({ ts, ...entry });
    if (logs.length > 500) logs.length = 500;
    // only render if logsPanel has been created
    if (typeof renderLogs === "function" && logsPanel) renderLogs();
  }

  let isRefreshing = false;
  async function refreshIPs() {
    if (isRefreshing) return;
    isRefreshing = true;
    const prevText = infoTitle.textContent;
    infoTitle.textContent = "Refreshing…";
    try {
      // Visual feedback while disabled
      refreshBtn.disabled = true;
      refreshBtn.style.opacity = "0.6";
      appendLog({ kind: "refresh-start" });

      const pub = await getPublicIPsSafe();
      lastIPs = { ipv4: pub.ipv4, ipv6: pub.ipv6 };
      renderList(pub);
      appendLog({
        kind: "refresh-complete",
        ipv4: pub.ipv4 || null,
        ipv6: pub.ipv6 || null,
      });
      if (pub.errors && pub.errors.length) {
        for (const err of pub.errors)
          appendLog({ kind: "error", subtype: err.type, message: err.message });
      }
    } catch (err) {
      appendLog({ kind: "refresh-failed", message: String(err) });
    } finally {
      infoTitle.textContent = "Loaded IPs";
      refreshBtn.disabled = false;
      refreshBtn.style.opacity = "";
      isRefreshing = false;
    }
  }

  function renderList(pub) {
    list.innerHTML = "";
    const v4 = document.createElement("div");
    v4.innerHTML = `<strong>Public IPv4:</strong> <span id=\"safe-ip-v4\">${pub.ipv4 || "N/A"}</span>`;
    const v6 = document.createElement("div");
    v6.innerHTML = `<strong>Public IPv6:</strong> <span id=\"safe-ip-v6\">${pub.ipv6 || "N/A"}</span>`;
    list.appendChild(v4);
    list.appendChild(v6);

    // per-row copy buttons
    [
      [v4, "v4"],
      [v6, "v6"],
    ].forEach(([el, key]) => {
      const txt = el.querySelector("span").textContent;
      const cp = document.createElement("button");
      cp.textContent = "Copy";
      Object.assign(cp.style, {
        marginLeft: "8px",
        padding: "4px 6px",
        borderRadius: "6px",
        border: "none",
        background: themeIsWhite ? "#f0f0f0" : "#444",
        color: themeIsWhite ? "#000" : "inherit",
        cursor: "pointer",
      });
      cp.onclick = () => {
        try {
          navigator.clipboard.writeText(txt);
        } catch {}
        appendLog({ kind: "copy", what: txt });
      };
      el.appendChild(cp);
    });

    // apply masking if requested
    const mask = settingsPopup.querySelector("#mask-ip").checked;
    if (mask) {
      const s4 = list.querySelector("#safe-ip-v4");
      const s6 = list.querySelector("#safe-ip-v6");
      if (s4) s4.textContent = maskIP(lastIPs.ipv4);
      if (s6) s6.textContent = maskIP(lastIPs.ipv6);
    }
  }

  // initial load moved to after settings are applied (see init below)

  // Wiring for small controls
  refreshBtn.onclick = refreshIPs;
  // copyAllBtn removed — use Settings -> Copy IP instead

  // settings wiring
  const maskCheckbox = settingsPopup.querySelector("#mask-ip");
  const minimalCheckbox = settingsPopup.querySelector("#minimal-mode");
  const refreshNowBtn = settingsPopup.querySelector("#refresh-now");
  const refreshIntervalSelect =
    settingsPopup.querySelector("#refresh-interval");
  const themeDark = settingsPopup.querySelector("#theme-dark");
  const themeWhite = settingsPopup.querySelector("#theme-white");
  const copyIpBtn = settingsPopup.querySelector("#copy-ip");

  // theme flag used when rendering per-row button styles
  let themeIsWhite = false;

  refreshNowBtn.addEventListener("click", refreshIPs);
  maskCheckbox.addEventListener("change", () => {
    renderList(lastIPs);
    saveSettings(getCurrentSettings());
  });
  minimalCheckbox.addEventListener("change", () => {
    // Minimal mode: hide controls but keep IPs visible
    if (minimalCheckbox.checked) {
      list.style.display = "flex";
      btns.style.display = "none";
    } else {
      list.style.display = "flex";
      btns.style.display = "flex";
    }
    saveSettings(getCurrentSettings());
  });
  themeWhite.addEventListener("change", () => {
    if (themeWhite.checked) {
      themeIsWhite = true;
      box.style.background = "#fff";
      box.style.color = "#000";
      box.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
      settingsPopup.style.background = "#fff";
      settingsPopup.style.color = "#000";
      settingsPopup.style.boxShadow = "0 6px 16px rgba(0,0,0,0.06)";
      refreshBtn.style.background = "#f0f0f0";
      refreshBtn.style.color = "#111";
      copyIpBtn.style.background = "#f0f0f0";
      copyIpBtn.style.color = "#111";
      // re-render list to update per-row copy button styles
      renderList(lastIPs);
      saveSettings(getCurrentSettings());
    }
  });
  themeDark.addEventListener("change", () => {
    if (themeDark.checked) {
      themeIsWhite = false;
      box.style.background = "#333";
      box.style.color = "#fff";
      box.style.boxShadow = "0 6px 16px rgba(0,0,0,0.4)";
      settingsPopup.style.background = "#222";
      settingsPopup.style.color = "#fff";
      settingsPopup.style.boxShadow = "0 6px 16px rgba(0,0,0,0.4)";
      refreshBtn.style.background = "#444";
      refreshBtn.style.color = "inherit";
      copyIpBtn.style.background = "#444";
      copyIpBtn.style.color = "inherit";
      renderList(lastIPs);
      saveSettings(getCurrentSettings());
    }
  });
  copyIpBtn.addEventListener("click", () => {
    const mask = maskCheckbox.checked;
    const ipv4 = lastIPs.ipv4 || "N/A";
    const ipv6 = lastIPs.ipv6 || "N/A";
    const toCopy = mask
      ? `${maskIP(ipv4)}\n${maskIP(ipv6)}`
      : `${ipv4}\n${ipv6}`;
    try {
      navigator.clipboard.writeText(toCopy);
    } catch {}
    appendLog({ kind: "copy-all", text: toCopy });
    // visual feedback
    const orig = copyIpBtn.textContent;
    copyIpBtn.textContent = "✓ Copied";
    setTimeout(() => {
      try {
        copyIpBtn.textContent = orig;
      } catch (e) {}
    }, 1200);
  });

  // helper to collect current settings
  function getCurrentSettings() {
    return {
      mask: !!(maskCheckbox && maskCheckbox.checked),
      minimal: !!(minimalCheckbox && minimalCheckbox.checked),
      theme: themeIsWhite ? "white" : "dark",
      interval: parseInt(refreshIntervalSelect.value, 10) || 0,
    };
  }

  // initialize settings from storage, then do first refresh
  (async function initFromStorage() {
    try {
      const s = await loadSettings();
      maskCheckbox.checked = !!s.mask;
      minimalCheckbox.checked = !!s.minimal;
      if (s.theme === "white") {
        themeWhite.checked = true;
        themeWhite.dispatchEvent(new Event("change"));
      } else {
        themeDark.checked = true;
        themeDark.dispatchEvent(new Event("change"));
      }
      refreshIntervalSelect.value = String(s.interval || 0);
      // apply minimal state
      if (minimalCheckbox.checked) {
        list.style.display = "flex";
        btns.style.display = "none";
      } else {
        btns.style.display = "flex";
      }
      // start auto-refresh if requested
      const val = parseInt(refreshIntervalSelect.value, 10);
      if (val > 0) {
        if (refreshTimer) clearInterval(refreshTimer);
        refreshTimer = setInterval(refreshIPs, val * 1000);
        appendLog({ kind: "auto-refresh-enabled", interval: val });
      }
      // save normalized settings back
      saveSettings(getCurrentSettings());
    } catch (e) {}
    await refreshIPs();
  })();

  // refresh interval handling
  let refreshTimer = null;
  refreshIntervalSelect.addEventListener("change", () => {
    if (refreshTimer) clearInterval(refreshTimer);
    const val = parseInt(refreshIntervalSelect.value, 10);
    if (val > 0) {
      refreshTimer = setInterval(refreshIPs, val * 1000);
      appendLog({ kind: "auto-refresh-enabled", interval: val });
    }
  });

  // Logs UI
  logsPanel = document.createElement("div");
  Object.assign(logsPanel.style, {
    position: "fixed",
    right: "20px",
    bottom: "100px",
    width: "360px",
    maxHeight: "320px",
    overflow: "auto",
    background: "rgba(20,20,20,0.98)",
    color: "#fff",
    padding: "12px",
    borderRadius: "8px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
    zIndex: 1000001,
    display: "none",
    fontSize: "12px",
    fontFamily: "Segoe UI, Roboto, sans-serif",
  });

  logsPanel.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <strong>Logs</strong>
      <div style="display:flex; gap:6px; align-items:center;">
        <button id="logs-clear" style="padding:6px; border-radius:6px; border:none; background:#444; color:#fff; cursor:pointer">Clear</button>
        <button id="logs-download" style="padding:6px; border-radius:6px; border:none; background:#444; color:#fff; cursor:pointer">Download</button>
        <button id="logs-close" style="padding:6px; border-radius:6px; border:none; background:transparent; color:#fff; cursor:pointer">×</button>
      </div>
    </div>
    <div id="logs-list" style="display:block; font-family: monospace; white-space:pre-wrap; max-height:260px; overflow:auto; padding-right:6px;"></div>
  `;
  document.body.appendChild(logsPanel);
  // make logs panel draggable by its header
  makeDraggable(logsPanel, logsPanel.firstElementChild);

  function renderLogs() {
    if (!logsPanel) return;
    const container = logsPanel.querySelector("#logs-list");
    if (!container) return;
    container.innerHTML = logs
      .map(
        (l) =>
          `[${l.ts}] ${l.kind}${l.ipv4 ? " ipv4=" + l.ipv4 : ""}${l.ipv6 ? " ipv6=" + l.ipv6 : ""}${l.what ? " copy=" + l.what : ""}${l.text ? " text=" + l.text : ""}${l.message ? " msg=" + l.message : ""}`
      )
      .join("\n");
  }

  logsPanel.querySelector("#logs-close").onclick = () => {
    logsPanel.style.display = "none";
  };
  logsPanel.querySelector("#logs-clear").onclick = () => {
    logs.length = 0;
    renderLogs();
  };
  logsPanel.querySelector("#logs-download").onclick = () => {
    const data = logs.map((l) => JSON.stringify(l)).join("\n");
    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ip-overlay-logs.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const openLogsBtn = settingsPopup.querySelector("#open-logs");
  if (openLogsBtn) {
    openLogsBtn.addEventListener("click", () => {
      const visible = logsPanel.style.display !== "none";
      if (visible) {
        logsPanel.style.display = "none";
      } else {
        renderLogs();
        logsPanel.style.display = "block";
        appendLog({ kind: "logs-open" });
      }
    });
  }
})();
