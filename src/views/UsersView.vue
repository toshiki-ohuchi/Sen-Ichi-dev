<template>
  <div class="home">
    <AppHeader />
    <div class="users-page">
      <div class="users-header">
        <div class="users-header-left">
          <RouterLink to="/" class="btn btn-ghost btn-sm back-link">← 一覧に戻る</RouterLink>
          <h2>ユーザー管理</h2>
        </div>
        <button class="btn btn-primary" @click="openCreate">+ ユーザー追加</button>
      </div>

      <div class="table-wrapper" style="padding:0">
        <table class="data-table">
          <thead>
            <tr>
              <th>氏名</th>
              <th>メールアドレス</th>
              <th>権限</th>
              <th>ステータス</th>
              <th>ログイン失敗</th>
              <th>最終ログイン</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="users.length === 0">
              <td colspan="7" class="empty-row">ユーザーがいません。</td>
            </tr>
            <tr v-for="u in users" :key="u.id" :class="{ 'row-inactive': !u.isActive }">
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td>
                <span :class="['role-badge', u.role]">{{ u.role === 'admin' ? '管理者' : '一般' }}</span>
              </td>
              <td>
                <span :class="['status-badge', u.isActive ? 'active' : 'inactive']">
                  {{ u.isActive ? '有効' : '無効' }}
                </span>
                <span v-if="u.lockedUntil && new Date(u.lockedUntil) > new Date()" class="locked-badge">🔒 ロック中</span>
              </td>
              <td>{{ u.failedLoginCount }}回</td>
              <td>{{ u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('ja-JP') : '-' }}</td>
              <td class="action-cell">
                <button class="btn btn-xs btn-secondary" @click="openEdit(u)">編集</button>
                <button class="btn btn-xs btn-secondary" @click="openPasswordReset(u)">PW変更</button>
                <button v-if="u.lockedUntil && new Date(u.lockedUntil) > new Date()"
                  class="btn btn-xs btn-secondary" @click="unlock(u)">解除</button>
                <button class="btn btn-xs btn-danger" @click="confirmDelete(u)"
                  :disabled="u.email === auth.user?.email">削除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 新規作成 / 編集モーダル -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="confirm-dialog" style="max-width:480px">
        <h3>{{ editTarget ? 'ユーザー編集' : 'ユーザー追加' }}</h3>
        <div class="form-group" style="margin-top:16px">
          <label>氏名 <span class="required">*</span></label>
          <input v-model="form.name" type="text" />
        </div>
        <template v-if="!editTarget">
          <div class="form-group" style="margin-top:12px">
            <label>メールアドレス <span class="required">*</span></label>
            <input v-model="form.email" type="email" placeholder="example@sas-com.com" />
          </div>
          <div class="form-group" style="margin-top:12px">
            <label>パスワード <span class="required">*</span></label>
            <input v-model="form.password" type="text" placeholder="8文字以上・英数字混在" />
            <span class="field-hint">※ 初期パスワードです。後から変更できます。</span>
          </div>
        </template>
        <div class="form-group" style="margin-top:12px">
          <label>権限 <span class="required">*</span></label>
          <select v-model="form.role">
            <option value="user">一般ユーザー</option>
            <option value="admin">管理者</option>
          </select>
        </div>
        <template v-if="editTarget">
          <div class="form-group" style="margin-top:12px">
            <label>ステータス</label>
            <select v-model="form.isActive">
              <option :value="true">有効</option>
              <option :value="false">無効</option>
            </select>
          </div>
        </template>
        <div v-if="modalError" class="error-box" style="margin-top:12px">{{ modalError }}</div>
        <div class="dialog-actions" style="margin-top:20px">
          <button class="btn btn-secondary" @click="showModal = false">キャンセル</button>
          <button class="btn btn-primary" :disabled="saving" @click="submitUser">
            {{ saving ? '保存中...' : (editTarget ? '更新' : '登録') }}
          </button>
        </div>
      </div>
    </div>

    <!-- パスワードリセットモーダル -->
    <div v-if="showPwModal" class="modal-overlay" @click.self="showPwModal = false">
      <div class="confirm-dialog" style="max-width:400px">
        <h3>パスワード変更</h3>
        <p style="margin:8px 0 16px;color:#6b7280;font-size:12px">{{ pwTarget?.name }}（{{ pwTarget?.email }}）</p>
        <div class="form-group">
          <label>新しいパスワード <span class="required">*</span></label>
          <input v-model="newPassword" type="text" placeholder="8文字以上・英数字混在" />
          <span class="field-hint">※ 設定後、対象ユーザーに伝達してください。</span>
        </div>
        <div v-if="pwError" class="error-box" style="margin-top:10px">{{ pwError }}</div>
        <div class="dialog-actions" style="margin-top:20px">
          <button class="btn btn-secondary" @click="showPwModal = false">キャンセル</button>
          <button class="btn btn-primary" :disabled="saving" @click="submitPassword">
            {{ saving ? '変更中...' : '変更する' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 削除確認 -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="confirm-dialog">
        <h3>削除確認</h3>
        <p>「{{ deleteTarget.name }}」を削除してよろしいですか？</p>
        <div class="dialog-actions">
          <button class="btn btn-secondary" @click="deleteTarget = null">キャンセル</button>
          <button class="btn btn-danger" @click="doDelete">削除する</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { usersApi } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import type { AppUser } from '@/types'

const auth = useAuthStore()
const users = ref<AppUser[]>([])
const showModal = ref(false)
const showPwModal = ref(false)
const saving = ref(false)
const editTarget = ref<AppUser | null>(null)
const deleteTarget = ref<AppUser | null>(null)
const pwTarget = ref<AppUser | null>(null)
const newPassword = ref('')
const pwError = ref('')
const modalError = ref('')

const form = reactive({ name: '', email: '', password: '', role: 'user', isActive: true })

onMounted(async () => { users.value = await usersApi.list() })

function openCreate() {
  editTarget.value = null
  Object.assign(form, { name: '', email: '', password: '', role: 'user', isActive: true })
  modalError.value = ''
  showModal.value = true
}

function openEdit(u: AppUser) {
  editTarget.value = u
  Object.assign(form, { name: u.name, email: u.email, password: '', role: u.role, isActive: u.isActive })
  modalError.value = ''
  showModal.value = true
}

function openPasswordReset(u: AppUser) {
  pwTarget.value = u
  newPassword.value = ''
  pwError.value = ''
  showPwModal.value = true
}

async function submitUser() {
  modalError.value = ''
  saving.value = true
  try {
    if (editTarget.value) {
      await usersApi.update(editTarget.value.id, { name: form.name, role: form.role, isActive: form.isActive })
    } else {
      await usersApi.create({ email: form.email, name: form.name, password: form.password, role: form.role })
    }
    users.value = await usersApi.list()
    showModal.value = false
  } catch (err: any) {
    modalError.value = err.response?.data?.error || '登録に失敗しました。'
  } finally {
    saving.value = false
  }
}

async function submitPassword() {
  pwError.value = ''
  if (!pwTarget.value) return
  saving.value = true
  try {
    await usersApi.resetPassword(pwTarget.value.id, newPassword.value)
    showPwModal.value = false
    alert('パスワードを変更しました。')
  } catch (err: any) {
    pwError.value = err.response?.data?.error || '変更に失敗しました。'
  } finally {
    saving.value = false
  }
}

async function unlock(u: AppUser) {
  await usersApi.unlock(u.id)
  users.value = await usersApi.list()
}

function confirmDelete(u: AppUser) { deleteTarget.value = u }

async function doDelete() {
  if (!deleteTarget.value) return
  await usersApi.delete(deleteTarget.value.id)
  users.value = await usersApi.list()
  deleteTarget.value = null
}
</script>
