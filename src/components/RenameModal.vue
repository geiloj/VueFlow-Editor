<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  isOpen: boolean
  initialValue: string
}>()

const emit = defineEmits<{
  (e: 'save', value: string): void
  (e: 'cancel'): void
}>()

const textInput = ref(props.initialValue)
const inputRef = ref<HTMLInputElement | null>(null)

// Sync textInput whenever initialValue or isOpen changes, then focus
watch(
    () => [props.isOpen, props.initialValue],
    ([open, val]) => {
      if (open) {
        textInput.value = val as string
        nextTick(() => {
          inputRef.value?.focus()
          inputRef.value?.select() // Select all text for quick editing
        })
      }
    },
    { immediate: true }
)

function close() {
  emit('cancel')
}

function submit() {
  emit('save', textInput.value)
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <h3>Rename Node</h3>
      <form @submit.prevent="submit">
        <input
            ref="inputRef"
            v-model="textInput"
            type="text"
            placeholder="Enter node label"
            @keydown.escape="close"
        />
        <div class="modal-actions">
          <button type="button" class="btn secondary" @click="close">Cancel</button>
          <button type="submit" class="btn primary">Save</button>
        </div>
      </form>
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
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 6px;
  width: 300px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  color: #333;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
}

input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  margin-bottom: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.btn.primary {
  background: #0078d4;
  color: white;
}

.btn.secondary {
  background: #e0e0e0;
  color: #333;
}

/* --- Dark Mode Styles --- */
:global(body.dark-mode) .modal-content {
  background-color: #252525 !important;
  color: #f0f0f0 !important;
  border: 1px solid #3a3a3a;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
}

:global(body.dark-mode) .modal-content input {
  background-color: #1a1a1a !important;
  color: #ffffff !important;
  border: 1px solid #444444 !important;
}

:global(body.dark-mode) .modal-content input:focus {
  border-color: #0078d4 !important;
}

:global(body.dark-mode) .btn.secondary {
  background-color: #3a3a3a !important;
  color: #e0e0e0 !important;
}

:global(body.dark-mode) .btn.secondary:hover {
  background-color: #4a4a4a !important;
}
</style>