export interface Customer {
  id: string;
  phone: string;
  name: string;
  age: number;
  level: 'V1' | 'V2' | 'V3' | 'V4' | 'V5';
  unusedBalance: number;
  preferences: string[];
  packages: CustomerPackage[];
  rechargeHistory: RechargeRecord[];
  riskTags: string[];
}

export interface CustomerPackage {
  id: string;
  name: string;
  amount: number;
  giftRatio: number;
  boundProjects: string[];
  expiryDate: string;
  remainingBalance: number;
  status: 'active' | 'expiring' | 'expired';
}

export interface RechargeRecord {
  id: string;
  date: string;
  amount: number;
  giftAmount: number;
  packageId: string;
  consultantId: string;
}

export type PaymentMethod = 'cash' | 'bank_card' | 'wechat' | 'alipay' | 'other';
export type PayerRelation = 'self' | 'family' | 'friend' | 'company' | 'other';

export interface RechargePlan {
  id: string;
  customerId: string;
  consultantId: string;
  amount: number;
  giftRatio: number;
  boundProjects: string[];
  validityPeriod: number;
  specialNotes: string;
  paymentMethod: PaymentMethod;
  payerRelation: PayerRelation;
  riskLevel: 'green' | 'yellow' | 'red';
  riskDetails: RiskDetail[];
  approvalStatus: 'none' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  status: 'draft' | 'submitted' | 'completed';
}

export interface RiskDetail {
  type: string;
  level: 'green' | 'yellow' | 'red';
  message: string;
  rule: string;
}

export interface ApprovalRecord {
  id: string;
  planId: string;
  consultantId: string;
  consultantName: string;
  customerName: string;
  supervisorId: string;
  status: 'pending' | 'approved' | 'rejected';
  comment: string;
  planAmount: number;
  giftRatio: number;
  riskLevel: 'green' | 'yellow' | 'red';
  createdAt: string;
  resolvedAt?: string;
}

export interface FollowUpReminder {
  id: string;
  customerId: string;
  customerName: string;
  consultantId: string;
  type: 'old_card' | 'repurchase' | 'expiring';
  urgency: 'high' | 'medium' | 'low';
  message: string;
  suggestedScript: string;
  dueDate: string;
  completed: boolean;
}

export interface ActivityRule {
  id: string;
  name: string;
  maxGiftRatio: number;
  maxAmount: number;
  validProjects: string[];
  startDate: string;
  endDate: string;
  description: string;
}

export interface ViolationCase {
  id: string;
  type: string;
  description: string;
  consequence: string;
  anonymousDetail: string;
}

export interface ConsultantStats {
  consultantId: string;
  consultantName: string;
  avatar: string;
  totalPlans: number;
  abnormalPlans: number;
  abnormalRate: number;
  trend: number[];
}

export interface Consultant {
  id: string;
  name: string;
  role: 'consultant' | 'supervisor' | 'leader';
  avatar: string;
}
