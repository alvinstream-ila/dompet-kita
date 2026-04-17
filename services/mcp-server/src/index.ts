import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";

const execPromise = promisify(exec);
const ARTISAN_PATH = "php apps/backend/artisan";

/**
 * 💎 Dompet Kita MCP Server (v7.1 Sentient)
 * Fixed for Type Alignment and Monorepo Build Stability.
 */
const server = new McpServer({
  name: "dompet-kita-mcp",
  version: "4.0.0",
});

// --- HELPER: Artisan Command Runner ---
// Return type strictly matching McpServer's tool callback expectations.
const runArtisan = async (command: string): Promise<{ content: { type: "text"; text: string }[] }> => {
  try {
    const { stdout } = await execPromise(`${ARTISAN_PATH} ${command}`);
    return { content: [{ type: "text", text: stdout }] };
  } catch (error) {
    // Note: If McpServer doesn't support top-level isError in the tool callback, 
    // we communicate error status through the text content.
    return {
      content: [{ type: "text", text: `CLI Error: ${String(error)}` }],
    };
  }
};

// --- TOOL REGISTRATIONS ---

server.tool(
  "budget_guard",
  "Monitor and alert on monthly budget limits",
  {
    user: z.enum(["Alvin", "Ila"]),
    limit: z.number(),
  },
  async ({ user, limit }) => runArtisan(`app:budget-check "${user}" ${limit}`)
);

server.tool(
  "loan_tracker",
  "Track lending activities for Ila's business",
  {
    action: z.enum(["record", "list", "mark_paid"]),
    debtor: z.string().optional(),
    amount: z.number().optional(),
    id: z.string().optional(),
  },
  async ({ action, debtor, amount, id }) => {
    let flags = "";
    if (debtor) flags += ` --debtor="${debtor}"`;
    if (amount) flags += ` --amount=${amount}`;
    if (id) flags += ` --id="${id}"`;
    return runArtisan(`app:loan-manage ${action}${flags}`);
  }
);

server.tool(
  "asset_manage",
  "Manage financial assets and total wealth tracking",
  {
    action: z.enum(["list", "add", "update"]),
    name: z.string().optional(),
    value: z.number().optional(),
    id: z.string().optional(),
  },
  async ({ action, name, value, id }) => {
    let flags = "";
    if (name) flags += ` --name="${name}"`;
    if (value) flags += ` --value=${value}`;
    if (id) flags += ` --id="${id}"`;
    return runArtisan(`app:asset-manage ${action}${flags}`);
  }
);

server.tool(
  "goal_check", 
  "Check progress on financial savings goals",
  {}, 
  async () => runArtisan("app:goal-check")
);

server.tool(
  "system_status",
  "Get a comprehensive financial snapshot dashboard",
  {},
  async () => runArtisan("system:status")
);

server.tool(
  "security_scan", 
  "Run security and vulnerability audits", 
  {}, 
  async () => runArtisan("security:scan")
);

server.tool(
  "cloud_sync_check",
  "Verify connectivity to all external services (Supabase, Storj, Gemini)",
  {},
  async () => runArtisan("cloud:sync")
);

server.tool(
  "storage_assistant",
  "Manage files in Storj Cloud Object Storage",
  { action: z.enum(["list"]) },
  async ({ action }) => runArtisan(`app:storage-manage ${action}`)
);

server.tool(
  "penpot_assistant",
  "Manage and list designs from Penpot App",
  {
    action: z.enum(["list-projects", "get-project"]),
    projectId: z.string().optional(),
  },
  async ({ action, projectId }) => {
    const flags = projectId ? ` --projectId="${projectId}"` : "";
    return runArtisan(`app:penpot-manage ${action}${flags}`);
  }
);

server.tool(
  "maintenance_tool",
  "Run system maintenance and audit suite",
  { script: z.string().optional() },
  async ({ script }) => {
    const args = script ? ` "${script}"` : "";
    return runArtisan(`maintenance:verify${args}`);
  }
);

server.tool(
  "security_gate",
  "Run security quality gate before commit/deploy",
  { min_score: z.number().optional() },
  async ({ min_score }) => {
    const flags = min_score ? ` --min-score=${min_score}` : "";
    return runArtisan(`security:gate${flags}`);
  }
);

server.tool(
  "honeypot_radar",
  "Display visual bot attack radar from Honeypot logs",
  {},
  async () => runArtisan("honeypot:audit")
);

server.tool(
  "cfo_forecast",
  "Project wealth trajectory for Alvin & Ila",
  { months: z.number().optional() },
  async ({ months }) => {
    const flags = months ? ` --months=${months}` : "";
    return runArtisan(`cfo:forecast${flags}`);
  }
);

server.tool(
  "maintenance_repair",
  "AI Autopilot: detect and auto-repair code quality issues",
  { dry_run: z.boolean().optional() },
  async ({ dry_run }) => {
    const flags = dry_run ? ` --dry-run` : "";
    return runArtisan(`maintenance:repair${flags}`);
  }
);

server.tool(
  "watchdog_audit",
  "View the audit trail of user actions",
  {
    days: z.number().optional(),
    user_id: z.string().optional(),
  },
  async ({ days, user_id }) => {
    let flags = "";
    if (days) flags += ` --days=${days}`;
    if (user_id) flags += ` --user="${user_id}"`;
    return runArtisan(`activity:view${flags}`);
  }
);

server.tool(
  "trigger_backup",
  "Trigger manual cloud backup to Storj",
  {},
  async () => runArtisan("cloud:backup")
);

server.tool(
  "design_vibe_check",
  "Verify frontend components against design tokens and glassmorphism standards",
  { path: z.string().optional() },
  async ({ path }) => {
    const flags = path ? ` -- "${path}"` : "";
    try {
      const { stdout } = await execPromise(`npm run design:audit --prefix frontend${flags}`);
      return { content: [{ type: "text", text: stdout }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Audit Error: ${String(error)}` }],
      };
    }
  }
);

server.tool(
  "tax_assistant",
  "AI Tax Engine: Estimate PPh 21 income tax",
  {},
  async () => runArtisan("ai:tax-estimate")
);

server.tool(
  "wealth_intelligence",
  "Multi-currency, inflation-adjusted, 12-month financial foresight",
  {},
  async () => runArtisan("ai:wealth-forecast")
);

server.tool(
  "legacy_audit",
  "Generate secure digital legacy snapshots for heirs",
  {},
  async () => runArtisan("ai:legacy-report")
);

// --- START SERVER ---
const transport = new StdioServerTransport();
await server.connect(transport);
