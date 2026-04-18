import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Users, Clock, Activity, Phone, UserPlus, Search, Filter, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const severityColors = {
  Critical: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500', icon: '🚨' },
  Serious: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500', icon: '⚠️' },
  Stable: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500', icon: '✅' },
};

const statusColors = {
  Pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-600' },
  Assigned: { bg: 'bg-blue-500/10', text: 'text-blue-600' },
  'Under Treatment': { bg: 'bg-purple-500/10', text: 'text-purple-600' },
  Stable: { bg: 'bg-green-500/10', text: 'text-green-600' },
  Transferred: { bg: 'bg-gray-500/10', text: 'text-gray-600' },
  Discharged: { bg: 'bg-green-500/10', text: 'text-green-600' },
  Rejected: { bg: 'bg-red-500/10', text: 'text-red-600' },
};

export default function AdminEmergency() {
  const [emergencies, setEmergencies] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [selectedCase, setSelectedCase] = useState(null);
  const [assignModal, setAssignModal] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [em, doc] = await Promise.all([api.getEmergencies({ status: 'All' }), api.getDoctors()]);
      setEmergencies(em);
      setDoctors(doc);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAssignDoctor = async (caseId, doctorId, doctorName) => {
    try {
      await api.assignEmergencyDoctor(caseId, doctorId, doctorName);
      loadData();
      setAssignModal(null);
    } catch (e) { console.error(e); }
  };

  const filteredCases = emergencies.filter(em => {
    if (filter !== 'All' && em.status !== filter) return false;
    if (severityFilter !== 'All' && em.severity !== severityFilter) return false;
    return true;
  });

  const stats = {
    total: emergencies.length,
    critical: emergencies.filter(e => e.severity === 'Critical' && !['Discharged', 'Transferred'].includes(e.status)).length,
    pending: emergencies.filter(e => e.status === 'Pending').length,
    underTreatment: emergencies.filter(e => e.status === 'Under Treatment').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" /> Emergency Control Center
          </h1>
          <p className="text-muted-foreground">Real-time emergency case management</p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">Refresh</Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={`${stats.critical > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-card'}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Critical Cases</p>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500/50" />
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500/50" />
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Under Treatment</p>
              <p className="text-2xl font-bold text-foreground">{stats.underTreatment}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500/50" />
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Cases</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-muted-foreground/50" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-1 bg-card rounded-xl border border-border/60 p-1">
          {['All', 'Pending', 'Assigned', 'Under Treatment', 'Stable', 'Discharged'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/80'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-card rounded-xl border border-border/60 p-1">
          {['All', 'Critical', 'Serious', 'Stable'].map(f => (
            <button key={f} onClick={() => setSeverityFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${severityFilter === f ? 'bg-red-500 text-white' : 'text-muted-foreground hover:bg-muted/80'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border/60">
              No emergency cases found
            </div>
          ) : (
            filteredCases.map((em, i) => (
              <motion.div key={em._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedCase(em)}
                className={`bg-card rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${selectedCase?._id === em._id ? 'border-primary' : 'border-border/60'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{severityColors[em.severity]?.icon}</span>
                      <Badge className={`${severityColors[em.severity]?.bg} ${severityColors[em.severity]?.text}`}>{em.severity}</Badge>
                      <Badge className={`${statusColors[em.status]?.bg} ${statusColors[em.status]?.text}`}>{em.status}</Badge>
                    </div>
                    <h3 className="font-semibold text-foreground">{em.condition}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{em.patientName || 'Unknown'}</span>
                      {em.age && <span>{em.age} yrs</span>}
                      {em.gender && <span>{em.gender}</span>}
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(em.createdAt).toLocaleTimeString()}</span>
                    </div>
                    {em.assignedDoctorName && (
                      <p className="text-sm text-blue-600 mt-2">👨‍⚕️ {em.assignedDoctorName}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {em.status === 'Pending' && (
                      <Button size="sm" className="gap-1" onClick={(e) => { e.stopPropagation(); setAssignModal(em); }}>
                        <UserPlus className="w-4 h-4" /> Assign
                      </Button>
                    )}
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Details Panel */}
        <div className="bg-card rounded-2xl border border-border/60 p-4">
          <h3 className="font-semibold text-foreground mb-4">Case Details</h3>
          {selectedCase ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className={`${severityColors[selectedCase.severity]?.bg} ${severityColors[selectedCase.severity]?.text}`}>{selectedCase.severity}</Badge>
                <Badge className={`${statusColors[selectedCase.status]?.bg} ${statusColors[selectedCase.status]?.text}`}>{selectedCase.status}</Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="font-medium text-foreground">{selectedCase.patientName || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Condition</p>
                  <p className="font-medium text-foreground">{selectedCase.condition}</p>
                </div>
                {(selectedCase.age || selectedCase.gender) && (
                  <div>
                    <p className="text-xs text-muted-foreground">Details</p>
                    <p className="font-medium text-foreground">{selectedCase.age || '-'} years, {selectedCase.gender || '-'}</p>
                  </div>
                )}
                {selectedCase.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {selectedCase.phone}
                    </p>
                  </div>
                )}
                {selectedCase.assignedDoctorName && (
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned Doctor</p>
                    <p className="font-medium text-foreground">👨‍⚕️ {selectedCase.assignedDoctorName}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Response Time</p>
                  <p className="font-medium text-foreground">
                    {selectedCase.responseTime ? `${selectedCase.responseTime} min` : 'Pending'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium text-foreground">{new Date(selectedCase.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedCase.notes?.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Notes ({selectedCase.notes.length})</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedCase.notes.map((n, i) => (
                      <div key={i} className="bg-muted/30 rounded-lg p-2 text-sm">
                        <p className="text-foreground">{n.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">{n.doctorName} • {new Date(n.timestamp).toLocaleTimeString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Select a case to view details</p>
          )}
        </div>
      </div>

      {/* Assign Doctor Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setAssignModal(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl border border-border w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-bold text-foreground mb-4">Assign Doctor</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {doctors.map(doc => (
                <button key={doc._id} onClick={() => handleAssignDoctor(assignModal._id, doc._id, doc.name)}
                  className="w-full p-3 rounded-xl border border-border/60 hover:border-primary hover:bg-primary/5 text-left transition-all">
                  <p className="font-medium text-foreground">{doc.name}</p>
                  <p className="text-sm text-muted-foreground">{doc.specialization}</p>
                </button>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setAssignModal(null)}>Cancel</Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}