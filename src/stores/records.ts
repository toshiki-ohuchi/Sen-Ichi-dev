import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import type { SalesRecord, FilterValues } from '@/types'
import { recordsApi } from '@/api/client'

export const useRecordsStore = defineStore('records', () => {
  const records = ref<SalesRecord[]>([])
  const total = ref(0)
  const loading = ref(false)
  const filterValues = ref<FilterValues>({
    department: [], location: [], assignedDept: [],
    commercialFlow: [], contractType: [], customerGrade: [],
  })

  const query = reactive({
    q: '', department: '', location: '', assignedDept: '',
    commercialFlow: '', contractType: '', customerGrade: '',
    sortKey: 'no', sortDir: 'asc', page: 1, pageSize: 20,
  })

  async function fetchList() {
    loading.value = true
    try {
      const params = Object.fromEntries(
        Object.entries(query).filter(([, v]) => v !== '' && v !== null)
      )
      const res = await recordsApi.list(params)
      records.value = res.data
      total.value = res.total
    } finally {
      loading.value = false
    }
  }

  async function fetchFilters() {
    filterValues.value = await recordsApi.filters()
  }

  function resetFilters() {
    query.q = ''
    query.department = ''
    query.location = ''
    query.assignedDept = ''
    query.commercialFlow = ''
    query.contractType = ''
    query.customerGrade = ''
    query.page = 1
  }

  function setSort(key: string) {
    if (query.sortKey === key) {
      query.sortDir = query.sortDir === 'asc' ? 'desc' : 'asc'
    } else {
      query.sortKey = key
      query.sortDir = 'asc'
    }
    query.page = 1
    fetchList()
  }

  return { records, total, loading, filterValues, query, fetchList, fetchFilters, resetFilters, setSort }
})
