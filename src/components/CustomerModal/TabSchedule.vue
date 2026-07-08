<template>
  <div class="tab-content">
    <div class="form-section">
      <h3>月次活動スケジュール（2026年度）</h3>
      <p class="schedule-hint">上期：3月〜9月　下期：10月〜2月</p>
      <div class="schedule-table-wrapper">
        <table class="schedule-table">
          <thead>
            <tr>
              <th v-if="!viewOnly" class="activity-del-col"></th>
              <th class="activity-col activity-col-dark">活動種別</th>
              <th v-for="m in MONTHS" :key="m" :class="{ 'lower-half': HALF_LOWER.includes(m as any) }">{{ m }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(act, idx) in activityTypes" :key="idx">
              <td v-if="!viewOnly">
                <button class="btn-icon danger" title="この行を削除" @click="removeActivity(idx, act)">✕</button>
              </td>
              <td class="activity-label">
                <template v-if="viewOnly">{{ act }}</template>
                <input v-else :value="act" type="text" class="activity-input"
                  @blur="renameActivity(idx, act, ($event.target as HTMLInputElement).value)" />
              </td>
              <td v-for="m in MONTHS" :key="m" :class="{ 'lower-half': HALF_LOWER.includes(m as any) }">
                <textarea :value="getCell(act, m)" rows="3" class="schedule-cell"
                  :disabled="viewOnly"
                  @change="setCell(act, m, ($event.target as HTMLTextAreaElement).value)"></textarea>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button v-if="!viewOnly" class="btn btn-sm btn-secondary add-row-btn" @click="addActivity">
        + 行を追加
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import { MONTHS, HALF_LOWER } from '@/types'
import type { SalesRecord, SalesRecordInput } from '@/types'

const DEFAULT_ACTIVITY_TYPES = [
  '顧客イベント',
  'SI計画（作業時間）',
  '交代要員（BP）戦略',
  'BP単価UP戦略',
  'FY27戦略',
  'ゴール戦略（継続）',
]

const form = defineModel<SalesRecord | SalesRecordInput>({ required: true })
defineProps<{ viewOnly?: boolean }>()

const activityTypes = ref<string[]>([...DEFAULT_ACTIVITY_TYPES])
const scheduleMap = reactive<Record<string, Record<string, string>>>({})
let isSyncing = false

function initFromSchedules(schedules: typeof form.value.schedules) {
  // scheduleMapをリセット
  for (const key of Object.keys(scheduleMap)) delete scheduleMap[key]

  // スケジュールからデータを読み込み
  for (const s of schedules) {
    if (!scheduleMap[s.activityType]) scheduleMap[s.activityType] = {}
    scheduleMap[s.activityType][s.month] = s.content || ''
  }

  // 活動種別一覧を導出（既存データ優先、なければデフォルト）
  const existingTypes = [...new Set(schedules.map(s => s.activityType))]
  activityTypes.value = existingTypes.length > 0 ? existingTypes : [...DEFAULT_ACTIVITY_TYPES]

  // 全種別・全月のセルを初期化（未設定は空文字）
  for (const act of activityTypes.value) {
    if (!scheduleMap[act]) scheduleMap[act] = {}
    for (const m of MONTHS) {
      if (scheduleMap[act][m] === undefined) scheduleMap[act][m] = ''
    }
  }
}

// form.schedulesが更新されたとき（初回・編集データ読込時）に初期化
watch(() => form.value.schedules, (schedules) => {
  if (isSyncing) return
  initFromSchedules(schedules)
}, { immediate: true })

function getCell(act: string, month: string): string {
  return scheduleMap[act]?.[month] ?? ''
}

function setCell(act: string, month: string, value: string) {
  if (!scheduleMap[act]) scheduleMap[act] = {}
  scheduleMap[act][month] = value
  syncToForm()
}

function syncToForm() {
  isSyncing = true
  const newSchedules: typeof form.value.schedules = []
  for (const act of activityTypes.value) {
    for (const m of MONTHS) {
      newSchedules.push({ month: m, activityType: act, content: scheduleMap[act]?.[m] ?? '' })
    }
  }
  form.value.schedules = newSchedules
  nextTick(() => { isSyncing = false })
}

function renameActivity(idx: number, oldName: string, newName: string) {
  newName = newName.trim()
  if (!newName || oldName === newName) return
  // スケジュールデータを新名称に移行
  scheduleMap[newName] = { ...scheduleMap[oldName] }
  delete scheduleMap[oldName]
  activityTypes.value[idx] = newName
  syncToForm()
}

function addActivity() {
  const newType = `活動種別${activityTypes.value.length + 1}`
  activityTypes.value.push(newType)
  scheduleMap[newType] = {}
  for (const m of MONTHS) scheduleMap[newType][m] = ''
  syncToForm()
}

function removeActivity(idx: number, act: string) {
  if (!confirm(`「${act}」の行を削除してよろしいですか？`)) return
  activityTypes.value.splice(idx, 1)
  delete scheduleMap[act]
  syncToForm()
}
</script>
