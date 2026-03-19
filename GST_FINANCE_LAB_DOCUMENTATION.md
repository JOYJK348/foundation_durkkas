# 📌 GST FINANCE LAB - EDUCATIONAL SIMULATION MODULE

## 🎯 PROJECT OVERVIEW

**Purpose**: Complete GST learning system that teaches tax calculation, ledger management, returns filing, and payment simulation.

**Educational Focus**: Simulates real GST workflows without legal compliance burden.

---

## ✅ FEATURES IMPLEMENTED

### 1️⃣ **Mock Company Setup**
- Simulated GST registration
- Auto-generated dummy GSTIN (Format: `SSAAAAA9999A1Z5`)
- State-based configuration
- Default GST rate selection

### 2️⃣ **Purchase Module (Input GST)**
- Add purchase entries with supplier details
- Automatic GST calculation (CGST/SGST or IGST)
- Input Tax Credit (ITC) tracking
- Transaction history

### 3️⃣ **Sales Module (Output GST)**
- Add sales entries with customer details
- Automatic GST calculation
- Output GST liability tracking
- Transaction history

### 4️⃣ **Electronic Ledger System**
Three separate ledgers maintained:
- **Input Tax Credit Ledger**: ITC available from purchases
- **Output Tax Liability Ledger**: Tax collected from sales
- **Electronic Cash Ledger**: Payments made

### 5️⃣ **Monthly Return (GSTR-3B Style)**
- Generate monthly summary
- Calculate net tax payable: `Output GST - Input GST`
- ITC carry forward for excess credit
- File return functionality

### 6️⃣ **Challan Generation (PMT-06 Simulation)**
- Auto-generate payment challan
- Mock CPIN (Common Portal Identification Number)
- Tax breakdown (CGST/SGST/IGST)

### 7️⃣ **Payment Simulation**
- Simulated tax payment
- Mock transaction ID generation
- Auto-update cash ledger
- Payment history tracking

### 8️⃣ **ITC Carry Forward**
- Automatic balance management
- Excess ITC carried to next month
- Running balance maintenance

---

## 🗂️ FILE STRUCTURE

```
GST Finance Lab Implementation
│
├── Database Schema
│   └── GST_FINANCE_LAB_SCHEMA.sql
│       ├── gst_lab_companies (Company Setup)
│       ├── gst_lab_purchases (Purchase Entries)
│       ├── gst_lab_sales (Sales Entries)
│       ├── gst_lab_ledgers (Electronic Ledgers)
│       ├── gst_lab_returns (Monthly Returns)
│       ├── gst_lab_challans (Payment Challans)
│       ├── gst_lab_payments (Payment Records)
│       └── Helper Functions & Triggers
│
├── Backend Service
│   └── backend/lib/services/GSTFinanceLabService.ts
│       ├── Company Management
│       ├── Purchase Operations
│       ├── Sales Operations
│       ├── Ledger Queries
│       ├── Return Generation
│       ├── Challan Creation
│       └── Payment Processing
│
├── API Routes
│   └── backend/app/api/ems/practice/student/gst-lab/
│       ├── company/route.ts (Setup)
│       ├── purchase/route.ts (Purchase Entry)
│       ├── sales/route.ts (Sales Entry)
│       ├── ledger/route.ts (Ledger View)
│       ├── return/route.ts (Monthly Return)
│       ├── challan/route.ts (Challan Generation)
│       ├── payment/route.ts (Payment Simulation)
│       └── dashboard/route.ts (Dashboard Data)
│
└── Frontend Component
    └── frontend/src/components/ems/practice/GSTFinanceLab.tsx
        ├── Company Setup Tab
        ├── Dashboard Tab
        ├── Purchase Entry Tab
        ├── Sales Entry Tab
        ├── Ledger View Tab
        ├── Monthly Return Tab
        └── Payment Tab
```

---

## 🔄 BUSINESS FLOW

### **Complete Workflow**

```
1. COMPANY SETUP
   ↓
   Student creates mock GST company
   System generates dummy GSTIN
   
2. TRANSACTIONS
   ↓
   Add Purchase → Input GST increases (ITC)
   Add Sale → Output GST increases (Liability)
   
3. LEDGER UPDATES (Automatic)
   ↓
   Every transaction updates respective ledger
   Running balance maintained
   
4. MONTH END
   ↓
   Generate Monthly Return (GSTR-3B)
   Calculate: Net Tax = Output GST - Input GST
   
5. TAX PAYMENT (If Payable)
   ↓
   If Net Tax > 0:
     → Generate Challan (PMT-06)
     → Make Payment (Simulated)
     → Update Cash Ledger
   
   If Net Tax < 0:
     → ITC Carry Forward to next month
   
6. REPEAT
   ↓
   Continue with next month's transactions
```

---

## 📊 DATABASE SCHEMA DETAILS

