import { useState, useMemo } from 'react';
import { FileText, Tags, BarChart3, Copy, Download, Shield, CheckCircle2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import { useAppStore, projectList } from '@/store';
import { standardTerms, consultantStats } from '@/data/mock';

const TAG_STYLE: Record<string, string> = {
  '高龄客户': 'bg-coral-50 text-coral-700 border-coral-200',
  '大额储值': 'bg-amber-50 text-amber-700 border-amber-200',
  '大额充值': 'bg-amber-50 text-amber-700 border-amber-200',
  '短期多次充值': 'bg-coral-50 text-coral-700 border-coral-200',
  '短期频繁充值': 'bg-coral-50 text-coral-700 border-coral-200',
  '赠送超标': 'bg-amber-50 text-amber-700 border-amber-200',
  '旧卡未消耗': 'bg-mint-50 text-emerald-700 border-mint-200',
};

const RISK_STYLE: Record<string, string> = { green: 'risk-badge-green', yellow: 'risk-badge-yellow', red: 'risk-badge-red' };
const RISK_LABEL: Record<string, string> = { green: '低', yellow: '中', red: '高' };
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月'];
const LINE_COLORS = ['#1B2A4A', '#E85D50', '#34D399'];

export default function Trace() {
  const { customers, plans, currentConsultant } = useAppStore();
  const [tab, setTab] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [toast, setToast] = useState('');

  const eligiblePlans = useMemo(() => plans.filter((p) => p.status === 'submitted' || p.status === 'completed'), [plans]);
  const selectedPlan = useMemo(() => eligiblePlans.find((p) => p.id === selectedPlanId), [eligiblePlans, selectedPlanId]);
  const customer = useMemo(() => (selectedPlan ? customers.find((c) => c.id === selectedPlan.customerId) : null), [selectedPlan, customers]);
  const completedPlans = useMemo(() => plans.filter((p) => p.status === 'completed'), [plans]);
  const showTeamTab = currentConsultant.role === 'supervisor' || currentConsultant.role === 'leader';

  const barData = useMemo(() => consultantStats.map((s) => ({ name: s.consultantName, 异常率: s.abnormalRate })), []);
  const trendData = useMemo(() => MONTHS.map((m, i) => {
    const row: Record<string, string | number> = { month: m };
    consultantStats.forEach((s) => { row[s.consultantName] = s.trend[i]; });
    return row;
  }), []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  const docText = useMemo(() => {
    if (!selectedPlan || !customer) return '';
    return [
      '储值服务协议', '',
      `客户姓名：${customer.name}`,
      `充值金额：¥${selectedPlan.amount.toLocaleString()}`,
      `赠送比例：${(selectedPlan.giftRatio * 100).toFixed(0)}%`,
      `绑定项目：${selectedPlan.boundProjects.join('、')}`,
      `有效期：${selectedPlan.validityPeriod}个月`, '',
      standardTerms,
    ].join('\n');
  }, [selectedPlan, customer]);

  const tabs = [
    { icon: FileText, label: '储值说明生成器' },
    { icon: Tags, label: '风险标签管理' },
    ...(showTeamTab ? [{ icon: BarChart3, label: '团队异常统计' }] : []),
  ];

  return (
    <div className="flex flex-col h-full p-6 gap-5">
      <div className="flex gap-2">
        {tabs.map((t, i) => (
          <button key={t.label} onClick={() => setTab(i)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === i ? 'bg-navy-700 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {toast && (
        <div className="fixed top-4 right-4 z-50 card-base px-4 py-2.5 text-sm text-emerald-700 border-mint-200 bg-mint-50 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" /> {toast}
        </div>
      )}

      {tab === 0 && (
        <div className="flex gap-6 flex-1 overflow-hidden">
          <div className="w-64 space-y-4 flex-shrink-0">
            <div className="card-base p-4">
              <label className="text-xs text-slate-500 mb-1.5 block">选择方案</label>
              <select className="input-base" value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)}>
                <option value="">请选择已提交方案</option>
                {eligiblePlans.map((p) => {
                  const c = customers.find((cu) => cu.id === p.customerId);
                  return <option key={p.id} value={p.id}>{c?.name ?? '未知'} - ¥{p.amount.toLocaleString()}</option>;
                })}
              </select>
            </div>
            <div className="flex gap-2">
              <button className="btn-outline flex-1 flex items-center justify-center gap-1.5" disabled={!selectedPlan}
                onClick={() => { navigator.clipboard.writeText(docText); showToast('已复制到剪贴板'); }}>
                <Copy className="w-3.5 h-3.5" /> 复制
              </button>
              <button className="btn-primary flex-1 flex items-center justify-center gap-1.5" disabled={!selectedPlan}
                onClick={() => showToast('已导出')}>
                <Download className="w-3.5 h-3.5" /> 导出
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {selectedPlan && customer ? (
              <div className="bg-white max-w-[680px] mx-auto shadow-elevated rounded-lg p-10 text-sm leading-relaxed" style={{ minHeight: 800 }}>
                <h2 className="text-center text-lg font-bold text-navy-700 mb-6">储值服务协议</h2>
                <div className="space-y-2 text-slate-700">
                  <p><span className="text-slate-500">客户姓名：</span>{customer.name}</p>
                  <p><span className="text-slate-500">充值金额：</span>¥{selectedPlan.amount.toLocaleString()}</p>
                  <p><span className="text-slate-500">赠送比例：</span>{(selectedPlan.giftRatio * 100).toFixed(0)}%</p>
                  <p><span className="text-slate-500">绑定项目：</span>{selectedPlan.boundProjects.join('、')}</p>
                  <p><span className="text-slate-500">有效期：</span>{selectedPlan.validityPeriod}个月</p>
                </div>
                <hr className="my-5 border-slate-200" />
                <pre className="whitespace-pre-wrap text-xs text-slate-600 font-sans leading-relaxed">{standardTerms}</pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">请先选择方案以预览储值说明</div>
            )}
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="flex-1 overflow-auto">
          <div className="card-base overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs">
                  <th className="text-left px-4 py-3 font-medium">客户</th>
                  <th className="text-left px-4 py-3 font-medium">金额</th>
                  <th className="text-left px-4 py-3 font-medium">风险等级</th>
                  <th className="text-left px-4 py-3 font-medium">风险标签</th>
                  <th className="text-left px-4 py-3 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {completedPlans.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-400">暂无已完成方案</td></tr>
                ) : completedPlans.map((p) => {
                  const c = customers.find((cu) => cu.id === p.customerId);
                  return (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium">{c?.name ?? '-'}</td>
                      <td className="px-4 py-3">¥{p.amount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${RISK_STYLE[p.riskLevel]}`}>{RISK_LABEL[p.riskLevel]}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {p.riskDetails.map((r, i) => (
                            <span key={i} className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${TAG_STYLE[r.type] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>{r.type}</span>
                          ))}
                          {p.riskDetails.length === 0 && <span className="text-slate-400 text-xs">无</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-navy-50 text-navy-700 border border-navy-200">
                          <Shield className="w-3 h-3" /> 收银台复核
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 2 && showTeamTab && (
        <div className="flex-1 overflow-auto space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="card-base p-5">
              <h3 className="section-title text-base mb-4">异常率分布</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="%" />
                  <Tooltip />
                  <Bar dataKey="异常率" fill="#1B2A4A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card-base p-5">
              <h3 className="section-title text-base mb-4">异常率趋势</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="%" />
                  <Tooltip />
                  <Legend />
                  {consultantStats.map((s, i) => (
                    <Line key={s.consultantId} type="monotone" dataKey={s.consultantName} stroke={LINE_COLORS[i]} strokeWidth={2} dot={{ r: 3 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card-base p-5">
            <h3 className="section-title text-base mb-4">咨询师排行</h3>
            <div className="space-y-2">
              {consultantStats.map((s) => (
                <div key={s.consultantId} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg ${s.abnormalRate > 20 ? 'bg-coral-50 border border-coral-200' : 'bg-slate-50'}`}>
                  <div className="w-8 h-8 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center text-xs font-bold">{s.avatar}</div>
                  <span className="font-medium text-sm flex-1">{s.consultantName}</span>
                  <span className="text-xs text-slate-500">总方案 {s.totalPlans}</span>
                  <span className="text-xs text-slate-500">异常 {s.abnormalPlans}</span>
                  <span className={`text-sm font-bold ${s.abnormalRate > 20 ? 'text-coral' : 'text-navy-700'}`}>{s.abnormalRate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
