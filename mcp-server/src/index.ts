import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from absolute path
dotenv.config({ path: path.join(__dirname, "../.env") });

const execPromise = promisify(exec);

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
const penpotToken = process.env.PENPOT_TOKEN || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Storj Configuration (S3 Compatible)
const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: "https://gateway.storjshare.io",
  credentials: {
    accessKeyId: process.env.STORJ_ACCESS_KEY || "",
    secretAccessKey: process.env.STORJ_SECRET_KEY || "",
  },
  forcePathStyle: true,
});

const server = new Server(
  {
    name: "dompet-kita-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_financial_status",
        description: "Get summary of shared financial status for Alvin & Ila from Supabase",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "budget_guard",
        description: "Monitor and alert on monthly budget limits for Alvin & Ila",
        inputSchema: {
          type: "object",
          properties: {
            user: { type: "string", enum: ["Alvin", "Ila"], description: "Which user's budget to check" },
            limit: { type: "number", description: "The maximum budget limit" }
          },
          required: ["user", "limit"]
        },
      },
      {
        name: "git_assistant",
        description: "Manage Git operations like commit, push, and status",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["status", "commit_and_push", "pull", "log"], description: "Action to perform" },
            message: { type: "string", description: "Commit message (required for commit_and_push)" }
          },
          required: ["action"]
        },
      },
      {
        name: "browse_the_web",
        description: "Search the web or fetch content from a URL",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query or URL" },
            mode: { type: "string", enum: ["search", "fetch"], description: "Whether to search or fetch a specific URL" }
          },
          required: ["query", "mode"]
        },
      },
      {
        name: "loan_tracker",
        description: "Track lending activities for Ila's business",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["record", "list", "mark_paid"], description: "Action to perform" },
            debtor: { type: "string", description: "Name of the person borrowing" },
            amount: { type: "number", description: "Amount lent" },
            id: { type: "string", description: "ID of the loan for updates" }
          },
          required: ["action"]
        },
      },
      {
        name: "holiday_planner",
        description: "Plan shared trips and vacations",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["create", "list", "add_expense"], description: "Action to perform" },
            destination: { type: "string", description: "Trip destination" },
            budget: { type: "number", description: "Projected budget" }
          },
          required: ["action"]
        },
      },
      {
        name: "report_generator",
        description: "Generate monthly financial summaries/reports",
        inputSchema: {
          type: "object",
          properties: {
            month: { type: "string", description: "Month to report (e.g., '2024-03')" }
          },
          required: ["month"]
        },
      },
      {
        name: "storj_assistant",
        description: "Manage files in Storj Cloud Object Storage",
        inputSchema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["list", "stat"], description: "Action to perform" },
            bucket: { type: "string", description: "Bucket name" }
          },
          required: ["action", "bucket"]
        },
      },
      {
        name: "penpot_list_projects",
        description: "List all accessible Penpot projects",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "penpot_get_project_files",
        description: "List all files in a specific Penpot project",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "The ID of the project" },
          },
          required: ["projectId"],
        },
      }
    ],
  };
});

