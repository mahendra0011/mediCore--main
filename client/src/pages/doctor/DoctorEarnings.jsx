import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Calendar, TrendingUp, CreditCard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import StatCard from '@/components/StatCard';

export default function DoctorEarnings() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getBilling();
        setBills(data.bills.filter(b => b.doctor === user?.name));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const totalEarned = bills.reduce((s, b) => s + (b.paid || 0), 0);
  const totalBilled = bills.reduce((s, b) => s + (b.amount || 0), 0);
  const pending = totalBilled - totalEarned;

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">My Earnings</h1>
        <p className="text-muted-foreground">Track your consultation earnings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Earned" value={`$${totalEarned.toLocaleString()}`} icon={IndianRupee} change="From paid invoices" />
        <StatCard title="Total Billed" value={`$${totalBilled.toLocaleString()}`} icon={CreditCard} change={`${bills.length} invoices`} />
        <StatCard title="Pending" value={`$${pending.toLocaleString()}`} icon={TrendingUp} change="Outstanding amount" />
      </div>

      {/* Invoice List */}
      {bills.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No billing records found</div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/60">
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
                    <td className="px-4 py-3 text-sm font-semibold">${bill.amount}</td>
                    <td className="px-4 py-3 text-sm text-success font-semibold">${bill.paid}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${bill.status === 'Paid' ? 'bg-success/10 text-success' : bill.status === 'Pending' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>{bill.status}</span>
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