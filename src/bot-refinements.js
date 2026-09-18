const ALLOWED_BUTTON_STYLES = new Set(['Primary', 'Secondary', 'Success', 'Danger']);
const COMMAND_GROUPS = {
  moderation: ['ban', 'kick', 'softban', 'timeout', 'unmute', 'warn', 'warnings', 'purge', 'clear', 'unban', 'nickname', 'quarantine'],
  protection: ['security', 'lock', 'unlock', 'lockdown', 'blacklist'],
  community: ['ticket', 'rules', 'poll', 'remind', 'announce', 'say', 'selfrole', 'rep', 'suggest'],
  utility: ['help', 'commands', 'about', 'ping', 'serverinfo', 'userinfo', 'avatar', 'channelinfo', 'roleinfo', 'roll', 'log'],
  administration: ['stop', 'copyserver', 'paste', 'deleteallchannels'],
  leveling: ['level', 'profile', 'rank', 'leaderboard', 'top', 'setxp', 'setlevel'],
  clans: ['clan'],
  economy: ['economy']
};

export function normalizeAliases(value, commandNames = Object.keys(defaultAliases())) {
  const input = value && typeof value === 'object' ? value : {};
  const result = {};
  for (const name of commandNames) {
    const aliases = Array.isArray(input[name]) ? input[name] : [];
    result[name] = [...new Set(aliases.map((alias) => String(alias).trim().toLowerCase()).filter(isSafeCommandWord))].slice(0, 10);
  }
  return result;
}

export function defaultAliases() {
  return { ban: [], kick: [], softban: [], timeout: [], unmute: [], warn: [], purge: [], clear: [], lock: [], unlock: [], lockdown: [], quarantine: [] };
}

export function isSafeCommandWord(value) {
  return /^[a-z][a-z0-9_-]{0,24}$/.test(value);
}

export function resolveCommand(input, aliases) {
  const word = String(input || '').trim().toLowerCase();
  if (!word) return null;
  const normalized = normalizeAliases(aliases);
  for (const [canonical, words] of Object.entries(normalized)) {
    if (canonical === word || words.includes(word)) return canonical;
  }
  return word;
}

export function parseDuration(value, fallbackMs = 60000, maxMs = 1000 * 60 * 60 * 24 * 28) {
  const match = String(value || '').trim().toLowerCase().match(/^(\d+)\s*(s|m|h|d|w)?$/);
  if (!match) return fallbackMs;
  const amount = Number(match[1]);
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000 };
  return Math.min(amount * (units[match[2] || 'm'] || units.m), maxMs);
}

export function formatDuration(milliseconds) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function formatTemplate(template, values = {}) {
  return String(template || '').replaceAll(/\{([a-zA-Z0-9_]+)\}/g, (_match, key) => values[key] === undefined ? `{${key}}` : String(values[key]));
}

export function cleanMessage(value, maxLength = 4000) {
  return String(value || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, maxLength);
}

export function parseIdList(value, max = 100) {
  const values = Array.isArray(value) ? value : String(value || '').split(/[\s,\n]+/);
  return [...new Set(values.map((item) => String(item).trim()).filter((item) => /^\d{15,25}$/.test(item)))].slice(0, max);
}

export function parseRoleRewards(value) {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => ({ level: Math.max(1, Math.floor(Number(entry.level))), roleId: String(entry.roleId || '') })).filter((entry) => Number.isFinite(entry.level) && /^\d{15,25}$/.test(entry.roleId)).slice(0, 50);
}

