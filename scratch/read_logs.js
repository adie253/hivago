import fs from 'fs';

try {
    const filePath = 'C:/Users/Aditya/.gemini/antigravity/brain/ab49aaa3-9ae3-4991-8d42-e584bf6b54e1/.system_generated/logs/overview.txt';
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    console.log("Total lines in log:", lines.length);
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.toLowerCase().includes('otp') || line.toLowerCase().includes('phone') || line.toLowerCase().includes('verify') || line.toLowerCase().includes('token')) {
            console.log(`${i + 1}: ${line.trim()}`);
        }
    }
} catch (e) {
    console.error("Error reading logs:", e);
}
