import fs from 'fs';
import path from 'path';

const inputDir = path.resolve('scratch/parsed_policies');
const outputFile = path.resolve('src/presentation/data/policyData.ts');

const docMapping = {
    privacy: 'HIVAGO_Privacy_Policy_v1.md',
    terms: 'HIVAGO_Terms_and_Conditions_v1.md',
    refund: 'HIVAGO_Refund_Cancellation_Policy_v1.md',
    cookie: 'HIVAGO_Cookie_Policy_v1.md',
    restaurant: 'HIVAGO_Restaurant_Partner_Agreement_v1.md',
    delivery: 'HIVAGO_Delivery_Partner_Agreement_v1.md'
};

function cleanMarkdown(text) {
    let cleaned = text
        .replace(/\r\n/g, '\n') // Normalize newlines
        .replace(/\\([.\-!_()#+*`])/g, '$1') // Remove escaped markdown characters created by Mammoth (e.g. \. -> ., \_ -> _)
        .replace(/`/g, '\\`') // Escape backticks for JS template literal
        .replace(/\${/g, '\\${'); // Escape JS template injection

    // Replace CIN placeholders (e.g., CIN: [•] or CIN: \[•\])
    cleaned = cleaned.replace(/CIN:\s*(?:\\\[•\\\]|\[•\])/g, 'CIN: U56291MH2026PTC467768');

    // Inject CIN next to GSTIN in legal texts if not already present
    cleaned = cleaned.replace(/(GSTIN:\s*27AAECW3756G1Z3)(?!\s*\|?\s*CIN)/g, '$1  |  CIN: U56291MH2026PTC467768');

    return cleaned;
}

function bundle() {
    console.log('Bundling policies into policyData.ts...');
    
    // Ensure output parent directory exists
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    let fileContent = `/**\n * Auto-generated Policy Data for Hivago Guidelines Portal\n */\n\n`;
    fileContent += `export interface PolicyDoc {\n  id: string;\n  title: string;\n  content: string;\n}\n\n`;
    
    fileContent += `export const policyData: Record<string, PolicyDoc> = {\n`;
    
    for (const [key, filename] of Object.entries(docMapping)) {
        const filePath = path.join(inputDir, filename);
        if (!fs.existsSync(filePath)) {
            console.error(`Error: ${filePath} does not exist!`);
            continue;
        }
        
        console.log(`Bundling ${key} from ${filename}...`);
        const rawContent = fs.readFileSync(filePath, 'utf8');
        const cleanedContent = cleanMarkdown(rawContent);
        
        // Extract title from first lines
        let title = key.toUpperCase().replace(/_/g, ' ');
        if (key === 'privacy') title = 'Privacy Policy';
        if (key === 'terms') title = 'Terms & Conditions';
        if (key === 'refund') title = 'Refund & Cancellation Policy';
        if (key === 'cookie') title = 'Cookie Policy';
        if (key === 'restaurant') title = 'Restaurant Partner Agreement';
        if (key === 'delivery') title = 'Delivery Partner Agreement';
        
        fileContent += `  ${key}: {\n`;
        fileContent += `    id: '${key}',\n`;
        fileContent += `    title: '${title}',\n`;
        fileContent += `    content: \`${cleanedContent}\`\n`;
        fileContent += `  },\n`;
    }
    
    fileContent += `};\n`;
    
    fs.writeFileSync(outputFile, fileContent, 'utf8');
    console.log(`Successfully generated policy data at ${outputFile}`);
}

bundle();
