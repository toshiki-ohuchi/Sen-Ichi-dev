<template>
  <div class="tab-content">
    <div class="form-section">
      <div class="form-group">
        <label>■ 問題・課題</label>
        <textarea v-model="form.issues" :disabled="viewOnly" rows="4"
          placeholder="問題や課題を入力してください。"></textarea>
      </div>
    </div>
    <div class="form-section">
      <div class="form-group">
        <label>◆ 営業状況（直近）</label>
        <textarea v-model="form.salesStatus" :disabled="viewOnly" rows="4"
          placeholder="直近の営業状況を入力してください。"></textarea>
      </div>
    </div>
    <div class="form-section">
      <div class="form-group">
        <label>★ 長期目標</label>
        <textarea v-model="form.longTermTarget" :disabled="viewOnly" rows="4"
          placeholder="SAS2030にむけてターゲット業界・ビジネスにどのような価値を提供するのか"></textarea>
      </div>
    </div>
    <div class="form-section">
      <div class="form-group">
        <label>◆ 中期目標</label>
        <textarea v-model="form.midTermTarget" :disabled="viewOnly" rows="4"
          placeholder="ターゲット顧客に対してどのような価値を提供するのか"></textarea>
      </div>
    </div>
    <div class="form-section">
      <div class="form-group">
        <label>● 今期目標</label>
        <textarea v-model="form.currentTermTarget" :disabled="viewOnly" rows="4"
          placeholder="今期の具体的な目標：売上額、要員数など"></textarea>
      </div>
    </div>
    <div class="form-section">
      <div class="form-group">
        <label>案件コンセプト</label>
        <textarea v-model="form.projectConcept" :disabled="viewOnly" rows="5"
          placeholder="●カテゴリ&#10;●位置づけ&#10;●戦略の基本方針&#10;●ゴール（FY2030）"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SalesRecord, SalesRecordInput } from '@/types'
const form = defineModel<SalesRecord | SalesRecordInput>({ required: true })
defineProps<{ viewOnly?: boolean }>()
</script>
