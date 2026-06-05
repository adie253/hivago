import fs from 'fs';

try {
    const content = fs.readFileSync('src/presentation/pages/Untitled-1.txt', 'utf8');
    const swagger = JSON.parse(content);
    const schemas = swagger.components?.schemas || {};
    const key = 'RallyAPI.Orders.Application.Cart.DTOs.CartItemOptionDto';
    if (schemas[key]) {
        console.log(JSON.stringify(schemas[key], null, 2));
    }
} catch (e) {
    console.error("Error:", e);
}
