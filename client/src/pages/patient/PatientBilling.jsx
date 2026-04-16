import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Search, Calendar, CheckCircle, AlertCircle, XCircle, IndianRupee, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const statusColors = { Paid: 'bg-success/10 text-success', Pending: 'bg-warning/10 text-warning', Overdue: 'bg-destructive/10 text-destructive', Partial: 'bg-info/10 text-info' };

export default function PatientBilling() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState({ total: 0, paid: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadBilling = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/billing`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.bills) {
        setBills(data.bills);
        setSummary(data.summary || { total: 0, paid: 0 });
      }
    } catch (error) {
      console.error('Error fetching billing:', error);
    }
    setLoading(false);
  };

  const handlePayBill = async (billId) => {
    try {
      await fetch(`${API_URL}/billing/${billId}/pay`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ paymentMethod: 'card' })
      });
      loadBilling();
    } catch (error) {
      console.error('Error paying bill:', error);
    }
  };

  useEffect(() => { loadBilling(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">My Billing</h1>
        <p className="text-muted-foreground">View invoices and payment history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border/60 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><IndianRupee className="w-5 h-5 text-primary" /></div>
            <p className="text-sm text-muted-foreground">Total Billed</p>
          </div>
          <p className="font-heading text-2xl font-bold text-foreground">${summary.total.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/60 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-success" /></div>
            <p className="text-sm text-muted-foreground">Paid</p>
          </div>
          <p className="font-heading text-2xl font-bold text-success">${summary.paid.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/60 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-warning" /></div>
            <p className="text-sm text-muted-foreground">Outstanding</p>
          </div>
          <p className="font-heading text-2xl font-bold text-warning">${(summary.total - summary.paid).toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices..." className="pl-10" />
      </div>

      {/* Bills */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : bills.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No billing records found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bills.map((bill, i) => (
            <motion.div key={bill._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl border border-border/60 p-5 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-mono text-muted-foreground">{bill.invoiceId}</p>
                  <h3 className="font-heading font-semibold text-foreground">{bill.service}</h3>
                  <p className="text-sm text-primary">{bill.doctor}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[bill.status]}`}>{bill.status}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-heading text-lg font-bold text-foreground">${bill.amount}</p>
                </div>
                {bill.status !== 'Paid' && (
                  <Button size="sm" onClick={() => handlePayBill(bill._id)}>Pay Now</Button>
                )}
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="font-heading text-lg font-bold text-success">${bill.paid}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" /><span>Due: {bill.dueDate}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}