import { useState } from 'react';
import { Shield, AlertTriangle, CheckSquare, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { activityRules, violationCases } from '@/data/mock';

const checklistItems = [
  '赠送比例是否在活动上限内',
  '是否确认客户无既有套餐冲突',
  '高龄客户(>65岁)是否已签署风险告知书',
  '大额现金支付(>5万)是否已确认资金来源',
  '亲友代付是否已签署代付确认书',
  '旧卡余额是否已优先消耗',
  '储值说明是否已附带标准条款',
];

export default function RedLine() {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const doneCount = Object.values(checked).filter(Boolean).length;
  const allDone = doneCount === checklistItems.length;

  const toggleCheck = (i: number) => setChecked((prev) => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="animate-slide-up">
        <h1 className="text-2xl font-bold text-navy-700 flex items-center gap-2">
          <Shield className="w-6 h-6 text-coral" /> 活动红线
        </h1>
        <p className="text-sm text-slate-500 mt-1">活动规则 · 违规警示 · 合规自查</p>
      </div>

      {/* 当前活动规则看板 */}
      <section className="animate-slide-up" style={{ animationDelay: '80ms' }}>
        <h2 className="section-title mb-4">当前活动规则看板</h2>
        <div className="grid grid-cols-2 gap-4">
          {activityRules.map((rule) => (
            <div key={rule.id} className="card-base p-4 space-y-3">
              <h3 className="text-lg font-bold text-navy-700">{rule.name}</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-navy-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-500">赠送上限</p>
                  <p className="text-xl font-bold text-navy-700">{(rule.maxGiftRatio * 100).toFixed(0)}%</p>
                </div>
                <div className="bg-navy-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-500">金额上限</p>
                  <p className="text-xl font-bold text-navy-700">{(rule.maxAmount / 10000).toFixed(0)}万</p>
                </div>
                <div className="bg-navy-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-500">有效期</p>
                  <p className="text-sm font-bold text-navy-700 leading-tight mt-0.5">
                    {rule.startDate.slice(5)}~{rule.endDate.slice(5)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {rule.validProjects.length > 0
                  ? rule.validProjects.map((p) => (
                      <span key={p} className="px-2 py-0.5 bg-mint-50 text-mint text-xs rounded-full font-medium">{p}</span>
                    ))
                  : <span className="px-2 py-0.5 bg-amber-50 text-amber text-xs rounded-full font-medium">全项目通用</span>}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{rule.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 违规案例警示墙 */}
      <section className="animate-slide-up" style={{ animationDelay: '160ms' }}>
        <h2 className="section-title mb-4">违规案例警示墙</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
          {violationCases.map((vc) => (
            <div
              key={vc.id}
              className="card-base p-4 min-w-[280px] max-w-[320px] snap-start space-y-2 border-l-4 border-l-coral"
            >
              <span className="inline-block px-2 py-0.5 bg-coral text-white text-xs font-bold rounded">{vc.type}</span>
              <p className="text-sm text-slate-700 leading-relaxed">{vc.description}</p>
              <p className="text-sm text-red-600 font-medium flex items-start gap-1">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />{vc.consequence}
              </p>
              <button
                onClick={() => setExpandedId(expandedId === vc.id ? null : vc.id)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-navy-700 transition-colors"
              >
                {expandedId === vc.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expandedId === vc.id ? '收起详情' : '查看详情'}
              </button>
              {expandedId === vc.id && (
                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 rounded p-2">{vc.anonymousDetail}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 合规自查清单 */}
      <section className="animate-slide-up" style={{ animationDelay: '240ms' }}>
        <h2 className="section-title mb-4">合规自查清单</h2>
        <div className="card-base p-5 space-y-3">
          {checklistItems.map((item, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <CheckSquare
                className={`w-5 h-5 flex-shrink-0 transition-colors ${checked[i] ? 'text-mint' : 'text-slate-300 group-hover:text-slate-400'}`}
                onClick={() => toggleCheck(i)}
              />
              <span className={`text-sm transition-colors ${checked[i] ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {item}
              </span>
            </label>
          ))}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-sm text-slate-500">
              完成进度：<span className="font-bold text-navy-700">{doneCount}</span>/{checklistItems.length} 已确认
            </span>
            <button
              disabled={!allDone}
              className={`btn-primary flex items-center gap-2 ${!allDone ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <Send className="w-4 h-4" /> 提交确认
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
