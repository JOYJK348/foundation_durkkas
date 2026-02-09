const { BatchService } = require('./lib/services/BatchService');
const { batchSchema } = require('./lib/validations/ems');

async function test() {
    const testData = {
        company_id: 13, // Rajesh Kumar's companyId from logs
        course_id: 17,
        batch_code: 'TEST-BATCH-123',
        batch_name: 'Test Batch',
        batch_type: 'WEEKEND',
        start_date: '2026-02-09',
        status: 'PLANNED'
    };

    try {
        console.log('Testing createBatch...');
        const validated = batchSchema.parse(testData);
        const result = await BatchService.createBatch(validated);
        console.log('Success:', result);
    } catch (e) {
        console.error('Error Details:', e);
    }
}

test();
