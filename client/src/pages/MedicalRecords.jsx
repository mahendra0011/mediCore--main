import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, FileText, X, Trash2, Pill, FlaskConical, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

const typeConfig = {
  Diagnosis:    { icon: FileText,     color: 'text-primary',     bg: 'bg-primary/10'     },
  Prescription: { icon: Pill,         color: 'text-success',     bg: 'bg-success/10'     },
  'Lab Report': { icon: FlaskConical, color: 'text-warning',     bg: 'bg-warning/10'     },
  Imaging:      { icon: ScanLine,     color: 'text-info',        bg: 'bg-info/10'        },
};
const TYPES = ['All','Diagnosis','Prescription','Lab Report','Imaging'];
const empty = { patient:'', doctor:'', date:'', diagnosis:'', prescription:'', type:'Diagnosis', notes:'' };

export default function MedicalRecords() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['records', search, typeFilter],
    queryFn: () => api.getRecords({ ...(search && { search }), ...(typeFilter !== 'All' && { type: typeFilter }) }),
  });

  const createMut = useMutation({ mutationFn: api.createRecord, onSuccess: () => { qc.invalidateQueries(['records']); setModal(false); setForm(empty); } });
  const deleteMut = useMutation({ mutationFn: api.deleteRecord, onSuccess: () => qc.invalidateQueries(['records']) });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = (e) => { e.preventDefault(); createMut.mutate(form); };

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Medical Records</h1>
          <p className="page-subtitle">{records.length} records found</p>
        </div>
        <Button className="gap-2" onClick={() => setModal(true)}><Plus className="w-4 h-4" /> Add Record</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search records…" className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${typeFilter === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_,i) => <div key={i} className="bg-card rounded-xl border p-5 animate-pulse h-44" />)}
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No records found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {records.map(rec => {
            const cfg = typeConfig[rec.type] ?? typeConfig.Diagnosis;
            const Icon = cfg.icon;
            return (
              <div key={rec._id} className="bg-card rounded-xl border shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 p-5 group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{rec.type}</span>
                    <button onClick={() => { if (confirm('Delete record?')) deleteMut.mutate(rec._id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="font-heading font-semibold text-sm text-card-foreground mb-1 line-clamp-2">{rec.diagnosis}</h3>
                {rec.prescription && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    <span className="font-medium text-foreground">Rx:</span> {rec.prescription}
                  </p>
                )}
                <div className="border-t border-border/50 pt-3 mt-auto">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{rec.patient}</span>
                    <span>{rec.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{rec.doctor}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Record Modal */}
      {modal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-xl font-bold">Add Medical Record</h2>
              <button onClick={() => setModal(false)} className="p-1 rounded-lg hover:bg-muted"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1.5 block">Patient</label><Input value={form.patient} onChange={e=>set('patient',e.target.value)} placeholder="Patient name" required /></div>
                <div><label className="text-sm font-medium mb-1.5 block">Doctor</label><Input value={form.doctor} onChange={e=>set('doctor',e.target.value)} placeholder="Dr. Name" required /></div>
                <div><label className="text-sm font-medium mb-1.5 block">Date</label><Input type="date" value={form.date} onChange={e=>set('date',e.target.value)} required /></div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Record Type</label>
                  <select value={form.type} onChange={e=>set('type',e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {['Diagnosis','Prescription','Lab Report','Imaging'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-span-2"><label className="text-sm font-medium mb-1.5 block">Diagnosis / Title</label><Input value={form.diagnosis} onChange={e=>set('diagnosis',e.target.value)} placeholder="Diagnosis details…" required /></div>
                <div className="col-span-2"><label className="text-sm font-medium mb-1.5 block">Prescription / Notes</label><Input value={form.prescription} onChange={e=>set('prescription',e.target.value)} placeholder="Medication, dosage, instructions…" /></div>
              </div>
              {createMut.error && <p className="text-sm text-destructive">{createMut.error.message}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={createMut.isPending}>{createMut.isPending ? 'Saving…' : 'Save Record'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
