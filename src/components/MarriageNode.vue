<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{
  data?: {
    active?: boolean
    isDarkMode?: boolean
  }
}>()
</script>

<template>
  <div class="marriage-node-wrapper" :class="{ inactive: props.data?.active === false, dark: data?.isDarkMode }">
    <div class="diamond-shape">
      <!-- ER-Diagramm Symbol für Beziehung/Marriage -->
      <svg
          class="diamond-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </div>

    <!-- Handles -->
    <Handle id="left" type="target" :position="Position.Left" />
    <Handle id="left-source" type="source" :position="Position.Left" />
    <Handle id="right" type="target" :position="Position.Right" />
    <Handle id="right-source" type="source" :position="Position.Right" />
    <Handle id="bottom" type="source" :position="Position.Bottom" />
  </div>
</template>

<style scoped>
.marriage-node-wrapper {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.diamond-shape {
  width: 24px;
  height: 24px;
  background: #ffffff;
  border: 2px solid #ec4899;
  transform: rotate(45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.marriage-node-wrapper.dark .diamond-shape {
  background: #3a3a3a;
  border-color: #f472b6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.diamond-icon {
  width: 12px;
  height: 12px;
  transform: rotate(-45deg);
  color: #ec4899;
  transition: color 0.2s ease;
}

.marriage-node-wrapper.dark .diamond-icon {
  color: #f472b6;
}

.vue-flow__handle {
  width: 6px;
  height: 6px;
  background: #ec4899;
  border-radius: 50%;
}

.marriage-node-wrapper.dark .vue-flow__handle {
  background: #f472b6;
}

/* Status: Inaktiv / Geschieden (Grau) */
.marriage-node-wrapper.inactive .diamond-shape {
  border-color: #94a3b8;
  background: #f1f5f9;
}

.marriage-node-wrapper.inactive.dark .diamond-shape {
  border-color: #64748b;
  background: #2a2a2a;
}

.marriage-node-wrapper.inactive .diamond-icon {
  color: #94a3b8;
}

.marriage-node-wrapper.inactive.dark .diamond-icon {
  color: #64748b;
}

.marriage-node-wrapper.inactive .vue-flow__handle {
  background: #94a3b8;
}

.marriage-node-wrapper.inactive.dark .vue-flow__handle {
  background: #64748b;
}
</style>