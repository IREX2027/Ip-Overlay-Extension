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
  title.textContent = "🌐 Safe IP Overlay";

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
  content.textContent = "Loading IPs…";
  box.appendChild(content);

  document.body.appendChild(box);

  // Settings popup
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
    maxWidth: "240px",
  });

  const spHeader = document.createElement("div");
  Object.assign(spHeader.style, {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  });
  const spTitle = document.createElement("strong");
  spTitle.textContent = "Settings";
  const spClose = document.createElement("button");
  spClose.textContent = "×";
  Object.assign(spClose.style, {
    cursor: "pointer",
    fontWeight: "bold",
    background: "transparent",
    border: "none",
    color: "inherit",
    fontSize: "16px",
  });
  spHeader.appendChild(spTitle);
  spHeader.appendChild(spClose);
  settingsPopup.appendChild(spHeader);

  // Theme selector (including White)
  const themeLabel = document.createElement("div");
  themeLabel.textContent = "Theme:";
  themeLabel.style.fontWeight = "bold";
  const themeSelect = document.createElement("select");
  ["dark", "white"].forEach((theme) => {
    const opt = document.createElement("option");
    opt.value = theme;
    opt.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    themeSelect.appendChild(opt);
  });
  themeSelect.value = "dark";
  themeSelect.addEventListener("change", () => {
    if (themeSelect.value === "white") {
      box.style.background = "#fff";
      box.style.color = "#000";
    } else {
      box.style.background = "#333";
      box.style.color = "#fff";
    }
  });
  settingsPopup.appendChild(themeLabel);
  settingsPopup.appendChild(themeSelect);

  // Font size
  const fontLabel = document.createElement("div");
  fontLabel.textContent = "Font size:";
  fontLabel.style.fontWeight = "bold";
  const fontSelect = document.createElement("select");
  ["12px", "13px", "15px", "18px"].forEach((size) => {
    const opt = document.createElement("option");
    opt.value = size;
    opt.textContent = size;
    fontSelect.appendChild(opt);
  });
  fontSelect.value = "13px";
  fontSelect.addEventListener("change", () => {
    box.style.fontSize = fontSelect.value;
  });
  settingsPopup.appendChild(fontLabel);
  settingsPopup.appendChild(fontSelect);

  // Opacity
  const opacityLabel = document.createElement("div");
  opacityLabel.textContent = "Opacity:";
  opacityLabel.style.fontWeight = "bold";
  const opacityRange = document.createElement("input");
  opacityRange.type = "range";
  opacityRange.min = "0.5";
  opacityRange.max = "1";
  opacityRange.step = "0.05";
  opacityRange.value = "1";
  opacityRange.style.width = "100%";
  opacityRange.addEventListener("input", () => {
    box.style.opacity = opacityRange.value;
  });
  settingsPopup.appendChild(opacityLabel);
  settingsPopup.appendChild(opacityRange);

  document.body.appendChild(settingsPopup);

  // Button wiring
  settingsBtn.addEventListener("click", () => {
    settingsPopup.style.display =
      settingsPopup.style.display === "none" ? "block" : "none";
  });
  spClose.addEventListener("click", () => {
    settingsPopup.style.display = "none";
  });
  closeBtn.addEventListener("click", () => {
    settingsPopup.remove();
    box.remove();
  });

  // Fetch public IPs
  async function getPublicIPs() {
    const result = { ipv4: null, ipv6: null };
    try {
      const r4 = await fetch("https://api.ipify.org");
      result.ipv4 = await r4.text();
    } catch {}
    try {
      const r6 = await fetch("https://api64.ipify.org");
      result.ipv6 = await r6.text();
    } catch {}
    return result;
  }

  const pub = await getPublicIPs();
  content.innerHTML = `
    <div><strong>Public IPv4:</strong> ${pub.ipv4 || "N/A"}</div>
    <div><strong>Public IPv6:</strong> ${pub.ipv6 || "N/A"}</div>
  `;
})();
