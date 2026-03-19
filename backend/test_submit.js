
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });
const { AttendanceService } = require('./lib/services/AttendanceService');

async function test() {
    console.log('--- Testing submitFaceVerification ---');
    // We'll mock the data
    const verificationData = {
        sessionId: 4,
        studentId: 41,
        verificationType: 'OPENING',
        faceImageUrl: 'https://example.com/mock.jpg',
        faceEmbedding: Array(128).fill(0), // Dummy embedding - might fail face match if RPC is strict
        latitude: 12.9716, // Assuming this is near the institution
        longitude: 77.5946,
        locationAccuracy: 10,
        deviceInfo: { mock: true }
    };

    const result = await AttendanceService.submitFaceVerification(verificationData, 13);
    console.log('Result:', result);
}
test();
