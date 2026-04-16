import fs from "node:fs";
import path from "node:path";

const reportsDir = path.join(process.cwd(), "reports");
const masterReportPath = path.join(reportsDir, "MASTER_REPORT.md");

function generateReport() {
    console.log("📊 Generating Master Security & Quality Report...");
    
    let reportContent = `# 🧭 DOMPET KITA - MASTER AUDIT REPORT\n\n`;
    reportContent += `Generated at: ${new Date().toISOString()}\n\n`;
    
    const files = fs.readdirSync(reportsDir).filter(f => f !== "MASTER_REPORT.md");
    
    if (files.length === 0) {
        reportContent += `> [!WARNING]\n> No detailed scan results found. Please run \`npm run scan\` first.\n`;
    } else {
        files.forEach(file => {
            const filePath = path.join(reportsDir, file);
            const content = fs.readFileSync(filePath, "utf8");
            const title = file.replace(".txt", "").replace(".json", "").toUpperCase().replace(/-/g, " ");
            
            reportContent += `## 📄 ${title}\n\n`;
            reportContent += "```\n" + content + "\n```\n\n";
        });
    }

    fs.writeFileSync(masterReportPath, reportContent);
    console.log(`✅ Master report generated at: ${masterReportPath}`);
}

generateReport();
