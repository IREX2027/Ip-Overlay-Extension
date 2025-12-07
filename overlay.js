async function getPublicIPs() {
  let ipv4 = null,
    ipv6 = null;
  try {
    ipv4 = await fetch("https://api.ipify.org").then((r) => r.text());
  } catch {}
  try {
    ipv6 = await fetch("https://api64.ipify.org").then((r) => r.text());
  } catch {}
  return { ipv4, ipv6 };
}

function getPrivateIPs() {
  // Browser JS cannot directly read local IPs for privacy reasons.
  // WebRTC trick: gather ICE candidates
  return new Promise((resolve) => {
    const ips = new Set();
    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.createDataChannel("");
    pc.onicecandidate = (e) => {
      if (!e.candidate) {
        resolve([...ips]);
        return;
      }
      const parts = e.candidate.candidate.split(" ");
      const ip = parts[4];
      if (ip) ips.add(ip);
    };
    pc.createOffer().then((o) => pc.setLocalDescription(o));
  });
}

async function showOverlay() {
  const box = document.createElement("div");
  box.id = "ip-overlay";
  document.body.appendChild(box);

  // Gradient options
  const gradients = {
    blue: "linear-gradient(135deg, #0078D7, #00B7C3)",
    purple: "linear-gradient(135deg, #6a11cb, #2575fc)",
    orange: "linear-gradient(135deg, #ff7e5f, #feb47b)",
    green: "linear-gradient(135deg, #11998e, #38ef7d)",
    red: "linear-gradient(135deg, #ff416c, #ff4b2b)",
    pink: "linear-gradient(135deg, #ff9a9e, #fecfef)",
    gray: "linear-gradient(135deg, #606c88, #3f4c6b)",
    lime: "linear-gradient(135deg, #a8e063, #56ab2f)",
    black: "linear-gradient(135deg, #232526, #414345)",
    white: "linear-gradient(135deg, #e0e0e0, #ffffff)",
  };

  // Load saved settings
  let currentGradient = localStorage.getItem("ipOverlayGradient") || "blue";
  let currentFontSize = localStorage.getItem("ipOverlayFontSize") || "13px";
  let currentPosition =
    localStorage.getItem("ipOverlayPosition") || "bottom-right";
  let currentOpacity = localStorage.getItem("ipOverlayOpacity") || "1";
  let showPrivate = localStorage.getItem("ipOverlayShowPrivate") !== "false";

  // Apply base styles
  Object.assign(box.style, {
    position: "fixed",
    background: gradients[currentGradient],
    color: "white",
    padding: "12px 16px 16px 16px",
    borderRadius: "12px",
    fontFamily: "Segoe UI, Roboto, sans-serif",
    fontSize: currentFontSize,
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    zIndex: "999999",
    maxWidth: "280px",
    lineHeight: "1.4",
    wordWrap: "break-word",
    overflowWrap: "break-word",
    opacity: currentOpacity,
  });

  // Positioning logic
  function applyPosition(pos) {
    box.style.top = "";
    box.style.bottom = "";
    box.style.left = "";
    box.style.right = "";
    if (pos === "bottom-right") {
      box.style.bottom = "20px";
      box.style.right = "20px";
    }
    if (pos === "bottom-left") {
      box.style.bottom = "20px";
      box.style.left = "20px";
    }
    if (pos === "top-right") {
      box.style.top = "20px";
      box.style.right = "20px";
    }
    if (pos === "top-left") {
      box.style.top = "20px";
      box.style.left = "20px";
    }
  }
  applyPosition(currentPosition);

  // Header with buttons
  const header = document.createElement("div");
  Object.assign(header.style, {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
  });

  const title = document.createElement("div");
  title.textContent = "🌐 IP Overlay";
  Object.assign(title.style, { fontWeight: "bold", fontSize: "14px" });

  const btnRow = document.createElement("div");
  Object.assign(btnRow.style, { display: "flex", gap: "8px" });

  const settingsBtn = document.createElement("div");
  settingsBtn.setAttribute("aria-label", "Settings");
  Object.assign(settingsBtn.style, {
    cursor: "pointer",
    fontSize: "16px",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
  });
  settingsBtn.style.transformOrigin = "center";

  const closeBtn = document.createElement("div");
  closeBtn.textContent = "×";
  Object.assign(closeBtn.style, {
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  });

  btnRow.appendChild(settingsBtn);
  btnRow.appendChild(closeBtn);
  header.appendChild(title);
  header.appendChild(btnRow);
  box.appendChild(header);

  // Settings popup
  const settingsPopup = document.createElement("div");
  Object.assign(settingsPopup.style, {
    position: "fixed",
    // default hidden position; when opened we'll position it relative to the main `box`
    top: "0px",
    left: "0px",
    background: "#333",
    color: "white",
    padding: "12px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    fontSize: "13px",
    fontFamily: "Segoe UI, Roboto, sans-serif",
    zIndex: "1000000",
    display: "none",
    maxWidth: "260px",
  });

  settingsPopup.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <strong style="font-size:14px;">⚙️ Settings</strong>
      <span id="settings-close" style="cursor:pointer; font-weight:bold;">×</span>
    </div>
    <div><strong>Gradient theme:</strong></div>
    ${Object.keys(gradients)
      .map(
        (g) => `
      <button style="margin:4px; padding:6px 10px; border:none; border-radius:6px;
        cursor:pointer; background:${gradients[g]}; color:white; font-size:12px;"
        data-gradient="${g}">
        ${g.charAt(0).toUpperCase() + g.slice(1)}
      </button>
    `
      )
      .join("")}
    <hr style="margin:8px 0; border:0; border-top:1px solid #555;">
    <div><strong>Font size:</strong></div>
    <input type="range" id="font-size-range" min="12" max="20" step="1" value="${parseInt(currentFontSize)}">
    <span id="font-size-label">${currentFontSize}</span>
    <hr style="margin:8px 0; border:0; border-top:1px solid #555;">
    <div><strong>Position:</strong></div>
    <select id="position-select" style="margin-top:4px; padding:4px; border-radius:6px;">
      <option value="bottom-right">Bottom Right</option>
      <option value="bottom-left">Bottom Left</option>
      <option value="top-right">Top Right</option>
      <option value="top-left">Top Left</option>
    </select>
    <hr style="margin:8px 0; border:0; border-top:1px solid #555;">
    <div><strong>Overlay opacity:</strong></div>
    <input type="range" id="opacity-range" min="0.5" max="1" step="0.1" value="${currentOpacity}">
    <hr style="margin:8px 0; border:0; border-top:1px solid #555;">
    <div><label><input type="checkbox" id="toggle-private" ${showPrivate ? "checked" : ""}> Show private IPs</label></div>
    <div style="margin-top:6px;"><label><input type="checkbox" id="auto-hide"> Auto-hide after 10s</label></div>
  `;
  document.body.appendChild(settingsPopup);

  // track whether popup should follow the box (null means user repositioned popup)
  let popupFollow = true;
  let popupOffset = { x: 0, y: 0 };

  // Button actions
  closeBtn.onclick = () => {
    settingsPopup.remove();
    box.remove();
  };
  // cog image
  const cogImgSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="3"/>
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
</svg>
`;
  // apply the SVG to the settings button
  settingsBtn.innerHTML = cogImgSVG;
  // Inject a small stylesheet for the cog spin animation and settings popup animations
  const __cogStyle = document.createElement("style");
  __cogStyle.textContent = `
    @keyframes ipoverlay-cog-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .ipoverlay-cog-spin { animation: ipoverlay-cog-spin 0.9s cubic-bezier(0.2,0.8,0.2,1) 1; transform-origin: center; }

    @keyframes ipoverlay-settings-open {
      from { opacity: 0; transform: translateY(8px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes ipoverlay-settings-close {
      from { opacity: 1; transform: translateY(0) scale(1); }
      to   { opacity: 0; transform: translateY(8px) scale(0.98); }
    }
    .ipoverlay-settings-open { animation: ipoverlay-settings-open 260ms cubic-bezier(0.2,0.8,0.2,1) forwards; }
    .ipoverlay-settings-closing { animation: ipoverlay-settings-close 220ms cubic-bezier(0.2,0.8,0.2,1) forwards; }
  `;
  document.head.appendChild(__cogStyle);

  settingsBtn.onclick = () => {
    // restart cog spin animation if already running
    if (settingsBtn.classList.contains("ipoverlay-cog-spin")) {
      settingsBtn.classList.remove("ipoverlay-cog-spin");
      void settingsBtn.offsetWidth;
    }
    settingsBtn.classList.add("ipoverlay-cog-spin");

    const onCogEnd = (e) => {
      if (e.target === settingsBtn) {
        settingsBtn.classList.remove("ipoverlay-cog-spin");
        settingsBtn.removeEventListener("animationend", onCogEnd);
      }
    };
    settingsBtn.addEventListener("animationend", onCogEnd);

    // Toggle settings popup with open/close animations
    const isHidden = window.getComputedStyle(settingsPopup).display === "none";
    if (isHidden) {
      // show
      settingsPopup.style.display = "block";
      settingsPopup.classList.remove("ipoverlay-settings-closing");
      // force reflow then add open class
      void settingsPopup.offsetWidth;
      // compute position next to `box`
      try {
        const rect = box.getBoundingClientRect();
        // default try to position to the right of the box
        const popupWidth = settingsPopup.offsetWidth || 260;
        const popupHeight = settingsPopup.offsetHeight || 200;
        let left = rect.right + 8;
        let top = rect.top;
        // if not enough space on the right, place to the left
        if (left + popupWidth > window.innerWidth - 8) {
          left = rect.left - popupWidth - 8;
        }
        // ensure popup stays within viewport vertically
        if (top + popupHeight > window.innerHeight - 8) {
          top = Math.max(8, window.innerHeight - popupHeight - 8);
        }
        settingsPopup.style.left = Math.max(8, left) + "px";
        settingsPopup.style.top = Math.max(8, top) + "px";
        // compute follow offset (relative to box.left/top)
        popupOffset.x = parseFloat(settingsPopup.style.left) - rect.left;
        popupOffset.y = parseFloat(settingsPopup.style.top) - rect.top;
        popupFollow = true;
      } catch (e) {
        // ignore positioning errors and just open at current coords
      }
      settingsPopup.classList.add("ipoverlay-settings-open");
    } else {
      // close
      settingsPopup.classList.remove("ipoverlay-settings-open");
      settingsPopup.classList.add("ipoverlay-settings-closing");
      const onEnd = (ev) => {
        if (ev.target === settingsPopup) {
          settingsPopup.style.display = "none";
          settingsPopup.classList.remove("ipoverlay-settings-closing");
          settingsPopup.removeEventListener("animationend", onEnd);
        }
      };
      settingsPopup.addEventListener("animationend", onEnd);
    }
  };
  settingsPopup.querySelector("#settings-close").onclick = () => {
    // trigger the closing animation (same as the button toggle close path)
    settingsPopup.classList.remove("ipoverlay-settings-open");
    settingsPopup.classList.add("ipoverlay-settings-closing");
    const onEndClose = (ev) => {
      if (ev.target === settingsPopup) {
        settingsPopup.style.display = "none";
        settingsPopup.classList.remove("ipoverlay-settings-closing");
        settingsPopup.removeEventListener("animationend", onEndClose);
      }
    };
    settingsPopup.addEventListener("animationend", onEndClose);
  };

  // Make settings popup draggable by its header (the first child div)
  (function makePopupDraggable() {
    const dragHandle = settingsPopup.querySelector("div");
    if (!dragHandle) return;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    dragHandle.style.cursor = "move";

    dragHandle.onmousedown = (ev) => {
      dragging = true;
      // when user manually drags popup, stop following the box
      popupFollow = false;
      startX = ev.clientX;
      startY = ev.clientY;
      startLeft =
        parseFloat(settingsPopup.style.left) ||
        settingsPopup.getBoundingClientRect().left;
      startTop =
        parseFloat(settingsPopup.style.top) ||
        settingsPopup.getBoundingClientRect().top;

      document.onmousemove = (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        settingsPopup.style.left = startLeft + dx + "px";
        settingsPopup.style.top = startTop + dy + "px";
        settingsPopup.style.right = "";
        settingsPopup.style.bottom = "";
      };

      document.onmouseup = () => {
        dragging = false;
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  })();

  // Gradient buttons
  settingsPopup.querySelectorAll("button[data-gradient]").forEach((btn) => {
    btn.onclick = () => {
      const selected = btn.getAttribute("data-gradient");
      localStorage.setItem("ipOverlayGradient", selected);
      box.style.background = gradients[selected];
    };
  });

  // Font size slider
  const fontRange = settingsPopup.querySelector("#font-size-range");
  const fontLabel = settingsPopup.querySelector("#font-size-label");
  fontRange.oninput = () => {
    currentFontSize = fontRange.value + "px";
    fontLabel.textContent = currentFontSize;
    localStorage.setItem("ipOverlayFontSize", currentFontSize);
    box.style.fontSize = currentFontSize;
  };

  // Position select
  const positionSelect = settingsPopup.querySelector("#position-select");
  positionSelect.value = currentPosition;
  positionSelect.onchange = () => {
    currentPosition = positionSelect.value;
    localStorage.setItem("ipOverlayPosition", currentPosition);
    applyPosition(currentPosition);
  };

  function makeCopyButton(ip) {
    const btn = document.createElement("button");
    Object.assign(btn.style, {
      marginLeft: "6px",
      cursor: "pointer",
      border: "none",
      background: "transparent",
      padding: "0",
      verticalAlign: "middle",
    });
    const icon = document.createElement("div");
    icon.innerHTML = clipboardSVG;
    // smoother, slightly slower opacity + subtle scale for a nicer effect
    icon.style.transition =
      "opacity 0.45s ease-in-out, transform 0.35s cubic-bezier(0.2,0.8,0.2,1)";
    icon.style.opacity = "1";
    icon.style.transform = "scale(1)";
    btn.appendChild(icon);

    // On click, copy IP and briefly show a checkmark icon with fade animation
    btn.onclick = () => {
      // attempt to write to clipboard
      try {
        navigator.clipboard.writeText(ip);
      } catch (e) {
        // ignore clipboard errors silently
      }

      // clear any previous animation timers to avoid overlap
      if (btn._animTimers) {
        btn._animTimers.forEach((t) => clearTimeout(t));
      }
      btn._animTimers = [];

      // start animation: shrink + fade out
      icon.style.transform = "scale(0.92)";
      icon.style.opacity = "0";

      // timings chosen to feel smooth and spread out
      const fadeOutDelay = 260; // wait for fade-out
      const holdDuration = 450; // how long the checkmark stays visible
      const swapDelay = 260; // small delay when swapping back

      const t1 = setTimeout(() => {
        // swap to checkmark and pop back to full scale
        icon.innerHTML = checkSVG;
        void icon.offsetWidth; // force reflow
        icon.style.transform = "scale(1)";
        icon.style.opacity = "1";

        const t2 = setTimeout(() => {
          // fade/scale out the checkmark
          icon.style.transform = "scale(0.92)";
          icon.style.opacity = "0";

          const t3 = setTimeout(() => {
            // swap back to clipboard icon and return to full opacity/scale
            icon.innerHTML = clipboardSVG;
            void icon.offsetWidth;
            icon.style.transform = "scale(1)";
            icon.style.opacity = "1";
          }, swapDelay);
          btn._animTimers.push(t3);
        }, holdDuration);
        btn._animTimers.push(t2);
      }, fadeOutDelay);

      btn._animTimers.push(t1);
    };

    return btn;
  }

  const clipboardSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="4" y="4" width="16" height="18" rx="2" ry="2"/>
  <path d="M9 2h6v4H9z"/>
  <line x1="8" y1="10" x2="16" y2="10"/>
  <line x1="8" y1="14" x2="16" y2="14"/>
  <line x1="8" y1="18" x2="16" y2="18"/>
</svg>`;

  const checkSVG = `
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline 
  points="5 13 10 18 19 7"/>
</svg>`;

  // Make overlay draggable
  header.style.cursor = "move";

  let isDragging = false;
  let offsetX, offsetY;

  header.onmousedown = (e) => {
    isDragging = true;
    offsetX = e.clientX - box.offsetLeft;
    offsetY = e.clientY - box.offsetTop;
    document.onmousemove = (e) => {
      if (isDragging) {
        box.style.left = e.clientX - offsetX + "px";
        box.style.top = e.clientY - offsetY + "px";
        box.style.right = "";
        box.style.bottom = "";
        // if popup is open and following, move it by the same delta using stored offset
        if (
          window.getComputedStyle(settingsPopup).display !== "none" &&
          popupFollow
        ) {
          const rect = box.getBoundingClientRect();
          settingsPopup.style.left = rect.left + popupOffset.x + "px";
          settingsPopup.style.top = rect.top + popupOffset.y + "px";
          // clear any bottom/right values
          settingsPopup.style.right = "";
          settingsPopup.style.bottom = "";
        }
      }
    };
    document.onmouseup = () => {
      isDragging = false;
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };

  // Opacity control
  const opacityRange = settingsPopup.querySelector("#opacity-range");
  opacityRange.oninput = () => {
    currentOpacity = opacityRange.value;
    localStorage.setItem("ipOverlayOpacity", currentOpacity);
    box.style.opacity = currentOpacity;
  };

  // Private IP toggle
  const togglePrivate = settingsPopup.querySelector("#toggle-private");
  togglePrivate.onchange = () => {
    showPrivate = togglePrivate.checked;
    localStorage.setItem("ipOverlayShowPrivate", showPrivate);
    renderContent();
  };
  // Content container
  const content = document.createElement("div");
  box.appendChild(content);

  // Function to render IPs
  async function renderContent() {
    const pub = await getPublicIPs();
    const priv = await getPrivateIPs();
    const privIPv4 = priv.filter((ip) => ip && ip.includes("."));
    const privIPv6 = priv.filter((ip) => ip && ip.includes(":"));

    content.innerHTML = `
      <div><strong>Public IPv4:</strong><br><code>${pub.ipv4 || "N/A"}</code></div>
      <div><strong>Public IPv6:</strong><br><code style="word-break:break-word;">${pub.ipv6 || "N/A"}</code></div>
      <hr style="border:0; border-top:1px solid rgba(255,255,255,0.3); margin:8px 0;">
      ${
        showPrivate
          ? `
        <div><strong>Private IPv4:</strong></div>
        ${privIPv4.map((ip) => `<div style="margin-left:8px;"><code>${ip}</code></div>`).join("")}
        <div style="margin-top:6px;"><strong>Private IPv6:</strong></div>
        ${privIPv6.map((ip) => `<div style="margin-left:8px;"><code style="word-break:break-word;">${ip}</code></div>`).join("")}
      `
          : `<div style="opacity:0.7;">Private IPs hidden</div>`
      }
    `;
    // Add copy buttons
    const codeElements = content.querySelectorAll("code");
    codeElements.forEach((codeEl) => {
      const ipText = codeEl.textContent;
      codeEl.parentElement.appendChild(makeCopyButton(ipText));
    });
  }

  // Initial render
  renderContent();

  // Load saved auto-hide setting
  let autoHideEnabled = localStorage.getItem("ipOverlayAutoHide") === "true";
  let autoHideTimer = null;

  // Auto-hide checkbox
  const autoHide = settingsPopup.querySelector("#auto-hide");
  autoHide.checked = autoHideEnabled;

  autoHide.onchange = () => {
    autoHideEnabled = autoHide.checked;
    localStorage.setItem("ipOverlayAutoHide", autoHideEnabled);

    // Clear any existing timer
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      autoHideTimer = null;
    }

    // Start a new timer only if enabled
    if (autoHideEnabled) {
      autoHideTimer = setTimeout(() => {
        if (document.body.contains(box)) {
          box.remove();
          settingsPopup.remove();
        }
      }, 10000);
    }
  };

  // If auto-hide was already enabled, start the timer immediately
  if (autoHideEnabled) {
    autoHideTimer = setTimeout(() => {
      if (document.body.contains(box)) {
        box.remove();
        settingsPopup.remove();
      }
    }, 10000);
  }
}
showOverlay();
