import { ReactNode } from 'react';
import { useState } from 'react';
// SGDS masthead web component (top banner)
import SgdsMasthead from '@govtechsg/sgds-web-component/react/masthead/index.js';
import SgdsFooter from '@govtechsg/sgds-web-component/react/footer/index.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ProtectedLink } from './ProtectedLink';
import { Button } from './ui/button';
// import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  LayoutDashboard, 
  FilePlus, 
  FileText, 
  FileEdit, 
  CheckCircle,
  XCircle,
  Settings,
  LogOut,
  HelpCircle
} from 'lucide-react';
import "@govtechsg/sgds-web-component/themes/day.css";
import "@govtechsg/sgds-web-component/css/sgds.css";
import "@govtechsg/sgds-web-component";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleHelp = () => {
    navigate('/help');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['doctor', 'nurse', 'admin'] },
    { path: '/new-submission', label: 'New Report', icon: FilePlus, roles: ['doctor', 'nurse', 'admin'] },
    { 
      path: '/pending-approvals', 
      label: user?.role === 'doctor' ? 'Pending My Approval' : 'Pending Doctor Approval', 
      icon: CheckCircle, 
      roles: ['doctor', 'admin'] 
    },
    { path: '/submissions', label: 'Submitted Reports', icon: FileText, roles: ['doctor', 'nurse', 'admin'] },
    { path: '/drafts', label: 'Drafts', icon: FileEdit, roles: ['doctor', 'nurse', 'admin'] },
    { 
      path: '/rejected-submissions', 
      label: user?.role === 'doctor' ? 'Rejected by Me' : 'Rejected by Doctor', 
      icon: XCircle, 
      roles: ['doctor', 'nurse', 'admin'] 
    },
    { path: '/settings', label: 'Settings', icon: Settings, roles: ['nurse', 'admin'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* SGDS Masthead (government banner) */}
      <SgdsMasthead />
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-[40]">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Sidebar toggle button for mobile and tablets */}
            <button
              className="lg:hidden mr-2 bg-white border border-slate-200 rounded-full p-2 shadow-lg"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <img src="/logo.svg" alt="goCheckUp logo" className="w-10 h-10 rounded-lg" />
            <div>
              <h1 className="text-slate-900 text-lg md:text-xl">goCheckUp</h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <div>
                <div className="text-sm text-slate-900">{user?.name}</div>
                <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
                {/* <div className="text-xs text-slate-600">{user?.clinicName}</div> */}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-slate-600 hover:text-blue-600 focus:outline-none w-full sm:w-auto" 
              onClick={handleHelp}
              title="View User Guide"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </Button>
            <Button variant="outline" size="sm" className="text-blue-600 focus:outline-none w-full sm:w-auto" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex gap-6 flex-1">

        {/* Sidebar - overlays entire screen on mobile and tablets, modern look */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
        )}
        <aside
          className={`w-64 flex flex-col justify-between flex-shrink-0 fixed lg:sticky left-0 top-0 lg:top-16 h-full lg:h-[calc(100vh-4rem)] z-50 lg:z-10 bg-slate-50 border-r border-slate-200 shadow-lg transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:rounded-lg lg:border lg:bg-slate-50`}
          style={{ maxWidth: '100vw' }}
        >
          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-2 py-4">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));

              // Only for Settings, nest admin links below
              if (item.path === '/settings' && user?.role === 'admin') {
                return (
                  <div key={item.path}>
                    <ProtectedLink
                      to={item.path}
                      className={`group flex items-center gap-3 px-4 py-2 rounded-none transition-all font-medium text-base ${
                        isActive
                          ? 'bg-white text-blue-700 shadow border-l-4 border-blue-600'
                          : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
                      <span>{item.label}</span>
                    </ProtectedLink>
                    {/* Admin management links nested below Settings */}
                    <div className="ml-8 mt-1 flex flex-col gap-1">
                      <ProtectedLink to="/settings?tab=users" className="group flex items-center gap-3 px-4 py-2 text-base text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                        <span className="w-5 h-5"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" /></svg></span>
                        <span>User Management</span>
                      </ProtectedLink>
                      <ProtectedLink to="/settings?tab=clinics" className="group flex items-center gap-3 px-4 py-2 text-base text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                        <span className="w-5 h-5"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5V6a3 3 0 013-3h12a3 3 0 013 3v1.5M3 7.5v9A3 3 0 006 19.5h12a3 3 0 003-3v-9M3 7.5h18" /></svg></span>
                        <span>Clinic Management</span>
                      </ProtectedLink>
                      <ProtectedLink to="/settings?tab=doctor-assignments" className="group flex items-center gap-3 px-4 py-2 text-base text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                        <span className="w-5 h-5"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" /></svg></span>
                        <span>Doctor Assignment</span>
                      </ProtectedLink>
                      <ProtectedLink to="/settings?tab=nurse-assignments" className="group flex items-center gap-3 px-4 py-2 text-base text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                        <span className="w-5 h-5"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" /></svg></span>
                        <span>Nurse/Assistant Assignment</span>
                      </ProtectedLink>
                    </div>
                  </div>
                );
              }

              return (
                <ProtectedLink
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center gap-3 px-4 py-2 rounded-none transition-all font-medium text-base ${
                    isActive
                      ? 'bg-white text-blue-700 shadow border-l-4 border-blue-600'
                      : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
                  <span>{item.label}</span>
                </ProtectedLink>
              );
            })}
          </nav>
          {/* User profile section at bottom */}
            {/* ...user profile section removed for cleaner sidebar... */}
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
      <SgdsFooter />
    </div>
  );
}
