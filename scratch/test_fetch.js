async function run() {
    try {
        const res = await fetch('https://rally-staging-9ae8.up.railway.app/api/items/7250314c-59dc-43a7-a6ca-7f6f8bcc229b');
        const details = await res.json();
        console.log(JSON.stringify(details, null, 2));
    } catch (e) {
        console.error(e);
    }
}

run();
