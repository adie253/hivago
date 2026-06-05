import fs from 'fs';

try {
    const content = fs.readFileSync('src/presentation/pages/Untitled-1.txt', 'utf8');
    const swagger = JSON.parse(content);
    const paths = swagger.paths || {};
    
    for (const pathKey of Object.keys(paths)) {
        if (pathKey.includes('customers')) {
            console.log(`Path: ${pathKey}`);
            console.log(Object.keys(paths[pathKey]));
        }
    }
} catch (e) {
    console.error(e);
}
