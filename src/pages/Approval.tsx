import { useState, useMemo } from 'react';
import {
  ShieldCheck, Clock, CheckCircle2, XCircle, AlertTriangle,
  User, DollarSign, Gift, MessageSquare, ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { ApprovalRecord } from '@/types';

type TabKey = 'all' | 'pending' | 'approved' | 'rejected';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审批' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已驳回' },
];

const riskBar = { green: 'bg-mint', yellow: 'bg-amber', red: 'bg-coral' } as const;
const statusBadge: Record<ApprovalRecord['status'], { label: string; cls: string }> = {
  pending: { label: '待审批', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: '已通过', cls: 'bg-mint-50 text-emerald-700 border-mint-200' },
  rejected: { label: '已驳回', cls: 'bg-coral-50 text-coral-700 border-coral-200' },
};
const riskLabel = { green: '低风险', yellow: '中风险', red: '高风险' };

export default function Approval() {
  const { approvals, approvePlan } = useAppStore();
  const [tab, setTab] = useState<TabKey>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const filtered = useMemo(() => {
    if (tab === 'all') return approvals;
    return approvals.filter((a) => a.status === tab);
  }, [approvals, tab]);

  const grouped = useMemo(() => {
    const pending = filtered.filter((a) => a.status === 'pending');
    const history = filtered.filter((a) => a.status !== 'pending');
    return { pending, history };
  }, [filtered]);

  const selected = useMemo(
    () => approvals.find((a) => a.id === selectedId) ?? null,
    [approvals, selectedId],
  );

  const fmt = (n: number) => n.toLocaleString('zh-CN');
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

  const handleAction = (approved: boolean) => {
    if (!selected) return;
    approvePlan(selected.id, approved, comment);
    setComment('');
  };

  const renderGroup = (title: string, icon: React.ReactNode, items: ApprovalRecord[]) => (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
        {icon} {title} ({items.length})
      </div>
      <div className="space-y-2">
        {items.map((a) => {
          const badge = statusBadge[a.status];
          return (
            <div
              key={a.id}
              onClick={() => setSelectedId(a.id)}
              className={`card-base card-hover relative flex overflow-hidden cursor-pointer transition-all ${
                selectedId === a.id ? 'ring-2 ring-navy-700 border-navy-400' : ''
              }`}
            >
              <div className={`w-1 flex-shrink-0 rounded-l-xl ${riskBar[a.riskLevel]}`} />
              <div className="flex-1 p-3 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-navy-800 truncate">{a.consultantName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${badge.cls}`}>{badge.label}</span>
                </div>
                <div className="text-xs text-slate-500 mb-1.5">{a.customerName}</div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-700 font-medium">¥{fmt(a.planAmount)}</span>
                  <span className="text-mint-500 font-medium">赠{(a.giftRatio * 100).toFixed(0)}%</span>
                  <span className="text-slate-400 ml-auto">{fmtDate(a.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex h-full gap-6 p-6">
      <div className="w-[40%] flex flex-col min-h-0">
        <h1 className="section-title flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-navy-500" /> 主管审批
        </h1>
        <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${
                tab === t.key ? 'bg-white text-navy-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-auto space-y-1">
          {grouped.pending.length > 0 && renderGroup('待审批', <Clock className="w-3.5 h-3.5" />, grouped.pending)}
          {grouped.history.length > 0 && renderGroup('历史记录', <CheckCircle2 className="w-3.5 h-3.5" />, grouped.history)}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">暂无审批记录</div>
          )}
        </div>
      </div>

      <div className="w-[60%] overflow-auto">
        {!selected ? (
          <div className="card-base flex flex-col items-center justify-center h-72 text-slate-400">
            <ChevronRight className="w-8 h-8 mb-2 opacity-40" />
            <span className="text-sm">请选择审批记录</span>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="card-base p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-navy-500" />
                    <span className="font-bold text-navy-800">{selected.consultantName}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-bold text-navy-800">{selected.customerName}</span>
                  </div>
                  <div className="text-xs text-slate-400">{fmtDate(selected.createdAt)}</div>
                </div>
                <span className={`risk-badge-${selected.riskLevel} px-3 py-1 rounded-lg text-sm font-bold`}>
                  {riskLabel[selected.riskLevel]}
                </span>
              </div>
            </div>

            <div className="card-base p-5">
              <h3 className="text-sm font-bold text-navy-700 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> 方案详情
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">充值金额</div>
                  <div className="text-lg font-bold text-navy-800">¥{fmt(selected.planAmount)}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">赠送比例</div>
                  <div className="text-lg font-bold text-mint-500">{(selected.giftRatio * 100).toFixed(0)}%</div>
                </div>
              </div>
              {selected.giftRatio > 0.18 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-coral-600 bg-coral-50 rounded-lg px-3 py-2 border border-coral-200">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  赠送比例超出活动上限（18%）
                </div>
              )}
              {selected.planAmount > 100000 && (
                <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  充值金额超出活动上限（¥100,000）
                </div>
              )}
            </div>

            <div className="card-base p-5">
              <h3 className="text-sm font-bold text-navy-700 mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4" /> 风险分析
              </h3>
              <div className="space-y-2">
                <div className={`risk-badge-${selected.riskLevel} rounded-lg px-3 py-2 flex items-center gap-2 text-sm`}>
                  <div className={`w-2.5 h-2.5 rounded-full risk-dot-${selected.riskLevel}`} />
                  风险等级：{riskLabel[selected.riskLevel]}
                </div>
                {selected.riskLevel === 'red' && (
                  <div className="risk-badge-red rounded-lg px-3 py-2 flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 rounded-full risk-dot-red" />
                    赠送比例或金额超出活动规则，需主管审批
                  </div>
                )}
                {selected.riskLevel === 'yellow' && (
                  <div className="risk-badge-yellow rounded-lg px-3 py-2 flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 rounded-full risk-dot-yellow" />
                    存在需关注的合规风险点
                  </div>
                )}
                {selected.riskLevel === 'green' && (
                  <div className="risk-badge-green rounded-lg px-3 py-2 flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 rounded-full risk-dot-green" />
                    方案合规，无风险项
                  </div>
                )}
              </div>
            </div>

            {selected.status !== 'pending' && selected.comment && (
              <div className="card-base p-5">
                <h3 className="text-sm font-bold text-navy-700 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> 审批意见
                </h3>
                <p className="text-sm text-slate-600">{selected.comment}</p>
              </div>
            )}

            {selected.status === 'pending' && (
              <div className="card-base p-5">
                <h3 className="text-sm font-bold text-navy-700 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> 审批操作
                </h3>
                <textarea
                  className="input-base min-h-[80px] resize-y mb-3"
                  placeholder="请输入审批意见..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(true)}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> 通过
                  </button>
                  <button
                    onClick={() => handleAction(false)}
                    className="btn-danger flex-1 flex items-center justify-center gap-2 py-2.5"
                  >
                    <XCircle className="w-4 h-4" /> 驳回
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
