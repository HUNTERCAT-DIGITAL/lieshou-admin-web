/**
 * Legal 案件/时间线/卷宗/计费/费用 API service — openapi-fetch 类型化客户端（ADR-0016）.
 *
 * 由 SpringDoc spec 生成的 paths 类型驱动（packages/api-client/generated.legal.ts），
 * JWT 注入 / 错误统一由 legalClient middleware 处理（错误统一 throw，调用方 catch → handleError）。
 *
 * 说明：generated 实体字段为可选（spec 未标 required），运行时后端必返 —— 用 `as never`
 * 窄化到手写类型（services 返回签名承担类型契约，middleware 保证 data 非空）。
 */

import { legalClient } from './legalClient';

/**
 * 解包 openapi-fetch data（middleware 保证错误已 throw，data 恒非空）。
 * 返回类型由函数签名承担；generated 可选字段窄化见文件头说明。
 */
function unwrap<T>(value: T | undefined): T {
  if (value === undefined) {
    // 理论上不会到达：legalClient middleware 对非 2xx 已统一 throw
    throw new Error('EMPTY_RESPONSE');
  }
  return value;
}
import type {
  CaseEvent,
  CaseEventRequest,
  CasePriority,
  CaseStage,
  CaseStatus,
  CaseType,
  ContactLetter,
  CreateCaseRequest,
  DocumentRequest,
  Expense,
  ExpenseRequest,
  ExpenseSummary,
  LegalCase,
  LegalDocument,
  LegalPage,
  LetterRequest,
  LetterSummary,
  KnowledgeCard,
  KnowledgeCardRequest,
  KnowledgeCardStatus,
  KnowledgeSummary,
  GrowthSummary,
  RecentWorkItem,
  TimeEntry,
  TimeEntryRequest,
  TimeEntrySummary,
  UpdateCaseRequest,
  WorkbenchSummary,
  LegalClient,
  ClientRequest,
  ClientSuccessSummary,
  ClientValueRecord,
  MatterSchedule,
  ScheduleRequest,
  MatterCalendarSummary,
  EnablementSummary,
  GovernanceSummary,
  TeamMember,
  OrgSignal,
  OrgAction,
  CareerMilestone,
  GovernanceItem,
  GovernanceRule,
  AuditEvent,
  GovernanceStatus,
} from '../types/legal';

// ============================================================
// 案件
// ============================================================

/** GET /api/legal/cases — 租户内案件分页列表（keyword/status/caseType/lawyer 过滤 + page/size） */
export async function listCases(
  params?: {
    keyword?: string;
    status?: CaseStatus;
    caseType?: CaseType;
    stage?: CaseStage;
    priority?: CasePriority;
    lawyer?: string;
  },
  page = 1,
  size = 20,
): Promise<LegalPage<LegalCase>> {
  const { data } = await legalClient.GET('/api/legal/cases', {
    params: {
      query: {
        keyword: params?.keyword,
        status: params?.status,
        caseType: params?.caseType,
        stage: params?.stage,
        priority: params?.priority,
        lawyer: params?.lawyer,
        page,
        size,
      },
    },
  });
  return unwrap(data) as never;
}

/** GET /api/legal/cases/count — 租户内未删案件数 */
export async function countCases(): Promise<number> {
  const { data } = await legalClient.GET('/api/legal/cases/count', {});
  return unwrap(data) as never;
}

/** GET /api/legal/cases/status-counts — 各状态案件数（工作台统计） */
export async function caseStatusCounts(): Promise<Record<CaseStatus, number>> {
  const { data } = await legalClient.GET('/api/legal/cases/status-counts', {});
  return unwrap(data) as never;
}

/** GET /api/legal/cases/{id} */
export async function getCase(id: number): Promise<LegalCase> {
  const { data } = await legalClient.GET('/api/legal/cases/{id}', {
    params: { path: { id } },
  });
  return unwrap(data) as never;
}

