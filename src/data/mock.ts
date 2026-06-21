import type {
  Customer,
  ActivityRule,
  ViolationCase,
  ApprovalRecord,
  FollowUpReminder,
  RechargePlan,
  ConsultantStats,
  Consultant,
} from '@/types';

export const consultants: Consultant[] = [
  { id: 'c1', name: '张美玲', role: 'consultant', avatar: 'ZM' },
  { id: 'c2', name: '李晓薇', role: 'consultant', avatar: 'LX' },
  { id: 'c3', name: '王思雨', role: 'consultant', avatar: 'WS' },
  { id: 'c4', name: '陈佳琪', role: 'supervisor', avatar: 'CJ' },
  { id: 'c5', name: '刘雅琴', role: 'leader', avatar: 'LY' },
];

export const customers: Customer[] = [
  {
    id: 'cu1',
    phone: '13812345678',
    name: '赵女士',
    age: 32,
    level: 'V3',
    unusedBalance: 28500,
    preferences: ['玻尿酸', '肉毒素', '光子嫩肤'],
    packages: [
      {
        id: 'pk1',
        name: '焕颜储值卡',
        amount: 30000,
        giftRatio: 0.1,
        boundProjects: ['玻尿酸', '肉毒素'],
        expiryDate: '2026-12-31',
        remainingBalance: 15000,
        status: 'active',
      },
      {
        id: 'pk2',
        name: '美肌养护卡',
        amount: 15000,
        giftRatio: 0.05,
        boundProjects: ['光子嫩肤'],
        expiryDate: '2026-06-30',
        remainingBalance: 13500,
        status: 'expiring',
      },
    ],
    rechargeHistory: [
      { id: 'rh1', date: '2025-12-15', amount: 30000, giftAmount: 3000, packageId: 'pk1', consultantId: 'c1' },
      { id: 'rh2', date: '2025-09-20', amount: 15000, giftAmount: 750, packageId: 'pk2', consultantId: 'c1' },
    ],
    riskTags: [],
  },
  {
    id: 'cu2',
    phone: '13987654321',
    name: '孙女士',
    age: 68,
    level: 'V2',
    unusedBalance: 42000,
    preferences: ['热玛吉', '超声刀'],
    packages: [
      {
        id: 'pk3',
        name: '抗衰至尊卡',
        amount: 50000,
        giftRatio: 0.15,
        boundProjects: ['热玛吉', '超声刀'],
        expiryDate: '2026-09-30',
        remainingBalance: 42000,
        status: 'active',
      },
    ],
    rechargeHistory: [
      { id: 'rh3', date: '2026-01-10', amount: 50000, giftAmount: 7500, packageId: 'pk3', consultantId: 'c2' },
      { id: 'rh4', date: '2025-11-05', amount: 20000, giftAmount: 2000, packageId: 'pk_old1', consultantId: 'c2' },
    ],
    riskTags: ['高龄客户'],
  },
  {
    id: 'cu3',
    phone: '13555556666',
    name: '周女士',
    age: 28,
    level: 'V4',
    unusedBalance: 92000,
    preferences: ['玻尿酸', '水光针', '皮秒激光', '热玛吉'],
    packages: [
      {
        id: 'pk4',
        name: '钻石储值卡',
        amount: 100000,
        giftRatio: 0.12,
        boundProjects: ['玻尿酸', '水光针'],
        expiryDate: '2027-03-31',
        remainingBalance: 65000,
        status: 'active',
      },
      {
        id: 'pk5',
        name: '美肤优享卡',
        amount: 30000,
        giftRatio: 0.08,
        boundProjects: ['皮秒激光'],
        expiryDate: '2026-08-31',
        remainingBalance: 27000,
        status: 'active',
      },
    ],
    rechargeHistory: [
      { id: 'rh5', date: '2026-03-01', amount: 100000, giftAmount: 12000, packageId: 'pk4', consultantId: 'c1' },
      { id: 'rh6', date: '2025-12-01', amount: 30000, giftAmount: 2400, packageId: 'pk5', consultantId: 'c3' },
      { id: 'rh7', date: '2025-06-15', amount: 50000, giftAmount: 5000, packageId: 'pk_old2', consultantId: 'c1' },
    ],
    riskTags: ['短期多次充值'],
  },
  {
    id: 'cu4',
    phone: '18677778888',
    name: '吴女士',
    age: 45,
    level: 'V1',
    unusedBalance: 0,
    preferences: ['脱毛', '光子嫩肤'],
    packages: [],
    rechargeHistory: [],
    riskTags: [],
  },
  {
    id: 'cu5',
    phone: '13399990000',
    name: '郑女士',
    age: 55,
    level: 'V5',
    unusedBalance: 158000,
    preferences: ['热玛吉', '线雕', '脂肪填充', '玻尿酸', '水光针'],
    packages: [
      {
        id: 'pk6',
        name: '尊享白金卡',
        amount: 200000,
        giftRatio: 0.18,
        boundProjects: ['热玛吉', '线雕', '脂肪填充'],
        expiryDate: '2027-06-30',
        remainingBalance: 128000,
        status: 'active',
      },
      {
        id: 'pk7',
        name: '美丽随心卡',
        amount: 30000,
        giftRatio: 0.1,
        boundProjects: ['玻尿酸', '水光针'],
        expiryDate: '2026-12-31',
        remainingBalance: 30000,
        status: 'active',
      },
    ],
    rechargeHistory: [
      { id: 'rh8', date: '2026-02-14', amount: 200000, giftAmount: 36000, packageId: 'pk6', consultantId: 'c2' },
      { id: 'rh9', date: '2025-10-20', amount: 30000, giftAmount: 3000, packageId: 'pk7', consultantId: 'c2' },
      { id: 'rh10', date: '2025-07-01', amount: 80000, giftAmount: 8000, packageId: 'pk_old3', consultantId: 'c1' },
    ],
    riskTags: ['高龄客户', '短期多次充值', '大额储值'],
  },
];

