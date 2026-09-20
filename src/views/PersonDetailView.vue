<!-- src/views/PersonDetailView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { treeStore, type PersonData } from '@/store/useTreeStore'
import TopBar from '@/components/TopBar.vue'

const route = useRoute()
const router = useRouter()
const personId = route.params.id as string
const isDarkMode = ref(false)

const form = ref<PersonData>({
  firstName: '',
  lastName: '',
  country: '',
  birthDate: '',
  isAlive: true,
  deathDate: '',
  description: '',
  photoUrl: ''
})

onMounted(() => {
  const existingNode = treeStore.getNode(personId)
  if (existingNode && existingNode.data) {
    form.value = {
      firstName: existingNode.data.firstName || '',
      lastName: existingNode.data.lastName || '',
      country: existingNode.data.country || '',
      birthDate: existingNode.data.birthDate || '',
      isAlive: existingNode.data.isAlive ?? true,
      deathDate: existingNode.data.deathDate || '',
      description: existingNode.data.description || '',
      photoUrl: existingNode.data.photoUrl || ''
    }
  }
})

// Handle Image Upload & Convert to Base64
function handlePhotoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      form.value.photoUrl = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function removePhoto() {
  form.value.photoUrl = ''
}

function save() {
  treeStore.updatePersonData(personId, form.value)
  router.push('/')
}

function cancel() {
  router.push('/')
}

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
}
</script>

<template>
  <div class="page-wrapper" :class="{ dark: isDarkMode }">
    <TopBar 
        :is-dark-mode="isDarkMode"
        :hide-edit-menu="true"
        :hide-clear-option="true"
        @toggle-dark-mode="toggleDarkMode"
    />

    <div class="detail-container">
      <h2>Edit Person Details (ID: {{ personId }})</h2>

      <form @submit.prevent="save">
        <div class="form-row">
          <div class="form-group">
            <label>First Name</label>
            <input v-model="form.firstName" type="text" placeholder="John" />
          </div>

          <div class="form-group">
            <label>Last Name</label>
            <input v-model="form.lastName" type="text" placeholder="Doe" />
          </div>
        </div>

        <div class="form-group">
          <label>Country</label>
          <input v-model="form.country" type="text" placeholder="e.g. Austria" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Birth Date</label>
            <input v-model="form.birthDate" type="text" placeholder="YYYY, YYYY-MM, or YYYY-MM-DD" />
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" v-model="form.isAlive" />
              Is Alive
            </label>
          </div>
        </div>

        <div v-if="!form.isAlive" class="form-group">
          <label>Death Date</label>
          <input v-model="form.deathDate" type="text" placeholder="YYYY, YYYY-MM, or YYYY-MM-DD" />
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea v-model="form.description" rows="3" placeholder="Additional details..."></textarea>
        </div>

        <!-- Photo Upload Section -->
        <div class="form-group">
          <label>Photo</label>
          <input type="file" accept="image/*" @change="handlePhotoUpload" />

          <div v-if="form.photoUrl" class="photo-preview-container">
            <img :src="form.photoUrl" alt="Preview" class="photo-preview" />
            <button type="button" class="btn-remove" @click="removePhoto">Remove Photo</button>
          </div>
        </div>

        <div class="actions">
          <button type="button" class="btn-secondary" @click="cancel">Cancel</button>
          <button type="submit" class="btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #f8fafc;
  color: #0f172a;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.page-wrapper.dark {
  background: #0f172a;
  color: #f8fafc;
}

.detail-container {
  max-width: 550px;
  margin: 30px auto;
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  color: #1e293b;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.page-wrapper.dark .detail-container {
  background: #1a1a1a;
  color: #e0e0e0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
  color: #0f172a;
}

.page-wrapper.dark h2 {
  color: #e0e0e0;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-group {
  flex: 1;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.checkbox-group {
  justify-content: flex-end;
  padding-bottom: 8px;
}

label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #475569;
}

.page-wrapper.dark label {
  color: #a0a0a0;
}

input[type='text'],
textarea {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  color: #0f172a;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.page-wrapper.dark input[type='text'],
.page-wrapper.dark textarea {
  background: #2a2a2a;
  color: #e0e0e0;
  border-color: #3a3a3a;
}

input[type='text']:focus,
textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.photo-preview-container {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.photo-preview {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
}

.page-wrapper.dark .photo-preview {
  border-color: #3a3a3a;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

button {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.page-wrapper.dark .btn-secondary {
  background: #2a2a2a;
  color: #a0a0a0;
}

.page-wrapper.dark .btn-secondary:hover {
  background: #3a3a3a;
}

.btn-remove {
  background: #fee2e2;
  color: #ef4444;
  padding: 4px 8px;
  font-size: 12px;
}

.btn-remove:hover {
  background: #fecaca;
}

.page-wrapper.dark .btn-remove {
  background: #5a2020;
  color: #ff6b6b;
}

.page-wrapper.dark .btn-remove:hover {
  background: #6a3030;
}
</style>