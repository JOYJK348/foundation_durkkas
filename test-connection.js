
const axios = require('axios');

async function testApi() {
    console.log("Testing API Connectivity...");

    const API_URL = 'http://localhost:3000/api';
    const ORIGIN = 'http://localhost:3001';

    try {
        console.log(`1. Pinging ${API_URL}/health (if exists)...`);
        // Try a public route first
        try {
            const res = await axios.get(`${API_URL}/health`, {
                headers: { Origin: ORIGIN }
            });
            console.log("✅ Health Check Status:", res.status);
            console.log("   Headers:", res.headers);
        } catch (e) {
            console.log("⚠️ Health check failed (might not exist):", e.response?.status || e.message);
        }

        console.log(`\n2. Simulating Middleware Preflight (OPTIONS) on /api/core/companies...`);
        try {
            const res = await axios.options(`${API_URL}/core/companies`, {
                headers: {
                    Origin: ORIGIN,
                    'Access-Control-Request-Method': 'GET',
                    'Access-Control-Request-Headers': 'authorization'
                }
            });
            console.log("✅ OPTIONS Status:", res.status);
            console.log("   Access-Control-Allow-Origin:", res.headers['access-control-allow-origin']);
            console.log("   Access-Control-Allow-Credentials:", res.headers['access-control-allow-credentials']);
        } catch (e) {
            console.error("❌ OPTIONS Request Failed:", e.message);
            if (e.response) {
                console.error("   Status:", e.response.status);
                console.error("   Data:", e.response.data);
            }
        }

    } catch (error) {
        console.error("Fatal Test Error:", error);
    }
}

testApi();
