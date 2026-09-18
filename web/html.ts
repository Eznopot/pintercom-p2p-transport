export function renderDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Pi Intercom Monitor</title>
  <meta name="theme-color" content="#1e1e2e">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="manifest" href="/manifest.json">
  <style>
    :root {
      --bg: #11111b;
      --card-bg: #181825;
      --card-border: #313244;
      --text: #cdd6f4;
      --text-muted: #a6adc8;
      --accent: #89b4fa;
      --green: #a6e3a1;
      --yellow: #f9e2af;
      --peach: #fab387;
      --red: #f38ba8;
      --mauve: #cba6f7;
      --surface: #313244;
      --radius: 12px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 16px;
      padding-bottom: 40px;
      -webkit-font-smoothing: antialiased;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--card-border);
    }
    .logo-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-icon {
      font-size: 24px;
      background: var(--surface);
      padding: 6px 10px;
      border-radius: 8px;
    }
    h1 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--accent);
    }
    .subtitle {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .btn {
      background: var(--surface);
      border: 1px solid var(--card-border);
      color: var(--text);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn:hover, .btn:active {
      background: #45475a;
    }
    .btn.active {
      border-color: var(--green);
      color: var(--green);
    }
    .stats-bar {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      padding: 10px;
      text-align: center;
    }
    .stat-val {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--accent);
    }
    .stat-lbl {
      font-size: 0.7rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .search-box {
      margin-bottom: 16px;
    }
    .search-input {
      width: 100%;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text);
      padding: 10px 14px;
      border-radius: var(--radius);
      font-size: 0.9rem;
      outline: none;
    }
    .search-input:focus {
      border-color: var(--accent);
    }
    .agents-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .agent-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      padding: 14px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
      transition: border-color 0.2s;
      position: relative;
      overflow: hidden;
    }
    .agent-card.running {
      border-left: 4px solid var(--yellow);
    }
    .agent-card.idle {
      border-left: 4px solid var(--green);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
      gap: 8px;
    }
    .agent-name {
      font-size: 1.05rem;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
      word-break: break-word;
    }
    .agent-badge {
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .badge-idle {
      background: rgba(166, 227, 161, 0.15);
      color: var(--green);
      border: 1px solid rgba(166, 227, 161, 0.3);
    }
    .badge-thinking {
      background: rgba(249, 226, 175, 0.15);
      color: var(--yellow);
      border: 1px solid rgba(249, 226, 175, 0.3);
      animation: pulse 1.5s infinite;
    }
    .badge-tool {
      background: rgba(250, 179, 135, 0.15);
      color: var(--peach);
      border: 1px solid rgba(250, 179, 135, 0.3);
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    .agent-meta {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .meta-row {
      display: flex;
      align-items: center;
      gap: 6px;
      word-break: break-all;
    }
    .meta-icon {
      font-size: 0.9rem;
      opacity: 0.7;
    }
    .context-box {
      margin-top: 10px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      padding: 8px 10px;
    }
    .context-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-bottom: 4px;
    }
    .progress-bar-bg {
      height: 6px;
      background: var(--surface);
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      background: var(--green);
      border-radius: 3px;
      transition: width 0.3s ease;
    }
    .progress-bar-fill.warning {
      background: var(--yellow);
    }
    .progress-bar-fill.danger {
      background: var(--red);
    }
    .footer-time {
      margin-top: 10px;
      font-size: 0.7rem;
      color: #6c7086;
      display: flex;
      justify-content: space-between;
    }
    .empty-state {
      text-align: center;
      padding: 40px 16px;
      color: var(--text-muted);
    }
    .empty-icon {
      font-size: 2.5rem;
      margin-bottom: 12px;
      opacity: 0.5;
    }
    .connection-banner {
      background: rgba(243, 139, 168, 0.2);
      border: 1px solid var(--red);
      color: var(--red);
      font-size: 0.8rem;
      padding: 8px 12px;
      border-radius: 8px;
      margin-bottom: 12px;
      display: none;
      align-items: center;
      gap: 8px;
    }
  </style>
</head>
<body>
  <header>
    <div class="logo-group">
      <div class="logo-icon">📡</div>
      <div>
        <h1>Intercom Monitor</h1>
        <div class="subtitle" id="connection-status">Connecté en direct (SSE)</div>
      </div>
    </div>
    <div class="header-actions">
      <button class="btn" id="notif-btn" onclick="toggleNotifications()">
        <span id="notif-icon">🔔</span> Notifs
      </button>
    </div>
  </header>

  <div class="connection-banner" id="disconn-banner">
    ⚠️ Connexion perdue avec l'hôte Pi Intercom. Reconnexion en cours...
  </div>

  <div class="stats-bar">
    <div class="stat-card">
      <div class="stat-val" id="stat-total">0</div>
      <div class="stat-lbl">Agents</div>
    </div>
    <div class="stat-card">
      <div class="stat-val" style="color: var(--yellow)" id="stat-busy">0</div>
      <div class="stat-lbl">En cours</div>
    </div>
    <div class="stat-card">
      <div class="stat-val" style="color: var(--green)" id="stat-idle">0</div>
      <div class="stat-lbl">Au repos</div>
    </div>
  </div>

  <div class="search-box">
    <input type="text" class="search-input" id="search-input" placeholder="🔍 Filtrer par nom, statut, machine..." oninput="renderAgents()">
  </div>

  <div class="agents-list" id="agents-container">
    <div class="empty-state">
      <div class="empty-icon">⏳</div>
      <div>Recherche des agents sur le réseau local...</div>
    </div>
  </div>

  <script>
    let sessions = [];
    let prevStatusMap = new Map();
    let notificationsEnabled = (typeof Notification !== 'undefined' && Notification.permission === 'granted');

    function updateNotifButton() {
      const btn = document.getElementById('notif-btn');
      if (notificationsEnabled) {
        btn.classList.add('active');
        document.getElementById('notif-icon').textContent = '🔕';
      } else {
        btn.classList.remove('active');
        document.getElementById('notif-icon').textContent = '🔔';
      }
    }
    updateNotifButton();

    async function toggleNotifications() {
      if (typeof Notification === 'undefined') {
        alert("Les notifications ne sont pas supportées par ce navigateur.");
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
        sendNotification("Notifications activées", "Vous recevrez des alertes quand un agent termine ou change d'état.");
      } else {
        alert("Permission refusée pour les notifications.");
      }
    }

    function playBeep() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } catch (e) {}
    }

    function sendNotification(title, body) {
      if (notificationsEnabled && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body: body,
            icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220%200%20100%20100%22><text y=%22.9em%22 font-size=%2290%22>📡</text></svg>",
            vibrate: [200, 100, 200]
          });
          playBeep();
        } catch (e) {}
      }
    }

    function timeAgo(ts) {
      if (!ts) return "inconnu";
      const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
      if (seconds < 60) return seconds + "s";
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return minutes + "m";
      const hours = Math.floor(minutes / 60);
      return hours + "h " + (minutes % 60) + "m";
    }

    function formatTokens(count) {
      if (!count && count !== 0) return "?";
      if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
      if (count >= 1000) return (count / 1000).toFixed(1) + "k";
      return count.toString();
    }

    function checkStatusTransitions(newSessions) {
      const newMap = new Map();
      for (const s of newSessions) {
        const sid = s.id;
        const currentSt = s.status || "idle";
        const name = s.name || sid.slice(0, 8);
        if (prevStatusMap.has(sid)) {
          const oldSt = prevStatusMap.get(sid);
          if (oldSt !== currentSt) {
            if ((oldSt.startsWith("tool:") || oldSt === "thinking") && currentSt === "idle") {
              sendNotification("✅ Agent " + name + " a terminé", "L'agent est maintenant au repos (idle).");
            } else if (currentSt.startsWith("tool:")) {
              const tool = currentSt.split(":")[1] || "";
              sendNotification("⚙️ " + name + " lance " + tool, "Exécution de l'outil " + tool);
            }
          }
        }
        newMap.set(sid, currentSt);
      }
      prevStatusMap = newMap;
    }

    function renderAgents() {
      const query = document.getElementById('search-input').value.toLowerCase().trim();
      const container = document.getElementById('agents-container');

      const filtered = sessions.filter(s => {
        if (!query) return true;
        const name = (s.name || '').toLowerCase();
        const host = (s.hostname || '').toLowerCase();
        const cwd = (s.cwd || '').toLowerCase();
        const model = (s.model || '').toLowerCase();
        const status = (s.status || '').toLowerCase();
        return name.includes(query) || host.includes(query) || cwd.includes(query) || model.includes(query) || status.includes(query);
      });

      // Update counters
      document.getElementById('stat-total').textContent = sessions.length;
      let busy = 0;
      let idle = 0;
      sessions.forEach(s => {
        const st = s.status || "idle";
        if (st === "thinking" || st.startsWith("tool:")) busy++;
        else idle++;
      });
      document.getElementById('stat-busy').textContent = busy;
      document.getElementById('stat-idle').textContent = idle;

      if (filtered.length === 0) {
        container.innerHTML = \`
          <div class="empty-state">
            <div class="empty-icon">\${query ? '🔎' : '📡'}</div>
            <div>\${query ? 'Aucun agent ne correspond à la recherche' : 'Aucun agent détecté sur le réseau local'}</div>
          </div>\`;
        return;
      }

      container.innerHTML = filtered.map(s => {
        const st = s.status || "idle";
        const isBusy = st === "thinking" || st.startsWith("tool:");
        let badgeClass = "badge-idle";
        let badgeLabel = "🟢 IDLE";
        if (st === "thinking") {
          badgeClass = "badge-thinking";
          badgeLabel = "🧠 THINKING";
        } else if (st.startsWith("tool:")) {
          badgeClass = "badge-tool";
          badgeLabel = "⚙️ " + st.slice(5).toUpperCase();
        }

        const name = s.name || ("Agent " + s.id.slice(0, 8));
        const host = s.hostname || "local";
        const cwd = s.cwd || "~";
        const model = s.model || "inconnu";
        const pct = (typeof s.contextPct === 'number') ? s.contextPct : null;
        let pctClass = "";
        if (pct !== null && pct > 80) pctClass = "danger";
        else if (pct !== null && pct > 50) pctClass = "warning";

        return \`
          <div class="agent-card \${isBusy ? 'running' : 'idle'}">
            <div class="card-header">
              <div class="agent-name">
                \${name}
              </div>
              <span class="agent-badge \${badgeClass}">\${badgeLabel}</span>
            </div>

            <div class="agent-meta">
              <div class="meta-row">
                <span class="meta-icon">💻</span>
                <span><strong>\${host}</strong> (\${s.os || 'os'})</span>
              </div>
              <div class="meta-row">
                <span class="meta-icon">📁</span>
                <span>\${cwd}</span>
              </div>
              <div class="meta-row">
                <span class="meta-icon">🤖</span>
                <span>\${model}</span>
              </div>
            </div>

            \${pct !== null ? \`
              <div class="context-box">
                <div class="context-header">
                  <span>Contexte</span>
                  <span><strong>\${pct}%</strong> (\${formatTokens(s.contextTokens)} / \${formatTokens(s.contextWindow)})</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill \${pctClass}" style="width: \${Math.min(100, Math.max(0, pct))}%"></div>
                </div>
              </div>
            \` : ''}

            <div class="footer-time">
              <span>Dernière activité: \${timeAgo(s.lastActivity)}</span>
              <span>PID: \${s.pid || '?'}</span>
            </div>
          </div>
        \`;
      }).join('');
    }

    // Connect SSE
    let eventSource = null;
    function connectEvents() {
      if (eventSource) eventSource.close();
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        document.getElementById('disconn-banner').style.display = 'none';
        document.getElementById('connection-status').textContent = 'Connecté en direct (SSE)';
      };

      eventSource.onerror = () => {
        document.getElementById('disconn-banner').style.display = 'flex';
        document.getElementById('connection-status').textContent = 'Reconnexion...';
      };

      eventSource.addEventListener('sessions', (e) => {
        try {
          const data = JSON.parse(e.data);
          sessions = data;
          checkStatusTransitions(sessions);
          renderAgents();
        } catch (err) {
          console.error("SSE parse error", err);
        }
      });
    }

    // Initial fetch fallback
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        sessions = data;
        checkStatusTransitions(sessions);
        renderAgents();
      })
      .catch(console.error);

    connectEvents();
    // Rafraîchir les libellés de temps relatif toutes les 5s
    setInterval(renderAgents, 5000);
  </script>
</body>
</html>`;
}
