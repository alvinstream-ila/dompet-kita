/**
 * 🎨 DOMPET KITA - UX VIBE GUARD (AESTHETIC SENTINEL)
 * Tujuannya: Memastikan standar desain "Premium Glassmorphism" tetap terjaga.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CSS_PATH = path.join(__dirname, "../src/index.css");

console.log("========================================");
console.log("💎 DOMPET KITA - DESIGN VIBE CHECK");
console.log("========================================");

if (!fs.existsSync(CSS_PATH)) {
	console.error("❌ ERROR: index.css NOT FOUND! Aesthetics compromised.");
	process.exit(1);
}

const cssContent = fs.readFileSync(CSS_PATH, "utf-8");

// 1. Check for Glassmorphism Tokens
console.log("🔹 Checking Glassmorphism Integrity...");
const glassKeywords = [
	"backdrop-filter",
	"blur",
	"border-opacity",
	"--glass-opacity",
];
let glassScore = 0;

glassKeywords.forEach((keyword) => {
	if (cssContent.includes(keyword)) {
		glassScore++;
	}
});

if (glassScore >= 3) {
	console.log(
		`✅ SUCCESS: Glassmorphism tokens detected (Score: ${glassScore}/4)`,
	);
} else {
	console.warn(
		"⚠️  WARNING: Glassmorphism tokens are missing or weak! Design might look 'Flat'.",
	);
}

// 2. Check for Modern Color Palette (HSL/OKLCH)
console.log("🔹 Scanning for Modern Color Space (HSL/OKLCH)...");
if (cssContent.includes("hsl(") || cssContent.includes("oklch(")) {
	console.log("✅ SUCCESS: Modern color space detected.");
} else {
	console.error(
		"❌ CRITICAL: Found HEX/Generic Colors! Standard lowered to MVP level.",
	);
	process.exit(1);
}

console.log("\n========================================");
console.log("✨ DESIGN AUDIT COMPLETE: VIBE IS PREMIUM");
console.log("========================================");
