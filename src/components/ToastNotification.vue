<script setup lang="ts">
import { watch } from 'vue'

const props = defineProps<{
  message: string | null
  duration?: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

let timer: ReturnType<typeof setTimeout> | null = null

watch(
    () => props.message,
    (newMessage) => {
      if (timer) clearTimeout(timer)
      if (newMessage) {
        timer = setTimeout(() => {
          emit('close')
        }, props.duration || 4000)
      }
    }
)
</script>

<template>
  <Transition name="toast">
    <div v-if="message" class="toast-card">
      <span class="toast-icon">⚠️</span>
      <span class="toast-text">{{ message }}</span>
      <button class="toast-close" @click="emit('close')">×</button>
    </div>
  </Transition>
</template>

<style scoped>
.toast-card {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 3000;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-left: 4px solid #ef4444;
  border-radius: 8px;
  color: #991b1b;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-width: 380px;
  font-size: 14px;
}

/* Dark mode Support */
.dark .toast-card {
  background: #2a1215;
  border-color: #7f1d1d;
  border-left-color: #f87171;
  color: #fca5a5;
}

.toast-icon {
  font-size: 16px;
}

.toast-text {
  flex: 1;
  font-weight: 500;
  line-height: 1.4;
}

.toast-close {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #991b1b;
  padding: 0 4px;
  line-height: 1;
}

.dark .toast-close {
  color: #fca5a5;
}

/* Slide/Fade Animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>