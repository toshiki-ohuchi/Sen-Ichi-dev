<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ isEdit ? '案件編集' : '案件登録' }}</h2>
        <button class="btn-icon" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- タブ -->
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >{{ tab.label }}</button>
        </div>

        <!-- 基本情報 -->
        <div v-show="activeTab === 'basic'" class="tab-content">
          <div class="form-section">
            <h3>顧客情報</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>No</label>
                <input v-model="form.no" type="number" />
              </div>
              <div class="form-group">
                <label>新規ソート</label>
                <input v-model="form.newSort" type="text" />
              </div>
              <div class="form-group span-2">
                <label>顧客名 <span class="required">*</span></label>
                <input v-model="form.customerName" type="text" />
              </div>
              <div class="form-group">
                <label>売上高（百万円）</label>
                <input v-model="form.revenue" type="number" />
              </div>
              <div class="form-group">
                <label>IT投資額（百万円）</label>
                <input v-model="form.itInvestment" type="number" />
              </div>
              <div class="form-group">
                <label>ITパートナー比率（%）</label>
                <input v-model="form.itPartnerRatio" type="number" />
              </div>
              <div class="form-group">
                <label>ITパートナー内SAS比率（%）</label>
                <input v-model="form.sasRatio" type="number" />
              </div>
              <div class="form-group">
                <label>部署名</label>
                <input v-model="form.department" type="text" />
              </div>
              <div class="form-group">
                <label>拠点</label>
                <input v-model="form.location" type="text" />
              </div>
              <div class="form-group span-2">
                <label>契約レギュレーション（制約条件）</label>
                <textarea v-model="form.contractRegulation" rows="3"></textarea>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>責任者情報</h3>
            <div class="form-grid">
              <div class="form-group span-2">
                <label>事業責任者（最高権限者／SAS決済権限者／SAS案件権限者）</label>
                <input v-model="form.businessDirector" type="text" />
              </div>
              <div class="form-group">
                <label>業務責任者（★決済者）</label>
                <input v-model="form.operationDirector" type="text" />
              </div>
              <div class="form-group">
                <label>現場責任者（☆ＰＭ）</label>
                <input v-model="form.siteDirector" type="text" />
              </div>
            </div>
          </div>
        </div>

        <!-- 案件情報 -->
        <div v-show="activeTab === 'project'" class="tab-content">
          <div class="form-section">
            <h3>案件情報</h3>
            <div class="form-grid">
              <div class="form-group span-2">
                <label>案件名 <span class="required">*</span></label>
                <input v-model="form.projectName" type="text" />
              </div>
              <div class="form-group">
                <label>案件全体人数</label>
                <input v-model="form.projectTotal" type="number" />
              </div>
              <div class="form-group">
                <label>エンドユーザ全体体制図</label>
                <input v-model="form.endUserOrgChart" type="text" />
              </div>
              <div class="form-group">
                <label>商流</label>
                <input v-model="form.commercialFlow" type="text" />
              </div>
              <div class="form-group">
                <label>契約形態</label>
                <input v-model="form.contractType" type="text" />
              </div>
              <div class="form-group span-2">
                <label>参画メンバー</label>
                <textarea v-model="form.members" rows="3"></textarea>
              </div>
              <div class="form-group">
                <label>参画人数</label>
                <input v-model="form.memberCount" type="number" />
              </div>
              <div class="form-group">
                <label>平均単価</label>
                <input v-model="form.avgUnitPrice" type="number" />
              </div>
              <div class="form-group">
                <label>担当部署</label>
                <input v-model="form.assignedDept" type="text" />
              </div>
              <div class="form-group">
                <label>客先グレード</label>
                <input v-model="form.customerGrade" type="text" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>単価テーブル</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>提示要否</label>
                <select v-model="form.priceTableRequired">
                  <option value="">-</option>
                  <option value="要">要</option>
                  <option value="否">否</option>
                </select>
              </div>
              <div class="form-group">
                <label>提示日</label>
                <input v-model="form.priceTableDate" type="date" />
              </div>
              <div class="form-group">
                <label>提示Ver.</label>
                <input v-model="form.priceTableVer" type="text" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>高稼働抑制対応基準</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>提示要否</label>
                <select v-model="form.overworkRequired">
                  <option value="">-</option>
                  <option value="要">要</option>
                  <option value="否">否</option>
                </select>
              </div>
              <div class="form-group">
                <label>提示日</label>
                <input v-model="form.overworkDate" type="date" />
              </div>
              <div class="form-group">
                <label>提示Ver.</label>
                <input v-model="form.overworkVer" type="text" />
              </div>
            </div>
          </div>
        </div>

        <!-- 営業情報 -->
        <div v-show="activeTab === 'sales'" class="tab-content">
          <div class="form-section">
            <div class="form-group">
              <label>■ 問題・課題 / 営業状況（直近）</label>
              <textarea v-model="form.salesStatus" rows="5" placeholder="■問題、課題&#10;・要員募集"></textarea>
            </div>
            <div class="form-group">
              <label>★ 長期目標 / ◆ 中期目標 / ● 今期目標（計画目標・行動プラン）</label>
              <textarea v-model="form.planTarget" rows="6" placeholder="★長期目標（SAS2030にむけて…）&#10;◆中期目標（ターゲット顧客に対して…）&#10;●今期目標（今期の具体的な目標…）"></textarea>
            </div>
            <div class="form-group">
              <label>案件コンセプト</label>
              <textarea v-model="form.projectConcept" rows="4"></textarea>
            </div>
          </div>
        </div>

        <!-- TODOリスト -->
        <div v-show="activeTab === 'todo'" class="tab-content">
          <div class="form-section">
            <div class="section-header">
              <h3>行動TODOリスト</h3>
              <button class="btn btn-sm btn-primary" @click="addTodo">+ 追加</button>
            </div>
            <div v-if="form.todos.length === 0" class="empty-state">TODOがありません。「追加」ボタンで登録してください。</div>
            <table v-else class="inner-table">
              <thead>
                <tr>
                  <th>決めたい議題・計画</th>
                  <th>担当者</th>
                  <th>着手日</th>
                  <th>完了日</th>
                  <th>実行日</th>
                  <th>結果</th>
                  <th>活動チェック</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(todo, idx) in form.todos" :key="idx">
                  <td><input v-model="todo.agenda" type="text" /></td>
                  <td><input v-model="todo.assignee" type="text" style="width:80px"/></td>
                  <td><input v-model="todo.startDate" type="date" style="width:130px"/></td>
                  <td><input v-model="todo.endDate" type="date" style="width:130px"/></td>
                  <td><input v-model="todo.execDate" type="date" style="width:130px"/></td>
                  <td><input v-model="todo.result" type="text" /></td>
                  <td>
                    <select v-model="todo.activityCheck" style="width:90px">
                      <option value="">-</option>
                      <option value="済">済</option>
                      <option value="進行中">進行中</option>
                      <option value="未着手">未着手</option>
                    </select>
                  </td>
                  <td><button class="btn-icon danger" @click="removeTodo(idx)">✕</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 月次スケジュール -->
        <div v-show="activeTab === 'schedule'" class="tab-content">
          <div class="form-section">
            <h3>月次活動スケジュール（2026年度）</h3>
            <div class="schedule-hint">上期：3月〜9月　下期：10月〜2月</div>
            <div class="schedule-table-wrapper">
              <table class="schedule-table">
                <thead>
                  <tr>
                    <th class="activity-col">活動種別</th>
                    <th v-for="m in MONTHS" :key="m" :class="{ 'lower-half': HALF_LOWER.includes(m) }">{{ m }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="act in ACTIVITY_TYPES" :key="act">
                    <td class="activity-label">{{ act }}</td>
                    <td v-for="m in MONTHS" :key="m" :class="{ 'lower-half': HALF_LOWER.includes(m) }">
                      <textarea v-model="form.schedule[m][act]" rows="2" class="schedule-cell"></textarea>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">キャンセル</button>
        <button class="btn btn-primary" @click="submit">{{ isEdit ? '更新' : '登録' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { MONTHS, HALF_LOWER, ACTIVITY_TYPES, createEmptyRecord } from '../data/schema.js'

const props = defineProps({
  record: { type: Object, default: null },
})
const emit = defineEmits(['close', 'save'])

const isEdit = !!props.record
const activeTab = ref('basic')

const tabs = [
  { key: 'basic', label: '基本情報' },
  { key: 'project', label: '案件情報' },
  { key: 'sales', label: '営業情報' },
  { key: 'todo', label: 'TODOリスト' },
  { key: 'schedule', label: '月次スケジュール' },
]

const form = reactive(
  props.record ? JSON.parse(JSON.stringify(props.record)) : createEmptyRecord()
)

function addTodo() {
  form.todos.push({ agenda: '', assignee: '', startDate: '', endDate: '', execDate: '', result: '', activityCheck: '' })
}
function removeTodo(idx) {
  form.todos.splice(idx, 1)
}

function submit() {
  if (!form.customerName) {
    alert('顧客名は必須です。')
    activeTab.value = 'basic'
    return
  }
  emit('save', JSON.parse(JSON.stringify(form)))
}
</script>
