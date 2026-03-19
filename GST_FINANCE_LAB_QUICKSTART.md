# 🚀 GST FINANCE LAB - QUICK START GUIDE

## ⚡ 3-STEP DEPLOYMENT

### **STEP 1: Run Database Migration**
```bash
cd e:\ERP\CLONE\foundation_durkkas
psql -U postgres -d foundation_durkkas -f GST_FINANCE_LAB_SCHEMA.sql
```
*Enter your PostgreSQL password when prompted*

### **STEP 2: Verify Tables**
```sql
-- Check if all 7 tables are created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'ems' AND table_name LIKE 'gst_lab%';
```

### **STEP 3: Use the Component**
```tsx
import { GSTFinanceLab } from '@/components/ems/practice/GSTFinanceLab';

<GSTFinanceLab allocationId={123} onSuccess={() => {}} />
```

---

## 📋 COMPLETE FEATURE CHECKLIST

- ✅ Mock Company Setup (Auto GSTIN generation)
- ✅ Purchase Entry (Input GST tracking)
- ✅ Sales Entry (Output GST tracking)
- ✅ Automatic GST Calculation (CGST/SGST/IGST)
- ✅ Electronic Ledger System (3 ledgers)
- ✅ Monthly Return (GSTR-3B style)
- ✅ Challan Generation (PMT-06 simulation)
- ✅ Payment Simulation
- ✅ ITC Carry Forward
- ✅ Running Balance Maintenance

---

## 🎯 TESTING WORKFLOW

### **1. Register Company**
```
Tab: Setup
→ Enter company name: "ABC Enterprises"
→ Select state: "Tamil Nadu"
→ Click "Register Company"
→ System generates GSTIN: 33XXXXX9999X1Z5
```

### **2. Add Purchase**
```
Tab: Purchase
→ Supplier: "XYZ Suppliers"
→ Invoice: PUR-123456
→ Amount: ₹10,000
→ GST Rate: 18%
→ Type: Intra-State
→ Click "Add Purchase"
→ ITC Ledger: +₹1,800
```

### **3. Add Sales**
```
Tab: Sales
→ Customer: "ABC Pvt Ltd"
→ Invoice: SAL-123456
→ Amount: ₹20,000
→ GST Rate: 18%
→ Type: Intra-State
→ Click "Add Sales"
→ Output Ledger: +₹3,600
```

### **4. View Ledgers**
```
Tab: Ledger
→ ITC: ₹1,800 (Green)
→ Output GST: ₹3,600 (Red)
→ Net Payable: ₹1,800 (Blue)
```

### **5. Generate Return**
```
Tab: Return
→ Select Month: January
→ Select Year: 2026
→ Click "Generate Return"
→ Shows summary:
  - Total Sales: ₹20,000
  - Total Purchases: ₹10,000
  - Output GST: ₹3,600
  - Input GST: ₹1,800
  - Net Payable: ₹1,800
```

### **6. File Return**
```
Tab: Return
→ Click "File Return" on generated return
→ Status changes to "FILED"
```

### **7. Generate Challan**
```
Tab: Return
→ Click "Generate Challan" on filed return
→ Challan created with CPIN
```

### **8. Make Payment**
```
Tab: Payment
→ View pending challan
→ Click "Pay Now"
→ Payment processed
→ Cash Ledger updated
→ Return status: "PAID"
```

---

## 🧮 GST CALCULATION EXAMPLES

### **Example 1: Intra-State Purchase**
```
Taxable Amount: ₹10,000
GST Rate: 18%
Transaction: Intra-State (Same state)

Calculation:
CGST = (10,000 × 18) ÷ 200 = ₹900
SGST = (10,000 × 18) ÷ 200 = ₹900
IGST = ₹0
Total GST = ₹1,800
Total Amount = ₹11,800

Ledger Impact:
ITC Ledger: +₹1,800
```

### **Example 2: Inter-State Sales**
```
Taxable Amount: ₹50,000
GST Rate: 18%
Transaction: Inter-State (Different states)

Calculation:
CGST = ₹0
SGST = ₹0
IGST = (50,000 × 18) ÷ 100 = ₹9,000
Total GST = ₹9,000
Total Amount = ₹59,000

Ledger Impact:
Output GST Ledger: +₹9,000
```

### **Example 3: Monthly Return**
```
Month: January 2026

Purchases:
- Purchase 1: ₹10,000 (GST: ₹1,800)
- Purchase 2: ₹15,000 (GST: ₹2,700)
Total Input GST: ₹4,500

Sales:
- Sale 1: ₹20,000 (GST: ₹3,600)
- Sale 2: ₹30,000 (GST: ₹5,400)
Total Output GST: ₹9,000

Net Tax Payable:
₹9,000 - ₹4,500 = ₹4,500

Action: Generate challan for ₹4,500
```

### **Example 4: ITC Carry Forward**
```
Month: February 2026

Total Input GST: ₹10,000
Total Output GST: ₹6,000

Net Tax:
₹6,000 - ₹10,000 = -₹4,000

Result: No payment needed
ITC Carry Forward: ₹4,000 to March 2026
```

---

## 📡 API QUICK REFERENCE

### **Company**
```javascript
// Register
POST /api/ems/practice/student/gst-lab/company
{ allocationId, company_name, state, state_code }

// Get
GET /api/ems/practice/student/gst-lab/company?allocationId=123
```

