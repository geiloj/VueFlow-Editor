<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { Node, Edge, Connection } from '@vue-flow/core'
import { VueFlow, addEdge, useVueFlow } from '@vue-flow/core'

import NodeTypeModal from '@/components/NodeTypeModal.vue'
import RenameModal from '@/components/RenameModal.vue'
import ContextMenu from '@/components/ContextMenu.vue'
import TopBar from '@/components/TopBar.vue'

// ==========================================
// Vue Flow Setup & Core State
// ==========================================
const {
  project,
  removeNodes,
  removeEdges,
  getSelectedNodes,
  getSelectedEdges,
  findNode,
  toObject,
  fitView,
} = useVueFlow()

const nodes = ref<Node[]>([
  {
    id: '1',
    type: 'input',
    position: { x: 250, y: 5 },
    data: { label: 'Node 1' },
  },
  {
    id: '2',
    type: 'default',
    position: { x: 100, y: 100 },
    data: { label: 'Node 2' },
  },
])

const edges = ref<Edge[]>([
  {
    id: 'e1->2',
    source: '1',
    target: '2',
  },
])

// ==========================================
// UI / App State
// ==========================================
const mousepos = ref({ x: 0, y: 0 })
const showContextMenu = ref(false)
const selectedNodeId = ref<string | null>(null)
const isDarkMode = ref(false)

// Modals State
const isRenaming = ref(false)
const renameText = ref('')
const targetNodeId = ref<string | null>(null)

const isChangingType = ref(false)
const currentNodeType = ref('default')

// Clipboard State
const clipboardData = ref<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] })
const pasteCount = ref(0)

// ==========================================
// TopBar & File Actions
// ==========================================
function exportJSON() {
  const flowObject = toObject()
  const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(flowObject, null, 2))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute('download', `flow-graph-${Date.now()}.json`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

function triggerImportModal() {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  if (input) input.click()
}

function importJSON(jsonString: string) {
  try {
    const flow = JSON.parse(jsonString)
    if (flow.nodes && flow.edges) {
      nodes.value = flow.nodes
      edges.value = flow.edges
    } else {
      alert('Invalid Vue Flow JSON structure!')
    }
  } catch (err) {
    alert('Failed to parse JSON file.')
  }
}

function clearGraph() {
  nodes.value = []
  edges.value = []
}

function resetZoom() {
  fitView({ duration: 300 })
}

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
}

// Keep <body> synced for global dark mode overrides
watch(
    isDarkMode,
    (dark) => {
      if (dark) {
        document.body.classList.add('dark-mode')
      } else {
        document.body.classList.remove('dark-mode')
      }
    },
    { immediate: true }
)

// ==========================================
// Clipboard Operations (Copy, Cut, Paste)
// ==========================================
function copySelectedElements() {
  const selectedNodes = getSelectedNodes.value
  if (selectedNodes.length === 0) return

  const selectedNodeIds = new Set(selectedNodes.map((n) => n.id))

  const relevantEdges = edges.value.filter(
      (e) =>
          e.selected ||
          (selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target))
  )

  clipboardData.value = {
    nodes: JSON.parse(JSON.stringify(selectedNodes)),
    edges: JSON.parse(JSON.stringify(relevantEdges)),
  }

  pasteCount.value = 0
}

function cutSelectedElements() {
  const selectedNodes = getSelectedNodes.value
  const selectedEdges = getSelectedEdges.value

  if (selectedNodes.length === 0 && selectedEdges.length === 0) return

  copySelectedElements()

  const nodeIdsToRemove = selectedNodes.map((n) => n.id)
  const edgeIdsToRemove = selectedEdges.map((e) => e.id)

  if (nodeIdsToRemove.length > 0) removeNodes(nodeIdsToRemove)
  if (edgeIdsToRemove.length > 0) removeEdges(edgeIdsToRemove)
}

