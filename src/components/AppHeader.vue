<template>
  <header class="app-header">
    <div class="header-left">
      <span class="logo-mark">SAS</span>
      <h1>顧客別営業戦略一覧</h1>
      <span class="year-badge">2026年度</span>
    </div>
    <div class="header-right">
      <template v-if="!isUsersPage">
        <label class="btn btn-secondary btn-sm">
          <input type="file" accept=".xlsx,.xls" style="display:none" @change="handleImport" />
          Excelインポート
        </label>
        <button class="btn btn-secondary btn-sm" @click="handleExport">Excelエクスポート</button>
      </template>
      <div class="user-info" v-if="auth.user">
        <span class="user-name">{{ auth.user.name }}</span>
        <RouterLink v-if="isUsersPage" to="/" class="btn btn-ghost btn-sm">← 一覧に戻る</RouterLink>
        <RouterLink v-else-if="auth.isAdmin()" to="/users" class="btn btn-ghost btn-sm">ユーザー管理</RouterLink>
        <button class="btn btn-ghost btn-sm" @click="auth.logout()">ログアウト</button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import * as XLSX from 'xlsx'
import { useAuthStore } from '@/stores/auth'
import { useRecordsStore } from '@/stores/records'
import { recordsApi } from '@/api/client'
import { createEmptyRecord, MONTHS, ACTIVITY_TYPES } from '@/types'

const auth = useAuthStore()
const store = useRecordsStore()
const route = useRoute()

const isUsersPage = computed(() => route.path === '/users')

async function handleImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (ev) => {
    try {
      const wb = XLSX.read(ev.target!.result, { type: 'binary' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 })
      let imported = 0
      for (let i = 7; i < rows.length; i++) {
        const row = rows[i]
        if (!row || !row[3]) continue
        const rec = createEmptyRecord()
        rec.no = row[2]; rec.customerName = String(row[3] || '')
        rec.revenue = row[4]; rec.itInvestment = row[5]
        rec.itPartnerRatio = row[6]; rec.sasRatio = row[7]
        rec.contractRegulation = row[8]; rec.department = row[9]
        rec.location = row[10]; rec.businessDirector = row[11]
        rec.operationDirector = row[12]; rec.siteDirector = row[13]
        rec.projectName = row[14]; rec.projectTotal = row[15]
        rec.commercialFlow = row[17]; rec.contractType = row[18]
        rec.members = row[19]; rec.memberCount = row[20]
        rec.avgUnitPrice = row[21]; rec.assignedDept = row[22]
        rec.customerGrade = row[23]
        await recordsApi.create(rec)
        imported++
      }
      alert(`${imported}件をインポートしました。`)
      await store.fetchList()
    } catch {
      alert('インポートに失敗しました。')
    }
    ;(e.target as HTMLInputElement).value = ''
  }
  reader.readAsBinaryString(file)
}

function handleExport() {
  const headers = [
    'No','新規ソート','顧客名','売上高（百万円）','IT投資額（百万円）',
    'ITパートナー比率（%）','ITパートナー内SAS比率（%）','契約レギュレーション',
    '部署名','拠点','事業責任者','業務責任者','現場責任者','案件名','案件全体人数',
    'エンドユーザ全体体制図','商流','契約形態','参画メンバー','参画人数','平均単価',
    '担当部署','客先グレード','単価TB_提示要否','単価TB_提示日','単価TB_提示Ver.',
    '高稼働_提示要否','高稼働_提示日','高稼働_提示Ver.',
    '営業状況（直近）','計画目標','案件コンセプト',
  ]
  const dataRows = store.records.map(r => [
    r.no, r.newSort, r.customerName, r.revenue, r.itInvestment,
    r.itPartnerRatio, r.sasRatio, r.contractRegulation,
    r.department, r.location, r.businessDirector, r.operationDirector, r.siteDirector,
    r.projectName, r.projectTotal, r.endUserOrgChart, r.commercialFlow, r.contractType,
    r.members, r.memberCount, r.avgUnitPrice, r.assignedDept, r.customerGrade,
    r.priceTableRequired, r.priceTableDate, r.priceTableVer,
    r.overworkRequired, r.overworkDate, r.overworkVer,
    r.salesStatus, r.planTarget, r.projectConcept,
  ])
  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sen-Ichi')
  XLSX.writeFile(wb, `顧客別営業戦略一覧_2026年度_${new Date().toISOString().slice(0,10)}.xlsx`)
}
</script>
