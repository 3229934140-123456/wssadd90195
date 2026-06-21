import { useState, useMemo } from 'react';
import {
  FileText, AlertTriangle, CheckCircle2, XCircle, RefreshCw, ChevronRight,
  User, Clock, DollarSign, Gift, Tag,
} from 'lucide-react';
import { useAppStore } from '@/store';

const riskBar: Record<string, string> = {
  green: 'bg-mint',
  yellow: 'bg-amber',
  red: 'bg-coral',
};

const statusBadge: Record<string, string> = {
  pending: 'risk-badge-yellow',
  needs_more: 'risk-badge-red',
  approved: 'risk-badge-green',
  rejected: 'risk-badge-red',
};

const statusLabel: Record<string, string> = {
  pending: '待审批',
  needs_more: '需补充材料',
  approved: '已通过',
  rejected: '已驳回',
};

export default function Approval() {
  const { approvals, customers, plans, approvePlan, requestMoreInfo, resubmitPlan, currentConsultant } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'needs_more' | 'approved' | 'rejected'>('all');
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [moreInfoNote, setMoreInfoNote] = useState('');
  const [resubmitNote, setResubmitNote] = useState('');

  const filteredApprovals = useMemo(() => {
    if (filter === 'all') return approvals;
    return approvals.filter((a) => a.status === filter);
  }, [approvals, filter]);

  const { pending, needsMore, approved, rejected } = useMemo(() => ({
    pending: approvals.filter((a) => a.status === 'pending'),
    needsMore: approvals.filter((a) => a.status === 'needs_more'),
    approved: approvals.filter((a) => a.status === 'approved'),
    rejected: approvals.filter((a) => a.status === 'rejected'),
  }), [approvals]);

  const selectedApproval = useMemo(
    () => approvals.find((a) => a.id === selectedApprovalId) ?? null,
    [approvals, selectedApprovalId],
  );

  const relatedPlan = useMemo(
    () => plans.find((p) => p.id === selectedApproval?.planId),
    [plans, selectedApproval],
  );

  const customer = useMemo(
    () => customers.find((c) => c.id === relatedPlan?.customerId),
    [customers, relatedPlan],
  );

  const isSupervisor = currentConsultant.role !== 'consultant';

  const handleRequestMore = () => {
    if (!selectedApprovalId || !moreInfoNote.trim()) return;
    requestMoreInfo(selectedApprovalId, moreInfoNote);
    setMoreInfoNote('');
  };

  const handleApprove = () => {
    if (!selectedApprovalId) return;
    approvePlan(selectedApprovalId, true, comment);
    setComment('');
  };

  const handleReject = () => {
    if (!selectedApprovalId) return;
    approvePlan(selectedApprovalId, false, comment);
    setComment('');
  };

  const handleResubmit = () => {
    if (!selectedApproval?.planId || !resubmitNote.trim()) return;
    resubmitPlan(selectedApproval.planId, resubmitNote);
    setResubmitNote('');
  };

  const progressSteps = [
    { key: 'pending', label: '待审批', icon: Clock },
    { key: 'needs_more', label: '需补充', icon: AlertTriangle },
    { key: 'approved', label: '已通过', icon: CheckCircle2 },
    { key: 'rejected', label: '已驳回', icon: XCircle },
  ];

  const getCurrentStepIndex = (status: string) => {
    if (status === 'rejected') return 3;
    if (status === 'approved') return 2;
    if (status === 'needs_more') return 1;
    return 0;
  };

  return (
    <div className="p-6 space-y-5">
      <h1 className="section-title flex items-center gap-2">
        <FileText className="w-5 h-5 text-navy-500" /> 主管审批
      </h1>

      <div className="flex gap-1.5">
        {[
          { key: 'all' as const, label: '全部', count: approvals.length },
          { key: 'pending' as const, label: '待审批', count: pending.length },
          { key: 'needs_more' as const, label: '需补充', count: needsMore.length },
          { key: 'approved' as const, label: '已通过', count: approved.length },
          { key: 'rejected' as const, label: '已驳回', count: rejected.length },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${filter === f.key ? 'bg-navy-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {f.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === f.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex gap-5">
        <div className="w-[42%]">
          <div className="mb-3 text-xs font-semibold text-navy-500 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> 待审批
          </div>
          <div className="space-y-2 max-h-[38vh] overflow-auto pr-1">
            {filteredApprovals.filter((a) => a.status === 'pending' || a.status === 'needs_more').length === 0 && (
              <div className="text-center py-6 text-slate-400 text-sm">暂无待处理审批</div>
            )}
            {filteredApprovals
              .filter((a) => a.status === 'pending' || a.status === 'needs_more')
              .map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedApprovalId(a.id)}
                  className={`w-full text-left card-hover p-3 rounded-lg border transition-all flex ${selectedApprovalId === a.id ? 'ring-2 ring-navy-700 border-navy-400 bg-navy-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className={`w-1 -mx-3 my-[-12px] mr-2 rounded-l-lg ${riskBar[a.riskLevel]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium text-sm text-navy-700 truncate">
                        {a.consultantName} → {a.customerName}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusBadge[a.status]}`}>
                        {statusLabel[a.status]}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      ¥{a.planAmount.toLocaleString()} · 赠{(a.giftRatio * 100).toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(a.createdAt).toLocaleString()}
                    </div>
                  </div>
                </button>
              ))}
          </div>

          <div className="mt-5 mb-3 text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> 历史记录
          </div>
          <div className="space-y-2 max-h-[38vh] overflow-auto pr-1">
            {filteredApprovals.filter((a) => a.status === 'approved' || a.status === 'rejected').length === 0 && (
              <div className="text-center py-6 text-slate-400 text-sm">暂无历史记录</div>
            )}
            {filteredApprovals
              .filter((a) => a.status === 'approved' || a.status === 'rejected')
              .map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedApprovalId(a.id)}
                  className={`w-full text-left card-hover p-3 rounded-lg border transition-all opacity-80 ${selectedApprovalId === a.id ? 'ring-2 ring-navy-700 border-navy-400 bg-navy-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium text-sm text-navy-700 truncate">
                      {a.consultantName} → {a.customerName}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusBadge[a.status]}`}>
                      {statusLabel[a.status]}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    ¥{a.planAmount.toLocaleString()} · 赠{(a.giftRatio * 100).toFixed(0)}%
                  </div>
                </button>
              ))}
          </div>
        </div>

        <div className="flex-1">
          {!selectedApproval ? (
            <div className="card-base p-10 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
              请选择一条审批记录查看详情
            </div>
          ) : (
            <div className="space-y-4">
              <div className="card-base p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal to-emerald text-white text-xs font-bold flex items-center justify-center">
                        {selectedApproval.consultantName.slice(0, 1)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-navy-700">
                          {selectedApproval.consultantName} → {selectedApproval.customerName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(selectedApproval.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className={`risk-badge-${selectedApproval.riskLevel} px-2.5 py-1 rounded text-xs font-medium`}>
                    {selectedApproval.riskLevel === 'green' ? '低风险' : selectedApproval.riskLevel === 'yellow' ? '中风险' : '高风险'}
                  </span>
                </div>

                <div className="mb-5">
                  <div className="text-xs font-semibold text-navy-500 mb-2">审批进度</div>
                  <div className="flex items-center justify-between">
                    {progressSteps.map((step, i) => {
                      const currentIdx = getCurrentStepIndex(selectedApproval.status);
                      const isActive = i <= currentIdx;
                      const isCurrent = i === currentIdx;
                      return (
                        <div key={step.key} className="flex flex-col items-center flex-1 relative">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isActive ? (isCurrent ? 'bg-navy-700 text-white shadow-lg' : 'bg-mint text-white') : 'bg-slate-200 text-slate-400'}`}
                          >
                            <step.icon className="w-4 h-4" />
                          </div>
                          <div className={`text-[10px] mt-1.5 font-medium ${isActive ? 'text-navy-700' : 'text-slate-400'}`}>
                            {step.label}
                          </div>
                          {i < progressSteps.length - 1 && (
                            <div
                              className={`absolute top-[18px] left-[60%] right-[-40%] h-0.5 ${isActive && i < currentIdx ? 'bg-mint' : 'bg-slate-200'}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {customer && relatedPlan && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-[10px] text-slate-400 mb-0.5">充值金额</div>
                      <div className="text-lg font-bold text-navy-700">¥{relatedPlan.amount.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-[10px] text-slate-400 mb-0.5">赠送比例</div>
                      <div className="text-lg font-bold text-navy-700">{(relatedPlan.giftRatio * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                )}

                {customer && (
                  <div className="bg-slate-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-semibold text-navy-500">客户信息</span>
                    </div>
                    <div className="text-sm text-slate-700">
                      {customer.name} · {customer.age}岁 · {customer.level}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">余额 ¥{customer.unusedBalance.toLocaleString()}</div>
                  </div>
                )}

                {relatedPlan && relatedPlan.riskDetails.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-navy-500 mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> 风险分析
                    </div>
                    <div className="space-y-1.5">
                      {relatedPlan.riskDetails.map((r, i) => (
                        <div key={i} className={`rounded-lg p-2.5 text-sm risk-badge-${r.level} flex items-start gap-2`}>
                          <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 risk-dot-${r.level}`} />
                          <div>
                            <div className="font-medium">{r.type}</div>
                            <div className="text-xs opacity-80 mt-0.5">{r.message}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedApproval.comment && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <div className="text-xs font-semibold text-amber-700 mb-1">
                      {selectedApproval.status === 'needs_more' ? '主管要求补充：' : '上次审批意见：'}
                    </div>
                    <div className="text-sm text-amber-800">{selectedApproval.comment}</div>
                  </div>
                )}

                {relatedPlan?.approvalRequestNote && (
                  <div className="bg-mint-50 border border-mint-200 rounded-lg p-3 mb-4">
                    <div className="text-xs font-semibold text-emerald-700 mb-1">咨询师补充说明：</div>
                    <div className="text-sm text-emerald-800">{relatedPlan.approvalRequestNote}</div>
                  </div>
                )}

                {relatedPlan?.approvalStatus === 'needs_more' && !isSupervisor && (
                  <div className="animate-fade-in">
                    <div className="text-xs font-semibold text-coral-700 mb-2">请补充以下材料后重新提交：</div>
                    <textarea
                      className="input-base min-h-[80px] resize-y mb-2"
                      placeholder="请详细说明已补充的材料：代付确认书、风险告知书、身份证明等..."
                      value={resubmitNote}
                      onChange={(e) => setResubmitNote(e.target.value)}
                    />
                    <button
                      className={`btn-primary w-full flex items-center justify-center gap-1.5 ${!resubmitNote.trim() ? 'opacity-40 cursor-not-allowed' : ''}`}
                      onClick={handleResubmit}
                      disabled={!resubmitNote.trim()}
                    >
                      <RefreshCw className="w-4 h-4" /> 重新提交审批
                    </button>
                  </div>
                )}

                {isSupervisor && selectedApproval.status === 'pending' && (
                  <div className="animate-fade-in space-y-2">
                    <textarea
                      className="input-base min-h-[70px] resize-y"
                      placeholder="审批意见（要求补充材料、通过原因或驳回原因）..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <textarea
                      className="input-base min-h-[60px] resize-y"
                      placeholder="要求补充的材料清单（如：高龄客户风险告知书、代付确认书、现金来源证明等）..."
                      value={moreInfoNote}
                      onChange={(e) => setMoreInfoNote(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        className="btn-outline flex-1 flex items-center justify-center gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
                        onClick={handleRequestMore}
                        disabled={!moreInfoNote.trim() && !comment.trim()}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        要求补充
                      </button>
                      <button
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium py-2 transition-colors ${!comment.trim() ? 'opacity-40 cursor-not-allowed bg-mint text-white' : 'bg-mint hover:bg-emerald-500 text-white'}`}
                        onClick={handleApprove}
                        disabled={!comment.trim()}
                      >
                        <CheckCircle2 className="w-4 h-4" /> 通过
                      </button>
                      <button
                        className={`btn-danger flex-1 flex items-center justify-center gap-1.5 ${!comment.trim() ? 'opacity-40 cursor-not-allowed' : ''}`}
                        onClick={handleReject}
                        disabled={!comment.trim()}
                      >
                        <XCircle className="w-4 h-4" /> 驳回
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      注：审批意见为必填项，"要求补充"需在下方材料清单中明确说明
                    </p>
                  </div>
                )}

                {(selectedApproval.status === 'approved' || selectedApproval.status === 'rejected') && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs font-semibold text-slate-500 mb-1">最终审批意见：</div>
                    <div className="text-sm text-slate-700">{selectedApproval.comment || '无'}</div>
                    {selectedApproval.resolvedAt && (
                      <div className="text-[10px] text-slate-400 mt-1">
                        处理时间：{new Date(selectedApproval.resolvedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