function pasteElements() {
  const { nodes: copiedNodes, edges: copiedEdges } = clipboardData.value
  if (!copiedNodes || copiedNodes.length === 0) return

  pasteCount.value++
  const offset = pasteCount.value * 20

  const idMap = new Map<string, string>()
  const newNodes: Node[] = []

  // Deselect active canvas elements
  nodes.value.forEach((n) => (n.selected = false))
  edges.value.forEach((e) => (e.selected = false))

  // Clone nodes
  copiedNodes.forEach((node) => {
    const newId = `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    idMap.set(node.id, newId)

    const clonedNode: Node = {
      ...JSON.parse(JSON.stringify(node)),
      id: newId,
      position: {
        x: node.position.x + offset,
        y: node.position.y + offset,
      },
      selected: true,
    }
    newNodes.push(clonedNode)
  })

  // Clone edges connecting copied nodes
  const newEdges: Edge[] = []
  copiedEdges.forEach((edge) => {
    const newSource = idMap.get(edge.source)
    const newTarget = idMap.get(edge.target)

    if (newSource && newTarget) {
      const newEdgeId = `edge_${newSource}_${newTarget}_${Date.now()}`
      newEdges.push({
        ...JSON.parse(JSON.stringify(edge)),
        id: newEdgeId,
        source: newSource,
        target: newTarget,
        selected: true,
      })
    }
  })

  nodes.value.push(...newNodes)
  edges.value.push(...newEdges)
}

// ==========================================
// Canvas Interaction & Context Menu
// ==========================================
function onConnect(connection: Connection) {
  edges.value = addEdge(connection, edges.value)
}

function showPaneMenu(event: MouseEvent) {
  mousepos.value = { x: event.clientX, y: event.clientY }
  selectedNodeId.value = null
  showContextMenu.value = true
}

function showNodeMenu(event: MouseEvent, nodeId: string) {
  mousepos.value = { x: event.clientX, y: event.clientY }
  selectedNodeId.value = nodeId
  showContextMenu.value = true
}

function hideMenu() {
  showContextMenu.value = false
}

function addNode(type: string = 'default') {
  const position = project({ x: mousepos.value.x, y: mousepos.value.y })
  const newId = (nodes.value.length + 1).toString()

  const newNode: Node = {
    id: newId,
    type: type,
    position,
    data: { label: `Node ${newId}` },
  }
  nodes.value.push(newNode)
  hideMenu()
}

function deleteNode() {
  if (selectedNodeId.value) {
    removeNodes([selectedNodeId.value])
  }
  hideMenu()
}

// ==========================================
// Node Editing (Rename & Type Changing)
// ==========================================
function startRename(id?: string) {
  const targetId = id || selectedNodeId.value
  if (!targetId) return

  const node = findNode(targetId)
  if (node) {
    targetNodeId.value = targetId
    renameText.value = node.data?.label || ''
    isRenaming.value = true
  }
  hideMenu()
}

function saveRename(newLabel: string) {
  if (targetNodeId.value) {
    const node = findNode(targetNodeId.value)
    if (node) {
      node.data = { ...node.data, label: newLabel }
    }
  }
  isRenaming.value = false
  targetNodeId.value = null
}

function startChangeType() {
  if (!selectedNodeId.value) return

  const node = findNode(selectedNodeId.value)
  if (node) {
    targetNodeId.value = selectedNodeId.value
    currentNodeType.value = node.type || 'default'
    isChangingType.value = true
  }
  hideMenu()
}

function saveNodeType(newType: string) {
  if (targetNodeId.value) {
    const node = findNode(targetNodeId.value)
    if (node) {
      node.type = newType
    }
  }
  isChangingType.value = false
  targetNodeId.value = null
}

// ==========================================
// Keyboard Shortcuts
// ==========================================
function handleKeyDown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

  const isCtrlOrCmd = event.ctrlKey || event.metaKey

  // F2 - Rename Node
  if (event.key === 'F2') {
    const selectedNodes = getSelectedNodes.value
    if (selectedNodes.length > 0) {
      event.preventDefault()
      startRename(selectedNodes[0].id)
    }
  }

  // Ctrl + S - Export JSON
  if (isCtrlOrCmd && event.key.toLowerCase() === 's') {
    event.preventDefault()
    exportJSON()
  }

  // Ctrl + O - Import JSON
  if (isCtrlOrCmd && event.key.toLowerCase() === 'o') {
    event.preventDefault()
    triggerImportModal()
  }

  // Ctrl + 0 - Reset Zoom
  if (isCtrlOrCmd && event.key === '0') {
    event.preventDefault()
    resetZoom()
  }

  // Ctrl + C - Copy selection
  if (isCtrlOrCmd && event.key.toLowerCase() === 'c') {
    event.preventDefault()
    copySelectedElements()
  }

  // Ctrl + X - Cut selection
  if (isCtrlOrCmd && event.key.toLowerCase() === 'x') {
    event.preventDefault()
    cutSelectedElements()
  }

  // Ctrl + V - Paste selection
  if (isCtrlOrCmd && event.key.toLowerCase() === 'v') {
    event.preventDefault()
    pasteElements()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div
      class="page-wrapper"
      :class="{ dark: isDarkMode }"
      @contextmenu.prevent="showPaneMenu($event)"
      @click="hideMenu"
  >
    <!-- Top Bar Component -->
    <TopBar
        :is-dark-mode="isDarkMode"
        @export-json="exportJSON"
        @import-json="importJSON"
        @clear-graph="clearGraph"
        @reset-zoom="resetZoom"
        @toggle-dark-mode="toggleDarkMode"
        @copy="copySelectedElements"
        @cut="cutSelectedElements"
        @paste="pasteElements"
    />

    <!-- Context Menu Component -->
    <ContextMenu
        v-if="showContextMenu"
        :x="mousepos.x"
        :y="mousepos.y"
        :selected-node-id="selectedNodeId"
        @add-node="(type) => addNode(type)"
        @rename-node="startRename()"
        @change-type="startChangeType"
        @delete-node="deleteNode"
    />

    <!-- Rename Modal Component -->
    <RenameModal
        :is-open="isRenaming"
        :initial-value="renameText"
        @save="saveRename"
        @cancel="isRenaming = false"
    />

    <!-- Node Type Selector Modal Component -->
    <NodeTypeModal
        v-if="isChangingType"
        :current-type="currentNodeType"
        @select="saveNodeType"
        @cancel="isChangingType = false"
    />

    <!-- Vue Flow Container -->
    <div class="flow-container">
      <VueFlow
          v-model:nodes="nodes"
          v-model:edges="edges"
          :class="{ dark: isDarkMode }"
          @connect="onConnect"
          @pane-contextmenu.prevent="showPaneMenu"
          @node-contextmenu.prevent="showNodeMenu"
      />
    </div>
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

* {
  font-family: Arial, sans-serif;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}

.page-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.flow-container {
  flex: 1;
  width: 100%;
}
</style>