export function normalizeTicketSettings(settings) {
  const next = { ...settings };
  next.ticketPanelTitle = cleanMessage(next.ticketPanelTitle || 'Need help?', 256);
  next.ticketPanelDescription = cleanMessage(next.ticketPanelDescription || 'Click the button below and I will create a private ticket for you.', 4000);
  next.ticketButtonLabel = cleanMessage(next.ticketButtonLabel || 'Open a Ticket', 80) || 'Open a Ticket';
  next.ticketButtonStyle = ALLOWED_BUTTON_STYLES.has(next.ticketButtonStyle) ? next.ticketButtonStyle : 'Primary';
  next.ticketNamePrefix = String(next.ticketNamePrefix || 'ticket').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 18) || 'ticket';
  next.ticketWelcomeTitle = cleanMessage(next.ticketWelcomeTitle || 'Ticket opened', 256);
  next.ticketWelcomeMessage = cleanMessage(next.ticketWelcomeMessage || 'Thanks for reaching out, {user}.', 4000);
  next.ticketCloseLabel = cleanMessage(next.ticketCloseLabel || 'Close Ticket', 80) || 'Close Ticket';
  const legacy = {
    id: 'default',
    name: 'Support',
    categoryId: next.ticketCategoryId || null,
    panelChannelId: next.ticketPanelChannelId || null,
    panelMessageId: next.ticketPanelMessageId || null,
    title: next.ticketPanelTitle,
    description: next.ticketPanelDescription,
    buttonLabel: next.ticketButtonLabel,
    buttonStyle: next.ticketButtonStyle,
    namePrefix: next.ticketNamePrefix,
    welcomeTitle: next.ticketWelcomeTitle,
    welcomeMessage: next.ticketWelcomeMessage,
    closeLabel: next.ticketCloseLabel,
    categories: [],
    enabled: true
  };
  const systems = Array.isArray(next.ticketSystems) ? next.ticketSystems : [];
  next.ticketSystems = (systems.length ? systems : [legacy]).map((system, index) => ({
    ...legacy,
    ...system,
    id: String(system.id || (index === 0 ? 'default' : `ticket-${index + 1}`)).toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 32) || `ticket-${index + 1}`,
    name: cleanMessage(system.name || `Ticket system ${index + 1}`, 80),
    categoryId: system.categoryId || null,
    panelChannelId: system.panelChannelId || null,
    panelMessageId: system.panelMessageId || null,
    title: cleanMessage(system.title || legacy.title, 256),
    description: cleanMessage(system.description || legacy.description, 4000),
    buttonLabel: cleanMessage(system.buttonLabel || legacy.buttonLabel, 80) || 'Open a Ticket',
    buttonStyle: ALLOWED_BUTTON_STYLES.has(system.buttonStyle) ? system.buttonStyle : 'Primary',
    namePrefix: String(system.namePrefix || legacy.namePrefix).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 18) || 'ticket',
    welcomeTitle: cleanMessage(system.welcomeTitle || legacy.welcomeTitle, 256),
    welcomeMessage: cleanMessage(system.welcomeMessage || legacy.welcomeMessage, 4000),
    closeLabel: cleanMessage(system.closeLabel || legacy.closeLabel, 80) || 'Close Ticket',
    staffRoleId: system.staffRoleId || null,
    categories: (Array.isArray(system.categories) ? system.categories : []).map((category, categoryIndex) => ({
      id: String(category.id || `category-${categoryIndex + 1}`).toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 32) || `category-${categoryIndex + 1}`,
      label: cleanMessage(category.label || `Category ${categoryIndex + 1}`, 80),
      description: cleanMessage(category.description || '', 100),
      prefix: String(category.prefix || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 18)
    })).slice(0, 25),
    enabled: system.enabled !== false
  })).slice(0, 20);
  const primary = next.ticketSystems[0] || legacy;
  next.ticketCategoryId = primary.categoryId;
  next.ticketPanelChannelId = primary.panelChannelId;
  next.ticketPanelMessageId = primary.panelMessageId;
  next.ticketPanelTitle = primary.title;
  next.ticketPanelDescription = primary.description;
  next.ticketButtonLabel = primary.buttonLabel;
  next.ticketButtonStyle = primary.buttonStyle;
  next.ticketNamePrefix = primary.namePrefix;
  next.ticketWelcomeTitle = primary.welcomeTitle;
  next.ticketWelcomeMessage = primary.welcomeMessage;
  next.ticketCloseLabel = primary.closeLabel;
  return next;
}

