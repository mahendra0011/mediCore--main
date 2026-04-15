import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, FileText, Plus, Save, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function DoctorPatients() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [recordType, setRecordType] = useState('Diagnosis');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [a, p, r] = await Promise.all([
        api.getAppointments({ doctor: user?.name }),
        api.getPatients(),
        api.getRecords(),
      ]);
      setAppointments(a);
      setPatients(p);
      setRecords(r);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const myPatientNames = [...new Set(appointments.map(a => a.patient))];
  const myPatients = patients.filter(p => myPatientNames.includes(p.name));

  const handleSaveRecord = async () => {
    if (!selectedPatient || !diagnosis) return;
    try {
      await api.createRecord({
        patient: selectedPatient.name,
        doctor: user?.name,
        date: new Date().toISOString().split('T')[0],
        diagnosis,
        prescription,
        type: recordType,
        notes,
      });
      setSelectedPatient(null); setDiagnosis(''); setPrescription(''); setNotes('');
      loadData();
    } catch (e) { console.error(e); }
  };

  const getPatientRecords = (name) => records.filter(r => r.patient === name);

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">My Patients</h1>
        <p className="text-muted-foreground">View patient details and create medical records</p>
      </div>

      {myPatients.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No patients assigned yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myPatients.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl border border-border/60 p-5 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-info" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.age} yrs, {p.gender}, {p.bloodGroup}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2"><FileText className="w-3.5 h-3.5" /><span>{p.disease}</span></div>
                <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /><span>Admitted: {p.admitted}</span></div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${p.status === 'Active' ? 'bg-success' : p.status === 'Critical' ? 'bg-destructive' : 'bg-muted'}`} />
                  <span>{p.status}</span>
                </div>
              </div>
              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Records ({getPatientRecords(p.name).length})</p>
              </div>
              <Button size="sm" className="w-full gap-2" onClick={() => { setSelectedPatient(p); setDiagnosis(''); setPrescription(''); setNotes(''); }}>
                <Plus className="w-3.5 h-3.5" /> Add Record
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Record Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedPatient(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl border border-border w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-bold text-foreground mb-1">Add Medical Record</h3>
            <p className="text-sm text-muted-foreground mb-4">Patient: {selectedPatient.name}</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Record Type</label>
                <div className="flex gap-2">
                  {['Diagnosis', 'Prescription', 'Lab Report'].map(t => (
                    <button key={t} onClick={() => setRecordType(t)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${recordType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Diagnosis</label>
                <Input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Enter diagnosis..." />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Prescription</label>
                <textarea value={prescription} onChange={e => setPrescription(e.target.value)} placeholder="Enter prescription..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none h-20" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none h-20" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedPatient(null)}>Cancel</Button>
              <Button className="flex-1 gap-2" onClick={handleSaveRecord} disabled={!diagnosis}>
                <Save className="w-4 h-4" /> Save Record
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
