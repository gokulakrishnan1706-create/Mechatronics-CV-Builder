/**
 * generate-ai-context.js
 * Auto-generates AI_CONTEXT.md by scanning src/ directory.
 * Run: node generate-ai-context.js   (or: npm run ai-context)
 *
 * This gives any new AI assistant a compact overview of the entire project
 * so it doesn't waste tokens reading every file.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC = path.join(__dirname, 'src');
const OUTPUT = path.join(__dirname, 'AI_CONTEXT.md');

// ─── Config ────────────────────────────────────────────────────────
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.css'];
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'src_backup', 'src_temp'];

// ─── Helpers ───────────────────────────────────────────────────────

function walkDir(dir, baseDir = dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.includes(entry.name)) {
        results.push(...walkDir(fullPath, baseDir));
      }
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractFileInfo(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const lineCount = lines.length;
  const sizeKB = (Buffer.byteLength(content, 'utf-8') / 1024).toFixed(1);
  const relPath = path.relative(__dirname, filePath).replace(/\\/g, '/');

  // Extract imports
  const imports = [];
  for (const line of lines) {
    const m = line.match(/^\s*import\s+.*\s+from\s+['"]([^'"]+)['"]/);
    if (m) imports.push(m[1]);
    const m2 = line.match(/^\s*import\s+['"]([^'"]+)['"]/);
    if (m2) imports.push(m2[1]);
  }

  // Extract exports
  const exports = [];
  for (const line of lines) {
    const namedExport = line.match(/export\s+(?:const|function|class|let|var)\s+(\w+)/);
    if (namedExport) exports.push(namedExport[1]);
    if (/export\s+default/.test(line)) {
      const defName = line.match(/export\s+default\s+(?:function\s+)?(\w+)/);
      exports.push(defName ? `${defName[1]} (default)` : 'default');
    }
  }

  // Extract JSDoc @description or first comment block
  let description = '';
  const jsdocMatch = content.match(/@(?:description|file)\s+(.+)/);
  if (jsdocMatch) {
    description = jsdocMatch[1].trim();
  } else {
    // Try first block comment
    const blockMatch = content.match(/\/\*\*?\s*\n?\s*\*?\s*(.+?)(?:\n|\*\/)/);
    if (blockMatch) description = blockMatch[1].replace(/^\*\s*/, '').trim();
  }

  // Extract useState hooks
  const stateVars = [];
  for (const line of lines) {
    const stateMatch = line.match(/const\s+\[(\w+),\s*set\w+\]\s*=\s*useState/);
    if (stateMatch) stateVars.push(stateMatch[1]);
  }

  // Detect key patterns
  const usesSupabase = content.includes('supabase');
  const usesAI = content.includes('groq') || content.includes('Groq') || content.includes('GROQ')
    || content.includes('gemini') || content.includes('Gemini')
    || content.includes('openrouter') || content.includes('tailorResume');
  const usesPDF = content.includes('react-pdf') || content.includes('generatePDF') || content.includes('pdfmake');
  const usesFramerMotion = content.includes('framer-motion');

  return {
    relPath,
    lineCount,
    sizeKB,
    imports: [...new Set(imports)],
    exports: [...new Set(exports)],
    description,
    stateVars,
    flags: {
      supabase: usesSupabase,
      ai: usesAI,
      pdf: usesPDF,
      animation: usesFramerMotion,
    },
  };
}

function buildDependencyGraph(files) {
  const graph = {};
  for (const f of files) {
    const localImports = f.imports
      .filter(i => i.startsWith('.') || i.startsWith('/'))
      .map(i => {
        // Normalize: resolve relative to file's directory
        const dir = path.dirname(f.relPath);
        let resolved = path.posix.join(dir, i);
        // Try matching known files
        for (const ext of ['', '.js', '.jsx', '.ts', '.tsx']) {
          const candidate = resolved + ext;
          if (files.some(ff => ff.relPath === candidate)) return candidate;
        }
        return resolved;
      });
    graph[f.relPath] = localImports;
  }
  return graph;
}

// ─── Main ──────────────────────────────────────────────────────────

