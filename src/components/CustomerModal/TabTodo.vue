<template>
  <div class="tab-content">
    <div class="form-section">
      <div class="section-header">
        <h3>＜行動TODOリスト＞</h3>
        <button v-if="!viewOnly" class="btn btn-sm btn-primary" @click="addTodo">+ 追加</button>
      </div>
      <div v-if="todos.length === 0" class="empty-state">
        TODOがありません。<template v-if="!viewOnly">「追加」ボタンで登録してください。</template>
      </div>
      <div v-else class="todo-table-wrapper">
        <table class="inner-table">
          <thead>
            <tr>
              <th style="min-width:200px">議題・計画（誰が・何をする）</th>
              <th style="min-width:80px">担当者</th>
              <th style="min-width:120px">着手日</th>
              <th style="min-width:120px">完了日</th>
              <th style="min-width:120px">実行日</th>
              <th style="min-width:150px">結果</th>
              <th style="min-width:100px">活動チェック</th>
              <th v-if="!viewOnly" style="width:40px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(todo, idx) in todos" :key="idx">
              <td><textarea v-model="todo.agenda" rows="2" style="width:100%" :disabled="viewOnly"></textarea></td>
              <td><input v-model="todo.assignee" type="text" :disabled="viewOnly" /></td>
              <td><input v-model="todo.startDate" type="date" :disabled="viewOnly" /></td>
              <td><input v-model="todo.endDate" type="date" :disabled="viewOnly" /></td>
              <td><input v-model="todo.execDate" type="date" :disabled="viewOnly" /></td>
              <td><input v-model="todo.result" type="text" :disabled="viewOnly" /></td>
              <td>
                <select v-model="todo.activityCheck" :disabled="viewOnly">
                  <option value="">-</option>
                  <option value="済">済</option>
                  <option value="進行中">進行中</option>
                  <option value="未着手">未着手</option>
                </select>
              </td>
              <td v-if="!viewOnly"><button class="btn-icon danger" @click="removeTodo(idx)">✕</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SalesRecord, SalesRecordInput } from '@/types'

const form = defineModel<SalesRecord | SalesRecordInput>({ required: true })
defineProps<{ viewOnly?: boolean }>()
const todos = computed(() => form.value.todos)

function addTodo() {
  form.value.todos.push({
    agenda: '', assignee: '', startDate: '', endDate: '',
    execDate: '', result: '', activityCheck: '',
  })
}

function removeTodo(idx: number) {
  form.value.todos.splice(idx, 1)
}
</script>
