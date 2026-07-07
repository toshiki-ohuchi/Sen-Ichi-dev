<template>
  <div class="home">
    <AppHeader />
    <FilterBar />
    <CustomerTable @edit="openEdit" @add="openAdd" />
    <CustomerModal
      v-if="showModal"
      :record="editRecord"
      @close="showModal = false"
      @saved="onSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import CustomerTable from '@/components/CustomerTable.vue'
import CustomerModal from '@/components/CustomerModal/index.vue'
import { useRecordsStore } from '@/stores/records'
import type { SalesRecord } from '@/types'

const store = useRecordsStore()
const showModal = ref(false)
const editRecord = ref<SalesRecord | null>(null)

onMounted(async () => {
  await Promise.all([store.fetchList(), store.fetchFilters()])
})

function openAdd() {
  editRecord.value = null
  showModal.value = true
}

function openEdit(record: SalesRecord) {
  editRecord.value = record
  showModal.value = true
}

async function onSaved() {
  showModal.value = false
  await Promise.all([store.fetchList(), store.fetchFilters()])
}
</script>
