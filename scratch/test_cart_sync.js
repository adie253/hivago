async function testSync() {
    const API_URL = 'https://rally-staging-9ae8.up.railway.app/api';
    
    // Step 1: Seed/login a user to get a token
    console.log("Attempting to login/verify OTP...");
    const phone = "+919876543210";
    
    try {
        const otpRes = await fetch(`${API_URL}/customers/otp/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: phone })
        });
        console.log("Send OTP status:", otpRes.status);
        
        const verifyRes = await fetch(`${API_URL}/customers/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: phone, otp: '123456' }) // assuming 123456 is standard or mocked
        });
        
        console.log("Verify OTP status:", verifyRes.status);
        if (!verifyRes.ok) {
            console.error("OTP verification failed. Let's check body:");
            console.error(await verifyRes.text());
            return;
        }
        
        const loginData = await verifyRes.json();
        const token = loginData.accessToken;
        console.log("Logged in successfully! Token received.");
        
        // Get a restaurant and menu item
        const restRes = await fetch(`${API_URL}/catalog/restaurants`);
        const restaurants = (await restRes.json()).items || [];
        const restaurant = restaurants.find(r => r.name === "STAGE") || restaurants[0];
        console.log(`Using restaurant: ${restaurant.name} (${restaurant.id})`);
        
        const menuRes = await fetch(`${API_URL}/catalog/restaurants/${restaurant.id}/menu`);
        const menuData = await menuRes.json();
        const menus = menuData.menus || [];
        const item = menus.flatMap(m => m.items || []).find(i => i.name === "Option Test Soup") || menus[0]?.items[0];
        console.log(`Using item: ${item.name} (${item.id})`);
        
        // Formats to test:
        const formats = {
            plainString: "Regular, Extra Garlic",
            jsonArray: JSON.stringify([{ name: "Size", value: "Regular" }, { name: "AddOn", value: "Extra Garlic" }]),
            jsonObject: JSON.stringify({ Size: "Regular", AddOn: "Extra Garlic" }),
            keyValueString: "Size:Regular,AddOn:Extra Garlic"
        };
        
        for (const [formatName, optionValue] of Object.entries(formats)) {
            console.log(`\n--- Testing format: ${formatName} ---`);
            console.log("Sending value:", optionValue);
            
            // Clear cart
            await fetch(`${API_URL}/cart`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // Sync cart
            const syncPayload = {
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
                items: [
                    {
                        menuItemId: item.id,
                        name: item.name,
                        unitPrice: item.basePrice,
                        quantity: 1,
                        options: optionValue
                    }
                ]
            };
            
            const syncRes = await fetch(`${API_URL}/cart/sync?replaceCart=true`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(syncPayload)
            });
            
            console.log("Sync status:", syncRes.status);
            if (syncRes.ok) {
                const cartData = await syncRes.json();
                console.log("Returned cart items options:", JSON.stringify(cartData.items?.[0]?.options, null, 2));
            } else {
                console.error("Sync failed:", await syncRes.text());
            }
        }
        
    } catch (e) {
        console.error("Error during test:", e);
    }
}

testSync();
