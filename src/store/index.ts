import { create } from 'zustand';
import type {
  Customer,
  RechargePlan,
  ApprovalRecord,
  FollowUpReminder,
  RiskDetail,
  Consultant,
} from '@/types';
import {
  customers as mockCustomers,
  approvalRecords as mockApprovals,
  followUpReminders as mockReminders,
  rechargePlans as mockPlans,
  consultants as mockConsultants,
  activityRules,
  projectList,
} from '@/data/mock';

interface AppState {
  currentConsultant: Consultant;
  customers: Customer[];
  plans: RechargePlan[];
  approvals: ApprovalRecord[];
  reminders: FollowUpReminder[];
  selectedCustomerId: string | null;

  setSelectedCustomerId: (id: string | null) => void;
  addPlan: (plan: RechargePlan) => void;
  updatePlan: (id: string, updates: Partial<RechargePlan>) => void;
  approvePlan: (approvalId: string, approved: boolean, comment: string) => void;
  completeReminder: (id: string) => void;
  searchCustomers: (phone: string) => Customer[];
  getCustomerById: (id: string) => Customer | undefined;
  validatePlan: (
    customerId: string,
    amount: number,
    giftRatio: number,
    boundProjects: string[],
    validityPeriod: number
  ) => RiskDetail[];
}

function validatePlanRisks(
  customer: Customer,
  amount: number,
  giftRatio: number,
  boundProjects: string[],
  _validityPeriod: number
): RiskDetail[] {
  const risks: RiskDetail[] = [];

  const matchingRules = activityRules.filter(
    (rule) =>
      rule.validProjects.length === 0 ||
      boundProjects.some((p) => rule.validProjects.includes(p))
  );

  if (matchingRules.length > 0) {
    const bestRule = matchingRules.reduce((a, b) =>
      a.maxGiftRatio > b.maxGiftRatio ? a : b
    );
    if (giftRatio > bestRule.maxGiftRatio) {
      risks.push({
        type: '赠送超标',
        level: 'red',
        message: `赠送比例${(giftRatio * 100).toFixed(0)}%超出活动「${bestRule.name}」上限${(bestRule.maxGiftRatio * 100).toFixed(0)}%`,
        rule: `活动规则：${bestRule.name}，赠送上限${(bestRule.maxGiftRatio * 100).toFixed(0)}%`,
      });
    }
    if (amount > bestRule.maxAmount) {
      risks.push({
        type: '金额超标',
        level: 'red',
        message: `充值金额${(amount / 10000).toFixed(1)}万元超出活动「${bestRule.name}」上限${(bestRule.maxAmount / 10000).toFixed(1)}万元`,
        rule: `活动规则：${bestRule.name}，单次充值上限${(bestRule.maxAmount / 10000).toFixed(1)}万元`,
      });
    }
  } else {
    const defaultRule = activityRules[activityRules.length - 1];
    if (giftRatio > defaultRule.maxGiftRatio) {
      risks.push({
        type: '赠送超标',
        level: 'red',
        message: `无适用活动，赠送比例${(giftRatio * 100).toFixed(0)}%超出通用上限${(defaultRule.maxGiftRatio * 100).toFixed(0)}%`,
        rule: `通用规则：赠送上限${(defaultRule.maxGiftRatio * 100).toFixed(0)}%`,
      });
    }
  }

  if (customer.age > 65) {
    risks.push({
      type: '高龄客户',
      level: 'red',
      message: `客户年龄${customer.age}岁，超过65岁阈值，需补充风险告知确认书`,
      rule: '高龄客户(>65岁)需填写补充说明并进行风险告知',
    });
  }

  if (amount >= 50000) {
    risks.push({
      type: '大额充值',
      level: 'yellow',
      message: `单次充值${(amount / 10000).toFixed(1)}万元，超过5万元阈值`,
      rule: '大额现金支付(>5万)需补充说明资金来源',
    });
  }

  const activePackages = customer.packages.filter(
    (p) => p.status === 'active' || p.status === 'expiring'
  );
  const totalUnused = activePackages.reduce((s, p) => s + p.remainingBalance, 0);
  if (totalUnused > 50000) {
    risks.push({
      type: '旧卡未消耗',
      level: 'yellow',
      message: `客户现有${activePackages.length}张活跃卡，未消耗余额合计${(totalUnused / 10000).toFixed(1)}万元，建议先消耗旧卡`,
      rule: '旧卡未消耗余额超过5万时应优先推荐消耗方案',
    });
  }

  const overlapProjects = boundProjects.filter((p) =>
    activePackages.some((pkg) => pkg.boundProjects.includes(p))
  );
  if (overlapProjects.length > 0) {
    risks.push({
      type: '项目冲突',
      level: 'yellow',
      message: `绑定项目[${overlapProjects.join('、')}]与现有套餐重叠`,
      rule: '新方案绑定项目不应与未消耗套餐严重重叠',
    });
  }

  const recentRecharges = customer.rechargeHistory.filter((r) => {
    const d = new Date(r.date);
    const now = new Date();
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 90;
  });
  if (recentRecharges.length >= 3) {
    risks.push({
      type: '短期频繁充值',
      level: 'red',
      message: `近90天内充值${recentRecharges.length}次，存在短期频繁充值行为`,
      rule: '90天内充值3次及以上需触发风控审查',
    });
  }

  return risks;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentConsultant: mockConsultants[3],
  customers: mockCustomers,
  plans: mockPlans,
  approvals: mockApprovals,
  reminders: mockReminders,
  selectedCustomerId: null,

  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),

  addPlan: (plan) => set((s) => ({ plans: [...s.plans, plan] })),

  updatePlan: (id, updates) =>
    set((s) => ({
      plans: s.plans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  approvePlan: (approvalId, approved, comment) =>
    set((s) => ({
      approvals: s.approvals.map((a) =>
        a.id === approvalId
          ? {
              ...a,
              status: approved ? ('approved' as const) : ('rejected' as const),
              comment,
              resolvedAt: new Date().toISOString(),
            }
          : a
      ),
    })),

  completeReminder: (id) =>
    set((s) => ({
      reminders: s.reminders.map((r) =>
        r.id === id ? { ...r, completed: true } : r
      ),
    })),

  searchCustomers: (phone) => {
    const { customers } = get();
    if (!phone) return [];
    return customers.filter((c) => c.phone.includes(phone));
  },

  getCustomerById: (id) => {
    const { customers } = get();
    return customers.find((c) => c.id === id);
  },

  validatePlan: (customerId, amount, giftRatio, boundProjects, validityPeriod) => {
    const { customers } = get();
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return [];
    return validatePlanRisks(customer, amount, giftRatio, boundProjects, validityPeriod);
  },
}));

export { activityRules, projectList };
