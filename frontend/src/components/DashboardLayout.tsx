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
  LogOut
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

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['doctor', 'nurse', 'admin'] },
    { path: '/new-submission', label: 'New Submission', icon: FilePlus, roles: ['doctor', 'nurse', 'admin'] },
    { path: '/submissions', label: 'Submitted Reports', icon: FileText, roles: ['doctor', 'nurse', 'admin'] },
    { path: '/drafts', label: 'Drafts', icon: FileEdit, roles: ['doctor', 'nurse', 'admin'] },
    { path: '/pending-approvals', label: 'Pending Approvals', icon: CheckCircle, roles: ['doctor', 'admin'] },
    { path: '/rejected-submissions', label: 'Rejected Submissions', icon: XCircle, roles: ['doctor', 'nurse', 'admin'] },
    { path: '/settings', label: 'Settings', icon: Settings, roles: ['nurse', 'admin'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* SGDS Masthead (government banner) */}
      <SgdsMasthead />
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Sidebar toggle button for mobile */}
            <button
              className="md:hidden mr-2 bg-white border border-slate-200 rounded-full p-2 shadow-lg"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <img src="/logo.svg" alt="CheckUp logo" className="w-10 h-10 rounded-lg" />
            <div>
              <h1 className="text-slate-900 text-lg md:text-xl">CheckUp</h1>
              <p className="text-sm text-slate-600 hidden sm:block">{user?.clinicName}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <div>
                <div className="text-sm text-slate-900">{user?.name}</div>
                <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-blue-600 focus:outline-none w-full sm:w-auto" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex gap-6 flex-1">

        {/* Sidebar - overlays entire screen on mobile, modern look */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
        )}
        <aside
          className={`w-64 flex flex-col justify-between flex-shrink-0 md:static md:block fixed left-0 top-0 h-full z-50 bg-slate-50 border-r border-slate-200 shadow-lg transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:rounded-lg md:border md:bg-slate-50`}
          style={{ maxWidth: '100vw' }}
        >
          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-2 py-4">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));

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
