import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Client,
  Collection,
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField,
  REST,
  Routes,
  SlashCommandBuilder
} from 'discord.js';
import { startDashboard } from './dashboard.js';
import { normalizeGuildSettings, resolveCommand, getCommandCatalog } from './bot-refinements.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'guilds.json');
const copyStateFile = path.join(dataDir, 'server-copy.json');
const pidFile = path.join(dataDir, 'bot.pid');
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(pidFile, String(process.pid));
const removePidFile = () => { if (fs.existsSync(pidFile) && fs.readFileSync(pidFile, 'utf8').trim() === String(process.pid)) fs.rmSync(pidFile); };
process.once('exit', removePidFile);

const defaults = {
  prefix: process.env.BOT_PREFIX || '!',
  language: 'en',
  embedColor: '#6558ed',
  commandEnabled: {},
  autoRoleIds: [],
  selfAssignableRoleIds: [],
  rep: {},
  autoReplies: [],
  welcomeDelivery: 'channel',
  commandAliases: { ban: [], kick: [], timeout: [], warn: [], purge: [], clear: [], lock: [], unlock: [], slowmode: [], quarantine: [], softban: [], unmute: [], lockdown: [] },
  welcomeChannelId: null,
  welcomeMessage: 'Welcome {user} to **{server}**!',
  goodbyeChannelId: null,
  goodbyeMessage: '{username} has left **{server}**. We will remember you!',
  logChannelId: null,
  logCategoryId: null,
  logChannels: {},
  logEvents: { moderation: true, members: true, tickets: true, security: true },
  rulesChannelId: null,
  rulesText: 'Please read and follow the rules of this server.',
  ticketCategoryId: null,
  ticketPanelChannelId: null,
  ticketPanelMessageId: null,
  ticketPanelTitle: 'Need help?',
  ticketPanelDescription: 'Click the button below and I will create a private ticket for you.',
  ticketButtonLabel: 'Open a Ticket',
  ticketButtonStyle: 'Primary',
  ticketNamePrefix: 'ticket',
  ticketWelcomeTitle: 'Ticket opened',
  ticketWelcomeMessage: 'Thanks for reaching out, {user}. A member of the team will be with you shortly.',
  ticketCloseLabel: 'Close Ticket',
  ticketSystems: [],
  automod: true,
  security: { antiSpam: true, antiInvite: true, antiCaps: true, antiRaid: true, antiMassMention: true, raidLimit: 5 },
  blacklist: [],
  verifiedRoleId: null,
  quarantineRoleId: null,
  automodAction: 'delete',
  levelUpMessage: '{user} reached level **{level}**!',
  levelExcludedChannels: [],
  levelExcludedRoles: [],
  levelRoleRewards: [],
  whitelist: { users: [], roles: [], channels: [] },
  blockedWords: (process.env.BLOCKED_WORDS || '').split(',').map((word) => word.trim().toLowerCase()).filter(Boolean),
  levelUp: true,
  warnings: {},
  xp: {}
};

function loadData() {
  try {
    return fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : {};
  } catch (error) {
    console.error('Could not read data/guilds.json:', error.message);
    return {};
  }
}

