import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { UserRound, Stethoscope, CalendarDays, CreditCard, Clock, TrendingUp, ArrowUpRight, ArrowDownRight, Users, Activity, DollarSign, FileText, Plus, ArrowRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/StatCard';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const COLORS = ['hsl(174,62%,38%)','hsl(210,80%,55%)','hsl(38,92%,50%)','hsl(152,60%,42%)','hsl(270,60%,55%)'];

const FALLBACK = {
  stats: { totalPatients: 1247, totalDoctors: 48, todayAppointments: 32, revenue: 62400 },
  weeklyAppointments: [
    { day:'Mon',count:24},{day:'Tue',count:18},{day:'Wed',count:32},
    { day:'Thu',count:27},{day:'Fri',count:20},{day:'Sat',count:15},{day:'Sun',count:8},
  ],
  revenueData: [
    {month:'Jan',revenue:42000},{month:'Feb',revenue:38000},{month:'Mar',revenue:51000},
    {month:'Apr',revenue:47000},{month:'May',revenue:55000},{month:'Jun',revenue:62000},
  ],
  departmentData: [
    {name:'Cardiology',value:30},{name:'Neurology',value:22},{name:'Orthopedics',value:18},
    {name:'Pediatrics',value:15},{name:'Other',value:15},
  ],
  recentAppointments: [
    {_id:1,patient:'Sarah Johnson',doctor:'Dr. Smith',time:'10:00 AM',status:'Confirmed'},
    {_id:2,patient:'Mike Chen',doctor:'Dr. Patel',time:'11:30 AM',status:'Pending'},
    {_id:3,patient:'Emma Wilson',doctor:'Dr. Lee',time:'2:00 PM',status:'Confirmed'},
    {_id:4,patient:'James Brown',doctor:'Dr. Garcia',time:'3:30 PM',status:'Cancelled'},
    {_id:5,patient:'Lisa Davis',doctor:'Dr. Kim',time:'4:00 PM',status:'Confirmed'},
  ],
};

const statusConfig = {
  Confirmed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: CheckCircle, label: 'Confirmed' },
  Pending: { bg: 'bg-amber-500/10', text: 'text-amber-600', icon: AlertCircle, label: 'Pending' },
  Cancelled: { bg: 'bg-red-500/10', text: 'text-red-600', icon: XCircle, label: 'Cancelled' },
  Completed: { bg: 'bg-blue-500/10', text: 'text-blue-600', icon: CheckCircle, label: 'Completed' },
};

const statCards = [
  { title: 'Total Patients', key: 'totalPatients', change: '+12%', changeType: 'positive', icon: Users, color: 'from-violet-500 to-purple-500' },
  { title: 'Active Doctors', key: 'totalDoctors', change: '+3 new', changeType: 'positive', icon: Stethoscope, color: 'from-blue-500 to-cyan-500' },
  { title: "Today's Appointments", key: 'todayAppointments', change: '5 pending', changeType: 'neutral', icon: CalendarDays, color: 'from-amber-500 to-orange-500' },
  { title: 'Revenue (MTD)', key: 'revenue', change: '+18%', changeType: 'positive', icon: DollarSign, color: 'from-emerald-500 to-teal-500', isCurrency: true },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { data = FALLBACK } = useQuery({ queryKey:['dashboard'], queryFn: api.dashboardStats, onError:()=>{} });
  const { stats, weeklyAppointments, revenueData, departmentData, recentAppointments } = data;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your hospital today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="w-4 h-4" /> Reports
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Quick Add
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const value = stat.isCurrency ? `Rs ${((stats?.[stat.key] ?? 0) / 1000).toFixed(1)}k` : stats?.[stat.key]?.toLocaleString() ?? '—';
          return (
            <div key={stat.key} className="bg-card rounded-2xl border border-border/60 p-5 hover:shadow-lg hover:border-primary/20 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.changeType === 'positive' ? 'text-emerald-600' : stat.changeType === 'negative' ? 'text-red-600' : 'text-amber-600'}`}>
                  {stat.changeType === 'positive' ? <ArrowUpRight className="w-3 h-3" /> : stat.changeType === 'negative' ? <ArrowDownRight className="w-3 h-3" /> : null}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Appointments Chart */}
        <motion.div variants={itemVariants} className="bg-card rounded-2xl border border-border/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground">Weekly Appointments</h3>
                <p className="text-xs text-muted-foreground">Patient appointments this week</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyAppointments} barGap={8}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(174,62%,38%)" />
                  <stop offset="100%" stopColor="hsl(174,62%,38%,0.5)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(200,10%,90%)" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(210,12%,50%)', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(210,12%,50%)', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid hsl(200,10%,90%)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{ fill: 'hsl(174,62%,38%,0.1)' }}
              />
              <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue Trend Chart */}
        <motion.div variants={itemVariants} className="bg-card rounded-2xl border border-border/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground">Revenue Trend</h3>
                <p className="text-xs text-muted-foreground">Monthly revenue overview</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
              <ArrowUpRight className="w-3 h-3" /> +18%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(174,62%,38%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(174,62%,38%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(200,10%,90%)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(210,12%,50%)', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(210,12%,50%)', fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid hsl(200,10%,90%)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(174,62%,38%)" strokeWidth={3} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-card rounded-2xl border border-border/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground">Recent Appointments</h3>
                <p className="text-xs text-muted-foreground">Latest patient appointments</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          <div className="space-y-3">
            {recentAppointments?.map((apt, i) => {
              const status = statusConfig[apt.status] || statusConfig.Pending;
              const StatusIcon = status.icon;
              return (
                <motion.div 
                  key={apt._id ?? i} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                      <span className="font-bold text-primary">{apt.patient?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{apt.patient}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" /> {apt.doctor}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        {apt.time}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Departments */}
        <motion.div variants={itemVariants} className="bg-card rounded-2xl border border-border/60 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground">Departments</h3>
              <p className="text-xs text-muted-foreground">Patient distribution</p>
            </div>
          </div>
          
          {/* Donut Chart */}
          <div className="relative flex justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie 
                  data={departmentData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={85} 
                  paddingAngle={6} 
                  dataKey="value"
                  stroke="none"
                >
                  {departmentData?.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-2xl font-bold text-foreground">{departmentData?.reduce((a, b) => a + b.value, 0)}%</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>

          {/* Department Legend */}
          <div className="space-y-3 mt-4">
            {departmentData?.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-sm text-foreground">{d.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.value}%`, backgroundColor: COLORS[i] }} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground w-8">{d.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}