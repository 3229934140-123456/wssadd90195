import { create } from 'zustand';
import type {
  Customer,
  RechargePlan,
  ApprovalRecord,
  FollowUpReminder,
  RiskDetail,
  Consultant,
  PaymentMethod,
  PayerRelation,
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
  markPlanCompleted: (planId: string) => void;
  approvePlan: (approvalId: string, approved: boolean, comment: string) => void;
  completeReminder: (id: string) => void;
  searchCustomers: (phone: string) => Customer[];
  getCustomerById: (id: string) => Customer | undefined;
  validatePlan: (
    customerId: string,
    amount: number,
    giftRatio: number,
    boundProjects: string[],
    validityPeriod: number,
    paymentMethod: PaymentMethod,
    payerRelation: PayerRelation
  ) => RiskDetail[];
}

function findRuleForProject(project: string) {
  const matched = activityRules.find(
    (r) => r.validProjects.length > 0 && r.validProjects.includes(project)
  );
  return matched ?? activityRules[activityRules.length - 1];
}

function validatePlanRisks(
  customer: Customer,
  amount: number,
  giftRatio: number,
  boundProjects: string[],
  _validityPeriod: number,
  paymentMethod: PaymentMethod,
  payerRelation: PayerRelation
): RiskDetail[] {
  const risks: RiskDetail[] = [];

  if (boundProjects.length === 0) {
    const defaultRule = activityRules[activityRules.length - 1];
    if (giftRatio > defaultRule.maxGiftRatio) {
      risks.push({
        type: '赠送超标',
        level: 'red',
        message: `未绑定项目，赠送比例${(giftRatio * 100).toFixed(0)}%超出通用上限${(defaultRule.maxGiftRatio * 100).toFixed(0)}%`,
        rule: `通用规则：赠送上限${(defaultRule.maxGiftRatio * 100).toFixed(0)}%`,
      });
    }
    if (amount > defaultRule.maxAmount) {
      risks.push({
        type: '金额超标',
        level: 'red',
        message: `充值金额${(amount / 10000).toFixed(1)}万元超出通用上限${(defaultRule.maxAmount / 10000).toFixed(1)}万元`,
        rule: `通用规则：单次充值上限${(defaultRule.maxAmount / 10000).toFixed(1)}万元`,
      });
    }
  } else {
    const seenGift: Record<string, boolean> = {};
    const seenAmount: Record<string, boolean> = {};
    for (const project of boundProjects) {
      const rule = findRuleForProject(project);
      if (giftRatio > rule.maxGiftRatio && !seenGift[rule.id]) {
        seenGift[rule.id] = true;
        risks.push({
          type: '赠送超标',
          level: 'red',
          message: `项目「${project}」赠送比例${(giftRatio * 100).toFixed(0)}%超出活动「${rule.name}」上限${(rule.maxGiftRatio * 100).toFixed(0)}%`,
          rule: `活动规则：${rule.name}，赠送上限${(rule.maxGiftRatio * 100).toFixed(0)}%，适用项目：${rule.validProjects.join('、') || '全项目'}`,
        });
      }
      if (amount > rule.maxAmount && !seenAmount[rule.id]) {
        seenAmount[rule.id] = true;
        risks.push({
          type: '金额超标',
          level: 'red',
          message: `项目「${project}」充值金额${(amount / 10000).toFixed(1)}万元超出活动「${rule.name}」上限${(rule.maxAmount / 10000).toFixed(1)}万元`,
          rule: `活动规则：${rule.name}，单次充值上限${(rule.maxAmount / 10000).toFixed(1)}万元，适用项目：${rule.validProjects.join('、') || '全项目'}`,
        });
      }
    }
  }

  if (customer.age > 65) {
    risks.push({
      type: '高龄客户',
      level: 'red',
      message: `客户年龄${customer.age}岁，超过65岁阈值，需补充风险告知确认书`,
      rule: '高龄客户(>65岁)需填写补充说明并进行风险告知，家属确认签字',
    });
  }

  if (paymentMethod === 'cash' && amount >= 50000) {
    risks.push({
      type: '大额现金',
      level: 'red',
      message: `现金支付${(amount / 10000).toFixed(1)}万元，超过5万元阈值，需确认资金来源`,
      rule: '大额现金支付(>5万)需补充说明资金来源，建议使用银行转账',
    });
  }

  if ((payerRelation === 'family' || payerRelation === 'friend') && amount >= 10000) {
    risks.push({
      type: '亲友代付',
      level: 'yellow',
      message: payerRelation === 'family' ? '付款人为家属，需签署代付确认书' : '付款人为朋友，需签署代付确认书',
      rule: '亲友代付需填写代付关系并签署确认书，留存付款人身份证明',
    });
  }

  if (payerRelation === 'other') {
    risks.push({
      type: '代付关系',
      level: 'yellow',
      message: '付款人为其他身份，需补充说明代付原因',
      rule: '非本人/家属/朋友/公司代付需详细说明代付原因并签署确认书',
    });
  }

  if (payerRelation === 'company') {
    risks.push({
      type: '公司代付',
      level: 'yellow',
      message: '付款人为公司，需提供发票信息和代付说明',
      rule: '公司代付需提供公司营业执照复印件和代付说明函',
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
      rule: '旧卡未消耗余额超过5万时应优先推荐消耗方案，不得诱导新充值',
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
      rule: '新方案绑定项目不应与未消耗套餐严重重叠，避免余额纠纷',
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
      rule: '90天内充值3次及以上需触发风控审查，建议先消耗余额再充值',
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

  addPlan: (plan) =>
    set((s) => {
      const customer = s.customers.find((c) => c.id === plan.customerId);
      const newPlans = [...s.plans, plan];
      let newApprovals = s.approvals;
      if (plan.riskLevel === 'red' && plan.approvalStatus === 'pending') {
        const consultant = s.currentConsultant;
        const approval: ApprovalRecord = {
          id: `ap_${Date.now()}`,
          planId: plan.id,
          consultantId: plan.consultantId,
          consultantName: consultant.name,
          customerName: customer?.name ?? '未知客户',
          supervisorId: 'c4',
          status: 'pending',
          comment: '',
          planAmount: plan.amount,
          giftRatio: plan.giftRatio,
          riskLevel: plan.riskLevel,
          createdAt: plan.createdAt,
        };
        newApprovals = [...s.approvals, approval];
      }
      return { plans: newPlans, approvals: newApprovals };
    }),

  updatePlan: (id, updates) =>
    set((s) => ({
      plans: s.plans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  markPlanCompleted: (planId) =>
    set((s) => ({
      plans: s.plans.map((p) =>
        p.id === planId ? { ...p, status: 'completed' as const } : p
      ),
    })),

  approvePlan: (approvalId, approved, comment) =>
    set((s) => {
      const approval = s.approvals.find((a) => a.id === approvalId);
      const newPlanStatus = approved
        ? ('approved' as const)
        : ('rejected' as const);
      return {
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
        plans: approval
          ? s.plans.map((p) =>
              p.id === approval.planId
                ? { ...p, approvalStatus: newPlanStatus }
                : p
            )
          : s.plans,
      };
    }),

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

  validatePlan: (
    customerId,
    amount,
    giftRatio,
    boundProjects,
    validityPeriod,
    paymentMethod,
    payerRelation
  ) => {
    const { customers } = get();
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return [];
    return validatePlanRisks(
      customer,
      amount,
      giftRatio,
      boundProjects,
      validityPeriod,
      paymentMethod,
      payerRelation
    );
  },
}));

export { activityRules, projectList };
