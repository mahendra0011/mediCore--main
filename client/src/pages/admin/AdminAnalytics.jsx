import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Stethoscope, CalendarDays, IndianRupee, Activity, TrendingUp, Eye, MousePointer, Clock, Award, ChevronRight, ArrowUp, BarChart3, PieChart, LineChart, Building2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [s, u, d, a] = await Promise.all([
          api.dashboardStats(),
          api.getUsers(),
          api.getDoctors(),
          api.getAppointments(),
        ]);
        setStats(s);
        setUsers(u || []);
        setDoctors(d || []);
        setAppointments(a || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Calculate metrics
  const totalPatients = users.filter(u => u.role === 'patient').length;
  const totalDoctors = doctors.length || users.filter(u => u.role === 'doctor').length;
  const totalAppointments = appointments.length;
  const todayAppts = appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length;
  const completedApps = appointments.filter(a => a.status === 'Completed').length;
  const pendingApps = appointments.filter(a => a.status === 'Pending').length;

  // Department stats
  const deptStats = {};
  appointments.forEach(a => {
    deptStats[a.department] = (deptStats[a.department] || 0) + 1;
  });
  const topDepts = Object.entries(deptStats).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Recent activity
  const recentAppointments = appointments.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and analytics</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/20 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="flex items-center gap-1 text-success text-sm">
              <ArrowUp className="w-3 h-3" />
              <span>+12%</span>
            </div>
          </div>
          <p className="font-heading text-3xl font-bold text-foreground">{totalPatients}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Patients</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-info/10 via-info/5 to-transparent rounded-2xl border border-info/20 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-info" />
            </div>
            <div className="flex items-center gap-1 text-success text-sm">
              <ArrowUp className="w-3 h-3" />
              <span>+5%</span>
            </div>
          </div>
          <p className="font-heading text-3xl font-bold text-foreground">{totalDoctors}</p>
          <p className="text-sm text-muted-foreground mt-1">Active Doctors</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-success/10 via-success/5 to-transparent rounded-2xl border border-success/20 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-success" />
            </div>
            <div className="flex items-center gap-1 text-success text-sm">
              <ArrowUp className="w-3 h-3" />
              <span>+8%</span>
            </div>
          </div>
          <p className="font-heading text-3xl font-bold text-foreground">{todayAppts}</p>
          <p className="text-sm text-muted-foreground mt-1">Today's Appointments</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-warning/10 via-warning/5 to-transparent rounded-2xl border border-warning/20 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-warning" />
            </div>
            <div className="flex items-center gap-1 text-success text-sm">
              <ArrowUp className="w-3 h-3" />
              <span>+23%</span>
            </div>
          </div>
          <p className="font-heading text-3xl font-bold text-foreground">Rs {(stats?.stats?.revenue || 0).toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">Monthly Revenue</p>
        </motion.div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{totalAppointments}</p>
            <p className="text-xs text-muted-foreground">Total Appointments</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto text-success mb-2" />
            <p className="text-2xl font-bold text-foreground">{completedApps}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto text-warning mb-2" />
            <p className="text-2xl font-bold text-foreground">{pendingApps}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4 text-center">
            <Award className="w-6 h-6 mx-auto text-info mb-2" />
            <p className="text-2xl font-bold text-foreground">{doctors.filter(d => d.available).length}</p>
            <p className="text-xs text-muted-foreground">Available Doctors</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Appointments */}
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Weekly Appointments
              </h3>
              <Badge variant="outline" className="text-xs">This Week</Badge>
            </div>
            <div className="h-[300px]">
              {stats?.weeklyAppointments?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.weeklyAppointments}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--primary) / 0.6)" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                <LineChart className="w-5 h-5 text-success" /> Revenue Trend
              </h3>
              <Badge variant="outline" className="text-xs">6 Months</Badge>
            </div>
            <div className="h-[300px]">
              {stats?.revenueData?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 6, stroke: 'hsl(var(--success))', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="font-heading text-lg font-semibold mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" /> Department Distribution
            </h3>
            <div className="h-[250px]">
              {stats?.departmentData?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie 
                      data={stats.departmentData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={3}
                      label
                    >
                      {stats.departmentData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '12px' 
                      }} 
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="font-heading text-lg font-semibold mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> User Distribution
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie 
                    data={[
                      { name: 'Patients', value: totalPatients, color: '#10b981' },
                      { name: 'Doctors', value: totalDoctors, color: '#3b82f6' },
                      { name: 'Admins', value: users.filter(u => u.role === 'admin').length, color: '#8b5cf6' },
                    ]} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={3}
                    label
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#8b5cf6" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))', 
                      borderRadius: '12px' 
                    }} 
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Departments */}
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> Top Departments
              </h3>
              <Badge variant="outline" className="text-xs">By Appointments</Badge>
            </div>
            <div className="space-y-4">
              {topDepts.map(([dept, count], i) => {
                const percentage = totalAppointments > 0 ? Math.round((count / totalAppointments) * 100) : 0;
                return (
                  <div key={dept}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{dept}</span>
                      <span className="text-xs text-muted-foreground">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card className="bg-card/60 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" /> Recent Appointments
            </h3>
            <Button variant="outline" size="sm" className="gap-2">
              View All <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAppointments.map((apt) => (
                  <TableRow key={apt._id}>
                    <TableCell className="font-medium">{apt.patient}</TableCell>
                    <TableCell>{apt.doctor}</TableCell>
                    <TableCell>{apt.department}</TableCell>
                    <TableCell>{apt.date}</TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          apt.status === 'Completed' ? 'bg-success/10 text-success' :
                          apt.status === 'Confirmed' ? 'bg-info/10 text-info' :
                          apt.status === 'Pending' ? 'bg-warning/10 text-warning' :
                          apt.status === 'Cancelled' ? 'bg-destructive/10 text-destructive' :
                          'bg-muted text-muted-foreground'
                        }
                      >
                        {apt.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Daily Visits</p>
              <p className="text-2xl font-bold text-foreground">
                {Math.round(totalAppointments / Math.max(1, Math.ceil((new Date() - new Date('2024-01-01')) / (1000 * 60 * 60 * 24))))}
              </p>
            </div>
            <MousePointer className="w-8 h-8 text-primary/50" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Daily Revenue</p>
              <p className="text-2xl font-bold text-foreground">Rs {Math.round((stats?.stats?.revenue || 0) / 30).toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-success/50" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold text-foreground">
                {totalAppointments > 0 ? Math.round((completedApps / totalAppointments) * 100) : 0}%
              </p>
            </div>
            <Activity className="w-8 h-8 text-info/50" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Rate</p>
              <p className="text-2xl font-bold text-foreground">
                {totalAppointments > 0 ? Math.round((pendingApps / totalAppointments) * 100) : 0}%
              </p>
            </div>
            <Clock className="w-8 h-8 text-warning/50" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
