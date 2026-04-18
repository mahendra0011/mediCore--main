import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Trash2, Shield, Stethoscope, UserRound, Ban, CheckCircle, Filter, UserPlus, Mail, Phone, Calendar, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

const roleConfig = {
  admin: { color: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/10', text: 'text-violet-600', icon: Shield, label: 'Admin' },
  doctor: { color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', text: 'text-blue-600', icon: Stethoscope, label: 'Doctor' },
  patient: { color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: UserRound, label: 'Patient' },
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers({ search, role: roleFilter });
      setUsers(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, [search, roleFilter]);

  const handleDelete = async (id) => {
    try { await api.deleteUser(id); loadUsers(); } catch (e) { console.error(e); }
  };

  const handleBlock = async (id) => {
    try { await api.blockUser(id); loadUsers(); } catch (e) { console.error(e); }
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    doctors: users.filter(u => u.role === 'doctor').length,
    patients: users.filter(u => u.role === 'patient').length,
  };

  const filterOptions = [
    { value: 'All', label: 'All Users', icon: Users },
    { value: 'admin', label: 'Admins', icon: Shield },
    { value: 'doctor', label: 'Doctors', icon: Stethoscope },
    { value: 'patient', label: 'Patients', icon: UserRound },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Manage Users</h1>
          <p className="text-muted-foreground mt-1">View, block, or remove user accounts</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" /> Add User
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'from-slate-500 to-slate-600' },
          { label: 'Admins', value: stats.admins, icon: Shield, color: 'from-violet-500 to-purple-500' },
          { label: 'Doctors', value: stats.doctors, icon: Stethoscope, color: 'from-blue-500 to-cyan-500' },
          { label: 'Patients', value: stats.patients, icon: UserRound, color: 'from-emerald-500 to-teal-500' },
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

      {/* Search & Filter */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} 
        className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users by name or email..." 
            className="pl-11 h-12 rounded-xl border-border/60" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
          {filterOptions.map(opt => (
            <button key={opt.value} onClick={() => setRoleFilter(opt.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap 
                ${roleFilter === opt.value ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
              <opt.icon className="w-4 h-4" /> {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Users Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : users.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-border/60 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-xl font-semibold text-foreground mb-2">No Users Found</h3>
          <p className="text-muted-foreground">No users match your search criteria</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u, i) => {
            const config = roleConfig[u.role] || roleConfig.patient;
            const RoleIcon = config.icon;
            
            return (
              <motion.div key={u.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border/60 p-5 hover:shadow-xl hover:border-primary/20 transition-all group cursor-pointer"
                onClick={() => setSelectedUser(u)}>
                {/* Gradient accent */}
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${config.color.replace('from-', '').replace(' to-', '-')}`} />
                
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <span className="text-white font-bold text-lg">{u.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-lg text-foreground truncate">{u.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mt-2 ${config.bg} ${config.text}`}>
                      <RoleIcon className="w-3 h-3" /> {config.label}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.status === 'blocked' ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                    {u.status === 'blocked' ? 'Blocked' : 'Active'}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleBlock(u.id); }}>
                      {u.status === 'blocked' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Ban className="w-4 h-4 text-amber-500" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDelete(u.id); }}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl border border-border w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl font-bold text-foreground">User Details</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)}><X className="w-5 h-5" /></Button>
            </div>
            
            {(() => {
              const config = roleConfig[selectedUser.role] || roleConfig.patient;
              const RoleIcon = config.icon;
              
              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-bold text-2xl">{selectedUser.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h4 className="font-heading text-lg font-semibold text-foreground">{selectedUser.name}</h4>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                        <RoleIcon className="w-3 h-3" /> {config.label}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium text-foreground">{selectedUser.email}</p>
                      </div>
                    </div>
                    {selectedUser.phone && (
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm font-medium text-foreground">{selectedUser.phone}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className={`text-sm font-medium ${selectedUser.status === 'blocked' ? 'text-red-600' : 'text-emerald-600'}`}>
                          {selectedUser.status === 'blocked' ? 'Blocked' : 'Active'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => { handleBlock(selectedUser.id); setSelectedUser(null); }}>
                      {selectedUser.status === 'blocked' ? 'Unblock User' : 'Block User'}
                    </Button>
                    <Button variant="destructive" className="flex-1" onClick={() => { handleDelete(selectedUser.id); setSelectedUser(null); }}>
                      Delete User
                    </Button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </div>
      )}
    </div>
  );
}