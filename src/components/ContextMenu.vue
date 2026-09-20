<script setup lang="ts">
defineProps<{
  x: number
  y: number
  selectedNodeId: string | null
}>()

const emit = defineEmits<{
  'add-node': [type: string]
  'rename-node': []
  'change-type': []
  'delete-node': []
}>()

const nodeTypes = [
  { id: 'input', label: 'Input Node' },
  { id: 'default', label: 'Default Node' },
  { id: 'output', label: 'Output Node' },
]
</script>

<template>
  <div
      class="context-menu"
      :style="{ top: `${y}px`, left: `${x}px` }"
      @click.stop
      @contextmenu.prevent
  >
    <!-- Add Node with Submenu -->
    <div class="menu-item has-submenu">
      <span>Add Node</span>
      <span class="arrow">▶</span>

      <!-- Submenu for Node Types -->
      <div class="submenu">
        <div
            v-for="type in nodeTypes"
            :key="type.id"
            class="menu-item"
            @click="emit('add-node', type.id)"
        >
          {{ type.label }}
        </div>
      </div>
    </div>

    <!-- Node-Specific Actions -->
    <template v-if="selectedNodeId">
      <div class="menu-item" @click="emit('rename-node')">Rename Node (F2)</div>
      <div class="menu-item" @click="emit('change-type')">Change Type</div>
      <div class="menu-item danger" @click="emit('delete-node')">Delete Node</div>
    </template>
  </div>
</template>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 1000;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 4px 0;
}

.menu-item {
  position: relative;
  margin: 0;
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
  color: #333;
}

.menu-item:hover {
  background-color: #4a4a4a;
  color: white;
}

.menu-item:hover .arrow {
  color: white;
}

.menu-item.danger:hover {
  background-color: #ff4d4f;
  color: white;
}

.arrow {
  font-size: 10px;
  color: #666;
}

.has-submenu .submenu {
  display: none;
  position: absolute;
  top: -4px;
  left: 100%;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 4px 0;
}

.has-submenu:hover > .submenu {
  display: block;
}
</style>