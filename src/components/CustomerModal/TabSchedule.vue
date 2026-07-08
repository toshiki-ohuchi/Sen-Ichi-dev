<template>
  <div class="tab-content">
    <div class="form-section">
      <h3>月次活動スケジュール（2026年度）</h3>
      <p class="schedule-hint">上期：3月〜9月　下期：10月〜2月</p>
      <div class="schedule-table-wrapper">
        <table class="schedule-table">
          <thead>
            <tr>
              <th class="activity-col">活動種別</th>
              <th v-for="m in MONTHS" :key="m" :class="{ 'lower-half': HALF_LOWER.includes(m as any) }">{{ m }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="act in ACTIVITY_TYPES" :key="act">
              <td class="activity-label">{{ act }}</td>
              <td v-for="m in MONTHS" :key="m" :class="{ 'lower-half': HALF_LOWER.includes(m as any) }">
                <textarea v-model="scheduleMap[m][act]" rows="3" class="schedule-cell"
                  :disabled="viewOnly" @change="syncToForm(m, act)"></textarea>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { MONTHS, HALF_LOWER, ACTIVITY_TYPES } from '@/types'
import type { SalesRecord, SalesRecordInput } from '@/types'

const form = defineModel<SalesRecord | SalesRecordInput>({ required: true })
defineProps<{ viewOnly?: boolean }>()

const scheduleMap = reactive<Record<string, Record<string, string>>>({})
for (const m of MONTHS) {
  scheduleMap[m] = {}
  for (const act of ACTIVITY_TYPES) {
    scheduleMap[m][act] = ''
  }
}

watch(() => form.value.schedules, (schedules) => {
  for (const s of schedules) {
    if (scheduleMap[s.month]) {
      scheduleMap[s.month][s.activityType] = s.content || ''
    }
  }
}, { immediate: true })

function syncToForm(month: string, activityType: string) {
  const entry = form.value.schedules.find(s => s.month === month && s.activityType === activityType)
  if (entry) {
    entry.content = scheduleMap[month][activityType]
  } else {
    form.value.schedules.push({ month, activityType, content: scheduleMap[month][activityType] })
  }
}
</script>
