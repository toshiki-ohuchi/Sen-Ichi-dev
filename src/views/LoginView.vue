<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <div class="logo-mark">SAS</div>
        <h1>顧客別営業戦略一覧</h1>
        <p class="login-year">2026年度</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>メールアドレス</label>
          <input
            v-model="email"
            type="email"
            placeholder="example@sas-com.com"
            autocomplete="email"
            :disabled="loading"
            required
          />
        </div>
        <div class="form-group">
          <label>パスワード</label>
          <div class="password-input">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="パスワードを入力"
              autocomplete="current-password"
              :disabled="loading"
              required
            />
            <button type="button" class="toggle-pw" @click="showPassword = !showPassword" tabindex="-1">
              {{ showPassword ? '🙈' : '👁' }}
            </button>
          </div>
        </div>

        <div v-if="errorMsg" class="error-box">{{ errorMsg }}</div>

        <button type="submit" class="btn btn-primary btn-login" :disabled="loading">
          {{ loading ? 'ログイン中...' : 'ログイン' }}
        </button>
      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const showPassword = ref(false)

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    const user = await authApi.login(email.value, password.value)
    auth.user = user
    router.push('/')
  } catch (err: any) {
    const msg = err.response?.data?.error
    errorMsg.value = msg || 'ログインに失敗しました。'
  } finally {
    loading.value = false
  }
}
</script>
