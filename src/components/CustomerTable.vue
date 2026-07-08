<template>
  <div class="table-section">
    <div class="table-toolbar">
      <button class="btn btn-primary" @click="$emit('add')">+ 新規登録</button>
    </div>

    <div class="table-wrapper">
      <div v-if="store.loading" class="loading">読み込み中...</div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th class="col-actions sticky-col">操作</th>
            <th v-for="col in COLUMNS" :key="col.key" class="sortable" @click="store.setSort(col.key)">
              {{ col.label }}
              <span v-if="store.query.sortKey === col.key">{{ store.query.sortDir === 'asc' ? '▲' : '▼' }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="store.records.length === 0">
            <td :colspan="COLUMNS.length + 1" class="empty-row">
              データがありません。「新規登録」または「Excelインポート」で追加してください。
            </td>
          </tr>
          <tr v-for="record in store.records" :key="record.id" class="data-row">
            <td class="col-actions sticky-col">
              <button class="btn btn-xs btn-secondary" @click="$emit('view', record)">閲覧</button>
              <button class="btn btn-xs btn-primary" @click="$emit('edit', record)">編集</button>
              <button class="btn btn-xs btn-danger" @click="confirmDelete(record)">削除</button>
            </td>
            <td v-for="col in COLUMNS" :key="col.key" :title="String(record[col.key as keyof typeof record] ?? '')">
              <template v-if="col.format === 'currency' && record[col.key as keyof typeof record]">
                ¥{{ Number(record[col.key as keyof typeof record]).toLocaleString() }}
              </template>
              <template v-else-if="col.format === 'number' && record[col.key as keyof typeof record]">
                {{ Number(record[col.key as keyof typeof record]).toLocaleString() }}
              </template>
              <template v-else>{{ record[col.key as keyof typeof record] }}</template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ページネーション -->
    <div class="pagination" v-if="totalPages > 1">
      <button class="btn btn-sm btn-secondary" :disabled="store.query.page <= 1" @click="changePage(-1)">‹ 前へ</button>
      <span class="page-info">{{ store.query.page }} / {{ totalPages }}</span>
      <button class="btn btn-sm btn-secondary" :disabled="store.query.page >= totalPages" @click="changePage(1)">次へ ›</button>
    </div>

    <!-- 削除確認 -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="confirm-dialog">
        <h3>削除確認</h3>
        <p>「{{ deleteTarget.customerName }}」を削除してよろしいですか？</p>
        <div class="dialog-actions">
          <button class="btn btn-secondary" @click="deleteTarget = null">キャンセル</button>
          <button class="btn btn-danger" @click="doDelete">削除する</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecordsStore } from '@/stores/records'
import { recordsApi } from '@/api/client'
import type { SalesRecord } from '@/types'

defineEmits<{ edit: [record: SalesRecord]; add: []; view: [record: SalesRecord] }>()

const store = useRecordsStore()
const deleteTarget = ref<SalesRecord | null>(null)

const COLUMNS = [
  { key: 'no', label: 'No', format: 'number' },
  { key: 'newSort', label: '新規ソート', format: 'text' },
  { key: 'customerName', label: '顧客名', format: 'text' },
  { key: 'revenue', label: '売上高（百万円）', format: 'number' },
  { key: 'itInvestment', label: 'IT投資額（百万円）', format: 'number' },
  { key: 'itPartnerRatio', label: 'ITパートナー比率（%）', format: 'number' },
  { key: 'sasRatio', label: 'SAS比率（%）', format: 'number' },
  { key: 'department', label: '部署名', format: 'text' },
  { key: 'location', label: '拠点', format: 'text' },
  { key: 'projectName', label: '案件名', format: 'text' },
  { key: 'projectTotal', label: '案件全体人数', format: 'number' },
  { key: 'memberCount', label: '参画人数', format: 'number' },
  { key: 'avgUnitPrice', label: '平均単価', format: 'currency' },
  { key: 'commercialFlow', label: '商流', format: 'text' },
  { key: 'contractType', label: '契約形態', format: 'text' },
  { key: 'assignedDept', label: '担当部署', format: 'text' },
  { key: 'customerGrade', label: '客先グレード', format: 'text' },
  { key: 'priceTableRequired', label: '単価TB提示', format: 'text' },
  { key: 'overworkRequired', label: '高稼働提示', format: 'text' },
  { key: 'updatedAt', label: '更新日時', format: 'text' },
] as const

const totalPages = computed(() => Math.max(1, Math.ceil(store.total / store.query.pageSize)))

function changePage(delta: number) {
  store.query.page += delta
  store.fetchList()
}

function confirmDelete(record: SalesRecord) {
  deleteTarget.value = record
}

async function doDelete() {
  if (!deleteTarget.value) return
  await recordsApi.delete(deleteTarget.value.id)
  deleteTarget.value = null
  await store.fetchList()
}
</script>
