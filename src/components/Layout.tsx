import { NavLink, Outlet } from 'react-router-dom';
import {
  Search,
  Calculator,
  AlertTriangle,
  CheckSquare,
  Bell,
  FileText,
  LayoutDashboard,
  Shield,
} from 'lucide-react';
import { useAppStore } from '@/store';

const navItems = [
  { path: '/', label: '工作台', icon: LayoutDashboard },
  { path: '/customer', label: '客户查询', icon: Search },
  { path: '/plan', label: '方案试算', icon: Calculator },
  { path: '/redline', label: '活动红线', icon: AlertTriangle },
  { path: '/approval', label: '主管审批', icon: CheckSquare },
  { path: '/reminder', label: '跟进提醒', icon: Bell },
  { path: '/trace', label: '话术留痕', icon: FileText },
];

export default function Layout() {
  const currentConsultant = useAppStore((s) => s.currentConsultant);
  const pendingCount = useAppStore((s) => s.approvals.filter((a) => a.status === 'pending').length);

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-[220px] bg-navy-900 text-white flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-coral to-amber flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-wide">储值风控助手</div>
              <div className="text-[10px] text-navy-400">Risk Guard Pro</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-navy-700/80 text-white shadow-md shadow-navy-900/50'
                    : 'text-navy-300 hover:bg-navy-800/60 hover:text-white'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
              {item.path === '/approval' && pendingCount > 0 && (
                <span className="ml-auto bg-coral text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-navy-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal to-emerald flex items-center justify-center text-xs font-bold text-white">
              {currentConsultant.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{currentConsultant.name}</div>
              <div className="text-[10px] text-navy-400">
                {currentConsultant.role === 'leader' ? '团队负责人' : currentConsultant.role === 'supervisor' ? '主管' : '咨询师'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
