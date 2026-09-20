<!-- src/views/PersonDetailView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { treeStore, type PersonData } from '@/store/useTreeStore'

const route = useRoute()
const router = useRouter()
const personId = route.params.id as string

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
</script>

<template>
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
</template>

<style scoped>
.detail-container {
  max-width: 550px;
  margin: 30px auto;
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  color: #1e293b;
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
  color: #0f172a;
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

input[type='text'],
textarea {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
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
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-remove {
  background: #fee2e2;
  color: #ef4444;
  padding: 4px 8px;
  font-size: 12px;
}
</style>