const guildData = loadData();
function loadCopyState() {
  try {
    return fs.existsSync(copyStateFile) ? JSON.parse(fs.readFileSync(copyStateFile, 'utf8')) : {};
  } catch (error) {
    console.error('Could not read data/server-copy.json:', error.message);
    return {};
  }
}
const copyState = loadCopyState();
function saveCopyState() {
  fs.writeFileSync(copyStateFile, JSON.stringify(copyState, null, 2));
}
const spamTracker = new Map();
const raidTracker = new Map();
function getGuildData(guildId) {
  guildData[guildId] ??= structuredClone(defaults);
  guildData[guildId].prefix = typeof guildData[guildId].prefix === 'string' && guildData[guildId].prefix.trim() ? guildData[guildId].prefix.trim() : defaults.prefix;
  guildData[guildId].language ??= defaults.language;
  guildData[guildId].logEvents ??= structuredClone(defaults.logEvents);
  guildData[guildId].logChannels ??= {};
  guildData[guildId].embedColor ??= defaults.embedColor;
  guildData[guildId].commandEnabled ??= {};
  guildData[guildId].autoRoleIds ??= [];
  guildData[guildId].selfAssignableRoleIds ??= [];
  guildData[guildId].rep ??= {};
  guildData[guildId].autoReplies ??= [];
  guildData[guildId].welcomeDelivery ??= defaults.welcomeDelivery;
  guildData[guildId].commandAliases = { ...structuredClone(defaults.commandAliases), ...(guildData[guildId].commandAliases || {}) };
  guildData[guildId].security ??= structuredClone(defaults.security);
  guildData[guildId].security = { ...structuredClone(defaults.security), ...guildData[guildId].security };
  guildData[guildId].blacklist ??= [];
  guildData[guildId].quarantineRoleId ??= null;
  guildData[guildId].whitelist ??= structuredClone(defaults.whitelist);
  guildData[guildId].levelExcludedChannels ??= [];
  guildData[guildId].levelExcludedRoles ??= [];
  guildData[guildId].levelRoleRewards ??= [];
  guildData[guildId].automodAction ??= defaults.automodAction;
  guildData[guildId].levelUpMessage ??= defaults.levelUpMessage;
  for (const key of ['ticketPanelChannelId', 'ticketPanelMessageId', 'ticketPanelTitle', 'ticketPanelDescription', 'ticketButtonLabel', 'ticketButtonStyle', 'ticketNamePrefix', 'ticketWelcomeTitle', 'ticketWelcomeMessage', 'ticketCloseLabel']) guildData[guildId][key] ??= defaults[key];
  guildData[guildId].warnings ??= {};
  guildData[guildId].xp ??= {};
  guildData[guildId].blockedWords ??= [];
  guildData[guildId] = normalizeGuildSettings(guildData[guildId]);
  return guildData[guildId];
}
function saveData() {
  fs.writeFileSync(dataFile, JSON.stringify(guildData, null, 2));
}
function getDashboardUrl() {
  return process.env.DASHBOARD_PUBLIC_URL || `http://${process.env.DASHBOARD_HOST || '127.0.0.1'}:${process.env.DASHBOARD_PORT || '3000'}`;
}
function isStaff(interaction) {
  return interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild);
}
function replaceTokens(text, member, guild) {
  return text.replaceAll('{user}', `<@${member.id}>`).replaceAll('{username}', member.user?.username || member.username).replaceAll('{server}', guild.name);
}
function embed(title, description, color = 0x5865f2) {
  return new EmbedBuilder().setColor(color || 0x5865f2).setTitle(title).setDescription(description).setTimestamp();
}
function guildEmbed(guild, title, description, color) {
  const configured = getGuildData(guild.id).embedColor;
  const normalized = typeof configured === 'string' ? Number.parseInt(configured.replace('#', ''), 16) : configured;
  return embed(title, description, color || normalized || 0x6558ed);
}
function getXpRank(settings, userId) {
  const rows = Object.entries(settings.xp).sort(([, first], [, second]) => (second.xp || 0) - (first.xp || 0));
  const position = rows.findIndex(([id]) => id === userId);
  return position === -1 ? null : position + 1;
}
async function sendLog(guild, title, description, color = 0x5865f2) {
  const settings = getGuildData(guild.id);
  const category = /ticket/i.test(title) ? 'tickets' : /join|left|member/i.test(title) ? 'members' : /automod|security|raid|invite|caps|spam|blacklist/i.test(title) ? 'security' : 'moderation';
  if (settings.logEvents[category] === false) return;
  const eventKey = title.toLowerCase().replace(/[^a-z]+/g, ' ').trim();
  const eventKeys = [eventKey];
  if (/raid|security|invite|caps|spam|blacklist/i.test(eventKey)) eventKeys.push('security');
  if (/automod/i.test(eventKey)) eventKeys.push('auto mod');
  const eventChannel = Object.entries(settings.logChannels).find(([key]) => eventKeys.some((candidate) => candidate.includes(key.replaceAll('_', ' '))))?.[1];
  const channelId = eventChannel || settings.logChannelId;
  if (!channelId) return;
  const channel = guild.channels.cache.get(channelId);
  if (channel?.isTextBased()) await channel.send({ embeds: [guildEmbed(guild, title, description, color)] }).catch(() => {});
}
const logEventKeys = ['ban', 'kick', 'timeout', 'warn', 'message_deleted', 'message_edited', 'channel_created', 'channel_deleted', 'channel_updated', 'role_created', 'role_deleted', 'role_updated', 'member_join', 'member_left', 'nickname_changed', 'ticket_opened', 'ticket_closed', 'ticket_transcript', 'auto_mod', 'security'];
async function sendTicketTranscript(guild, channel, systemId, closedBy) {
  const settings = getGuildData(guild.id);
  const transcriptChannelId = settings.logChannels.ticket_transcript || settings.logChannels.ticket_closed || settings.logChannelId;
  const transcriptChannel = transcriptChannelId ? guild.channels.cache.get(transcriptChannelId) : null;
  if (!transcriptChannel?.isTextBased()) return;
  const collected = [];
  let before;
  for (let page = 0; page < 50; page += 1) {
    const batch = await channel.messages.fetch({ limit: 100, ...(before ? { before } : {}) }).catch(() => null);
    if (!batch?.size) break;
    collected.push(...batch.values());
    before = batch.last()?.id;
    if (batch.size < 100) break;
  }
  const lines = collected.reverse().map((message) => {
    const timestamp = new Date(message.createdTimestamp).toISOString();
    const attachments = [...message.attachments.values()].map((attachment) => attachment.url).join(' ');
    return `[${timestamp}] ${message.author.tag} (${message.author.id}): ${message.content || '[no text]'}${attachments ? ` | Attachments: ${attachments}` : ''}`;
  });
  const header = [
    'Ticket transcript',
    `Guild: ${guild.name} (${guild.id})`,
    `Channel: #${channel.name} (${channel.id})`,
    `System: ${systemId || 'default'}`,
    `Closed by: ${closedBy.tag} (${closedBy.id})`,
    `Messages captured: ${lines.length}${collected.length >= 5000 ? ' (limited to 5000)' : ''}`,
    ''
  ].join('\n');
  const attachment = new AttachmentBuilder(Buffer.from(header + lines.join('\n'), 'utf8'), { name: `transcript-${channel.name}-${Date.now()}.txt` });
  await transcriptChannel.send({ content: `Transcript for **#${channel.name}** closed by <@${closedBy.id}>.`, files: [attachment] }).catch(() => {});
}
async function ensurePrivateLogChannel(guild, eventKey) {
  const settings = getGuildData(guild.id);
  let category = settings.logCategoryId ? guild.channels.cache.get(settings.logCategoryId) : null;
  if (category?.type !== ChannelType.GuildCategory) {
    category = guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && channel.name === 'Server Logs');
    if (!category) category = await guild.channels.create({ name: 'Server Logs', type: ChannelType.GuildCategory, permissionOverwrites: [{ id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] }] });
    settings.logCategoryId = category.id;
  }
  const name = `log-${eventKey.replaceAll('_', '-')}`;
  let channel = guild.channels.cache.find((item) => item.type === ChannelType.GuildText && item.parentId === category.id && item.name === name);
  if (!channel) {
    const staffOverwrites = guild.roles.cache.filter((role) => role.id !== guild.id && role.permissions.has(PermissionsBitField.Flags.ManageGuild)).map((role) => ({ id: role.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory] }));
    channel = await guild.channels.create({ name, type: ChannelType.GuildText, parent: category.id, permissionOverwrites: [{ id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] }, { id: guild.members.me.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }, ...staffOverwrites] });
  }
  settings.logChannels[eventKey] = channel.id;
  saveData();
  return channel;
}
async function createTicketChannel(guild, user, settings, system = settings.ticketSystems?.[0] || settings) {
  const prefix = system.namePrefix || settings.ticketNamePrefix || 'ticket';
  const existing = guild.channels.cache.find((channel) => channel.name === `${prefix}-${user.username}`.toLowerCase().slice(0, 90));
  if (existing) return existing;
  let category = system.categoryId ? guild.channels.cache.get(system.categoryId) : null;
  if (category?.type !== ChannelType.GuildCategory) {
    await createTicketSetup(guild, system);
    category = system.categoryId ? guild.channels.cache.get(system.categoryId) : null;
  }
  const channel = await guild.channels.create({
    name: `${prefix}-${user.username}`.toLowerCase().slice(0, 90),
    parent: category?.type === ChannelType.GuildCategory ? category.id : undefined,
    permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
      ...(system.staffRoleId ? [{ id: system.staffRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }] : [])
    ]
  });
  await channel.send({ embeds: [embed(system.welcomeTitle || settings.ticketWelcomeTitle, replaceTokens(system.welcomeMessage || settings.ticketWelcomeMessage, user, guild), 0x57f287)], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`ticket_close:${system.id || 'default'}`).setLabel(system.closeLabel || settings.ticketCloseLabel).setStyle(ButtonStyle.Danger))] });
  return channel;
}
async function createTicketSetup(guild, requestedSystem = null) {
  const settings = getGuildData(guild.id);
  const system = requestedSystem || settings.ticketSystems?.[0] || settings;
  const safeName = String(system.name || 'Support').toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 24) || 'support';
  let category = system.categoryId ? guild.channels.cache.get(system.categoryId) : null;
  if (category?.type !== ChannelType.GuildCategory) {
    category = guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && channel.name === `${safeName}-tickets`) || null;
  }
  const panel = system.panelChannelId ? guild.channels.cache.get(system.panelChannelId) : null;
  const ticketCategory = category?.type === ChannelType.GuildCategory ? category : await guild.channels.create({ name: `${safeName}-tickets`, type: ChannelType.GuildCategory, permissionOverwrites: [{ id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] }] });
  const panelChannel = panel?.isTextBased() ? panel : await guild.channels.create({ name: `open-${safeName}`, type: ChannelType.GuildText, topic: 'Use the button below to open a private ticket.', permissionOverwrites: [{ id: guild.roles.everyone.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory], deny: [PermissionsBitField.Flags.SendMessages] }] });
  const buttonStyle = ButtonStyle[system.buttonStyle || settings.ticketButtonStyle] || ButtonStyle.Primary;
  const panelPayload = { embeds: [embed(system.title || settings.ticketPanelTitle, system.description || settings.ticketPanelDescription, 0x5865f2)], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`ticket_open:${system.id || 'default'}`).setLabel(system.buttonLabel || settings.ticketButtonLabel).setStyle(buttonStyle))] };
  if (system.panelMessageId) {
    const panelMessage = await panelChannel.messages.fetch(system.panelMessageId).catch(() => null);
    if (panelMessage) await panelMessage.edit(panelPayload);
    else { const sent = await panelChannel.send(panelPayload); system.panelMessageId = sent.id; }
  } else { const sent = await panelChannel.send(panelPayload); system.panelMessageId = sent.id; }
  system.categoryId = ticketCategory.id;
  system.panelChannelId = panelChannel.id;
  if (settings.ticketSystems?.length) {
    const index = settings.ticketSystems.findIndex((item) => item.id === system.id);
    if (index >= 0) settings.ticketSystems[index] = system;
  }
  if (!settings.ticketSystems?.length || settings.ticketSystems[0]?.id === system.id || system === settings) {
    settings.ticketCategoryId = ticketCategory.id;
    settings.ticketPanelChannelId = panelChannel.id;
  }
  saveData();
  return system;
}
async function createServerSetup(guild) {
  const settings = getGuildData(guild.id);
  const everyone = guild.roles.everyone;
  let quarantine = settings.quarantineRoleId ? guild.roles.cache.get(settings.quarantineRoleId) : null;
  if (!quarantine) {
    quarantine = await guild.roles.create({ name: 'Quarantine', color: 0xed4245, reason: 'Server Control security setup' });
    settings.quarantineRoleId = quarantine.id;
  }
  const findText = (name) => guild.channels.cache.find((channel) => channel.type === ChannelType.GuildText && channel.name === name);
  const makeText = async (name, topic) => findText(name) || guild.channels.create({ name, type: ChannelType.GuildText, topic, permissionOverwrites: [{ id: everyone.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }] });
  const rules = await makeText('rules', 'Server rules and community standards.');
  const welcome = await makeText('welcome', 'Welcome messages for new members.');
  const logChannels = [];
  const logFailures = [];
  for (const eventKey of logEventKeys) {
    try {
      logChannels.push(await ensurePrivateLogChannel(guild, eventKey));
    } catch (error) {
      logFailures.push(`${eventKey}: ${error.message}`);
      console.error(`Could not create ${eventKey} log channel in ${guild.name}:`, error.message);
    }
  }
  settings.logChannelId = logChannels[0]?.id || settings.logChannelId;
  settings.rulesChannelId = rules.id;
  settings.welcomeChannelId = welcome.id;
  settings.rulesText = settings.rulesText || 'Be respectful, follow Discord rules, and keep this community welcoming.';
  await rules.send({ embeds: [guildEmbed(guild, 'Server rules', settings.rulesText, 0xfee75c)] }).catch(() => {});
  await createTicketSetup(guild);
  saveData();
  return { quarantineRoleId: quarantine.id, logChannelId: settings.logChannelId, logCategoryId: settings.logCategoryId, logChannels: logChannels.length, logFailures, rulesChannelId: rules.id, welcomeChannelId: welcome.id, ticketCategoryId: settings.ticketCategoryId, ticketPanelChannelId: settings.ticketPanelChannelId };
}

function copyableChannel(channel) {
  return [ChannelType.GuildCategory, ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildVoice, ChannelType.GuildStageVoice, ChannelType.GuildForum].includes(channel.type);
}
function channelOptions(channel, parentId, roleMap, destination) {
  const permissionOverwrites = channel.permissionOverwrites.cache
    .map((overwrite) => {
      const mappedId = overwrite.type === 0 ? roleMap.get(overwrite.id) : destination.members.cache.has(overwrite.id) ? overwrite.id : null;
      if (!mappedId) return null;
      return { id: mappedId, allow: overwrite.allow.bitfield, deny: overwrite.deny.bitfield, type: overwrite.type };
    })
    .filter(Boolean);
  const options = {
    name: channel.name,
    type: channel.type,
    parent: parentId || undefined,
    topic: 'topic' in channel ? channel.topic || undefined : undefined,
    nsfw: 'nsfw' in channel ? channel.nsfw : undefined,
    rateLimitPerUser: 'rateLimitPerUser' in channel ? channel.rateLimitPerUser : undefined,
    permissionOverwrites
  };
  if (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice) {
    options.bitrate = channel.bitrate;
    options.userLimit = channel.userLimit;
  }
  return options;
}
async function copyServer(source, destination) {
  const sourceRoles = [...source.roles.cache.values()]
    .filter((role) => role.id !== source.id && !role.managed && role.name !== '@everyone')
    .sort((first, second) => first.position - second.position);
  const roleMap = new Map([[source.id, destination.id]]);
  let rolesCreated = 0;
  for (const role of sourceRoles) {
    const existing = destination.roles.cache.find((item) => item.name === role.name && !item.managed);
    if (existing) {
      roleMap.set(role.id, existing.id);
      continue;
    }
    const created = await destination.roles.create({
      name: role.name,
      color: role.color,
      hoist: role.hoist,
      mentionable: role.mentionable,
      permissions: role.permissions.bitfield,
      reason: `Copy roles from ${source.name} (${source.id})`
    });
    roleMap.set(role.id, created.id);
    rolesCreated += 1;
  }
  const sourceChannels = [...source.channels.cache.values()].filter(copyableChannel).sort((first, second) => {
    if (first.type === ChannelType.GuildCategory && second.type !== ChannelType.GuildCategory) return -1;
    if (first.type !== ChannelType.GuildCategory && second.type === ChannelType.GuildCategory) return 1;
    return (first.rawPosition || 0) - (second.rawPosition || 0);
  });
  const channelMap = new Map();
  let channelsCreated = 0;
  let channelsSkipped = 0;
  for (const channel of sourceChannels) {
    const existing = destination.channels.cache.find((item) => item.name === channel.name && item.type === channel.type && (channel.parentId ? item.parent?.name === channel.parent?.name : !item.parentId));
    if (existing) {
      channelMap.set(channel.id, existing.id);
      channelsSkipped += 1;
      continue;
    }
    const parentId = channel.parentId ? channelMap.get(channel.parentId) : null;
    const created = await destination.channels.create(channelOptions(channel, parentId, roleMap, destination));
    channelMap.set(channel.id, created.id);
    channelsCreated += 1;
  }
  const sourceSettings = getGuildData(source.id);
  const destinationSettings = getGuildData(destination.id);
  for (const key of ['rulesText', 'welcomeMessage', 'goodbyeMessage', 'levelUpMessage', 'embedColor', 'automodAction']) {
    if (sourceSettings[key] !== undefined) destinationSettings[key] = structuredClone(sourceSettings[key]);
  }
  const destinationRules = channelMap.get(sourceSettings.rulesChannelId);
  const rulesChannel = destinationRules ? destination.channels.cache.get(destinationRules) : null;
  if (rulesChannel?.isTextBased() && sourceSettings.rulesText) {
    await rulesChannel.send({ embeds: [guildEmbed(destination, 'Server rules', sourceSettings.rulesText, 0xfee75c)] }).catch(() => {});
    destinationSettings.rulesChannelId = rulesChannel.id;
  }
  saveData();
  return { rolesCreated, channelsCreated, channelsSkipped, sourceChannels: sourceChannels.length };
}

