import { useState, useMemo } from 'react';
import {
  Search,
  Phone,
  User,
  CreditCard,
  Tag,
  AlertTriangle,
  Clock,
  Gift,
  Calendar,
  Package,
} from 'lucide-react';
import { useAppStore } from '@/store';

const statusStyle: Record<string, string> = {
  active: 'text-emerald-600 bg-mint-50',
  expiring: 'text-amber-700 bg-amber-50',
  expired: 'text-coral-700 bg-coral-50',
};
const statusLabel: Record<string, string> = {
  active: '生效中',
  expiring: '即将到期',
  expired: '已过期',
};
const riskBadge: Record<string, string> = {
  green: 'risk-badge-green',
  yellow: 'risk-badge-yellow',
  red: 'risk-badge-red',
};

export default function Customer() {
  const [phone, setPhone] = useState('');
  const selectedCustomerId = useAppStore((s) => s.selectedCustomerId);
  const setSelectedCustomerId = useAppStore((s) => s.setSelectedCustomerId);
  const searchCustomers = useAppStore((s) => s.searchCustomers);
  const getCustomerById = useAppStore((s) => s.getCustomerById);

  const results = useMemo(() => searchCustomers(phone), [phone, searchCustomers]);
  const customer = selectedCustomerId ? getCustomerById(selectedCustomerId) : null;

  const conflicts = useMemo(() => {
    if (!customer) return [];
    const alerts: { type: string; msg: string; level: 'yellow' | 'red' }[] = [];
    customer.packages.forEach((p) => {
      if (p.status === 'expiring')
        alerts.push({
          type: '即将到期',
          msg: `「${p.name}」将于 ${p.expiryDate} 到期，余额 ¥${p.remainingBalance.toLocaleString()}`,
          level: 'yellow',
        });
      if (p.status === 'expired')
        alerts.push({
          type: '已过期',
          msg: `「${p.name}」已过期，余额 ¥${p.remainingBalance.toLocaleString()}`,
          level: 'red',
        });
    });
    const allProjects = customer.packages.flatMap((p) => p.boundProjects);
    const overlap = allProjects.filter((p, i) => allProjects.indexOf(p) !== i);
    [...new Set(overlap)].forEach((proj) =>
      alerts.push({
        type: '项目重叠',
        msg: `「${proj}」在多个套餐中绑定，可能导致余额纠纷`,
        level: 'yellow',
      })
    );
    return alerts;
  }, [customer]);

  if (customer) {
    return (
      <div className="p-6 animate-fade-in space-y-5">
        <button
          onClick={() => setSelectedCustomerId(null)}
          className="text-sm text-navy-500 hover:text-navy-700 transition-colors"
        >
          ← 返回搜索
        </button>

        <div className="card-base p-5 flex gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-navy-100 flex items-center justify-center">
                <User className="w-10 h-10 text-navy-400" />
              </div>
              <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold level-${customer.level.toLowerCase()}`}>
                {customer.level}
              </span>
            </div>
            <h2 className="text-lg font-bold text-navy-800">{customer.name}</h2>
            <span className="text-sm text-slate-500">{customer.age}岁</span>
            <span className="text-sm text-slate-500 flex items-center gap-1">
              <Phone className="w-3 h-3" />{customer.phone}
            </span>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-3">
            {[
              { label: '未消耗余额', value: `¥${customer.unusedBalance.toLocaleString()}`, icon: CreditCard },
              { label: '储值等级', value: customer.level, icon: Tag },
              { label: '活跃套餐数', value: customer.packages.filter((p) => p.status === 'active').length.toString(), icon: Package },
              {
                label: '风险标签',
                value: customer.riskTags.length ? customer.riskTags.join('、') : '无',
                icon: AlertTriangle,
                danger: customer.riskTags.length > 0,
              },
            ].map((s) => (
              <div key={s.label} className="card-base p-3 flex items-center gap-3">
                <s.icon className={`w-5 h-5 ${s.danger ? 'text-coral' : 'text-navy-400'}`} />
                <div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                  <div className={`text-sm font-semibold ${s.danger ? 'text-coral' : 'text-navy-700'}`}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {customer.preferences.length > 0 && (
          <div className="card-base p-4">
            <h3 className="section-title mb-2">偏好项目</h3>
            <div className="flex flex-wrap gap-2">
              {customer.preferences.map((p) => (
                <span key={p} className="px-2.5 py-1 rounded-full text-xs font-medium bg-navy-50 text-navy-600 border border-navy-100">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="card-base p-4">
          <h3 className="section-title mb-3">套餐列表</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="pb-2 font-medium">名称</th>
                  <th className="pb-2 font-medium">金额</th>
                  <th className="pb-2 font-medium">赠送比</th>
                  <th className="pb-2 font-medium">剩余余额</th>
                  <th className="pb-2 font-medium">到期日</th>
                  <th className="pb-2 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {customer.packages.map((pk) => (
                  <tr key={pk.id} className="border-b border-slate-50">
                    <td className="py-2 font-medium text-navy-700">{pk.name}</td>
                    <td className="py-2">¥{pk.amount.toLocaleString()}</td>
                    <td className="py-2">{(pk.giftRatio * 100).toFixed(0)}%</td>
                    <td className="py-2">¥{pk.remainingBalance.toLocaleString()}</td>
                    <td className="py-2">{pk.expiryDate}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusStyle[pk.status]}`}>
                        {statusLabel[pk.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-base p-4">
          <h3 className="section-title mb-3">充值记录</h3>
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-2 top-1 bottom-1 w-px bg-slate-200" />
            {customer.rechargeHistory.map((rh) => (
              <div key={rh.id} className="relative animate-fade-in">
                <div className="absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full bg-navy-400 border-2 border-white" />
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />{rh.date}
                </div>
                <div className="text-sm font-medium text-navy-700">
                  充值 ¥{rh.amount.toLocaleString()}
                  <span className="ml-2 text-xs text-mint-500 flex items-center inline-flex gap-0.5">
                    <Gift className="w-3 h-3" />赠 ¥{rh.giftAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {conflicts.length > 0 && (
          <div className="card-base p-4 border-l-4 border-l-amber">
            <h3 className="section-title mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber" />冲突预警
            </h3>
            <div className="space-y-2">
              {conflicts.map((c, i) => (
                <div key={i} className={`px-3 py-2 rounded-lg text-sm ${riskBadge[c.level]}`}>
                  <span className="font-medium">[{c.type}]</span> {c.msg}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="max-w-md mx-auto mt-12">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="输入手机号搜索客户…"
            className="input-base pl-9"
          />
        </div>

        {results.length > 0 && (
          <div className="mt-4 space-y-2">
            {results.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCustomerId(c.id)}
                className="card-base card-hover p-4 cursor-pointer flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-navy-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-navy-700">{c.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold level-${c.level.toLowerCase()}`}>
                      {c.level}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />{c.phone}
                  </div>
                </div>
                <Clock className="w-4 h-4 text-slate-300" />
              </div>
            ))}
          </div>
        )}

        {phone && results.length === 0 && (
          <p className="text-center text-sm text-slate-400 mt-8">未找到匹配客户</p>
        )}
      </div>
    </div>
  );
}
