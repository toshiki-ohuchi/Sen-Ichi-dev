export const MONTHS = ['3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月']
export const HALF_UPPER = ['3月', '4月', '5月', '6月', '7月', '8月', '9月']
export const HALF_LOWER = ['10月', '11月', '12月', '1月', '2月']

export const ACTIVITY_TYPES = [
  '顧客イベント',
  'SI計画（作業時間）',
  '交代要員（BP）戦略',
  'BP単価UP戦略',
  'FY27戦略',
  'ゴール戦略（継続）',
]

export const FIELDS = [
  { key: 'no', label: 'No', type: 'number', tableVisible: true, filterable: false, searchable: false },
  { key: 'newSort', label: '新規ソート', type: 'text', tableVisible: true, filterable: false, searchable: false },
  { key: 'customerName', label: '顧客名', type: 'text', tableVisible: true, filterable: false, searchable: true },
  { key: 'revenue', label: '売上高（百万円）', type: 'number', tableVisible: true, filterable: false, searchable: false },
  { key: 'itInvestment', label: 'IT投資額（百万円）', type: 'number', tableVisible: true, filterable: false, searchable: false },
  { key: 'itPartnerRatio', label: 'ITパートナー比率（%）', type: 'number', tableVisible: true, filterable: false, searchable: false },
  { key: 'sasRatio', label: 'ITパートナー内SAS比率（%）', type: 'number', tableVisible: true, filterable: false, searchable: false },
  { key: 'contractRegulation', label: '契約レギュレーション', type: 'textarea', tableVisible: false, filterable: false, searchable: false },
  { key: 'department', label: '部署名', type: 'text', tableVisible: true, filterable: true, searchable: false },
  { key: 'location', label: '拠点', type: 'text', tableVisible: true, filterable: true, searchable: false },
  { key: 'businessDirector', label: '事業責任者', type: 'text', tableVisible: false, filterable: false, searchable: false },
  { key: 'operationDirector', label: '業務責任者', type: 'text', tableVisible: false, filterable: false, searchable: false },
  { key: 'siteDirector', label: '現場責任者', type: 'text', tableVisible: false, filterable: false, searchable: false },
  { key: 'projectName', label: '案件名', type: 'text', tableVisible: true, filterable: false, searchable: true },
  { key: 'projectTotal', label: '案件全体人数', type: 'number', tableVisible: true, filterable: false, searchable: false },
  { key: 'endUserOrgChart', label: 'エンドユーザ全体体制図', type: 'text', tableVisible: false, filterable: false, searchable: false },
  { key: 'commercialFlow', label: '商流', type: 'text', tableVisible: true, filterable: true, searchable: false },
  { key: 'contractType', label: '契約形態', type: 'text', tableVisible: true, filterable: true, searchable: false },
  { key: 'members', label: '参画メンバー', type: 'textarea', tableVisible: false, filterable: false, searchable: false },
  { key: 'memberCount', label: '参画人数', type: 'number', tableVisible: true, filterable: false, searchable: false },
  { key: 'avgUnitPrice', label: '平均単価', type: 'number', tableVisible: true, filterable: false, searchable: false },
  { key: 'assignedDept', label: '担当部署', type: 'text', tableVisible: true, filterable: true, searchable: false },
  { key: 'customerGrade', label: '客先グレード', type: 'text', tableVisible: true, filterable: true, searchable: false },
  { key: 'priceTableRequired', label: '単価テーブル_提示要否', type: 'select', options: ['要', '否', ''], tableVisible: false, filterable: false, searchable: false },
  { key: 'priceTableDate', label: '単価テーブル_提示日', type: 'date', tableVisible: false, filterable: false, searchable: false },
  { key: 'priceTableVer', label: '単価テーブル_提示Ver.', type: 'text', tableVisible: false, filterable: false, searchable: false },
  { key: 'overworkRequired', label: '高稼働抑制_提示要否', type: 'select', options: ['要', '否', ''], tableVisible: false, filterable: false, searchable: false },
  { key: 'overworkDate', label: '高稼働抑制_提示日', type: 'date', tableVisible: false, filterable: false, searchable: false },
  { key: 'overworkVer', label: '高稼働抑制_提示Ver.', type: 'text', tableVisible: false, filterable: false, searchable: false },
  { key: 'salesStatus', label: '営業状況（直近）', type: 'textarea', tableVisible: false, filterable: false, searchable: false },
  { key: 'planTarget', label: '計画目標・行動プラン', type: 'textarea', tableVisible: false, filterable: false, searchable: false },
  { key: 'projectConcept', label: '案件コンセプト', type: 'textarea', tableVisible: false, filterable: false, searchable: false },
]

export const TABLE_COLUMNS = FIELDS.filter(f => f.tableVisible)
export const FILTER_FIELDS = FIELDS.filter(f => f.filterable)
export const SEARCH_FIELDS = FIELDS.filter(f => f.searchable)

export function createEmptyRecord() {
  const record = { id: Date.now() }
  FIELDS.forEach(f => { record[f.key] = f.type === 'number' ? '' : '' })
  record.todos = []
  record.schedule = {}
  MONTHS.forEach(m => {
    record.schedule[m] = {}
    ACTIVITY_TYPES.forEach(a => { record.schedule[m][a] = '' })
  })
  return record
}