export function normalizeSecurity(settings) {
  const security = { ...(settings.security || {}) };
  return {
    ...security,
    antiSpam: Boolean(security.antiSpam),
    antiInvite: Boolean(security.antiInvite),
    antiCaps: Boolean(security.antiCaps),
    antiRaid: Boolean(security.antiRaid),
    raidLimit: Math.min(Math.max(Number(security.raidLimit) || 5, 2), 100),
    antiMassMention: security.antiMassMention !== false,
    antiWebhook: security.antiWebhook !== false,
    joinAgeDays: Math.min(Math.max(Number(security.joinAgeDays) || 0, 0), 3650)
  };
}

export function normalizeGuildSettings(settings) {
  const next = { ...settings };
  next.prefix = String(next.prefix || '!').trim().slice(0, 3) || '!';
  next.commandAliases = normalizeAliases(next.commandAliases);
  next.security = normalizeSecurity(next);
  next.autoReplies = (Array.isArray(next.autoReplies) ? next.autoReplies : [])
    .map((entry) => ({
      trigger: cleanMessage(entry?.trigger, 100).toLowerCase(),
      response: cleanMessage(entry?.response, 2000),
      enabled: entry?.enabled !== false
    }))
    .filter((entry) => entry.trigger && entry.response)
    .slice(0, 100);
  next.blockedWords = [...new Set((Array.isArray(next.blockedWords) ? next.blockedWords : []).map((word) => cleanMessage(word, 80).toLowerCase()).filter(Boolean))].slice(0, 200);
  next.levelExcludedChannels = parseIdList(next.levelExcludedChannels);
  next.levelExcludedRoles = parseIdList(next.levelExcludedRoles);
  next.levelRoleRewards = parseRoleRewards(next.levelRoleRewards);
  next.selfAssignableRoleIds = parseIdList(next.selfAssignableRoleIds);
  next.whitelist = {
    users: parseIdList(next.whitelist?.users),
    roles: parseIdList(next.whitelist?.roles),
    channels: parseIdList(next.whitelist?.channels)
  };
  return normalizeTicketSettings(next);
}

export function getCommandGroups() {
  return Object.fromEntries(Object.entries(COMMAND_GROUPS).map(([group, names]) => [group, [...names]]));
}

export function getCommandCatalog() {
  return Object.entries(COMMAND_GROUPS).flatMap(([group, names]) => names.map((name) => ({ name, group })));
}

export function getSecurityScore(settings) {
  const security = normalizeSecurity(settings);
  const checks = [security.antiSpam, security.antiInvite, security.antiCaps, security.antiRaid, security.antiMassMention, security.antiWebhook, Boolean(settings.quarantineRoleId), Boolean(settings.logChannelId)];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function shouldIgnoreModeration(message, settings) {
  if (!message?.guild || !message?.member) return true;
  if (message.author?.bot) return true;
  if (message.member.permissions?.has('Administrator')) return true;
  if (settings.whitelist?.users?.includes(message.author.id)) return true;
  if (settings.whitelist?.channels?.includes(message.channel.id)) return true;
  return settings.whitelist?.roles?.some((roleId) => message.member.roles.cache.has(roleId)) || false;
}

export function getGuildSnapshot(guild, settings) {
  return {
    id: guild.id,
    name: guild.name,
    memberCount: guild.memberCount,
    channelCount: guild.channels.cache.size,
    roleCount: guild.roles.cache.size,
    commandPrefix: settings.prefix,
    securityScore: getSecurityScore(settings),
    ticketReady: Boolean(settings.ticketCategoryId && settings.ticketPanelChannelId),
    logsReady: Boolean(settings.logChannelId),
    rulesReady: Boolean(settings.rulesChannelId),
    welcomeReady: Boolean(settings.welcomeChannelId)
  };
}

export function buildAuditRecord(action, actor, target, reason = '') {
  return { action: cleanMessage(action, 80), actor: cleanMessage(actor, 120), target: cleanMessage(target, 120), reason: cleanMessage(reason, 500), at: Date.now() };
}

export function compactError(error) {
  if (!error) return 'Unknown error';
  const message = error.rawError?.message || error.message || String(error);
  return cleanMessage(message, 240);
}

export function isValidSnowflake(value) {
  return /^\d{15,25}$/.test(String(value || ''));
}

export function clampNumber(value, minimum, maximum, fallback = minimum) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(Math.max(number, minimum), maximum) : fallback;
}