export const activityRules: ActivityRule[] = [
  {
    id: 'ar1',
    name: '春季焕颜季',
    maxGiftRatio: 0.15,
    maxAmount: 100000,
    validProjects: ['玻尿酸', '肉毒素', '水光针'],
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    description: '春季限定活动，玻尿酸/肉毒素/水光针项目充值赠送比例上限15%，单次充值上限10万元',
  },
  {
    id: 'ar2',
    name: '抗衰至尊礼',
    maxGiftRatio: 0.18,
    maxAmount: 200000,
    validProjects: ['热玛吉', '超声刀', '线雕'],
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    description: '抗衰项目专属活动，赠送比例上限18%，单次充值上限20万元',
  },
  {
    id: 'ar3',
    name: '新客首充礼',
    maxGiftRatio: 0.1,
    maxAmount: 30000,
    validProjects: ['光子嫩肤', '脱毛', '皮秒激光'],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    description: '新客首次充值专享，赠送比例上限10%，单次充值上限3万元',
  },
  {
    id: 'ar4',
    name: '全院通用规则',
    maxGiftRatio: 0.08,
    maxAmount: 50000,
    validProjects: [],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    description: '无活动期间通用赠送上限，赠送比例不超过8%，单次充值不超过5万元',
  },
];

export const violationCases: ViolationCase[] = [
  {
    id: 'vc1',
    type: '赠送超标',
    description: '咨询师向客户承诺30%赠送比例，远超活动上限15%',
    consequence: '客户要求兑现承诺未果后投诉，机构被罚退还全部赠送金额并整改',
    anonymousDetail: '2025年Q2，某咨询师为冲刺月度业绩，私下向客户承诺远超活动标准的赠送比例。客户充值后发现实际赠送不达标，提起消费投诉，最终机构退还差额并受到监管部门警告。',
  },
  {
    id: 'vc2',
    type: '短期重复充值',
    description: '客户3天内连续充值3次，每次5万元，均未消耗即再次充值',
    consequence: '客户家属以诱导消费为由要求全额退款，机构退还12万元',
    anonymousDetail: '2025年某月，一位客户在咨询师推荐下连续3天充值，累计15万元。客户家属发现后认为存在诱导消费和过度推销，向消协投诉。经调解，机构退还大部分金额，咨询师被停职处理。',
  },
  {
    id: 'vc3',
    type: '高龄客户未告知风险',
    description: '68岁客户大额充值未做风险提示和家属确认',
    consequence: '客户术后并发症要求全额退款，机构被判退费并赔偿',
    anonymousDetail: '2025年，一位高龄客户在未充分了解风险的情况下大额充值并接受了项目治疗。术后出现并发症，家属起诉机构未尽告知义务。法院判决机构退还储值余额并赔偿医疗费用。',
  },
  {
    id: 'vc4',
    type: '亲友代付未留痕',
    description: '客户储值由朋友代付，无代付协议和留痕记录',
    consequence: '付款人与使用人纠纷，机构被牵连承担连带责任',
    anonymousDetail: '2025年，某客户储值由朋友代为支付，双方未签署代付确认书。后因朋友关系恶化，付款人要求退还其支付的金额，客户拒绝。纠纷升级后机构被牵连，需配合调查并完善代付流程。',
  },
  {
    id: 'vc5',
    type: '旧卡未消耗推新卡',
    description: '客户旧卡余额超5万未消耗，咨询师仍推荐新的大额储值方案',
    consequence: '客户投诉强制消费，机构被要求整改并退还新卡费用',
    anonymousDetail: '2025年，一位客户旧卡余额超过5万元尚未消耗，咨询师仍推荐其充值新的储值方案。客户在压力下充值后反悔，投诉至监管部门。机构被要求整改销售流程，优先消耗旧卡余额。',
  },
];

