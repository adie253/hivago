async function tryOtp() {
    const API_URL = 'https://rally-staging-9ae8.up.railway.app/api';
    const phone = "+919876543210";
    
    console.log("Calling /customers/otp/send...");
    const otpRes = await fetch(`${API_URL}/customers/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone })
    });
    console.log("Send OTP status:", otpRes.status);
    const body = await otpRes.text();
    console.log("Send OTP body:", body);
    
    const candidates = ['123456', '000000', '111111', '1234', '543210', '432100'];
    for (const otp of candidates) {
        console.log(`Trying OTP: ${otp}`);
        const verifyRes = await fetch(`${API_URL}/customers/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: phone, otp })
        });
        console.log(`Verify OTP status for ${otp}:`, verifyRes.status);
        if (verifyRes.ok) {
            console.log("SUCCESS! Logged in with OTP:", otp);
            console.log(await verifyRes.json());
            return;
        }
    }
}

tryOtp().catch(console.error);
