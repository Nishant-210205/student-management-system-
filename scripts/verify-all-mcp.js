import { Client } from '../mcp-server/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js';
import { StdioClientTransport } from '../mcp-server/node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js';
import fs from 'fs';
import path from 'path';

async function verifyAll() {
  const configPath = path.join(process.env.APPDATA, 'Claude', 'claude_desktop_config.json');
  if (!fs.existsSync(configPath)) {
    console.error('Claude configuration not found at:', configPath);
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log('Loaded Claude Desktop configuration from:', configPath);
  console.log('Configured MCP Servers:', Object.keys(config.mcpServers).join(', '));
  console.log('------------------------------------------------------------');

  // 1. Test student-management
  console.log('\n[1/3] Testing student-management MCP server...');
  try {
    const sConf = config.mcpServers['student-management'];
    const t1 = new StdioClientTransport({
      command: sConf.command,
      args: sConf.args,
      env: { ...process.env, ...sConf.env }
    });
    const c1 = new Client({ name: 'verify-sm', version: '1.0.0' }, { capabilities: {} });
    await c1.connect(t1);
    const res = await c1.callTool({ name: 'list_students', arguments: {} });
    const students = JSON.parse(res.content[0].text);
    console.log('Result: PASS');
    console.log(`Retrieved ${students.length} students from live database:`);
    for (const s of students) {
      console.log(` - ${s.studentId}: ${s.name} (${s.department}, Semester ${s.semester})`);
    }
    await c1.close();
  } catch (err) {
    console.log('Result: FAIL -', err.message);
  }

  // 2. Test github
  console.log('\n[2/3] Testing github MCP server...');
  try {
    const gConf = config.mcpServers['github'];
    const t2 = new StdioClientTransport({
      command: gConf.command,
      args: gConf.args,
      env: { ...process.env, ...gConf.env }
    });
    const c2 = new Client({ name: 'verify-gh', version: '1.0.0' }, { capabilities: {} });
    await c2.connect(t2);
    const res = await c2.callTool({
      name: 'list_commits',
      arguments: { owner: 'co2023smniyazi', repo: 'three-tier-student-management-system', perPage: 2 }
    });
    if (res.isError) {
      console.log('Result: BLOCKED -', res.content[0].text);
    } else {
      const commits = JSON.parse(res.content[0].text);
      console.log('Result: PASS');
      console.log(`Retrieved ${commits.length} commits from GitHub repository (co2023smniyazi/three-tier-student-management-system):`);
      for (const c of commits) {
        console.log(` - ${c.sha.substring(0, 7)}: ${c.commit.message.split('\n')[0]} (by ${c.commit.author.name})`);
      }
    }
    await c2.close();
  } catch (err) {
    console.log('Result: FAIL/BLOCKED -', err.message);
  }

  // 3. Test vercel
  console.log('\n[3/3] Testing vercel MCP server...');
  try {
    const vConf = config.mcpServers['vercel'];
    const hasToken = vConf.env?.VERCEL_TOKEN && vConf.env.VERCEL_TOKEN !== 'YOUR_VERCEL_TOKEN';
    if (!hasToken) {
      console.log('Result: BLOCKED (Awaiting valid Vercel API token in configuration)');
    } else {
      const t3 = new StdioClientTransport({
        command: vConf.command,
        args: vConf.args,
        env: { ...process.env, ...vConf.env }
      });
      const c3 = new Client({ name: 'verify-vc', version: '1.0.0' }, { capabilities: {} });
      await c3.connect(t3);
      const res = await c3.callTool({ name: 'list_projects', arguments: {} });
      if (res.isError) {
        console.log('Result: BLOCKED/UNAUTHORIZED -', res.content[0].text.split('\n')[0]);
      } else {
        const projects = JSON.parse(res.content[0].text);
        console.log('Result: PASS');
        console.log(`Retrieved projects from Vercel account:`, Array.isArray(projects) ? projects.length : 'active');
      }
      await c3.close();
    }
  } catch (err) {
    console.log('Result: FAIL/BLOCKED -', err.message);
  }

  console.log('\n------------------------------------------------------------');
}

verifyAll().catch(console.error);