export const approvalRecords: ApprovalRecord[] = [
  {
    id: 'ap1',
    planId: 'rp_ex1',
    consultantId: 'c1',
    consultantName: '张美玲',
    customerName: '赵女士',
    supervisorId: 'c4',
    status: 'pending',
    comment: '',
    planAmount: 50000,
    giftRatio: 0.2,
    riskLevel: 'red',
    createdAt: '2026-06-22T10:30:00',
  },
  {
    id: 'ap2',
    planId: 'rp_ex2',
    consultantId: 'c2',
    consultantName: '李晓薇',
    customerName: '孙女士',
    supervisorId: 'c4',
    status: 'pending',
    comment: '',
    planAmount: 80000,
    giftRatio: 0.15,
    riskLevel: 'red',
    createdAt: '2026-06-22T09:15:00',
  },
  {
    id: 'ap3',
    planId: 'rp_ex3',
    consultantId: 'c3',
    consultantName: '王思雨',
    customerName: '周女士',
    supervisorId: 'c4',
    status: 'approved',
    comment: '客户为V4会员，历史消费记录良好，同意特殊折扣',
    planAmount: 60000,
    giftRatio: 0.16,
    riskLevel: 'yellow',
    createdAt: '2026-06-20T14:00:00',
    resolvedAt: '2026-06-20T15:30:00',
  },
  {
    id: 'ap4',
    planId: 'rp_ex4',
    consultantId: 'c1',
    consultantName: '张美玲',
    customerName: '吴女士',
    supervisorId: 'c4',
    status: 'rejected',
    comment: '赠送比例超出活动上限过多，建议调整至10%以内重新提交',
    planAmount: 25000,
    giftRatio: 0.25,
    riskLevel: 'red',
    createdAt: '2026-06-19T11:00:00',
    resolvedAt: '2026-06-19T14:00:00',
  },
];

export const followUpReminders: FollowUpReminder[] = [
  {
    id: 'fr1',
    customerId: 'cu2',
    customerName: '孙女士',
    consultantId: 'c2',
    type: 'old_card',
    urgency: 'high',
    message: '客户"抗衰至尊卡"余额42000元尚未消耗，请优先推荐消耗方案',
    suggestedScript: '孙姐，您之前的抗衰至尊卡还有4万2的余额，我们先把这个用起来，最近热玛吉有新仪器上线，效果特别好，要不先安排一次？',
    dueDate: '2026-06-25',
    completed: false,
  },
  {
    id: 'fr2',
    customerId: 'cu5',
    customerName: '郑女士',
    consultantId: 'c2',
    type: 'old_card',
    urgency: 'high',
    message: '客户两张卡累计余额158000元未消耗，请先消耗旧卡再推荐新方案',
    suggestedScript: '郑姐，您两张卡的余额还挺充裕的，美丽随心卡里的玻尿酸和水光针项目您可以先安排做，我帮您预约最近的时间？',
    dueDate: '2026-06-24',
    completed: false,
  },
  {
    id: 'fr3',
    customerId: 'cu1',
    customerName: '赵女士',
    consultantId: 'c1',
    type: 'expiring',
    urgency: 'medium',
    message: '客户"美肌养护卡"将于2026-06-30到期，余额13500元，请提醒客户尽快使用',
    suggestedScript: '赵姐，提醒您一下，美肌养护卡月底就要到期了，里面还有1万3的余额，光子嫩肤刚好可以做两次，这周有空的话我帮您安排？',
    dueDate: '2026-06-28',
    completed: false,
  },
  {
    id: 'fr4',
    customerId: 'cu3',
    customerName: '周女士',
    consultantId: 'c1',
    type: 'repurchase',
    urgency: 'low',
    message: '客户上次充值距今已3个月，可适当推荐新项目',
    suggestedScript: '周姐，好久没见了，最近我们新上了皮秒3.0的技术，效果比之前好很多，要不要来体验一下？',
    dueDate: '2026-07-05',
    completed: false,
  },
  {
    id: 'fr5',
    customerId: 'cu4',
    customerName: '吴女士',
    consultantId: 'c3',
    type: 'repurchase',
    urgency: 'medium',
    message: '客户余额为0，上次消费距今6个月，可推荐新客活动方案',
    suggestedScript: '吴姐，好久没来啦，现在有新客首充活动，光子嫩肤和脱毛项目充值有额外赠送，特别划算，要不要了解一下？',
    dueDate: '2026-06-30',
    completed: false,
  },
  {
    id: 'fr6',
    customerId: 'cu5',
    customerName: '郑女士',
    consultantId: 'c2',
    type: 'expiring',
    urgency: 'low',
    message: '客户"美丽随心卡"将于2026-12-31到期，余额30000元',
    suggestedScript: '郑姐，您美丽随心卡里的余额还比较充裕，可以随时来做玻尿酸和水光针维护。',
    dueDate: '2026-09-30',
    completed: false,
  },
];