/** POST /api/legal/cases — 创建（tenant 强制取请求租户） */
export async function createCase(body: CreateCaseRequest): Promise<LegalCase> {
  const { data } = await legalClient.POST('/api/legal/cases', { body });
  return unwrap(data) as never;
}

/** PUT /api/legal/cases/{id} — 更新 + 状态前进 */
export async function updateCase(id: number, body: UpdateCaseRequest): Promise<LegalCase> {
  const { data } = await legalClient.PUT('/api/legal/cases/{id}', {
    params: { path: { id } },
    body,
  });
  return unwrap(data) as never;
}

/** DELETE /api/legal/cases/{id} — 软删 */
export async function deleteCase(id: number): Promise<void> {
  await legalClient.DELETE('/api/legal/cases/{id}', { params: { path: { id } } });
}

// ============================================================
// 办案时间线
// ============================================================

/** GET /api/legal/cases/{id}/events — 案件时间线（按发生时间升序） */
export async function listCaseEvents(caseId: number): Promise<CaseEvent[]> {
  const { data } = await legalClient.GET('/api/legal/cases/{id}/events', {
    params: { path: { id: caseId } },
  });
  return unwrap(data) as never;
}

/** POST /api/legal/cases/{id}/events — 添加时间线事件 */
export async function createCaseEvent(caseId: number, body: CaseEventRequest): Promise<CaseEvent> {
  const { data } = await legalClient.POST('/api/legal/cases/{id}/events', {
    params: { path: { id: caseId } },
    body,
  });
  return unwrap(data) as never;
}

/** PUT /api/legal/events/{id} — 编辑事件 */
export async function updateCaseEvent(id: number, body: CaseEventRequest): Promise<CaseEvent> {
  const { data } = await legalClient.PUT('/api/legal/events/{id}', {
    params: { path: { id } },
    body,
  });
  return unwrap(data) as never;
}

/** DELETE /api/legal/events/{id} — 软删事件 */
export async function deleteCaseEvent(id: number): Promise<void> {
  await legalClient.DELETE('/api/legal/events/{id}', { params: { path: { id } } });
}

// ============================================================
// 卷宗文书（ADR-0045 Phase 2）
// ============================================================

/** GET /api/legal/cases/{id}/documents — 案件卷宗分页（按文书日期倒序） */
export async function listCaseDocuments(
  caseId: number,
  page = 1,
  size = 20,
): Promise<LegalPage<LegalDocument>> {
  const { data } = await legalClient.GET('/api/legal/cases/{caseId}/documents', {
    params: { path: { caseId }, query: { page, size } },
  });
  return unwrap(data) as never;
}

/** POST /api/legal/cases/{id}/documents — 添加卷宗文书 */
export async function createCaseDocument(
  caseId: number,
  body: DocumentRequest,
): Promise<LegalDocument> {
  const { data } = await legalClient.POST('/api/legal/cases/{caseId}/documents', {
    params: { path: { caseId } },
    body,
  });
  return unwrap(data) as never;
}

/** PUT /api/legal/documents/{id} — 编辑文书 */
export async function updateCaseDocument(
  id: number,
  body: DocumentRequest,
): Promise<LegalDocument> {
  const { data } = await legalClient.PUT('/api/legal/documents/{id}', {
    params: { path: { id } },
    body,
  });
  return unwrap(data) as never;
}

/** DELETE /api/legal/documents/{id} — 软删文书 */
export async function deleteCaseDocument(id: number): Promise<void> {
  await legalClient.DELETE('/api/legal/documents/{id}', { params: { path: { id } } });
}

// ============================================================
// 计时计费（ADR-0045 Phase 2）
// ============================================================

/** GET /api/legal/cases/{id}/time-entries — 案件工时分页（按工作日期倒序） */
export async function listCaseTimeEntries(
  caseId: number,
  page = 1,
  size = 20,
): Promise<LegalPage<TimeEntry>> {
  const { data } = await legalClient.GET('/api/legal/cases/{caseId}/time-entries', {
    params: { path: { caseId }, query: { page, size } },
  });
  return unwrap(data) as never;
}

