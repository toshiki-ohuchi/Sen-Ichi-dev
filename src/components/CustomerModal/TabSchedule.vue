<template>
  <div class="tab-content">
    <div class="form-section">
      <h3>月次活動スケジュール（2026年度）</h3>
      <p class="schedule-hint">上期：3月〜9月　下期：10月〜2月</p>
      <div class="schedule-table-wrapper" ref="wrapperRef" @scroll="onScroll">
        <table class="schedule-table">
          <thead>
            <tr>
              <th v-if="!viewOnly" class="activity-del-col freeze-col"></th>
              <th class="activity-col activity-col-dark freeze-col">活動種別</th>
              <th v-for="m in MONTHS" :key="m" :class="{ 'lower-half': HALF_LOWER.includes(m as any) }">{{ m }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(act, idx) in activityTypes" :key="idx">
              <td v-if="!viewOnly" class="activity-del-td freeze-col">
                <button class="btn-icon danger" title="この行を削除" @click="removeActivity(idx, act)">✕</button>
              </td>
              <td class="activity-label freeze-col">
                <template v-if="viewOnly">{{ act }}</template>
                <input v-else :value="act" type="text" class="activity-input"
                  @blur="renameActivity(idx, act, ($event.target as HTMLInputElement).value)" />
              </td>
              <td v-for="m in MONTHS" :key="m" :class="{ 'lower-half': HALF_LOWER.includes(m as any) }">
                <div v-if="viewOnly" class="schedule-cell-view">{{ getCell(act, m) }}</div>
                <textarea v-else :value="getCell(act, m)" rows="3" class="schedule-cell"
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

const wrapperRef = ref<HTMLElement | null>(null)

function onScroll() {
  if (!wrapperRef.value) return
  const x = wrapperRef.value.scrollLeft
  const cells = wrapperRef.value.querySelectorAll<HTMLElement>('.freeze-col')
  cells.forEach(cell => { cell.style.transform = `translateX(${x}px)` })
}

function initFromSchedules(schedules: typeof form.value.schedules) {
  for (const key of Object.keys(scheduleMap)) delete scheduleMap[key]

  for (const s of schedules) {
    if (!scheduleMap[s.activityType]) scheduleMap[s.activityType] = {}
    scheduleMap[s.activityType][s.month] = s.content || ''
  }

  const existingTypes = [...new Set(schedules.map(s => s.activityType))]
  activityTypes.value = existingTypes.length > 0 ? existingTypes : [...DEFAULT_ACTIVITY_TYPES]

  for (const act of activityTypes.value) {
    if (!scheduleMap[act]) scheduleMap[act] = {}
    for (const m of MONTHS) {
      if (scheduleMap[act][m] === undefined) scheduleMap[act][m] = ''
    }
  }
}

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
