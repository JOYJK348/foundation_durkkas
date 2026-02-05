const fs = require('fs');
const filePath = 'd:\\ERP\\Clown\\foundation_durkkas\\frontend\\src\\app\\ems\\academic-manager\\materials\\page.tsx';
const content = fs.readFileSync(filePath, 'utf8');

let stack = [];
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    for (let j = 0; j < line.length; j++) {
        let char = line[j];
        if (char === '{' || char === '[' || char === '(' || char === '<') {
            // Basic tag check for < but not <= or <-
            if (char === '<' && (line[j + 1] === ' ' || line[j + 1] === '=' || !/^[a-zA-Z/]/.test(line[j + 1]))) continue;
            stack.push({ char, line: i + 1, col: j + 1 });
        } else if (char === '}' || char === ']' || char === ')' || char === '>') {
            if (char === '>' && (line[j - 1] === ' ' || line[j - 1] === '-' || !/^[a-zA-Z0-9/]/.test(line[j - 1]))) continue;

            if (stack.length === 0) continue;

            let last = stack[stack.length - 1];
            if ((char === '}' && last.char === '{') ||
                (char === ']' && last.char === '[') ||
                (char === ')' && last.char === '(')) {
                stack.pop();
            }
        }
    }
}

if (stack.length > 0) {
    stack.filter(s => s.char !== '<').forEach(s => {
        console.log(`Unclosed ${s.char} from line ${s.line}, col ${s.col}`);
    });
} else {
    console.log("No basic bracket mismatch found.");
}