/** GET /api/legal/cases/{id}/time-entries/summary — 总工时 + 总金额 */
export async function timeEntrySummary(caseId: number): Promise<TimeEntrySummary> {
  const { data } = await legalClient.GET('/api/legal/cases/{caseId}/time-entries/summary', {
    params: { path: { caseId } },
  });
  return unwrap(data) as never;
}

/** POST /api/legal/cases/{id}/time-entries — 添加工时（amount 服务端计算） */
export async function createCaseTimeEntry(
  caseId: number,
  body: TimeEntryRequest,
): Promise<TimeEntry> {
  const { data } = await legalClient.POST('/api/legal/cases/{caseId}/time-entries', {
    params: { path: { caseId } },
    body,
  });
  return unwrap(data) as never;
}

/** PUT /api/legal/time-entries/{id} — 编辑工时（金额自动重算） */
export async function updateCaseTimeEntry(id: number, body: TimeEntryRequest): Promise<TimeEntry> {
  const { data } = await legalClient.PUT('/api/legal/time-entries/{id}', {
    params: { path: { id } },
    body,
  });
  return unwrap(data) as never;
}

/** PUT /api/legal/time-entries/{id}/confirm — 律时确认归属（PENDING → CONFIRMED） */
export async function confirmTimeEntry(id: number): Promise<TimeEntry> {
  const { data } = await legalClient.PUT('/api/legal/time-entries/{id}/confirm', {
    params: { path: { id } },
  });
  return unwrap(data) as never;
}

/** DELETE /api/legal/time-entries/{id} — 软删工时 */
export async function deleteCaseTimeEntry(id: number): Promise<void> {
  await legalClient.DELETE('/api/legal/time-entries/{id}', { params: { path: { id } } });
}

// ============================================================
// 费用条目（ADR-0045 Phase 2 扩展）
// ============================================================

/** GET /api/legal/cases/{id}/expenses — 案件费用分页（按发生日期倒序） */
export async function listCaseExpenses(
  caseId: number,
  page = 1,
  size = 20,
): Promise<LegalPage<Expense>> {
  const { data } = await legalClient.GET('/api/legal/cases/{caseId}/expenses', {
    params: { path: { caseId }, query: { page, size } },
  });
  return unwrap(data) as never;
}

/** GET /api/legal/cases/{id}/expenses/summary — 费用总额 + 条数 */
export async function expenseSummary(caseId: number): Promise<ExpenseSummary> {
  const { data } = await legalClient.GET('/api/legal/cases/{caseId}/expenses/summary', {
    params: { path: { caseId } },
  });
  return unwrap(data) as never;
}

/** POST /api/legal/cases/{id}/expenses — 添加费用条目 */
export async function createCaseExpense(caseId: number, body: ExpenseRequest): Promise<Expense> {
  const { data } = await legalClient.POST('/api/legal/cases/{caseId}/expenses', {
    params: { path: { caseId } },
    body,
  });
  return unwrap(data) as never;
}

/** PUT /api/legal/expenses/{id} — 编辑费用 */
export async function updateCaseExpense(id: number, body: ExpenseRequest): Promise<Expense> {
  const { data } = await legalClient.PUT('/api/legal/expenses/{id}', {
    params: { path: { id } },
    body,
  });
  return unwrap(data) as never;
}

/** DELETE /api/legal/expenses/{id} — 软删费用 */
export async function deleteCaseExpense(id: number): Promise<void> {
  await legalClient.DELETE('/api/legal/expenses/{id}', { params: { path: { id } } });
}

// ============================================================
// 工作台（TODAY COMMAND 今日作战台 · V35/V36）
// ============================================================/** GET /api/legal/workbench/summary — 工作台聚合统计 */
export async function workbenchSummary(): Promise<WorkbenchSummary> {
  const { data } = await legalClient.GET('/api/legal/workbench/summary', {});
  return unwrap(data) as never;
}

