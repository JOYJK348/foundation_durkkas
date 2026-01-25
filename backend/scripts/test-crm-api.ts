
import jwt from 'jsonwebtoken';
import axios from 'axios';

const JWT_SECRET = '0yg78O2w0seB7otmSiR+cNGxeGlf8pWuzn0Et8r1YNI=';
const payload = {
    userId: 248,
    email: 'dkit.system9@gmail.com',
    roles: ['COMPANY_ADMIN'],
    type: 'access'
};

const token = jwt.sign(payload, JWT_SECRET, {
    issuer: 'durkkas-erp',
    audience: 'durkkas-api',
    expiresIn: '1h'
});

async function testApi() {
    console.log('Testing API with token for user 248 (Company 20)...');
    try {
        const res = await axios.get('http://localhost:3000/api/crm/stats', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Response Status:', res.status);
        console.log('Response Data:', JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
    }
}

testApi();