### **1. gst_lab_companies**
Mock company registration
```sql
- id (Primary Key)
- allocation_id (FK to student_practice_allocations)
- company_name
- state
- state_code (e.g., '33' for Tamil Nadu)
- gstin (Auto-generated, Format: 33ABCDE1234F1Z5)
- default_gst_rate (Default: 18%)
- financial_year (Default: '2025-26')
```

### **2. gst_lab_purchases**
Purchase entries for ITC
```sql
- id (Primary Key)
- company_id (FK)
- supplier_name
- supplier_gstin
- invoice_no
- invoice_date
- taxable_amount
- gst_rate (5, 12, 18, 28)
- cgst_amount (Auto-calculated)
- sgst_amount (Auto-calculated)
- igst_amount (Auto-calculated)
- total_gst_amount (Generated column)
- total_amount (Generated column)
- transaction_type (INTRA_STATE / INTER_STATE)
```

### **3. gst_lab_sales**
Sales entries for Output GST
```sql
- id (Primary Key)
- company_id (FK)
- customer_name
- customer_gstin
- invoice_no
- invoice_date
- taxable_amount
- gst_rate
- cgst_amount
- sgst_amount
- igst_amount
- total_gst_amount (Generated column)
- total_amount (Generated column)
- transaction_type
```

### **4. gst_lab_ledgers**
Electronic ledger system
```sql
- id (Primary Key)
- company_id (FK)
- ledger_type (INPUT_TAX_CREDIT / OUTPUT_TAX_LIABILITY / CASH_LEDGER)
- transaction_date
- description
- reference_type (PURCHASE / SALES / PAYMENT / RETURN_FILING)
- reference_id
- debit_amount
- credit_amount
- balance (Running balance)
```

### **5. gst_lab_returns**
Monthly GST returns (GSTR-3B style)
```sql
- id (Primary Key)
- company_id (FK)
- return_month (e.g., 'January 2026')
- return_year
- filing_period (e.g., '01-2026')
- total_sales
- total_purchases
- output_gst_total
- input_gst_total
- net_tax_payable (Output - Input)
- itc_carry_forward (If negative)
- status (DRAFT / FILED / PAID)
- filed_at
```

### **6. gst_lab_challans**
Payment challans (PMT-06 simulation)
```sql
- id (Primary Key)
- company_id (FK)
- return_id (FK)
- challan_number (Mock CPIN format)
- challan_date
- cgst_amount
- sgst_amount
- igst_amount
- total_amount
- status (GENERATED / PAID / CANCELLED)
- paid_at
```

### **7. gst_lab_payments**
Payment records
```sql
- id (Primary Key)
- company_id (FK)
- challan_id (FK)
- payment_date
- payment_amount
- payment_mode (SIMULATED / INTERNET_BANKING / NEFT / RTGS)
- transaction_id (Mock transaction ID)
```

---

## 🔧 AUTOMATIC TRIGGERS

### **Trigger 1: Update ITC Ledger on Purchase**
```sql
CREATE TRIGGER trg_purchase_update_itc
AFTER INSERT ON gst_lab_purchases
→ Automatically adds ITC to Input Tax Credit Ledger
```

### **Trigger 2: Update Output Ledger on Sales**
```sql
CREATE TRIGGER trg_sales_update_output
AFTER INSERT ON gst_lab_sales
→ Automatically adds Output GST to Liability Ledger
```

### **Trigger 3: Update Cash Ledger on Payment**
```sql
CREATE TRIGGER trg_payment_update_cash
AFTER INSERT ON gst_lab_payments
→ Automatically updates Cash Ledger with payment amount
```

---

## 🧮 GST CALCULATION LOGIC

### **Intra-State Transaction** (Within same state)
```
CGST = (Taxable Amount × GST Rate) / 200
SGST = (Taxable Amount × GST Rate) / 200
IGST = 0

Example:
Taxable Amount = ₹10,000
GST Rate = 18%
→ CGST = ₹900
→ SGST = ₹900
→ Total GST = ₹1,800
```

### **Inter-State Transaction** (Different states)
```
CGST = 0
SGST = 0
IGST = (Taxable Amount × GST Rate) / 100

Example:
Taxable Amount = ₹10,000
GST Rate = 18%
→ IGST = ₹1,800
→ Total GST = ₹1,800
```

---

## 📡 API ENDPOINTS

### **1. Company Setup**
```
POST /api/ems/practice/student/gst-lab/company
Body: { allocationId, company_name, state, state_code, default_gst_rate }
Response: Company object with generated GSTIN

GET /api/ems/practice/student/gst-lab/company?allocationId=123
Response: Company details
```

