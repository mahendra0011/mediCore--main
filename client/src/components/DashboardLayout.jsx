import { useState, useEffect } from 'react';
import AppSidebar from './AppSidebar';

export default function DashboardLayout({ children }) {
  const [sidebarWidth, setSidebarWidth] = useState(256);

  useEffect(() => {
    const obs = new MutationObserver(() => {
      const aside = document.querySelector('aside');
      if (aside) setSidebarWidth(aside.offsetWidth);
    });
    const aside = document.querySelector('aside');
    if (aside) {
      setSidebarWidth(aside.offsetWidth);
      obs.observe(aside, { attributes: true, attributeFilter: ['class'] });
    }
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main
        className="min-h-screen p-6 md:p-8 transition-all duration-300 animate-fade-in"
        style={{ marginLeft: sidebarWidth }}
      >
        {children}
      </main>
    </div>
  );
}
