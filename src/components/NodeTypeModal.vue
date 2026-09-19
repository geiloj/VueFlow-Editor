<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  currentType?: string
}>()

const emit = defineEmits<{
  (e: 'select', type: string): void
  (e: 'cancel'): void
}>()

const selectedType = ref(props.currentType || 'default')

const availableTypes = [
  { id: 'input', label: 'Input Node (Source only)' },
  { id: 'default', label: 'Default Node (Input & Output)' },
  { id: 'output', label: 'Output Node (Target only)' },
]
</script>

<template>
  <div class="modal-overlay" @click.stop="emit('cancel')">
    <div class="modal" @click.stop>
      <h3>Change Node Type</h3>
      <div class="type-options">
        <label
            v-for="type in availableTypes"
            :key="type.id"
            class="type-option"
            :class="{ active: selectedType === type.id }"
        >
          <input
              v-model="selectedType"
              type="radio"
              name="nodeType"
              :value="type.id"
          />
          <span>{{ type.label }}</span>
        </label>
      </div>
      <div class="modal-actions">
        <button @click="emit('select', selectedType)">Apply</button>
        <button @click="emit('cancel')">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  width: 320px;
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 16px;
}

.type-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.type-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.type-option:hover {
  background: #f5f5f5;
}

.type-option.active {
  border-color: #007bff;
  background: #eef6ff;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.modal-actions button {
  padding: 6px 12px;
  cursor: pointer;
}
</style>