'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GST FINANCE LAB - COMPLETE EDUCATIONAL SIMULATION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * ✅ Company Setup (Mock GSTIN)
 * ✅ Purchase Entry (Input GST)
 * ✅ Sales Entry (Output GST)
 * ✅ Electronic Ledgers (ITC, Output, Cash)
 * ✅ Monthly Return (GSTR-3B)
 * ✅ Challan Generation (PMT-06)
 * ✅ Payment Simulation
 * ✅ ITC Carry Forward
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Calendar, DollarSign, Download, Loader2, Info, Plus, Eye, X,
    Menu, User, Settings, LogOut, ChevronDown, Search, Bell, HelpCircle,
    Wallet, Building2, TrendingUp, TrendingDown, FileText, Receipt, ShoppingCart, CreditCard, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface GSTFinanceLabProps {
    allocationId: number;
    onSuccess?: () => void;
}

const INDIAN_STATES = [
    { name: 'Tamil Nadu', code: '33' },
    { name: 'Karnataka', code: '29' },
    { name: 'Maharashtra', code: '27' },
    { name: 'Delhi', code: '07' },
    { name: 'Gujarat', code: '24' },
    { name: 'Rajasthan', code: '08' },
    { name: 'Uttar Pradesh', code: '09' },
    { name: 'West Bengal', code: '19' },
];

const GST_RATES = [0, 5, 12, 18, 28];

