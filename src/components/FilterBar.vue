<template>
  <div class="filter-bar">
    <div class="search-box">
      <span>🔍</span>
      <input v-model="store.query.q" type="text" placeholder="顧客名・案件名で検索" @input="onSearch" />
      <button v-if="store.query.q" class="btn-clear" @click="store.query.q=''; onSearch()">✕</button>
    </div>

    <div class="filter-selects">
      <select v-model="store.query.assignedDept" @change="onFilter">
        <option value="">担当部署（すべて）</option>
        <option v-for="v in store.filterValues.assignedDept" :key="v" :value="v">{{ v }}</option>
      </select>
      <select v-model="store.query.commercialFlow" @change="onFilter">
        <option value="">商流（すべて）</option>
        <option v-for="v in store.filterValues.commercialFlow" :key="v" :value="v">{{ v }}</option>
      </select>
      <select v-model="store.query.contractType" @change="onFilter">
        <option value="">契約形態（すべて）</option>
        <option v-for="v in store.filterValues.contractType" :key="v" :value="v">{{ v }}</option>
      </select>
      <select v-model="store.query.customerGrade" @change="onFilter">
        <option value="">客先グレード（すべて）</option>
        <option v-for="v in store.filterValues.customerGrade" :key="v" :value="v">{{ v }}</option>
      </select>
      <button class="btn btn-sm btn-secondary" @click="onReset">フィルタ解除</button>
    </div>

    <span class="result-count">{{ store.total }}件</span>
  </div>
</template>

<script setup lang="ts">
import { useRecordsStore } from '@/stores/records'

const store = useRecordsStore()
let timer: ReturnType<typeof setTimeout>

function onSearch() {
  clearTimeout(timer)
  timer = setTimeout(() => { store.query.page = 1; store.fetchList() }, 300)
}

function onFilter() {
  store.query.page = 1
  store.fetchList()
}

function onReset() {
  store.resetFilters()
  store.fetchList()
}
</script>