function generate() {
  const filePaths = walkDir(SRC);
  const files = filePaths.map(extractFileInfo);
  const depGraph = buildDependencyGraph(files);

  // Read package.json for deps
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));

  // Read .env for env var names (NOT values!)
  let envVarNames = [];
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envVarNames = envContent
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'))
      .map(l => l.split('=')[0]);
  }

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // ─── Build markdown ────────────────────────────────────
  let md = '';

  md += `# AI_CONTEXT.md — Mechatronics CV Builder\n`;
  md += `> Auto-generated on ${now} by \`generate-ai-context.js\`\n`;
  md += `> Run \`npm run ai-context\` to regenerate after changes.\n\n`;

  // Project overview
  md += `## Project Overview\n`;
  md += `A React + Vite CV builder for mechatronics engineers with:\n`;
  md += `- AI-powered CV tailoring (Groq/Gemini/OpenRouter)\n`;
  md += `- ATS score checking and keyword optimization\n`;
  md += `- Multiple PDF templates (Classic, Modern, Executive, Part-Time, ATS)\n`;
  md += `- Part-time/casual job CV generator with sector presets\n`;
  md += `- Supabase auth, CV save/load, version control\n`;
  md += `- Gamification (XP, achievements, levels)\n\n`;

  // Tech stack
  md += `## Tech Stack\n`;
  md += `| Category | Technologies |\n`;
  md += `|----------|-------------|\n`;
  md += `| Framework | React ${pkg.dependencies?.react || ''}, Vite ${pkg.devDependencies?.vite || ''} |\n`;
  md += `| Styling | TailwindCSS ${pkg.devDependencies?.tailwindcss || ''} |\n`;
  md += `| Animation | Framer Motion ${pkg.dependencies?.['framer-motion'] || ''} |\n`;
  md += `| PDF | @react-pdf/renderer, jsPDF, pdfmake |\n`;
  md += `| AI | Groq (llama-4-scout), Gemini, OpenRouter |\n`;
  md += `| Backend | Supabase (auth + database) |\n`;
  md += `| Icons | lucide-react |\n\n`;

  // Environment variables
  md += `## Environment Variables (.env)\n`;
  md += envVarNames.map(v => `- \`${v}\``).join('\n') + '\n\n';

  // NPM scripts
  md += `## Commands\n`;
  md += `| Command | Purpose |\n`;
  md += `|---------|--------|\n`;
  for (const [name, cmd] of Object.entries(pkg.scripts || {})) {
    md += `| \`npm run ${name}\` | \`${cmd}\` |\n`;
  }
  md += '\n';

  // File map
  md += `## File Map\n\n`;

  // Group by directory
  const groups = {};
  for (const f of files) {
    const parts = f.relPath.split('/');
    const dir = parts.length > 2 ? parts.slice(0, 2).join('/') : parts[0];
    if (!groups[dir]) groups[dir] = [];
    groups[dir].push(f);
  }

  for (const [dir, dirFiles] of Object.entries(groups)) {
    md += `### ${dir}\n`;
    md += `| File | Lines | Size | Exports | Flags |\n`;
    md += `|------|-------|------|---------|-------|\n`;
    for (const f of dirFiles.sort((a, b) => a.relPath.localeCompare(b.relPath))) {
      const flags = Object.entries(f.flags)
        .filter(([, v]) => v)
        .map(([k]) => `\`${k}\``)
        .join(' ');
      const exps = f.exports.slice(0, 3).join(', ') + (f.exports.length > 3 ? '…' : '');
      md += `| ${path.basename(f.relPath)} | ${f.lineCount} | ${f.sizeKB}KB | ${exps} | ${flags} |\n`;
    }
    md += '\n';
  }

  // Dependency graph
  md += `## Dependency Graph (local imports)\n`;
  md += '```\n';
  for (const [file, deps] of Object.entries(depGraph)) {
    if (deps.length > 0) {
      md += `${path.basename(file)}\n`;
      for (const d of deps) {
        md += `  → ${path.basename(d)}\n`;
      }
    }
  }
  md += '```\n\n';

  // State variable summary for complex components
  const complexFiles = files.filter(f => f.stateVars.length >= 3);
  if (complexFiles.length > 0) {
    md += `## Key State Variables (components with 3+ state vars)\n`;
    for (const f of complexFiles) {
      md += `### ${path.basename(f.relPath)}\n`;
      md += `States: ${f.stateVars.map(s => `\`${s}\``).join(', ')}\n\n`;
    }
  }

  // Architecture notes
  md += `## Architecture Notes\n`;
  md += `- **Entry**: \`main.jsx\` → \`App.jsx\` (view-based routing via state, not react-router)\n`;
  md += `- **Views**: home | templatepicker | builder | smartcv | ats (+ PartTimeCVGenerator overlay)\n`;
  md += `- **AI flow**: User pastes JD → \`ai.js\` calls Groq → returns tailored resume JSON → renders in template\n`;
  md += `- **PDF flow**: \`PDFTemplates.jsx\` uses @react-pdf/renderer to create vector PDFs client-side\n`;
  md += `- **Data persistence**: localStorage (resume cache) + Supabase (auth, saved CVs, versions)\n`;
  md += `- **ATS flow**: Upload CV → extract text → compare against JD → score + fix suggestions\n\n`;

  // How to work on this project
  md += `## For AI Assistants\n`;
  md += `1. Read THIS file first — it has everything you need to understand the project\n`;
  md += `2. Only read specific source files when you need to edit them\n`;
  md += `3. Run \`npm run dev\` to start dev server (Vite, usually port 5173)\n`;
  md += `4. Run \`npm run build\` to verify changes compile\n`;
  md += `5. After making changes, run \`npm run ai-context\` to update this file\n`;

  // Write output
  fs.writeFileSync(OUTPUT, md, 'utf-8');
  const outputSize = (Buffer.byteLength(md, 'utf-8') / 1024).toFixed(1);
  console.log(`✅ AI_CONTEXT.md generated (${outputSize}KB, ${md.split('\n').length} lines)`);
  console.log(`   Scanned ${files.length} files in src/`);
}

generate();
