async function testItemDetails() {
    const API_URL = 'https://rally-staging-9ae8.up.railway.app/api';
    console.log("Fetching restaurants...");
    const res = await fetch(`${API_URL}/catalog/restaurants`);
    const restaurants = (await res.json()).items || [];
    const restaurant = restaurants.find(r => r.name === "STAGE") || restaurants[0];
    
    console.log(`Fetching menu for: ${restaurant.name}`);
    const menuRes = await fetch(`${API_URL}/catalog/restaurants/${restaurant.id}/menu`);
    const menuData = await menuRes.json();
    const menus = menuData.menus || menuData.categories || (Array.isArray(menuData) ? menuData : []);
    
    let targetItem = null;
    for (const menu of menus) {
        const items = menu.items || [];
        for (const item of items) {
            if (item.name === "Chicken Dum Biryani") {
                targetItem = item;
                break;
            }
        }
    }
    
    if (targetItem) {
        console.log(`Found item: ${targetItem.name} (${targetItem.id})`);
        console.log("Menu item from catalog menu:", JSON.stringify(targetItem, null, 2));
        
        console.log(`\nFetching details via /api/items/${targetItem.id}...`);
        const detailRes = await fetch(`${API_URL}/items/${targetItem.id}`);
        if (detailRes.ok) {
            const detailData = await detailRes.json();
            console.log("Details returned:", JSON.stringify(detailData, null, 2));
        } else {
            console.error("Failed to fetch details:", detailRes.status, await detailRes.text());
        }
    } else {
        console.log("Could not find Chicken Dum Biryani");
    }
}

testItemDetails().catch(console.error);
