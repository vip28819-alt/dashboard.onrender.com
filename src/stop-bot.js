import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pidFile = path.join(root, 'data', 'bot.pid');

if (!fs.existsSync(pidFile)) {
  console.log('No running bot process was found.');
  process.exit(0);
}

const pid = Number(fs.readFileSync(pidFile, 'utf8').trim());
if (!Number.isInteger(pid) || pid <= 0) {
  fs.rmSync(pidFile, { force: true });
  throw new Error('The bot PID file is invalid.');
}

try {
  process.kill(pid, 'SIGTERM');
  console.log(`Stop signal sent to bot process ${pid}.`);
} catch (error) {
  if (error.code === 'ESRCH') {
    fs.rmSync(pidFile, { force: true });
    console.log('The bot process was already stopped.');
  } else {
    throw error;
  }
}