### **2. Purchase Entry**
```
POST /api/ems/practice/student/gst-lab/purchase
Body: { companyId, supplier_name, invoice_no, taxable_amount, gst_rate, transaction_type }
Response: Purchase entry with calculated GST

GET /api/ems/practice/student/gst-lab/purchase?companyId=1&month=2026-01
Response: List of purchases (optional month filter)
```

### **3. Sales Entry**
```
POST /api/ems/practice/student/gst-lab/sales
Body: { companyId, customer_name, invoice_no, taxable_amount, gst_rate, transaction_type }
Response: Sales entry with calculated GST

GET /api/ems/practice/student/gst-lab/sales?companyId=1&month=2026-01
Response: List of sales
```

### **4. Ledger View**
```
GET /api/ems/practice/student/gst-lab/ledger?companyId=1&type=INPUT_TAX_CREDIT
Response: Ledger entries for specific type

GET /api/ems/practice/student/gst-lab/ledger?companyId=1
Response: All ledger balances (ITC, Output, Cash, Net Payable)
```

### **5. Monthly Return**
```
POST /api/ems/practice/student/gst-lab/return
Body: { companyId, month, year }
Response: Generated return summary

POST /api/ems/practice/student/gst-lab/return
Body: { companyId, action: 'file', returnId }
Response: Filed return

GET /api/ems/practice/student/gst-lab/return?companyId=1
Response: List of all returns
```

### **6. Challan Generation**
```
POST /api/ems/practice/student/gst-lab/challan
Body: { returnId }
Response: Generated challan with CPIN

GET /api/ems/practice/student/gst-lab/challan?companyId=1
Response: List of challans
```

### **7. Payment**
```
POST /api/ems/practice/student/gst-lab/payment
Body: { challanId }
Response: Payment confirmation with transaction ID

GET /api/ems/practice/student/gst-lab/payment?companyId=1
Response: Payment history
```

### **8. Dashboard**
```
GET /api/ems/practice/student/gst-lab/dashboard?companyId=1
Response: Complete dashboard data (company, balances, transactions, returns, challans, payments)
```

---

## 🎨 FRONTEND FEATURES

### **Tab Structure**
1. **Setup Tab**: Company registration (one-time)
2. **Dashboard Tab**: Overview with ledger balances and summary
3. **Purchase Tab**: Add purchases + view recent entries
4. **Sales Tab**: Add sales + view recent entries
5. **Ledger Tab**: View all three electronic ledgers
6. **Return Tab**: Generate and file monthly returns
7. **Payment Tab**: View pending challans and make payments

### **Key UI Components**
- Real-time balance updates
- Color-coded ledgers (Green=ITC, Red=Output, Blue=Cash)
- Transaction history with badges
- Auto-calculated GST breakdown
- Simulated payment flow

---

## 🚀 DEPLOYMENT STEPS

### **1. Run Database Migration**
```bash
psql -U postgres -d foundation_durkkas -f GST_FINANCE_LAB_SCHEMA.sql
```

### **2. Verify Tables Created**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'ems' AND table_name LIKE 'gst_lab%';
```

### **3. Test API Endpoints**
Use Postman or similar tool to test each endpoint

### **4. Integrate Frontend Component**
Import and use `GSTFinanceLab` component in student practice portal

---

## 📚 EDUCATIONAL VALUE

### **What Students Learn**
1. ✅ GST calculation (CGST/SGST vs IGST)
2. ✅ Input Tax Credit (ITC) concept
3. ✅ Output GST liability
4. ✅ Ledger management
5. ✅ Monthly return filing (GSTR-3B)
6. ✅ Tax payment via challan (PMT-06)
7. ✅ ITC carry forward mechanism
8. ✅ Inter-state vs Intra-state transactions

### **Real-World Simulation**
- Mimics actual GST portal workflow
- Teaches compliance without legal risk
- Hands-on practice with realistic scenarios
- Immediate feedback on calculations

---

## ⚠️ IMPORTANT NOTES

### **This is NOT for Real GST Filing**
- ❌ No real GST API integration
- ❌ No government authentication
- ❌ No legal compliance
- ✅ Educational simulation only
- ✅ Mock data and transactions
- ✅ Safe learning environment

### **Data Isolation**
- Each student allocation gets separate company
- Sandbox environment
- No impact on real business data

---

## 🎯 SUCCESS CRITERIA

✅ Student can register mock company
✅ Student can add purchases and track ITC
✅ Student can add sales and track Output GST
✅ System automatically updates ledgers
✅ Student can generate monthly returns
✅ System calculates net tax payable correctly
✅ Student can generate and pay challans
✅ ITC carry forward works automatically

---

## 📞 SUPPORT

For issues or questions:
1. Check database triggers are active
2. Verify API endpoints are accessible
3. Check browser console for frontend errors
4. Review ledger balances for accuracy

---

**Built with ❤️ for Educational Excellence**

*GST Finance Lab - Making Tax Learning Interactive and Fun!*
