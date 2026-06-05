import fs from 'fs';

try {
    const content = fs.readFileSync('src/presentation/pages/Untitled-1.txt', 'utf8');
    const swagger = JSON.parse(content);
    
    // Find all occurrences of "options" in schemas
    const schemas = swagger.components?.schemas || {};
    for (const schemaName of Object.keys(schemas)) {
        const schema = schemas[schemaName];
        if (schema.properties && schema.properties.options) {
            console.log(`Schema: ${schemaName}`);
            console.log(JSON.stringify(schema.properties.options, null, 2));
        }
    }
} catch (e) {
    console.error("Error:", e);
}