/** GET /api/legal/workbench/recent — 最近工作（断点续作） */
export async function workbenchRecent(limit = 6): Promise<RecentWorkItem[]> {
  const { data } = await legalClient.GET('/api/legal/workbench/recent', {
    params: { query: { limit } },
  });
  return unwrap(data) as never;
}

// ============================================================
// 案件闸门（V35 可信业务链）
// ============================================================

import type { Gate, GateStatus } from '../types/legal';

/** GET /api/legal/cases/{id}/gates — 八闸门（立项四门 + 结案四门） */
export async function listCaseGates(caseId: number): Promise<Gate[]> {
  const { data } = await legalClient.GET('/api/legal/cases/{caseId}/gates', {
    params: { path: { caseId } },
  });
  return unwrap(data) as never;
}

/** PUT /api/legal/gates/{id} — 更新闸门状态/备注 */
export async function updateGate(
  id: number,
  body: { status: GateStatus; note?: string },
): Promise<Gate> {
  const { data } = await legalClient.PUT('/api/legal/gates/{id}', {
    params: { path: { id } },
    body,
  });
  return unwrap(data) as never;
}

/** GET /api/legal/cases/{id}/gates/summary — 立项闸门通过情况 */
export async function intakeGateSummary(caseId: number): Promise<{
  intakeGatesPassed: boolean;
  unpassedCount: number;
}> {
  const { data } = await legalClient.GET('/api/legal/cases/{caseId}/gates/summary', {
    params: { path: { caseId } },
  });
  return unwrap(data) as never;
}

// ============================================================
// 联系函（客户沟通 CLIENT COMMUNICATION · 愿景「1 封联系函 · 2 项待确认」）
// ============================================================

/** GET /api/legal/cases/{id}/letters — 案件联系函分页列表 */
export async function listCaseLetters(
  caseId: number,
  page = 1,
  size = 20,
): Promise<LegalPage<ContactLetter>> {
  const { data } = await legalClient.GET('/api/legal/cases/{caseId}/letters', {
    params: { path: { caseId }, query: { page, size } },
  });
  return unwrap(data) as never;
}

/** GET /api/legal/cases/{id}/letters/summary — 联系函汇总（总数 + 待确认） */
export async function letterSummary(caseId: number): Promise<LetterSummary> {
  const { data } = await legalClient.GET('/api/legal/cases/{caseId}/letters/summary', {
    params: { path: { caseId } },
  });
  return unwrap(data) as never;
}

/** POST /api/legal/cases/{id}/letters — 新增联系函（默认 PENDING） */
export async function createCaseLetter(
  caseId: number,
  body: LetterRequest,
): Promise<ContactLetter> {
  const { data } = await legalClient.POST('/api/legal/cases/{caseId}/letters', {
    params: { path: { caseId } },
    body,
  });
  return unwrap(data) as never;
}

/** PUT /api/legal/letters/{id} — 编辑联系函 */
export async function updateCaseLetter(id: number, body: LetterRequest): Promise<ContactLetter> {
  const { data } = await legalClient.PUT('/api/legal/letters/{id}', {
    params: { path: { id } },
    body,
  });
  return unwrap(data) as never;
}

/** PUT /api/legal/letters/{id}/confirm — 确认联系函（PENDING → CONFIRMED，幂等） */
export async function confirmCaseLetter(id: number): Promise<ContactLetter> {
  const { data } = await legalClient.PUT('/api/legal/letters/{id}/confirm', {
    params: { path: { id } },
  });
  return unwrap(data) as never;
}

/** DELETE /api/legal/letters/{id} — 软删联系函 */
export async function deleteCaseLetter(id: number): Promise<void> {
  await legalClient.DELETE('/api/legal/letters/{id}', { params: { path: { id } } });
}

// ============================================================
// 知识资产中心（KNOWLEDGE ASSETS · 经验候选→专业复核→脱敏复用）
// ============================================================