export const rechargePlans: RechargePlan[] = [
  {
    id: 'rp1',
    customerId: 'cu1',
    consultantId: 'c1',
    amount: 50000,
    giftRatio: 0.1,
    boundProjects: ['玻尿酸', '水光针'],
    validityPeriod: 12,
    specialNotes: '',
    paymentMethod: 'bank_card',
    payerRelation: 'self',
    riskLevel: 'green',
    riskDetails: [],
    approvalStatus: 'none',
    createdAt: '2026-06-22T10:00:00',
    status: 'draft',
  },
  {
    id: 'rp2',
    customerId: 'cu2',
    consultantId: 'c2',
    amount: 80000,
    giftRatio: 0.15,
    boundProjects: ['热玛吉', '超声刀'],
    validityPeriod: 12,
    specialNotes: '客户为高龄客户，已进行风险告知并签署确认书',
    paymentMethod: 'cash',
    payerRelation: 'family',
    riskLevel: 'red',
    riskDetails: [
      { type: '高龄客户', level: 'red', message: '客户年龄68岁，超过65岁阈值，需补充风险告知确认书', rule: '高龄客户(>65岁)需填写补充说明并进行风险告知' },
      { type: '大额现金', level: 'red', message: '现金支付8万元，超过5万元阈值，需确认资金来源', rule: '大额现金支付(>5万)需补充说明资金来源' },
      { type: '亲友代付', level: 'yellow', message: '付款人为亲友，需签署代付确认书', rule: '亲友代付需填写代付关系并签署确认书' },
    ],
    approvalStatus: 'pending',
    createdAt: '2026-06-22T09:15:00',
    status: 'submitted',
  },
];

export const consultantStats: ConsultantStats[] = [
  {
    consultantId: 'c1',
    consultantName: '张美玲',
    avatar: 'ZM',
    totalPlans: 28,
    abnormalPlans: 4,
    abnormalRate: 14.3,
    trend: [12, 10, 15, 18, 14, 14.3],
  },
  {
    consultantId: 'c2',
    consultantName: '李晓薇',
    avatar: 'LX',
    totalPlans: 35,
    abnormalPlans: 8,
    abnormalRate: 22.9,
    trend: [18, 20, 22, 19, 25, 22.9],
  },
  {
    consultantId: 'c3',
    consultantName: '王思雨',
    avatar: 'WS',
    totalPlans: 22,
    abnormalPlans: 2,
    abnormalRate: 9.1,
    trend: [8, 6, 10, 7, 11, 9.1],
  },
];

export const projectList = [
  '玻尿酸',
  '肉毒素',
  '水光针',
  '光子嫩肤',
  '皮秒激光',
  '热玛吉',
  '超声刀',
  '线雕',
  '脂肪填充',
  '脱毛',
];

export const standardTerms = `【储值服务协议条款】

一、储值金额及赠送
1. 客户充值金额以实际支付金额为准，赠送金额按活动比例计算。
2. 赠送金额不可提现，仅限在有效期内用于指定项目消费。

二、有效期
1. 储值卡有效期自充值之日起计算，有效期届满后未消耗余额不予退还。
2. 客户可在有效期届满前30日申请一次性延期，延期期限不超过3个月。

三、使用规则
1. 储值余额优先消耗最早到期的套餐。
2. 每次消费从储值余额中扣减，扣减顺序为：本金优先，赠送金额次之。
3. 储值余额不可转让给第三方使用。

四、退费规则
1. 未消费本金部分可申请退费，赠送金额不予退费。
2. 已消费部分按原价计算扣减，退费金额=充值本金-已消费原价金额。
3. 退费申请需提供原始充值凭证及身份证明。

五、特别提示
1. 本机构不会以任何形式强制客户充值或消费。
2. 客户有权随时查询储值余额及消费记录。
3. 如有疑问请致电客服热线：400-XXX-XXXX。

本人已阅读并充分理解以上条款，自愿办理储值服务。
客户签名：____________　日期：____________`;
