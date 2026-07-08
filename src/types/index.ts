export const MONTHS = ['3月','4月','5月','6月','7月','8月','9月','10月','11月','12月','1月','2月'] as const
export const HALF_LOWER = ['10月','11月','12月','1月','2月'] as const
export const ACTIVITY_TYPES = [
  '顧客イベント',
  'SI計画（作業時間）',
  '交代要員（BP）戦略',
  'BP単価UP戦略',
  'FY27戦略',
  'ゴール戦略（継続）',
] as const

export interface Todo {
  id?: number
  recordId?: number
  agenda: string
  assignee: string
  startDate: string
  endDate: string
  execDate: string
  result: string
  activityCheck: string
  sortOrder?: number
}

export interface ScheduleEntry {
  id?: number
  recordId?: number
  month: string
  activityType: string
  content: string
}

export interface SalesRecord {
  id: number
  no: number | null
  newSort: string | null
  customerName: string
  revenue: string | null
  itInvestment: string | null
  itPartnerRatio: string | null
  sasRatio: string | null
  contractRegulation: string | null
  department: string | null
  location: string | null
  businessDirector: string | null
  operationDirector: string | null
  siteDirector: string | null
  projectName: string | null
  projectTotal: number | null
  endUserOrgChart: string | null
  commercialFlow: string | null
  contractType: string | null
  members: string | null
  memberCount: number | null
  avgUnitPrice: string | null
  assignedDept: string | null
  customerGrade: string | null
  priceTableRequired: string | null
  priceTableDate: string | null
  priceTableVer: string | null
  overworkRequired: string | null
  overworkDate: string | null
  overworkVer: string | null
  issues: string | null
  salesStatus: string | null
  longTermTarget: string | null
  midTermTarget: string | null
  currentTermTarget: string | null
  planTarget: string | null
  projectConcept: string | null
  fiscalYear: number
  version: number
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  todos: Todo[]
  schedules: ScheduleEntry[]
}

export type SalesRecordInput = Omit<SalesRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

export interface FilterValues {
  assignedDept: string[]
  commercialFlow: string[]
  contractType: string[]
  customerGrade: string[]
}

export interface User {
  email: string
  name: string | null
  role: 'admin' | 'user'
}

export interface AppUser {
  id: number
  email: string
  name: string
  role: 'admin' | 'user'
  isActive: boolean
  failedLoginCount: number
  lockedUntil: string | null
  lastLoginAt: string | null
  createdAt: string
  createdBy: string | null
}

export interface ListResponse {
  data: SalesRecord[]
  total: number
  page: number
  pageSize: number
}

export function createEmptyRecord(): SalesRecordInput {
  const schedules: ScheduleEntry[] = []
  for (const month of MONTHS) {
    for (const activityType of ACTIVITY_TYPES) {
      schedules.push({ month, activityType, content: '' })
    }
  }
  return {
    no: null, newSort: null, customerName: '', revenue: null, itInvestment: null,
    itPartnerRatio: null, sasRatio: null, contractRegulation: null,
    department: null, location: null, businessDirector: null, operationDirector: null,
    siteDirector: null, projectName: null, projectTotal: null, endUserOrgChart: null,
    commercialFlow: null, contractType: null, members: null, memberCount: null,
    avgUnitPrice: null, assignedDept: null, customerGrade: null,
    priceTableRequired: null, priceTableDate: null, priceTableVer: null,
    overworkRequired: null, overworkDate: null, overworkVer: null,
    issues: null, salesStatus: null, longTermTarget: null, midTermTarget: null,
    currentTermTarget: null, planTarget: null, projectConcept: null,
    fiscalYear: 2026, version: 1, todos: [], schedules,
  }
}
