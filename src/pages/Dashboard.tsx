import { useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Search,
  Calculator,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { consultantStats } from '@/data/mock';

const riskBadge = { green: 'risk-badge-green', yellow: 'risk-badge-yellow', red: 'risk-badge-red' };
const riskLabel = { green: '低风险', yellow: '中风险', red: '高风险' };

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentConsultant, customers, plans, approvals, reminders } = useAppStore();

  const pendingCount = approvals.filter((a) => a.status === 'pending').length;
  const todayReminders = reminders.filter((r) => !r.completed);
  const activeCustomers = customers.length;
  const totalPlans = consultantStats.reduce((s, c) => s + c.totalPlans, 0);
  const totalAbnormal = consultantStats.reduce((s, c) => s + c.abnormalPlans, 0);
  const abnormalRate = totalPlans > 0 ? ((totalAbnormal / totalPlans) * 100).toFixed(1) : '0';

  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
  const hour = now.getHours();
  const greeting = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';

  const recentPlans = [...plans]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentActivities = [
    ...approvals.map((a) => ({
      id: a.id,
      type: 'approval' as const,
      title: `${a.consultantName} 提交了 ${a.customerName} 的方案审批`,
      status: a.status,
      time: a.createdAt,
      riskLevel: a.riskLevel,
    })),
    ...reminders.map((r) => ({
      id: r.id,
      type: 'reminder' as const,
      title: r.message,
      status: r.completed ? ('completed' as const) : ('pending' as const),
      time: r.dueDate,
      riskLevel: r.urgency === 'high' ? 'red' : r.urgency === 'medium' ? 'yellow' : 'green',
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6);

  const statCards = [
    { label: '待处理审批', value: pendingCount, icon: AlertTriangle, color: 'text-coral', bg: 'bg-coral-50' },
    { label: '今日待跟进', value: todayReminders.length, icon: Clock, color: 'text-amber', bg: 'bg-amber-50' },
    { label: '活跃客户数', value: activeCustomers, icon: Users, color: 'text-navy-700', bg: 'bg-navy-50' },
    { label: '异常方案占比', value: `${abnormalRate}%`, icon: CheckCircle2, color: 'text-mint', bg: 'bg-mint-50' },
  ];

  const quickActions = [
    { label: '客户查询', icon: Search, path: '/customer', color: 'bg-navy-700' },
    { label: '方案试算', icon: Calculator, path: '/plan', color: 'bg-emerald-600' },
    { label: '活动红线', icon: Shield, path: '/redline', color: 'bg-coral' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="animate-slide-up">
        <h1 className="text-2xl font-bold text-navy-700">
          {greeting}，{currentConsultant.name}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{dateStr}</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={card.label} className="card-base p-4 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card-base p-5 animate-slide-up" style={{ animationDelay: '240ms' }}>
          <h2 className="section-title mb-4">风险概览</h2>
          {recentPlans.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">暂无方案数据</p>
          ) : (
            <div className="space-y-3">
              {recentPlans.map((plan) => {
                const customer = customers.find((c) => c.id === plan.customerId);
                return (
                  <div key={plan.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${riskBadge[plan.riskLevel]}`}>
                        {riskLabel[plan.riskLevel]}
                      </span>
                      <span className="text-sm text-slate-700 font-medium">{customer?.name ?? '未知'}</span>
                      <span className="text-xs text-slate-400">
                        ¥{(plan.amount / 10000).toFixed(1)}万 · 赠{(plan.giftRatio * 100).toFixed(0)}%
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(plan.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card-base p-5 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h2 className="section-title mb-4">快捷操作</h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <div className={`w-9 h-9 rounded-lg ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700 flex-1">{action.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card-base p-5 animate-slide-up" style={{ animationDelay: '360ms' }}>
        <h2 className="section-title mb-4">最近动态</h2>
        <div className="space-y-3">
          {recentActivities.map((act) => (
            <div key={act.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 risk-dot-${act.riskLevel}`} />
              <span className="text-sm text-slate-600 flex-1 truncate">{act.title}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${riskBadge[act.riskLevel]}`}>
                {act.type === 'approval'
                  ? act.status === 'pending' ? '待审批' : act.status === 'approved' ? '已通过' : '已驳回'
                  : act.status === 'completed' ? '已完成' : '待跟进'}
              </span>
              <span className="text-xs text-slate-400 flex-shrink-0">
                {new Date(act.time).toLocaleDateString('zh-CN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
