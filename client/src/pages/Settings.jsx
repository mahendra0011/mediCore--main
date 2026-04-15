import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { User, Lock, Bell, Shield, Save, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const roleBadge = { admin:'bg-primary/15 text-primary', doctor:'bg-info/15 text-info', patient:'bg-success/15 text-success' };

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saved, setSaved] = useState(false);

  const saveMut = useMutation({
    mutationFn: () => api.updateProfile({ name, phone }),
    onSuccess: (data) => { updateUser(data); setSaved(true); setTimeout(() => setSaved(false), 2500); },
  });

  const tabs = [
    { key: 'profile', label: 'Profile',       icon: User   },
    { key: 'security', label: 'Security',      icon: Lock   },
    { key: 'notif',   label: 'Notifications', icon: Bell   },
    { key: 'privacy', label: 'Privacy',        icon: Shield },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 max-w-4xl">
        {/* Sidebar Tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-card rounded-xl border shadow-sm p-2 flex lg:flex-col gap-1">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left ${tab === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />{label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5">
          {tab === 'profile' && (
            <>
              {/* Avatar Card */}
              <div className="bg-card rounded-xl border shadow-sm p-6">
                <h3 className="font-heading font-semibold text-lg text-card-foreground mb-5">Profile Photo</h3>
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-heading font-bold text-2xl shadow-lg shadow-primary/20">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-card border-2 border-background rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                      <Camera className="w-3.5 h-3.5 text-foreground" />
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block capitalize ${roleBadge[user?.role] ?? 'bg-muted text-muted-foreground'}`}>{user?.role}</span>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="bg-card rounded-xl border shadow-sm p-6">
                <h3 className="font-heading font-semibold text-lg text-card-foreground mb-5">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Email Address</label>
                    <Input value={user?.email ?? ''} disabled className="opacity-60 cursor-not-allowed" />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number</label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234-567-8900" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Role</label>
                    <Input value={user?.role ?? ''} disabled className="opacity-60 cursor-not-allowed capitalize" />
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-5">
                  <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending} className="gap-2">
                    <Save className="w-4 h-4" />{saveMut.isPending ? 'Saving…' : 'Save Changes'}
                  </Button>
                  {saved && <span className="text-sm text-success font-medium flex items-center gap-1">✓ Saved!</span>}
                </div>
              </div>
            </>
          )}

          {tab === 'security' && (
            <div className="bg-card rounded-xl border shadow-sm p-6">
              <h3 className="font-heading font-semibold text-lg text-card-foreground mb-5">Change Password</h3>
              <div className="space-y-4 max-w-sm">
                <div><label className="text-sm font-medium mb-1.5 block">Current Password</label><Input type="password" placeholder="••••••••" /></div>
                <div><label className="text-sm font-medium mb-1.5 block">New Password</label><Input type="password" placeholder="••••••••" /></div>
                <div><label className="text-sm font-medium mb-1.5 block">Confirm New Password</label><Input type="password" placeholder="••••••••" /></div>
                <Button className="gap-2"><Lock className="w-4 h-4" /> Update Password</Button>
              </div>
            </div>
          )}

          {tab === 'notif' && (
            <div className="bg-card rounded-xl border shadow-sm p-6">
              <h3 className="font-heading font-semibold text-lg text-card-foreground mb-5">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  ['Email notifications', 'Receive appointment reminders via email'],
                  ['SMS alerts', 'Get text messages for urgent updates'],
                  ['System notifications', 'In-app notification popups'],
                  ['Weekly reports', 'Summary reports every Monday'],
                ].map(([title, desc]) => (
                  <div key={title} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    <button className="w-11 h-6 bg-primary rounded-full relative transition-colors">
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'privacy' && (
            <div className="bg-card rounded-xl border shadow-sm p-6">
              <h3 className="font-heading font-semibold text-lg text-card-foreground mb-5">Privacy & Data</h3>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your data is stored securely and never shared with third parties. All medical records are encrypted at rest and in transit.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button variant="outline" className="gap-2"><Shield className="w-4 h-4" /> Download My Data</Button>
                  <Button variant="outline" className="gap-2 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60 hover:bg-destructive/5">
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
