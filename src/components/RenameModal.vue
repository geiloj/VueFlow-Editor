<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  initialValue: string
}>()

const emit = defineEmits<{
  (e: 'save', newLabel: string): void
  (e: 'cancel'): void
}>()

const labelText = ref(props.initialValue)

watch(
    () => props.initialValue,
    (val) => {
      labelText.value = val
    }
)

function submit() {
  if (labelText.value.trim()) {
    emit('save', labelText.value.trim())
  }
}
</script>

<template>
  <div v-if="isOpen" class="modal-backdrop" @click="emit('cancel')">
    <div class="modal-card" @click.stop>
      <h3>Rename Person</h3>
      <input
          v-model="labelText"
          type="text"
          class="rename-input"
          autofocus
          @keyup.enter="submit"
          @keyup.esc="emit('cancel')"
      />
      <div class="modal-actions">
        <button class="btn-secondary" @click="emit('cancel')">Cancel</button>
        <button class="btn-primary" @click="submit">Save</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-card {
  background: #ffffff;
  color: #0f172a;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

/* Dark mode styling */
:global(.page-wrapper.dark) .modal-card {
  background: #1e293b;
  color: #f8fafc;
  border: 1px solid #334155;
}

.rename-input {
  width: 100%;
  padding: 8px 12px;
  margin: 16px 0;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  background: #ffffff;
  color: #0f172a;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

:global(.page-wrapper.dark) .rename-input {
  background: #0f172a;
  color: #f8fafc;
  border-color: #475569;
}

.rename-input:focus {
  border-color: #3b82f6;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: transparent;
  color: #64748b;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  transition: color 0.2s ease;
}

:global(.page-wrapper.dark) .btn-secondary {
  color: #94a3b8;
}

.btn-secondary:hover {
  color: #334155;
}

:global(.page-wrapper.dark) .btn-secondary:hover {
  color: #cbd5e1;
}
</style>