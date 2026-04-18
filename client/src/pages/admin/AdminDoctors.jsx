import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Search, Trash2, Plus, Star, Phone, Mail, Save, X, Calendar, Award, Users, Activity, Edit2, CheckCircle, XCircle, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

const specializations = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Oncology', 'General Medicine', 'ENT', 'Gastroenterology', 'Ophthalmology'];

const specializationColors = {
  'Cardiology': 'from-red-500 to-rose-500',
  'Neurology': 'from-violet-500 to-purple-500',
  'Orthopedics': 'from-amber-500 to-orange-500',
  'Pediatrics': 'from-blue-500 to-cyan-500',
  'Dermatology': 'from-pink-500 to-rose-500',
  'Oncology': 'from-emerald-500 to-teal-500',
  'General Medicine': 'from-slate-500 to-slate-600',
  'ENT': 'from-indigo-500 to-blue-500',
  'Gastroenterology': 'from-orange-500 to-amber-500',
  'Ophthalmology': 'from-cyan-500 to-sky-500',
};

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm] = useState({ name: '', specialization: 'Cardiology', experience: '', phone: '', email: '', available: true });

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const data = await api.getDoctors({ search });
      setDoctors(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadDoctors(); }, [search]);

  const resetForm = () => { setForm({ name: '', specialization: 'Cardiology', experience: '', phone: '', email: '', available: true }); setEditId(null); setShowForm(false); };

  const handleSave = async () => {
    try {
      if (editId) {
        await api.updateDoctor(editId, form);
      } else {
        await api.createDoctor({ ...form, rating: 0, patients: 0, initials: form.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() });
      }
      resetForm(); loadDoctors();
    } catch (e) { console.error(e); }
  };

  const handleEdit = (doc) => {
    setForm({ name: doc.name, specialization: doc.specialization, experience: doc.experience, phone: doc.phone, email: doc.email, available: doc.available });
    setEditId(doc._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    try { await api.deleteDoctor(id); loadDoctors(); } catch (e) { console.error(e); }
  };

  const handleToggleAvailability = async (doc) => {
    try { await api.updateDoctor(doc._id, { available: !doc.available }); loadDoctors(); } catch (e) { console.error(e); }
  };

  const stats = {
    total: doctors.length,
    available: doctors.filter(d => d.available).length,
    patients: doctors.reduce((sum, d) => sum + (d.patients || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Manage Doctors</h1>
          <p className="text-muted-foreground mt-1">Add, edit, or manage doctors in the system</p>
        </div>
        <Button className="gap-2" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Add Doctor
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border/60 p-5 hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total Doctors</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/60 p-5 hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.available}</p>
          <p className="text-sm text-muted-foreground">Available Now</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/60 p-5 hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.patients.toLocaleString()}+</p>
          <p className="text-sm text-muted-foreground">Total Patients</p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors by name or specialization..." 
          className="pl-12 h-12 rounded-xl border-border/60" />
      </motion.div>

      {/* Doctor Cards */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : doctors.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-border/60 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-xl font-semibold text-foreground mb-2">No Doctors Found</h3>
          <p className="text-muted-foreground">Add your first doctor to get started</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doc, i) => {
            const colorClass = specializationColors[doc.specialization] || 'from-slate-500 to-slate-600';
            
            return (
              <motion.div key={doc._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border/60 p-0 overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all group">
                {/* Top gradient bar */}
                <div className={`h-2 bg-gradient-to-r ${colorClass}`} />
                
                <div className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <span className="text-white font-bold text-xl">{doc.initials || doc.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-semibold text-lg text-foreground truncate">{doc.name}</h3>
                      <p className="text-sm text-muted-foreground">{doc.specialization}</p>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mt-2 ${doc.available ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                        {doc.available ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {doc.available ? 'Available' : 'Unavailable'}
                      </div>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-muted/30 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-xs">Experience</span>
                      </div>
                      <p className="font-semibold text-foreground text-sm">{doc.experience || 'N/A'}</p>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span className="text-xs">Rating</span>
                      </div>
                      <p className="font-semibold text-foreground text-sm">{doc.rating || 0} ({doc.patients || 0} patients)</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span className="truncate">{doc.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{doc.email || 'No email'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-border/30">
                    <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => handleEdit(doc)}>
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className={`flex-1 gap-1.5 ${doc.available ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}`} 
                      onClick={() => handleToggleAvailability(doc)}>
                      {doc.available ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      {doc.available ? 'Busy' : 'Available'}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(doc._id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={resetForm}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl border border-border w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading text-xl font-bold text-foreground">{editId ? 'Edit Doctor' : 'Add New Doctor'}</h3>
                <p className="text-sm text-muted-foreground">{editId ? 'Update doctor information' : 'Add a new doctor to the system'}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={resetForm}><X className="w-5 h-5" /></Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dr. Full Name" className="h-11" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Specialization</label>
                  <select value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm h-11">
                    {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Experience</label>
                  <Input value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} placeholder="e.g. 10 years" className="h-11" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number</label>
                  <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 234-567-8901" className="h-11" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email Address</label>
                  <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="doctor@email.com" className="h-11" />
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                <input type="checkbox" id="avail" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} 
                  className="w-5 h-5 rounded border-border" />
                <label htmlFor="avail" className="text-sm text-foreground">Available for appointments</label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1 h-11" onClick={resetForm}>Cancel</Button>
              <Button className="flex-1 gap-2 h-11" onClick={handleSave} disabled={!form.name || !form.email}>
                <Save className="w-4 h-4" /> {editId ? 'Update Doctor' : 'Add Doctor'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}