/**
 * Handle tool calls.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "get_financial_status") {
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const totals = transactions.reduce((acc, curr) => {
        if (curr.type === 'income') acc.income += curr.amount;
        else acc.expense += curr.amount;
        return acc;
      }, { income: 0, expense: 0 });

      const balance = totals.income - totals.expense;
      const recent = transactions.slice(0, 3).map(t => `- ${t.description}: Rp ${t.amount.toLocaleString('id-ID')} (${t.type})`).join('\n');

      return {
        content: [{ 
          type: "text", 
          text: `### 📊 Real-time Financial Status\n\n**Total Saldo:** Rp ${balance.toLocaleString('id-ID')}\n**Total Pemasukan:** Rp ${totals.income.toLocaleString('id-ID')}\n**Total Pengeluaran:** Rp ${totals.expense.toLocaleString('id-ID')}\n\n**Transaksi Terakhir:**\n${recent || 'Belum ada transaksi.'}` 
        }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error fetching data: ${message}` }], isError: true };
    }
  }

  if (name === "budget_guard") {
    const { user, limit } = args as { user: string; limit: number };
    
    try {
      // For now, we calculate based on all expenses in the DB to simplify
      const { data: expenses, error } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'expense');

      if (error) throw error;

      const current_spending = expenses.reduce((sum, e) => sum + e.amount, 0);
      const percentage = (current_spending / limit) * 100;
      
      let message = `### 🛡️ Budget Guard for ${user}\n\n**Pengeluaran Saat Ini:** Rp ${current_spending.toLocaleString('id-ID')}\n**Limit:** Rp ${limit.toLocaleString('id-ID')}\n**Status:** ${percentage.toFixed(1)}% terpakai.`;
      
      if (percentage >= 100) message += "\n\n🚨 **CRITICAL: Budget terlampaui!** Sebaiknya istirahat belanja dulu ya.";
      else if (percentage >= 90) message += "\n\n⚠️ **WARNING: Sudah mendekati limit!** Hati-hati ya.";
      else message += "\n\n✅ Aman! Silakan lanjutkan rencana produktif kalian.";

      return { content: [{ type: "text", text: message }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error calculating budget: ${message}` }], isError: true };
    }
  }

  if (name === "git_assistant") {
    const { action, message } = args as { action: string; message?: string };
    try {
      if (action === "status" || action === "log") {
        const { stdout } = await execPromise(`git ${action}`);
        return { content: [{ type: "text", text: stdout || `Empty output for 'git ${action}'` }] };
      }
      if (action === "commit_and_push") {
        if (!message) throw new Error("Commit message is required");
        await execPromise("git add .");
        await execPromise(`git commit -m "${message}"`);
        await execPromise("git push origin main");
        return { content: [{ type: "text", text: `Success! Code committed and pushed with message: "${message}"` }] };
      }
      if (action === "pull") {
        const { stdout } = await execPromise("git pull origin main");
        return { content: [{ type: "text", text: stdout }] };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Git Error: ${message}` }], isError: true };
    }
  }

  if (name === "browse_the_web") {
    const { query, mode } = args as { query: string; mode: string };
    return { content: [{ type: "text", text: `Web Search triggered: ${mode} "${query}". (Implementation via MCP-Bridge)` }] };
  }

  if (name === "loan_tracker") {
    const { action, debtor, amount, id } = args as { action: string; debtor?: string; amount?: number; id?: string };
    try {
      if (action === "record") {
        if (!debtor || !amount) throw new Error("Debtor and amount required");
        const { error } = await supabase.from('loans').insert([{ debtor, amount, status: 'pending' }]);
        if (error) throw error;
        return { content: [{ type: "text", text: `Loan recorded for ${debtor}: Rp ${amount.toLocaleString('id-ID')}` }] };
      }
      if (action === "list") {
        const { data: loans, error } = await supabase.from('loans').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        const list = loans.map(l => `- [${l.id}] ${l.debtor}: Rp ${l.amount.toLocaleString('id-ID')} (${l.status})`).join('\n');
        return { content: [{ type: "text", text: `### 🏦 Active Loans\n\n${list || 'No loans found.'}` }] };
      }
      if (action === "mark_paid") {
        if (!id) throw new Error("Loan ID required");
        const { error } = await supabase.from('loans').update({ status: 'paid' }).eq('id', id);
        if (error) throw error;
        return { content: [{ type: "text", text: `Loan ${id} marked as paid.` }] };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Loan Tracker Error: ${message}` }], isError: true };
    }
  }

  if (name === "holiday_planner") {
    const { action, destination, budget } = args as { action: string; destination?: string; budget?: number };
    try {
      if (action === "create") {
        if (!destination || !budget) throw new Error("Destination and budget required");
        const { error } = await supabase.from('holidays').insert([{ destination, budget, spending: 0 }]);
        if (error) throw error;
        return { content: [{ type: "text", text: `Holiday planned: ${destination} with budget Rp ${budget.toLocaleString('id-ID')}` }] };
      }
      if (action === "list") {
        const { data: trips, error } = await supabase.from('holidays').select('*');
        if (error) throw error;
        const list = trips.map(t => `- ${t.destination}: Rp ${t.spending.toLocaleString('id-ID')} / Rp ${t.budget.toLocaleString('id-ID')}`).join('\n');
        return { content: [{ type: "text", text: `### 🏝️ Holiday Plans\n\n${list || 'No trips planned yet.'}` }] };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Holiday Planner Error: ${message}` }], isError: true };
    }
  }

  if (name === "report_generator") {
    const { month } = args as { month: string };
    try {
      const { data: txs, error } = await supabase.from('transactions').select('*').gte('date', `${month}-01`).lte('date', `${month}-31`);
      if (error) throw error;
      const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const report = `### 📑 Monthly Report: ${month}\n\n**Total Income:** Rp ${income.toLocaleString('id-ID')}\n**Total Expense:** Rp ${expense.toLocaleString('id-ID')}\n**Net:** Rp ${(income - expense).toLocaleString('id-ID')}\n\n**Top Spending:**\n${txs.filter(t => t.type === 'expense').sort((a, b) => b.amount - a.amount).slice(0, 5).map(t => `- ${t.description}: Rp ${t.amount.toLocaleString('id-ID')}`).join('\n')}`;
      return { content: [{ type: "text", text: report }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Report Error: ${message}` }], isError: true };
    }
  }

  if (name === "storj_assistant") {
    const { action, bucket } = args as { action: string; bucket: string };
    try {
      if (action === "list") {
        const command = new ListObjectsV2Command({ Bucket: bucket });
        const data = await s3Client.send(command);
        const files = data.Contents?.map(f => `- ${f.Key} (${((f.Size || 0) / 1024).toFixed(1)} KB)`).join('\n');
        return { content: [{ type: "text", text: `### 📦 Files in ${bucket}\n\n${files || 'Bucket is empty.'}` }] };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Storj Error: ${message}` }], isError: true };
    }
  }

  if (name === "penpot_list_projects") {
    try {
      const response = await fetch("https://design.penpot.app/api/rpc/command/list-projects", {
        method: "POST",
        headers: {
          "Authorization": `Token ${penpotToken}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error(`Penpot API error: ${response.statusText}`);
      const data = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Penpot Error: ${message}` }], isError: true };
    }
  }

  if (name === "penpot_get_project_files") {
    const { projectId } = args as { projectId: string };
    try {
      const response = await fetch("https://design.penpot.app/api/rpc/command/get-project", {
        method: "POST",
        headers: {
          "Authorization": `Token ${penpotToken}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ id: projectId }),
      });

      if (!response.ok) throw new Error(`Penpot API error: ${response.statusText}`);
      const data = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Penpot Error: ${message}` }], isError: true };
    }
  }

  throw new Error(`Tool not found: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
