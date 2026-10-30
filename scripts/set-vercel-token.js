import fs from 'fs';
import path from 'path';
import readline from 'readline';

const claudeFile = path.join(process.env.APPDATA, 'Claude', 'claude_desktop_config.json');
if (!fs.existsSync(claudeFile)) {
  console.error('Claude Desktop config not found at:', claudeFile);
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter/Paste your Vercel API token: ', (token) => {
  rl.close();
  const trimmed = token.trim();
  if (!trimmed || trimmed === 'YOUR_VERCEL_TOKEN') {
    console.log('No valid token entered. Operation aborted.');
    return;
  }
  try {
    const config = JSON.parse(fs.readFileSync(claudeFile, 'utf8'));
    if (!config.mcpServers.vercel) {
      config.mcpServers.vercel = {
        command: 'cmd.exe',
        args: ['/c', 'npx', '-y', 'vercel-platform-mcp-server'],
        env: {},
      };
    }
    config.mcpServers.vercel.env = config.mcpServers.vercel.env || {};
    config.mcpServers.vercel.env.VERCEL_TOKEN = trimmed;
    fs.writeFileSync(claudeFile, JSON.stringify(config, null, 2), 'utf8');
    console.log('SUCCESS: Vercel token securely configured in Claude Desktop at:');
    console.log(claudeFile);
  } catch (err) {
    console.error('Error updating configuration:', err.message);
  }
});

