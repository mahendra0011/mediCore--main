import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Calendar, TrendingUp, CreditCard, User, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const statusColors = { Paid: 'bg-success/10 text-success', Pending: 'bg-warning/10 text-warning', Overdue: 'bg-destructive/10 text-destructive' };

export default function DoctorEarnings() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState({ total: 0, paid: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getBilling();
        const billsArray = data?.bills || data || [];
        // Filter bills for this doctor
        const myBills = billsArray.filter(b => 
          b.doctor?.toLowerCase().includes(user?.name?.toLowerCase()) ||
          b.doctorId?.name?.toLowerCase().includes(user?.name?.toLowerCase())
        );
        setBills(myBills);
        
        // Calculate summary
        const total = myBills.reduce((s, b) => s + (b.amount || 0), 0);
        const paid = myBills.reduce((s, b) => s + (b.paid || 0), 0);
        setSummary({ total, paid });
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [user?.name]);

  const totalEarned = summary.paid;
  const totalBilled = summary.total;
  const pending = totalBilled - totalEarned;

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">My Earnings</h1>
        <p className="text-muted-foreground">Track your consultation earnings</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border/60 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">Earned</p>
          </div>
          <p className="font-heading text-2xl font-bold text-success">Rs {totalEarned.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/60 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Total Billed</p>
          </div>
          <p className="font-heading text-2xl font-bold text-foreground">Rs {totalBilled.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/60 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-warning" />
            </div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <p className="font-heading text-2xl font-bold text-warning">Rs {pending.toLocaleString()}</p>
        </div>
      </div>

      {/* Invoice List */}
      {bills.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-dashed">
          <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No billing records found</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Invoice</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Patient</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Service</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Paid</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(bill => (
                  <tr key={bill._id} className="border-b border-border/30 hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-mono">{bill.invoiceId}</td>
                    <td className="px-4 py-3 text-sm">{bill.patient}</td>
                    <td className="px-4 py-3 text-sm">{bill.service}</td>
                    <td className="px-4 py-3 text-sm font-semibold">Rs {bill.amount}</td>
                    <td className="px-4 py-3 text-sm text-success font-semibold">Rs {bill.paid}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[bill.status] || 'bg-muted text-muted-foreground'}`}>{bill.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}