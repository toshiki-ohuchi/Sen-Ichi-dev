<template>
  <div class="app">
    <!-- ヘッダー -->
    <header class="app-header">
      <div class="header-left">
        <h1>顧客別営業戦略一覧</h1>
        <span class="year-badge">2026年度</span>
      </div>
      <div class="header-right">
        <label class="btn btn-secondary">
          <input type="file" accept=".xlsx,.xls" style="display:none" @change="importExcel" />
          Excelインポート
        </label>
        <button class="btn btn-secondary" @click="exportExcel">Excelエクスポート</button>
        <button class="btn btn-primary" @click="openAdd">+ 新規登録</button>
      </div>
    </header>

    <!-- 検索・フィルタバー -->
    <div class="filter-bar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchText"
          type="text"
          placeholder="顧客名・案件名で検索"
          class="search-input"
        />
        <button v-if="searchText" class="btn-clear" @click="searchText = ''">✕</button>
      </div>

      <div class="filter-group">
        <select v-model="filters.department">
          <option value="">部署名（すべて）</option>
          <option v-for="v in uniqueValues('department')" :key="v" :value="v">{{ v }}</option>
        </select>
        <select v-model="filters.location">
          <option value="">拠点（すべて）</option>
          <option v-for="v in uniqueValues('location')" :key="v" :value="v">{{ v }}</option>
        </select>
        <select v-model="filters.assignedDept">
          <option value="">担当部署（すべて）</option>
          <option v-for="v in uniqueValues('assignedDept')" :key="v" :value="v">{{ v }}</option>
        </select>
        <select v-model="filters.commercialFlow">
          <option value="">商流（すべて）</option>
          <option v-for="v in uniqueValues('commercialFlow')" :key="v" :value="v">{{ v }}</option>
        </select>
        <select v-model="filters.contractType">
          <option value="">契約形態（すべて）</option>
          <option v-for="v in uniqueValues('contractType')" :key="v" :value="v">{{ v }}</option>
        </select>
        <select v-model="filters.customerGrade">
          <option value="">客先グレード（すべて）</option>
          <option v-for="v in uniqueValues('customerGrade')" :key="v" :value="v">{{ v }}</option>
        </select>
        <button class="btn btn-sm btn-secondary" @click="clearFilters">フィルタ解除</button>
      </div>

      <div class="result-count">
        {{ filteredRecords.length }} 件
      </div>
    </div>

    <!-- テーブル -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-actions">操作</th>
            <th
              v-for="col in TABLE_COLUMNS"
              :key="col.key"
              class="sortable"
              @click="setSort(col.key)"
            >
              {{ col.label }}
              <span v-if="sortKey === col.key">{{ sortAsc ? '▲' : '▼' }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredRecords.length === 0">
            <td :colspan="TABLE_COLUMNS.length + 1" class="empty-row">
              データがありません。「新規登録」または「Excelインポート」で追加してください。
            </td>
          </tr>
          <tr v-for="record in pagedRecords" :key="record.id" class="data-row">
            <td class="col-actions">
              <button class="btn btn-xs btn-primary" @click="openEdit(record)">編集</button>
              <button class="btn btn-xs btn-danger" @click="deleteRecord(record)">削除</button>
            </td>
            <td v-for="col in TABLE_COLUMNS" :key="col.key" :class="'col-' + col.key">
              <span v-if="col.type === 'number' && record[col.key] !== '' && record[col.key] !== null && record[col.key] !== undefined">
                {{ col.key === 'avgUnitPrice' ? '¥' + Number(record[col.key]).toLocaleString() : Number(record[col.key]).toLocaleString() }}
              </span>
              <span v-else>{{ record[col.key] }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ページネーション -->
    <div class="pagination" v-if="totalPages > 1">
      <button class="btn btn-sm btn-secondary" :disabled="page <= 1" @click="page--">‹ 前へ</button>
      <span class="page-info">{{ page }} / {{ totalPages }}</span>
      <button class="btn btn-sm btn-secondary" :disabled="page >= totalPages" @click="page++">次へ ›</button>
    </div>

    <!-- モーダル -->
    <RecordModal
      v-if="showModal"
      :record="editRecord"
      @close="showModal = false"
      @save="saveRecord"
    />

    <!-- 削除確認ダイアログ -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="confirm-dialog">
        <h3>削除確認</h3>
        <p>「{{ deleteTarget.customerName }}」を削除してよろしいですか？</p>
        <div class="dialog-actions">
          <button class="btn btn-secondary" @click="deleteTarget = null">キャンセル</button>
          <button class="btn btn-danger" @click="confirmDelete">削除する</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import * as XLSX from 'xlsx'
import RecordModal from './components/RecordModal.vue'
import { TABLE_COLUMNS, FIELDS, MONTHS, ACTIVITY_TYPES, createEmptyRecord } from './data/schema.js'
import { loadRecords, saveRecords } from './data/storage.js'

const records = ref(loadRecords())
watch(records, val => saveRecords(val), { deep: true })

const PAGE_SIZE = 20
const page = ref(1)
const searchText = ref('')
const sortKey = ref('no')
const sortAsc = ref(true)
const filters = reactive({
  department: '',
  location: '',
  assignedDept: '',
  commercialFlow: '',
  contractType: '',
  customerGrade: '',
})

const showModal = ref(false)
const editRecord = ref(null)
const deleteTarget = ref(null)

function uniqueValues(key) {
  return [...new Set(records.value.map(r => r[key]).filter(v => v !== '' && v != null))].sort()
}

function setSort(key) {
  if (sortKey.value === key) sortAsc.value = !sortAsc.value
  else { sortKey.value = key; sortAsc.value = true }
}

const filteredRecords = computed(() => {
  let result = records.value
  if (searchText.value) {
    const q = searchText.value.toLowerCase()
    result = result.filter(r =>
      String(r.customerName || '').toLowerCase().includes(q) ||
      String(r.projectName || '').toLowerCase().includes(q)
    )
  }
  Object.entries(filters).forEach(([key, val]) => {
    if (val) result = result.filter(r => r[key] === val)
  })
  return [...result].sort((a, b) => {
    const av = a[sortKey.value] ?? ''
    const bv = b[sortKey.value] ?? ''
    if (av < bv) return sortAsc.value ? -1 : 1
    if (av > bv) return sortAsc.value ? 1 : -1
    return 0
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRecords.value.length / PAGE_SIZE)))
const pagedRecords = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredRecords.value.slice(start, start + PAGE_SIZE)
})

watch([searchText, filters], () => { page.value = 1 })

function clearFilters() {
  searchText.value = ''
  Object.keys(filters).forEach(k => { filters[k] = '' })
}

function openAdd() {
  editRecord.value = null
  showModal.value = true
}
function openEdit(record) {
  editRecord.value = record
  showModal.value = true
}

function saveRecord(data) {
  if (editRecord.value) {
    const idx = records.value.findIndex(r => r.id === data.id)
    if (idx !== -1) records.value[idx] = data
  } else {
    data.id = Date.now()
    records.value.push(data)
  }
  showModal.value = false
}

function deleteRecord(record) {
  deleteTarget.value = record
}
function confirmDelete() {
  records.value = records.value.filter(r => r.id !== deleteTarget.value.id)
  deleteTarget.value = null
}

function importExcel(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const wb = XLSX.read(ev.target.result, { type: 'binary' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })
    const imported = []
    for (let i = 7; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.every(c => c === null || c === undefined || c === '')) continue
      const rec = createEmptyRecord()
      rec.id = Date.now() + i
      rec.no = row[2]; rec.customerName = row[3]; rec.revenue = row[4]
      rec.itInvestment = row[5]; rec.itPartnerRatio = row[6]; rec.sasRatio = row[7]
      rec.contractRegulation = row[8]; rec.department = row[9]; rec.location = row[10]
      rec.businessDirector = row[11]; rec.operationDirector = row[12]; rec.siteDirector = row[13]
      rec.projectName = row[14]; rec.projectTotal = row[15]; rec.endUserOrgChart = row[16]
      rec.commercialFlow = row[17]; rec.contractType = row[18]; rec.members = row[19]
      rec.memberCount = row[20]; rec.avgUnitPrice = row[21]; rec.assignedDept = row[22]
      rec.customerGrade = row[23]
      imported.push(rec)
    }
    if (imported.length > 0) {
      records.value.push(...imported)
      alert(`${imported.length} 件をインポートしました。`)
    } else {
      alert('インポートできるデータが見つかりませんでした。')
    }
    e.target.value = ''
  }
  reader.readAsBinaryString(file)
}

function exportExcel() {
  const headers = FIELDS.map(f => f.label)
  const dataRows = records.value.map(r => FIELDS.map(f => r[f.key] ?? ''))
  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sen-Ichi')
  XLSX.writeFile(wb, `顧客別営業戦略一覧_2026年度_${new Date().toISOString().slice(0, 10)}.xlsx`)
}
</script>
