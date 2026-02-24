const fs = require('fs');
const ObjectAst = require('path');

function cleanFile(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');

    // Fix `<div}}`, `<header}}`, `<button}}`, etc
    code = code.replace(/<([a-zA-Z0-9]+)\s*\}\}/g, '<$1');

    // Fix stray `}}` or `="something"` that might be left hanging
    // We can also just run prettier or fix specific known artifacts.
    // The previous script left:
    // <div}}
    //   className="..."

    // It might also have left multiline object contents:
    // <div
    //    {{ rotate: 360 ... }}
    // The regex `\\s+animate=\\{([^\\}]+)\\}` only caught single-line without nested braces.

    // Let's do a more robust cleanup of framer-motion props:
    const framerProps = ['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'viewport', 'layoutId'];

    // We will just remove any line that seems to be a framer motion prop or looks exactly like a leftover
    const lines = code.split('\n');
    const cleanedLines = lines.filter(line => {
        const trimmed = line.trim();
        // If the line is purely a leftover animation object like `animate={{...}}` or just `transition={{ duration: 30}}`
        if (framerProps.some(prop => trimmed.startsWith(`${prop}=`))) return false;

        // If it's a residual `}}` or `}} />` or similar, we should be careful
        // Actually, the easiest way to fix it is to restore the files and use a proper parser. 
        return true;
    });

    code = cleanedLines.join('\n');

    // Clean up specifically `<div}}` pattern which we know exists
    code = code.replace(/<([a-zA-Z0-9]+)\s*\}\}/g, '<$1');
    code = code.replace(/<([a-zA-Z0-9]+)\s*=\s*\{[^}]*\}\}/g, '<$1');
    code = code.replace(/<([a-zA-Z0-9]+)\s*=\s*"[^"]*"/g, '<$1');

    fs.writeFileSync(filePath, code);
}

// Let's just restore them from git first to be safe safely
const { execSync } = require('child_process');
try {
    execSync('git checkout src/components/BuilderWorkspace.jsx src/components/DataHub.jsx src/components/MatchEngine.jsx', { stdio: 'inherit' });
    console.log('Restored files from git');
} catch (e) {
    console.error('Git checkout failed', e.message);
}

