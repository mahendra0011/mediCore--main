import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, CalendarDays, Clock, UserRound, Stethoscope, X, Trash2, Calendar, CheckCircle, XCircle, AlertCircle, Phone, MessageSquare, ArrowRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

const statusConfig = {
  Confirmed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', icon: CheckCircle, label: 'Confirmed' },
  Pending: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', icon: AlertCircle, label: 'Pending' },
  Cancelled: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20', icon: XCircle, label: 'Cancelled' },
  Completed: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20', icon: CheckCircle, label: 'Completed' },
};

const STATUSES = ['All', 'Confirmed', 'Pending', 'Cancelled', 'Completed'];
const TYPES = ['Consultation', 'Follow-up', 'Check-up', 'Emergency'];
const DEPARTMENTS = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Oncology', 'General Medicine', 'ENT'];
const TIME_SLOTS = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'];

const empty = { patient: '', doctor: '', department: 'Cardiology', date: '', time: '', type: 'Consultation', status: 'Pending', notes: '' };

const statusIcons = {
  Confirmed: Calendar,
  Pending: Clock,
  Cancelled: XCircle,
  Completed: Activity,
};

export default function Appointments() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('All');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [selectedTime, setSelectedTime] = useState('');

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', statusFilter],
    queryFn: () => api.getAppointments(statusFilter !== 'All' ? { status: statusFilter } : {}),
  });

  const createMut = useMutation({ mutationFn: api.createAppointment, onSuccess: () => { qc.invalidateQueries(['appointments']); setModal(false); setForm(empty); setSelectedTime(''); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => api.updateAppointment(id, data), onSuccess: () => qc.invalidateQueries(['appointments']) });
  const deleteMut = useMutation({ mutationFn: api.deleteAppointment, onSuccess: () => qc.invalidateQueries(['appointments']) });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = (e) => { e.preventDefault(); createMut.mutate({ ...form, time: selectedTime || form.time }); };

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'Confirmed').length,
    pending: appointments.filter(a => a.status === 'Pending').length,
    completed: appointments.filter(a => a.status === 'Completed').length,
  };

  const filterOptions = [
    { value: 'All', label: 'All', icon: CalendarDays },
    { value: 'Confirmed', label: 'Confirmed', icon: CheckCircle },
    { value: 'Pending', label: 'Pending', icon: AlertCircle },
    { value: 'Cancelled', label: 'Cancelled', icon: XCircle },
    { value: 'Completed', label: 'Completed', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage and schedule patient appointments</p>
        </div>
        <Button className="gap-2" onClick={() => setModal(true)}>
          <Plus className="w-4 h-4" /> New Appointment
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: CalendarDays, color: 'from-slate-500 to-slate-600' },
          { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'from-emerald-500 to-teal-500' },
          { label: 'Pending', value: stats.pending, icon: AlertCircle, color: 'from-amber-500 to-orange-500' },
          { label: 'Completed', value: stats.completed, icon: Activity, color: 'from-blue-500 to-cyan-500' },
        ].map((stat, i) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border/60 p-4 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Filter Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border/60 p-1.5 flex gap-1 overflow-x-auto">
        {filterOptions.map(opt => (
          <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap 
              ${statusFilter === opt.value ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>
            <opt.icon className="w-4 h-4" /> {opt.label}
          </button>
        ))}
      </motion.div>

      {/* Appointments Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-card rounded-2xl border border-border/60 p-5 animate-pulse h-52" />)}
        </div>
      ) : appointments.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-border/60 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-xl font-semibold text-foreground mb-2">No Appointments</h3>
          <p className="text-muted-foreground">No appointments found for {statusFilter.toLowerCase()} status</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((apt, i) => {
            const status = statusConfig[apt.status] || statusConfig.Pending;
            const StatusIcon = status.icon;
            
            return (
              <motion.div key={apt._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border/60 overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all group">
                {/* Status bar */}
                <div className={`h-1.5 bg-gradient-to-r ${apt.status === 'Confirmed' ? 'from-emerald-500 to-teal-500' : apt.status === 'Pending' ? 'from-amber-500 to-orange-500' : apt.status === 'Cancelled' ? 'from-red-500 to-rose-500' : 'from-blue-500 to-cyan-500'}`} />
                
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                        <StatusIcon className="w-3.5 h-3.5" /> {status.label}
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">{apt.type}</span>
                    </div>
                    <button onClick={() => { if (confirm('Delete this appointment?')) deleteMut.mutate(apt._id); }}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Patient Info */}
                  <div className="flex items-center gap-3 mb-3 p-3 bg-muted/30 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                      <UserRound className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{apt.patient}</p>
                      <p className="text-xs text-muted-foreground">Patient</p>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-muted/30 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-info to-cyan-500 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{apt.doctor}</p>
                      <p className="text-xs text-muted-foreground">{apt.department}</p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-muted/40 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <CalendarDays className="w-4 h-4" />
                        <span className="text-xs">Date</span>
                      </div>
                      <p className="font-semibold text-foreground text-sm">{apt.date}</p>
                    </div>
                    <div className="bg-muted/40 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">Time</span>
                      </div>
                      <p className="font-semibold text-foreground text-sm">{apt.time}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {apt.notes && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 mb-4">
                      <p className="text-xs text-amber-700 flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        {apt.notes}
                      </p>
                    </div>
                  )}

                  {/* Quick Status Update */}
                  <div className="pt-3 border-t border-border/30">
                    <p className="text-xs text-muted-foreground mb-2">Quick Actions</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {['Confirmed', 'Pending', 'Cancelled', 'Completed'].filter(s => s !== apt.status).map(s => (
                        <button key={s} onClick={() => updateMut.mutate({ id: apt._id, data: { status: s } })}
                          className="text-[10px] px-2.5 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1">
                          {s} <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* New Appointment Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground">New Appointment</h2>
                <p className="text-sm text-muted-foreground">Schedule a new patient appointment</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <form onSubmit={submit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Patient Name</label>
                  <Input value={form.patient} onChange={e => set('patient', e.target.value)} placeholder="Enter patient name" className="h-11" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Doctor Name</label>
                  <Input value={form.doctor} onChange={e => set('doctor', e.target.value)} placeholder="Dr. Name" className="h-11" required />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Department</label>
                  <select value={form.department} onChange={e => set('department', e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-border bg-background text-foreground text-sm">
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Appointment Type</label>
                  <select value={form.type} onChange={e => set('type', e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-border bg-background text-foreground text-sm">
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Date</label>
                  <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="h-11" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Time Slot</label>
                  <div className="grid grid-cols-4 gap-1.5 max-h-28 overflow-y-auto p-1 bg-muted/30 rounded-lg">
                    {TIME_SLOTS.map(t => (
                      <button key={t} type="button" onClick={() => setSelectedTime(t)}
                        className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all ${selectedTime === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Notes (Optional)</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional notes..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none h-20" />
              </div>

              {createMut.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600">
                  {createMut.error.message}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 gap-2 h-11" disabled={createMut.isPending}>
                  <CalendarDays className="w-4 h-4" /> {createMut.isPending ? 'Booking...' : 'Book Appointment'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}