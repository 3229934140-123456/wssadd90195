import { useState, useMemo, useCallback } from 'react';
import {
  User, DollarSign, Gift, FolderOpen, Clock, FileText,
  CheckCircle2, AlertTriangle, ShieldAlert, ChevronDown, ChevronUp, Send, Sparkles,
  CreditCard, Banknote, Users, Wallet, Building, HeartHandshake,
} from 'lucide-react';
import { useAppStore, projectList } from '@/store';
import type { RiskDetail, RechargePlan, PaymentMethod, PayerRelation } from '@/types';

const PAYMENT_METHODS: { key: PaymentMethod; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'cash', label: '现金', icon: Banknote },
  { key: 'bank_card', label: '银行卡', icon: CreditCard },
  { key: 'wechat', label: '微信', icon: Wallet },
  { key: 'alipay', label: '支付宝', icon: Wallet },
  { key: 'other', label: '其他', icon: Wallet },
];

const PAYER_RELATIONS: { key: PayerRelation; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'self', label: '本人', icon: User },
  { key: 'family', label: '家属', icon: Users },
  { key: 'friend', label: '朋友', icon: HeartHandshake },
  { key: 'company', label: '公司', icon: Building },
  { key: 'other', label: '其他', icon: Users },
];

export default function Plan() {
  const { customers, addPlan, validatePlan, currentConsultant, selectedCustomerId, setSelectedCustomerId } = useAppStore();

  const [amount, setAmount] = useState(10000);
  const [giftRatio, setGiftRatio] = useState(5);
  const [boundProjects, setBoundProjects] = useState<string[]>([]);
  const [validityPeriod, setValidityPeriod] = useState(12);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_card');
  const [payerRelation, setPayerRelation] = useState<PayerRelation>('self');
  const [payerName, setPayerName] = useState('');
  const [payerRelationDetail, setPayerRelationDetail] = useState('');
  const [notesOld, setNotesOld] = useState('');
  const [notesCash, setNotesCash] = useState('');
  const [notesFamily, setNotesFamily] = useState('');
  const [notesOther, setNotesOther] = useState('');
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const customer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId],
  );

  const risks: RiskDetail[] = useMemo(() => {
    if (!customer) return [];
    return validatePlan(customer.id, amount, giftRatio / 100, boundProjects, validityPeriod, paymentMethod, payerRelation);
  }, [customer, amount, giftRatio, boundProjects, validityPeriod, paymentMethod, payerRelation, validatePlan]);

  const highestLevel = useMemo(() => {
    if (risks.some((r) => r.level === 'red')) return 'red';
    if (risks.some((r) => r.level === 'yellow')) return 'yellow';
    return 'green';
  }, [risks]);

  const needOldNotes = risks.some((r) => r.type === '高龄客户');
  const needCashNotes = risks.some((r) => r.type === '大额现金');
  const isProxyPayment = payerRelation !== 'self';

  const allNotesFilled = useMemo(() => {
    if (needOldNotes && !notesOld.trim()) return false;
    if (needCashNotes && !notesCash.trim()) return false;
    if (isProxyPayment) {
      if (!payerName.trim()) return false;
      if (payerRelation === 'other' && !notesOther.trim()) return false;
      if (payerRelation !== 'other' && !notesFamily.trim()) return false;
    }
    return true;
  }, [needOldNotes, needCashNotes, isProxyPayment, notesOld, notesCash, notesFamily, notesOther, payerRelation, payerName]);

  const conflictingPackages = useMemo(() => {
    if (!customer) return [];
    return customer.packages
      .filter((p) => p.status === 'active' || p.status === 'expiring')
      .filter((p) => p.boundProjects.some((proj) => boundProjects.includes(proj)));
  }, [customer, boundProjects]);

  const toggleProject = useCallback((p: string) => {
    setBoundProjects((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  }, []);

  const handleSubmit = () => {
    if (!customer) return;
    if (!allNotesFilled) return;
    const allNotes = [
      needOldNotes ? `【高龄客户】${notesOld}` : '',
      needCashNotes ? `【大额现金】${notesCash}` : '',
      isProxyPayment ? (payerRelation === 'other' ? `【代付关系】${notesOther}` : `【亲友代付】${notesFamily}`) : '',
    ].filter(Boolean).join('\n');

    const plan: RechargePlan = {
      id: `rp_${Date.now()}`,
      customerId: customer.id,
      consultantId: currentConsultant.id,
      amount,
      giftRatio: giftRatio / 100,
      boundProjects,
      validityPeriod,
      specialNotes: allNotes,
      paymentMethod,
      payerRelation,
      payerName: payerName.trim(),
      payerRelationDetail: payerRelationDetail.trim(),
      riskLevel: highestLevel,
      riskDetails: risks,
      approvalStatus: highestLevel === 'red' ? 'pending' : 'none',
      approvalRequestNote: '',
      reviewStatus: 'none',
      reviewItems: [],
      createdAt: new Date().toISOString(),
      status: 'submitted',
    };
    addPlan(plan);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const trafficColors = { green: 'bg-mint shadow-[0_0_20px_rgba(52,211,153,0.5)]', yellow: 'bg-amber shadow-[0_0_20px_rgba(245,158,11,0.5)]', red: 'bg-coral shadow-[0_0_20px_rgba(232,93,80,0.5)]' };
  const canSubmit = !!customer && allNotesFilled && boundProjects.length > 0;

  return (
    <div className="flex h-full gap-6 p-6">
      <div className="w-[60%] space-y-5 overflow-auto pb-6">
        <h1 className="section-title flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-navy-500" /> 方案试算
        </h1>

        <section className="card-base p-5">
          <h2 className="text-sm font-bold text-navy-600 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" /> 第一步：选择客户
          </h2>
          <select
            className="input-base"
            value={selectedCustomerId ?? ''}
            onChange={(e) => setSelectedCustomerId(e.target.value || null)}
          >
            <option value="">请选择客户</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
            ))}
          </select>
          {customer && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className={`level-v${customer.level.slice(1)} px-2 py-0.5 rounded font-medium`}>{customer.level}</span>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{customer.age}岁</span>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">余额¥{customer.unusedBalance.toLocaleString()}</span>
              {customer.riskTags.map((t) => (
                <span key={t} className="risk-badge-red px-2 py-0.5 rounded font-medium">{t}</span>
              ))}
            </div>
          )}
        </section>

        <section className="card-base p-5">
          <h2 className="text-sm font-bold text-navy-600 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> 第二步：方案详情
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">充值金额（元）</label>
              <input type="number" className="input-base" value={amount} min={1000} step={1000} onChange={(e) => setAmount(+e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                <Gift className="w-3.5 h-3.5" /> 赠送比例：{giftRatio}%
              </label>
              <input type="range" min={0} max={30} value={giftRatio} onChange={(e) => setGiftRatio(+e.target.value)} className="w-full accent-navy-700" />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5"><span>0%</span><span>15%</span><span>30%</span></div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                <FolderOpen className="w-3.5 h-3.5" /> 绑定项目（按项目分别校验活动规则）
              </label>
              <div className="flex flex-wrap gap-2">
                {projectList.map((p) => (
                  <label key={p} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs cursor-pointer transition-colors ${boundProjects.includes(p) ? 'border-navy-400 bg-navy-50 text-navy-700 font-medium' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    <input type="checkbox" className="sr-only" checked={boundProjects.includes(p)} onChange={() => toggleProject(p)} />
                    {p}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 有效期
              </label>
              <select className="input-base" value={validityPeriod} onChange={(e) => setValidityPeriod(+e.target.value)}>
                {[6, 12, 18, 24].map((m) => <option key={m} value={m}>{m}个月</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="card-base p-5">
          <h2 className="text-sm font-bold text-navy-600 mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> 第三步：支付信息
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 mb-2 block">支付方式</label>
              <div className="grid grid-cols-5 gap-2">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.key}
                    onClick={() => setPaymentMethod(pm.key)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border text-xs font-medium transition-all ${paymentMethod === pm.key ? 'border-navy-400 bg-navy-50 text-navy-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    <pm.icon className="w-4 h-4" />
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-2 block">付款人与客户关系</label>
              <div className="grid grid-cols-5 gap-2">
                {PAYER_RELATIONS.map((pr) => (
                  <button
                    key={pr.key}
                    onClick={() => setPayerRelation(pr.key)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border text-xs font-medium transition-all ${payerRelation === pr.key ? 'border-navy-400 bg-navy-50 text-navy-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    <pr.icon className="w-4 h-4" />
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {isProxyPayment && (
          <section className="card-base p-5 animate-slide-up border-l-4 border-l-navy-400">
            <h2 className="text-sm font-bold text-navy-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> 代付人信息
              <span className="text-[10px] font-normal text-navy-500 bg-navy-50 px-1.5 py-0.5 rounded">必填</span>
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">付款人姓名</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="请填写付款人真实姓名"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">代付关系说明</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder={payerRelation === 'family' ? '如：母子、夫妻、兄妹等' : payerRelation === 'friend' ? '如：朋友、闺蜜、同事等' : payerRelation === 'company' ? '如：公司员工福利、客户赠送等' : '请说明具体关系'}
                  value={payerRelationDetail}
                  onChange={(e) => setPayerRelationDetail(e.target.value)}
                />
              </div>
            </div>
          </section>
        )}

        {needOldNotes && (
          <section className="card-base p-5 animate-slide-up border-l-4 border-l-coral">
            <h2 className="text-sm font-bold text-coral-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> 高龄客户风险告知说明
              <span className="text-[10px] font-normal text-coral-500 bg-coral-50 px-1.5 py-0.5 rounded">必填</span>
            </h2>
            <textarea className="input-base min-h-[80px] resize-y" placeholder="请填写风险告知情况、家属签字确认情况..." value={notesOld} onChange={(e) => setNotesOld(e.target.value)} />
          </section>
        )}

        {needCashNotes && (
          <section className="card-base p-5 animate-slide-up border-l-4 border-l-amber">
            <h2 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> 大额现金支付说明
              <span className="text-[10px] font-normal text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">必填</span>
            </h2>
            <textarea className="input-base min-h-[80px] resize-y" placeholder="请说明大额现金的资金来源，是否建议客户使用银行转账..." value={notesCash} onChange={(e) => setNotesCash(e.target.value)} />
          </section>
        )}

        {isProxyPayment && (
          <section className="card-base p-5 animate-slide-up border-l-4 border-l-amber">
            <h2 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {payerRelation === 'company' ? '公司代付说明' : payerRelation === 'other' ? '代付关系说明' : '亲友代付说明'}
              <span className="text-[10px] font-normal text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">必填</span>
            </h2>
            <textarea
              className="input-base min-h-[80px] resize-y"
              placeholder={payerRelation === 'company' ? '请填写公司名称、发票信息、是否已提供营业执照复印件...' : payerRelation === 'other' ? '请说明代付人与客户的具体关系及代付原因...' : '请说明代付人与客户关系、是否已签署代付确认书、是否留存身份证明...'}
              value={payerRelation === 'other' ? notesOther : notesFamily}
              onChange={(e) => payerRelation === 'other' ? setNotesOther(e.target.value) : setNotesFamily(e.target.value)}
            />
          </section>
        )}

        <button className={`btn-primary w-full flex items-center justify-center gap-2 py-2.5 ${!canSubmit ? 'opacity-40 cursor-not-allowed' : ''}`} onClick={handleSubmit} disabled={!canSubmit}>
          <Send className="w-4 h-4" />
          {highestLevel === 'red' ? '提交方案并申请主管审批' : '提交方案'}
        </button>

        {submitted && (
          <div className={`card-base p-4 flex items-center gap-2 text-sm animate-fade-in ${highestLevel === 'red' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-mint-200 bg-mint-50 text-emerald-700'}`}>
            <CheckCircle2 className="w-5 h-5" />
            {highestLevel === 'red' ? '方案已提交，已自动进入主管审批列表' : '方案已提交成功，可在话术留痕中生成储值说明'}
          </div>
        )}
      </div>

      <div className="w-[40%] sticky top-6 self-start">
        <div className="card-base p-5">
          <h2 className="section-title text-base mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-navy-500" /> 实时风控检测
          </h2>

          {!customer ? (
            <div className="text-center py-10 text-slate-400 text-sm">请先选择客户</div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 rounded-full ${trafficColors[highestLevel]} transition-all duration-300`} />
              </div>

              {highestLevel === 'green' && (
                <div className="text-center mb-4 risk-badge-green rounded-lg py-2 px-3 flex items-center justify-center gap-1.5 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" /> 方案合规，可继续
                </div>
              )}
              {highestLevel === 'yellow' && (
                <div className="text-center mb-4 risk-badge-yellow rounded-lg py-2 px-3 flex items-center justify-center gap-1.5 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4" /> 需要注意
                </div>
              )}
              {highestLevel === 'red' && (
                <div className="text-center mb-4 risk-badge-red rounded-lg py-2 px-3 flex items-center justify-center gap-1.5 text-sm font-medium">
                  <ShieldAlert className="w-4 h-4" /> 需要主管审批
                </div>
              )}

              <div className="space-y-2">
                {risks.length === 0 && (
                  <div className="text-center py-3 text-sm text-slate-400">暂无风险项</div>
                )}
                {risks.map((r, i) => (
                  <div key={i} className={`rounded-lg p-3 text-sm risk-badge-${r.level}`}>
                    <div className="flex items-start gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 risk-dot-${r.level}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 font-medium">
                          <span>{r.type}</span>
                        </div>
                        <div className="text-xs mt-0.5 opacity-80">{r.message}</div>
                        <button className="text-xs mt-1 text-slate-500 flex items-center gap-0.5 hover:text-slate-700" onClick={() => setExpandedRisk(expandedRisk === `${i}` ? null : `${i}`)}>
                          规则参考 {expandedRisk === `${i}` ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        {expandedRisk === `${i}` && (
                          <div className="mt-1 text-xs bg-white/60 rounded px-2 py-1 border border-current/10">{r.rule}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {conflictingPackages.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <h3 className="text-xs font-bold text-navy-600 mb-2">套餐冲突</h3>
                  {conflictingPackages.map((pkg) => (
                    <div key={pkg.id} className="text-xs text-slate-600 mb-1.5 bg-amber-50 rounded-lg px-2.5 py-2 border border-amber-100">
                      <span className="font-medium">{pkg.name}</span>
                      <span className="mx-1">·</span>
                      <span>余额¥{pkg.remainingBalance.toLocaleString()}</span>
                      <span className="mx-1">·</span>
                      <span className="text-amber-600">冲突项目: {pkg.boundProjects.filter((p) => boundProjects.includes(p)).join('、')}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
