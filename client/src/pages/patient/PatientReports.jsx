import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Calendar, User, Stethoscope, Loader2, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function MyReports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState({ prescriptions: [], labReports: [], dischargeSummaries: [] });
  const [activeTab, setActiveTab] = useState('prescriptions');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/records?type=prescription`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      
      if (data.records) {
        const prescriptions = data.records.filter(r => r.type === 'prescription');
        const labReports = data.records.filter(r => r.type === 'lab_report');
        const dischargeSummaries = data.records.filter(r => r.type === 'discharge_summary');
        setReports({ prescriptions, labReports, dischargeSummaries });
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
    setLoading(false);
  };

  const downloadReport = async (report) => {
    try {
      const type = report.type === 'prescription' ? 'prescription' 
        : report.type === 'lab_report' ? 'lab-report' 
        : 'discharge-summary';
      
      const res = await fetch(`${API_URL}/reports/generate-${type}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          patient: { name: user.name, email: user.email },
          ...report.data
        })
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.type}-${report._id || Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const ReportCard = ({ report, type }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="w-4 h-4" />
          {type === 'prescription' ? 'Prescription' : type === 'lab_report' ? 'Lab Report' : 'Discharge Summary'}
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {formatDate(report.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {report.doctorName && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
            <Stethoscope className="w-3 h-3" /> Dr. {report.doctorName}
          </p>
        )}
        {report.diagnosis && (
          <p className="text-sm mb-2"><strong>Diagnosis:</strong> {report.diagnosis}</p>
        )}
        {report.data?.diagnosis && (
          <p className="text-sm mb-2"><strong>Diagnosis:</strong> {report.data.diagnosis}</p>
        )}
        <Button size="sm" onClick={() => downloadReport(report)}>
          <Download className="w-4 h-4 mr-2" />Download PDF
        </Button>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ type }) => (
    <Card>
      <CardContent className="py-10 text-center">
        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No {type.toLowerCase()} found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Your {type.toLowerCase()} will appear here after your doctor creates them.
        </p>
      </CardContent>
    </Card>
  );

  const totalReports = reports.prescriptions.length + reports.labReports.length + reports.dischargeSummaries.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Reports</h1>
        <p className="text-muted-foreground">View and download your medical reports</p>
      </div>

      {totalReports > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{reports.prescriptions.length}</p>
                <p className="text-sm text-muted-foreground">Prescriptions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{reports.labReports.length}</p>
                <p className="text-sm text-muted-foreground">Lab Reports</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{reports.dischargeSummaries.length}</p>
                <p className="text-sm text-muted-foreground">Discharge Summaries</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Loading reports...</p>
          </CardContent>
        </Card>
      ) : totalReports === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">No Reports Yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your medical reports will appear here after your doctor creates them.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prescriptions">
              Prescriptions ({reports.prescriptions.length})
            </TabsTrigger>
            <TabsTrigger value="labReports">
              Lab Reports ({reports.labReports.length})
            </TabsTrigger>
            <TabsTrigger value="discharge">
              Discharge ({reports.dischargeSummaries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prescriptions" className="mt-4">
            {reports.prescriptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.prescriptions.map((report, idx) => (
                  <ReportCard key={idx} report={report} type="prescription" />
                ))}
              </div>
            ) : (
              <EmptyState type="Prescriptions" />
            )}
          </TabsContent>

          <TabsContent value="labReports" className="mt-4">
            {reports.labReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.labReports.map((report, idx) => (
                  <ReportCard key={idx} report={report} type="lab_report" />
                ))}
              </div>
            ) : (
              <EmptyState type="Lab Reports" />
            )}
          </TabsContent>

          <TabsContent value="discharge" className="mt-4">
            {reports.dischargeSummaries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.dischargeSummaries.map((report, idx) => (
                  <ReportCard key={idx} report={report} type="discharge_summary" />
                ))}
              </div>
            ) : (
              <EmptyState type="Discharge Summaries" />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