/** GET /api/legal/knowledge-cards — 知识卡分页（类型/状态/关键词过滤） */
export async function listKnowledgeCards(
  params?: { cardType?: string; status?: string; keyword?: string },
  page = 1,
  size = 20,
): Promise<LegalPage<KnowledgeCard>> {
  const { data } = await legalClient.GET('/api/legal/knowledge-cards', {
    params: {
      query: {
        cardType: params?.cardType,
        status: params?.status,
        keyword: params?.keyword,
        page,
        size,
      },
    },
  });
  return unwrap(data) as never;
}

/** GET /api/legal/knowledge-cards/summary — 知识资产汇总 */
export async function knowledgeSummary(): Promise<KnowledgeSummary> {
  const { data } = await legalClient.GET('/api/legal/knowledge-cards/summary', {});
  return unwrap(data) as never;
}

/** GET /api/legal/growth/summary — 六维能力成长画像 + 成长指数 + 教练建议 */
export async function growthSummary(): Promise<GrowthSummary> {
  const { data } = await legalClient.GET('/api/legal/growth/summary', {});
  return unwrap(data) as never;
}

/** POST /api/legal/knowledge-cards — 新增知识卡（默认 DRAFT；失败教训自动受限） */
export async function createKnowledgeCard(body: KnowledgeCardRequest): Promise<KnowledgeCard> {
  const { data } = await legalClient.POST('/api/legal/knowledge-cards', { body });
  return unwrap(data) as never;
}

/** PUT /api/legal/knowledge-cards/{id} — 编辑知识卡 */
export async function updateKnowledgeCard(
  id: number,
  body: KnowledgeCardRequest,
): Promise<KnowledgeCard> {
  const { data } = await legalClient.PUT('/api/legal/knowledge-cards/{id}', {
    params: { path: { id } },
    body,
  });
  return unwrap(data) as never;
}

/** PUT /api/legal/knowledge-cards/{id}/status — 状态流转（待复核→已复核/可复用/驳回） */
export async function transitionKnowledgeCard(
  id: number,
  status: KnowledgeCardStatus,
): Promise<KnowledgeCard> {
  const { data } = await legalClient.PUT('/api/legal/knowledge-cards/{id}/status', {
    params: { path: { id } },
    body: { status },
  });
  return unwrap(data) as never;
}

/** DELETE /api/legal/knowledge-cards/{id} — 软删知识卡 */
export async function deleteKnowledgeCard(id: number): Promise<void> {
  await legalClient.DELETE('/api/legal/knowledge-cards/{id}', { params: { path: { id } } });
}

// ============================================================
// 客户成功中心（CLIENT SUCCESS CENTER · 愿景附录四）
// ============================================================

/** GET /api/legal/clients — 客户组合列表（生命周期/关注状态/关键词过滤） */
export async function listClients(
  params: { lifecycleStage?: string; status?: string; keyword?: string } = {},
  page = 1,
  size = 20,
): Promise<LegalPage<LegalClient>> {
  const { data } = await legalClient.GET('/api/legal/clients', {
    params: {
      query: {
        page,
        size,
        lifecycleStage: params.lifecycleStage,
        status: params.status,
        keyword: params.keyword,
      },
    },
  });
  return unwrap(data) as never;
}

/** GET /api/legal/clients/summary — 漏斗 + 组合健康度 + 待跟进 + 价值汇总 */
export async function clientSuccessSummary(): Promise<ClientSuccessSummary> {
  const { data } = await legalClient.GET('/api/legal/clients/summary', {});
  return unwrap(data) as never;
}

/** POST /api/legal/clients — 新增客户档案（健康分由四维自动计算） */
export async function createClient(body: ClientRequest): Promise<LegalClient> {
  const { data } = await legalClient.POST('/api/legal/clients', { body });
  return unwrap(data) as never;
}

/** PUT /api/legal/clients/{id} — 编辑客户档案 */
export async function updateClient(id: number, body: ClientRequest): Promise<LegalClient> {
  const { data } = await legalClient.PUT('/api/legal/clients/{id}', {
    params: { path: { id } },
    body,
  });
  return unwrap(data) as never;
}

