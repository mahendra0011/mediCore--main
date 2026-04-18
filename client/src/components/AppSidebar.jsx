import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UserRound, Stethoscope, CalendarDays, FileText,
  CreditCard, Settings, ChevronLeft, ChevronRight, Activity, LogOut,
  Home, Search, Star, Users, Shield, BarChart3, Bell, Building2, Clock, DollarSign, FileUp, Download, TestTube, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from './NotificationBell';

const navConfig = {
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard',        path: '/dashboard'        },
    { icon: Users,           label: 'Manage Users',     path: '/admin/users'      },
    { icon: Stethoscope,     label: 'Manage Doctors',   path: '/admin/doctors'    },
    { icon: UserRound,       label: 'Manage Patients',  path: '/patients'         },
    { icon: CalendarDays,    label: 'Appointments',     path: '/appointments'     },
    { icon: FileText,        label: 'Medical Records',  path: '/records'          },
    { icon: CreditCard,      label: 'Billing',          path: '/billing'          },
    { icon: Building2,       label: 'Departments',      path: '/admin/departments'},
    { icon: Star,            label: 'Reviews',          path: '/admin/reviews'    },
    { icon: BarChart3,       label: 'Analytics',        path: '/admin/analytics'  },
    { icon: AlertTriangle,  label: 'Emergency',        path: '/admin/emergency' },
    { icon: FileUp,          label: 'Import/Export',    path: '/import-export'    },
    { icon: Download,        label: 'Reports',          path: '/reports'          },
    { icon: Bell,            label: 'Notifications',    path: '/notifications'    },
    { icon: Settings,        label: 'Settings',         path: '/settings'         },
  ],
  doctor: [
    { icon: LayoutDashboard, label: 'Dashboard',        path: '/dashboard'           },
    { icon: CalendarDays,    label: 'My Appointments',  path: '/doctor/appointments' },
    { icon: UserRound,       label: 'My Patients',      path: '/doctor/patients'     },
    { icon: FileText,        label: 'Consultations',    path: '/doctor/consultations'},
    { icon: Clock,           label: 'My Schedule',      path: '/doctor/schedule'     },
    { icon: Download,        label: 'Reports',          path: '/reports'             },
    { icon: Star,            label: 'My Reviews',       path: '/doctor/reviews'      },
    { icon: DollarSign,      label: 'My Earnings',      path: '/doctor/earnings'     },
    { icon: AlertTriangle,  label: 'Emergency',        path: '/doctor/emergency'   },
    { icon: Bell,            label: 'Notifications',    path: '/notifications'       },
    { icon: Settings,        label: 'Settings',         path: '/settings'            },
  ],
  patient: [
    { icon: LayoutDashboard, label: 'Dashboard',         path: '/dashboard'            },
    { icon: Search,          label: 'Find Doctors',      path: '/patient/doctors'      },
    { icon: CalendarDays,    label: 'My Appointments',   path: '/patient/appointments' },
    { icon: TestTube,       label: 'Lab Services',    path: '/patient/services'    },
    { icon: AlertTriangle,  label: 'Emergency',        path: '/patient/emergency'   },
    { icon: FileText,        label: 'Medical Records', path: '/patient/records'    },
    { icon: FileUp,          label: 'Upload Files',     path: '/upload'              },
    { icon: Download,        label: 'My Reports',        path: '/patient/reports'      },
    { icon: CreditCard,      label: 'My Billing',        path: '/patient/billing'      },
    { icon: DollarSign,      label: 'Payments',          path: '/patient/payment'      },
    { icon: Star,            label: 'My Reviews',        path: '/patient/reviews'      },
    { icon: Bell,            label: 'Notifications',     path: '/notifications'        },
    { icon: Settings,        label: 'Settings',          path: '/settings'             },
  ],
};

const roleBadgeColor = { admin: 'bg-primary/20 text-primary', doctor: 'bg-info/20 text-info', patient: 'bg-success/20 text-success' };

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = navConfig[user?.role] || navConfig.patient;

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 z-50 shadow-2xl ${collapsed ? 'w-[72px]' : 'w-64'}`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-sidebar-border ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-sidebar-primary/30">
          <Activity className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-heading text-base font-bold text-sidebar-primary-foreground leading-none">MediCore</h1>
            <p className="text-[10px] text-sidebar-foreground/50 mt-0.5">HMS Portal</p>
          </div>
        )}
      </div>

      {/* Notification Bell - always visible when logged in */}
      {user && (
        <div className={`px-3 py-2 ${collapsed ? 'flex justify-center' : ''}`}>
          <NotificationBell />
        </div>
      )}

      {/* User card */}
      {!collapsed && user && (
        <div className="mx-3 mt-3 p-3 bg-sidebar-accent/60 rounded-xl border border-sidebar-border/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-bold flex-shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${roleBadgeColor[user.role] || 'bg-muted text-muted-foreground'}`}>
                {user.role}
              </span>
            </div>
            <NotificationBell />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link key={path} to={path}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'} ${collapsed ? 'justify-center' : ''}`}>
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${!isActive ? 'group-hover:scale-110 transition-transform' : ''}`} />
              {!collapsed && <span className="text-sm font-medium">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`px-2 pb-4 border-t border-sidebar-border pt-3 ${collapsed ? 'flex justify-center' : ''}`}>
        <button onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full ${collapsed ? 'justify-center' : ''}`}>
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10">
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