### **Purchase**
```javascript
// Add
POST /api/ems/practice/student/gst-lab/purchase
{ companyId, supplier_name, invoice_no, taxable_amount, gst_rate, transaction_type }

// List
GET /api/ems/practice/student/gst-lab/purchase?companyId=1&month=2026-01
```

### **Sales**
```javascript
// Add
POST /api/ems/practice/student/gst-lab/sales
{ companyId, customer_name, invoice_no, taxable_amount, gst_rate, transaction_type }

// List
GET /api/ems/practice/student/gst-lab/sales?companyId=1&month=2026-01
```

### **Ledger**
```javascript
// Get balances
GET /api/ems/practice/student/gst-lab/ledger?companyId=1

// Get specific ledger
GET /api/ems/practice/student/gst-lab/ledger?companyId=1&type=INPUT_TAX_CREDIT
```

### **Return**
```javascript
// Generate
POST /api/ems/practice/student/gst-lab/return
{ companyId, month, year }

// File
POST /api/ems/practice/student/gst-lab/return
{ companyId, action: 'file', returnId }

// List
GET /api/ems/practice/student/gst-lab/return?companyId=1
```

### **Challan**
```javascript
// Generate
POST /api/ems/practice/student/gst-lab/challan
{ returnId }

// List
GET /api/ems/practice/student/gst-lab/challan?companyId=1
```

### **Payment**
```javascript
// Make payment
POST /api/ems/practice/student/gst-lab/payment
{ challanId }

// List
GET /api/ems/practice/student/gst-lab/payment?companyId=1
```

### **Dashboard**
```javascript
// Get all data
GET /api/ems/practice/student/gst-lab/dashboard?companyId=1
```

---

## 🗂️ DATABASE TABLES

```
ems.gst_lab_companies       → Company registration
ems.gst_lab_purchases       → Purchase entries
ems.gst_lab_sales           → Sales entries
ems.gst_lab_ledgers         → Electronic ledgers
ems.gst_lab_returns         → Monthly returns
ems.gst_lab_challans        → Payment challans
ems.gst_lab_payments        → Payment records
```

---

## 🔧 TROUBLESHOOTING

### **Issue: Tables not created**
```sql
-- Check if schema exists
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'ems';

-- Re-run migration
psql -U postgres -d foundation_durkkas -f GST_FINANCE_LAB_SCHEMA.sql
```

### **Issue: API returns 404**
```bash
# Restart backend server
# Press Ctrl+C in backend terminal
npm run dev
```

### **Issue: Ledger not updating**
```sql
-- Check if triggers exist
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_schema = 'ems' AND trigger_name LIKE 'trg_%';

-- Should show:
-- trg_purchase_update_itc
-- trg_sales_update_output
-- trg_payment_update_cash
```

### **Issue: Frontend component not found**
```bash
# Check file exists
ls frontend/src/components/ems/practice/GSTFinanceLab.tsx

# Restart frontend server
npm run dev
```

---

## 📊 EXPECTED RESULTS

### **After Company Setup**
```
✅ Company created with GSTIN
✅ Dashboard tab enabled
✅ All other tabs enabled
```

### **After Adding Purchase**
```
✅ Purchase appears in recent list
✅ ITC ledger balance increases
✅ Dashboard shows updated balance
```

### **After Adding Sales**
```
✅ Sales appears in recent list
✅ Output GST ledger balance increases
✅ Net payable updates
```

### **After Generating Return**
```
✅ Return appears in list with DRAFT status
✅ Shows correct calculations
✅ File Return button available
```

### **After Filing Return**
```
✅ Status changes to FILED
✅ Generate Challan button appears (if payable)
```

### **After Generating Challan**
```
✅ Challan appears in Payment tab
✅ Shows CPIN and amount
✅ Pay Now button available
```

### **After Making Payment**
```
✅ Challan status: PAID
✅ Return status: PAID
✅ Cash ledger updated
✅ Payment appears in history
```

---

## 🎓 LEARNING OUTCOMES

Students will understand:

1. ✅ **GST Basics**: CGST, SGST, IGST
2. ✅ **ITC Concept**: Input tax credit mechanism
3. ✅ **Tax Liability**: Output GST calculation
4. ✅ **Ledger System**: Electronic ledger management
5. ✅ **Return Filing**: GSTR-3B process
6. ✅ **Payment**: Challan and payment workflow
7. ✅ **Carry Forward**: ITC carry forward logic
8. ✅ **Compliance**: Monthly compliance cycle

---

## ⚠️ REMEMBER

- 🚫 This is NOT for real GST filing
- ✅ Educational simulation only
- ✅ Mock data and transactions
- ✅ Safe learning environment

---

## 📞 SUPPORT

If you encounter issues:

1. Check database migration completed
2. Verify all tables exist
3. Check triggers are active
4. Restart backend/frontend servers
5. Check browser console for errors

---

**🎉 You're all set! Happy Learning!** 🚀

---

**Quick Command Reference:**
```bash
# Database
psql -U postgres -d foundation_durkkas -f GST_FINANCE_LAB_SCHEMA.sql

# Backend (if needed)
cd backend && npm run dev

# Frontend (if needed)
cd frontend && npm run dev
```

**That's it! The GST Finance Lab is ready to use!** ✅
