import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, User, Calendar, Save, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function DoctorConsultations() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [recordType, setRecordType] = useState('Diagnosis');
  const [notes, setNotes] = useState('');

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await api.getRecords();
      setRecords(data.filter(r => r.doctor === user?.name));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadRecords(); }, []);

  const handleSave = async () => {
    if (!patientName || !diagnosis) return;
    try {
      await api.createRecord({
        patient: patientName,
        doctor: user?.name,
        date: new Date().toISOString().split('T')[0],
        diagnosis,
        prescription,
        type: recordType,
        notes,
      });
      setShowForm(false); setPatientName(''); setDiagnosis(''); setPrescription(''); setNotes('');
      loadRecords();
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Consultations</h1>
          <p className="text-muted-foreground">Create and manage patient consultation records</p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm(true)}><Stethoscope className="w-4 h-4" /> New Record</Button>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No consultation records yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.map((rec, i) => (
            <motion.div key={rec._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl border border-border/60 p-5 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">{rec.patient}</h3>
                    <span className="text-xs text-muted-foreground">{rec.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />{rec.date}
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Diagnosis</p>
                  <p className="text-sm text-foreground">{rec.diagnosis}</p>
                </div>
                {rec.prescription && (
                  <div className="bg-success/5 rounded-lg p-2">
                    <p className="text-xs font-medium text-success">Prescription</p>
                    <p className="text-sm text-foreground">{rec.prescription}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* New Record Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl border border-border w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-bold text-foreground mb-4">New Consultation Record</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Patient Name</label>
                <Input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Patient name..." />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Type</label>
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
                <Input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Diagnosis..." />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Prescription</label>
                <textarea value={prescription} onChange={e => setPrescription(e.target.value)} placeholder="Prescription details..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none h-20" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none h-20" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1 gap-2" onClick={handleSave} disabled={!patientName || !diagnosis}>
                <Save className="w-4 h-4" /> Save
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