export function GSTFinanceLab({ allocationId, onSuccess }: GSTFinanceLabProps) {
    const [activeTab, setActiveTab] = useState('setup');
    const [loading, setLoading] = useState(false);
    const [company, setCompany] = useState<any>(null);
    const [dashboard, setDashboard] = useState<any>(null);
    const [selectedChallan, setSelectedChallan] = useState<any>(null);
    const [isChallanOpen, setIsChallanOpen] = useState(false);

    // Company Setup State
    const [setupForm, setSetupForm] = useState({
        company_name: '',
        state: '',
        state_code: '',
        default_gst_rate: 18
    });

    // Purchase Form State
    const [purchaseForm, setPurchaseForm] = useState({
        supplier_name: '',
        supplier_gstin: '',
        invoice_no: `PUR-${Date.now().toString().slice(-6)}`,
        invoice_date: new Date().toISOString().split('T')[0],
        items: [{ description: '', hsn: '', qty: 1, rate: 0, amount: 0 }],
        taxable_amount: 0,
        gst_rate: 18,
        transaction_type: 'INTRA_STATE' as 'INTRA_STATE' | 'INTER_STATE'
    });

    // Sales Form State
    const [salesForm, setSalesForm] = useState({
        customer_name: '',
        customer_gstin: '',
        invoice_no: `SAL-${Date.now().toString().slice(-6)}`,
        invoice_date: new Date().toISOString().split('T')[0],
        items: [{ description: '', hsn: '', qty: 1, rate: 0, amount: 0 }],
        taxable_amount: 0,
        gst_rate: 18,
        transaction_type: 'INTRA_STATE' as 'INTRA_STATE' | 'INTER_STATE'
    });

    // Return Form State
    const [returnForm, setReturnForm] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    // Load company on mount
    useEffect(() => {
        loadCompany();
    }, []);

    // Load dashboard when company exists
    useEffect(() => {
        if (company) {
            loadDashboard();
        }
    }, [company]);

    const loadCompany = async () => {
        try {
            const response = await api.get(`/ems/practice/student/gst-lab/company?allocationId=${allocationId}`);
            setCompany(response.data.data);
            setActiveTab('dashboard');
        } catch (error: any) {
            if (error.response?.status === 404 || error.response?.status === 500) {
                // Company not found, stay on setup tab
                setActiveTab('setup');
            }
        }
    };

    const loadDashboard = async () => {
        if (!company) return;

        try {
            const response = await api.get(`/ems/practice/student/gst-lab/dashboard?companyId=${company.id}`);
            setDashboard(response.data.data);
        } catch (error: any) {
            console.error('Failed to load dashboard:', error);
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // 1️⃣ COMPANY SETUP
    // ═══════════════════════════════════════════════════════════════════════

    const handleCompanySetup = async () => {
        if (!setupForm.company_name || !setupForm.state || !setupForm.state_code) {
            toast.error('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/ems/practice/student/gst-lab/company', {
                allocationId,
                ...setupForm
            });

            setCompany(response.data.data);
            toast.success('GST Company registered successfully!');
            setActiveTab('dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to register company');
        } finally {
            setLoading(false);
        }
    };

    const addPurchaseItem = () => {
        const newItems = [...purchaseForm.items, { description: '', hsn: '', qty: 1, rate: 0, amount: 0 }];
        setPurchaseForm({ ...purchaseForm, items: newItems });
    };

    const updatePurchaseItem = (index: number, field: string, value: any) => {
        const newItems = [...purchaseForm.items];
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === 'qty' || field === 'rate') {
            newItems[index].amount = (newItems[index].qty || 0) * (newItems[index].rate || 0);
        }
        const total = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        setPurchaseForm({ ...purchaseForm, items: newItems, taxable_amount: total });
    };

    const removePurchaseItem = (index: number) => {
        const newItems = purchaseForm.items.filter((_, i) => i !== index);
        const total = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        setPurchaseForm({ ...purchaseForm, items: newItems, taxable_amount: total });
    };

    const addSalesItem = () => {
        const newItems = [...salesForm.items, { description: '', hsn: '', qty: 1, rate: 0, amount: 0 }];
        setSalesForm({ ...salesForm, items: newItems });
    };

    const updateSalesItem = (index: number, field: string, value: any) => {
        const newItems = [...salesForm.items];
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === 'qty' || field === 'rate') {
            newItems[index].amount = (newItems[index].qty || 0) * (newItems[index].rate || 0);
        }
        const total = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        setSalesForm({ ...salesForm, items: newItems, taxable_amount: total });
    };

    const removeSalesItem = (index: number) => {
        const newItems = salesForm.items.filter((_, i) => i !== index);
        const total = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        setSalesForm({ ...salesForm, items: newItems, taxable_amount: total });
    };

    // ═══════════════════════════════════════════════════════════════════════
    // 2️⃣ PURCHASE ENTRY
    // ═══════════════════════════════════════════════════════════════════════

    const handleAddPurchase = async () => {
        if (!purchaseForm.supplier_name || !purchaseForm.taxable_amount) {
            toast.error('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            await api.post('/ems/practice/student/gst-lab/purchase', {
                companyId: company.id,
                ...purchaseForm,
                taxable_amount: parseFloat(purchaseForm.taxable_amount)
            });

            toast.success('Purchase entry added! ITC updated.');

            // Reset form
            setPurchaseForm({
                ...purchaseForm,
                supplier_name: '',
                supplier_gstin: '',
                invoice_no: `PUR-${Date.now().toString().slice(-6)}`,
                taxable_amount: 0,
                items: [{ description: '', hsn: '', qty: 1, rate: 0, amount: 0 }]
            });

            loadDashboard();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add purchase');
        } finally {
            setLoading(false);
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // 3️⃣ SALES ENTRY
    // ═══════════════════════════════════════════════════════════════════════

    const handleAddSales = async () => {
        if (!salesForm.customer_name || !salesForm.taxable_amount) {
            toast.error('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            await api.post('/ems/practice/student/gst-lab/sales', {
                companyId: company.id,
                ...salesForm,
                taxable_amount: parseFloat(salesForm.taxable_amount)
            });

            toast.success('Sales entry added! Output GST updated.');

            // Reset form
            setSalesForm({
                ...salesForm,
                customer_name: '',
                customer_gstin: '',
                invoice_no: `SAL-${Date.now().toString().slice(-6)}`,
                taxable_amount: 0,
                items: [{ description: '', hsn: '', qty: 1, rate: 0, amount: 0 }]
            });

            loadDashboard();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add sales');
        } finally {
            setLoading(false);
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // 4️⃣ MONTHLY RETURN
    // ═══════════════════════════════════════════════════════════════════════

    const handleGenerateReturn = async () => {
        setLoading(true);
        try {
            const response = await api.post('/ems/practice/student/gst-lab/return', {
                companyId: company.id,
                month: returnForm.month,
                year: returnForm.year
            });

            toast.success('Monthly return generated!');
            loadDashboard();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to generate return');
        } finally {
            setLoading(false);
        }
    };

    const handleFileReturn = async (returnId: number) => {
        setLoading(true);
        try {
            await api.post('/ems/practice/student/gst-lab/return', {
                companyId: company.id,
                action: 'file',
                returnId
            });

            toast.success('Return filed successfully!');
            loadDashboard();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to file return');
        } finally {
            setLoading(false);
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // 5️⃣ CHALLAN & PAYMENT
    // ═══════════════════════════════════════════════════════════════════════

    const handleGenerateChallan = async (returnId: number) => {
        setLoading(true);
        try {
            await api.post('/ems/practice/student/gst-lab/challan', { returnId });
            toast.success('Payment challan generated!');
            loadDashboard();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to generate challan');
        } finally {
            setLoading(false);
        }
    };

    const handleMakePayment = async (challanId: number) => {
        setLoading(true);
        try {
            await api.post('/ems/practice/student/gst-lab/payment', { challanId });
            toast.success('Payment completed! Cash ledger updated.');
            loadDashboard();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to process payment');
        } finally {
            setLoading(false);
        }
    };

    const handleViewChallan = (challan: any) => {
        setSelectedChallan(challan);
        setIsChallanOpen(true);
    };

    const renderChallanPortal = (challan: any) => {
        if (!challan) return null;

        const cgst = parseFloat(challan.cgst_amount || 0);
        const sgst = parseFloat(challan.sgst_amount || 0);
        const igst = parseFloat(challan.igst_amount || 0);

        return (
            <div className="bg-white text-slate-900 border overflow-hidden">
                {/* Official Header */}
                <div className="bg-[#1c3f71] text-white p-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-1 rounded">
                            <Building2 className="h-6 w-6 text-[#1c3f71]" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold leading-tight">Goods and Services Tax</p>
                            <p className="text-[10px] opacity-80 uppercase tracking-tighter">Government of India</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] opacity-70">Form GST PMT-06</p>
                        <p className="text-xs font-bold">[See Rule 87(2)]</p>
                    </div>
                </div>

                {/* CPIN INFO */}
                <div className="p-4 grid grid-cols-2 gap-y-4 border-b bg-slate-50">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">CPIN (Common Portal ID Number)</p>
                        <p className="font-mono font-bold text-blue-800">{challan.challan_number}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Challan Date</p>
                        <p className="font-bold">{challan.challan_date}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">GSTIN</p>
                        <p className="font-bold text-slate-700">{company?.gstin}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Status</p>
                        <Badge variant={challan.status === 'PAID' ? 'default' : 'outline'} className={challan.status === 'PAID' ? 'bg-green-600' : ''}>
                            {challan.status}
                        </Badge>
                    </div>
                </div>

                {/* TAX BREAKDOWN TABLE */}
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm font-bold uppercase text-[#1c3f71]">Details of Deposit</p>
                        <Button variant="outline" size="sm" className="h-8 text-[10px]" onClick={() => window.print()}>
                            <Download className="h-3 w-3 mr-1" />
                            DOWNLOAD CHALLAN (PDF)
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-100 border text-slate-600">
                                    <th className="p-2 border text-left">Major Head</th>
                                    <th className="p-2 border text-right">Tax (₹)</th>
                                    <th className="p-2 border text-right">Interest (₹)</th>
                                    <th className="p-2 border text-right">Penalty (₹)</th>
                                    <th className="p-2 border text-right">Fees (₹)</th>
                                    <th className="p-2 border text-right">Total (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { name: 'IGST (0008)', tax: igst },
                                    { name: 'CGST (0005)', tax: cgst },
                                    { name: 'SGST (0006)', tax: sgst },
                                    { name: 'Cess (0009)', tax: 0 }
                                ].map((row) => (
                                    <tr key={row.name} className="border">
                                        <td className="p-2 border font-semibold">{row.name}</td>
                                        <td className="p-2 border text-right">{row.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-2 border text-right text-slate-400">0.00</td>
                                        <td className="p-2 border text-right text-slate-400">0.00</td>
                                        <td className="p-2 border text-right text-slate-400">0.00</td>
                                        <td className="p-2 border text-right font-bold">{row.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                                <tr className="bg-blue-50 border-t-2 border-blue-200">
                                    <td className="p-2 border font-bold text-blue-800">Total Challan Amount</td>
                                    <td colSpan={4} className="p-2 border"></td>
                                    <td className="p-2 border text-right font-bold text-blue-800 text-lg">
                                        ₹{parseFloat(challan.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-[10px] text-yellow-800 leading-relaxed italic">
                        Note: This is a system-generated simulation for educational purposes.
                        Reference Rule 87(2) of GST Rules for actual PMT-06 format.
                        In real portal, CPIN is valid for 15 days from the date of generation.
                    </div>
                </div>
            </div>
        );
    };

    // ═══════════════════════════════════════════════════════════════════════
    // 🎨 RENDER
    // ═══════════════════════════════════════════════════════════════════════

    return (
        <div className="min-h-screen bg-[#f2f2f2] -m-6 p-0 font-sans selection:bg-blue-100">
            {/* OFFICIAL TOP NAV BAR */}
            <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
                <div className="bg-[#1c3f71] px-6 py-1 text-white flex justify-between items-center text-[10px] font-medium">
                    <div className="flex gap-4">
                        <span className="cursor-pointer hover:underline text-yellow-400">Skip to Main Content</span>
                        <span className="opacity-60 cursor-not-allowed">A+</span>
                        <span className="opacity-60 cursor-not-allowed">A</span>
                        <span className="opacity-60 cursor-not-allowed">A-</span>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="opacity-70">Language: English</span>
                        <HelpCircle className="h-3 w-3" />
                    </div>
                </div>

                <div className="px-6 py-2 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#1c3f71] p-1.5 rounded flex items-center justify-center">
                            <Building2 className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-[#1c3f71] leading-none tracking-tight">nammaPortal</h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Goods and Services Tax</p>
                        </div>
                    </div>

                    {company && (
                        <nav className="hidden lg:flex items-center gap-1">
                            {['DASHBOARD', 'SERVICES', 'GST LAW', 'DOWNLOADS', 'SEARCH TAXPAYER', 'HELP'].map(link => (
                                <Button
                                    key={link}
                                    variant="ghost"
                                    onClick={() => setActiveTab(link.toLowerCase())}
                                    className={`text-xs font-bold px-4 h-10 rounded-none border-b-2 ${activeTab === link.toLowerCase() ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {link}
                                </Button>
                            ))}
                        </nav>
                    )}

                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Welcome</span>
                            <span className="text-xs font-black text-[#1c3f71]">{company ? company.company_name : 'Guest Student'}</span>
                        </div>
                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200">
                            <User className="h-5 w-5 text-slate-600" />
                        </div>
                    </div>
                </div>

                {/* SECONDARY MENU */}
                <div className="bg-[#2e5ea7] px-6 py-1 flex items-center justify-between text-white overflow-x-auto whitespace-nowrap">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-2 py-1 rounded transition-colors" onClick={() => setActiveTab('ledger')}>
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-xs font-bold">Ledgers</span>
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-2 py-1 rounded transition-colors" onClick={() => setActiveTab('return')}>
                            <FileText className="h-4 w-4" />
                            <span className="text-xs font-bold">Returns</span>
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-2 py-1 rounded transition-colors" onClick={() => setActiveTab('payment')}>
                            <CreditCard className="h-4 w-4" />
                            <span className="text-xs font-bold">Payments</span>
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-2 py-1 rounded transition-colors" onClick={() => setActiveTab('purchase')}>
                            <ShoppingCart className="h-4 w-4" />
                            <span className="text-xs font-bold">Purchases</span>
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-2 py-1 rounded transition-colors" onClick={() => setActiveTab('sales')}>
                            <Receipt className="h-4 w-4" />
                            <span className="text-xs font-bold">Sales</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold opacity-80">
                        {company && (
                            <div className="flex gap-4">
                                <span>GSTIN: {company.gstin}</span>
                                <span className="text-yellow-400">Last Login: {new Date().toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-[1400px] mx-auto">

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <AnimatePresence mode="wait">
                        {company && activeTab !== 'setup' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-1 rounded-full bg-blue-600" />
                                    <div>
                                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                                            Taxpayer Dashboard
                                        </h2>
                                        <p className="text-xs text-slate-500 font-medium">Viewing data for Financial Year {company.financial_year}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="bg-white font-bold text-xs h-9 uppercase shadow-sm">
                                        <Bell className="h-3 w-3 mr-2" /> Notifications
                                    </Button>
                                    <Button className="bg-blue-600 font-bold text-xs h-9 uppercase shadow-lg shadow-blue-200" onClick={() => setActiveTab('return')}>
                                        <FileText className="h-3 w-3 mr-2" /> File Returns
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* SETUP TAB */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    <TabsContent value="setup">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                    Mock GST Company Registration
                                </CardTitle>
                                <CardDescription>
                                    Create your simulated GST identity to start practicing
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                    <div className="text-sm text-blue-900">
                                        <p className="font-bold">Educational Simulation</p>
                                        <p>This is a mock registration. The GSTIN generated is for practice only and not valid for real GST filing.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label>Company Name *</Label>
                                        <Input
                                            placeholder="e.g., ABC Enterprises Pvt Ltd"
                                            value={setupForm.company_name}
                                            onChange={(e) => setSetupForm({ ...setupForm, company_name: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>State *</Label>
                                            <select
                                                className="w-full h-10 px-3 border rounded-md"
                                                value={setupForm.state}
                                                onChange={(e) => {
                                                    const state = INDIAN_STATES.find(s => s.name === e.target.value);
                                                    setSetupForm({
                                                        ...setupForm,
                                                        state: e.target.value,
                                                        state_code: state?.code || ''
                                                    });
                                                }}
                                            >
                                                <option value="">-- Select State --</option>
                                                {INDIAN_STATES.map(state => (
                                                    <option key={state.code} value={state.name}>{state.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <Label>Default GST Rate (%)</Label>
                                            <select
                                                className="w-full h-10 px-3 border rounded-md"
                                                value={setupForm.default_gst_rate}
                                                onChange={(e) => setSetupForm({ ...setupForm, default_gst_rate: parseInt(e.target.value) })}
                                            >
                                                {GST_RATES.map(rate => (
                                                    <option key={rate} value={rate}>{rate}%</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleCompanySetup}
                                        disabled={loading}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        size="lg"
                                    >
                                        {loading ? (
                                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Registering...</>
                                        ) : (
                                            <><CheckCircle2 className="h-4 w-4 mr-2" />Register Company</>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* DASHBOARD TAB */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    <TabsContent value="dashboard">
                        {dashboard && (
                            <div className="space-y-6">
                                {/* OFFICIAL LEDGER TILES */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Cash Ledger */}
                                    <Card className="relative overflow-hidden group border-none shadow-md">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 transition-transform group-hover:scale-105 duration-500" />
                                        <CardContent className="relative p-6 text-white">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="p-2 bg-white/20 rounded-lg text-white">
                                                    <Wallet className="h-6 w-6" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Electronic</p>
                                                    <p className="text-sm font-black italic">Cash Ledger</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm opacity-80 font-medium tracking-tight">Available Balance</p>
                                                <p className="text-4xl font-black tracking-tighter">
                                                    ₹{dashboard.balances.cash_balance.toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                            <div className="mt-8 pt-4 border-t border-white/20 flex justify-between items-center">
                                                <span className="text-[10px] font-medium opacity-60 uppercase">Updated real-time</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-[10px] font-bold bg-white/10 hover:bg-white/20 border-none px-4 rounded-full"
                                                    onClick={() => setActiveTab('ledger')}
                                                >
                                                    VIEW LEDGER
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Credit Ledger (ITC) */}
                                    <Card className="relative overflow-hidden group border-none shadow-md">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#10b981] to-[#059669] transition-transform group-hover:scale-105 duration-500" />
                                        <CardContent className="relative p-6 text-white">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="p-2 bg-white/20 rounded-lg text-white">
                                                    <TrendingDown className="h-6 w-6" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Electronic</p>
                                                    <p className="text-sm font-black italic">Credit Ledger</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm opacity-80 font-medium tracking-tight">Available ITC</p>
                                                <p className="text-4xl font-black tracking-tighter">
                                                    ₹{dashboard.balances.input_tax_credit.toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                            <div className="mt-8 pt-4 border-t border-white/20 flex justify-between items-center">
                                                <span className="text-[10px] font-medium opacity-60 uppercase tracking-wide">Input Tax Credit</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-[10px] font-bold bg-white/10 hover:bg-white/20 border-none px-4 rounded-full"
                                                    onClick={() => setActiveTab('ledger')}
                                                >
                                                    VIEW ITC
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Liability Ledger */}
                                    <Card className="relative overflow-hidden group border-none shadow-md">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#f43f5e] to-[#e11d48] transition-transform group-hover:scale-105 duration-500" />
                                        <CardContent className="relative p-6 text-white">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="p-2 bg-white/20 rounded-lg text-white">
                                                    <TrendingUp className="h-6 w-6" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Electronic</p>
                                                    <p className="text-sm font-black italic text-white">Liability Register</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm opacity-80 font-medium tracking-tight">Pending Liability</p>
                                                <p className="text-4xl font-black tracking-tighter">
                                                    ₹{dashboard.balances.output_tax_liability.toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                            <div className="mt-8 pt-4 border-t border-white/20 flex justify-between items-center text-white">
                                                <span className="text-[10px] font-medium opacity-60 uppercase tracking-widest">Output Tax Payable</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-[10px] font-bold bg-white/10 hover:bg-white/20 border-none px-4 rounded-full"
                                                    onClick={() => setActiveTab('ledger')}
                                                >
                                                    VIEW LIABILITY
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Return Filing Status Table */}
                                    <Card className="lg:col-span-2 shadow-sm border-slate-200">
                                        <CardHeader className="bg-slate-50 border-b py-4">
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-sm font-black text-[#1c3f71] uppercase tracking-wider flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" /> Return Filing Status
                                                </CardTitle>
                                                <Badge variant="outline" className="bg-white text-[10px] font-bold">FY {company.financial_year}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0 overflow-x-auto">
                                            <table className="w-full text-[11px] font-medium">
                                                <thead>
                                                    <tr className="bg-slate-100/50 border-b">
                                                        <th className="p-3 text-left font-bold text-slate-500 uppercase tracking-widest">Return Type</th>
                                                        {['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map(m => (
                                                            <th key={m} className="p-3 text-center font-bold text-slate-500 uppercase tracking-widest">{m}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="border-b group hover:bg-slate-50/50">
                                                        <td className="p-3 font-black text-[#1c3f71]">GSTR-1 (Sales)</td>
                                                        {[4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3].map((month, i) => {
                                                            const isFiled = dashboard?.returns.some((r: any) => r.return_month_index === month);
                                                            return (
                                                                <td key={i} className="p-3 text-center">
                                                                    <div className="flex justify-center">
                                                                        {isFiled || i < 3 ? (
                                                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                                        ) : (
                                                                            <X className="h-4 w-4 text-slate-300" />
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                    <tr className="group hover:bg-slate-50/50 border-b">
                                                        <td className="p-3 font-black text-[#1c3f71]">GSTR-3B (Summary)</td>
                                                        {[4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3].map((month, i) => {
                                                            const isFiled = dashboard?.returns.some((r: any) => r.return_month_index === month && r.status === 'PAID');
                                                            return (
                                                                <td key={i} className="p-3 text-center">
                                                                    <div className="flex justify-center">
                                                                        {isFiled || i < 2 ? (
                                                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                                        ) : (
                                                                            <X className="h-4 w-4 text-slate-300" />
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <div className="p-3 bg-slate-50/50 text-[10px] text-slate-500 italic border-t flex items-center gap-4">
                                                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> Filed</span>
                                                <span className="flex items-center gap-1"><X className="h-3 w-3 text-slate-300" /> Not Filed</span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Quick Actions */}
                                    <div className="space-y-4">
                                        <Card className="shadow-sm border-blue-100 overflow-hidden">
                                            <div className="h-1 bg-blue-600" />
                                            <CardHeader className="py-3">
                                                <CardTitle className="text-xs font-black uppercase tracking-widest text-[#1c3f71] opacity-60">Services & Quick Links</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-3 space-y-2">
                                                <Button variant="outline" className="w-full justify-start h-10 font-bold text-xs gap-3 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all active:scale-[0.98]" onClick={() => setActiveTab('return')}>
                                                    <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600 shadow-sm"><FileText className="h-3 w-3" /></div>
                                                    Returns Dashboard
                                                </Button>
                                                <Button variant="outline" className="w-full justify-start h-10 font-bold text-xs gap-3 border-slate-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all active:scale-[0.98]" onClick={() => setActiveTab('payment')}>
                                                    <div className="p-1.5 bg-green-100 rounded-lg text-green-600 shadow-sm"><CreditCard className="h-3 w-3" /></div>
                                                    Create Challan
                                                </Button>
                                                <Button variant="outline" className="w-full justify-start h-10 font-bold text-xs gap-3 border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-all active:scale-[0.98]" onClick={() => setActiveTab('search taxpayer')}>
                                                    <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600 shadow-sm"><Search className="h-3 w-3" /></div>
                                                    Search Taxpayer
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        <Card className="shadow-sm border-indigo-100 bg-indigo-50/30 overflow-hidden">
                                            <CardContent className="p-4 flex gap-4">
                                                <div className="p-3 bg-white rounded-xl shadow-sm self-start border border-indigo-100">
                                                    <Info className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Practice Tip</p>
                                                    <p className="text-[10px] text-indigo-700/80 font-bold leading-relaxed">
                                                        Ensure GSTR-1 is filed before paying taxes in GSTR-3B. Use Electronic Credit Ledger to offset liabilities.
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>


                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* PURCHASE TAB */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    <TabsContent value="purchase">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <Card className="xl:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Plus className="h-5 w-5 text-green-600" />
                                        Professional Purchase Bill (Tax Invoice)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Header Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border">
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-xs uppercase font-bold text-slate-500">Supplier Name *</Label>
                                                <Input
                                                    placeholder="e.g., XYZ Suppliers"
                                                    value={purchaseForm.supplier_name}
                                                    onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier_name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs uppercase font-bold text-slate-500">Supplier GSTIN (Optional)</Label>
                                                <Input
                                                    placeholder="e.g., 29ABCDE1234F1Z5"
                                                    value={purchaseForm.supplier_gstin}
                                                    onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier_gstin: e.target.value.toUpperCase() })}
                                                    maxLength={15}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label className="text-xs uppercase font-bold text-slate-500">Invoice No *</Label>
                                                    <Input
                                                        value={purchaseForm.invoice_no}
                                                        onChange={(e) => setPurchaseForm({ ...purchaseForm, invoice_no: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs uppercase font-bold text-slate-500">Invoice Date *</Label>
                                                    <Input
                                                        type="date"
                                                        value={purchaseForm.invoice_date}
                                                        onChange={(e) => setPurchaseForm({ ...purchaseForm, invoice_date: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label className="text-xs uppercase font-bold text-slate-500">GST Rate *</Label>
                                                    <select
                                                        className="w-full h-10 px-3 border rounded-md"
                                                        value={purchaseForm.gst_rate}
                                                        onChange={(e) => setPurchaseForm({ ...purchaseForm, gst_rate: parseInt(e.target.value) })}
                                                    >
                                                        {GST_RATES.map(rate => (
                                                            <option key={rate} value={rate}>{rate}% GST</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <Label className="text-xs uppercase font-bold text-slate-500">Trans. Type</Label>
                                                    <select
                                                        className="w-full h-10 px-3 border rounded-md"
                                                        value={purchaseForm.transaction_type}
                                                        onChange={(e) => setPurchaseForm({ ...purchaseForm, transaction_type: e.target.value as any })}
                                                    >
                                                        <option value="INTRA_STATE">Intra-State</option>
                                                        <option value="INTER_STATE">Inter-State</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items Table */}
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm border-collapse">
                                            <thead>
                                                <tr className="bg-slate-100 border-b">
                                                    <th className="p-2 text-left w-10">#</th>
                                                    <th className="p-2 text-left">Description of Goods/Services</th>
                                                    <th className="p-2 text-center w-24">HSN/SAC</th>
                                                    <th className="p-2 text-center w-24">Qty</th>
                                                    <th className="p-2 text-right w-32">Rate (₹)</th>
                                                    <th className="p-2 text-right w-32">Amount (₹)</th>
                                                    <th className="p-2 text-center w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {purchaseForm.items.map((item: any, idx: number) => (
                                                    <tr key={idx} className="border-b transition-colors hover:bg-slate-50/50">
                                                        <td className="p-2 text-slate-400 font-mono">{idx + 1}</td>
                                                        <td className="p-2">
                                                            <Input
                                                                className="h-8 border-transparent focus:border-slate-200 bg-transparent"
                                                                placeholder="Enter product description"
                                                                value={item.description}
                                                                onChange={(e) => updatePurchaseItem(idx, 'description', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input
                                                                className="h-8 text-center border-transparent focus:border-slate-200 bg-transparent"
                                                                placeholder="9983"
                                                                value={item.hsn}
                                                                onChange={(e) => updatePurchaseItem(idx, 'hsn', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input
                                                                type="number"
                                                                className="h-8 text-center border-transparent focus:border-slate-200 bg-transparent"
                                                                value={item.qty}
                                                                onChange={(e) => updatePurchaseItem(idx, 'qty', parseFloat(e.target.value))}
                                                            />
                                                        </td>
                                                        <td className="p-2 text-right">
                                                            <Input
                                                                type="number"
                                                                className="h-8 text-right border-transparent focus:border-slate-200 bg-transparent"
                                                                value={item.rate}
                                                                onChange={(e) => updatePurchaseItem(idx, 'rate', parseFloat(e.target.value))}
                                                            />
                                                        </td>
                                                        <td className="p-2 text-right font-semibold">
                                                            {(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            {purchaseForm.items.length > 1 && (
                                                                <button onClick={() => removePurchaseItem(idx)} className="text-red-400 hover:text-red-600">
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-slate-50">
                                                    <td colSpan={5} className="p-3">
                                                        <Button variant="outline" size="sm" onClick={addPurchaseItem} className="h-8 text-xs border-dashed">
                                                            <Plus className="h-3 w-3 mr-1" /> Add Another Item
                                                        </Button>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] uppercase text-slate-500">Total Taxable Value</p>
                                                            <p className="text-lg font-bold text-blue-800">₹{purchaseForm.taxable_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                                        </div>
                                                    </td>
                                                    <td className=""></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    <Button
                                        onClick={handleAddPurchase}
                                        disabled={loading}
                                        className="w-full bg-green-600 hover:bg-green-700 h-12 text-base font-bold"
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                                        GENERATE BILL & UPDATE ITC
                                    </Button>
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wider">
                                            <TrendingDown className="h-4 w-4 text-green-600" />
                                            Summary of ITC
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center pb-2 border-b">
                                                <span className="text-sm text-slate-500">Taxable Amount</span>
                                                <span className="font-semibold">₹{purchaseForm.taxable_amount.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-2 border-b">
                                                <span className="text-sm text-slate-500">GST ({purchaseForm.gst_rate}%)</span>
                                                <span className="font-semibold text-green-600">
                                                    + ₹{(purchaseForm.taxable_amount * purchaseForm.gst_rate / 100).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-lg">
                                                <span className="font-bold">Total Bill Value</span>
                                                <span className="font-black text-[#1c3f71]">
                                                    ₹{(purchaseForm.taxable_amount * (1 + purchaseForm.gst_rate / 100)).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wider">
                                            <Eye className="h-4 w-4" />
                                            Purchase History
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {dashboard?.recent_transactions.purchases.length > 0 ? (
                                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                                {dashboard.recent_transactions.purchases.map((purchase: any) => (
                                                    <div key={purchase.id} className="border-l-4 border-green-500 bg-white shadow-sm border rounded-r-lg p-3 text-sm">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="font-bold text-slate-700 uppercase text-xs">{purchase.supplier_name}</p>
                                                                <p className="text-[10px] text-gray-500 mt-1">{purchase.invoice_no} • {purchase.invoice_date}</p>
                                                            </div>
                                                            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                                                                ₹{parseFloat(purchase.total_amount).toLocaleString('en-IN')}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 text-center py-8">No purchases yet</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* SALES TAB */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    <TabsContent value="sales">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <Card className="xl:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Plus className="h-5 w-5 text-blue-600" />
                                        Generate Sales Tax Invoice (B2B/B2C)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Header Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border">
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-xs uppercase font-bold text-slate-500">Customer Name *</Label>
                                                <Input
                                                    placeholder="e.g., ABC Pvt Ltd"
                                                    value={salesForm.customer_name}
                                                    onChange={(e) => setSalesForm({ ...salesForm, customer_name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs uppercase font-bold text-slate-500">Customer GSTIN (Optional)</Label>
                                                <Input
                                                    placeholder="e.g., 33XYZAB5678G1Z2"
                                                    value={salesForm.customer_gstin}
                                                    onChange={(e) => setSalesForm({ ...salesForm, customer_gstin: e.target.value.toUpperCase() })}
                                                    maxLength={15}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label className="text-xs uppercase font-bold text-slate-500">Invoice No *</Label>
                                                    <Input
                                                        value={salesForm.invoice_no}
                                                        onChange={(e) => setSalesForm({ ...salesForm, invoice_no: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs uppercase font-bold text-slate-500">Invoice Date *</Label>
                                                    <Input
                                                        type="date"
                                                        value={salesForm.invoice_date}
                                                        onChange={(e) => setSalesForm({ ...salesForm, invoice_date: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label className="text-xs uppercase font-bold text-slate-500">GST Rate *</Label>
                                                    <select
                                                        className="w-full h-10 px-3 border rounded-md"
                                                        value={salesForm.gst_rate}
                                                        onChange={(e) => setSalesForm({ ...salesForm, gst_rate: parseInt(e.target.value) })}
                                                    >
                                                        {GST_RATES.map(rate => (
                                                            <option key={rate} value={rate}>{rate}% GST</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <Label className="text-xs uppercase font-bold text-slate-500">Trans. Type</Label>
                                                    <select
                                                        className="w-full h-10 px-3 border rounded-md"
                                                        value={salesForm.transaction_type}
                                                        onChange={(e) => setSalesForm({ ...salesForm, transaction_type: e.target.value as any })}
                                                    >
                                                        <option value="INTRA_STATE">Intra-State</option>
                                                        <option value="INTER_STATE">Inter-State</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items Table */}
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm border-collapse">
                                            <thead>
                                                <tr className="bg-slate-100 border-b">
                                                    <th className="p-2 text-left w-10">#</th>
                                                    <th className="p-2 text-left">Description of Goods/Services</th>
                                                    <th className="p-2 text-center w-24">HSN/SAC</th>
                                                    <th className="p-2 text-center w-24">Qty</th>
                                                    <th className="p-2 text-right w-32">Rate (₹)</th>
                                                    <th className="p-2 text-right w-32">Amount (₹)</th>
                                                    <th className="p-2 text-center w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {salesForm.items.map((item: any, idx: number) => (
                                                    <tr key={idx} className="border-b transition-colors hover:bg-slate-50/50">
                                                        <td className="p-2 text-slate-400 font-mono">{idx + 1}</td>
                                                        <td className="p-2">
                                                            <Input
                                                                className="h-8 border-transparent focus:border-slate-200 bg-transparent"
                                                                placeholder="Enter product description"
                                                                value={item.description}
                                                                onChange={(e) => updateSalesItem(idx, 'description', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input
                                                                className="h-8 text-center border-transparent focus:border-slate-200 bg-transparent"
                                                                placeholder="9983"
                                                                value={item.hsn}
                                                                onChange={(e) => updateSalesItem(idx, 'hsn', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input
                                                                type="number"
                                                                className="h-8 text-center border-transparent focus:border-slate-200 bg-transparent"
                                                                value={item.qty}
                                                                onChange={(e) => updateSalesItem(idx, 'qty', parseFloat(e.target.value))}
                                                            />
                                                        </td>
                                                        <td className="p-2 text-right">
                                                            <Input
                                                                type="number"
                                                                className="h-8 text-right border-transparent focus:border-slate-200 bg-transparent"
                                                                value={item.rate}
                                                                onChange={(e) => updateSalesItem(idx, 'rate', parseFloat(e.target.value))}
                                                            />
                                                        </td>
                                                        <td className="p-2 text-right font-semibold">
                                                            {(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            {salesForm.items.length > 1 && (
                                                                <button onClick={() => removeSalesItem(idx)} className="text-red-400 hover:text-red-600">
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-slate-50">
                                                    <td colSpan={5} className="p-3">
                                                        <Button variant="outline" size="sm" onClick={addSalesItem} className="h-8 text-xs border-dashed">
                                                            <Plus className="h-3 w-3 mr-1" /> Add Another Item
                                                        </Button>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] uppercase text-slate-500">Sub-Total Taxable Value</p>
                                                            <p className="text-lg font-bold text-blue-800">₹{salesForm.taxable_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                                        </div>
                                                    </td>
                                                    <td className=""></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    <Button
                                        onClick={handleAddSales}
                                        disabled={loading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-bold"
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                                        GENERATE INVOICE & UPDATE LIABILITY
                                    </Button>
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wider">
                                            <TrendingUp className="h-4 w-4 text-blue-600" />
                                            Invoice Tax Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center pb-2 border-b">
                                                <span className="text-sm text-slate-500">Taxable Net Amount</span>
                                                <span className="font-semibold">₹{salesForm.taxable_amount.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-2 border-b">
                                                <span className="text-sm text-slate-500">GST ({salesForm.gst_rate}%)</span>
                                                <span className="font-semibold text-red-600">
                                                    + ₹{(salesForm.taxable_amount * salesForm.gst_rate / 100).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-lg">
                                                <span className="font-bold">Gross Invoice Total</span>
                                                <span className="font-black text-[#1c3f71]">
                                                    ₹{(salesForm.taxable_amount * (1 + salesForm.gst_rate / 100)).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wider">
                                            <Eye className="h-4 w-4" />
                                            Sales History
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {dashboard?.recent_transactions.sales.length > 0 ? (
                                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                                {dashboard.recent_transactions.sales.map((sale: any) => (
                                                    <div key={sale.id} className="border-l-4 border-blue-500 bg-white shadow-sm border rounded-r-lg p-3 text-sm">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="font-bold text-slate-700 uppercase text-xs">{sale.customer_name}</p>
                                                                <p className="text-[10px] text-gray-500 mt-1">{sale.invoice_no} • {sale.invoice_date}</p>
                                                            </div>
                                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                ₹{parseFloat(sale.total_amount).toLocaleString('en-IN')}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 text-center py-8">No sales yet</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* LEDGER TAB */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    <TabsContent value="ledger">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="border-2 border-green-500">
                                <CardHeader className="bg-green-50">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <TrendingDown className="h-4 w-4 text-green-600" />
                                        Electronic Credit Ledger (ITC)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="text-center mb-4">
                                        <p className="text-xs text-gray-500">Available Balance</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            ₹{dashboard?.balances.input_tax_credit.toLocaleString('en-IN') || '0'}
                                        </p>
                                    </div>
                                    <div className="text-xs text-gray-500 space-y-1">
                                        <p>• Input GST from purchases</p>
                                        <p>• Can be used to offset Output GST</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-red-500">
                                <CardHeader className="bg-red-50">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-red-600" />
                                        Electronic Liability Ledger
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="text-center mb-4">
                                        <p className="text-xs text-gray-500">Total Liability</p>
                                        <p className="text-3xl font-bold text-red-600">
                                            ₹{dashboard?.balances.output_tax_liability.toLocaleString('en-IN') || '0'}
                                        </p>
                                    </div>
                                    <div className="text-xs text-gray-500 space-y-1">
                                        <p>• Output GST from sales</p>
                                        <p>• To be paid to government</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-blue-500">
                                <CardHeader className="bg-blue-50">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Wallet className="h-4 w-4 text-blue-600" />
                                        Electronic Cash Ledger
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="text-center mb-4">
                                        <p className="text-xs text-gray-500">Payments Made</p>
                                        <p className="text-3xl font-bold text-blue-600">
                                            ₹{dashboard?.balances.cash_balance.toLocaleString('en-IN') || '0'}
                                        </p>
                                    </div>
                                    <div className="text-xs text-gray-500 space-y-1">
                                        <p>• Tax payments via challan</p>
                                        <p>• Simulated transactions</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* RETURN TAB */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    <TabsContent value="return">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-purple-600" />
                                        Generate Monthly Return
                                    </CardTitle>
                                    <CardDescription>GSTR-3B Style Summary</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Month</Label>
                                            <select
                                                className="w-full h-10 px-3 border rounded-md"
                                                value={returnForm.month}
                                                onChange={(e) => setReturnForm({ ...returnForm, month: parseInt(e.target.value) })}
                                            >
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                                    <option key={month} value={month}>
                                                        {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <Label>Year</Label>
                                            <Input
                                                type="number"
                                                value={returnForm.year}
                                                onChange={(e) => setReturnForm({ ...returnForm, year: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleGenerateReturn}
                                        disabled={loading}
                                        className="w-full bg-purple-600 hover:bg-purple-700"
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                                        Generate Return
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Filed Returns
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {dashboard?.returns.length > 0 ? (
                                        <div className="space-y-3">
                                            {dashboard.returns.map((ret: any) => (
                                                <div key={ret.id} className="border rounded-lg p-3 text-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="font-bold">{ret.return_month}</p>
                                                            <p className="text-xs text-gray-500">{ret.filing_period}</p>
                                                        </div>
                                                        <Badge variant={ret.status === 'PAID' ? 'default' : ret.status === 'FILED' ? 'secondary' : 'outline'}>
                                                            {ret.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        <div>
                                                            <p className="text-gray-500">Output GST</p>
                                                            <p className="font-bold">₹{parseFloat(ret.output_gst_total).toLocaleString('en-IN')}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Input GST</p>
                                                            <p className="font-bold">₹{parseFloat(ret.input_gst_total).toLocaleString('en-IN')}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-gray-500">Net Payable</p>
                                                            <p className="font-bold text-red-600">₹{parseFloat(ret.net_tax_payable).toLocaleString('en-IN')}</p>
                                                        </div>
                                                    </div>
                                                    {ret.status === 'DRAFT' && (
                                                        <Button
                                                            size="sm"
                                                            className="w-full mt-3"
                                                            onClick={() => handleFileReturn(ret.id)}
                                                        >
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            File Return
                                                        </Button>
                                                    )}
                                                    {ret.status === 'FILED' && parseFloat(ret.net_tax_payable) > 0 && (
                                                        <Button
                                                            size="sm"
                                                            className="w-full mt-3 bg-orange-600 hover:bg-orange-700"
                                                            onClick={() => handleGenerateChallan(ret.id)}
                                                        >
                                                            <CreditCard className="h-3 w-3 mr-1" />
                                                            Generate Challan
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-8">No returns generated yet</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* PAYMENT TAB */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    <TabsContent value="payment">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-orange-600" />
                                        Pending Challans
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {dashboard?.challans.filter((c: any) => c.status === 'GENERATED').length > 0 ? (
                                        <div className="space-y-3">
                                            {dashboard.challans.filter((c: any) => c.status === 'GENERATED').map((challan: any) => (
                                                <div key={challan.id} className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <p className="font-bold text-sm">Challan {challan.challan_number}</p>
                                                            <p className="text-xs text-gray-500">{challan.challan_date}</p>
                                                        </div>
                                                        <Badge className="bg-orange-600">PENDING</Badge>
                                                    </div>
                                                    <div className="mb-3">
                                                        <p className="text-xs text-gray-500">Amount Payable</p>
                                                        <p className="text-2xl font-bold text-orange-600">
                                                            ₹{parseFloat(challan.total_amount).toLocaleString('en-IN')}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                                                            onClick={() => handleMakePayment(challan.id)}
                                                            disabled={loading}
                                                        >
                                                            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <DollarSign className="h-4 w-4 mr-2" />}
                                                            Pay Now (Simulated)
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="border-orange-600 text-orange-600 hover:bg-orange-50"
                                                            onClick={() => handleViewChallan(challan)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-8">No pending payments</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        Payment History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {dashboard?.payments.length > 0 ? (
                                        <div className="space-y-3">
                                            {dashboard.payments.map((payment: any) => (
                                                <div key={payment.id} className="border rounded-lg p-3 text-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="font-bold">₹{parseFloat(payment.payment_amount).toLocaleString('en-IN')}</p>
                                                            <p className="text-xs text-gray-500">{payment.payment_date}</p>
                                                        </div>
                                                        <Badge variant="default" className="bg-green-600">PAID</Badge>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        <p>TXN: {payment.transaction_id}</p>
                                                        <p>Challan: {payment.challan?.challan_number}</p>
                                                    </div>
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="p-0 h-auto text-blue-600 text-xs mt-2"
                                                        onClick={() => handleViewChallan(payment.challan)}
                                                    >
                                                        View Paid Challan
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-8">No payments made yet</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* OTHER PORTAL TABS (PLACEHOLDERS) */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    <TabsContent value="services">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-2">
                            {[
                                { title: 'Registration', icon: <Plus className="h-5 w-5" />, items: ['New Registration', 'Track Application Status', 'Amendment of Registration Non-Core Fields'], color: 'blue' },
                                { title: 'Ledgers', icon: <Wallet className="h-5 w-5" />, items: ['Electronic Cash Ledger', 'Electronic Credit Ledger', 'Electronic Liability Register'], tab: 'ledger', color: 'green' },
                                { title: 'Returns', icon: <FileText className="h-5 w-5" />, items: ['Returns Dashboard', 'Track Return Status', 'ITC Forms', 'Transition Forms'], tab: 'return', color: 'indigo' },
                                { title: 'Payments', icon: <CreditCard className="h-5 w-5" />, items: ['Create Challan', 'Track Payment Status', 'Payment to Unregistered Dealer'], tab: 'payment', color: 'orange' },
                                { title: 'User Services', icon: <User className="h-5 w-5" />, items: ['My Saved Applications', 'View Notices and Orders', 'Feedback', 'Search HSN Code'], color: 'slate' },
                                { title: 'Refunds', icon: <TrendingDown className="h-5 w-5" />, items: ['Application for Refund', 'Track Application Status', 'Saved Applications'], color: 'rose' }
                            ].map((service, idx) => (
                                <Card
                                    key={idx}
                                    className="hover:shadow-lg transition-all border-none shadow-sm group cursor-pointer overflow-hidden border-2 border-transparent hover:border-blue-200"
                                    onClick={() => {
                                        if (service.tab) {
                                            setActiveTab(service.tab);
                                            toast.info(`Redirecting to ${service.title}...`);
                                        } else {
                                            toast.info(`${service.title} module is simulated for training.`);
                                        }
                                    }}
                                >
                                    <CardHeader className={`bg-${service.color}-50 border-b border-${service.color}-100 p-4 group-hover:bg-${service.color}-100 transition-colors`}>
                                        <CardTitle className={`text-sm flex items-center gap-3 text-${service.color}-700 uppercase tracking-wider font-black`}>
                                            <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                                                {service.icon}
                                            </div>
                                            {service.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 bg-white">
                                        <ul className="space-y-3">
                                            {service.items.map((item, i) => (
                                                <li
                                                    key={i}
                                                    className="flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-blue-600 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toast.info(`Opening ${item}...`);
                                                        if (item === 'Electronic Cash Ledger') setActiveTab('ledger');
                                                        if (item === 'Returns Dashboard') setActiveTab('return');
                                                        if (item === 'Create Challan') setActiveTab('payment');
                                                    }}
                                                >
                                                    <div className="h-1.5 w-1.5 bg-slate-300 rounded-full group-hover:bg-blue-400" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                        {service.tab && (
                                            <div className="mt-4 pt-3 border-t flex justify-end">
                                                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50">
                                                    Open Service →
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="gst law">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <Card className="lg:col-span-1 border-none shadow-sm h-fit">
                                <CardHeader className="bg-slate-50 border-b">
                                    <CardTitle className="text-xs font-black uppercase text-slate-700">Legal Contents</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {['Acts', 'Rules', 'Notifications', 'Circulars', 'Orders', 'Conceptual Videos'].map((item, i) => (
                                        <div
                                            key={i}
                                            className="p-3 border-b text-[11px] font-bold text-slate-600 hover:bg-blue-50 cursor-pointer flex justify-between items-center group transition-colors"
                                            onClick={() => toast.info(`Viewing ${item} library...`)}
                                        >
                                            {item}
                                            <ChevronDown className="h-3 w-3 -rotate-90 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            <Card className="lg:col-span-3 border-none shadow-sm">
                                <CardHeader className="border-b flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm font-black text-[#1c3f71] uppercase tracking-wider">Acts and Rules</CardTitle>
                                        <CardDescription className="text-[10px]">Reference material for GST compliances</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase">View Latest Updates</Button>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { title: 'Central Goods and Services Tax Act, 2017', desc: 'The principal act for CGST levy and collection.' },
                                            { title: 'Integrated Goods and Services Tax Act, 2017', desc: 'Act for interstate supply and IGST administration.' },
                                            { title: 'Union Territory Goods and Services Tax Act, 2017', desc: 'UTGST levy and collection in Union Territories.' },
                                            { title: 'GST (Compensation to States) Act, 2017', desc: 'Provisions for compensation to states for revenue loss.' },
                                            { title: 'CGST Rules, 2017', desc: 'Rules for registration, returns, and valuation.' },
                                            { title: 'IGST Rules, 2017', desc: 'Rules for determining place of supply and IGST application.' }
                                        ].map((act, i) => (
                                            <div
                                                key={i}
                                                className="p-4 rounded-lg bg-slate-50 border-2 border-transparent hover:border-blue-200 transition-all group cursor-pointer"
                                                onClick={() => toast.success(`Downloading ${act.title.split(',')[0]} (PDF)...`)}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <FileText className="h-5 w-5 text-blue-600" />
                                                    <Badge variant="outline" className="text-[8px] uppercase">PDF</Badge>
                                                </div>
                                                <h4 className="text-[11px] font-black group-hover:text-blue-700 leading-snug">{act.title}</h4>
                                                <p className="text-[10px] text-slate-500 mt-1">{act.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="downloads">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'Offline Tools', icon: <Settings className="h-6 w-6" />, items: ['GSTR-1 Offline Tool', 'GSTR-3B Offline Tool', 'ITC-04 Offline Tool', 'GSTR-4 Offline Tool (Annual)'] },
                                { title: 'GST Statistics', icon: <TrendingUp className="h-6 w-6" />, items: ['Registration Trends', 'Revenue Trends', 'Returns Filing Percentage', 'Sectoral Analysis'] },
                                { title: 'Training Materials', icon: <HelpCircle className="h-6 w-6" />, items: ['User Manuals', 'FAQs', 'CBTs (Computer Based Trainings)', 'Webinars'] }
                            ].map((sec, i) => (
                                <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader className="bg-slate-50 border-b p-4">
                                        <CardTitle className="text-xs font-black uppercase flex items-center gap-3 text-slate-700">
                                            {sec.icon}
                                            {sec.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="space-y-2">
                                            {sec.items.map((item, j) => (
                                                <div
                                                    key={j}
                                                    className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer group transition-colors"
                                                    onClick={() => toast.success(`Starting download: ${item}.zip`)}
                                                >
                                                    <span className="text-[11px] font-bold text-slate-600 group-hover:text-blue-600">{item}</span>
                                                    <Download className="h-3 w-3 text-slate-400 group-hover:text-blue-500 group-hover:translate-y-0.5 transition-transform" />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="search taxpayer">
                        <div className="max-w-4xl mx-auto space-y-6">
                            <Card className="border-none shadow-md overflow-hidden">
                                <CardHeader className="bg-[#1c3f71] text-white p-6">
                                    <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                                        <Search className="h-6 w-6 text-yellow-400" />
                                        Search Taxpayer by GSTIN/UIN
                                    </CardTitle>
                                    <CardDescription className="text-blue-100 font-medium">
                                        Enter the GSTIN of the taxpayer you want to verify
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 bg-white">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">GSTIN / UIN of Taxpayer</Label>
                                            <Input
                                                placeholder="e.g. 33ABCDE1234F1Z5"
                                                className="h-12 border-2 text-lg font-mono focus-visible:ring-[#1c3f71]"
                                                id="search-gstin"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <Button
                                                className="h-12 px-10 bg-[#1c3f71] hover:bg-blue-900 font-black uppercase tracking-widest shadow-lg shadow-blue-100"
                                                onClick={() => {
                                                    const gstin = (document.getElementById('search-gstin') as HTMLInputElement).value;
                                                    if (!gstin) {
                                                        toast.error('Please enter a GSTIN');
                                                        return;
                                                    }
                                                    toast.success('Taxpayer details fetched from GSTN!');
                                                    // In a real app, this would set a state to show results
                                                }}
                                            >
                                                SEARCH
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                        <p className="text-[11px] text-slate-500 font-bold flex items-center gap-2">
                                            <Info className="h-4 w-4 text-blue-500" />
                                            Note: Searching for your own GSTIN ({company?.gstin}) will show your registered profile.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { title: 'Search by PAN', desc: 'Find all GST registrations linked to a specific PAN' },
                                    { title: 'Search Composition', desc: 'Verify if a taxpayer is registered under Composition Scheme' },
                                    { title: 'Search Temporary ID', desc: 'Verify taxpayers using their Temporary Identification Number' }
                                ].map((box, i) => (
                                    <Card
                                        key={i}
                                        className="hover:border-blue-400 cursor-pointer transition-colors border-2 border-slate-100 shadow-sm group"
                                        onClick={() => toast.info(`Initializing ${box.title} Search...`)}
                                    >
                                        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                            <div className="p-2 bg-blue-50 rounded-full group-hover:scale-110 transition-transform">
                                                <Search className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <h4 className="text-xs font-black text-[#1c3f71] uppercase">{box.title}</h4>
                                            <p className="text-[10px] text-slate-500 leading-tight">{box.desc}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="help">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border-none shadow-sm overflow-hidden">
                                    <CardHeader className="bg-blue-600 text-white">
                                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                            <HelpCircle className="h-5 w-5" />
                                            Grievance Redressal Portal
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
                                            Lodge your complaints and track their status. This portal is designed to provide a quick resolution to your issues related to GST registration, payments, and returns.
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button variant="outline" className="text-[10px] font-black uppercase text-blue-600 border-blue-200" onClick={() => toast.success("Grievance form opened.")}>Lodge Grievance</Button>
                                            <Button variant="outline" className="text-[10px] font-black uppercase text-blue-600 border-blue-200" onClick={() => toast.info("No active grievances found.")}>Track Status</Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-sm overflow-hidden">
                                    <CardHeader className="bg-indigo-600 text-white">
                                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                            <Info className="h-5 w-5" />
                                            Help & Taxpayer Facilities
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
                                            Access a wide range of facilities including search for GST practitioners, verify E-way bill, and check GST rate finder.
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button variant="outline" className="text-[10px] font-black uppercase text-indigo-600 border-indigo-200">GST Practitioner</Button>
                                            <Button variant="outline" className="text-[10px] font-black uppercase text-indigo-600 border-indigo-200">Rate Finder</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="border-none shadow-sm">
                                <CardHeader className="border-b">
                                    <CardTitle className="text-sm font-black text-[#1c3f71] uppercase tracking-wider">Frequently Asked Questions (FAQs)</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {[
                                        'How can I track my return filing status?',
                                        'What should I do if my payment is debited but not updated in cash ledger?',
                                        'How to claim Input Tax Credit (ITC) for previous months?',
                                        'Process for cancellation of registration by taxpayer',
                                        'How to file GSTR-1 for zero-rated supplies?'
                                    ].map((q, i) => (
                                        <div key={i} className="p-4 border-b last:border-0 hover:bg-slate-50 cursor-pointer flex justify-between items-center group transition-colors" onClick={() => toast.info("FAQ article content coming soon...")}>
                                            <span className="text-[11px] font-bold text-slate-600 group-hover:text-blue-600">{q}</span>
                                            <ChevronDown className="h-4 w-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-y-0.5 transition-transform" />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            {/* Realistic Challan Viewer Modal */}
            <Dialog open={isChallanOpen} onOpenChange={setIsChallanOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden border-0">
                    {renderChallanPortal(selectedChallan)}
                    <div className="p-4 bg-slate-100 flex justify-end gap-2 text-white">
                        <Button variant="outline" onClick={() => setIsChallanOpen(false)} className="text-slate-700">Close View</Button>
                        {selectedChallan?.status === 'GENERATED' && (
                            <Button className="bg-[#1c3f71] hover:bg-blue-900" onClick={() => {
                                setIsChallanOpen(false);
                                handleMakePayment(selectedChallan.id);
                            }}>
                                Proceed to Payment
                            </Button>
                        )}
                        {selectedChallan?.status === 'PAID' && (
                            <Button variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Payment Successful
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