/** DELETE /api/legal/clients/{id} — 软删客户 */
export async function deleteClient(id: number): Promise<void> {
  await legalClient.DELETE('/api/legal/clients/{id}', { params: { path: { id } } });
}

/** GET /api/legal/clients/{id}/values — 某客户价值记录 */
export async function listClientValues(id: number): Promise<ClientValueRecord[]> {
  const { data } = await legalClient.GET('/api/legal/clients/{id}/values', {
    params: { path: { id } },
  });
  return unwrap(data) as never;
}

/** POST /api/legal/clients/{id}/values — 新增价值记录（默认待确认） */
export async function createClientValue(
  id: number,
  body: { valueType: string; description: string },
): Promise<ClientValueRecord> {
  const { data } = await legalClient.POST('/api/legal/clients/{id}/values', {
    params: { path: { id } },
    body,
  });
  return unwrap(data) as never;
}

/** PUT /api/legal/client-values/{id}/confirm — 确认价值记录（幂等） */
export async function confirmClientValue(id: number): Promise<ClientValueRecord> {
  const { data } = await legalClient.PUT('/api/legal/client-values/{id}/confirm', {
    params: { path: { id } },
  });
  return unwrap(data) as never;
}

// ============================================================
// 任务与日程（MATTER CALENDAR · 愿景附录五）
// ============================================================

/** GET /api/legal/schedules — 日期范围日程（默认今天起 7 天） */
export async function listSchedules(params: { from?: string; to?: string } = {}): Promise<{
  items: MatterSchedule[];
  from: string;
  to: string;
}> {
  const { data } = await legalClient.GET('/api/legal/schedules', { params: { query: params } });
  return unwrap(data) as never;
}

/** GET /api/legal/schedules/summary — 统计卡 + 冲突 + 按案件投入 */
export async function matterCalendarSummary(): Promise<MatterCalendarSummary> {
  const { data } = await legalClient.GET('/api/legal/schedules/summary', {});
  return unwrap(data) as never;
}

/** POST /api/legal/schedules — 新增日程 */
export async function createSchedule(body: ScheduleRequest): Promise<MatterSchedule> {
  const { data } = await legalClient.POST('/api/legal/schedules', { body });
  return unwrap(data) as never;
}

/** PUT /api/legal/schedules/{id} — 编辑日程 */
export async function updateSchedule(id: number, body: ScheduleRequest): Promise<MatterSchedule> {
  const { data } = await legalClient.PUT('/api/legal/schedules/{id}', {
    params: { path: { id } },
    body,
  });
  return unwrap(data) as never;
}

/** PUT /api/legal/schedules/{id}/confirm — 确认律时自动变动（幂等） */
export async function confirmSchedule(id: number): Promise<MatterSchedule> {
  const { data } = await legalClient.PUT('/api/legal/schedules/{id}/confirm', {
    params: { path: { id } },
  });
  return unwrap(data) as never;
}

/** DELETE /api/legal/schedules/{id} — 软删日程 */
export async function deleteSchedule(id: number): Promise<void> {
  await legalClient.DELETE('/api/legal/schedules/{id}', { params: { path: { id } } });
}

// ============================================================
// 组织赋能驾驶舱（ENABLEMENT · 愿景附录三）
// ============================================================

/** GET /api/legal/enablement/summary — 组织赋能聚合 */
export async function enablementSummary(): Promise<EnablementSummary> {
  const { data } = await legalClient.GET('/api/legal/enablement/summary', {});
  return unwrap(data) as never;
}

/** POST /api/legal/enablement/members — 新增团队成员 */
export async function createTeamMember(body: Record<string, string>): Promise<TeamMember> {
  const { data } = await legalClient.POST('/api/legal/enablement/members', { body });
  return unwrap(data) as never;
}

/** PUT /api/legal/enablement/members/{id} — 编辑团队成员 */
export async function updateTeamMember(
  id: number,
  body: Record<string, string>,
): Promise<TeamMember> {
  const { data } = await legalClient.PUT('/api/legal/enablement/members/{id}', {
    params: { path: { id } },
    body,
  });
  return unwrap(data) as never;
}

