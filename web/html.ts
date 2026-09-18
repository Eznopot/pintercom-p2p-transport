export function renderDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no">
  <title>Intercom Monitor</title>
  <meta name="theme-color" content="#0d0f12">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="manifest" href="/manifest.json">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

  <style>
    :root {
      --m3-bg: #0d0f12;
      --m3-surface: #13161b;
      --m3-surface-container: #1a1e26;
      --m3-surface-container-high: #222732;
      --m3-surface-container-highest: #2b3240;
      
      --m3-outline: rgba(255, 255, 255, 0.08);
      --m3-outline-focus: rgba(168, 199, 250, 0.4);
      --m3-outline-variant: rgba(255, 255, 255, 0.04);
      
      --m3-on-surface: #e3e6ed;
      --m3-on-surface-variant: #9aa1b0;
      --m3-on-surface-dim: #606775;
      
      --m3-primary: #a8c7fa;
      --m3-primary-container: rgba(168, 199, 250, 0.12);
      
      --status-idle-dot: #6dd38c;
      --status-idle-bg: rgba(109, 211, 140, 0.08);
      --status-idle-text: #96e4ac;
      --status-idle-border: rgba(109, 211, 140, 0.18);
      
      --status-busy-dot: #ffb77c;
      --status-busy-bg: rgba(255, 183, 124, 0.08);
      --status-busy-text: #ffd0a8;
      --status-busy-border: rgba(255, 183, 124, 0.2);
      
      --status-thinking-dot: #cfbcff;
      --status-thinking-bg: rgba(207, 188, 255, 0.08);
      --status-thinking-text: #e1d5ff;
      --status-thinking-border: rgba(207, 188, 255, 0.2);
      
      --radius-sm: 8px;
      --radius-md: 14px;
      --radius-lg: 20px;
      --radius-full: 9999px;
      
      --ease-m3: cubic-bezier(0.2, 0, 0, 1);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      background-color: var(--m3-bg);
      color: var(--m3-on-surface);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(32px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
      max-width: 680px;
      margin: 0 auto;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    /* Top App Bar */
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0 20px 0;
    }

    .brand {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .brand-title {
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--m3-on-surface);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .live-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 2px 8px;
      background: var(--status-idle-bg);
      border: 1px solid var(--status-idle-border);
      border-radius: var(--radius-full);
      font-size: 0.68rem;
      font-weight: 600;
      color: var(--status-idle-text);
      letter-spacing: 0.02em;
    }

    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--status-idle-dot);
      box-shadow: 0 0 8px var(--status-idle-dot);
    }

    .live-dot.reconnecting {
      background-color: #ff897d;
      box-shadow: 0 0 8px #ff897d;
      animation: pulse 1s infinite;
    }

    .brand-sub {
      font-size: 0.75rem;
      color: var(--m3-on-surface-dim);
    }

    /* Action Buttons */
    .icon-btn {
      background: var(--m3-surface-container);
      border: 1px solid var(--m3-outline);
      color: var(--m3-on-surface-variant);
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s var(--ease-m3);
    }

    .icon-btn:active {
      transform: scale(0.94);
      background: var(--m3-surface-container-high);
    }

    .icon-btn.active {
      background: var(--m3-primary-container);
      border-color: rgba(168, 199, 250, 0.3);
      color: var(--m3-primary);
    }

    .icon-btn svg {
      width: 18px;
      height: 18px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    /* Quick Filter Chips */
    .filter-container {
      display: flex;
      gap: 8px;
      margin-bottom: 14px;
      overflow-x: auto;
      scrollbar-width: none;
      padding-bottom: 2px;
    }
    .filter-container::-webkit-scrollbar { display: none; }

    .chip {
      background: var(--m3-surface);
      border: 1px solid var(--m3-outline);
      border-radius: var(--radius-full);
      padding: 6px 14px;
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--m3-on-surface-variant);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      transition: all 0.2s var(--ease-m3);
    }

    .chip .chip-count {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem;
      opacity: 0.8;
      background: rgba(255, 255, 255, 0.07);
      padding: 1px 6px;
      border-radius: 10px;
    }

    .chip.active {
      background: var(--m3-surface-container-highest);
      border-color: rgba(168, 199, 250, 0.4);
      color: var(--m3-primary);
    }

    .chip.active .chip-count {
      background: rgba(168, 199, 250, 0.18);
      color: var(--m3-primary);
    }

    /* M3 Search Bar */
    .search-wrap {
      position: relative;
      margin-bottom: 18px;
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      stroke: var(--m3-on-surface-dim);
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      background: var(--m3-surface);
      border: 1px solid var(--m3-outline);
      color: var(--m3-on-surface);
      padding: 11px 16px 11px 40px;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      font-family: inherit;
      outline: none;
      transition: all 0.2s var(--ease-m3);
    }

    .search-input::placeholder {
      color: var(--m3-on-surface-dim);
    }

    .search-input:focus {
      background: var(--m3-surface-container);
      border-color: var(--m3-outline-focus);
      box-shadow: 0 0 0 2px rgba(168, 199, 250, 0.08);
    }

    /* Agent Cards */
    .agent-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .card {
      background: var(--m3-surface);
      border: 1px solid var(--m3-outline);
      border-radius: var(--radius-lg);
      padding: 16px;
      position: relative;
      transition: transform 0.2s var(--ease-m3), border-color 0.2s var(--ease-m3), background 0.2s;
    }

    .card:active {
      transform: scale(0.995);
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
    }

    .agent-name-group {
      min-width: 0;
    }

    .agent-name {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--m3-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: -0.01em;
    }

    .agent-meta-sub {
      font-size: 0.72rem;
      color: var(--m3-on-surface-dim);
      margin-top: 1px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .agent-meta-sub span {
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .status-badge .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .status-idle {
      background: var(--status-idle-bg);
      color: var(--status-idle-text);
      border: 1px solid var(--status-idle-border);
    }
    .status-idle .dot {
      background: var(--status-idle-dot);
    }

    .status-busy {
      background: var(--status-busy-bg);
      color: var(--status-busy-text);
      border: 1px solid var(--status-busy-border);
    }
    .status-busy .dot {
      background: var(--status-busy-dot);
      animation: pulse 1.2s infinite;
    }

    .status-thinking {
      background: var(--status-thinking-bg);
      color: var(--status-thinking-text);
      border: 1px solid var(--status-thinking-border);
    }
    .status-thinking .dot {
      background: var(--status-thinking-dot);
      animation: pulse 1.2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    /* Details Grid */
    .details-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
      background: var(--m3-surface-container);
      border-radius: var(--radius-sm);
      padding: 10px 12px;
      font-size: 0.78rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--m3-on-surface-variant);
      min-width: 0;
    }

    .detail-item svg {
      width: 14px;
      height: 14px;
      stroke: var(--m3-on-surface-dim);
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      flex-shrink: 0;
    }

    .detail-value {
      color: var(--m3-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.74rem;
    }

    .model-tag {
      font-size: 0.72rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--m3-outline);
      color: var(--m3-primary);
      padding: 1px 7px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    /* M3 Linear Progress for Context */
    .context-section {
      margin-top: 10px;
    }

    .context-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: var(--m3-on-surface-dim);
      margin-bottom: 5px;
      font-family: 'JetBrains Mono', monospace;
    }

    .progress-track {
      height: 4px;
      background: var(--m3-surface-container-highest);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-indicator {
      height: 100%;
      background: var(--m3-primary);
      border-radius: 2px;
      transition: width 0.3s var(--ease-m3);
    }

    .progress-indicator.warn {
      background: #ffb77c;
    }

    .progress-indicator.crit {
      background: #ff897d;
    }

    /* Card Footer */
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid var(--m3-outline-variant);
      font-size: 0.7rem;
      color: var(--m3-on-surface-dim);
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: var(--m3-on-surface-dim);
    }

    .empty-icon {
      width: 44px;
      height: 44px;
      margin: 0 auto 12px;
      stroke: var(--m3-outline);
      stroke-width: 1.5;
      fill: none;
    }

    .empty-text {
      font-size: 0.85rem;
      font-weight: 500;
    }

    .banner-offline {
      background: rgba(255, 137, 125, 0.1);
      border: 1px solid rgba(255, 137, 125, 0.25);
      color: #ff897d;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      font-size: 0.75rem;
      margin-bottom: 16px;
      display: none;
      align-items: center;
      gap: 8px;
    }
  </style>
</head>
<body>

  <header>
    <div class="brand">
      <div class="brand-title">
        Intercom
        <div class="live-chip">
          <div class="live-dot" id="live-dot"></div>
          <span id="live-text">En direct</span>
        </div>
      </div>
      <div class="brand-sub">Réseau local P2P</div>
    </div>

    <button class="icon-btn" id="notif-btn" onclick="toggleNotifications()" aria-label="Activer les alertes">
      <svg viewBox="0 0 24 24" id="notif-icon">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
    </button>
  </header>

  <div class="banner-offline" id="disconn-banner">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
    <span>Connexion au flux interrompue. Reconnexion automatique...</span>
  </div>

  <div class="filter-container">
    <div class="chip active" data-filter="all" onclick="setFilter('all')">
      Tous <span class="chip-count" id="count-all">0</span>
    </div>
    <div class="chip" data-filter="busy" onclick="setFilter('busy')">
      En cours <span class="chip-count" id="count-busy">0</span>
    </div>
    <div class="chip" data-filter="idle" onclick="setFilter('idle')">
      En attente <span class="chip-count" id="count-idle">0</span>
    </div>
  </div>

  <div class="search-wrap">
    <svg class="search-icon" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
    <input type="text" class="search-input" id="search-input" placeholder="Rechercher par nom, machine, dossier, modèle..." oninput="renderAgents()">
  </div>

  <main class="agent-grid" id="agent-grid">
    <div class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24">
        <path d="M2 12h20M12 2v20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"></path>
      </svg>
      <div class="empty-text">Découverte des pairs mDNS...</div>
    </div>
  </main>

  <script>
    let sessions = [];
    let currentFilter = 'all';
    let prevStatusMap = new Map();
    let notificationsEnabled = (typeof Notification !== 'undefined' && Notification.permission === 'granted');

    function updateNotifButton() {
      const btn = document.getElementById('notif-btn');
      if (notificationsEnabled) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
    updateNotifButton();

    async function toggleNotifications() {
      if (typeof Notification === 'undefined') {
        alert("Les notifications Web ne sont pas prises en charge sur ce navigateur.");
        return;
      }
      if (Notification.permission === 'granted') {
        notificationsEnabled = !notificationsEnabled;
        updateNotifButton();
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        notificationsEnabled = true;
        updateNotifButton();
        notifyUser("Notifications activées", "Vous serez notifié des changements d'état des agents.");
      }
    }

    function playAlertChime() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.22);
      } catch (e) {}
    }

    function notifyUser(title, body) {
      if (notificationsEnabled && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body: body,
            icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220%200%20100%20100%22><circle cx=%2250%22 cy=%2250%22 r=%2240%22 fill=%22%23a8c7fa%22/></svg>"
          });
          playAlertChime();
        } catch (e) {}
      }
    }

    function timeAgo(ts) {
      if (!ts) return "inconnu";
      const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
      if (s < 60) return s + "s";
      const m = Math.floor(s / 60);
      if (m < 60) return m + "m";
      const h = Math.floor(m / 60);
      return h + "h " + (m % 60) + "m";
    }

    function formatTokens(count) {
      if (count === undefined || count === null) return "?";
      if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
      if (count >= 1000) return (count / 1000).toFixed(0) + "k";
      return count.toString();
    }

    function setFilter(filter) {
      currentFilter = filter;
      document.querySelectorAll('.chip').forEach(c => {
        c.classList.toggle('active', c.dataset.filter === filter);
      });
      renderAgents();
    }

    function checkStatusChanges(newSessions) {
      const nextMap = new Map();
      for (const s of newSessions) {
        const id = s.id;
        const currentSt = s.status || "idle";
        const name = s.name || id.slice(0, 8);
        if (prevStatusMap.has(id)) {
          const oldSt = prevStatusMap.get(id);
          if (oldSt !== currentSt) {
            if ((oldSt.startsWith("tool:") || oldSt === "thinking") && currentSt === "idle") {
              notifyUser(name + " · terminé", "L'agent est de nouveau disponible.");
            } else if (currentSt.startsWith("tool:")) {
              const tool = currentSt.replace("tool:", "");
              notifyUser(name + " · exécution", "Outil en cours : " + tool);
            }
          }
        }
        nextMap.set(id, currentSt);
      }
      prevStatusMap = nextMap;
    }

    function renderAgents() {
      const query = document.getElementById('search-input').value.toLowerCase().trim();
      const container = document.getElementById('agent-grid');

      // Update counters
      let busyCount = 0;
      let idleCount = 0;
      sessions.forEach(s => {
        const st = s.status || "idle";
        if (st === "thinking" || st.startsWith("tool:")) busyCount++;
        else idleCount++;
      });
      document.getElementById('count-all').textContent = sessions.length;
      document.getElementById('count-busy').textContent = busyCount;
      document.getElementById('count-idle').textContent = idleCount;

      const filtered = sessions.filter(s => {
        const st = s.status || "idle";
        const isBusy = st === "thinking" || st.startsWith("tool:");
        if (currentFilter === 'busy' && !isBusy) return false;
        if (currentFilter === 'idle' && isBusy) return false;

        if (!query) return true;
        const name = (s.name || '').toLowerCase();
        const host = (s.hostname || '').toLowerCase();
        const cwd = (s.cwd || '').toLowerCase();
        const model = (s.model || '').toLowerCase();
        const status = (s.status || '').toLowerCase();
        return name.includes(query) || host.includes(query) || cwd.includes(query) || model.includes(query) || status.includes(query);
      });

      if (filtered.length === 0) {
        container.innerHTML = \`
          <div class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <div class="empty-text">\${query ? 'Aucun agent ne correspond au filtre' : 'Aucun agent connecté'}</div>
          </div>\`;
        return;
      }

      container.innerHTML = filtered.map(s => {
        const st = s.status || "idle";
        let badgeClass = "status-idle";
        let badgeLabel = "En attente";
        
        if (st === "thinking") {
          badgeClass = "status-thinking";
          badgeLabel = "Réflexion";
        } else if (st.startsWith("tool:")) {
          badgeClass = "status-busy";
          badgeLabel = st.replace("tool:", "");
        }

        const name = s.name || ("session-" + s.id.slice(0, 8));
        const host = s.hostname || "local";
        const cwd = s.cwd || "~";
        const model = s.model || "";
        const pct = (typeof s.contextPct === 'number') ? s.contextPct : null;
        let progClass = "";
        if (pct !== null && pct > 80) progClass = "crit";
        else if (pct !== null && pct > 55) progClass = "warn";

        return \`
          <article class="card">
            <div class="card-top">
              <div class="agent-name-group">
                <div class="agent-name">\${name}</div>
                <div class="agent-meta-sub">
                  <span>\${host}</span>
                  <span>·</span>
                  <span>PID \${s.pid || '?'}</span>
                </div>
              </div>
              <div class="status-badge \${badgeClass}">
                <span class="dot"></span>
                <span>\${badgeLabel}</span>
              </div>
            </div>

            <div class="details-row">
              <div class="detail-item">
                <svg viewBox="0 0 24 24">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                <span class="detail-value" title="\${cwd}">\${cwd}</span>
              </div>
              \${model ? \`
                <div class="detail-item">
                  <svg viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                    <rect x="9" y="9" width="6" height="6"></rect>
                    <line x1="9" y1="1" x2="9" y2="4"></line>
                    <line x1="15" y1="1" x2="15" y2="4"></line>
                    <line x1="9" y1="20" x2="9" y2="23"></line>
                    <line x1="15" y1="20" x2="15" y2="23"></line>
                    <line x1="20" y1="9" x2="23" y2="9"></line>
                    <line x1="20" y1="14" x2="23" y2="14"></line>
                    <line x1="1" y1="9" x2="4" y2="9"></line>
                    <line x1="1" y1="14" x2="4" y2="14"></line>
                  </svg>
                  <span class="model-tag">\${model}</span>
                </div>
              \` : ''}
            </div>

            \${pct !== null ? \`
              <div class="context-section">
                <div class="context-meta">
                  <span>Contexte</span>
                  <span>\${pct}% (\${formatTokens(s.contextTokens)} / \${formatTokens(s.contextWindow)})</span>
                </div>
                <div class="progress-track">
                  <div class="progress-indicator \${progClass}" style="width: \${Math.min(100, Math.max(0, pct))}%"></div>
                </div>
              </div>
            \` : ''}

            <div class="card-footer">
              <span>Activité: il y a \${timeAgo(s.lastActivity)}</span>
              <span>Démarré: il y a \${timeAgo(s.startedAt)}</span>
            </div>
          </article>
        \`;
      }).join('');
    }

    let eventSource = null;
    function connectSSE() {
      if (eventSource) eventSource.close();
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        document.getElementById('disconn-banner').style.display = 'none';
        document.getElementById('live-dot').className = 'live-dot';
        document.getElementById('live-text').textContent = 'En direct';
      };

      eventSource.onerror = () => {
        document.getElementById('disconn-banner').style.display = 'flex';
        document.getElementById('live-dot').className = 'live-dot reconnecting';
        document.getElementById('live-text').textContent = 'Reconnexion...';
      };

      eventSource.addEventListener('sessions', (e) => {
        try {
          const data = JSON.parse(e.data);
          sessions = data;
          checkStatusChanges(sessions);
          renderAgents();
        } catch (err) {
          console.error("SSE JSON parse error", err);
        }
      });
    }

    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        sessions = data;
        checkStatusChanges(sessions);
        renderAgents();
      })
      .catch(console.error);

    connectSSE();
    setInterval(renderAgents, 5000);
  </script>
</body>
</html>`;
}
