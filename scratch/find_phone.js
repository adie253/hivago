import fs from 'fs';

try {
    const filePath = 'C:/Users/Aditya/.gemini/antigravity/brain/e0077939-bfa1-4f09-bf4b-8c8e731f6eb5/.system_generated/logs/overview.txt';
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    for (let i = 750; i < Math.min(lines.length, 880); i++) {
        console.log(`${i+1}: ${lines[i].trim()}`);
    }
} catch (e) {
    console.error("Error:", e);
}