export function splitText(value, maxLength = 1900) {
  const text = String(value || '');
  const chunks = [];
  for (let index = 0; index < text.length; index += maxLength) chunks.push(text.slice(index, index + maxLength));
  return chunks.length ? chunks : [''];
}

export function hasPermission(member, permission) {
  return Boolean(member?.permissions?.has(permission));
}

export function safeChannelName(value, fallback = 'channel') {
  const result = String(value || '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 90);
  return result || fallback;
}

export function makeMention(userId) {
  return isValidSnowflake(userId) ? `<@${userId}>` : String(userId || 'user');
}

export function makeRoleMention(roleId) {
  return isValidSnowflake(roleId) ? `<@&${roleId}>` : String(roleId || 'role');
}

export function parseMentionId(value) {
  const match = String(value || '').match(/<@!?(\d{15,25})>|(\d{15,25})/);
  return match?.[1] || match?.[2] || null;
}

export function parseMentionIds(values) {
  const input = Array.isArray(values) ? values : String(values || '').split(/[\s,]+/);
  return [...new Set(input.map(parseMentionId).filter(Boolean))];
}

export function normalizeReason(reason, fallback = 'No reason provided') {
  return cleanMessage(reason, 500) || fallback;
}

export function normalizePrefix(prefix, fallback = '!') {
  const value = String(prefix || '').trim();
  return value && !/\s/.test(value) && value.length <= 3 ? value : fallback;
}

export function getPermissionForAction(action) {
  return {
    ban: 'BanMembers',
    softban: 'BanMembers',
    unban: 'BanMembers',
    kick: 'KickMembers',
    timeout: 'ModerateMembers',
    unmute: 'ModerateMembers',
    warn: 'ModerateMembers',
    quarantine: 'ModerateMembers',
    purge: 'ManageMessages',
    clear: 'ManageMessages',
    lock: 'ManageChannels',
    unlock: 'ManageChannels',
    lockdown: 'ManageChannels',
    nickname: 'ManageNicknames'
  }[action] || 'ManageGuild';
}

export function buildActionResult(action, target, actor, reason, extra = {}) {
  return { action, target: target?.id || target || null, targetName: target?.user?.tag || target?.tag || String(target || ''), actor: actor?.id || actor || null, actorName: actor?.user?.tag || actor?.tag || String(actor || ''), reason: normalizeReason(reason), ...extra, at: Date.now() };
}

export function isHigherOrEqualRole(member, role) {
  if (!member?.roles?.highest || !role) return true;
  return role.position >= member.roles.highest.position;
}

export function canModerate(botMember, targetMember) {
  if (!botMember || !targetMember) return false;
  if (targetMember.id === targetMember.guild.ownerId) return false;
  return targetMember.manageable && botMember.roles.highest.position > targetMember.roles.highest.position;
}

export function getTicketChannelName(settings, username) {
  return safeChannelName(`${settings.ticketNamePrefix || 'ticket'}-${username}`, 'ticket');
}

export function getTicketPanelData(settings) {
  const ticket = normalizeTicketSettings(settings);
  return { title: ticket.ticketPanelTitle, description: ticket.ticketPanelDescription, label: ticket.ticketButtonLabel, style: ticket.ticketButtonStyle, categoryId: ticket.ticketCategoryId || null, panelChannelId: ticket.ticketPanelChannelId || null, panelMessageId: ticket.ticketPanelMessageId || null };
}

export function getModuleStatus(settings) {
  return {
    welcome: Boolean(settings.welcomeChannelId),
    goodbye: Boolean(settings.goodbyeChannelId),
    logs: Boolean(settings.logChannelId),
    rules: Boolean(settings.rulesChannelId),
    tickets: Boolean(settings.ticketCategoryId && settings.ticketPanelChannelId),
    automod: Boolean(settings.automod),
    leveling: Boolean(settings.levelUp),
    protection: getSecurityScore(settings) >= 50,
    quarantine: Boolean(settings.quarantineRoleId)
  };
}

export function countEnabledModules(settings) {
  return Object.values(getModuleStatus(settings)).filter(Boolean).length;
}

export function getOnboardingSteps(settings) {
  const status = getModuleStatus(settings);
  return Object.entries(status).map(([name, complete]) => ({ name, complete, action: complete ? 'ready' : `configure:${name}` }));
}

export function uniqueStrings(values, maximum = 100) {
  return [...new Set((Array.isArray(values) ? values : [values]).map((value) => String(value).trim()).filter(Boolean))].slice(0, maximum);
}

export function serializeSettingsForApi(settings) {
  return { ...settings, commandAliases: normalizeAliases(settings.commandAliases), security: normalizeSecurity(settings), moduleStatus: getModuleStatus(settings), enabledModules: countEnabledModules(settings) };
}

export function makeRateLimiter(limit, windowMs) {
  const entries = new Map();
  return (key) => {
    const now = Date.now();
    const recent = (entries.get(key) || []).filter((time) => now - time < windowMs);
    if (recent.length >= limit) return false;
    recent.push(now);
    entries.set(key, recent);
    return true;
  };
}

export function redactToken(value) {
  const text = String(value || '');
  if (text.length < 8) return '[redacted]';
  return `${text.slice(0, 3)}...${text.slice(-3)}`;
}

export function isDangerousMessage(content) {
  const text = String(content || '');
  return /@everyone|@here/.test(text) || /discord\.(gg|com\/invite)\//i.test(text) || text.length > 5000;
}

export function toBoolean(value, fallback = false) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  return ['1', 'true', 'yes', 'on', 'enabled'].includes(String(value).toLowerCase());
}

