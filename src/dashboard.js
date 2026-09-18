import express from 'express';
import { ChannelType } from 'discord.js';
import { dashboardPage } from './dashboard-ui.js';
import { infoPage } from './info-ui.js';
import { getGuildSnapshot, getCommandCatalog, serializeSettingsForApi } from './bot-refinements.js';
import crypto from 'node:crypto';


const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Server Control</title>
<style>
:root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#e8edf7;background:#080b18;--panel:#10162a;--panel2:#151c34;--line:#273252;--muted:#8d98b6;--purple:#6558ed;--purple2:#8075ff;--good:#4bd69b}*{box-sizing:border-box}body{margin:0;background:#080b18}button,input,textarea,select{font:inherit}button{cursor:pointer}.shell{display:grid;grid-template-columns:270px 1fr;min-height:100vh}.sidebar{background:#0b1124;border-right:1px solid #161f3d;padding:18px 14px;overflow:auto}.brand{display:flex;align-items:center;gap:10px;padding:5px 10px 22px;color:#fff;font-weight:800}.brand-mark{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:var(--purple);font-size:14px}.server{width:100%;display:flex;align-items:center;gap:10px;text-align:left;color:#edf0fb;background:#121a31;border:1px solid #2a3659;padding:12px;border-radius:8px}.server strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.server small{color:var(--muted);font-size:11px}.server-arrow{margin-left:auto;color:var(--muted)}.nav-label{margin:23px 10px 7px;color:#6f7b9c;text-transform:uppercase;font-size:10px;font-weight:800;letter-spacing:.12em}.nav button{display:flex;align-items:center;gap:12px;width:100%;padding:10px;border:0;border-radius:6px;background:transparent;color:#929db9;text-align:left;font-size:14px}.nav button:hover,.nav button.active{background:#202950;color:#fff}.nav-icon{width:18px;text-align:center;color:#9e9afc}.main{min-width:0}.topbar{height:72px;border-bottom:1px solid #171f39;display:flex;align-items:center;justify-content:space-between;padding:0 32px}.crumb{color:#fff;font-weight:700}.crumb span{color:var(--muted);font-weight:400}.top-actions{display:flex;align-items:center;gap:12px}.pill{padding:7px 10px;border:1px solid #263459;border-radius:99px;color:#aeb9d3;font-size:12px}.dot{display:inline-block;width:7px;height:7px;background:var(--good);border-radius:50%;margin-right:6px}.content{max-width:1100px;padding:38px 40px 70px}.eyebrow{color:#847dff;text-transform:uppercase;letter-spacing:.14em;font-size:11px;font-weight:800}.hero{display:flex;justify-content:space-between;gap:20px;align-items:end;margin-bottom:29px}.hero h1{font-size:34px;margin:8px 0 6px;letter-spacing:-.03em}.hero p{color:var(--muted);margin:0;font-size:14px}.hero-actions{display:flex;gap:9px}.primary,.secondary{border-radius:6px;padding:10px 14px;border:1px solid transparent;font-weight:700;font-size:13px}.primary{background:var(--purple);color:white}.primary:hover{background:var(--purple2)}.secondary{background:#151d35;border-color:#2c3a63;color:#d7def1}.view{display:none}.view.active{display:block}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}.stat,.card{background:var(--panel);border:1px solid var(--line);border-radius:8px}.stat{padding:16px}.stat-label{color:var(--muted);font-size:11px}.stat-value{font-size:25px;font-weight:800;margin-top:7px}.stat-value.good{color:var(--good)}.card{padding:22px}.card h2{font-size:18px;margin:0 0 6px}.card h3{font-size:14px;margin:22px 0 0}.card p,.sub{font-size:13px;color:var(--muted);line-height:1.55}.cards{display:grid;grid-template-columns:1fr 1fr;gap:14px}.wide{grid-column:1/-1}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}.field{display:flex;flex-direction:column;gap:7px;color:#b8c1d8;font-size:12px}.field input,.field textarea,.field select{background:#0c1225;border:1px solid #2a375a;border-radius:5px;padding:10px;color:#f3f5fb;outline:0}.field input:focus,.field textarea:focus{border-color:var(--purple)}.field textarea{min-height:110px;resize:vertical}.check-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:17px 0}.check{display:flex;justify-content:space-between;align-items:center;border:1px solid #263455;background:#0c1225;border-radius:6px;padding:12px;color:#c8d0e2;font-size:13px}.check input{accent-color:var(--purple);width:16px;height:16px}.save-row{display:flex;justify-content:flex-end;margin-top:20px}.notice{margin-top:12px;color:var(--good);font-size:12px;min-height:17px}.empty{display:grid;place-items:center;min-height:300px;text-align:center;background:var(--panel);border:1px solid var(--line);border-radius:8px}.empty h2{margin:15px 0 7px}.empty p{color:var(--muted);font-size:13px}.empty-mark{font-size:35px}.hidden{display:none}@media(max-width:900px){.shell{grid-template-columns:220px 1fr}.content{padding:28px 22px}.stats{grid-template-columns:1fr 1fr}}@media(max-width:650px){.shell{display:block}.sidebar{position:static}.nav{display:grid;grid-template-columns:1fr 1fr}.nav-label{grid-column:1/-1}.topbar{padding:0 18px}.content{padding:25px 15px}.hero{display:block}.hero-actions{margin-top:18px}.cards,.form-grid{grid-template-columns:1fr}.wide{grid-column:auto}.stats{grid-template-columns:1fr 1fr}.top-actions{display:none}}
</style></head>
<body><div class="shell"><aside class="sidebar"><div class="brand"><span class="brand-mark">SC</span><span>Server Control</span></div><button class="server" id="serverButton"><span class="brand-mark">S</span><span><strong id="serverName">Loading server</strong><small>Bot connected</small></span><span class="server-arrow">v</span></button><select id="guild" class="hidden"></select><nav class="nav"><div class="nav-label">Moderation Settings</div><button data-view="general" class="active"><span class="nav-icon">G</span> General</button><button data-view="moderation"><span class="nav-icon">M</span> Mod Commands</button><button data-view="automod"><span class="nav-icon">A</span> Auto Mod</button><button data-view="protection"><span class="nav-icon">P</span> Protection</button><button data-view="logs"><span class="nav-icon">L</span> Logs</button><div class="nav-label">General Settings</div><button data-view="tickets"><span class="nav-icon">T</span> Tickets</button><button data-view="welcome"><span class="nav-icon">W</span> Welcome</button><button data-view="commands"><span class="nav-icon">C</span> Commands</button><button data-view="leveling"><span class="nav-icon">V</span> Leveling System</button><button data-view="rules"><span class="nav-icon">R</span> Rules</button></nav></aside><main class="main"><header class="topbar"><div class="crumb">Dashboard <span>/ Server settings</span></div><div class="top-actions"><span class="pill"><i class="dot"></i>Bot online</span><button class="secondary" id="refresh">Refresh</button></div></header><div class="content"><div class="hero"><div><div class="eyebrow">Workspace overview</div><h1 id="viewTitle">General</h1><p id="viewDescription">A clear read on how your server is configured.</p></div><div class="hero-actions"><button class="secondary" id="load">Change server</button></div></div><section class="view active" id="view-general"><div class="stats"><div class="stat"><div class="stat-label">Protection rules</div><div class="stat-value" id="protectionCount">4 / 4</div></div><div class="stat"><div class="stat-label">Command prefix</div><div class="stat-value" id="prefixStat">?</div></div><div class="stat"><div class="stat-label">XP system</div><div class="stat-value good">Active</div></div><div class="stat"><div class="stat-label">Blacklist</div><div class="stat-value" id="blacklistStat">0</div></div></div><div class="cards"><div class="card"><h2>Server overview</h2><p>Manage the control points that shape day-to-day operations. Use the sections on the left to tune one area at a time.</p><div class="form-grid"><label class="field">Text command prefix<input id="prefix" maxlength="3"></label><label class="field">Rules channel<input id="rulesChannelId"></label></div><div class="save-row"><button class="primary" id="saveGeneral">Save general</button></div><div class="notice" id="generalNotice"></div></div><div class="card"><h2>Quick actions</h2><p>Common server workflows, kept close at hand.</p><div class="hero-actions"><button class="primary" data-jump="tickets">Set up tickets</button><button class="secondary" data-jump="protection">Review protection</button></div></div></div></section><section class="view" id="view-protection"><div class="card"><h2>Protection</h2><p>Wick-inspired protection controls for spam, invites, caps, and raid bursts.</p><div class="check-grid"><label class="check">Anti-spam <input type="checkbox" id="antiSpam"></label><label class="check">Anti-invites <input type="checkbox" id="antiInvite"></label><label class="check">Anti-caps <input type="checkbox" id="antiCaps"></label><label class="check">Anti-raid <input type="checkbox" id="antiRaid"></label></div><div class="save-row"><button class="primary" id="saveSecurity">Save protection</button></div><div class="notice" id="securityNotice"></div></div></section><section class="view" id="view-welcome"><div class="card"><h2>Welcome experience</h2><p>Give new members a consistent first message.</p><div class="form-grid"><label class="field">Welcome channel<select id="welcomeChannelId"></select></label><label class="field">Welcome message<textarea id="welcomeMessage"></textarea></label></div><div class="save-row"><button class="primary" id="saveWelcome">Save welcome</button></div><div class="notice" id="welcomeNotice"></div></div></section><section class="view" id="view-rules"><div class="card"><h2>Rules</h2><p>Write the shared standard and choose where it belongs.</p><label class="field">Rules text<textarea id="rulesText"></textarea></label><div class="save-row"><button class="primary" id="saveRules">Save rules</button></div><div class="notice" id="rulesNotice"></div></div></section><section class="view" id="view-logs"><div class="card"><h2>Logs</h2><p>Keep moderation and ticket activity visible to your staff.</p><label class="field">Moderation log channel<select id="logChannelId"></select></label><div class="save-row"><button class="primary" id="saveLogs">Save logs</button></div><div class="notice" id="logsNotice"></div></div></section><section class="view" id="view-tickets"><div class="card"><h2>Tickets</h2><p>Create a private support category, an open-ticket channel, and a button panel in one step.</p><button class="primary" id="setupTickets">Create ticket system</button><div class="notice" id="ticketNotice"></div></section><section class="view" id="view-commands"><div class="card"><h2>Commands</h2><p>Slash commands always use Discord's <b>/</b>. Text commands use your selected prefix.</p><p class="sub">Try <code id="prefixExample">?help</code>, <code>?ticket</code>, <code>?security</code>, or <code>?leaderboard</code>.</p></div></section><section class="view" id="view-leveling"><div class="card"><h2>Leveling System</h2><p>XP is earned from meaningful messages and stored per server. Members can use the level and leaderboard commands.</p><div class="stat"><div class="stat-label">Status</div><div class="stat-value good">Active</div></div></section><section class="view" id="view-moderation"><div class="card"><h2>Mod Commands</h2><p>Moderators can use ban, kick, timeout, warn, warnings, clear, lock, unlock, slowmode, role, and blacklist commands.</p></div></section><section class="view" id="view-automod"><div class="card"><h2>Auto Mod</h2><p>Blocked words, invite protection, caps protection, and spam protection are handled automatically by the bot.</p></section></div></main></div><script>
const $=id=>document.getElementById(id);let current;const titles={general:['General','A clear read on how your server is configured.'],moderation:['Mod Commands','Fast tools for your moderation team.'],automod:['Auto Mod','Automatic message protection and cleanup.'],protection:['Protection','Guardrails for a busy server.'],logs:['Logs','A record of actions your team can review.'],tickets:['Tickets','A private support path for members.'],welcome:['Welcome','The first message new members receive.'],commands:['Commands','Prefix and slash command behavior.'],leveling:['Leveling System','A lightweight reward loop for participation.'],rules:['Rules','The standard everyone can see.']};
async function api(url,options){const r=await fetch(url,options);const d=await r.json();if(!r.ok)throw Error(d.error||'Request failed');return d}async function save(body,target){try{await api('/api/guilds/'+current,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});$(target).textContent='Saved successfully';await loadSettings(current)}catch(e){$(target).textContent=e.message}}
async function loadGuilds(){const gs=await api('/api/guilds');$('guild').innerHTML=gs.map(g=>'<option value="'+g.id+'">'+g.name+'</option>').join('');if(gs[0])await loadSettings(gs[0].id)}async function loadSettings(id){current=id;const s=await api('/api/guilds/'+id);$('serverName').textContent=s.name;$('prefix').value=s.prefix||'!';$('prefixStat').textContent=s.prefix||'!';$('prefixExample').textContent=(s.prefix||'!')+'help';$('blacklistStat').textContent=s.blacklist?.length||0;$('antiSpam').checked=s.security.antiSpam;$('antiInvite').checked=s.security.antiInvite;$('antiCaps').checked=s.security.antiCaps;$('antiRaid').checked=s.security.antiRaid;$('welcomeChannelId').value=s.welcomeChannelId||'';$('logChannelId').value=s.logChannelId||'';$('rulesChannelId').value=s.rulesChannelId||'';$('welcomeMessage').value=s.welcomeMessage||'';$('rulesText').value=s.rulesText||'';document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.querySelector('#view-general').classList.add('active');document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));document.querySelector('[data-view="general"]').classList.add('active')}
function show(view){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));$('view-'+view).classList.add('active');document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));$('viewTitle').textContent=titles[view][0];$('viewDescription').textContent=titles[view][1]}
document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>show(b.dataset.view));document.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>show(b.dataset.jump));$('load').onclick=()=>loadSettings($('guild').value);$('refresh').onclick=()=>loadSettings(current);$('serverButton').onclick=()=>$('guild').classList.toggle('hidden');$('saveGeneral').onclick=()=>save({prefix:$('prefix').value,rulesChannelId:$('rulesChannelId').value||null},'generalNotice');$('saveSecurity').onclick=()=>save({security:{antiSpam:$('antiSpam').checked,antiInvite:$('antiInvite').checked,antiCaps:$('antiCaps').checked,antiRaid:$('antiRaid').checked}},'securityNotice');$('saveWelcome').onclick=()=>save({welcomeChannelId:$('welcomeChannelId').value||null,welcomeMessage:$('welcomeMessage').value},'welcomeNotice');$('saveRules').onclick=()=>save({rulesText:$('rulesText').value},'rulesNotice');$('saveLogs').onclick=()=>save({logChannelId:$('logChannelId').value||null},'logsNotice');$('setupTickets').onclick=async()=>{try{const d=await api('/api/guilds/'+current+'/tickets',{method:'POST'});$('ticketNotice').textContent=d.message}catch(e){$('ticketNotice').textContent=e.message}};loadGuilds().catch(e=>$('serverName').textContent=e.message);
</script><script>
const extraFields = { automod: '<div class="card" id="automodControls"><h2>Filter controls</h2><p>Configure the words and action used by automatic moderation.</p><div class="form-grid"><label class="field">Blocked words, comma separated<textarea id="blockedWords"></textarea></label><label class="field">Action<select id="automodAction"><option value="delete">Delete message</option><option value="warn">Delete and warn</option></select></label></div><div class="save-row"><button class="primary" id="saveAutomod">Save Auto Mod</button></div><div class="notice" id="automodNotice"></div></div>', welcome: '<div class="card" id="goodbyeControls"><h2>Goodbye messages</h2><p>Send a final message when a member leaves.</p><div class="form-grid"><label class="field">Goodbye channel<select id="goodbyeChannelId"></select></label><label class="field">Goodbye message<textarea id="goodbyeMessage"></textarea></label></div><div class="save-row"><button class="primary" id="saveGoodbye">Save goodbye</button></div><div class="notice" id="goodbyeNotice"></div></div>', leveling: '<div class="card" id="levelControls"><h2>Level rewards</h2><p>Control XP exclusions and reward roles using server resources.</p><div class="form-grid"><label class="field">Level-up message<textarea id="levelUpMessage"></textarea></label><label class="field">Reward roles and levels<div id="levelRewardEditor"></div><textarea id="levelRoleRewards" class="hidden"></textarea></label><label class="field">Excluded channels<select id="levelExcludedChannels" multiple></select></label><label class="field">Excluded roles<select id="levelExcludedRoles" multiple></select></label></div><div class="save-row"><button class="primary" id="saveLeveling">Save leveling</button></div><div class="notice" id="levelingNotice"></div></div>'};
for (const [view, markup] of Object.entries(extraFields)) document.querySelector('#view-'+view)?.insertAdjacentHTML('beforeend', markup);
document.querySelector('#view-general')?.insertAdjacentHTML('beforeend','<div class="card" id="communityRoles"><h2>Community roles</h2><p>Choose which roles members may add or remove with <code>/selfrole</code>. Keep this list intentionally small.</p><label class="field">Self-assignable roles<select id="selfAssignableRoleIds" multiple></select></label><div class="save-row"><button class="primary" id="saveCommunityRoles">Save community roles</button></div><div class="notice" id="communityRolesNotice"></div></div>');
const selectedValues = (element) => element?.selectedOptions ? [...element.selectedOptions].map((option) => option.value) : String(element?.value || '').split(/\s+/).filter(Boolean);
async function loadExtraSettings(){if(!current)return;const s=await api('/api/guilds/'+current);$('blockedWords').value=(s.blockedWords||[]).join(', ');$('automodAction').value=s.automodAction||'delete';$('goodbyeChannelId').value=s.goodbyeChannelId||'';$('goodbyeMessage').value=s.goodbyeMessage||'';$('levelUpMessage').value=s.levelUpMessage||'';for(const id of ['levelExcludedChannels','levelExcludedRoles','selfAssignableRoleIds']){const values=new Set(s[id]||[]);if($(id)?.options) [...$(id).options].forEach((option)=>option.selected=values.has(option.value));else $(id).value=(s[id]||[]).join('\\n')}$('levelRoleRewards').value=JSON.stringify(s.levelRoleRewards||[],null,2)}
setTimeout(loadExtraSettings,300);$('saveAutomod').onclick=()=>save({blockedWords:$('blockedWords').value.split(',').map(word=>word.trim().toLowerCase()).filter(Boolean),automodAction:$('automodAction').value},'automodNotice');$('saveGoodbye').onclick=()=>save({goodbyeChannelId:$('goodbyeChannelId').value||null,goodbyeMessage:$('goodbyeMessage').value},'goodbyeNotice');$('saveLeveling').onclick=()=>{let rewards=[];try{rewards=JSON.parse($('levelRoleRewards').value||'[]')}catch{ $('levelingNotice').textContent='Reward configuration is invalid';return}save({levelUpMessage:$('levelUpMessage').value,levelExcludedChannels:selectedValues($('levelExcludedChannels')),levelExcludedRoles:selectedValues($('levelExcludedRoles')),levelRoleRewards:rewards},'levelingNotice')};$('saveCommunityRoles').onclick=()=>save({selfAssignableRoleIds:selectedValues($('selfAssignableRoleIds'))},'communityRolesNotice');
</script><script>
document.querySelector('#view-tickets')?.insertAdjacentHTML('beforeend','<div class="card" id="ticketControls"><h2>Ticket experience</h2><p>Every label, message, panel detail, and ticket name can be changed here.</p><div class="form-grid"><label class="field">Panel title<input id="ticketPanelTitle"></label><label class="field">Button label<input id="ticketButtonLabel" maxlength="80"></label><label class="field">Panel description<textarea id="ticketPanelDescription"></textarea></label><label class="field">Button style<select id="ticketButtonStyle"><option>Primary</option><option>Secondary</option><option>Success</option><option>Danger</option></select></label><label class="field">Ticket name prefix<input id="ticketNamePrefix" maxlength="20"></label><label class="field">Close button label<input id="ticketCloseLabel" maxlength="80"></label><label class="field">Opening response title<input id="ticketWelcomeTitle"></label><label class="field">Opening response<textarea id="ticketWelcomeMessage"></textarea></label></div><div class="save-row"><button class="primary" id="saveTicketSettings">Save ticket experience</button><button class="secondary" id="refreshTicketPanel">Update panel message</button></div><div class="notice" id="ticketSettingsNotice"></div></div>');
async function loadTicketSettings(){if(!current)return;const s=await api('/api/guilds/'+current);$('ticketPanelTitle').value=s.ticketPanelTitle||'';$('ticketPanelDescription').value=s.ticketPanelDescription||'';$('ticketButtonLabel').value=s.ticketButtonLabel||'';$('ticketButtonStyle').value=s.ticketButtonStyle||'Primary';$('ticketNamePrefix').value=s.ticketNamePrefix||'ticket';$('ticketWelcomeTitle').value=s.ticketWelcomeTitle||'';$('ticketWelcomeMessage').value=s.ticketWelcomeMessage||'';$('ticketCloseLabel').value=s.ticketCloseLabel||''}
setTimeout(loadTicketSettings,400);window.addEventListener('focus',loadTicketSettings);$('saveTicketSettings').onclick=()=>save({ticketPanelTitle:$('ticketPanelTitle').value,ticketPanelDescription:$('ticketPanelDescription').value,ticketButtonLabel:$('ticketButtonLabel').value,ticketButtonStyle:$('ticketButtonStyle').value,ticketNamePrefix:$('ticketNamePrefix').value,ticketWelcomeTitle:$('ticketWelcomeTitle').value,ticketWelcomeMessage:$('ticketWelcomeMessage').value,ticketCloseLabel:$('ticketCloseLabel').value},'ticketSettingsNotice');$('refreshTicketPanel').onclick=async()=>{try{const d=await api('/api/guilds/'+current+'/tickets',{method:'POST'});$('ticketSettingsNotice').textContent=d.message}catch(e){$('ticketSettingsNotice').textContent=e.message}};
</script><script>
document.querySelector('#view-moderation')?.insertAdjacentHTML('beforeend','<div class="card" id="modAliasControls"><h2>Custom moderation words</h2><p>Give commands your own words. Use one alias per line for each action.</p><div class="form-grid"><label class="field">Quarantine role<select id="quarantineRoleId"></select></label><label class="field">Ban aliases<textarea id="aliasesBan" placeholder="remove, blacklist"></textarea></label><label class="field">Kick aliases<textarea id="aliasesKick" placeholder="boot, bye"></textarea></label><label class="field">Timeout aliases<textarea id="aliasesTimeout" placeholder="mute, silence"></textarea></label><label class="field">Warn aliases<textarea id="aliasesWarn" placeholder="strike"></textarea></label><label class="field">Purge / clear aliases<textarea id="aliasesPurge" placeholder="clean, prune"></textarea></label><label class="field">Lock aliases<textarea id="aliasesLock" placeholder="freeze"></textarea></label><label class="field">Unlock aliases<textarea id="aliasesUnlock" placeholder="unfreeze"></textarea></label><label class="field">Quarantine aliases<textarea id="aliasesQuarantine" placeholder="isolate"></textarea></label></div><div class="save-row"><button class="primary" id="saveModAliases">Save moderation words</button></div><div class="notice" id="modAliasNotice"></div></div>');
async function loadModAliases(){if(!current)return;const s=await api('/api/guilds/'+current);$('quarantineRoleId').value=s.quarantineRoleId||'';for(const name of ['Ban','Kick','Timeout','Warn','Purge','Lock','Unlock','Quarantine'])$('aliases'+name).value=(s.commandAliases?.[name.toLowerCase()]||[]).join('\\n')}
setTimeout(loadModAliases,500);window.addEventListener('focus',loadModAliases);$('saveModAliases').onclick=()=>{const aliases={};for(const name of ['Ban','Kick','Timeout','Warn','Purge','Lock','Unlock','Quarantine'])aliases[name.toLowerCase()]=$('aliases'+name).value.split(/\s+/).map(word=>word.trim().toLowerCase()).filter(Boolean);save({quarantineRoleId:$('quarantineRoleId').value||null,commandAliases:aliases},'modAliasNotice')};
</script><script>
document.querySelector('#modAliasControls')?.insertAdjacentHTML('beforeend','<div class="form-grid"><label class="field">Softban aliases<textarea id="aliasesSoftban" placeholder="softremove"></textarea></label><label class="field">Unmute aliases<textarea id="aliasesUnmute" placeholder="restore"></textarea></label><label class="field">Lockdown aliases<textarea id="aliasesLockdown" placeholder="panic"></textarea></label></div>');
async function loadExtendedAliases(){if(!current)return;const s=await api('/api/guilds/'+current);for(const name of ['Softban','Unmute','Lockdown'])$('aliases'+name).value=(s.commandAliases?.[name.toLowerCase()]||[]).join('\\n')}
setTimeout(loadExtendedAliases,600);window.addEventListener('focus',loadExtendedAliases);$('saveModAliases').onclick=()=>{const aliases={};for(const name of ['Ban','Kick','Timeout','Warn','Purge','Lock','Unlock','Quarantine','Softban','Unmute','Lockdown'])aliases[name.toLowerCase()]=$('aliases'+name).value.split(/\s+/).map(word=>word.trim().toLowerCase()).filter(Boolean);save({quarantineRoleId:$('quarantineRoleId').value||null,commandAliases:aliases},'modAliasNotice')};
</script></body></html>`;

export function startDashboard({ client, getGuildData, saveData, createTicketSetup, createServerSetup, ensurePrivateLogChannel, publishVerificationPanel }) {
  const app = express();
  app.set('trust proxy', 1);
  const sessions = new Map();
  const publicUrl = process.env.DASHBOARD_PUBLIC_URL;
  const clientId = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI || (publicUrl ? `${publicUrl.replace(/\/$/, '')}/auth/callback` : null);
  const secureCookies = /^https:\/\//i.test(publicUrl || '');
  const cookieSuffix = `HttpOnly; SameSite=Lax;${secureCookies ? ' Secure;' : ''} Path=/`;
  const parseCookies = (value = '') => Object.fromEntries(value.split(';').map((part) => part.trim().split('=').map(decodeURIComponent)).filter((parts) => parts.length === 2));
  const getSession = (request) => {
    const id = parseCookies(request.headers.cookie).dashboard_session;
    const session = sessions.get(id);
    if (session && session.expiresAt <= Date.now()) sessions.delete(id);
    return session && session.expiresAt > Date.now() ? session : null;
  };
  const requireAuth = (request, response, next) => {
    if (!clientId || !clientSecret || !redirectUri) return response.status(503).json({ error: 'Dashboard OAuth is not configured. Set DISCORD_CLIENT_ID (or CLIENT_ID), DISCORD_CLIENT_SECRET, and DASHBOARD_PUBLIC_URL.' });
    const session = getSession(request);
    if (!session) return response.status(401).json({ error: 'Sign in with Discord to use the dashboard.' });
    request.dashboardSession = session;
    return next();
  };
  const permittedGuilds = (session) => client.guilds.cache.filter((guild) => {
    const remote = session.guilds.find((item) => item.id === guild.id);
    return remote && (BigInt(remote.permissions) & 0x8n) === 0x8n;
  });
  const requireGuildAdmin = (request, response, next) => {
    if (!request.dashboardSession || !permittedGuilds(request.dashboardSession).has(request.params.id)) {
      return response.status(403).json({ error: 'You need Administrator permission in this server.' });
    }
    return next();
  };
  app.use(express.json());
  app.get('/', (_request, response) => response.type('html').send(infoPage));
  app.get('/dashboard', (_request, response) => response.type('html').send(dashboardPage));
  app.get('/health', (_request, response) => response.json({ ok: true, uptime: process.uptime(), guilds: client.guilds.cache.size, timestamp: new Date().toISOString() }));
  app.get('/auth/login', (_request, response) => {
    if (!clientId || !clientSecret || !redirectUri) return response.status(503).send('Dashboard OAuth is not configured.');
    const state = crypto.randomBytes(24).toString('hex');
    response.setHeader('Set-Cookie', `dashboard_oauth_state=${state}; ${cookieSuffix}; Max-Age=600`);
    return response.redirect(`https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(clientId)}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identify%20guilds&state=${encodeURIComponent(state)}`);
  });
  app.get('/auth/callback', async (request, response) => {
    try {
      if (!request.query.code) return response.redirect('/auth/login');
      const cookies = parseCookies(request.headers.cookie);
      if (!request.query.state || !cookies.dashboard_oauth_state || request.query.state !== cookies.dashboard_oauth_state) {
        return response.status(400).send('Invalid Discord sign-in state. Please try signing in again.');
      }
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: 'authorization_code', code: request.query.code, redirect_uri: redirectUri }) });
      if (!tokenResponse.ok) throw new Error(`Discord OAuth token exchange failed (HTTP ${tokenResponse.status}).`);
      const token = await tokenResponse.json();
      const [userResponse, guildResponse] = await Promise.all([fetch('https://discord.com/api/users/@me', { headers: { authorization: `${token.token_type} ${token.access_token}` } }), fetch('https://discord.com/api/users/@me/guilds', { headers: { authorization: `${token.token_type} ${token.access_token}` } })]);
      if (!userResponse.ok || !guildResponse.ok) throw new Error('Discord OAuth verification failed.');
      const sessionId = crypto.randomBytes(32).toString('hex');
      sessions.set(sessionId, { user: await userResponse.json(), guilds: await guildResponse.json(), expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 });
      response.setHeader('Set-Cookie', [
        `dashboard_session=${sessionId}; ${cookieSuffix}; Max-Age=2592000`,
        `dashboard_oauth_state=; ${cookieSuffix}; Max-Age=0`
      ]);
      return response.redirect('/dashboard');
    } catch (error) {
      return response.status(502).send(`Discord sign-in failed: ${error.message}`);
    }
  });
  app.get('/auth/logout', (request, response) => {
    const cookies = parseCookies(request.headers.cookie);
    if (cookies.dashboard_session) sessions.delete(cookies.dashboard_session);
    response.setHeader('Set-Cookie', `dashboard_session=; ${cookieSuffix}; Max-Age=0`);
    return response.redirect('/dashboard');
  });
  app.use('/api', requireAuth);
  app.get('/api/guilds', requireAuth, (request, response) => response.json(permittedGuilds(request.dashboardSession).map((guild) => {
    const remote = request.dashboardSession.guilds.find((item) => item.id === guild.id);
    const iconHash = remote?.icon || guild.icon;
    return { id: guild.id, name: guild.name, icon: iconHash, iconUrl: iconHash ? `https://cdn.discordapp.com/icons/${guild.id}/${iconHash}.${iconHash.startsWith('a_') ? 'gif' : 'png'}?size=64` : null };
  })));
  app.use('/api/guilds/:id', requireGuildAdmin);
  app.get('/api/guilds/:id', requireAuth, (request, response) => {
    if (!permittedGuilds(request.dashboardSession).has(request.params.id)) return response.status(403).json({ error: 'You need Administrator permission in this server.' });
    const guild = client.guilds.cache.get(request.params.id);
    if (!guild) return response.status(404).json({ error: 'Server not found or bot is offline there.' });
    const settings = getGuildData(guild.id);
    return response.json({ name: guild.name, ...serializeSettingsForApi(settings), ...getGuildSnapshot(guild, settings) });
  });
  app.get('/api/commands', requireAuth, (_request, response) => response.json(getCommandCatalog()));
  app.get('/api/guilds/:id/channels', (request, response) => {
    const guild = client.guilds.cache.get(request.params.id);
    if (!guild) return response.status(404).json({ error: 'Server not found.' });
    return response.json(guild.channels.cache.filter((channel) => channel.isTextBased() || channel.type === ChannelType.GuildCategory).map((channel) => ({ id: channel.id, name: channel.name, type: channel.type, kind: channel.type === ChannelType.GuildCategory ? 'category' : 'text' })));
  });
  app.get('/api/guilds/:id/roles', (request, response) => {
    const guild = client.guilds.cache.get(request.params.id);
    if (!guild) return response.status(404).json({ error: 'Server not found.' });
    return response.json(guild.roles.cache.filter((role) => role.id !== guild.id).sort((a, b) => b.position - a.position).map((role) => ({ id: role.id, name: role.name, position: role.position })));
  });
  app.get('/api/guilds/:id/resources', (request, response) => {
    const guild = client.guilds.cache.get(request.params.id);
    if (!guild) return response.status(404).json({ error: 'Server not found.' });
    return response.json({
      channels: guild.channels.cache
        .filter((channel) => channel.isTextBased() || channel.isVoiceBased() || channel.type === ChannelType.GuildCategory)
        .sort((first, second) => first.position - second.position)
        .map((channel) => ({ id: channel.id, name: channel.name, type: channel.type, kind: channel.type === ChannelType.GuildCategory ? 'category' : channel.isVoiceBased() ? 'voice' : 'text', parentId: channel.parentId || null })),
      roles: guild.roles.cache
        .filter((role) => role.id !== guild.id)
        .sort((first, second) => second.position - first.position)
        .map((role) => ({ id: role.id, name: role.name, position: role.position }))
    });
  });
  app.get('/api/guilds/:id/clans', requireAuth, requireGuildAdmin, (request, response) => {
    const guild = client.guilds.cache.get(request.params.id);
    if (!guild) return response.status(404).json({ error: 'Server not found.' });
    const settings = getGuildData(guild.id);
    return response.json(Object.values(settings.clans || {}).sort((first, second) => (second.points || 0) - (first.points || 0)).map((clan) => ({
      ...clan,
      ownerName: guild.members.cache.get(clan.ownerId)?.user?.username || clan.ownerId,
      members: clan.members.map((id) => ({ id, name: guild.members.cache.get(id)?.user?.username || id }))
    })));
  });
  app.post('/api/guilds/:id/verification', requireAuth, requireGuildAdmin, async (request, response) => {
    const guild = client.guilds.cache.get(request.params.id);
    if (!guild) return response.status(404).json({ error: 'Server not found.' });
    try {
      const settings = getGuildData(guild.id);
      const message = await publishVerificationPanel(guild, settings);
      return response.json({ ok: true, messageId: message.id });
    } catch (error) {
      return response.status(400).json({ error: error.message });
    }
  });
  app.patch('/api/guilds/:id', (request, response) => {
    const guild = client.guilds.cache.get(request.params.id);
    if (!guild) return response.status(404).json({ error: 'Server not found.' });
    const settings = getGuildData(guild.id);
    for (const key of ['prefix', 'language', 'embedColor', 'commandEnabled', 'commandAliases', 'autoRoleIds', 'selfAssignableRoleIds', 'autoReplies', 'quarantineRoleId', 'verifiedRoleId', 'joinToCreateChannelId', 'afkRoleId', 'afkChannelId', 'suggestionsChannelId', 'islamicReminders', 'welcomeChannelId', 'welcomeMessage', 'welcomeDelivery', 'welcomeCardEnabled', 'verificationChannelId', 'verificationEnabled', 'goodbyeChannelId', 'goodbyeMessage', 'logChannelId', 'logCategoryId', 'logEvents', 'rulesChannelId', 'rulesText', 'ticketCategoryId', 'ticketPanelChannelId', 'automod', 'automodAction', 'levelUp', 'levelUpMessage', 'levelExcludedChannels', 'levelExcludedRoles', 'levelRoleRewards', 'blockedWords', 'ticketPanelTitle', 'ticketPanelDescription', 'ticketButtonLabel', 'ticketButtonStyle', 'ticketNamePrefix', 'ticketWelcomeTitle', 'ticketWelcomeMessage', 'ticketCloseLabel']) if (request.body[key] !== undefined) settings[key] = request.body[key];
    if (request.body.commandAliases && typeof request.body.commandAliases !== 'object') return response.status(400).json({ error: 'Command aliases must be an object.' });
    if (request.body.security) settings.security = { ...settings.security, ...request.body.security };
    const validChannelIds = new Set(guild.channels.cache.filter((channel) => channel.isTextBased() || channel.type === ChannelType.GuildCategory).keys());
    const validRoleIds = new Set(guild.roles.cache.filter((role) => role.id !== guild.id).keys());
    const channelKeys = ['welcomeChannelId', 'goodbyeChannelId', 'verificationChannelId', 'joinToCreateChannelId', 'afkChannelId', 'suggestionsChannelId', 'logChannelId', 'logCategoryId', 'rulesChannelId', 'ticketCategoryId', 'ticketPanelChannelId'];
    const roleKeys = ['quarantineRoleId', 'verifiedRoleId', 'afkRoleId'];
    for (const key of channelKeys) {
      if (settings[key] && !validChannelIds.has(settings[key])) return response.status(400).json({ error: `${key} must reference a channel in this server.` });
    }
    for (const key of roleKeys) {
      if (settings[key] && !validRoleIds.has(settings[key])) return response.status(400).json({ error: `${key} must reference a role in this server.` });
    }
    for (const roleId of Array.isArray(settings.autoRoleIds) ? settings.autoRoleIds : []) {
      if (!validRoleIds.has(roleId)) return response.status(400).json({ error: 'Automatic roles must belong to this server.' });
    }
    for (const roleId of Array.isArray(settings.selfAssignableRoleIds) ? settings.selfAssignableRoleIds : []) {
      if (!validRoleIds.has(roleId)) return response.status(400).json({ error: 'Self-assignable roles must belong to this server.' });
    }
    for (const channelId of (Array.isArray(settings.levelExcludedChannels) ? settings.levelExcludedChannels : [])) {
      if (!validChannelIds.has(channelId)) return response.status(400).json({ error: 'Excluded level channels must belong to this server.' });
    }
    const levelRewardRoleIds = Array.isArray(settings.levelRoleRewards) ? settings.levelRoleRewards.map((reward) => reward.roleId) : [];
    for (const roleId of [...(Array.isArray(settings.levelExcludedRoles) ? settings.levelExcludedRoles : []), ...levelRewardRoleIds]) {
      if (!validRoleIds.has(roleId)) return response.status(400).json({ error: 'Level roles must belong to this server.' });
    }
    if (!settings.prefix || /\s/.test(settings.prefix) || settings.prefix.length > 3) return response.status(400).json({ error: 'Prefix must be 1-3 characters with no spaces.' });
    if (!['Primary', 'Secondary', 'Success', 'Danger'].includes(settings.ticketButtonStyle)) return response.status(400).json({ error: 'Invalid ticket button style.' });
    if (!settings.ticketButtonLabel?.trim() || settings.ticketButtonLabel.length > 80) return response.status(400).json({ error: 'Ticket button label must be 1-80 characters.' });
    if (!settings.ticketNamePrefix || /[^a-z0-9-]/i.test(settings.ticketNamePrefix)) return response.status(400).json({ error: 'Ticket name prefix may contain only letters, numbers, and hyphens.' });
    saveData();
    return response.json({ ok: true });
  });
  app.post('/api/guilds/:id/tickets', async (request, response) => {
    const guild = client.guilds.cache.get(request.params.id);
    if (!guild) return response.status(404).json({ error: 'Server not found.' });
    try { await createTicketSetup(guild); return response.json({ message: 'Ticket category and panel channel created.' }); } catch (error) { return response.status(500).json({ error: error.message }); }
  });
  app.post('/api/guilds/:id/logs/setup', async (request, response) => {
    const guild = client.guilds.cache.get(request.params.id);
    if (!guild) return response.status(404).json({ error: 'Server not found.' });
    try {
      const settings = getGuildData(guild.id);
      for (const eventKey of ['ban', 'kick', 'timeout', 'warn', 'message_deleted', 'message_edited', 'channel_created', 'channel_deleted', 'channel_updated', 'role_created', 'role_deleted', 'role_updated', 'member_join', 'member_left', 'nickname_changed', 'ticket_opened', 'ticket_closed', 'ticket_transcript', 'auto_mod', 'security']) await ensurePrivateLogChannel(guild, eventKey);
      settings.logChannelId = settings.logChannels.ban || settings.logChannelId;
      saveData();
      return response.json({ ok: true, categoryId: settings.logCategoryId });
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  });
  app.get('/api/guilds/:id/ticket-systems', async (request, response) => {
    const guild = client.guilds.cache.get(request.params.id);
    if (!guild) return response.status(404).json({ error: 'Server not found.' });
    const settings = getGuildData(guild.id);
    let changed = false;
    const systems = (settings.ticketSystems || []).map(async (system) => {
      const panelChannel = system.panelChannelId ? guild.channels.cache.get(system.panelChannelId) : null;
      let panelMessageExists = false;
      if (panelChannel?.isTextBased() && system.panelMessageId) {
        panelMessageExists = Boolean(await panelChannel.messages.fetch(system.panelMessageId).catch(() => null));
      }
      if (!panelMessageExists && system.panelMessageId) {
        system.panelMessageId = null;
        changed = true;
      }
      return {
      ...system,
      categoryName: guild.channels.cache.get(system.categoryId)?.name || null,
      panelChannelName: panelChannel?.name || null,
      panelMessageExists,
      activeTickets: guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildText && channel.parentId === system.categoryId && channel.name.startsWith(`${system.namePrefix}-`)).size
      };
    });
    const resolvedSystems = await Promise.all(systems);
    if (changed) saveData();
    return response.json(resolvedSystems);
  });
  app.post('/api/guilds/:id/ticket-systems', async (request, response) => {
    const guild = client.guilds.cache.get(request.params.id);
    if (!guild) return response.status(404).json({ error: 'Server not found.' });
    const settings = getGuildData(guild.id);
    if ((settings.ticketSystems || []).length >= 20) return response.status(400).json({ error: 'You can create up to 20 ticket systems.' });
    const source = request.body || {};
    const id = String(source.id || source.name || `ticket-${Date.now()}`).toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 32) || `ticket-${Date.now()}`;
    if (settings.ticketSystems.some((system) => system.id === id)) return response.status(409).json({ error: 'A ticket system with that ID already exists.' });
    const system = { id, name: source.name || 'New ticket system', title: source.title || 'Need help?', description: source.description || 'Click the button below to open a private ticket.', buttonLabel: source.buttonLabel || 'Open a Ticket', buttonStyle: source.buttonStyle || 'Primary', namePrefix: source.namePrefix || id, welcomeTitle: source.welcomeTitle || 'Ticket opened', welcomeMessage: source.welcomeMessage || 'Thanks for reaching out, {user}.', closeLabel: source.closeLabel || 'Close Ticket', staffRoleId: source.staffRoleId || null, categories: Array.isArray(source.categories) ? source.categories : [], enabled: true, categoryId: null, panelChannelId: null, panelMessageId: null };
    settings.ticketSystems.push(system);
    await request.app.locals.createTicketSetup(guild, system);
    return response.status(201).json(system);
  });
  app.patch('/api/guilds/:id/ticket-systems/:systemId', async (request, response) => {
    const guild = client.guilds.cache.get(request.params.id);
    if (!guild) return response.status(404).json({ error: 'Server not found.' });
    const settings = getGuildData(guild.id);
    const system = settings.ticketSystems.find((item) => item.id === request.params.systemId);
    if (!system) return response.status(404).json({ error: 'Ticket system not found.' });
    const allowed = ['name', 'title', 'description', 'buttonLabel', 'buttonStyle', 'namePrefix', 'welcomeTitle', 'welcomeMessage', 'closeLabel', 'staffRoleId', 'categories', 'enabled', 'categoryId', 'panelChannelId'];
    for (const key of allowed) if (request.body[key] !== undefined) system[key] = request.body[key];
    if (!system.namePrefix || /[^a-z0-9-]/i.test(system.namePrefix)) return response.status(400).json({ error: 'Ticket name prefix may contain only letters, numbers, and hyphens.' });
    if (!['Primary', 'Secondary', 'Success', 'Danger'].includes(system.buttonStyle)) return response.status(400).json({ error: 'Invalid ticket button style.' });
    if (system.staffRoleId && !guild.roles.cache.has(system.staffRoleId)) return response.status(400).json({ error: 'Ticket staff role must belong to this server.' });
    if (system.categoryId && guild.channels.cache.get(system.categoryId)?.type !== ChannelType.GuildCategory) return response.status(400).json({ error: 'Ticket category must be a category in this server.' });
    if (system.panelChannelId && !guild.channels.cache.get(system.panelChannelId)?.isTextBased()) return response.status(400).json({ error: 'Ticket panel channel must be a text channel in this server.' });
    await request.app.locals.createTicketSetup(guild, system);
    return response.json(system);
  });
  app.delete('/api/guilds/:id/ticket-systems/:systemId', (request, response) => {
    const guild = client.guilds.cache.get(request.params.id);
    if (!guild) return response.status(404).json({ error: 'Server not found.' });
    const settings = getGuildData(guild.id);
    if (settings.ticketSystems.length <= 1) return response.status(400).json({ error: 'Keep at least one ticket system configured.' });
    const index = settings.ticketSystems.findIndex((system) => system.id === request.params.systemId);
    if (index < 0) return response.status(404).json({ error: 'Ticket system not found.' });
    settings.ticketSystems.splice(index, 1);
    saveData();
    return response.json({ ok: true });
  });
  app.post('/api/guilds/:id/setup-all', async (request, response) => {
    const guild = client.guilds.cache.get(request.params.id);
    if (!guild) return response.status(404).json({ error: 'Server not found.' });
    try { return response.json(await createServerSetup(guild)); } catch (error) { return response.status(500).json({ error: error.message }); }
  });
  app.locals.createTicketSetup = createTicketSetup;
  const port = Number(process.env.PORT || process.env.DASHBOARD_PORT || 3000);
  const host = process.env.DASHBOARD_HOST || (process.env.PORT ? '0.0.0.0' : '127.0.0.1');
  app.listen(port, host, () => console.log(`Dashboard available at http://${host}:${port}`));
}
