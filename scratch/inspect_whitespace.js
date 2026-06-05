import fs from 'fs';

try {
    const content = fs.readFileSync('src/presentation/components/AddOnsOverlay.tsx', 'utf8');
    const lines = content.split('\n');
    for (let i = 350; i < 376; i++) {
        console.log(`${i+1}: ${JSON.stringify(lines[i])}`);
    }
} catch (e) {
    console.error(e);
}
