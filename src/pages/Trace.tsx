import { useState, useMemo } from 'react';
import {
  FileText, AlertTriangle, BarChart3, Copy, Download, CheckCircle2,
  Clock, User, UserCheck, Tag, CheckSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { useAppStore } from '@/store';
import { standardTerms, consultantStats } from '@/data/mock';

const PAYMENT_LABEL: Record<string, string> = {
  cash: '现金', bank_card: '银行卡', wechat: '微信', alipay: '支付宝', other: '其他',
};
const RELATION_LABEL: Record<string, string> = {
  self: '本人', family: '家属', friend: '朋友', company: '公司', other: '其他',
};

function tagClass(type: string) {
  if (type.includes('高龄') || type.includes('赠送超标') || type.includes('频繁') || type.includes('大额现金')) return 'risk-badge-red';
  if (type.includes('代付') || type.includes('旧卡') || type.includes('冲突')) return 'risk-badge-yellow';
  return 'risk-badge-green';
}

export default function Trace() {
  const { plans, customers, currentConsultant, markPlanCompleted } = useAppStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'script' | 'tag' | 'stats'>('script');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const submitablePlans = useMemo(
    () => plans.filter((p) => p.status === 'submitted' || p.status === 'completed'),
    [plans],
  );

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) ?? submitablePlans[0] ?? null,
    [plans, selectedPlanId, submitablePlans],
  );

  const selectedCustomer = useMemo(
    () => (selectedPlan ? customers.find((c) => c.id === selectedPlan.customerId) : null),
    [selectedPlan, customers],
  );

  const completedPlans = useMemo(
    () => plans.filter((p) => p.status === 'completed'),
    [plans],
  );

  const generateScript = () => {
    if (!selectedPlan || !selectedCustomer) return '';
    const giftAmt = Math.round(selectedPlan.amount * selectedPlan.giftRatio);
    return `【储值服务确认单】
客户姓名：${selectedCustomer.name}
联系电话：${selectedCustomer.phone}
客户年龄：${selectedCustomer.age}岁
储值等级：${selectedCustomer.level}

━━━━━━━━━━━━━━━━━━━━
方案明细
━━━━━━━━━━━━━━━━━━━━
充值金额：人民币 ¥${selectedPlan.amount.toLocaleString()} 元
赠送比例：${(selectedPlan.giftRatio * 100).toFixed(0)}%
赠送金额：人民币 ¥${giftAmt.toLocaleString()} 元
账户总额：人民币 ¥${(selectedPlan.amount + giftAmt).toLocaleString()} 元
绑定项目：${selectedPlan.boundProjects.join('、') || '通用项目'}
有效期：自充值之日起 ${selectedPlan.validityPeriod} 个月
支付方式：${PAYMENT_LABEL[selectedPlan.paymentMethod] ?? selectedPlan.paymentMethod}
付款人与客户关系：${RELATION_LABEL[selectedPlan.payerRelation] ?? selectedPlan.payerRelation}

${selectedPlan.specialNotes ? `━━━━━━━━━━━━━━━━━━━━\n补充说明\n━━━━━━━━━━━━━━━━━━━━\n${selectedPlan.specialNotes}\n\n` : ''}━━━━━━━━━━━━━━━━━━━━
风险提示
━━━━━━━━━━━━━━━━━━━━
${selectedPlan.riskDetails.length > 0 ? selectedPlan.riskDetails.map((r) => `【${r.type}】${r.message}`).join('\n') : '经风控检测，本方案合规。'}

━━━━━━━━━━━━━━━━━━━━
${standardTerms}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateScript());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleExport = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkCompleted = (planId: string) => {
    markPlanCompleted(planId);
  };

  return (
    <div className="p-6 space-y-5">
      <h1 className="section-title flex items-center gap-2">
        <FileText className="w-5 h-5 text-navy-500" /> 话术留痕
      </h1>

      <div className="flex gap-2 border-b border-slate-200 -mb-1">
        {[
          { key: 'script' as const, label: '储值说明生成器', icon: FileText },
          { key: 'tag' as const, label: '风险标签管理', icon: Tag },
          { key: 'stats' as const, label: '团队异常统计', icon: BarChart3 },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.key ? 'border-navy-700 text-navy-700' : 'border-transparent text-slate-500 hover:text-navy-600'}`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'script' && (
        <div className="flex gap-5">
          <div className="w-72 flex-shrink-0">
            <div className="card-base p-4">
              <h3 className="text-sm font-bold text-navy-600 mb-3 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4" /> 已提交方案
              </h3>
              {submitablePlans.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  暂无已提交方案
                  <button onClick={() => navigate('/plan')} className="block mx-auto mt-3 text-xs text-navy-600 hover:underline">
                    去方案试算 →
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-auto">
                  {submitablePlans.map((p) => {
                    const cust = customers.find((c) => c.id === p.customerId);
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPlanId(p.id)}
                        className={`w-full text-left card-hover p-3 rounded-lg border transition-all ${selectedPlan?.id === p.id ? 'border-navy-400 bg-navy-50' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-navy-700">{cust?.name ?? '未知客户'}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${p.status === 'completed' ? 'bg-mint-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {p.status === 'completed' ? '已成交' : '待成交'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">¥{p.amount.toLocaleString()} · 赠送{(p.giftRatio * 100).toFixed(0)}%</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            {!selectedPlan ? (
              <div className="card-base p-10 text-center text-slate-400">请先选择一个方案</div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="btn-outline flex items-center gap-1.5"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      {copied ? '已复制' : '复制全部'}
                    </button>
                    <button onClick={handleExport} className="btn-outline flex items-center gap-1.5">
                      <Download className="w-4 h-4" /> 导出
                    </button>
                  </div>
                  {selectedPlan.status !== 'completed' ? (
                    <button
                      onClick={() => handleMarkCompleted(selectedPlan.id)}
                      className="btn-primary flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> 标记已成交
                    </button>
                  ) : (
                    <span className="risk-badge-green rounded-lg py-2 px-4 text-sm font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> 已成交
                    </span>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-elevated border border-slate-200 p-10 max-w-3xl mx-auto" style={{ minHeight: '800px' }}>
                  <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-mono">
                    {generateScript()}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'tag' && (
        <div className="card-base overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-navy-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> 收银台复核记录
            </h3>
            <span className="text-xs text-slate-500">{completedPlans.length} 条已成交记录</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs">
              <tr>
                <th className="text-left px-5 py-3 font-medium">客户</th>
                <th className="text-left px-5 py-3 font-medium">金额</th>
                <th className="text-left px-5 py-3 font-medium">风险等级</th>
                <th className="text-left px-5 py-3 font-medium">风险标签</th>
                <th className="text-left px-5 py-3 font-medium">收银台</th>
              </tr>
            </thead>
            <tbody>
              {completedPlans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400">
                    <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    暂无已成交记录，请在储值说明生成器中标记成交
                  </td>
                </tr>
              ) : (
                completedPlans.map((p) => {
                  const cust = customers.find((c) => c.id === p.customerId);
                  return (
                    <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-xs font-bold text-navy-600">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-navy-700">{cust?.name ?? '-'}</div>
                            <div className="text-xs text-slate-400">{cust?.phone ?? '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium">¥{p.amount.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span className={`risk-badge-${p.riskLevel} px-2 py-1 rounded text-xs font-medium`}>
                          {p.riskLevel === 'green' ? '低风险' : p.riskLevel === 'yellow' ? '中风险' : '高风险'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {p.riskDetails.length === 0 ? (
                            <span className="risk-badge-green px-2 py-0.5 rounded text-xs">合规</span>
                          ) : (
                            p.riskDetails.map((r, i) => (
                              <span key={i} className={`${tagClass(r.type)} px-2 py-0.5 rounded text-xs font-medium`}>
                                {r.type}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="risk-badge-yellow px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" /> 待复核
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'stats' && currentConsultant.role !== 'consultant' && (
        <div className="grid grid-cols-2 gap-5">
          <div className="card-base p-5">
            <h3 className="font-bold text-navy-700 mb-4 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4" /> 咨询师异常率
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={consultantStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="consultantName" fontSize={12} tickLine={false} />
                <YAxis fontSize={12} tickLine={false} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, '异常率']} />
                <Bar dataKey="abnormalRate" fill="#1B2A4A" radius={[6, 6, 0, 0]} name="异常方案占比" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-base p-5">
            <h3 className="font-bold text-navy-700 mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> 近6月异常趋势
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} />
                <YAxis fontSize={12} tickLine={false} unit="%" />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                {consultantStats.map((cs) => (
                  <Line
                    key={cs.consultantId}
                    type="monotone"
                    data={cs.trend.map((v, i) => ({ name: `${i + 1}月`, value: v }))}
                    dataKey="value"
                    name={cs.consultantName}
                    stroke={cs.abnormalRate > 20 ? '#E85D50' : cs.abnormalRate > 15 ? '#F59E0B' : '#1B2A4A'}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card-base p-5 col-span-2">
            <h3 className="font-bold text-navy-700 mb-4 flex items-center gap-1.5">
              <User className="w-4 h-4" /> 咨询师排行
            </h3>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium w-12">排名</th>
                  <th className="text-left px-4 py-2.5 font-medium">咨询师</th>
                  <th className="text-left px-4 py-2.5 font-medium">总方案数</th>
                  <th className="text-left px-4 py-2.5 font-medium">异常方案数</th>
                  <th className="text-left px-4 py-2.5 font-medium">异常率</th>
                </tr>
              </thead>
              <tbody>
                {[...consultantStats].sort((a, b) => b.abnormalRate - a.abnormalRate).map((cs, i) => (
                  <tr key={cs.consultantId} className={`border-t border-slate-100 ${cs.abnormalRate > 20 ? 'bg-coral-50/40' : ''}`}>
                    <td className="px-4 py-3 font-bold text-navy-600">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal to-emerald text-white text-xs font-bold flex items-center justify-center">
                          {cs.avatar}
                        </div>
                        <span className="font-medium text-navy-700">{cs.consultantName}</span>
                        {cs.abnormalRate > 20 && <span className="text-[10px] risk-badge-red px-1.5 py-0.5 rounded">高风险</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">{cs.totalPlans}</td>
                    <td className="px-4 py-3">{cs.abnormalPlans}</td>
                    <td className={`px-4 py-3 font-bold ${cs.abnormalRate > 20 ? 'text-coral-600' : cs.abnormalRate > 15 ? 'text-amber-600' : 'text-navy-600'}`}>
                      {cs.abnormalRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'stats' && currentConsultant.role === 'consultant' && (
        <div className="card-base p-10 text-center text-slate-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <div>仅主管及团队负责人可查看团队统计数据</div>
        </div>
      )}
    </div>
  );
}
