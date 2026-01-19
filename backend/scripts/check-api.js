
async function checkApi() {
    console.log('--- API AUDIT CHECK ---');
    try {
        const response = await fetch('http://127.0.0.1:3000/api/auth/audit-logs');
        const json = await response.json();
        const data = json.data;

        console.log('API Status:', response.status);
        console.log('Total Logs Fetched:', data.length);

        if (data && data.length > 0) {
            console.log('Latest 5 API Logs:');
            data.slice(0, 5).forEach(log => {
                console.log(`[${log.created_at}] ${log.action} - ${log.user_email} - IP: ${log.ip_address}`);
            });
        } else {
            console.log('No data or empty data returned:', json);
        }
    } catch (err) {
        console.error('API Error:', err.message);
    }
    console.log('--- END CHECK ---');
}

checkApi();
