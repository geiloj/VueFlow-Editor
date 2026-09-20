<!-- src/components/ContextMenu.vue -->
<script setup lang="ts">
const props = defineProps<{
  x: number
  y: number
  selectedNodeId: string | null
  selectedNodeType?: string
  isDarkMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'add-node', type?: string): void
  (e: 'rename-node'): void
  (e: 'delete-node'): void
  (e: 'edit-details'): void
  (e: 'toggle-marriage'): void
}>()

</script>

<template>
  <div class="context-menu" :class="{ dark: isDarkMode }" :style="{ top: `${y}px`, left: `${x}px` }" @click.stop>
    <!-- Node Specific Actions -->
    <template v-if="selectedNodeId">
      <div v-if="selectedNodeType === 'person'" class="menu-item" @click="emit('edit-details')">
        Edit Person Details
      </div>
      <div v-if="selectedNodeType === 'marriage'" class="menu-item" @click="emit('toggle-marriage')">
        Toggle Marriage Status
      </div>
      <div v-if="selectedNodeType === 'person'" class="menu-item" @click="emit('rename-node')">Rename</div>
      <div class="menu-item danger" @click="emit('delete-node')">Delete</div>
    </template>

    <!-- Pane Actions -->
    <template v-else>
      <div class="menu-item" @click="emit('add-node', 'person')">Add Person</div>
    </template>
  </div>
</template>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 1000;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 160px;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.context-menu.dark {
  background: #2a2a2a;
  border-color: #3a3a3a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.menu-item {
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  color: #334155;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.context-menu.dark .menu-item {
  color: #d0d0d0;
}

.menu-item:hover {
  background-color: #f1f5f9;
}

.context-menu.dark .menu-item:hover {
  background-color: #3a3a3a;
}

.menu-item.danger {
  color: #ef4444;
}

.menu-item.danger:hover {
  background-color: #fef2f2;
  color: #ef4444;
}

.context-menu.dark .menu-item.danger {
  color: #ff6b6b;
}

.context-menu.dark .menu-item.danger:hover {
  background-color: #5a2020;
}
</style>