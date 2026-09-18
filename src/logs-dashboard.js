export const logsDashboardEnhancement = `\n<style>
#logsManager{margin-top:16px}.logs-actions{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}.logs-actions .button{min-width:170px}.logs-help{color:#a9adab;font-size:13px;line-height:1.55}.log-event-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:14px 0}.log-event-option{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid #263758;background:#0b1326;border-radius:9px;padding:11px;color:#cbd4ea;font-size:12px}.log-event-option small{display:block;color:#8793b1;margin-top:3px}.log-routing{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.logs-panel{border-top:1px solid #263758;margin-top:18px;padding-top:18px}.logs-panel[hidden]{display:none}@media(max-width:650px){.log-event-grid,.log-routing{grid-template-columns:1fr}}
</style>
<script>
(() => {
  const id = (value) => document.getElementById(value);
  const guildId = () => id('guild')?.value;
  const api = async (url, options) => {
    const response = await fetch(url, options);
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Request failed');
    return body;
  };
  const notify = (message, error = false) => {
    if (typeof window.notify === 'function') return window.notify(message, error);
    const node = id('toast');
    if (node) { node.textContent = message; node.classList.add('show'); setTimeout(() => node.classList.remove('show'), 2600); }
  };
  const addLogsManager = () => {
    const view = id('view-logs');
    if (!view || id('logsManager')) return;
    view.querySelector('.card')?.remove();
    const card = document.createElement('div');
    card.id = 'logsManager';
    card.className = 'card';
    card.innerHTML = '<h2>Log channel manager</h2><p class="logs-help">Create a private log system with only the events you need, or route selected events into channels you already have.</p><div class="logs-actions"><button class="button primary" id="createLogButton">Create log</button><button class="button" id="addLogChannelButton">Add log channel</button></div><div class="logs-panel" id="createLogPanel" hidden><h3>Create private log channels</h3><p class="logs-help">Select the events this bot should create channels for. Existing channels are reused.</p><div class="log-event-grid" id="createLogEvents"></div><div class="actions"><button class="button primary" id="createSelectedLogs">Create selected logs</button></div><div class="notice" id="createLogNotice"></div></div><div class="logs-panel" id="addLogPanel" hidden><h3>Route events to a channel</h3><p class="logs-help">Choose a text channel and the events that should be sent there. Saving replaces the selected event routes.</p><div class="log-routing"><label class="field">Destination channel<select id="logRouteChannel"></select></label><label class="field">Events<select id="logRouteEvents" multiple></select></label></div><div class="actions"><button class="button primary" id="saveLogRoute">Save log channel</button></div><div class="notice" id="logRouteNotice"></div></div>';
    view.appendChild(card);
    id('setupLogs')?.remove();
    const eventOptions = (catalog, selected = []) => catalog.map((event) => '<label class="log-event-option"><span><strong>' + event.label + '</strong><small>' + event.group + '</small></span><input type="checkbox" value="' + event.key + '"' + (selected.includes(event.key) ? ' checked' : '') + '></label>').join('');
    const load = async () => {
      const guild = guildId();
      if (!guild) return;
      const [catalog, resources, settings] = await Promise.all([api('/api/log-events'), api('/api/guilds/' + guild + '/resources'), api('/api/guilds/' + guild)]);
      const configured = Object.keys(settings.logChannels || {});
      id('createLogEvents').innerHTML = eventOptions(catalog, configured);
      id('logRouteChannel').innerHTML = '<option value="">Choose a text channel...</option>' + resources.channels.filter((channel) => channel.kind === 'text').map((channel) => '<option value="' + channel.id + '">' + escapeHtml(channel.name) + '</option>').join('');
      id('logRouteEvents').innerHTML = catalog.map((event) => '<option value="' + event.key + '">' + escapeHtml(event.label) + ' (' + escapeHtml(event.group) + ')</option>').join('');
    };
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
    id('createLogButton').onclick = async () => { id('createLogPanel').hidden = false; id('addLogPanel').hidden = true; try { await load(); } catch (error) { notify(error.message, true); } };
    id('addLogChannelButton').onclick = async () => { id('addLogPanel').hidden = false; id('createLogPanel').hidden = true; try { await load(); } catch (error) { notify(error.message, true); } };
    id('createSelectedLogs').onclick = async () => {
      const eventKeys = [...document.querySelectorAll('#createLogEvents input:checked')].map((input) => input.value);
      if (!eventKeys.length) return notify('Select at least one log event.', true);
      const button = id('createSelectedLogs'); button.disabled = true;
      try { const result = await api('/api/guilds/' + guildId() + '/logs/setup', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ eventKeys }) }); id('createLogNotice').textContent = 'Created or reused ' + result.created + ' log channels.'; notify('Selected log channels are ready.'); await load(); } catch (error) { id('createLogNotice').textContent = error.message; notify(error.message, true); } finally { button.disabled = false; }
    };
    id('saveLogRoute').onclick = async () => {
      const channelId = id('logRouteChannel').value;
      const eventKeys = [...id('logRouteEvents').selectedOptions].map((option) => option.value);
      if (!channelId || !eventKeys.length) return notify('Choose a channel and at least one event.', true);
      const button = id('saveLogRoute'); button.disabled = true;
      try { await api('/api/guilds/' + guildId() + '/logs/channel', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ channelId, eventKeys }) }); id('logRouteNotice').textContent = 'Log routing saved.'; notify('Log events are now routed to that channel.'); } catch (error) { id('logRouteNotice').textContent = error.message; notify(error.message, true); } finally { button.disabled = false; }
    };
    load().catch(() => {});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addLogsManager); else addLogsManager();
})();
</script>`;
