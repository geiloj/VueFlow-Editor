<script setup lang="ts">
defineProps<{
  currentType: string
}>()

const emit = defineEmits<{
  (e: 'select', newType: string): void
  (e: 'cancel'): void
}>()

const availableTypes = [
  { id: 'person', label: 'Person' },
  { id: 'marriage', label: 'Marriage (Diamond)' },
]
</script>

<template>
  <div class="modal-backdrop" @click="emit('cancel')">
    <div class="modal-card" @click.stop>
      <h3>Change Node Type</h3>
      <div class="type-list">
        <button
            v-for="type in availableTypes"
            :key="type.id"
            class="type-btn"
            :class="{ active: currentType === type.id }"
            @click="emit('select', type.id)"
        >
          {{ type.label }}
        </button>
      </div>
      <div class="modal-actions">
        <button class="btn-cancel" @click="emit('cancel')">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 280px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.dark .modal-card {
  background: #1e293b;
  color: white;
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px 0;
}

.type-btn {
  padding: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  font-weight: 500;
}

.dark .type-btn {
  background: #334155;
  border-color: #475569;
  color: white;
}

.type-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #1d4ed8;
}

.dark .type-btn.active {
  background: #1e3a8a;
  color: #93c5fd;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 6px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #64748b;
}
</style>