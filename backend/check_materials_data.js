const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMaterials() {
    console.log('\n🔍 Checking course_materials data...\n');

    const { data, error } = await supabase
        .schema('ems')
        .from('course_materials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('❌ Error:', error);
        return;
    }

    console.log(`📊 Found ${data.length} materials\n`);

    data.forEach((material, idx) => {
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`Material #${idx + 1}: ${material.material_name}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`ID: ${material.id}`);
        console.log(`Material Type: ${material.material_type || '❌ NULL'}`);
        console.log(`Delivery Method: ${material.delivery_method || '❌ NULL'}`);
        console.log(`File URL: ${material.file_url ? '✅ Present' : '❌ NULL'}`);
        console.log(`Content JSON: ${material.content_json ? `✅ ${material.content_json.length} sections` : '❌ NULL'}`);
        console.log(`Handbook Type: ${material.handbook_type || 'NULL'}`);
        console.log(`File Size: ${material.file_size_mb || 'NULL'} MB`);

        // Determine what should render
        const url = material.file_url;
        const type = material.material_type?.toUpperCase();
        const ext = url?.split('.').pop()?.toLowerCase() || '';
        const isDoc = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext);
        const isVideo = type === 'VIDEO' || ['mp4', 'webm', 'ogg'].includes(ext);
        const isImage = type === 'IMAGE' || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
        const isPDF = type === 'PDF' || ext === 'pdf';
        const isContent = type === 'CONTENT' || material.delivery_method === 'CONTENT';

        console.log(`\n🎯 Detection Results:`);
        console.log(`   PDF: ${isPDF ? '✅' : '❌'}`);
        console.log(`   Image: ${isImage ? '✅' : '❌'}`);
        console.log(`   Video: ${isVideo ? '✅' : '❌'}`);
        console.log(`   Office Doc: ${isDoc ? '✅' : '❌'}`);
        console.log(`   Structured Content: ${isContent ? '✅' : '❌'}`);

        if (!isPDF && !isImage && !isVideo && !isDoc && !isContent) {
            console.log(`\n⚠️  THIS WILL SHOW "NO PREVIEW AVAILABLE"`);
            console.log(`   Reason: No valid type detected`);
            console.log(`   File extension: ${ext || 'NONE'}`);
        }
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

checkMaterials().catch(console.error);