const setupCommand = new SlashCommandBuilder()
  .setName('setup')
  .setDescription('Configure a bot feature')
  .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
  .addSubcommand((s) => s.setName('all').setDescription('Create and configure the complete server setup'))
  .addSubcommand((s) => s.setName('welcome').setDescription('Set the welcome channel').addChannelOption((o) => o.setName('channel').setDescription('Welcome channel').setRequired(true)))
  .addSubcommand((s) => s.setName('logs').setDescription('Create private log channels').addStringOption((o) => o.setName('event').setDescription('Event to create logs for').setRequired(true).addChoices(
    { name: 'All events', value: 'all' },
    { name: 'Bans', value: 'ban' },
    { name: 'Kicks', value: 'kick' },
    { name: 'Timeouts', value: 'timeout' },
    { name: 'Warnings', value: 'warn' },
    { name: 'Messages deleted', value: 'message_deleted' },
    { name: 'Messages edited', value: 'message_edited' },
    { name: 'Channels created', value: 'channel_created' },
    { name: 'Channels deleted', value: 'channel_deleted' },
    { name: 'Channels updated', value: 'channel_updated' },
    { name: 'Roles created', value: 'role_created' },
    { name: 'Roles deleted', value: 'role_deleted' },
    { name: 'Roles updated', value: 'role_updated' },
    { name: 'Member joins', value: 'member_join' },
    { name: 'Member leaves', value: 'member_left' },
    { name: 'Nickname changes', value: 'nickname_changed' },
    { name: 'Tickets opened', value: 'ticket_opened' },
    { name: 'Tickets closed', value: 'ticket_closed' },
    { name: 'Auto Mod', value: 'auto_mod' },
    { name: 'Security', value: 'security' }
  )))
  .addSubcommand((s) => s.setName('rules').setDescription('Set the rules channel and text').addChannelOption((o) => o.setName('channel').setDescription('Rules channel').setRequired(true)).addStringOption((o) => o.setName('text').setDescription('Rules text').setMaxLength(4000).setRequired(true)))
  .addSubcommand((s) => s.setName('ticket').setDescription('Create the ticket category and ticket panel'))
  .addSubcommand((s) => s.setName('security').setDescription('Configure server protection').addBooleanOption((o) => o.setName('spam').setDescription('Anti-spam').setRequired(true)).addBooleanOption((o) => o.setName('invites').setDescription('Block Discord invites').setRequired(true)).addBooleanOption((o) => o.setName('caps').setDescription('Block excessive caps').setRequired(true)).addBooleanOption((o) => o.setName('raid').setDescription('Enable raid join protection').setRequired(true)))
  .addSubcommand((s) => s.setName('prefix').setDescription('Change the text command prefix').addStringOption((o) => o.setName('value').setDescription('Prefix such as ?, $, or !').setMinLength(1).setMaxLength(3).setRequired(true)))
  .addSubcommand((s) => s.setName('automod').setDescription('Enable or disable blocked-word automod').addBooleanOption((o) => o.setName('enabled').setDescription('Enabled').setRequired(true)));

const blacklistCommand = new SlashCommandBuilder()
  .setName('blacklist')
  .setDescription('Manage blacklisted users')
  .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
  .addSubcommand((s) => s.setName('add').setDescription('Blacklist a user').addUserOption((o) => o.setName('user').setDescription('User to blacklist').setRequired(true)))
  .addSubcommand((s) => s.setName('remove').setDescription('Remove a user from the blacklist').addUserOption((o) => o.setName('user').setDescription('User to remove').setRequired(true)))
  .addSubcommand((s) => s.setName('list').setDescription('Show blacklisted users'));

const commands = [
  new SlashCommandBuilder().setName('help').setDescription('Show the bot command guide'),
  new SlashCommandBuilder().setName('about').setDescription('Show bot information and dashboard link'),
  new SlashCommandBuilder().setName('stop').setDescription('Stop the bot process').setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  new SlashCommandBuilder().setName('copyserver').setDescription('Copy a server structure into this server').setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addStringOption((o) => o.setName('source_server_id').setDescription('ID of a server the bot is already in').setRequired(true))
    .addBooleanOption((o) => o.setName('confirm').setDescription('Create missing roles and channels after reviewing the preview')),
  new SlashCommandBuilder().setName('paste').setDescription('Paste the last copied server structure here').setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addBooleanOption((o) => o.setName('confirm').setDescription('Create missing roles and channels after reviewing the preview')),
  new SlashCommandBuilder().setName('log').setDescription('Manage private server logs').setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild).addSubcommand((s) => s.setName('setup').setDescription('Create or repair the complete private log category')),
  new SlashCommandBuilder().setName('ping').setDescription('Check the bot latency'),
  new SlashCommandBuilder().setName('serverinfo').setDescription('Show information about this server'),
  new SlashCommandBuilder().setName('userinfo').setDescription('Show information about a member').addUserOption((o) => o.setName('user').setDescription('Member to inspect')),
  new SlashCommandBuilder().setName('ban').setDescription('Ban a member').setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers).addUserOption((o) => o.setName('user').setDescription('Member to ban').setRequired(true)).addStringOption((o) => o.setName('reason').setDescription('Reason')),
  new SlashCommandBuilder().setName('kick').setDescription('Kick a member').setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers).addUserOption((o) => o.setName('user').setDescription('Member to kick').setRequired(true)).addStringOption((o) => o.setName('reason').setDescription('Reason')),
  new SlashCommandBuilder().setName('timeout').setDescription('Timeout a member').setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers).addUserOption((o) => o.setName('user').setDescription('Member to timeout').setRequired(true)).addIntegerOption((o) => o.setName('minutes').setDescription('Duration in minutes').setMinValue(1).setMaxValue(40320).setRequired(true)).addStringOption((o) => o.setName('reason').setDescription('Reason')),
  new SlashCommandBuilder().setName('warn').setDescription('Warn a member').setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers).addUserOption((o) => o.setName('user').setDescription('Member to warn').setRequired(true)).addStringOption((o) => o.setName('reason').setDescription('Reason').setRequired(true)),
  new SlashCommandBuilder().setName('warnings').setDescription('View member warnings').addUserOption((o) => o.setName('user').setDescription('Member to inspect')),
  new SlashCommandBuilder().setName('clear').setDescription('Delete recent messages').setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages).addIntegerOption((o) => o.setName('amount').setDescription('Number of messages').setMinValue(1).setMaxValue(100).setRequired(true)),
  new SlashCommandBuilder().setName('purge').setDescription('Delete recent messages').setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages).addIntegerOption((o) => o.setName('amount').setDescription('Number of messages').setMinValue(1).setMaxValue(100).setRequired(true)),
  new SlashCommandBuilder().setName('unban').setDescription('Unban a user by ID').setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers).addStringOption((o) => o.setName('user_id').setDescription('User ID').setRequired(true)).addStringOption((o) => o.setName('reason').setDescription('Reason')),
  new SlashCommandBuilder().setName('nickname').setDescription('Change a member nickname').setDefaultMemberPermissions(PermissionsBitField.Flags.ManageNicknames).addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true)).addStringOption((o) => o.setName('nickname').setDescription('New nickname, empty to reset').setMaxLength(32).setRequired(true)),
  new SlashCommandBuilder().setName('quarantine').setDescription('Apply the configured quarantine role').setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers).addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true)).addStringOption((o) => o.setName('reason').setDescription('Reason')),
  new SlashCommandBuilder().setName('softban').setDescription('Ban and immediately unban a member').setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers).addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true)).addStringOption((o) => o.setName('reason').setDescription('Reason')),
  new SlashCommandBuilder().setName('unmute').setDescription('Remove a member timeout').setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers).addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true)).addStringOption((o) => o.setName('reason').setDescription('Reason')),
  new SlashCommandBuilder().setName('lockdown').setDescription('Lock or unlock every text channel').setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels).addBooleanOption((o) => o.setName('enabled').setDescription('Lockdown enabled').setRequired(true)),
  new SlashCommandBuilder().setName('lock').setDescription('Lock a channel').setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels).addChannelOption((o) => o.setName('channel').setDescription('Channel to lock')),
  new SlashCommandBuilder().setName('unlock').setDescription('Unlock a channel').setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels).addChannelOption((o) => o.setName('channel').setDescription('Channel to unlock')),
  new SlashCommandBuilder().setName('slowmode').setDescription('Set channel slowmode').setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels).addIntegerOption((o) => o.setName('seconds').setDescription('Seconds, 0 to disable').setMinValue(0).setMaxValue(21600).setRequired(true)).addChannelOption((o) => o.setName('channel').setDescription('Channel to update')),
  new SlashCommandBuilder().setName('role').setDescription('Add or remove a role from a member').setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles).addStringOption((o) => o.setName('action').setDescription('Role action').setRequired(true).addChoices(
    { name: 'Add', value: 'add' },
    { name: 'Remove', value: 'remove' }
  )).addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true)).addRoleOption((o) => o.setName('role').setDescription('Role').setRequired(true)),
  new SlashCommandBuilder().setName('say').setDescription('Send a message as the bot').setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages).addStringOption((o) => o.setName('message').setDescription('Message to send').setMaxLength(2000).setRequired(true)).addChannelOption((o) => o.setName('channel').setDescription('Destination channel')),
  new SlashCommandBuilder().setName('announce').setDescription('Post a server announcement').setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild).addStringOption((o) => o.setName('title').setDescription('Announcement title').setMaxLength(256).setRequired(true)).addStringOption((o) => o.setName('message').setDescription('Announcement text').setMaxLength(4000).setRequired(true)).addChannelOption((o) => o.setName('channel').setDescription('Destination channel')),
  new SlashCommandBuilder().setName('avatar').setDescription('Show a member avatar').addUserOption((o) => o.setName('user').setDescription('Member to inspect')),
  new SlashCommandBuilder().setName('channelinfo').setDescription('Show channel details').addChannelOption((o) => o.setName('channel').setDescription('Channel to inspect')),
  new SlashCommandBuilder().setName('roleinfo').setDescription('Show role details').addRoleOption((o) => o.setName('role').setDescription('Role to inspect').setRequired(true)),
  new SlashCommandBuilder().setName('poll').setDescription('Create a yes/no poll').addStringOption((o) => o.setName('question').setDescription('Poll question').setMaxLength(1000).setRequired(true)),
  new SlashCommandBuilder().setName('remind').setDescription('Send yourself a reminder').addIntegerOption((o) => o.setName('minutes').setDescription('Minutes from now').setMinValue(1).setMaxValue(10080).setRequired(true)).addStringOption((o) => o.setName('message').setDescription('Reminder text').setMaxLength(1000).setRequired(true)),
  new SlashCommandBuilder().setName('level').setDescription('View a member level').addUserOption((o) => o.setName('user').setDescription('Member to inspect')),
  new SlashCommandBuilder().setName('profile').setDescription('View a member profile').addUserOption((o) => o.setName('user').setDescription('Member to inspect')),
  new SlashCommandBuilder().setName('rank').setDescription('View your server rank').addUserOption((o) => o.setName('user').setDescription('Member to inspect')),
  new SlashCommandBuilder().setName('leaderboard').setDescription('Show the server XP leaderboard'),
  new SlashCommandBuilder().setName('top').setDescription('Show the server XP leaderboard'),
  new SlashCommandBuilder().setName('setxp').setDescription('Set a member XP total').setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild).addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true)).addIntegerOption((o) => o.setName('amount').setDescription('XP amount').setMinValue(0).setMaxValue(100000000).setRequired(true)),
  new SlashCommandBuilder().setName('setlevel').setDescription('Set a member level').setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild).addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true)).addIntegerOption((o) => o.setName('level').setDescription('Level').setMinValue(0).setMaxValue(10000).setRequired(true)),
  new SlashCommandBuilder().setName('roll').setDescription('Roll a random number').addIntegerOption((o) => o.setName('sides').setDescription('Number of sides').setMinValue(2).setMaxValue(1000)),
  new SlashCommandBuilder().setName('rep').setDescription('Give reputation to a member').addUserOption((o) => o.setName('user').setDescription('Member to thank').setRequired(true)),
  new SlashCommandBuilder().setName('selfrole').setDescription('Toggle one of the server self-assignable roles').addRoleOption((o) => o.setName('role').setDescription('Role to toggle').setRequired(true)),
  new SlashCommandBuilder().setName('rules').setDescription('Show the configured server rules'),
  setupCommand,
  new SlashCommandBuilder().setName('security').setDescription('View server security status'),
  blacklistCommand,
  new SlashCommandBuilder().setName('ticket').setDescription('Open a private support ticket')
].map((command) => command.toJSON());

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();
process.once('SIGINT', () => { removePidFile(); client.destroy(); process.exit(0); });
process.once('SIGTERM', () => { removePidFile(); client.destroy(); process.exit(0); });

