import { useState, useMemo } from 'react';
import {
  FileText, AlertTriangle, BarChart3, Copy, Download, CheckCircle2,
  Clock, User, UserCheck, Tag, CheckSquare, History, RefreshCw,
  ChevronRight, CircleCheck, CircleDashed, XCircle, Send,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { useAppStore } from '@/store';
import { standardTerms, consultantStats } from '@/data/mock';
import type { ReviewItem, TraceEvent } from '@/types';

const PAYMENT_LABEL: Record<string, string> = {
  cash: '现金', bank_card: '银行卡', wechat: '微信', alipay: '支付宝', other: '其他',
};
const RELATION_LABEL: Record<string, string> = {
  self: '本人', family: '家属', friend: '朋友', company: '公司', other: '其他',
};

const REVIEW_ITEM_LABEL: Record<string, string> = {
  cash_source: '现金来源说明',
  proxy_agreement: '代付确认协议',
  customer_sign: '客户签字确认',
  elder_risk_notice: '高龄风险告知书',
  id_verified: '身份核验通过',
};

const EVENT_ICON: Record<string, any> = {
  plan_created: FileText,
  plan_submitted: Send,
  approval_requested: Clock,
  approval_needs_more: AlertTriangle,
  approval_resubmitted: RefreshCw,
  approval_approved: CheckCircle2,
  approval_rejected: XCircle,
  script_copied: Copy,
  plan_completed: CheckCircle2,
  review_pending: Clock,
  review_needs_more: AlertTriangle,
  review_reviewed: CheckCircle2,
};

const EVENT_LABEL: Record<string, string> = {
  plan_created: '方案创建',
  plan_submitted: '方案提交',
  approval_requested: '提交审批',
  approval_needs_more: '审批要求补充',
  approval_resubmitted: '重新提交审批',
  approval_approved: '审批通过',
  approval_rejected: '审批驳回',
  script_copied: '储值说明已复制',
  plan_completed: '已成交',
  review_pending: '待收银台复核',
  review_needs_more: '复核要求补充',
  review_reviewed: '收银台复核通过',
};

function tagClass(type: string) {
  if (type.includes('高龄') || type.includes('赠送超标') || type.includes('频繁') || type.includes('大额现金')) return 'risk-badge-red';
  if (type.includes('代付') || type.includes('旧卡') || type.includes('冲突')) return 'risk-badge-yellow';
  return 'risk-badge-green';
}

export default function Trace() {
  const { plans, customers, currentConsultant, markPlanCompleted, reviewPlan, resubmitForReview, getEventsForCustomer, traceEvents, toggleReviewItem } = useAppStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'script' | 'review' | 'timeline' | 'stats'>('script');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedReviewPlanId, setSelectedReviewPlanId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [reviewComment, setReviewComment] = useState('');

  const submitablePlans = useMemo(
    () => plans.filter((p) => p.status === 'submitted' || p.status === 'completed'),
    [plans],
  );

  const completedPlans = useMemo(
    () => plans.filter((p) => p.status === 'completed'),
    [plans],
  );

  const reviewPlans = useMemo(
    () => plans.filter((p) => p.status === 'completed' && p.reviewStatus !== 'none'),
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

  const selectedReviewPlan = useMemo(
    () => plans.find((p) => p.id === selectedReviewPlanId),
    [plans, selectedReviewPlanId],
  );

  const selectedReviewCustomer = useMemo(
    () => (selectedReviewPlan ? customers.find((c) => c.id === selectedReviewPlan.customerId) : null),
    [selectedReviewPlan, customers],
  );

  const customersWithEvents = useMemo(() => {
    const customerMap = new Map<string, { customer: typeof customers[0]; events: TraceEvent[]; lastEventTime: string }>();
    for (const customer of customers) {
      const events = getEventsForCustomer(customer.id);
      if (events.length > 0) {
        const lastEventTime = events[events.length - 1]?.timestamp || new Date().toISOString();
        customerMap.set(customer.id, { customer, events, lastEventTime });
      }
    }
    return Array.from(customerMap.values()).sort((a, b) =>
      new Date(b.lastEventTime).getTime() - new Date(a.lastEventTime).getTime()
    );
  }, [customers, getEventsForCustomer]);

  const selectedCustomerTimeline = useMemo(() => {
    if (!selectedCustomerId) return [];
    return getEventsForCustomer(selectedCustomerId);
  }, [selectedCustomerId, getEventsForCustomer]);

  const selectedCustomerInfo = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const generateScript = () => {
    if (!selectedPlan || !selectedCustomer) return '';
    const giftAmt = Math.round(selectedPlan.amount * selectedPlan.giftRatio);
    let proxySection = '';
    if (selectedPlan.payerRelation !== 'self') {
      proxySection = `付款人姓名：${selectedPlan.payerName || '未填写'}
付款人与客户关系：${RELATION_LABEL[selectedPlan.payerRelation] ?? selectedPlan.payerRelation}${selectedPlan.payerRelationDetail ? `\n代付说明：${selectedPlan.payerRelationDetail}` : ''}

`;
    }
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
${proxySection}━━━━━━━━━━━━━━━━━━━━
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

  const handleReviewItemChange = (itemKey: string, checked: boolean) => {
    if (!selectedReviewPlanId) return;
    toggleReviewItem(selectedReviewPlanId, itemKey, checked);
  };

  const handleReview = (approve: boolean) => {
    if (!selectedReviewPlanId) return;
    const plan = plans.find((p) => p.id === selectedReviewPlanId);
    if (!plan) return;
    if (approve) {
      const allChecked = plan.reviewItems.every((item) => item.checked);
      if (!allChecked) {
        alert('请先勾选所有复核项');
        return;
      }
    }
    reviewPlan(selectedReviewPlanId, plan.reviewItems, approve, reviewComment);
    setReviewComment('');
    setSelectedReviewPlanId(null);
  };

  const handleResubmitReview = (planId: string) => {
    resubmitForReview(planId);
  };

  const reviewStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="risk-badge-yellow px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> 待复核</span>;
      case 'needs_more':
        return <span className="risk-badge-red px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3" /> 需补充</span>;
      case 'reviewed':
        return <span className="risk-badge-green px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> 已复核</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-5">
      <h1 className="section-title flex items-center gap-2">
        <FileText className="w-5 h-5 text-navy-500" /> 话术留痕
      </h1>

      <div className="flex gap-2 border-b border-slate-200 -mb-1">
        {[
          { key: 'script' as const, label: '储值说明生成器', icon: FileText },
          { key: 'review' as const, label: '收银台复核队列', icon: CheckSquare },
          { key: 'timeline' as const, label: '客户留痕时间线', icon: History },
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
                        {p.reviewStatus && p.reviewStatus !== 'none' && (
                          <div className="mt-1.5">{reviewStatusBadge(p.reviewStatus)}</div>
                        )}
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
                    <button onClick={handleCopy} className="btn-outline flex items-center gap-1.5">
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

      {tab === 'review' && (
        <div className="flex gap-5">
          <div className="w-80 flex-shrink-0">
            <div className="card-base p-4">
              <h3 className="text-sm font-bold text-navy-600 mb-3 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4" /> 复核队列
              </h3>
              {reviewPlans.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  暂无待复核记录
                </div>
              ) : (
                <div className="space-y-2 max-h-[70vh] overflow-auto">
                  {reviewPlans.map((p) => {
                    const cust = customers.find((c) => c.id === p.customerId);
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedReviewPlanId(p.id)}
                        className={`w-full text-left card-hover p-3 rounded-lg border transition-all ${selectedReviewPlanId === p.id ? 'border-navy-400 bg-navy-50' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-navy-700">{cust?.name ?? '未知客户'}</span>
                          {reviewStatusBadge(p.reviewStatus)}
                        </div>
                        <div className="text-xs text-slate-500">¥{p.amount.toLocaleString()} · 赠送{(p.giftRatio * 100).toFixed(0)}%</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {p.riskDetails.slice(0, 2).map((r, i) => (
                            <span key={i} className={`${tagClass(r.type)} px-1.5 py-0.5 rounded text-[10px] font-medium`}>
                              {r.type}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            {!selectedReviewPlan ? (
              <div className="card-base p-10 text-center text-slate-400">
                <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
                请选择一条复核记录
              </div>
            ) : (
              <div className="space-y-4">
                <div className="card-base p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal to-emerald text-white text-sm font-bold flex items-center justify-center">
                        {selectedReviewCustomer?.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-navy-700">
                          {selectedReviewCustomer?.name} · ¥{selectedReviewPlan.amount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          赠送{(selectedReviewPlan.giftRatio * 100).toFixed(0)}% · {PAYMENT_LABEL[selectedReviewPlan.paymentMethod]}
                        </div>
                      </div>
                    </div>
                    {reviewStatusBadge(selectedReviewPlan.reviewStatus)}
                  </div>

                  {selectedReviewPlan.riskDetails.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-navy-500 mb-2">风险标签</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedReviewPlan.riskDetails.map((r, i) => (
                          <span key={i} className={`${tagClass(r.type)} px-2 py-0.5 rounded text-xs font-medium`}>
                            {r.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="text-xs font-semibold text-navy-500 mb-2">复核材料清单</div>
                    <div className="space-y-2">
                      {selectedReviewPlan.reviewItems.map((item) => (
                        <label
                          key={item.key}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${item.checked ? 'bg-mint-50 border-mint-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                        >
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={(e) => handleReviewItemChange(item.key, e.target.checked)}
                            disabled={selectedReviewPlan.reviewStatus === 'reviewed'}
                            className="w-4 h-4 rounded border-slate-300 text-navy-700 focus:ring-navy-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-navy-700">
                              {REVIEW_ITEM_LABEL[item.key] ?? item.key}
                            </div>
                          </div>
                          {item.checked ? (
                            <CircleCheck className="w-5 h-5 text-mint" />
                          ) : (
                            <CircleDashed className="w-5 h-5 text-slate-300" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {selectedReviewPlan.reviewStatus === 'needs_more' && selectedReviewPlan.reviewComment && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                      <div className="text-xs font-semibold text-amber-700 mb-1">复核要求补充：</div>
                      <div className="text-sm text-amber-800">{selectedReviewPlan.reviewComment}</div>
                    </div>
                  )}

                  {selectedReviewPlan.reviewStatus === 'pending' && currentConsultant.role !== 'consultant' && (
                    <div className="space-y-2">
                      <textarea
                        className="input-base min-h-[70px] resize-y"
                        placeholder="复核意见（如需退回，请填写需补充的材料）..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          className="btn-outline flex-1 flex items-center justify-center gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
                          onClick={() => handleReview(false)}
                          disabled={!reviewComment.trim()}
                        >
                          <AlertTriangle className="w-4 h-4" /> 退回补充
                        </button>
                        <button
                          className="btn-primary flex-1 flex items-center justify-center gap-1.5"
                          onClick={() => handleReview(true)}
                        >
                          <CheckCircle2 className="w-4 h-4" /> 复核通过
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedReviewPlan.reviewStatus === 'needs_more' && currentConsultant.role === 'consultant' && (
                    <button
                      className="btn-primary w-full flex items-center justify-center gap-1.5"
                      onClick={() => handleResubmitReview(selectedReviewPlan.id)}
                    >
                      <RefreshCw className="w-4 h-4" /> 已补充材料，重新提交复核
                    </button>
                  )}

                  {selectedReviewPlan.reviewStatus === 'reviewed' && (
                    <div className="bg-mint-50 border border-mint-200 rounded-lg p-3">
                      <div className="text-xs font-semibold text-emerald-700 mb-1">复核通过</div>
                      <div className="text-sm text-emerald-800">
                        {selectedReviewPlan.reviewComment || '所有材料已核验通过'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'timeline' && (
        <div className="flex gap-5">
          <div className="w-72 flex-shrink-0">
            <div className="card-base p-4">
              <h3 className="text-sm font-bold text-navy-600 mb-3 flex items-center gap-1.5">
                <History className="w-4 h-4" /> 客户留痕
              </h3>
              {customersWithEvents.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  暂无客户留痕记录
                </div>
              ) : (
                <div className="space-y-2 max-h-[70vh] overflow-auto">
                  {customersWithEvents.map(({ customer, events }) => (
                    <button
                      key={customer.id}
                      onClick={() => setSelectedCustomerId(customer.id)}
                      className={`w-full text-left card-hover p-3 rounded-lg border transition-all ${selectedCustomerId === customer.id ? 'border-navy-400 bg-navy-50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-navy-700">{customer.name}</span>
                        <span className="text-[10px] text-slate-400">{events.length}条</span>
                      </div>
                      <div className="text-xs text-slate-500">{customer.age}岁 · {customer.level}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        最后更新：{new Date(events[events.length - 1]?.timestamp || new Date().toISOString()).toLocaleDateString()}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {events.slice(-3).reverse().map((e, i) => {
                          const Icon = EVENT_ICON[e.type] || Clock;
                          return (
                            <span key={i} className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              <Icon className="w-2.5 h-2.5" />
                              {EVENT_LABEL[e.type] || e.type}
                            </span>
                          );
                        })}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            {!selectedCustomerInfo ? (
              <div className="card-base p-10 text-center text-slate-400">
                <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
                请选择一个客户查看完整留痕时间线
              </div>
            ) : (
              <div className="card-base p-5">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-navy to-slate-700 text-white text-lg font-bold flex items-center justify-center">
                    {selectedCustomerInfo.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="text-base font-bold text-navy-700">{selectedCustomerInfo.name}</div>
                    <div className="text-xs text-slate-500">
                      {selectedCustomerInfo.age}岁 · {selectedCustomerInfo.level} · {selectedCustomerInfo.phone}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      账户余额 ¥{selectedCustomerInfo.unusedBalance.toLocaleString()} · 共 {selectedCustomerTimeline.length} 条留痕
                    </div>
                  </div>
                </div>

                <div className="relative pl-8">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200" />
                  {selectedCustomerTimeline.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">暂无留痕记录</div>
                  ) : (
                    selectedCustomerTimeline.map((event, i) => {
                      const Icon = EVENT_ICON[event.type] || Clock;
                      const isLast = i === selectedCustomerTimeline.length - 1;
                      return (
                        <div key={event.id} className="relative pb-5 last:pb-0">
                          <div
                            className={`absolute -left-[5px] top-0 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${isLast ? 'bg-navy-700 text-white' : 'bg-slate-200 text-slate-500'}`}
                          >
                            <Icon className="w-2.5 h-2.5" />
                          </div>
                          <div className="animate-fade-in">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-semibold text-navy-700">
                                {EVENT_LABEL[event.type] || event.type}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(event.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mb-1">
                              操作人：{event.operator}（{event.operatorRole}）
                            </div>
                            <div className="text-sm text-slate-700">{event.content}</div>
                            {event.details && (
                              <div className="mt-1 bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600 border border-slate-100">
                                {event.details}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
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
