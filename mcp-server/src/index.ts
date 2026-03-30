import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execPromise = promisify(exec);

/**
 * Dompet Kita MCP Server - CLI Bridge Architecture (v2.0)
 *
 * PHILOSOPHY:
 * All core logic resides in Laravel Artisan commands (CLI).
 * This MCP server is a pure bridge/translator that allows AI agents
 * to interact with the project's native CLI tools.
 */
const server = new Server(
  {
    name: "dompet-kita-mcp",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_financial_status",
        description: "Get summary of shared financial status for Alvin & Ila",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "budget_guard",
        description: "Monitor and alert on monthly budget limits",
        inputSchema: {
          type: "object",
          properties: {
            user: { type: "string", enum: ["Alvin", "Ila"] },
            limit: { type: "number" },
          },
          required: ["user", "limit"],
        },
      },
      {
        name: "loan_tracker",
        description: "Track lending activities for Ila's business",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["record", "list", "mark_paid"] },
            debtor: { type: "string" },
            amount: { type: "number" },
            id: { type: "string" },
          },
          required: ["action"],
        },
      },
      {
        name: "asset_manage",
        description: "Manage financial assets and total wealth tracking",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["list", "add", "update"] },
            name: { type: "string" },
            value: { type: "number" },
            id: { type: "string" },
          },
          required: ["action"],
        },
      },
      {
        name: "goal_check",
        description: "Check progress on financial savings goals",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "holiday_plan",
        description: "Plan and monitor shared travel and vacations",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["list", "create"] },
            dest: { type: "string" },
            budget: { type: "number" },
          },
          required: ["action"],
        },
      },
      {
        name: "system_status",
        description: "Get a comprehensive financial snapshot dashboard",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "security_scan",
        description: "Run security and vulnerability audits",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "cloud_sync_check",
        description: "Verify connectivity to all external services",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "storage_assistant",
        description: "Manage files in Storj Cloud Object Storage",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["list"] },
          },
          required: ["action"],
        },
      },
      {
        name: "penpot_assistant",
        description: "Manage and list designs from Penpot App",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["list-projects", "get-project"] },
            projectId: { type: "string" },
          },
          required: ["action"],
        },
      },
      {
        name: "maintenance_tool",
        description: "Run system maintenance and audit suite",
        inputSchema: {
          type: "object",
          properties: {
            script: { type: "string" },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const artisanPath = "php backend/artisan";

  try {
    let command = "";

    switch (name) {
      case "get_financial_status":
        command = `${artisanPath} app:financial-report`;
        break;
      case "budget_guard":
        command = `${artisanPath} app:budget-check "${args?.user}" ${args?.limit}`;
        break;
      case "loan_tracker":
        command =
          `${artisanPath} app:loan-manage ${args?.action}` +
          (args?.debtor ? ` --debtor="${args?.debtor}"` : "") +
          (args?.amount ? ` --amount=${args?.amount}` : "") +
          (args?.id ? ` --id="${args?.id}"` : "");
        break;
      case "asset_manage":
        command =
          `${artisanPath} app:asset-manage ${args?.action}` +
          (args?.name ? ` --name="${args?.name}"` : "") +
          (args?.value ? ` --value=${args?.value}` : "") +
          (args?.id ? ` --id="${args?.id}"` : "");
        break;
      case "goal_check":
        command = `${artisanPath} app:goal-check`;
        break;
      case "holiday_plan":
        command =
          `${artisanPath} app:holiday-plan ${args?.action}` +
          (args?.dest ? ` --dest="${args?.dest}"` : "") +
          (args?.budget ? ` --budget=${args?.budget}` : "");
        break;
      case "system_status":
        command = `${artisanPath} app:status`;
        break;
      case "security_scan":
        command = `${artisanPath} app:security-scan`;
        break;
      case "cloud_sync_check":
        command = `${artisanPath} app:cloud-sync`;
        break;
      case "storage_assistant":
        command = `${artisanPath} app:storage-manage ${args?.action}`;
        break;
      case "penpot_assistant":
        command =
          `${artisanPath} app:penpot-manage ${args?.action}` +
          (args?.projectId ? ` --projectId="${args?.projectId}"` : "");
        break;
      case "maintenance_tool":
        command =
          `${artisanPath} maintenance:verify` +
          (args?.script ? ` "${args.script}"` : "");
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    const { stdout } = await execPromise(command);
    return { content: [{ type: "text", text: stdout }] };
  } catch (error) {
    return {
      content: [{ type: "text", text: `CLI Error: ${String(error)}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
