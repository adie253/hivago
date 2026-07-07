import fs from 'fs';

const filePath = 'c:\\Users\\Aditya\\OneDrive\\Desktop\\Celsys\\Hivago\\src\\presentation\\pages\\PaymentPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import
const importTarget = "import { LoadingScreen } from '../components/LoadingScreen';";
const importReplacement = `import { LoadingScreen } from '../components/LoadingScreen';\nimport { FEATURE_FLAGS } from '../../config/featureFlags';`;

if (content.includes(importTarget) && !content.includes("FEATURE_FLAGS")) {
    content = content.replace(importTarget, importReplacement);
    console.log("Import added!");
}

// 2. Replace layout
const regex = /<div className="flex justify-between items-center text-sm">\r?\n\s*<span className="text-gray-400 font-medium">GST \(5%\)<\/span>\r?\n\s*<span className="text-gray-700 font-bold">\{gst\.toFixed\(2\)\}<\/span>\r?\n\s*<\/div>\r?\n\s*<div className="flex justify-between items-center text-sm border-b border-dashed border-gray-100 pb-4">\r?\n\s*<span className="text-gray-400 font-medium">Platform Fee<\/span>\r?\n\s*<span className="text-gray-700 font-bold">\{platformFee\.toFixed\(2\)\}<\/span>\r?\n\s*<\/div>/;

if (regex.test(content)) {
    console.log("Found layout match!");
    const replacement = `{FEATURE_FLAGS.SEPARATE_PLATFORM_FEE ? (
                                    <>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400 font-medium">GST (5%)</span>
                                            <span className="text-gray-700 font-bold">{gst.toFixed(2)}</span>
                                        </div>

                                        <div className="flex justify-between items-center text-sm border-b border-dashed border-gray-100 pb-4">
                                            <span className="text-gray-400 font-medium">Platform Fee</span>
                                            <span className="text-gray-700 font-bold">{platformFee.toFixed(2)}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex justify-between items-center text-sm border-b border-dashed border-gray-100 pb-4">
                                        <span className="text-gray-400 font-medium">GST and Restaurant Charges</span>
                                        <span className="text-gray-700 font-bold">{(gst + platformFee).toFixed(2)}</span>
                                    </div>
                                )}`;
    content = content.replace(regex, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully replaced layout with feature flag check!");
} else {
    console.log("Could not find layout match!");
}
