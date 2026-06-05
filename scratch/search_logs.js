import fs from 'fs';

try {
    const logPath = 'C:\\Users\\Aditya\\.gemini\\antigravity\\brain\\ab49aaa3-9ae3-4991-8d42-e584bf6b54e1\\.system_generated\\logs\\overview.txt';
    const content = fs.readFileSync(logPath, 'utf8');
    const lines = content.split('\n');
    for (let i = 68; i <= 75; i++) {
        if (lines[i]) {
            console.log(`\n--- Line ${i} ---`);
            console.log(lines[i].substring(0, 2000));
        }
    }
} catch (e) {
    console.error("Error:", e);
}
