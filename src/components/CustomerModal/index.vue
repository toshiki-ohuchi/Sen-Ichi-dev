<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ viewOnly ? '案件詳細' : (record ? '案件編集' : '案件登録') }}</h2>
        <button class="btn-icon" @click="$emit('close')">✕</button>
      </div>

      <!-- 同時編集競合警告 -->
      <div v-if="conflictError" class="conflict-banner">
        ⚠️ 他のユーザーがこのレコードを更新しました。<a href="#" @click.prevent="reload">画面を更新</a>してください。
      </div>

      <div class="tabs">
        <button v-for="tab in TABS" :key="tab.key" class="tab" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
          {{ tab.label }}
        </button>
      </div>

      <div class="modal-body">
        <TabBasic v-show="activeTab === 'basic'" v-model="form" :view-only="viewOnly" />
        <TabProject v-show="activeTab === 'project'" v-model="form" :view-only="viewOnly" />
        <TabSales v-show="activeTab === 'sales'" v-model="form" :view-only="viewOnly" />
        <TabTodo v-show="activeTab === 'todo'" v-model="form" :view-only="viewOnly" />
        <TabSchedule v-show="activeTab === 'schedule'" v-model="form" :view-only="viewOnly" />
      </div>

      <div class="modal-footer">
        <template v-if="viewOnly">
          <button class="btn btn-secondary" @click="$emit('close')">閉じる</button>
        </template>
        <template v-else>
          <button class="btn btn-secondary" @click="$emit('close')">キャンセル</button>
          <button class="btn btn-primary" :disabled="saving" @click="submit">
            {{ saving ? '保存中...' : (record ? '更新' : '登録') }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import TabBasic from './TabBasic.vue'
import TabProject from './TabProject.vue'
import TabSales from './TabSales.vue'
import TabTodo from './TabTodo.vue'
import TabSchedule from './TabSchedule.vue'
import { recordsApi } from '@/api/client'
import { createEmptyRecord } from '@/types'
import type { SalesRecord, SalesRecordInput } from '@/types'

const props = defineProps<{ record: SalesRecord | null; viewOnly?: boolean }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const TABS = [
  { key: 'basic', label: '基本情報' },
  { key: 'project', label: '案件情報' },
  { key: 'sales', label: '営業情報' },
  { key: 'todo', label: 'TODOリスト' },
  { key: 'schedule', label: '月次スケジュール' },
]

const activeTab = ref('basic')
const saving = ref(false)
const conflictError = ref(false)
const form = reactive<SalesRecord | SalesRecordInput>(
  props.record ? JSON.parse(JSON.stringify(props.record)) : createEmptyRecord()
)

onMounted(async () => {
  if (props.record) {
    const latest = await recordsApi.get(props.record.id)
    Object.assign(form, latest)
  }
})

async function submit() {
  if (!(form as any).customerName) {
    alert('顧客名は必須です。')
    activeTab.value = 'basic'
    return
  }
  saving.value = true
  conflictError.value = false
  try {
    if (props.record) {
      await recordsApi.update(props.record.id, form as SalesRecord)
    } else {
      await recordsApi.create(form as SalesRecordInput)
    }
    emit('saved')
  } catch (err: any) {
    if (err.response?.status === 409) {
      conflictError.value = true
    } else {
      alert('保存に失敗しました。')
    }
  } finally {
    saving.value = false
  }
}

async function reload() {
  if (props.record) {
    const latest = await recordsApi.get(props.record.id)
    Object.assign(form, latest)
    conflictError.value = false
  }
}
</script>
