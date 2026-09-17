export const dashboardEnhancements = `
<style>
.hidden,#guild.hidden{display:none!important}.server-arrow{font-size:0}.server-arrow::after{content:'v';font-size:14px}.nav-icon{font-size:0;width:20px;height:20px;border:1px solid #303d67;border-radius:6px;background:#171d3a;display:grid;place-items:center;color:#9f98ff}.nav-icon::after{font-size:11px;font-weight:800;content:'+'}.nav button[data-view="general"] .nav-icon::after{content:'G'}.nav button[data-view="moderation"] .nav-icon::after{content:'M'}.nav button[data-view="automod"] .nav-icon::after{content:'A'}.nav button[data-view="protection"] .nav-icon::after{content:'P'}.nav button[data-view="logs"] .nav-icon::after{content:'L'}.nav button[data-view="tickets"] .nav-icon::after{content:'T'}.nav button[data-view="welcome"] .nav-icon::after{content:'W'}.nav button[data-view="commands"] .nav-icon::after{content:'C'}.nav button[data-view="leveling"] .nav-icon::after{content:'V'}.nav button[data-view="rules"] .nav-icon::after{content:'R'}.nav button.active .nav-icon{background:#6558ed;border-color:#8075ff;color:#fff}.sidebar{padding:20px 14px}.brand{padding-bottom:18px}.server{min-height:66px}.content{max-width:1240px;padding:42px 44px 90px}.hero{align-items:center;margin-bottom:28px}.hero h1{font-size:39px;letter-spacing:-.04em}.eyebrow{font-size:10px}.cards{gap:18px}.card{border-radius:10px;background:linear-gradient(145deg,#121a31,#0f1528);border-color:#26345a;padding:25px}.card h2{font-size:20px}.panel,.stat{border-radius:10px}.view>.card{margin-bottom:16px}.form-grid{gap:18px}.field input,.field textarea,.field select{background:#0b1125;border-color:#324166}.field textarea{min-height:122px}.wizard-item{background:#0b1227;border-color:#2c3a61}.command-row{min-height:70px}.command-row .alias-input{max-width:310px}.check{background:#0b1227;border-color:#2c3a61}.ticket-preview,.ticket-preview .card{background:#0b1227!important;border:1px solid #344579!important}.setup-stat-grid{gap:12px}.setup-stat{background:#0b1227;border-color:#2c3a61}.module-search{width:100%;margin:15px 0}.topbar{padding:0 44px}.pill{background:#0c1329}.primary{box-shadow:0 8px 20px #6558ed33}.primary:hover{transform:translateY(-1px)}
.alias-input{min-width:220px;flex:0 1 310px;background:#0b1125!important;border:1px solid #324166!important;border-radius:6px;color:#e8edf7!important;padding:10px 12px;font-size:12px}.alias-input::placeholder{color:#687697}.command-row .check{flex:0 0 auto;padding:10px 12px;white-space:nowrap}.command-row{gap:16px}.command-row strong{font-size:14px}.command-row small{font-size:12px}
.wizard-launcher{position:fixed;right:24px;bottom:24px;z-index:30;border:1px solid #8178ff;background:#6558ed;color:white;border-radius:8px;padding:12px 16px;font-weight:800;box-shadow:0 18px 45px #0008}
.wizard-launcher:hover{background:#8279ff;transform:translateY(-2px)}
.enhancement-drawer{position:fixed;inset:0;z-index:40;background:#050817cc;display:none;align-items:center;justify-content:center;padding:22px;backdrop-filter:blur(8px)}
.enhancement-drawer.open{display:flex}
.wizard-card{width:min(720px,100%);max-height:90vh;overflow:auto;background:#111a31;border:1px solid #354477;border-radius:12px;box-shadow:0 30px 80px #000b;padding:28px}
.wizard-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.wizard-head h2{margin:0;font-size:27px}.wizard-head p{color:#96a2c0;font-size:13px;margin:7px 0 0}.wizard-close{border:1px solid #344268;background:#192342;color:#ced6ed;border-radius:6px;padding:7px 10px}
.wizard-progress{height:6px;border-radius:9px;background:#252f51;margin:22px 0;overflow:hidden}.wizard-progress span{display:block;height:100%;width:0;background:linear-gradient(90deg,#6558ed,#4bd69b);transition:width .3s}
.wizard-list{display:grid;gap:9px}.wizard-item{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid #29385f;background:#0b1227;border-radius:7px}.wizard-item .mark{display:grid;place-items:center;width:25px;height:25px;border-radius:50%;background:#28365b;color:#9ca9ca;font-size:13px}.wizard-item.done{border-color:#236f5e}.wizard-item.done .mark{background:#1a9c74;color:white}.wizard-item strong{display:block;font-size:14px}.wizard-item small{display:block;color:#8492b1;font-size:12px;margin-top:3px}.wizard-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:21px}.setup-stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:15px 0}.setup-stat{padding:14px;border:1px solid #29385f;border-radius:7px;background:#0c1329}.setup-stat b{font-size:22px;display:block}.setup-stat small{color:#8f9cbb;font-size:11px}.module-search{width:calc(100% - 20px);margin:10px;border:1px solid #2b395d;background:#101a35;color:#e8edf7;border-radius:6px;padding:9px 10px}.nav button.is-hidden{display:none}.enhance-toast{position:fixed;right:24px;top:88px;z-index:60;background:#182544;color:#eaf0ff;border:1px solid #435b91;border-radius:7px;padding:12px 15px;opacity:0;transform:translateY(-8px);transition:.22s;pointer-events:none;font-size:13px}.enhance-toast.show{opacity:1;transform:none}.security-score{display:inline-flex;align-items:center;gap:7px;margin-left:8px;color:#aeb9d5;font-size:12px}.security-score i{display:inline-block;width:8px;height:8px;border-radius:50%;background:#4bd69b}.dark-help{color:#8d99b8;font-size:12px;line-height:1.55}
@media(max-width:650px){.wizard-launcher{right:14px;bottom:14px}.setup-stat-grid{grid-template-columns:1fr 1fr}.wizard-card{padding:20px}}
</style>
<script>
(() => {
  const state = { guildId: null, settings: null };
  const byId = (id) => document.getElementById(id);
  const apiRequest = async (url, options) => {
    const response = await fetch(url, options);
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Request failed');
    return body;
  };
  const notify = (message) => {
    let toast = byId('enhanceToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'enhanceToast';
      toast.className = 'enhance-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
  };
  window.dashboardNotify = notify;
  window.notify = notify;
  const getGuildId = () => state.guildId || byId('guild')?.value;
  const refreshState = async () => {
    const guildId = getGuildId();
    if (!guildId) return null;
    state.guildId = guildId;
    state.settings = await apiRequest('/api/guilds/' + guildId);
    return state.settings;
  };
  const checklist = (settings) => [
    ['Logs channel', Boolean(settings.logChannelId), 'Moderation actions have a visible audit destination.'],
    ['Rules channel', Boolean(settings.rulesChannelId), 'Members can find the server standard.'],
    ['Welcome flow', Boolean(settings.welcomeChannelId), 'New members receive a clear first message.'],
    ['Ticket system', Boolean(settings.ticketCategoryId && settings.ticketPanelChannelId), 'Support requests have a private route.'],
    ['Quarantine role', Boolean(settings.quarantineRoleId), 'Suspicious members can be isolated.'],
    ['Protection filters', Boolean(settings.security?.antiSpam && settings.security?.antiInvite), 'Core message filters are enabled.'],
    ['Verification', Boolean(settings.verificationEnabled && settings.verificationChannelId && settings.verifiedRoleId), 'New members can verify before receiving access.'],
    ['Suggestions', Boolean(settings.suggestionsChannelId), 'Members have a dedicated place for suggestions.'],
    ['Islamic reminders', Boolean(settings.islamicReminders?.enabled && settings.islamicReminders?.channelId), 'Scheduled reminders have a destination.'],
    ['Voice rooms', Boolean(settings.joinToCreateChannelId && settings.afkChannelId && settings.afkRoleId), 'Join-to-create and AFK voice systems are ready.']
  ];
  const renderWizard = (settings) => {
    const items = checklist(settings);
    const complete = items.filter((item) => item[1]).length;
    const rows = items.map(([title, done, description]) => '<div class="wizard-item ' + (done ? 'done' : '') + '"><span class="mark">' + (done ? 'OK' : '-') + '</span><span><strong>' + title + '</strong><small>' + description + '</small></span></div>').join('');
    return '<div class="enhancement-drawer" id="setupWizard"><div class="wizard-card"><div class="wizard-head"><div><h2>Server setup wizard</h2><p>Bring the important systems online in a few deliberate steps.</p></div><button class="wizard-close" id="closeWizard">Close</button></div><div class="wizard-progress"><span style="width:' + Math.round((complete / items.length) * 100) + '%"></span></div><div class="setup-stat-grid"><div class="setup-stat"><b>' + complete + '/' + items.length + '</b><small>systems ready</small></div><div class="setup-stat"><b>' + (settings.securityScore || 0) + '%</b><small>security score</small></div><div class="setup-stat"><b>' + (settings.blacklist?.length || 0) + '</b><small>blacklisted</small></div></div><div class="wizard-list">' + rows + '</div><p class="dark-help">Use the left navigation to finish any incomplete module. This wizard never changes destructive settings without an explicit save.</p><div class="wizard-actions"><button class="secondary" id="wizardAll">Set up everything</button><button class="secondary" id="wizardTickets">Set up tickets</button><button class="primary" id="wizardDone">Done</button></div></div></div>';
  };
  const openWizard = async () => {
    try {
      const settings = await refreshState();
      document.getElementById('setupWizard')?.remove();
      document.body.insertAdjacentHTML('beforeend', renderWizard(settings));
      byId('setupWizard').classList.add('open');
      byId('closeWizard').onclick = () => byId('setupWizard').remove();
      byId('wizardDone').onclick = () => byId('setupWizard').remove();
      byId('wizardAll').onclick = async () => { try { await apiRequest('/api/guilds/' + state.guildId + '/setup-all', { method: 'POST' }); notify('Complete server setup finished.'); openWizard(); } catch (error) { notify(error.message); } };
      byId('wizardTickets').onclick = async () => {
        try { await apiRequest('/api/guilds/' + state.guildId + '/tickets', { method: 'POST' }); notify('Ticket system created or refreshed.'); openWizard(); } catch (error) { notify(error.message); }
      };
    } catch (error) { notify(error.message); }
  };
  const addLauncher = () => {
    if (byId('wizardLauncher')) return;
    const button = document.createElement('button');
    button.id = 'wizardLauncher';
    button.className = 'wizard-launcher';
    button.textContent = 'Setup wizard';
    button.onclick = openWizard;
    document.body.appendChild(button);
  };
  const addSearch = () => {
    const nav = document.querySelector('.nav');
    if (!nav || byId('moduleSearch')) return;
    const input = document.createElement('input');
    input.id = 'moduleSearch';
    input.className = 'module-search';
    input.placeholder = 'Search modules...';
    input.setAttribute('aria-label', 'Search modules');
    input.oninput = () => {
      const query = input.value.toLowerCase();
      nav.querySelectorAll('button[data-view]').forEach((button) => { button.classList.toggle('is-hidden', query && !button.textContent.toLowerCase().includes(query)); });
    };
    nav.prepend(input);
  };
  const addScore = () => {
    const pill = document.querySelector('.pill');
    if (pill && !byId('securityScore')) { const score = document.createElement('span'); score.id = 'securityScore'; score.className = 'security-score'; score.innerHTML = '<i></i><span>security ready</span>'; pill.appendChild(score); }
  };
  const bindShortcuts = () => document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); byId('moduleSearch')?.focus(); }
    if (event.key === 'Escape') byId('setupWizard')?.remove();
  });
  const boot = () => { addLauncher(); addSearch(); addScore(); bindShortcuts(); setTimeout(async () => { try { const settings = await refreshState(); const score = document.querySelector('#securityScore span'); if (score) score.textContent = (settings.securityScore || 0) + '% security ready'; } catch { notify('Dashboard is waiting for the bot connection.'); } }, 700); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
</script>
<script>
(() => {
  const moduleDescriptions = {
    general: 'Server identity, command defaults, and readiness.',
    moderation: 'Custom command words and staff actions.',
    automod: 'Message filters, words, and response behavior.',
    protection: 'Spam, invite, caps, raid, and quarantine controls.',
    logs: 'Where important server actions are recorded.',
    tickets: 'Private member support and panel customization.',
    welcome: 'Welcome and goodbye member lifecycle messages.',
    commands: 'Slash commands, aliases, and usage patterns.',
    leveling: 'XP pacing, exclusions, and role rewards.',
    rules: 'The visible standard for your community.'
  };
  const addDescriptions = () => {
    document.querySelectorAll('.nav button[data-view]').forEach((button) => {
      const name = button.dataset.view;
      button.title = moduleDescriptions[name] || 'Server module';
    });
  };
  const addModuleHealth = () => {
    const hero = document.querySelector('.hero');
    if (!hero || document.getElementById('moduleHealth')) return;
    const health = document.createElement('div');
    health.id = 'moduleHealth';
    health.className = 'pill';
    health.textContent = 'Modules loading';
    hero.appendChild(health);
    const update = async () => {
      const id = document.getElementById('guild')?.value;
      if (!id) return;
      try {
        const response = await fetch('/api/guilds/' + id);
        const settings = await response.json();
        const names = ['welcomeChannelId', 'goodbyeChannelId', 'logChannelId', 'rulesChannelId', 'ticketCategoryId', 'quarantineRoleId'];
        const ready = names.filter((key) => settings[key]).length;
        health.textContent = ready + '/' + names.length + ' core modules';
      } catch {
        health.textContent = 'Connection paused';
      }
    };
    update();
    window.addEventListener('focus', update);
  };
  const addCopyButtons = () => {
    document.querySelectorAll('.field textarea').forEach((textarea) => {
      if (textarea.dataset.copyReady) return;
      textarea.dataset.copyReady = 'true';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'secondary';
      button.textContent = 'Copy value';
      button.style.marginTop = '6px';
      button.onclick = async () => {
        await navigator.clipboard?.writeText(textarea.value || '');
        notify('Value copied to clipboard.');
      };
      textarea.parentElement.appendChild(button);
    });
  };
  const addEmptyState = () => {
    const guildSelect = document.getElementById('guild');
    if (guildSelect?.options.length) return;
    const app = document.querySelector('.content');
    if (!app || document.getElementById('emptyBotState')) return;
    const state = document.createElement('div');
    state.id = 'emptyBotState';
    state.className = 'empty';
    state.innerHTML = '<div><div class="empty-mark">◈</div><h2>Bot not connected</h2><p>Start the bot and invite it to a server to unlock settings.</p></div>';
    app.appendChild(state);
  };
  const observeDashboard = () => {
    addDescriptions();
    addCopyButtons();
    addEmptyState();
    const observer = new MutationObserver(() => { addDescriptions(); addCopyButtons(); });
    observer.observe(document.body, { childList: true, subtree: true });
  };
  const announce = (text) => {
    const region = document.createElement('div');
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.className = 'hidden';
    region.textContent = text;
    document.body.appendChild(region);
    setTimeout(() => region.remove(), 3000);
  };
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest('button[data-view]');
    if (button) announce('Opened ' + (moduleDescriptions[button.dataset.view] || button.dataset.view));
  });
  const boot = () => { observeDashboard(); addModuleHealth(); window.addEventListener('resize', () => document.body.classList.toggle('compact', window.innerWidth < 650)); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
</script>
<script>
(() => {
  const addModuleCards = () => {
    const general = document.querySelector('#view-general .cards');
    if (!general || document.getElementById('moduleCards')) return;
    const card = document.createElement('div');
    card.id = 'moduleCards';
    card.className = 'card wide';
    card.innerHTML = '<h2>Module health</h2><p>See which systems are configured before members need them.</p><div id="moduleHealthGrid" class="setup-stat-grid"></div>';
    general.appendChild(card);
    const update = async () => {
      const id = document.getElementById('guild')?.value;
      if (!id) return;
      try {
        const settings = await (await fetch('/api/guilds/' + id)).json();
        const modules = settings.moduleStatus || {};
        document.getElementById('moduleHealthGrid').innerHTML = Object.entries(modules).map(([name, ready]) => '<div class="setup-stat"><b>' + (ready ? 'ON' : 'OFF') + '</b><small>' + name + '</small></div>').join('');
      } catch { }
    };
    update();
    window.addEventListener('focus', update);
  };
  const addCommandReference = () => {
    const commandsView = document.getElementById('view-commands');
    if (!commandsView || document.getElementById('commandReference')) return;
    const card = document.createElement('div');
    card.id = 'commandReference';
    card.className = 'card';
    card.innerHTML = '<h2>Command reference</h2><p>Search the live command catalog. Custom aliases remain server-specific.</p><input id="commandSearch" class="module-search" placeholder="Search commands..."><div id="commandRows" class="wizard-list"></div>';
    commandsView.appendChild(card);
    const load = async () => {
      const commands = await (await fetch('/api/commands')).json();
      const render = () => { const query = document.getElementById('commandSearch').value.toLowerCase(); document.getElementById('commandRows').innerHTML = commands.filter((item) => !query || item.name.includes(query) || item.group.includes(query)).map((item) => '<div class="wizard-item"><span class="mark">/</span><span><strong>' + item.name + '</strong><small>' + item.group + '</small></span></div>').join(''); };
      document.getElementById('commandSearch').oninput = render;
      render();
    };
    load().catch(() => {});
  };
  const addExport = () => {
    const toolbar = document.querySelector('.hero-actions');
    if (!toolbar || document.getElementById('exportSettings')) return;
    const button = document.createElement('button');
    button.id = 'exportSettings';
    button.className = 'secondary';
    button.textContent = 'Export settings';
    button.onclick = async () => {
      const id = document.getElementById('guild')?.value;
      if (!id) return notify('Select a server first.');
      const data = await (await fetch('/api/guilds/' + id)).json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'server-settings.json';
      link.click();
      URL.revokeObjectURL(link.href);
      notify('Settings exported.');
    };
    toolbar.appendChild(button);
  };
  const boot = () => { addModuleCards(); addCommandReference(); addExport(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
</script>
<script>
(() => {
  const addSaveState = () => {
    document.querySelectorAll('button.primary').forEach((button) => {
      if (button.dataset.saveState) return;
      button.dataset.saveState = 'ready';
      button.addEventListener('click', () => {
        const original = button.textContent;
        button.textContent = 'Saving...';
        button.disabled = true;
        setTimeout(() => { button.textContent = original; button.disabled = false; }, 700);
      });
    });
  };
  const addScrollMemory = () => {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    const key = 'server-control-sidebar-scroll';
    sidebar.scrollTop = Number(sessionStorage.getItem(key) || 0);
    sidebar.addEventListener('scroll', () => sessionStorage.setItem(key, String(sidebar.scrollTop)), { passive: true });
  };
  const addConfirmForLockdown = () => {
    document.querySelectorAll('[data-view="protection"]').forEach((button) => button.addEventListener('dblclick', () => notify('Protection controls are ready for review.')));
  };
  const addFocusRing = () => {
    document.addEventListener('focusin', (event) => {
      const target = event.target;
      if (target instanceof Element && target.matches('input, textarea, select, button')) target.classList.add('focus-visible');
    });
    document.addEventListener('focusout', (event) => {
      const target = event.target;
      if (target instanceof Element) target.classList.remove('focus-visible');
    });
  };
  const addSectionMemory = () => {
    document.querySelectorAll('.nav button[data-view]').forEach((button) => button.addEventListener('click', () => localStorage.setItem('server-control-view', button.dataset.view)));
    const previous = localStorage.getItem('server-control-view');
    if (previous) document.querySelector('[data-view="' + previous + '"]')?.click();
  };
  const boot = () => { addSaveState(); addScrollMemory(); addConfirmForLockdown(); addFocusRing(); addSectionMemory(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
</script>
<script>
(() => {
  const commandRows = [
    ['ban', 'Ban a member', 'Ban Members'], ['kick', 'Remove a member', 'Kick Members'], ['softban', 'Ban then unban', 'Ban Members'], ['timeout', 'Temporarily restrict', 'Moderate Members'], ['unmute', 'Remove timeout', 'Moderate Members'], ['warn', 'Add a warning', 'Moderate Members'], ['purge', 'Delete recent messages', 'Manage Messages'], ['lock', 'Lock current channel', 'Manage Channels'], ['unlock', 'Unlock current channel', 'Manage Channels'], ['lockdown', 'Lock every text channel', 'Manage Channels'], ['quarantine', 'Apply quarantine role', 'Moderate Members'], ['profile', 'View XP and reputation', 'Everyone'], ['rank', 'View server rank', 'Everyone'], ['top', 'View the XP leaderboard', 'Everyone'], ['selfrole', 'Toggle an approved role', 'Everyone'], ['rep', 'Give reputation', 'Everyone'], ['roll', 'Roll a random number', 'Everyone']
  ];
  const text = (id) => document.getElementById(id);
  const readLines = (value) => String(value || '').split(/\s+/).map((word) => word.trim().toLowerCase()).filter((word, index, all) => word && all.indexOf(word) === index);
  const showCommandStudio = () => {
    const host = document.querySelector('#view-moderation');
    if (!host || document.getElementById('commandStudio')) return;
    const studio = document.createElement('div');
    studio.id = 'commandStudio';
    studio.className = 'card wide';
    studio.innerHTML = '<div class="wizard-head"><div><h2>Command studio</h2><p>Each command has one canonical action. Add the words your staff naturally uses to trigger it.</p></div><span class="pill">Server-specific</span></div><input id="commandFilter" class="module-search" placeholder="Filter commands or permissions..."><div id="commandTable" class="wizard-list"></div><div class="save-row"><button class="primary" id="saveCommandStudio">Save command words</button></div><div class="notice" id="commandStudioNotice"></div>';
    host.prepend(studio);
    const render = (settings) => {
      const query = (text('commandFilter').value || '').toLowerCase();
      text('commandTable').innerHTML = commandRows.filter((row) => !query || row.join(' ').toLowerCase().includes(query)).map(([name, description, permission]) => '<div class="wizard-item command-row"><span class="mark">/</span><span style="flex:1"><strong>/' + name + '</strong><small>' + description + ' · requires ' + permission + '</small></span><label class="check">Enabled <input type="checkbox" class="command-enabled" data-command="' + name + '" ' + (settings.commandEnabled?.[name] !== false ? 'checked' : '') + '></label><input class="alias-input" data-command="' + name + '" value="' + (settings.commandAliases?.[name] || []).join(' ') + '" placeholder="custom words, separated by spaces"></div>').join('');
    };
    const load = async () => { const guildId = document.getElementById('guild').value; if (!guildId) return setTimeout(load, 700); const settings = await (await fetch('/api/guilds/' + guildId)).json(); render(settings); };
    text('commandFilter').oninput = () => load().catch(() => {});
    text('saveCommandStudio').onclick = async () => { const aliases = {}; const enabled = {}; document.querySelectorAll('.alias-input').forEach((input) => aliases[input.dataset.command] = readLines(input.value).slice(0, 10)); document.querySelectorAll('.command-enabled').forEach((input) => enabled[input.dataset.command] = input.checked); try { await fetch('/api/guilds/' + document.getElementById('guild').value, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ commandAliases: aliases, commandEnabled: enabled }) }); text('commandStudioNotice').textContent = 'Command words and switches saved. Active immediately.'; notify('Moderation commands updated.'); } catch (error) { text('commandStudioNotice').textContent = error.message; } };
    load().catch(() => {});
  };
  const showTicketStudio = () => {
    const host = document.querySelector('#view-tickets');
    if (!host || document.getElementById('ticketStudio')) return;
    const studio = document.createElement('div');
    studio.id = 'ticketStudio';
    studio.className = 'card wide';
    studio.innerHTML = '<div class="wizard-head"><div><h2>Ticket studio</h2><p>Design the public panel and the private opening message separately. Save first, then publish the panel.</p></div><span class="pill">Live preview</span></div><div class="form-grid"><label class="field">Panel title<input id="studioPanelTitle"></label><label class="field">Button text<input id="studioButtonLabel" maxlength="80"></label><label class="field">Panel description<textarea id="studioPanelDescription"></textarea></label><label class="field">Button style<select id="studioButtonStyle"><option>Primary</option><option>Secondary</option><option>Success</option><option>Danger</option></select></label><label class="field">Ticket name prefix<input id="studioNamePrefix" maxlength="18"></label><label class="field">Close button text<input id="studioCloseLabel" maxlength="80"></label><label class="field">Opening title<input id="studioWelcomeTitle"></label><label class="field">Opening message<textarea id="studioWelcomeMessage"></textarea></label></div><div class="card" style="margin-top:16px;background:#0b1227"><h3 id="ticketPreviewTitle">Need help?</h3><p id="ticketPreviewDescription">Click the button below and I will create a private ticket for you.</p><button class="primary" id="ticketPreviewButton">Open a Ticket</button></div><div class="save-row"><button class="primary" id="saveTicketStudio">Save ticket settings</button><button class="secondary" id="publishTicketStudio">Publish/update Discord panel</button></div><div class="notice" id="ticketStudioNotice"></div>';
    host.prepend(studio);
    const fields = { ticketPanelTitle: 'studioPanelTitle', ticketPanelDescription: 'studioPanelDescription', ticketButtonLabel: 'studioButtonLabel', ticketButtonStyle: 'studioButtonStyle', ticketNamePrefix: 'studioNamePrefix', ticketCloseLabel: 'studioCloseLabel', ticketWelcomeTitle: 'studioWelcomeTitle', ticketWelcomeMessage: 'studioWelcomeMessage' };
    const updatePreview = () => { text('ticketPreviewTitle').textContent = text('studioPanelTitle').value; text('ticketPreviewDescription').textContent = text('studioPanelDescription').value; text('ticketPreviewButton').textContent = text('studioButtonLabel').value; };
    const load = async () => { const guildId = document.getElementById('guild').value; if (!guildId) return setTimeout(load, 700); const settings = await (await fetch('/api/guilds/' + guildId)).json(); Object.entries(fields).forEach(([key, id]) => text(id).value = settings[key] || ''); updatePreview(); };
    Object.values(fields).forEach((id) => text(id).addEventListener('input', updatePreview));
    text('saveTicketStudio').onclick = async () => { const body = {}; Object.entries(fields).forEach(([key, id]) => body[key] = text(id).value); try { await fetch('/api/guilds/' + document.getElementById('guild').value, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) }); text('ticketStudioNotice').textContent = 'Ticket settings saved.'; notify('Ticket settings saved.'); } catch (error) { text('ticketStudioNotice').textContent = error.message; } };
    text('publishTicketStudio').onclick = async () => { try { const response = await fetch('/api/guilds/' + document.getElementById('guild').value + '/tickets', { method: 'POST' }); const body = await response.json(); if (!response.ok) throw Error(body.error); text('ticketStudioNotice').textContent = body.message; notify('Ticket panel published.'); } catch (error) { text('ticketStudioNotice').textContent = error.message; } };
    load().catch(() => {});
  };
  const boot = () => { showCommandStudio(); showTicketStudio(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
</script>
<script>
(() => {
  const id = (name) => document.getElementById(name);
  const currentGuild = () => id('guild')?.value;
  const get = async () => (await fetch('/api/guilds/' + currentGuild())).json();
  const patch = async (body) => fetch('/api/guilds/' + currentGuild(), { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
  const addNav = (view, label) => {
    const nav = document.querySelector('.nav');
    if (!nav || document.querySelector('[data-view="' + view + '"]')) return;
    const button = document.createElement('button'); button.dataset.view = view; button.innerHTML = '<span class="nav-icon">✦</span>' + label;
    button.onclick = () => { document.querySelectorAll('.view').forEach((item) => item.classList.remove('active')); id('view-' + view)?.classList.add('active'); document.querySelectorAll('.nav button').forEach((item) => item.classList.toggle('active', item === button)); id('viewTitle').textContent = label; id('viewDescription').textContent = 'Configure this server module directly.'; };
    nav.appendChild(button);
  };
  const addSection = (view, label, html) => { if (id('view-' + view)) return; const section = document.createElement('section'); section.className = 'view'; section.id = 'view-' + view; section.innerHTML = html; document.querySelector('.content').appendChild(section); addNav(view, label); };
  const addGeneralStudio = () => {
    const host = document.querySelector('#view-general .cards'); if (!host || id('generalStudio')) return;
    const card = document.createElement('div'); card.id = 'generalStudio'; card.className = 'card wide'; card.innerHTML = '<h2>Basics & automatic roles</h2><p>These are the server-wide defaults used by embeds and new members.</p><div class="form-grid"><label class="field">Bot language<select id="generalLanguage"><option value="en">English</option><option value="ar">Arabic</option><option value="es">Spanish</option><option value="fr">French</option></select></label><label class="field">Default embed color<input id="generalColor" type="color"></label><label class="field">Automatic roles<select id="generalRoles" multiple></select></label><label class="field">Welcome delivery<select id="welcomeDelivery"><option value="channel">Send to channel</option><option value="dm">Send as direct message</option></select></label></div><div class="save-row"><button class="primary" id="saveGeneralStudio">Save basics</button></div><div class="notice" id="generalStudioNotice"></div>'; host.appendChild(card);
    const load = async () => { if (!currentGuild()) return setTimeout(load, 700); const settings = await get(); id('generalLanguage').value = settings.language || 'en'; id('generalColor').value = settings.embedColor || '#6558ed'; if (id('generalRoles').options) { const selected = new Set(settings.autoRoleIds || []); [...id('generalRoles').options].forEach((option) => option.selected = selected.has(option.value)); } else id('generalRoles').value = (settings.autoRoleIds || []).join('\\n'); id('welcomeDelivery').value = settings.welcomeDelivery || 'channel'; }; load();
    id('saveGeneralStudio').onclick = async () => { const roles = id('generalRoles').selectedOptions ? [...id('generalRoles').selectedOptions].map((option) => option.value) : id('generalRoles').value.split(/\s+/).filter(Boolean); await patch({ language: id('generalLanguage').value, embedColor: id('generalColor').value, autoRoleIds: roles, welcomeDelivery: id('welcomeDelivery').value }); id('generalStudioNotice').textContent = 'Basics saved.'; notify('General settings saved.'); };
  };
  const addAutoReplyStudio = () => {
    addSection('autoreply', 'Auto Reply', '<div class="card wide"><h2>Auto Reply</h2><p>Respond to keywords or phrases with a custom message.</p><div id="replyRows" class="wizard-list"></div><div class="save-row"><button class="secondary" id="addReply">Add response</button><button class="primary" id="saveReplies">Save auto replies</button></div><div class="notice" id="replyNotice"></div></div>');
    const render = (settings) => { id('replyRows').innerHTML = (settings.autoReplies || []).map((reply, index) => '<div class="wizard-item"><input class="reply-trigger" data-index="' + index + '" value="' + reply.trigger + '" placeholder="trigger phrase"><input class="reply-response" data-index="' + index + '" value="' + reply.response + '" placeholder="response"><input type="checkbox" class="reply-enabled" data-index="' + index + '" ' + (reply.enabled !== false ? 'checked' : '') + '></div>').join(''); };
    const load = async () => { if (!currentGuild()) return setTimeout(load, 700); render(await get()); }; load();
    id('addReply').onclick = () => { const rows = [...document.querySelectorAll('.reply-trigger')].map((input, index) => ({ trigger: input.value, response: document.querySelector('.reply-response[data-index="' + index + '"]').value, enabled: document.querySelector('.reply-enabled[data-index="' + index + '"]').checked })); rows.push({ trigger: '', response: '', enabled: true }); render({ autoReplies: rows }); };
    id('saveReplies').onclick = async () => { const replies = [...document.querySelectorAll('.reply-trigger')].map((input, index) => ({ trigger: input.value.trim().slice(0, 100), response: document.querySelector('.reply-response[data-index="' + index + '"]').value.trim().slice(0, 2000), enabled: document.querySelector('.reply-enabled[data-index="' + index + '"]').checked })).filter((reply) => reply.trigger && reply.response); await patch({ autoReplies: replies }); id('replyNotice').textContent = 'Auto replies saved and active.'; notify('Auto replies updated.'); };
  };
  const addSecurityStudio = () => {
    const host = document.querySelector('#view-protection .card'); if (!host || id('securityStudio')) return;
    const card = document.createElement('div'); card.id = 'securityStudio'; card.className = 'card'; card.innerHTML = '<h2>Protection operations</h2><p>Configure quarantine and the join threshold used by raid alerts.</p><div class="form-grid"><label class="field">Quarantine role<select id="securityQuarantineRole"></select></label><label class="field">Raid join threshold<input id="securityRaidLimit" type="number" min="2" max="100"></label><label class="field">Minimum account age, days<input id="securityJoinAge" type="number" min="0" max="3650"></label></div><div class="save-row"><button class="primary" id="saveSecurityStudio">Save protection operations</button></div><div class="notice" id="securityStudioNotice"></div>'; host.appendChild(card);
    const load = async () => { if (!currentGuild()) return setTimeout(load, 700); const settings = await get(); id('securityQuarantineRole').value = settings.quarantineRoleId || ''; id('securityRaidLimit').value = settings.security.raidLimit || 5; id('securityJoinAge').value = settings.security.joinAgeDays || 0; }; load();
    id('saveSecurityStudio').onclick = async () => { const settings = await get(); await patch({ quarantineRoleId: id('securityQuarantineRole').value || null, security: { ...settings.security, raidLimit: Number(id('securityRaidLimit').value), joinAgeDays: Number(id('securityJoinAge').value) } }); id('securityStudioNotice').textContent = 'Protection operations saved.'; notify('Protection settings updated.'); };
  };
  const addAutoModStudio = () => {
    const host = document.querySelector('#view-automod .card'); if (!host || id('autoModStudio')) return;
    const card = document.createElement('div'); card.id = 'autoModStudio'; card.className = 'card'; card.innerHTML = '<h2>Auto Mod filters</h2><p>These controls map directly to message enforcement.</p><div class="check-grid"><label class="check">Blocked words <input id="autoModEnabled" type="checkbox"></label><label class="check">Delete & warn <input id="autoModWarn" type="checkbox"></label><label class="check">Invite links <input id="autoModInvites" type="checkbox"></label><label class="check">Excessive caps <input id="autoModCaps" type="checkbox"></label><label class="check">Mass mentions <input id="autoModMentions" type="checkbox"></label><label class="check">Message spam <input id="autoModSpam" type="checkbox"></label></div><label class="field">Blocked words, comma separated<textarea id="autoModWords"></textarea></label><div class="save-row"><button class="primary" id="saveAutoModStudio">Save Auto Mod</button></div><div class="notice" id="autoModStudioNotice"></div>'; host.appendChild(card);
    const load = async () => { if (!currentGuild()) return setTimeout(load, 700); const settings = await get(); id('autoModEnabled').checked = settings.automod !== false; id('autoModWarn').checked = settings.automodAction === 'warn'; id('autoModInvites').checked = settings.security.antiInvite; id('autoModCaps').checked = settings.security.antiCaps; id('autoModMentions').checked = settings.security.antiMassMention !== false; id('autoModSpam').checked = settings.security.antiSpam !== false; id('autoModWords').value = (settings.blockedWords || []).join(', '); }; load();
    id('saveAutoModStudio').onclick = async () => { const settings = await get(); await patch({ automod: id('autoModEnabled').checked, automodAction: id('autoModWarn').checked ? 'warn' : 'delete', blockedWords: id('autoModWords').value.split(',').map((word) => word.trim()).filter(Boolean), security: { ...settings.security, antiInvite: id('autoModInvites').checked, antiCaps: id('autoModCaps').checked, antiMassMention: id('autoModMentions').checked, antiSpam: id('autoModSpam').checked } }); id('autoModStudioNotice').textContent = 'Auto Mod saved.'; notify('Auto Mod filters updated.'); };
  };
  const addLogsStudio = () => {
    const host = document.querySelector('#view-logs .card'); if (!host || id('logsStudio')) return;
    const card = document.createElement('div'); card.id = 'logsStudio'; card.className = 'card'; card.innerHTML = '<h2>Event log switches</h2><p>Choose which event categories appear in the configured log channel.</p><div class="check-grid"><label class="check">Moderation <input id="logModeration" type="checkbox"></label><label class="check">Members <input id="logMembers" type="checkbox"></label><label class="check">Tickets <input id="logTickets" type="checkbox"></label><label class="check">Security <input id="logSecurity" type="checkbox"></label></div><div class="save-row"><button class="primary" id="saveLogsStudio">Save log switches</button></div><div class="notice" id="logsStudioNotice"></div>'; host.appendChild(card);
    const load = async () => { if (!currentGuild()) return setTimeout(load, 700); const settings = await get(); const events = settings.logEvents || {}; id('logModeration').checked = events.moderation !== false; id('logMembers').checked = events.members !== false; id('logTickets').checked = events.tickets !== false; id('logSecurity').checked = events.security !== false; }; load();
    id('saveLogsStudio').onclick = async () => { await patch({ logEvents: { moderation: id('logModeration').checked, members: id('logMembers').checked, tickets: id('logTickets').checked, security: id('logSecurity').checked } }); id('logsStudioNotice').textContent = 'Log switches saved.'; notify('Log configuration updated.'); };
  };
  const addWelcomeStudio = () => {
    const host = document.querySelector('#view-welcome .card'); if (!host || id('welcomeStudio')) return;
    const card = document.createElement('div'); card.id = 'welcomeStudio'; card.className = 'card'; card.innerHTML = '<h2>Delivery & goodbye</h2><p>Choose where welcome messages go and customize the leave message.</p><div class="form-grid"><label class="field">Delivery method<select id="welcomeMode"><option value="channel">Send to channel</option><option value="dm">Send as direct message</option></select></label><label class="field">Goodbye channel<select id="welcomeGoodbyeChannel"></select></label><label class="field">Goodbye message<textarea id="welcomeGoodbyeMessage"></textarea></label></div><div class="save-row"><button class="primary" id="saveWelcomeStudio">Save welcome flow</button></div><div class="notice" id="welcomeStudioNotice"></div>'; host.appendChild(card);
    const load = async () => { if (!currentGuild()) return setTimeout(load, 700); const settings = await get(); id('welcomeMode').value = settings.welcomeDelivery || 'channel'; id('welcomeGoodbyeChannel').value = settings.goodbyeChannelId || ''; id('welcomeGoodbyeMessage').value = settings.goodbyeMessage || ''; }; load();
    id('saveWelcomeStudio').onclick = async () => { await patch({ welcomeDelivery: id('welcomeMode').value, goodbyeChannelId: id('welcomeGoodbyeChannel').value || null, goodbyeMessage: id('welcomeGoodbyeMessage').value }); id('welcomeStudioNotice').textContent = 'Welcome flow saved.'; notify('Welcome flow updated.'); };
  };
  const addLevelingStudio = () => {
    const host = document.querySelector('#view-leveling .card'); if (!host || id('levelingStudio')) return;
    const card = document.createElement('div'); card.id = 'levelingStudio'; card.className = 'card'; card.innerHTML = '<h2>XP controls</h2><p>Choose the level-up message and exclusions without editing IDs.</p><label class="field">Level-up message<textarea id="levelMessage"></textarea></label><div class="form-grid"><label class="field">Excluded channels<select id="levelChannels" multiple></select></label><label class="field">Excluded roles<select id="levelRoles" multiple></select></label></div><div class="save-row"><button class="primary" id="saveLevelingStudio">Save XP controls</button></div><div class="notice" id="levelingStudioNotice"></div>'; host.appendChild(card);
    const load = async () => { if (!currentGuild()) return setTimeout(load, 700); const settings = await get(); id('levelMessage').value = settings.levelUpMessage || ''; if (id('levelChannels').options) { const channels = new Set(settings.levelExcludedChannels || []); [...id('levelChannels').options].forEach((option) => option.selected = channels.has(option.value)); } else id('levelChannels').value = (settings.levelExcludedChannels || []).join('\\n'); if (id('levelRoles').options) { const roles = new Set(settings.levelExcludedRoles || []); [...id('levelRoles').options].forEach((option) => option.selected = roles.has(option.value)); } else id('levelRoles').value = (settings.levelExcludedRoles || []).join('\\n'); }; load();
    id('saveLevelingStudio').onclick = async () => { const channels = id('levelChannels').selectedOptions ? [...id('levelChannels').selectedOptions].map((option) => option.value) : id('levelChannels').value.split(/\s+/).filter(Boolean); const roles = id('levelRoles').selectedOptions ? [...id('levelRoles').selectedOptions].map((option) => option.value) : id('levelRoles').value.split(/\s+/).filter(Boolean); await patch({ levelUpMessage: id('levelMessage').value, levelExcludedChannels: channels, levelExcludedRoles: roles }); id('levelingStudioNotice').textContent = 'XP controls saved.'; notify('Leveling settings updated.'); };
  };
  const addRulesStudio = () => {
    const host = document.querySelector('#view-rules .card'); if (!host || id('rulesStudio')) return;
    const card = document.createElement('div'); card.id = 'rulesStudio'; card.className = 'card'; card.innerHTML = '<h2>Rules content</h2><p>Publish a clear rules message to the configured channel through the bot.</p><label class="field">Rules description<textarea id="rulesDescription"></textarea></label><div class="save-row"><button class="primary" id="saveRulesStudio">Save rules</button><button class="secondary" id="publishRulesStudio">Publish rules</button></div><div class="notice" id="rulesStudioNotice"></div>'; host.appendChild(card);
    const load = async () => { if (!currentGuild()) return setTimeout(load, 700); const settings = await get(); id('rulesDescription').value = settings.rulesText || ''; }; load();
    id('saveRulesStudio').onclick = async () => { await patch({ rulesText: id('rulesDescription').value }); id('rulesStudioNotice').textContent = 'Rules saved.'; notify('Rules updated.'); };
    id('publishRulesStudio').onclick = () => { id('rulesStudioNotice').textContent = 'Rules saved. Use /rules in Discord to display them.'; id('saveRulesStudio').click(); };
  };
  const boot = () => { addGeneralStudio(); addAutoReplyStudio(); addSecurityStudio(); addAutoModStudio(); addLogsStudio(); addWelcomeStudio(); addLevelingStudio(); addRulesStudio(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
</script>
<script>
(() => {
  const channelFields = [
    ['welcomeChannelId', 'Welcome channel'], ['logChannelId', 'Log channel'], ['rulesChannelId', 'Rules channel'], ['goodbyeChannelId', 'Goodbye channel'], ['welcomeGoodbyeChannel', 'Goodbye channel']
  ];
  const channelOptions = async (selected, categories = false) => {
    const response = await fetch('/api/guilds/' + document.getElementById('guild').value + '/channels');
    const channels = await response.json();
    return channels.filter((channel) => categories ? channel.kind === 'category' : channel.kind === 'text').map((channel) => '<option value="' + channel.id + '" ' + (channel.id === selected ? 'selected' : '') + '>' + (categories ? '▰ ' : '# ') + channel.name + '</option>').join('');
  };
  const convertChannelField = async ([fieldId, label]) => {
    const input = document.getElementById(fieldId);
    if (!input || input.dataset.channelPicker) return;
    input.dataset.channelPicker = 'true';
    const select = document.createElement('select');
    select.id = fieldId;
    select.className = input.className || '';
    select.innerHTML = '<option value="">Select ' + label.toLowerCase() + '...</option>' + await channelOptions(input.value);
    input.replaceWith(select);
  };
  const addChannelPickers = async () => {
    if (!document.getElementById('guild')?.value) return setTimeout(addChannelPickers, 700);
    await Promise.all(channelFields.map(convertChannelField));
    const categoryInput = document.getElementById('studioCategoryId');
    if (categoryInput && !categoryInput.dataset.channelPicker) { categoryInput.dataset.channelPicker = 'true'; categoryInput.innerHTML = '<option value="">Use configured ticket category...</option>' + await channelOptions(categoryInput.value, true); }
  };
  const addTicketCategory = () => {
    const form = document.querySelector('#ticketStudio .form-grid');
    if (!form || document.getElementById('studioCategoryId')) return;
    const label = document.createElement('label'); label.className = 'field'; label.textContent = 'Ticket category'; const select = document.createElement('select'); select.id = 'studioCategoryId'; label.appendChild(select); form.appendChild(label);
    select.onchange = async () => { await fetch('/api/guilds/' + document.getElementById('guild').value, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ ticketCategoryId: select.value || null }) }); notify('Ticket category saved.'); };
  };
  const originalBoot = window.__channelPickerBoot;
  window.__channelPickerBoot = true;
  const boot = () => { addTicketCategory(); addChannelPickers(); window.addEventListener('focus', addChannelPickers); };
  if (!originalBoot) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else setTimeout(boot, 900); }
})();
</script>
<script>
(() => {
  const byId = (id) => document.getElementById(id);
  const guildId = () => byId('guild')?.value;
  const fetchResources = async () => {
    const response = await fetch('/api/guilds/' + guildId() + '/resources');
    if (!response.ok) throw new Error('Could not load server resources.');
    return response.json();
  };
  const optionLabel = (resource, kind) => kind === 'role' ? '@' + resource.name : resource.kind === 'category' ? '▰ ' + resource.name : '# ' + resource.name;
  const setOptions = (select, resources, kind, multiple = false) => {
    const selected = multiple ? new Set([...select.selectedOptions].map((option) => option.value)) : new Set([select.value]);
    const original = select.value;
    select.multiple = multiple;
    select.innerHTML = '<option value="">' + (multiple ? 'Choose one or more...' : 'Not configured') + '</option>' + resources.map((resource) => '<option value="' + resource.id + '">' + optionLabel(resource, kind) + '</option>').join('');
    [...select.options].forEach((option) => { if (option.value === original || selected.has(option.value)) option.selected = true; });
  };
  const replaceSelect = (fieldId, resources, kind, multiple = false) => {
    const field = byId(fieldId);
    if (!field || field.dataset.resourcePicker === 'true') return;
    field.dataset.resourcePicker = 'true';
    const select = document.createElement('select');
    select.id = fieldId;
    select.className = field.className;
    select.multiple = multiple;
    select.size = multiple ? 4 : 1;
    const current = field.value;
    select.innerHTML = '<option value="">' + (multiple ? 'Choose one or more...' : 'Not configured') + '</option>' + resources.map((resource) => '<option value="' + resource.id + '">' + optionLabel(resource, kind) + '</option>').join('');
    if (multiple) {
      const values = new Set(String(current || '').split(/\s+/).filter(Boolean));
      [...select.options].forEach((option) => { option.selected = values.has(option.value); });
    } else select.value = current;
    field.replaceWith(select);
  };
  const setupRewardEditor = (roles) => {
    const hidden = byId('levelRoleRewards');
    const editor = byId('levelRewardEditor');
    if (!hidden || !editor || editor.dataset.ready === 'true') return;
    editor.dataset.ready = 'true';
    editor.innerHTML = '<div class="form-grid"><label class="field">Reward role<select id="rewardRole"></select></label><label class="field">At level<input id="rewardLevel" type="number" min="1" max="1000" value="5"></label></div><button type="button" class="secondary" id="addReward">Add reward</button><div id="rewardRows" class="wizard-list"></div>';
    const roleSelect = byId('rewardRole');
    roleSelect.innerHTML = '<option value="">Choose a role...</option>' + roles.map((role) => '<option value="' + role.id + '">' + optionLabel(role, 'role') + '</option>').join('');
    const render = () => {
      let rewards = [];
      try { rewards = JSON.parse(hidden.value || '[]'); } catch { rewards = []; }
      byId('rewardRows').innerHTML = rewards.map((reward, index) => '<div class="wizard-item"><span style="flex:1"><strong>Level ' + reward.level + '</strong><small>' + (roles.find((role) => role.id === reward.roleId)?.name || 'Unknown role') + '</small></span><button type="button" class="secondary" data-remove-reward="' + index + '">Remove</button></div>').join('');
      byId('rewardRows').querySelectorAll('[data-remove-reward]').forEach((button) => button.onclick = () => { rewards.splice(Number(button.dataset.removeReward), 1); hidden.value = JSON.stringify(rewards); render(); });
    };
    byId('addReward').onclick = () => {
      const roleId = roleSelect.value;
      const level = Math.max(1, Number(byId('rewardLevel').value) || 1);
      if (!roleId) return notify('Choose a reward role first.');
      let rewards = [];
      try { rewards = JSON.parse(hidden.value || '[]'); } catch { rewards = []; }
      rewards = rewards.filter((reward) => reward.level !== level);
      rewards.push({ level, roleId });
      rewards.sort((first, second) => first.level - second.level);
      hidden.value = JSON.stringify(rewards);
      render();
    };
    render();
  };
  let syncInFlight = false;
  const syncPickers = async () => {
    if (!guildId() || syncInFlight) return;
    syncInFlight = true;
    try {
      const resources = await fetchResources();
      const channels = resources.channels.filter((channel) => channel.kind === 'text');
      const categories = resources.channels.filter((channel) => channel.kind === 'category');
      const roles = resources.roles;
      [['welcomeChannelId', channels, 'channel'], ['logChannelId', channels, 'channel'], ['rulesChannelId', channels, 'channel'], ['goodbyeChannelId', channels, 'channel'], ['welcomeGoodbyeChannel', channels, 'channel'], ['securityQuarantineRole', roles, 'role'], ['quarantineRoleId', roles, 'role']].forEach(([fieldId, list, kind]) => replaceSelect(fieldId, list, kind));
      [['generalRoles', roles, 'role'], ['selfAssignableRoleIds', roles, 'role'], ['levelExcludedRoles', roles, 'role'], ['levelRoles', roles, 'role']].forEach(([fieldId, list, kind]) => replaceSelect(fieldId, list, kind, true));
      [['levelExcludedChannels', channels, 'channel'], ['levelChannels', channels, 'channel']].forEach(([fieldId, list, kind]) => replaceSelect(fieldId, list, kind, true));
      const category = byId('studioCategoryId');
      if (category && category.options.length <= 1) setOptions(category, categories, 'channel');
      setupRewardEditor(roles);
    } catch (error) {
      notify(error.message);
    } finally {
      syncInFlight = false;
    }
  };
  const boot = () => {
    syncPickers();
    window.addEventListener('focus', syncPickers);
    new MutationObserver(() => { if (!syncInFlight) syncPickers(); }).observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
</script>`;
