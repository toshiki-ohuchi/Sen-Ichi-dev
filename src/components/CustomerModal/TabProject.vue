<template>
  <div class="tab-content">
    <div class="form-section">
      <h3>案件情報</h3>
      <div class="form-grid">
        <div class="form-group span-2">
          <label>案件名</label>
          <input v-model="form.projectName" type="text" :disabled="viewOnly" />
        </div>
        <div class="form-group">
          <label>案件全体人数</label>
          <input v-model.number="form.projectTotal" type="number" :disabled="viewOnly" />
        </div>
        <div class="form-group">
          <label>エンドユーザ全体体制図</label>
          <input v-model="form.endUserOrgChart" type="text" :disabled="viewOnly" />
        </div>
        <div class="form-group">
          <label>商流</label>
          <input v-model="form.commercialFlow" type="text" placeholder="例：2次" :disabled="viewOnly" />
        </div>
        <div class="form-group">
          <label>契約形態</label>
          <input v-model="form.contractType" type="text" placeholder="例：準委任" :disabled="viewOnly" />
        </div>
        <div class="form-group span-2">
          <label>参画メンバー</label>
          <textarea v-model="form.members" rows="3" placeholder="例：小山、芦田、P大島、P新津" :disabled="viewOnly"></textarea>
        </div>
        <div class="form-group">
          <label>参画人数</label>
          <input v-model.number="form.memberCount" type="number" :disabled="viewOnly" />
        </div>
        <div class="form-group">
          <label>平均単価（円）</label>
          <input v-model="form.avgUnitPrice" type="number" :disabled="viewOnly" />
        </div>
        <div class="form-group">
          <label>担当部署</label>
          <input v-model="form.assignedDept" type="text" placeholder="例：DX" :disabled="viewOnly" />
        </div>
      </div>
    </div>

    <div class="form-section">
      <h3>単価テーブル</h3>
      <div class="form-grid three-col">
        <div class="form-group">
          <label>提示要否</label>
          <select v-model="form.priceTableRequired" :disabled="viewOnly">
            <option value="">-</option>
            <option value="必要">必要</option>
            <option value="不要">不要</option>
          </select>
        </div>
        <div class="form-group">
          <label>提示日</label>
          <input v-model="form.priceTableDate" type="date" :disabled="viewOnly" />
        </div>
        <div class="form-group">
          <label>提示Ver.</label>
          <input v-model="form.priceTableVer" type="text" placeholder="例：二次" :disabled="viewOnly" />
        </div>
      </div>
    </div>

    <div class="form-section">
      <h3>高稼働抑制対応基準</h3>
      <div class="form-grid three-col">
        <div class="form-group">
          <label>提示要否</label>
          <select v-model="form.overworkRequired" :disabled="viewOnly">
            <option value="">-</option>
            <option value="必要">必要</option>
            <option value="不要">不要</option>
          </select>
        </div>
        <div class="form-group">
          <label>提示日</label>
          <input v-model="form.overworkDate" type="date" :disabled="viewOnly" />
        </div>
        <div class="form-group">
          <label>提示Ver.</label>
          <input v-model="form.overworkVer" type="text" placeholder="例：VOL.2" :disabled="viewOnly" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SalesRecord, SalesRecordInput } from '@/types'
const form = defineModel<SalesRecord | SalesRecordInput>({ required: true })
defineProps<{ viewOnly?: boolean }>()
</script>
