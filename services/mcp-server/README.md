# 🔌 Dompet Kita - MCP Server (AI Bridge)

Custom MCP Server built with **TypeScript** to provide a secure bridge between AI Agents (like Antigravity) and the Dompet Kita local ecosystem.

## 🚀 Key Features

- **Pure Bridge Architecture**: Translates AI tool calls into direct **Artisan CLI** commands.
- **Security First**: Implements an AI Security Gate to prevent destructive operations.
- **Infrastructure Observer**: Monitors the health of Railway, Supabase, and Storj.
- **Contextual Memory**: Enhances the agent's ability to recall financial preferences.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Protocol**: Model Context Protocol (MCP) v3.0
- **Integrations**: Laravel Artisan CLI, Supabase CLI, Rclone

## 📁 Project Structure

- `src/index.ts`: The entry point where all 16+ tools are registered.
- `src/handlers/`: (Optional) Logic for complex multi-step tool interactions.
- `build/`: Compiled JavaScript output.

## 💻 Local Development

1. Navigate to `mcp-server/`.
2. Run `npm install`.
3. Build the server: `npm run build`.
4. Configure your client (Claude Desktop/Antigravity) to point to `build/index.js`.

## ⚙️ Available Tools (Summary)

| Tool | Category | Artisan Target |
|:-----|:---------|:---------------|
| `system_status` | Monitoring | `app:status` |
| `security_scan` | Security | `security:audit` |
| `cfo_forecast` | AI | `cfo:forecast` |
| `maintenance_repair` | Self-Healing | `maintenance:repair` |
| `cloud_sync_check` | DevOps | `cloud:status` |

---

_Managed by Antigravity AI - Connecting Logic to Intelligence._
