@echo off
echo ========================================
echo GST FINANCE LAB - Database Setup
echo ========================================
echo.
echo This will create all GST Finance Lab tables in your database.
echo.
echo Please enter your PostgreSQL password when prompted.
echo.
pause

psql -U postgres -d foundation_durkkas -f GST_FINANCE_LAB_SCHEMA.sql

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Check if tables were created successfully
echo 2. Create a practice allocation for testing
echo 3. Login as student and test the module
echo.
echo See GST_FINANCE_LAB_TESTING_GUIDE.md for details
echo.
pause
