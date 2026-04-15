import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, User, CheckCircle, XCircle, AlertCircle, Star, TrendingUp, DollarSign, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import StatCard from '@/components/StatCard';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [a, r] = await Promise.all([
          api.getAppointments({ doctor: user?.name }),
          api.getReviews(),
        ]);
        setAppointments(a);
        setReviews(r.filter(rv => rv.doctorName === user?.name));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today);
  const pendingAppts = appointments.filter(a => a.status === 'Pending');
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 'N/A';

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Doctor Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Appointments" value={todayAppts.length} icon={CalendarDays} change="Scheduled for today" />
        <StatCard title="Pending Requests" value={pendingAppts.length} icon={AlertCircle} change="Awaiting response" />
        <StatCard title="Total Appointments" value={appointments.length} icon={Stethoscope} change="All time" />
        <StatCard title="Average Rating" value={avgRating} icon={Star} change={`${reviews.length} reviews`} />
      </div>

      {/* Today's Schedule */}
      <div className="bg-card rounded-2xl border border-border/60 p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Today's Schedule</h2>
        {todayAppts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No appointments scheduled for today</p>
        ) : (
          <div className="space-y-3">
            {todayAppts.map(apt => (
              <div key={apt._id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{apt.patient}</p>
                    <p className="text-xs text-muted-foreground">{apt.type} - {apt.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{apt.time}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${apt.status === 'Confirmed' ? 'bg-success/10 text-success' : apt.status === 'Pending' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>{apt.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Reviews */}
      <div className="bg-card rounded-2xl border border-border/60 p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Recent Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm">No reviews yet</p>
        ) : (
          <div className="space-y-3">
            {reviews.slice(0, 3).map(rv => (
              <div key={rv._id} className="p-3 bg-muted/30 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-foreground text-sm">{rv.patientName}</p>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= rv.rating ? 'text-warning fill-warning' : 'text-muted'}`} />)}
                  </div>
                </div>
                {rv.comment && <p className="text-xs text-muted-foreground">{rv.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
