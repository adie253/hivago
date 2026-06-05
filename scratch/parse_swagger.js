import fs from 'fs';

try {
    const content = fs.readFileSync('src/presentation/pages/Untitled-1.txt', 'utf8');
    const swagger = JSON.parse(content);
    const schemas = swagger.components?.schemas || {};
    
    console.log("Matching schemas:");
    for (const key of Object.keys(schemas)) {
        if (key.includes('Item') || key.includes('Catalog')) {
            console.log(key);
        }
    }
} catch (e) {
    console.error("Error:", e);
}
