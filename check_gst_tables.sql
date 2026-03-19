-- Quick test to check if GST Lab tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'ems' 
AND table_name LIKE 'gst_lab%'
ORDER BY table_name;
