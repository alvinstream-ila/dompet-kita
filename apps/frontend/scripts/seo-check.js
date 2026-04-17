import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INDEX_HTML = path.join(__dirname, "../index.html");

console.log("⚡ DOMPET KITA - SEO VITALITY CHECK");
console.log("===================================");

if (fs.existsSync(INDEX_HTML)) {
	const content = fs.readFileSync(INDEX_HTML, "utf8");

	if (content.includes("<title>")) {
		console.log("✅ Title Tag: Present");
	} else {
		console.warn("❌ Title Tag: MISSING (Critical for SEO)");
	}

	if (content.includes('name="description"')) {
		console.log("✅ Meta Description: Present");
	} else {
		console.warn("❌ Meta Description: MISSING (Critical for SEO)");
	}
}

console.log("\n✅ SEO Vitality Check Complete.");