export function parseBooleanMap(value) {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, toBoolean(item)]));
}

export function paginate(items, page = 1, pageSize = 10) {
  const safePageSize = clampNumber(pageSize, 1, 100, 10);
  const totalPages = Math.max(1, Math.ceil(items.length / safePageSize));
  const safePage = clampNumber(page, 1, totalPages, 1);
  const start = (safePage - 1) * safePageSize;
  return { items: items.slice(start, start + safePageSize), page: safePage, pageSize: safePageSize, totalPages, totalItems: items.length };
}

export function summarizeWarnings(warnings = {}) {
  const rows = Object.entries(warnings).flatMap(([userId, entries]) => (entries || []).map((entry) => ({ userId, ...entry })));
  const byModerator = rows.reduce((result, row) => { result[row.moderator || 'unknown'] = (result[row.moderator || 'unknown'] || 0) + 1; return result; }, {});
  return { total: rows.length, users: new Set(rows.map((row) => row.userId)).size, byModerator, latest: rows.sort((first, second) => second.at - first.at).slice(0, 10) };
}

export function summarizeXp(xp = {}) {
  const rows = Object.entries(xp).map(([userId, record]) => ({ userId, xp: Number(record.xp) || 0, level: Number(record.level) || 0 }));
  const totalXp = rows.reduce((sum, row) => sum + row.xp, 0);
  return { members: rows.length, totalXp, averageXp: rows.length ? Math.round(totalXp / rows.length) : 0, top: rows.sort((first, second) => second.xp - first.xp).slice(0, 10) };
}

export function createIncident(id, type, details = {}) {
  return { id: id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, type: cleanMessage(type, 80), details, createdAt: Date.now(), resolvedAt: null };
}

export function resolveIncident(incident) {
  return { ...incident, resolvedAt: Date.now() };
}

export function isExpired(timestamp, durationMs) {
  return !timestamp || Date.now() - timestamp >= durationMs;
}
