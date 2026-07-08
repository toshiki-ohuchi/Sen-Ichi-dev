<template>
  <div class="tab-content">
    <div class="form-section">
      <h3>顧客情報</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>No</label>
          <input v-model.number="form.no" type="number" :disabled="viewOnly" />
        </div>
        <div class="form-group">
          <label>新規ソート</label>
          <input v-model="form.newSort" type="text" :disabled="viewOnly" />
        </div>
        <div class="form-group span-2">
          <label>顧客名 <span class="required">*</span></label>
          <input v-model="form.customerName" type="text" :disabled="viewOnly" />
        </div>
        <div class="form-group">
          <label>売上高（百万円）</label>
          <input v-model="form.revenue" type="number" step="0.1" :disabled="viewOnly" />
        </div>
        <div class="form-group">
          <label>IT投資額（百万円）</label>
          <input v-model="form.itInvestment" type="number" step="0.1" :disabled="viewOnly" />
        </div>
        <div class="form-group">
          <label>ITパートナー比率（%）</label>
          <input v-model="form.itPartnerRatio" type="number" step="0.1" :disabled="viewOnly" />
        </div>
        <div class="form-group">
          <label>ITパートナー内SAS比率（%）</label>
          <input v-model="form.sasRatio" type="number" step="0.1" :disabled="viewOnly" />
        </div>
        <div class="form-group">
          <label>部署名</label>
          <input v-model="form.department" type="text" :disabled="viewOnly" />
        </div>
        <div class="form-group">
          <label>拠点</label>
          <input v-model="form.location" type="text" :disabled="viewOnly" />
        </div>
        <div class="form-group span-2">
          <label>契約レギュレーション（制約条件）</label>
          <textarea v-model="form.contractRegulation" rows="3" :disabled="viewOnly"></textarea>
        </div>
        <div class="form-group">
          <label>客先グレード</label>
          <input v-model="form.customerGrade" type="text" :disabled="viewOnly" />
        </div>
      </div>
    </div>

    <div class="form-section">
      <h3>責任者情報</h3>
      <div class="form-grid">
        <div class="form-group span-2">
          <label>事業責任者（★最高権限者／SAS決済権限者／SAS案件権限者）</label>
          <input v-model="form.businessDirector" type="text" placeholder="例：★山下 元（事業部長）[石井健]" :disabled="viewOnly" />
        </div>
        <div class="form-group">
          <label>業務責任者（★決済者）</label>
          <input v-model="form.operationDirector" type="text" placeholder="例：★神谷 智仁[大内]" :disabled="viewOnly" />
        </div>
        <div class="form-group">
          <label>現場責任者（☆ＰＭ）</label>
          <input v-model="form.siteDirector" type="text" placeholder="例：☆横江 聡明[小山]" :disabled="viewOnly" />
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
