import { useState, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Copy,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store';

const TYPE_LABELS: Record<string, string> = {
  old_card: '旧卡未消耗',
  repurchase: '复购提醒',
  expiring: '即将到期',
};
const TYPE_BADGE: Record<string, string> = {
  old_card: 'bg-coral-50 text-coral-700',
  repurchase: 'bg-navy-50 text-navy-600',
  expiring: 'bg-amber-50 text-amber-700',
};
const URGENCY_DOT: Record<string, string> = {
  high: 'bg-coral',
  medium: 'bg-amber',
  low: 'bg-mint',
};
const URGENCY_LABEL: Record<string, string> = {
  high: '紧急',
  medium: '一般',
  low: '低',
};

function getCountdown(dueDate: string) {
  const diff = Math.ceil(
    (new Date(dueDate).getTime() - Date.now()) / (86400000)
  );
  if (diff < 0) return '已逾期';
  if (diff === 0) return '今天到期';
  return `${diff}天后到期`;
}

export default function Reminder() {
  const [filter, setFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const reminders = useAppStore((s) => s.reminders);
  const completeReminder = useAppStore((s) => s.completeReminder);

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? reminders
        : reminders.filter((r) => r.type === filter),
    [reminders, filter]
  );

  const selected = useMemo(
    () => reminders.find((r) => r.id === selectedId) ?? null,
    [reminders, selectedId]
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'old_card', label: '旧卡未消耗' },
    { key: 'repurchase', label: '复购提醒' },
    { key: 'expiring', label: '即将到期' },
  ];

  return (
    <div className="p-6 animate-fade-in">
      <h2 className="section-title mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5" />跟进提醒
      </h2>

      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === t.key
                ? 'btn-primary'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative pl-6">
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-slate-200" />
          <div className="space-y-3">
            {filtered.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`relative card-base p-4 cursor-pointer transition-all ${
                  selectedId === r.id ? 'ring-2 ring-navy-300' : ''
                } ${r.completed ? 'opacity-50' : ''}`}
              >
                <div
                  className={`absolute -left-[21px] top-5 w-3 h-3 rounded-full border-2 border-white ${URGENCY_DOT[r.urgency]}`}
                />
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`font-bold text-navy-800 ${r.completed ? 'line-through' : ''}`}
                      >
                        {r.customerName}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_BADGE[r.type]}`}
                      >
                        {TYPE_LABELS[r.type]}
                      </span>
                    </div>
                    <p
                      className={`text-sm text-slate-600 line-clamp-2 ${r.completed ? 'line-through' : ''}`}
                    >
                      {r.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {r.dueDate}
                    </div>
                  </div>
                  {!r.completed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        completeReminder(r.id);
                      }}
                      className="shrink-0 px-2.5 py-1 rounded text-xs font-medium btn-outline flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />完成
                    </button>
                  )}
                  {r.completed && (
                    <span className="shrink-0 text-xs text-mint-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />已完成
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selected && (
          <div className="w-[340px] shrink-0 card-base p-5 space-y-4 h-fit sticky top-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${URGENCY_DOT[selected.urgency]}`}
              />
              <h3 className="text-lg font-bold text-navy-800">
                {selected.customerName}
              </h3>
              <span className="text-xs text-slate-400">
                {URGENCY_LABEL[selected.urgency]}
              </span>
            </div>

            <p className="text-sm text-slate-600">{selected.message}</p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 relative">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-amber-700">
                  推荐话术
                </span>
                <button
                  onClick={() => handleCopy(selected.suggestedScript)}
                  className="text-amber-600 hover:text-amber-800 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm text-amber-800 leading-relaxed">
                {selected.suggestedScript}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500">
                截止日期：{selected.dueDate}
              </span>
              <span
                className={`text-xs font-medium ${
                  getCountdown(selected.dueDate).startsWith('已')
                    ? 'text-coral'
                    : 'text-amber-600'
                }`}
              >
                {getCountdown(selected.dueDate)}
              </span>
            </div>

            {!selected.completed && (
              <button
                onClick={() => completeReminder(selected.id)}
                className="w-full btn-primary py-2 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />标记完成
              </button>
            )}
            {selected.completed && (
              <div className="w-full py-2 text-center text-sm text-mint-500 font-medium flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />已完成
              </div>
            )}
          </div>
        )}

        {!selected && (
          <div className="w-[340px] shrink-0 card-base p-10 flex flex-col items-center justify-center text-slate-400">
            <ChevronRight className="w-8 h-8 mb-2" />
            <p className="text-sm">选择一条提醒查看详情</p>
          </div>
        )}
      </div>
    </div>
  );
}
