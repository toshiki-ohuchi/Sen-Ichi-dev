<template>
  <div class="tab-content">
    <div class="form-section">
      <div class="form-group">
        <label>■ 問題・課題 ／ 営業状況（直近）</label>
        <textarea v-model="form.salesStatus" rows="6"
          placeholder="■問題、課題&#10;　・要員募集&#10;&#10;◆長期目標&#10;　体制：○名…"></textarea>
      </div>
    </div>
    <div class="form-section">
      <div class="form-group">
        <label>★ 長期目標 ／ ◆ 中期目標 ／ ● 今期目標（計画目標・行動プラン）</label>
        <textarea v-model="form.planTarget" rows="8"
          placeholder="★長期目標（SAS2030にむけてターゲット業界・ビジネスにどのような価値を提供するのか）&#10;◆中期目標（ターゲット顧客に対してどのような価値を提供するのか）&#10;●今期目標（今期の具体的な目標：売上額、要員数など）"></textarea>
      </div>
    </div>
    <div class="form-section">
      <div class="form-group">
        <label>案件コンセプト</label>
        <textarea v-model="form.projectConcept" rows="5"
          placeholder="●カテゴリ&#10;●位置づけ&#10;●戦略の基本方針&#10;●ゴール（FY2030）"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SalesRecord, SalesRecordInput } from '@/types'
const form = defineModel<SalesRecord | SalesRecordInput>({ required: true })
</script>
