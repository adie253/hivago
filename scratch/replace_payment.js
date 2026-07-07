import fs from 'fs';

const filePath = 'c:\\Users\\Aditya\\OneDrive\\Desktop\\Celsys\\Hivago\\src\\presentation\\pages\\PaymentPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Use a regular expression that is robust to whitespace and line endings (\r?\n)
const regex = /<div className="flex justify-between items-center text-sm border-b border-dashed border-gray-100 pb-4">\r?\n\s*<span className="text-gray-400 font-medium">GST and Restaurant Charges<\/span>\r?\n\s*<span className="text-gray-700 font-bold">\{\(gst \+ platformFee\)\.toFixed\(2\)\}<\/span>\r?\n\s*<\/div>/;

if (regex.test(content)) {
    console.log("Found match!");
    const replacement = `<div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-medium">GST (5%)</span>
                                    <span className="text-gray-700 font-bold">{gst.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between items-center text-sm border-b border-dashed border-gray-100 pb-4">
                                    <span className="text-gray-400 font-medium">Platform Fee</span>
                                    <span className="text-gray-700 font-bold">{platformFee.toFixed(2)}</span>
                                </div>`;
    content = content.replace(regex, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully replaced!");
} else {
    console.log("Could not find match. Printing around area...");
    const index = content.indexOf('GST and Restaurant Charges');
    if (index !== -1) {
        console.log(content.substring(index - 200, index + 300));
    } else {
        console.log("Text 'GST and Restaurant Charges' not found at all!");
    }
}
