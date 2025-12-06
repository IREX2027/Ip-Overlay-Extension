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
  };
  let currentGradient = localStorage.getItem("ipOverlayGradient") || "blue";
  let currentFontSize = localStorage.getItem("ipOverlayFontSize") || "13px";
  let currentPosition =
    localStorage.getItem("ipOverlayPosition") || "bottom-right";

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
  settingsBtn.textContent = "⚙️";
  Object.assign(settingsBtn.style, { cursor: "pointer", fontSize: "16px" });

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

  closeBtn.onclick = () => {
    settingsPopup.remove();
    box.remove();
  };

  // Settings popup
  // Settings popup container
  const settingsPopup = document.createElement("div");
  Object.assign(settingsPopup.style, {
    position: "fixed",
    bottom: "80px",
    right: "20px",
    background: "rgba(40,40,40,0.95)",
    color: "white",
    padding: "16px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
    fontSize: "14px",
    fontFamily: "Segoe UI, Roboto, sans-serif",
    zIndex: "1000000",
    display: "none",
    width: "280px",
    transition: "opacity 0.3s ease",
  });

  // Header with close button
  const spHeader = document.createElement("div");
  Object.assign(spHeader.style, {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    borderBottom: "1px solid #555",
    paddingBottom: "6px",
  });
  const spTitle = document.createElement("strong");
  spTitle.textContent = "⚙️ Settings";
  const spClose = document.createElement("span");
  spClose.textContent = "×";
  Object.assign(spClose.style, {
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "18px",
  });
  spHeader.appendChild(spTitle);
  spHeader.appendChild(spClose);
  settingsPopup.appendChild(spHeader);

  // Appearance section
  const appearanceSection = document.createElement("div");
  appearanceSection.innerHTML = `
  <div style="margin-top:8px; font-weight:bold;">Appearance</div>
  <label style="display:block; margin-top:6px;">Gradient:
    <select id="gradient-select" style="margin-left:6px; padding:4px; border-radius:6px; background:#222; color:white;">
      <option value="blue">Blue</option>
      <option value="purple">Purple</option>
      <option value="orange">Orange</option>
      <option value="green">Green</option>
      <option value="red">Red</option>
    </select>
  </label>
  <label style="display:block; margin-top:6px;">Font size:
    <select id="font-size-select" style="margin-left:6px; padding:4px; border-radius:6px; background:#222; color:white;">
      <option value="12px">Small</option>
      <option value="13px">Default</option>
      <option value="15px">Large</option>
      <option value="18px">Extra Large</option>
    </select>
  </label>
  <label style="display:block; margin-top:6px;">Opacity:
    <input type="range" id="opacity-range" min="0.5" max="1" step="0.05" value="1" style="width:100%;">
  </label>
`;
  settingsPopup.appendChild(appearanceSection);

  // Behavior section
  const behaviorSection = document.createElement("div");
  behaviorSection.innerHTML = `
  <div style="margin-top:12px; font-weight:bold;">Behavior</div>
  <label style="display:block; margin-top:6px;">Position:
    <select id="position-select" style="margin-left:6px; padding:4px; border-radius:6px; background:#222; color:white;">
      <option value="bottom-right">Bottom Right</option>
      <option value="bottom-left">Bottom Left</option>
      <option value="top-right">Top Right</option>
      <option value="top-left">Top Left</option>
    </select>
  </label>
  <label style="display:block; margin-top:6px;">Auto-refresh:
    <select id="refresh-select" style="margin-left:6px; padding:4px; border-radius:6px; background:#222; color:white;">
      <option value="0">Off</option>
      <option value="5000">Every 5s</option>
      <option value="10000">Every 10s</option>
      <option value="30000">Every 30s</option>
    </select>
  </label>
`;
  settingsPopup.appendChild(behaviorSection);

  // Wire up close
  spClose.onclick = () => {
    settingsPopup.style.display = "none";
  };

  // Toggle popup from settings button
  settingsBtn.onclick = () => {
    settingsPopup.style.display =
      settingsPopup.style.display === "none" ? "block" : "none";
  };
  document.body.appendChild(settingsPopup);
  // Content container
  const content = document.createElement("div");
  box.appendChild(content);

  // Fetch and render IPs
  const pub = await getPublicIPs();
  const priv = await getPrivateIPs();
  const privIPv4 = priv.filter((ip) => ip && ip.includes("."));
  const privIPv6 = priv.filter((ip) => ip && ip.includes(":"));

  content.innerHTML = `
    <div><strong>Public IPv4:</strong><br><code>${pub.ipv4 || "N/A"}</code></div>
    <div><strong>Public IPv6:</strong><br><code style="word-break:break-word;">${pub.ipv6 || "N/A"}</code></div>
    <hr style="border:0; border-top:1px solid rgba(255,255,255,0.3); margin:8px 0;">
    <div><strong>Private IPv4:</strong></div>
    ${privIPv4.map((ip) => `<div style="margin-left:8px;"><code>${ip}</code></div>`).join("")}
    <div style="margin-top:6px;"><strong>Private IPv6:</strong></div>
    ${privIPv6.map((ip) => `<div style="margin-left:8px;"><code style="word-break:break-word;">${ip}</code></div>`).join("")}
  `;
}
showOverlay();
