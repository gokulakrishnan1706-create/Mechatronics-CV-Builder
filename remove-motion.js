const fs = require('fs');
const path = require('path');

function removeMotion(filePath) {
    console.log('Processing', filePath);
    let code = fs.readFileSync(filePath, 'utf8');

    // 1. Remove imports
    code = code.replace(/import\s*\{\s*[^}]*motion[^}]*\}\s*from\s*['"]framer-motion['"];?\n?/g, (match) => {
        // If it also imports other things, we should ideally just remove motion and AnimatePresence.
        // For simplicity, MatchEngine, DataHub, BuilderWorkspace usually only import motion, AnimatePresence.
        return '';
    });

    // Fallback if import was single line with other stuff not stripped
    code = code.replace(/import\s*motion\s*from\s*['"]framer-motion['"];?\n?/g, '');
    code = code.replace(/import\s*\{\s*AnimatePresence\s*\}\s*from\s*['"]framer-motion['"];?\n?/g, '');

    // 2. Wrap tags: <motion.div -> <div
    code = code.replace(/<motion\.([a-zA-Z0-9]+)/g, '<$1');
    code = code.replace(/<\/motion\.([a-zA-Z0-9]+)>/g, '</$1>');

    // 3. Remove AnimatePresence wrappers
    code = code.replace(/<AnimatePresence[^>]*>\s*/g, '');
    code = code.replace(/<\/AnimatePresence>\s*/g, '');

    // 4. Remove specific motion props
    // Matches prop={...} or prop="..."
    const propsToRemove = ['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'viewport', 'layoutId'];

    propsToRemove.forEach(prop => {
        // Regex for prop={...} handling nested braces naively if simple, but usually they are 1 level deep.
        // RegEx: prop=\{[^\}]*\} or prop="[^"]*"
        const regexCurly = new RegExp(`\\s+${prop}=\\{([^\\}]+)\\}`, 'g');
        const regexString = new RegExp(`\\s+${prop}="([^"]*)"`, 'g');
        code = code.replace(regexCurly, '');
        code = code.replace(regexString, '');
    });

    // Handle `layout` boolean prop
    code = code.replace(/\s+layout(?=[\s>])/g, '');

    fs.writeFileSync(filePath, code);
    console.log('Updated', filePath);
}

const files = [
    path.join(__dirname, 'src/components/BuilderWorkspace.jsx'),
    path.join(__dirname, 'src/components/DataHub.jsx'),
    path.join(__dirname, 'src/components/MatchEngine.jsx')
];

files.forEach(f => {
    if (fs.existsSync(f)) removeMotion(f);
});

console.log('Done');
