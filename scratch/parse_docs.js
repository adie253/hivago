import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

const inputDir = path.resolve('Privacy Policy');
const outputDir = path.resolve('scratch/parsed_policies');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const files = [
    'HIVAGO_Privacy_Policy_v1.docx',
    'HIVAGO_Terms_and_Conditions_v1.docx',
    'HIVAGO_Refund_Cancellation_Policy_v1.docx',
    'HIVAGO_Cookie_Policy_v1.docx',
    'HIVAGO_Restaurant_Partner_Agreement_v1.docx',
    'HIVAGO_Delivery_Partner_Agreement_v1.docx'
];

async function parseAll() {
    for (const file of files) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file.replace('.docx', '.md'));
        
        console.log(`Parsing ${file}...`);
        
        try {
            const result = await mammoth.convertToMarkdown({ path: inputPath });
            const markdown = result.value; // The generated markdown
            fs.writeFileSync(outputPath, markdown, 'utf8');
            console.log(`Successfully saved to ${outputPath}`);
        } catch (error) {
            console.error(`Error parsing ${file}:`, error);
        }
    }
}

parseAll();
