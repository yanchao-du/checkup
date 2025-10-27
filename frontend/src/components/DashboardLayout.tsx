import { ReactNode } from 'react';
// SGDS masthead web component (top banner)
import SgdsMasthead from '@govtechsg/sgds-web-component/react/masthead/index.js';
import SgdsFooter from '@govtechsg/sgds-web-component/react/footer/index.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ProtectedLink } from './ProtectedLink';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
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
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['doctor', 'nurse', 'admin'] },
    { path: '/new-submission', label: 'New Submission', icon: FilePlus, roles: ['doctor', 'nurse', 'admin'] },
    { path: '/submissions', label: 'Submissions', icon: FileText, roles: ['doctor', 'nurse', 'admin'] },
    { path: '/drafts', label: 'Drafts', icon: FileEdit, roles: ['doctor', 'nurse', 'admin'] },
    { path: '/pending-approvals', label: 'Pending Approvals', icon: CheckCircle, roles: ['doctor', 'admin'] },
    { path: '/rejected-submissions', label: 'Rejected Submissions', icon: XCircle, roles: ['doctor', 'nurse', 'admin'] },
    { path: '/settings', label: 'Settings', icon: Settings, roles: ['nurse', 'admin'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* SGDS Masthead (government banner) */}
      <SgdsMasthead />
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="CheckUp logo" className="w-10 h-10 rounded-lg" />
            <div>
              <h1 className="text-slate-900">CheckUp</h1>
              <p className="text-sm text-slate-600">{user?.clinicName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {user?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm text-slate-900">{user?.name}</div>
                <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex gap-6 flex-1">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <nav className="bg-white rounded-lg border border-slate-200 p-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              // Highlight if current path matches or starts with item.path (for dashboard, exact match)
              const isActive =
                (item.path === '/' && location.pathname === '/') ||
                (item.path !== '/' && location.pathname.startsWith(item.path));

              return (
                <ProtectedLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold shadow'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </ProtectedLink>
              );
            })}
          </nav>
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
