
async function test() {
    const BASE_URL = 'http://localhost:5173/api';
    
    console.log("Fetching restaurants...");
    const res = await fetch(`${BASE_URL}/catalog/restaurants`);
    const restaurants = await res.json();
    const restaurantId = restaurants[0]?.id;
    
    if (!restaurantId) {
        console.error("No restaurants found");
        return;
    }
    
    console.log(`Testing with restaurantId: ${restaurantId}`);
    
    // Scenario 1: Minimal payload
    console.log("\nScenario: Minimal payload (no pincode/city)");
    const minimalPayload = {
        restaurantId: restaurantId,
        pickupLatitude: 18.5716,
        pickupLongitude: 73.9844,
        dropLatitude: 18.5089,
        dropLongitude: 73.8777,
        orderAmount: 499.00
    };
    
    const quoteRes = await fetch(`${BASE_URL}/delivery/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(minimalPayload)
    });
    
    if (quoteRes.ok) {
        console.log("Success:", await quoteRes.json());
    } else {
        console.error("Failed:", await quoteRes.json());
    }
}

test();