/** DELETE /api/legal/enablement/members/{id} — 软删成员 */
export async function deleteTeamMember(id: number): Promise<void> {
  await legalClient.DELETE('/api/legal/enablement/members/{id}', { params: { path: { id } } });
}

/** PUT /api/legal/enablement/signals/{id} — 支持信号处置 */
export async function updateOrgSignal(
  id: number,
  body: { status?: string; disposition?: string },
): Promise<OrgSignal> {
  const { data } = await legalClient.PUT('/api/legal/enablement/signals/{id}', {
    params: { path: { id } },
    body,
  });
  return unwrap(data) as never;
}

/** PUT /api/legal/enablement/actions/{id}/done — 建议/帮助完成 */
export async function completeOrgAction(id: number): Promise<OrgAction> {
  const { data } = await legalClient.PUT('/api/legal/enablement/actions/{id}/done', {
    params: { path: { id } },
  });
  return unwrap(data) as never;
}

/** POST /api/legal/enablement/actions — 新增建议/帮助 */
export async function createOrgAction(body: Record<string, string>): Promise<OrgAction> {
  const { data } = await legalClient.POST('/api/legal/enablement/actions', { body });
  return unwrap(data) as never;
}

/** POST /api/legal/enablement/milestones — 新增职业里程碑 */
export async function createMilestone(body: Record<string, string>): Promise<CareerMilestone> {
  const { data } = await legalClient.POST('/api/legal/enablement/milestones', { body });
  return unwrap(data) as never;
}

// ============================================================
// 质量关口与治理（GOVERNANCE · 愿景附录九）
// ============================================================

/** GET /api/legal/governance/summary — 治理台聚合 */
export async function governanceSummary(): Promise<GovernanceSummary> {
  const { data } = await legalClient.GET('/api/legal/governance/summary', {});
  return unwrap(data) as never;
}

/** POST /api/legal/governance/items — 新增治理事项 */
export async function createGovernanceItem(body: Record<string, string>): Promise<GovernanceItem> {
  const { data } = await legalClient.POST('/api/legal/governance/items', { body });
  return unwrap(data) as never;
}

/** PUT /api/legal/governance/items/{id}/status — 事项状态流转 */
export async function transitionGovernanceItem(
  id: number,
  status: GovernanceStatus,
): Promise<GovernanceItem> {
  const { data } = await legalClient.PUT('/api/legal/governance/items/{id}/status', {
    params: { path: { id } },
    body: { status },
  });
  return unwrap(data) as never;
}

/** DELETE /api/legal/governance/items/{id} — 软删事项 */
export async function deleteGovernanceItem(id: number): Promise<void> {
  await legalClient.DELETE('/api/legal/governance/items/{id}', { params: { path: { id } } });
}

/** POST /api/legal/governance/audit-events — 追加审计事件（append-only） */
export async function appendAuditEvent(body: Record<string, string>): Promise<AuditEvent> {
  const { data } = await legalClient.POST('/api/legal/governance/audit-events', { body });
  return unwrap(data) as never;
}

/** POST /api/legal/governance/rules — 新增治理规则 */
export async function createGovernanceRule(body: Record<string, string>): Promise<GovernanceRule> {
  const { data } = await legalClient.POST('/api/legal/governance/rules', { body });
  return unwrap(data) as never;
}

/** PUT /api/legal/governance/rules/{id} — 编辑治理规则 */
export async function updateGovernanceRule(
  id: number,
  body: Record<string, string>,
): Promise<GovernanceRule> {
  const { data } = await legalClient.PUT('/api/legal/governance/rules/{id}', {
    params: { path: { id } },
    body,
  });
  return unwrap(data) as never;
}

/** DELETE /api/legal/governance/rules/{id} — 软删规则 */
export async function deleteGovernanceRule(id: number): Promise<void> {
  await legalClient.DELETE('/api/legal/governance/rules/{id}', { params: { path: { id } } });
}
