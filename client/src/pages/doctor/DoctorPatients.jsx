import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, FileText, Plus, Save, Clock, Phone, Mail, MapPin, Activity, Heart, Thermometer, AlertCircle, ChevronRight, X, Stethoscope, TestTube, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function DoctorPatients() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  
  // Record form
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [recordType, setRecordType] = useState('Prescription');
  const [notes, setNotes] = useState('');
  const [chiefComplaints, setChiefComplaints] = useState('');
  const [advice, setAdvice] = useState('');
  const [followUp, setFollowUp] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('hms_token') || localStorage.getItem('token');
      const [a, r] = await Promise.all([
        api.getAppointments(),
        api.getRecords(),
      ]);
      
      // Filter appointments for this doctor
      const myAppointments = a?.filter(apt => 
        apt.doctor?.toLowerCase().includes(user?.name?.toLowerCase()) ||
        apt.doctorId?.name?.toLowerCase().includes(user?.name?.toLowerCase())
      ) || [];
      
      setAppointments(myAppointments);
      setPatients(myAppointments);
      setRecords(r?.records || r);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user?.name]);

  const getPatientAppointments = (patientName) => appointments.filter(a => a.patient === patientName);
  const getPatientRecords = (patientName) => records.filter(r => r.patient === patientName);

  const handleSaveRecord = async () => {
    if (!selectedPatient || !diagnosis) return;
    try {
      await api.createRecord({
        patient: selectedPatient.patient,
        patientId: selectedPatient.patientId?._id || selectedPatient.patientId,
        doctor: user?.name,
        diagnosis,
        prescription,
        type: recordType,
        notes,
        data: {
          patient: { name: selectedPatient.patient },
          chiefComplaints,
          diagnosis,
          medications: prescription.split('\n').filter(p => p.trim()),
          advice,
          followUp,
          date: new Date().toISOString().split('T')[0],
        },
      });
      setSelectedPatient(null); 
      setDiagnosis(''); setPrescription(''); setNotes(''); 
      setChiefComplaints(''); setAdvice(''); setFollowUp('');
      loadData();
    } catch (e) { console.error(e); }
  };

  const openPatientDetail = (patient) => {
    setSelectedPatient(patient);
    setViewMode('detail');
  };

  const closeDetail = () => {
    setSelectedPatient(null);
    setViewMode('list');
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Group patients by unique patient
  const uniquePatients = [...new Map(appointments.map(a => [a.patient, a])).values()];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">My Patients</h1>
          <p className="text-muted-foreground">Manage patient records and medical history</p>
        </div>
        <Badge variant="outline" className="text-sm">{uniquePatients.length} Patients</Badge>
      </div>

      {uniquePatients.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
          <User className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-lg">No patients yet</p>
          <p className="text-sm text-muted-foreground/70">Patients who book appointments will appear here</p>
        </div>
      ) : viewMode === 'detail' && selectedPatient ? (
        <PatientDetailView 
          patient={selectedPatient} 
          appointments={getPatientAppointments(selectedPatient.patient)}
          records={getPatientRecords(selectedPatient.patient)}
          onClose={closeDetail}
          onAddRecord={() => setViewMode('record')}
          recordType={recordType}
          setRecordType={setRecordType}
          diagnosis={diagnosis}
          setDiagnosis={setDiagnosis}
          prescription={prescription}
          setPrescription={setPrescription}
          notes={notes}
          setNotes={setNotes}
          chiefComplaints={chiefComplaints}
          setChiefComplaints={setChiefComplaints}
          advice={advice}
          setAdvice={setAdvice}
          followUp={followUp}
          setFollowUp={setFollowUp}
          handleSaveRecord={handleSaveRecord}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      ) : (
        /* Patient Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniquePatients.map((apt, i) => {
            const patientRecords = getPatientRecords(apt.patient);
            const patientAppts = getPatientAppointments(apt.patient);
            return (
              <motion.div 
                key={apt._id || i} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.05 }}
                onClick={() => openPatientDetail(apt)}
                className="bg-card rounded-2xl border border-border/60 p-5 hover:shadow-xl transition-all cursor-pointer group"
              >
                {/* Patient Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-info/20 to-primary/20 flex items-center justify-center">
                    <User className="w-7 h-7 text-info" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-foreground truncate">{apt.patient}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{apt.date}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-muted/30 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-foreground">{patientAppts.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Visits</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-primary">{patientRecords.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Records</p>
                  </div>
                </div>

                {/* Last Visit Info */}
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Last Visit:</span>
                    <span className="font-medium">{patientAppts[0]?.date || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${apt.status === 'Confirmed' ? 'bg-success/10 text-success' : apt.status === 'Pending' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Patient Detail View Component
function PatientDetailView({ patient, appointments, records, onClose, onAddRecord, recordType, setRecordType, diagnosis, setDiagnosis, prescription, setPrescription, notes, setNotes, chiefComplaints, setChiefComplaints, advice, setAdvice, followUp, setFollowUp, handleSaveRecord, viewMode, setViewMode }) {
  const latestRecord = records[0];
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Back Button */}
      <Button variant="outline" onClick={onClose} className="gap-2">
        ← Back to Patients
      </Button>

      {/* Patient Info Card */}
      <div className="bg-gradient-to-br from-card to-muted/20 rounded-3xl border border-border/60 p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-info/30 to-primary/30 flex items-center justify-center shadow-lg">
            <User className="w-10 h-10 text-info" />
          </div>
          <div className="flex-1">
            <h2 className="font-heading text-2xl font-bold text-foreground">{patient.patient}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{patient.date}</span></div>
              <div className="flex items-center gap-1"><Stethoscope className="w-4 h-4" /><span>{patient.department}</span></div>
              <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{patient.time}</span></div>
            </div>
            <Badge className={`mt-3 ${patient.status === 'Confirmed' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
              {patient.status}
            </Badge>
          </div>
          <Button onClick={onAddRecord} className="gap-2">
            <Plus className="w-4 h-4" /> New Record
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      {viewMode === 'record' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Record Form */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border/60 p-6">
            <h3 className="font-heading text-lg font-bold text-foreground mb-4">New {recordType}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Record Type</label>
                <div className="flex gap-2">
                  {['Prescription', 'Lab Report', 'Diagnosis'].map(t => (
                    <button key={t} onClick={() => setRecordType(t)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${recordType === t ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Chief Complaints</label>
                <Textarea value={chiefComplaints} onChange={e => setChiefComplaints(e.target.value)} placeholder="Enter chief complaints..." className="h-20" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Diagnosis</label>
                <Input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Enter diagnosis..." />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Medications / Prescription</label>
                <Textarea value={prescription} onChange={e => setPrescription(e.target.value)} placeholder="Enter medications (one per line)..." className="h-32" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Advice</label>
                <Textarea value={advice} onChange={e => setAdvice(e.target.value)} placeholder="Enter advice..." className="h-20" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Follow-up</label>
                <Input value={followUp} onChange={e => setFollowUp(e.target.value)} placeholder="e.g., After 7 days" />
              </div>
              <Button onClick={handleSaveRecord} disabled={!diagnosis} className="w-full gap-2 mt-4">
                <Save className="w-4 h-4" /> Save Medical Record
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Previous Visits */}
          <div className="bg-card rounded-2xl border border-border/60 p-5">
            <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Previous Visits
            </h3>
            <div className="space-y-3">
              {appointments.slice(0, 5).map((apt, i) => (
                <div key={apt._id || i} className="p-3 rounded-xl bg-muted/30 border border-border/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{apt.date}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${apt.status === 'Confirmed' ? 'bg-success/10 text-success' : apt.status === 'Pending' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>{apt.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{apt.type} - {apt.department}</p>
                  <p className="text-xs text-muted-foreground mt-1">{apt.time}</p>
                </div>
              ))}
              {appointments.length === 0 && <p className="text-sm text-muted-foreground">No previous visits</p>}
            </div>
          </div>

          {/* Medical Records */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border/60 p-5">
            <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Medical Records
            </h3>
            <div className="space-y-4">
              {records.map((rec, i) => (
                <div key={rec._id || i} className="p-4 rounded-xl bg-muted/30 border border-border/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {rec.type === 'Prescription' && <Pill className="w-4 h-4 text-primary" />}
                      {rec.type === 'Lab Report' && <TestTube className="w-4 h-4 text-info" />}
                      {rec.type === 'Diagnosis' && <Activity className="w-4 h-4 text-warning" />}
                      <span className="text-sm font-semibold text-foreground">{rec.type}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{rec.date}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {rec.diagnosis && <div><span className="text-muted-foreground">Diagnosis:</span> <span className="text-foreground ml-2">{rec.diagnosis}</span></div>}
                    {rec.prescription && <div><span className="text-muted-foreground">Rx:</span> <span className="text-foreground ml-2 whitespace-pre-line">{rec.prescription}</span></div>}
                    {rec.notes && <div><span className="text-muted-foreground">Notes:</span> <span className="text-foreground ml-2">{rec.notes}</span></div>}
                  </div>
                </div>
              ))}
              {records.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No medical records yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}