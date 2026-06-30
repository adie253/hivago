const API_URL = 'https://rally-staging-9ae8.up.railway.app/api';
const phone = '8080125309';
const orderId = 'ad6b21ae-adda-4a2b-a224-af17723a07b1';

async function run() {
  console.log("Sending OTP to:", phone);
  const otpRes = await fetch(`${API_URL}/customers/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: phone })
  });
  console.log("Send OTP status:", otpRes.status);

  // Try typical test OTP candidates
  const candidates = ['123456', '000000', '111111', '1234', '12345'];
  let token = null;

  for (const otp of candidates) {
    console.log("Trying OTP:", otp);
    const verifyRes = await fetch(`${API_URL}/customers/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: phone, otp })
    });
    if (verifyRes.ok) {
      const data = await verifyRes.json();
      token = data.accessToken;
      console.log("Login successful! Token:", token);
      break;
    }
  }

  if (!token) {
    console.error("Could not log in with candidate OTPs.");
    return;
  }

  // Now query codes
  const codesUrl = `${API_URL}/delivery/orders/${orderId}/codes`;
  console.log('Fetching codes:', codesUrl);
  const codesRes = await fetch(codesUrl, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  console.log('Codes status:', codesRes.status);
  console.log('Codes response:', await codesRes.text());
}

run().catch(console.error);