async function registerCommands() {
  if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) throw new Error('DISCORD_TOKEN and CLIENT_ID are required in .env');
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
  console.log(`Registered ${commands.length} global slash commands. Discord may take up to an hour to show new global commands.`);
}

async function registerGuildCommands(readyClient) {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const guilds = [...readyClient.guilds.cache.values()];
  await Promise.all(guilds.map((guild) => registerGuildCommand(rest, guild)));
  console.log(`Registered ${commands.length} instant guild commands in ${guilds.length} connected servers.`);
}
async function registerGuildCommand(rest, guild) {
  try {
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guild.id), { body: commands });
    console.log(`Commands ready in ${guild.name}.`);
  } catch (error) {
    console.error(`Could not register commands in ${guild.name} (${guild.id}):`, error.message);
  }
}

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}. Connected guilds: ${readyClient.guilds.cache.size}.`);
  if (!readyClient.guilds.cache.size) console.warn('The bot is connected but is not currently visible in any server. Recheck the invite and bot token.');
  await registerGuildCommands(readyClient);
});
client.on(Events.GuildCreate, async (guild) => {
  if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) return;
  await registerGuildCommand(new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN), guild);
});
client.on('error', (error) => {
  if (error?.code === 10062 || error?.rawError?.code === 10062) console.warn('Ignored an expired Discord interaction.');
  else console.error('Discord client error:', error);
});

client.on(Events.GuildMemberAdd, async (member) => {
  const settings = getGuildData(member.guild.id);
  if (settings.blacklist.includes(member.id)) {
    await member.ban({ reason: 'Blacklisted user' }).catch(() => {});
    await sendLog(member.guild, 'Blacklist action', `${member.user.tag} was banned on join.` , 0xed4245);
    return;
  }
  for (const roleId of settings.autoRoleIds) await member.roles.add(roleId).catch(() => {});
  if (settings.security.antiRaid) {
    const now = Date.now();
    const joins = (raidTracker.get(member.guild.id) || []).filter((time) => now - time < 10000);
    joins.push(now);
    raidTracker.set(member.guild.id, joins);
    if (joins.length >= settings.security.raidLimit) await sendLog(member.guild, 'Raid protection alert', `${joins.length} members joined within 10 seconds. Review the server immediately.`, 0xed4245);
  }
  if (settings.welcomeDelivery === 'dm') await member.send(replaceTokens(settings.welcomeMessage, member, member.guild)).catch(() => {});
  if (settings.welcomeDelivery === 'channel' && settings.welcomeChannelId) {
    const channel = member.guild.channels.cache.get(settings.welcomeChannelId);
    if (channel?.isTextBased()) await channel.send({ embeds: [guildEmbed(member.guild, 'Welcome!', replaceTokens(settings.welcomeMessage, member, member.guild), 0x57f287)] });
  }
});

client.on(Events.GuildMemberRemove, async (member) => {
  const settings = getGuildData(member.guild.id);
  const channel = settings.goodbyeChannelId ? member.guild.channels.cache.get(settings.goodbyeChannelId) : null;
  if (channel?.isTextBased()) await channel.send(replaceTokens(settings.goodbyeMessage, member, member.guild)).catch(() => {});
  await sendLog(member.guild, 'Member left', `${member.user.tag} left the server.`, 0x95a3b8);
});

client.on(Events.MessageDelete, async (message) => {
  if (!message.guild || message.author?.bot) return;
  await sendLog(message.guild, 'Message deleted', `A message by **${message.author?.tag || 'unknown user'}** was deleted in ${message.channel}.\n${message.content ? `> ${message.content.slice(0, 500)}` : 'Content unavailable.'}`, 0xed4245);
});

client.on(Events.MessageUpdate, async (before, after) => {
  if (!after.guild || after.author?.bot || before.content === after.content) return;
  await sendLog(after.guild, 'Message edited', `A message by **${after.author?.tag || 'unknown user'}** was edited in ${after.channel}.\nBefore: ${before.content?.slice(0, 300) || ' unavailable'}\nAfter: ${after.content?.slice(0, 300) || ' unavailable'}`, 0xfee75c);
});

client.on(Events.ChannelCreate, async (channel) => {
  if (channel.guild) await sendLog(channel.guild, 'Channel created', `Channel **${channel.name}** was created.`, 0x57f287);
});
client.on(Events.ChannelDelete, async (channel) => {
  if (channel.guild) await sendLog(channel.guild, 'Channel deleted', `Channel **${channel.name}** was deleted.`, 0xed4245);
});
client.on(Events.ChannelUpdate, async (before, after) => {
  if (after.guild && before.name !== after.name) await sendLog(after.guild, 'Channel updated', `Channel renamed from **${before.name}** to **${after.name}**.`, 0xfee75c);
});
client.on(Events.RoleCreate, async (role) => sendLog(role.guild, 'Role created', `Role **${role.name}** was created.`, 0x57f287));
client.on(Events.RoleDelete, async (role) => sendLog(role.guild, 'Role deleted', `Role **${role.name}** was deleted.`, 0xed4245));
client.on(Events.RoleUpdate, async (before, after) => {
  if (before.name !== after.name || before.color !== after.color) await sendLog(after.guild, 'Role updated', `Role **${before.name}** was updated.`, 0xfee75c);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild) return;
  const settings = getGuildData(message.guild.id);
  const matchingReply = settings.autoReplies.find((entry) => entry.enabled !== false && message.content.toLowerCase().includes(entry.trigger.toLowerCase()));
  if (matchingReply) await message.reply(matchingReply.response).catch(() => {});
  const prefix = settings.prefix;
  if (message.content.toLowerCase().startsWith(prefix.toLowerCase())) {
    const [command, ...args] = message.content.slice(prefix.length).trim().split(/\s+/);
    const typedCommandName = command?.toLowerCase();
    const commandName = resolveCommand(typedCommandName, settings.commandAliases) || typedCommandName;
    if (!commandName) return;
    if (settings.commandEnabled[commandName] === false) return message.reply(`The **${commandName}** command is disabled in this server.`);
    if (commandName === 'about') return message.reply({ embeds: [embed('Server Control', `A self-hosted moderation, protection, tickets, logging, AutoMod, leveling, and utility bot.\n\n**Dashboard:** [Open Server Control](${getDashboardUrl()})\n**Status:** Online · ${client.guilds.cache.size} server${client.guilds.cache.size === 1 ? '' : 's'}`)] });
    if (commandName === 'help' || commandName === 'commands') return message.reply(`Dashboard: ${getDashboardUrl()}\nCommands: ${prefix}about, ${prefix}help, ${prefix}ping, ${prefix}ticket, ${prefix}rules, ${prefix}profile, ${prefix}rank, ${prefix}top, ${prefix}rep, ${prefix}selfrole, ${prefix}security, ${prefix}serverinfo, ${prefix}ban, ${prefix}kick, ${prefix}clear`);
    if (commandName === 'stop') { if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.reply('Administrator permission is required to stop the bot.'); await message.reply('Stopping the bot safely…'); setTimeout(() => { client.destroy(); process.exit(0); }, 750); return; }
    if (commandName === 'ping') return message.reply(`Pong! ${client.ws.ping}ms`);
    if (commandName === 'rules') return message.reply({ embeds: [embed('Server rules', settings.rulesText, 0xfee75c)] });
    if (commandName === 'security') return message.reply({ embeds: [embed('Security status', `Anti-spam: **${settings.security.antiSpam ? 'ON' : 'OFF'}**\nAnti-invite: **${settings.security.antiInvite ? 'ON' : 'OFF'}**\nAnti-caps: **${settings.security.antiCaps ? 'ON' : 'OFF'}**\nAnti-raid: **${settings.security.antiRaid ? 'ON' : 'OFF'}**`)] });
    if (commandName === 'serverinfo') return message.reply({ embeds: [embed(message.guild.name, `Members: **${message.guild.memberCount}**\nChannels: **${message.guild.channels.cache.size}**`)] });
    if (['level', 'profile', 'rank'].includes(commandName)) { const user = message.mentions.users.first() || message.author; const record = settings.xp[user.id] || { xp: 0, level: 0 }; const rank = getXpRank(settings, user.id); return message.reply({ embeds: [embed(`${user.username}'s profile`, `Level: **${record.level}**\nXP: **${record.xp}**\nRank: **${rank ? `#${rank}` : 'Unranked'}**\nProgress: **${record.xp % 100}/100**`).setThumbnail(user.displayAvatarURL())] }); }
    if (['leaderboard', 'top'].includes(commandName)) { const rows = Object.entries(settings.xp).sort(([, first], [, second]) => second.xp - first.xp).slice(0, 10); return message.reply({ embeds: [embed('XP leaderboard', rows.length ? rows.map(([id, record], index) => `**${index + 1}.** <@${id}> - level ${record.level}, ${record.xp} XP`).join('\n') : 'No XP recorded yet.')] }); }
    if (commandName === 'roll') { const sides = Math.min(Math.max(Number(args[0]) || 6, 2), 1000); return message.reply(`🎲 **${Math.floor(Math.random() * sides) + 1}** (1-${sides})`); }
    if (commandName === 'rep') { const user = message.mentions.users.first(); if (!user || user.id === message.author.id) return message.reply(`Mention another member: ${prefix}rep @user`); settings.rep[ user.id ] = (settings.rep[user.id] || 0) + 1; saveData(); return message.reply(`⭐ ${user} now has **${settings.rep[user.id]}** reputation.`); }
    if (commandName === 'selfrole') { const role = message.mentions.roles.first(); if (!role) return message.reply(`Mention a self-assignable role: ${prefix}selfrole @role`); if (!settings.selfAssignableRoleIds.includes(role.id)) return message.reply('That role is not enabled for self-assignment. An administrator can add it in the dashboard.'); if (role.position >= message.guild.members.me.roles.highest.position) return message.reply('That role is above my highest role.'); const member = message.member; const hasRole = member.roles.cache.has(role.id); await member.roles[hasRole ? 'remove' : 'add'](role); return message.reply(`${hasRole ? 'Removed' : 'Added'} **${role.name}** ${hasRole ? 'from' : 'to'} your profile.`); }
    if (commandName === 'ticket') { const channel = await createTicketChannel(message.guild, message.author, settings); await sendLog(message.guild, 'Ticket opened', `${message.author.tag} opened ${channel}.`); return message.reply(`Your private ticket is ready: ${channel}`); }
    if (['ban', 'kick', 'warn', 'timeout', 'quarantine'].includes(commandName)) {
      if (!message.member.permissions.has(commandName === 'warn' || commandName === 'timeout' || commandName === 'quarantine' ? PermissionsBitField.Flags.ModerateMembers : commandName === 'ban' ? PermissionsBitField.Flags.BanMembers : PermissionsBitField.Flags.KickMembers)) return message.reply('You do not have permission to use that command.');
      const user = message.mentions.users.first();
      if (!user) return message.reply(`Mention a user: ${prefix}${commandName} @user reason`);
      const member = await message.guild.members.fetch(user.id).catch(() => null);
      const reason = args.slice(1).join(' ') || 'No reason provided';
      if (!member) return message.reply('That member is not in this server.');
      const audit = `Moderator: ${message.author.tag} (<@${message.author.id}>)\nTarget: ${user.tag} (<@${user.id}>)\nReason: ${reason}`;
      if (commandName === 'timeout') { const minutes = Math.min(Math.max(Number(args[1]) || 10, 1), 40320); await member.timeout(minutes * 60000, reason); await sendLog(message.guild, 'Timeout action', `${audit}\nDuration: ${minutes} minutes`, 0xed4245); return message.reply(`**${user.tag}** was timed out for ${minutes} minutes.`); }
      if (commandName === 'quarantine') { const role = settings.quarantineRoleId ? message.guild.roles.cache.get(settings.quarantineRoleId) : null; if (!role) return message.reply(`Configure a quarantine role in the dashboard first.`); if (role.position >= message.guild.members.me.roles.highest.position) return message.reply('My role must be above the quarantine role.'); await member.roles.add(role, reason); await sendLog(message.guild, 'Quarantine action', audit, 0xed4245); return message.reply(`**${user.tag}** was quarantined.`); }
      if (commandName === 'warn') { settings.warnings[user.id] ??= []; settings.warnings[user.id].push({ reason, moderator: message.author.tag, at: Date.now() }); saveData(); await sendLog(message.guild, 'Member warned', audit, 0xfee75c); return message.reply(`**${user.tag}** has been warned.`); }
      if (!member.manageable) return message.reply('I cannot moderate that member. Check my role position.');
      if (commandName === 'ban') await member.ban({ reason }); else await member.kick(reason);
      await sendLog(message.guild, `${commandName} action`, audit, 0xed4245);
      return message.reply(`Done. **${user.tag}** was ${commandName}ned.`);
    }
    if (commandName === 'clear' || commandName === 'purge') { if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return message.reply('You do not have permission to use that command.'); const amount = Math.min(Math.max(Number(args[0]) || 0, 1), 100); const deleted = await message.channel.bulkDelete(amount, true); await sendLog(message.guild, 'Messages purged', `${message.author.tag} deleted ${deleted.size} messages in ${message.channel}.`); return message.reply({ content: `Deleted ${deleted.size} messages.`, allowedMentions: { repliedUser: false } }).then((reply) => setTimeout(() => reply.delete().catch(() => {}), 4000)); }
    if (commandName === 'unban') { if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return message.reply('You do not have permission to use that command.'); const userId = args[0]?.replace(/[^0-9]/g, ''); if (!userId) return message.reply(`Use ${prefix}unban USER_ID`); await message.guild.members.unban(userId, args.slice(1).join(' ') || 'Unban command'); return message.reply(`User **${userId}** was unbanned.`); }
    if (commandName === 'softban' || commandName === 'unmute') { const permission = commandName === 'softban' ? PermissionsBitField.Flags.BanMembers : PermissionsBitField.Flags.ModerateMembers; if (!message.member.permissions.has(permission)) return message.reply('You do not have permission to use that command.'); const user = message.mentions.users.first(); const member = user ? await message.guild.members.fetch(user.id).catch(() => null) : null; if (!member) return message.reply(`Use ${prefix}${commandName} @user reason`); const reason = args.slice(1).join(' ') || commandName; if (commandName === 'softban') { await member.ban({ reason }); await message.guild.members.unban(member.id, reason).catch(() => {}); } else await member.timeout(null, reason); await sendLog(message.guild, commandName === 'softban' ? 'Soft-ban action' : 'Timeout removed', `${user.tag} was processed by ${message.author.tag}.`, 0xed4245); return message.reply(`**${user.tag}** was ${commandName === 'softban' ? 'soft-banned' : 'unmuted'}.`); }
    if (commandName === 'lockdown') { if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return message.reply('You do not have permission to use that command.'); const enabled = args[0]?.toLowerCase() !== 'off'; const channels = message.guild.channels.cache.filter((channel) => channel.isTextBased() && channel.manageable); await Promise.all(channels.map((channel) => channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: enabled ? false : null }).catch(() => {}))); return message.reply(`Server lockdown **${enabled ? 'enabled' : 'disabled'}**.`); }
    if (commandName === 'nickname') { if (!message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) return message.reply('You do not have permission to use that command.'); const user = message.mentions.users.first(); const member = user ? await message.guild.members.fetch(user.id).catch(() => null) : null; if (!member) return message.reply(`Use ${prefix}nickname @user new nickname`); await member.setNickname(args.slice(1).join(' ') || null); return message.reply(`Nickname updated for **${user.tag}**.`); }
    if (commandName === 'lock' || commandName === 'unlock') { if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return message.reply('You do not have permission to use that command.'); await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: commandName === 'unlock' ? null : false }); return message.reply(`Channel **${commandName === 'lock' ? 'locked' : 'unlocked'}**.`); }
    if (commandName === 'say') { if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return message.reply('You do not have permission to use that command.'); const text = args.join(' '); if (!text) return message.reply(`Use ${prefix}say your message`); await message.delete().catch(() => {}); return message.channel.send(text); }
    if (commandName === 'announce') { if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return message.reply('You do not have permission to use that command.'); const text = args.join(' '); if (!text) return message.reply(`Use ${prefix}announce your announcement`); return message.channel.send({ embeds: [embed('Announcement', text, 0x57f287)] }); }
    if (commandName === 'copyserver') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.reply('Administrator permission is required to copy a server.');
      const source = client.guilds.cache.get(args[0]);
      if (!source) return message.reply(`Use ${prefix}copyserver SOURCE_SERVER_ID confirm. The bot must be installed in the source server too.`);
      if (!message.guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageChannels) || !message.guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageRoles)) return message.reply('I need Manage Channels and Manage Roles in this server.');
      if (args[1]?.toLowerCase() !== 'confirm') return message.reply(`Preview: **${source.name}** has ${source.roles.cache.filter((role) => role.id !== source.id && !role.managed && role.name !== '@everyone').size} roles and ${source.channels.cache.filter(copyableChannel).size} channels/categories. Run \`${prefix}copyserver ${source.id} confirm\` to create missing items.`);
      const result = await copyServer(source, message.guild);
      copyState[message.guild.id] = { sourceId: source.id, sourceName: source.name, savedAt: new Date().toISOString() };
      saveCopyState();
      await sendLog(message.guild, 'Server copied', `Administrator: ${message.author.tag} (<@${message.author.id}>)\nSource: ${source.name} (${source.id})\nRoles created: ${result.rolesCreated}\nChannels created: ${result.channelsCreated}\nChannels skipped: ${result.channelsSkipped}`, 0x57f287);
      return message.reply(`Copied **${source.name}**. Created ${result.rolesCreated} roles and ${result.channelsCreated} channels/categories; skipped ${result.channelsSkipped} existing channels.`);
    }
    if (commandName === 'paste') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.reply('Administrator permission is required to paste a server.');
      const saved = copyState[message.guild.id];
      const source = saved?.sourceId ? client.guilds.cache.get(saved.sourceId) : null;
      if (!source) return message.reply(`No copied server is saved for this server. Run ${prefix}copyserver first.`);
      if (!message.guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageChannels) || !message.guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageRoles)) return message.reply('I need Manage Channels and Manage Roles in this server.');
      if (args[0]?.toLowerCase() !== 'confirm') return message.reply(`Preview: **${source.name}** has ${source.roles.cache.filter((role) => role.id !== source.id && !role.managed && role.name !== '@everyone').size} roles and ${source.channels.cache.filter(copyableChannel).size} channels/categories. Run \`${prefix}paste confirm\` to paste it.`);
      const result = await copyServer(source, message.guild);
      await sendLog(message.guild, 'Server pasted', `Administrator: ${message.author.tag} (<@${message.author.id}>)\nSource: ${source.name} (${source.id})\nRoles created: ${result.rolesCreated}\nChannels created: ${result.channelsCreated}\nChannels skipped: ${result.channelsSkipped}`, 0x57f287);
      return message.reply(`Pasted **${source.name}**. Created ${result.rolesCreated} roles and ${result.channelsCreated} channels/categories; skipped ${result.channelsSkipped} existing channels.`);
    }
    if (commandName === 'blacklist') { if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return message.reply('You do not have permission to use that command.'); const user = message.mentions.users.first(); if (!user) return message.reply(`Use ${prefix}blacklist @user`); if (!settings.blacklist.includes(user.id)) settings.blacklist.push(user.id); saveData(); await message.guild.members.ban(user.id, { reason: `Blacklisted by ${message.author.tag}` }).catch(() => {}); return message.reply(`**${user.tag}** was added to the blacklist.`); }
    return message.reply(`Unknown command. Use **${prefix}help** for the command list.`);
  }
  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    const content = message.content;
    const uppercaseLetters = (content.match(/[A-Z]/g) || []).length;
    const letters = (content.match(/[A-Za-z]/g) || []).length;
    let automodReason = null;
    if (settings.automod && settings.blockedWords.some((word) => word && content.toLowerCase().includes(word))) automodReason = 'Blocked word';
    if (!automodReason && settings.security.antiInvite && /(?:discord\.gg|discord\.com\/invite)\//i.test(content)) automodReason = 'Discord invite';
    if (!automodReason && settings.security.antiCaps && letters >= 12 && uppercaseLetters / letters >= 0.75) automodReason = 'Excessive caps';
    if (!automodReason && settings.security.antiMassMention && (message.mentions.everyone || message.mentions.users.size >= 5 || message.mentions.roles.size >= 3)) automodReason = 'Mass mentions';
    if (!automodReason && settings.security.antiSpam) {
      const key = `${message.guild.id}:${message.author.id}`;
      const now = Date.now();
      const recent = (spamTracker.get(key) || []).filter((time) => now - time < 8000);
      recent.push(now);
      spamTracker.set(key, recent);
      if (recent.length >= 6) { automodReason = 'Message spam'; await message.member.timeout(30000, 'Auto Mod spam protection').catch(() => {}); spamTracker.delete(key); }
    }
    if (automodReason) {
      await message.delete().catch(() => {});
      const warning = settings.automodAction === 'warn' ? await message.channel.send(`${message.author}, your message was removed by Auto Mod: **${automodReason}**.`).catch(() => null) : null;
      if (warning) setTimeout(() => warning.delete().catch(() => {}), 5000);
      await sendLog(message.guild, 'Auto Mod action', `${message.author.tag}'s message was removed in ${message.channel}. Reason: ${automodReason}.`, 0xed4245);
      return;
    }
  }
  if (!settings.levelUp || message.content.length < 5 || settings.levelExcludedChannels.includes(message.channel.id) || settings.levelExcludedRoles.some((roleId) => message.member.roles.cache.has(roleId))) return;
  const record = settings.xp[message.author.id] ?? { xp: 0, level: 0 };
  record.xp += 10;
  const nextLevel = Math.floor(Math.sqrt(record.xp / 100));
  if (nextLevel > record.level) {
    record.level = nextLevel;
    const levelMessage = settings.levelUpMessage.replaceAll('{user}', `${message.author}`).replaceAll('{level}', String(record.level));
    await message.channel.send(levelMessage).catch(() => {});
    const reward = settings.levelRoleRewards.find((entry) => entry.level === record.level);
    if (reward) await message.member.roles.add(reward.roleId).catch(() => {});
  }
  settings.xp[message.author.id] = record;
  saveData();
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.guild) return;
  const settings = getGuildData(interaction.guild.id);
  if (interaction.isButton() && interaction.customId.startsWith('ticket_open')) {
    try {
      const systemId = interaction.customId.split(':')[1] || 'default';
      const system = settings.ticketSystems?.find((item) => item.id === systemId) || settings.ticketSystems?.[0] || settings;
      if (system.enabled === false) return interaction.reply({ content: 'This ticket system is currently disabled.', ephemeral: true });
      const channel = await createTicketChannel(interaction.guild, interaction.user, settings, system);
      await sendLog(interaction.guild, 'Ticket opened', `${interaction.user.tag} opened ${channel}.`);
      return interaction.reply({ content: `Your private ticket is ready: ${channel}`, ephemeral: true });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'I could not create your ticket. Check my Manage Channels permission.', ephemeral: true });
    }
  }
  if (interaction.isButton() && interaction.customId.startsWith('ticket_close')) {
    const systemId = interaction.customId.split(':')[1] || 'default';
    const system = settings.ticketSystems?.find((item) => item.id === systemId) || settings.ticketSystems?.[0] || settings;
    if (!interaction.channel.name.startsWith(`${system.namePrefix || settings.ticketNamePrefix}-`)) return interaction.reply({ content: 'This is not a ticket channel.', ephemeral: true });
    await sendTicketTranscript(interaction.guild, interaction.channel, system.id, interaction.user);
    await sendLog(interaction.guild, 'Ticket transcript', `${interaction.user.tag} generated a transcript for ${interaction.channel} before closing it.`);
    await sendLog(interaction.guild, 'Ticket closed', `${interaction.user.tag} closed ${interaction.channel}.`);
    await interaction.reply('This ticket will be closed in a few seconds.');
    setTimeout(() => interaction.channel.delete('Ticket closed').catch(() => {}), 3000);
    return;
  }
  if (!interaction.isChatInputCommand()) return;
  const name = interaction.commandName;
  try {
    if (settings.commandEnabled[name] === false) return interaction.reply({ content: `The **${name}** command is disabled in this server.`, ephemeral: true });
    if (name === 'setup' || name === 'log') await interaction.deferReply({ ephemeral: true });
    if (name === 'about') return interaction.reply({ embeds: [embed('Server Control', `A self-hosted moderation, protection, tickets, logging, AutoMod, leveling, and utility bot.\n\n**Dashboard:** [Open Server Control](${getDashboardUrl()})\n**Commands:** Use \`/help\` to see the command guide.\n**Status:** Online · ${client.guilds.cache.size} server${client.guilds.cache.size === 1 ? '' : 's'}`)] });
    if (name === 'help') return interaction.reply({ embeds: [embed('Bot commands', `Dashboard: [Open Server Control](${getDashboardUrl()})\n\n\`/setup prefix\` changes text commands; slash commands always use \`/\`\n\`/setup welcome\`, \`/setup rules\`, \`/setup logs\`, \`/setup ticket\`, \`/setup security\` configuration\n\`/copyserver source_server_id confirm:true\` copies and remembers a server structure\n\`/paste confirm:true\` pastes the last copied structure into this server\n\`/security\`, \`/blacklist\` server protection\n\`/ban\`, \`/kick\`, \`/timeout\`, \`/warn\`, \`/warnings\`, \`/clear\` moderation\n\`/lock\`, \`/unlock\`, \`/slowmode\`, \`/role\` server management\n\`/say\`, \`/announce\`, \`/ticket\`, \`/rules\` communication tools\n\`/level\`, \`/leaderboard\` XP system\n\`/ping\`, \`/serverinfo\`, \`/userinfo\`, \`/avatar\` utilities`)] });
    if (name === 'stop') {
      if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'Administrator permission is required to stop the bot.', ephemeral: true });
      await interaction.reply('Stopping the bot safely…');
      setTimeout(() => { client.destroy(); process.exit(0); }, 750);
      return;
    }
    if (name === 'copyserver') {
      if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'Administrator permission is required to copy a server.', ephemeral: true });
      const sourceId = interaction.options.getString('source_server_id', true).trim();
      if (sourceId === interaction.guild.id) return interaction.reply({ content: 'The source server must be different from this server.', ephemeral: true });
      const source = client.guilds.cache.get(sourceId);
      if (!source) return interaction.reply({ content: 'I cannot find that source server. The bot must already be installed in both servers, and you must provide its server ID.', ephemeral: true });
      if (!interaction.guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageChannels) || !interaction.guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return interaction.reply({ content: 'I need Manage Channels and Manage Roles in this server before I can copy it.', ephemeral: true });
      }
      const roleCount = source.roles.cache.filter((role) => role.id !== source.id && !role.managed && role.name !== '@everyone').size;
      const channelCount = source.channels.cache.filter(copyableChannel).size;
      if (!interaction.options.getBoolean('confirm')) {
        return interaction.reply({ ephemeral: true, embeds: [embed('Copy preview', `Source: **${source.name}** (\`${source.id}\`)\nDestination: **${interaction.guild.name}**\n\nRoles to consider: **${roleCount}**\nChannels/categories to consider: **${channelCount}**\n\nExisting same-named roles and channels will be skipped. No changes were made. Run this command again with \`confirm:true\` to continue.`)] });
      }
      await interaction.deferReply({ ephemeral: true });
      const result = await copyServer(source, interaction.guild);
      copyState[interaction.guild.id] = { sourceId: source.id, sourceName: source.name, savedAt: new Date().toISOString() };
      saveCopyState();
      await sendLog(interaction.guild, 'Server copied', `Administrator: ${interaction.user.tag} (<@${interaction.user.id}>)\nSource: ${source.name} (${source.id})\nRoles created: ${result.rolesCreated}\nChannels created: ${result.channelsCreated}\nChannels skipped: ${result.channelsSkipped}`, 0x57f287);
      return interaction.editReply({ embeds: [embed('Server copied', `Copied missing structure from **${source.name}**.\n\nRoles created: **${result.rolesCreated}**\nChannels/categories created: **${result.channelsCreated}**\nExisting channels skipped: **${result.channelsSkipped}**\n\nNo existing destination channels or roles were overwritten.` , 0x57f287)] });
    }
    if (name === 'paste') {
      if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'Administrator permission is required to paste a server.', ephemeral: true });
      const saved = copyState[interaction.guild.id];
      const source = saved?.sourceId ? client.guilds.cache.get(saved.sourceId) : null;
      if (!source) return interaction.reply({ content: 'No copied server is saved for this server. Run `/copyserver` first.', ephemeral: true });
      if (!interaction.guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageChannels) || !interaction.guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageRoles)) return interaction.reply({ content: 'I need Manage Channels and Manage Roles in this server.', ephemeral: true });
      const roleCount = source.roles.cache.filter((role) => role.id !== source.id && !role.managed && role.name !== '@everyone').size;
      const channelCount = source.channels.cache.filter(copyableChannel).size;
      if (!interaction.options.getBoolean('confirm')) return interaction.reply({ ephemeral: true, embeds: [embed('Paste preview', `Saved source: **${source.name}** (\`${source.id}\`)\nRoles to consider: **${roleCount}**\nChannels/categories to consider: **${channelCount}**\n\nNo changes were made. Run \`/paste confirm:true\` to continue.`)] });
      await interaction.deferReply({ ephemeral: true });
      const result = await copyServer(source, interaction.guild);
      await sendLog(interaction.guild, 'Server pasted', `Administrator: ${interaction.user.tag} (<@${interaction.user.id}>)\nSource: ${source.name} (${source.id})\nRoles created: ${result.rolesCreated}\nChannels created: ${result.channelsCreated}\nChannels skipped: ${result.channelsSkipped}`, 0x57f287);
      return interaction.editReply({ embeds: [embed('Server pasted', `Pasted the saved structure from **${source.name}**.\n\nRoles created: **${result.rolesCreated}**\nChannels/categories created: **${result.channelsCreated}**\nExisting channels skipped: **${result.channelsSkipped}**\n\nNo existing destination channels or roles were overwritten.`, 0x57f287)] });
    }
    if (name === 'ping') return interaction.reply(`Pong! ${client.ws.ping}ms`);
    if (name === 'log' && interaction.options.getSubcommand() === 'setup') {
      const channels = [];
      for (const key of logEventKeys) channels.push(await ensurePrivateLogChannel(interaction.guild, key));
      settings.logChannelId = channels[0]?.id || settings.logChannelId;
      saveData();
      return interaction.editReply({ content: `Created or repaired **${channels.length}** private log channels in <#${settings.logCategoryId}>.` });
    }
    if (name === 'serverinfo') return interaction.reply({ embeds: [embed(interaction.guild.name, `Members: **${interaction.guild.memberCount}**\nChannels: **${interaction.guild.channels.cache.size}**\nCreated: <t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:D>`)] });
    if (name === 'userinfo') { const user = interaction.options.getUser('user') || interaction.user; const member = await interaction.guild.members.fetch(user.id); return interaction.reply({ embeds: [embed(user.tag, `ID: \`${user.id}\`\nJoined: <t:${Math.floor(member.joinedTimestamp / 1000)}:R>\nAccount created: <t:${Math.floor(user.createdTimestamp / 1000)}:R>`).setThumbnail(user.displayAvatarURL())] }); }
    if (['ban', 'kick', 'timeout'].includes(name)) {
      const member = await interaction.guild.members.fetch(interaction.options.getUser('user').id).catch(() => null); const reason = interaction.options.getString('reason') || 'No reason provided';
      if (!member) return interaction.reply({ content: 'That member is not in this server.', ephemeral: true });
      if (!member.manageable) return interaction.reply({ content: 'I cannot moderate that member. Check my role position.', ephemeral: true });
      if (name === 'ban') await member.ban({ reason });
      if (name === 'kick') await member.kick(reason);
      if (name === 'timeout') await member.timeout(interaction.options.getInteger('minutes') * 60000, reason);
      await sendLog(interaction.guild, `${name} action`, `Moderator: ${interaction.user.tag} (<@${interaction.user.id}>)\nTarget: ${member.user.tag} (<@${member.id}>)\nAction: ${name === 'timeout' ? 'timed out' : `${name}ned`}\nReason: ${reason}`, 0xed4245);
      return interaction.reply(`Done. **${member.user.tag}** was ${name === 'timeout' ? 'timed out' : `${name}ned`}.`);
    }
    if (name === 'softban') { const member = await interaction.guild.members.fetch(interaction.options.getUser('user').id).catch(() => null); if (!member?.bannable) return interaction.reply({ content: 'I cannot soft-ban that member.', ephemeral: true }); const reason = interaction.options.getString('reason') || 'Soft-ban'; await member.ban({ reason }); await interaction.guild.members.unban(member.id, reason).catch(() => {}); await sendLog(interaction.guild, 'Soft-ban action', `Moderator: ${interaction.user.tag} (<@${interaction.user.id}>)\nTarget: ${member.user.tag} (<@${member.id}>)\nAction: soft-banned\nReason: ${reason}`, 0xed4245); return interaction.reply(`**${member.user.tag}** was soft-banned.`); }
    if (name === 'unmute') { const member = await interaction.guild.members.fetch(interaction.options.getUser('user').id); const reason = interaction.options.getString('reason') || 'Timeout removed'; await member.timeout(null, reason); await sendLog(interaction.guild, 'Timeout removed', `Moderator: ${interaction.user.tag} (<@${interaction.user.id}>)\nTarget: ${member.user.tag} (<@${member.id}>)\nAction: timeout removed\nReason: ${reason}`, 0x57f287); return interaction.reply(`**${member.user.tag}** is no longer timed out.`); }
    if (name === 'lockdown') { const enabled = interaction.options.getBoolean('enabled'); const channels = interaction.guild.channels.cache.filter((channel) => channel.isTextBased() && channel.manageable); await Promise.all(channels.map((channel) => channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: enabled ? false : null }).catch(() => {}))); await sendLog(interaction.guild, enabled ? 'Server lockdown enabled' : 'Server lockdown disabled', `${interaction.user.tag} changed the server lockdown state.`); return interaction.reply(`Server lockdown **${enabled ? 'enabled' : 'disabled'}** for ${channels.size} channels.`); }
    if (name === 'warn') { const user = interaction.options.getUser('user'); const reason = interaction.options.getString('reason'); settings.warnings[user.id] ??= []; settings.warnings[user.id].push({ reason, moderator: interaction.user.tag, at: Date.now() }); saveData(); await user.send(`You were warned in ${interaction.guild.name}: ${reason}`).catch(() => {}); await sendLog(interaction.guild, 'Member warned', `${user.tag} was warned by ${interaction.user.tag}: ${reason}`, 0xfee75c); return interaction.reply(`**${user.tag}** has been warned.`); }
    if (name === 'warnings') { const user = interaction.options.getUser('user') || interaction.user; const warnings = settings.warnings[user.id] || []; return interaction.reply({ embeds: [embed(`${user.tag}'s warnings`, warnings.length ? warnings.map((w, i) => `**${i + 1}.** ${w.reason} - ${w.moderator}`).join('\n') : 'No warnings found.')] }); }
    if (name === 'clear' || name === 'purge') { const messages = await interaction.channel.bulkDelete(interaction.options.getInteger('amount'), true); await sendLog(interaction.guild, 'Messages purged', `${interaction.user.tag} deleted ${messages.size} messages in ${interaction.channel}.`); return interaction.reply({ content: `Deleted ${messages.size} messages.`, ephemeral: true }); }
    if (name === 'unban') { const userId = interaction.options.getString('user_id').replace(/[^0-9]/g, ''); await interaction.guild.members.unban(userId, interaction.options.getString('reason') || 'Unban command'); return interaction.reply(`User **${userId}** was unbanned.`); }
    if (name === 'nickname') { const member = await interaction.guild.members.fetch(interaction.options.getUser('user').id); await member.setNickname(interaction.options.getString('nickname') || null); return interaction.reply(`Nickname updated for **${member.user.tag}**.`); }
    if (name === 'quarantine') { const role = settings.quarantineRoleId ? interaction.guild.roles.cache.get(settings.quarantineRoleId) : null; const member = await interaction.guild.members.fetch(interaction.options.getUser('user').id); if (!role) return interaction.reply({ content: 'Configure a quarantine role in the dashboard first.', ephemeral: true }); if (role.position >= interaction.guild.members.me.roles.highest.position) return interaction.reply({ content: 'My role must be above the quarantine role.', ephemeral: true }); await member.roles.add(role, interaction.options.getString('reason') || 'Quarantine command'); await sendLog(interaction.guild, 'Quarantine action', `${member.user.tag} was quarantined by ${interaction.user.tag}.`, 0xed4245); return interaction.reply(`**${member.user.tag}** was quarantined.`); }
    if (['lock', 'unlock'].includes(name)) { const channel = interaction.options.getChannel('channel') || interaction.channel; await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: name === 'unlock' ? null : false }); return interaction.reply(`🔒 ${channel} is now **${name === 'lock' ? 'locked' : 'unlocked'}**.`); }
    if (name === 'slowmode') { const channel = interaction.options.getChannel('channel') || interaction.channel; await channel.setRateLimitPerUser(interaction.options.getInteger('seconds')); return interaction.reply(`Slowmode for ${channel} is now **${interaction.options.getInteger('seconds')} seconds**.`); }
    if (name === 'role') { const member = await interaction.guild.members.fetch(interaction.options.getUser('user').id); const role = interaction.options.getRole('role'); if (role.position >= interaction.guild.members.me.roles.highest.position) return interaction.reply({ content: 'That role is higher than my highest role.', ephemeral: true }); const action = interaction.options.getString('action'); if (action === 'add') await member.roles.add(role); else await member.roles.remove(role); return interaction.reply(`Role **${role.name}** ${action === 'add' ? 'added to' : 'removed from'} **${member.user.tag}**.`); }
    if (name === 'say') { const channel = interaction.options.getChannel('channel') || interaction.channel; await channel.send(interaction.options.getString('message')); return interaction.reply({ content: `Message sent in ${channel}.`, ephemeral: true }); }
    if (name === 'announce') { const channel = interaction.options.getChannel('channel') || interaction.channel; await channel.send({ embeds: [embed(interaction.options.getString('title'), interaction.options.getString('message'), 0x57f287)] }); return interaction.reply({ content: `Announcement posted in ${channel}.`, ephemeral: true }); }
    if (name === 'avatar') { const user = interaction.options.getUser('user') || interaction.user; return interaction.reply({ embeds: [embed(`${user.username}'s avatar`, `[Open full size](${user.displayAvatarURL({ size: 4096 })})`).setImage(user.displayAvatarURL({ size: 4096 }))] }); }
    if (name === 'channelinfo') { const channel = interaction.options.getChannel('channel') || interaction.channel; return interaction.reply({ embeds: [embed(`#${channel.name}`, `ID: \`${channel.id}\`\nType: **${channel.type}**\nCreated: <t:${Math.floor(channel.createdTimestamp / 1000)}:R>`)] }); }
    if (name === 'roleinfo') { const role = interaction.options.getRole('role'); return interaction.reply({ embeds: [embed(role.name, `ID: \`${role.id}\`\nMembers: **${role.members.size}**\nPosition: **${role.position}**\nMentionable: **${role.mentionable ? 'yes' : 'no'}**`)] }); }
    if (name === 'poll') { const message = await interaction.channel.send({ embeds: [embed('Poll', interaction.options.getString('question'), 0x5865f2)] }); await message.react('✅'); await message.react('❌'); return interaction.reply({ content: 'Poll created.', ephemeral: true }); }
    if (name === 'remind') { const minutes = interaction.options.getInteger('minutes'); const text = interaction.options.getString('message'); await interaction.reply(`Reminder set for **${minutes} minutes**.`); setTimeout(() => interaction.user.send(`Reminder from ${interaction.guild.name}: ${text}`).catch(() => {}), minutes * 60000); }
    if (name === 'rules') { const channel = settings.rulesChannelId ? interaction.guild.channels.cache.get(settings.rulesChannelId) : null; if (!channel) return interaction.reply({ content: 'Rules have not been configured yet. Ask an administrator to run `/setup rules`.', ephemeral: true }); return interaction.reply({ embeds: [embed('Server rules', settings.rulesText, 0xfee75c)] }); }
    if (name === 'security') { const security = settings.security; return interaction.reply({ embeds: [embed('Security status', `Anti-spam: **${security.antiSpam ? 'ON' : 'OFF'}**\nAnti-invite: **${security.antiInvite ? 'ON' : 'OFF'}**\nAnti-caps: **${security.antiCaps ? 'ON' : 'OFF'}**\nAnti-raid: **${security.antiRaid ? 'ON' : 'OFF'}**\nBlacklisted users: **${settings.blacklist.length}**`)] }); }
    if (name === 'blacklist') { const sub = interaction.options.getSubcommand(); const user = interaction.options.getUser('user'); if (sub === 'add') { if (!settings.blacklist.includes(user.id)) settings.blacklist.push(user.id); saveData(); await interaction.guild.members.ban(user.id, { reason: `Blacklisted by ${interaction.user.tag}` }).catch(() => {}); return interaction.reply(`**${user.tag}** was added to the blacklist.`); } if (sub === 'remove') { settings.blacklist = settings.blacklist.filter((id) => id !== user.id); saveData(); return interaction.reply(`**${user.tag}** was removed from the blacklist.`); } return interaction.reply({ embeds: [embed('Blacklisted users', settings.blacklist.length ? settings.blacklist.map((id) => `<@${id}>`).join('\n') : 'No users are blacklisted.')] }); }
    if (['level', 'profile', 'rank'].includes(name)) { const user = interaction.options.getUser('user') || interaction.user; const record = settings.xp[user.id] || { xp: 0, level: 0 }; const rank = getXpRank(settings, user.id); return interaction.reply({ embeds: [embed(`${user.username}'s profile`, `Level: **${record.level}**\nXP: **${record.xp}**\nRank: **${rank ? `#${rank}` : 'Unranked'}**\nReputation: **${settings.rep[user.id] || 0}**\nProgress: **${record.xp % 100}/100**`).setThumbnail(user.displayAvatarURL())] }); }
    if (['leaderboard', 'top'].includes(name)) { const rows = Object.entries(settings.xp).sort(([, a], [, b]) => b.xp - a.xp).slice(0, 10); return interaction.reply({ embeds: [embed('XP leaderboard', rows.length ? rows.map(([id, record], i) => `**${i + 1}.** <@${id}> - level ${record.level}, ${record.xp} XP`).join('\n') : 'No XP recorded yet.')] }); }
    if (name === 'setxp' || name === 'setlevel') { const user = interaction.options.getUser('user'); const value = interaction.options.getInteger(name === 'setxp' ? 'amount' : 'level'); settings.xp[user.id] ??= { xp: 0, level: 0 }; if (name === 'setxp') { settings.xp[user.id].xp = value; settings.xp[user.id].level = Math.floor(value / 100); } else { settings.xp[user.id].level = value; settings.xp[user.id].xp = value * 100; } saveData(); return interaction.reply(`Updated **${user.tag}** to level **${settings.xp[user.id].level}** with **${settings.xp[user.id].xp} XP**.`); }
    if (name === 'roll') { const sides = interaction.options.getInteger('sides') || 6; return interaction.reply(`🎲 **${Math.floor(Math.random() * sides) + 1}** (1-${sides})`); }
    if (name === 'rep') { const user = interaction.options.getUser('user'); if (user.id === interaction.user.id) return interaction.reply({ content: 'You cannot give reputation to yourself.', ephemeral: true }); settings.rep[user.id] = (settings.rep[user.id] || 0) + 1; saveData(); return interaction.reply(`⭐ ${user} now has **${settings.rep[user.id]}** reputation.`); }
    if (name === 'selfrole') { const role = interaction.options.getRole('role'); if (!settings.selfAssignableRoleIds.includes(role.id)) return interaction.reply({ content: 'That role is not enabled for self-assignment. An administrator can add it in the dashboard.', ephemeral: true }); if (role.position >= interaction.guild.members.me.roles.highest.position) return interaction.reply({ content: 'That role is above my highest role.', ephemeral: true }); const hasRole = interaction.member.roles.cache.has(role.id); await interaction.member.roles[hasRole ? 'remove' : 'add'](role); return interaction.reply(`${hasRole ? 'Removed' : 'Added'} **${role.name}** ${hasRole ? 'from' : 'to'} your profile.`); }
    if (name === 'setup') { const sub = interaction.options.getSubcommand(); if (sub === 'all') { const result = await createServerSetup(interaction.guild); const failureText = result.logFailures.length ? `\n\nFailed log channels:\n${result.logFailures.map((failure) => `• ${failure}`).join('\n')}` : ''; return interaction.editReply(`Complete server setup finished.\nLog category: <#${result.logCategoryId}>\nLog channels created/reused: **${result.logChannels}/${logEventKeys.length}**\nRules: <#${result.rulesChannelId}>\nWelcome: <#${result.welcomeChannelId}>\nTicket category: <#${result.ticketCategoryId}>${failureText}`); } if (sub === 'welcome') settings.welcomeChannelId = interaction.options.getChannel('channel').id; if (sub === 'logs') { const event = interaction.options.getString('event'); const keys = event === 'all' ? logEventKeys : [event]; for (const key of keys) await ensurePrivateLogChannel(interaction.guild, key); settings.logChannelId = settings.logChannels[keys[0]] || settings.logChannelId; } if (sub === 'rules') { settings.rulesChannelId = interaction.options.getChannel('channel').id; settings.rulesText = interaction.options.getString('text'); } if (sub === 'ticket') await createTicketSetup(interaction.guild); if (sub === 'security') { settings.security.antiSpam = interaction.options.getBoolean('spam'); settings.security.antiInvite = interaction.options.getBoolean('invites'); settings.security.antiCaps = interaction.options.getBoolean('caps'); settings.security.antiRaid = interaction.options.getBoolean('raid'); } if (sub === 'prefix') { const value = interaction.options.getString('value').trim(); if (/\s/.test(value)) return interaction.editReply({ content: 'The prefix cannot contain spaces.' }); settings.prefix = value; } if (sub === 'automod') settings.automod = interaction.options.getBoolean('enabled'); saveData(); return interaction.editReply(sub === 'logs' ? `Private log channels created for **${interaction.options.getString('event')}** inside the **Server Logs** category.` : `Updated **${sub}** settings. Text commands now use **${settings.prefix}**.`); }
    if (name === 'ticket') { const channel = await createTicketChannel(interaction.guild, interaction.user, settings); await sendLog(interaction.guild, 'Ticket opened', `${interaction.user.tag} opened ${channel}.`); return interaction.reply({ content: `Your private ticket is ready: ${channel}`, ephemeral: true }); }
  } catch (error) { if (error?.code === 10062 || error?.rawError?.code === 10062) return; console.error(error); const response = { content: 'Something went wrong while running that command.', ephemeral: true }; try { if (interaction.deferred) await interaction.editReply(response); else if (interaction.replied) await interaction.followUp(response); else await interaction.reply(response); } catch (replyError) { if (replyError?.code !== 10062) console.error('Could not respond to interaction:', replyError); } }
});

startDashboard({ client, getGuildData, saveData, createTicketSetup, createServerSetup, ensurePrivateLogChannel });
await registerCommands();
await client.login(process.env.DISCORD_TOKEN);
