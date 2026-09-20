<!-- src/views/CanvasView.vue -->
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { Node, Edge, Connection, GraphNode, NodeMouseEvent } from '@vue-flow/core'
import { VueFlow, addEdge, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'

import PersonNode from '@/components/PersonNode.vue'
import MarriageNode from '@/components/MarriageNode.vue'
import RenameModal from '@/components/RenameModal.vue'
import ContextMenu from '@/components/ContextMenu.vue'
import TopBar from '@/components/TopBar.vue'
import ToastNotification from '@/components/ToastNotification.vue'

import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { useRouter } from 'vue-router'
import { treeStore } from '@/store/useTreeStore'

// Success Toast Notification
const successMessage = ref<string | null>(null)
// Bind VueFlow directly to treeStore reactivity
const router = useRouter()
// ==========================================
// Toast / Error Message State
// ==========================================
const errorMessage = ref<string | null>(null)
function triggerSave() {
  treeStore.saveToStorage()
  showToast('Tree state saved locally!')
}

function showToast(msg: string) {
  successMessage.value = msg
  setTimeout(() => {
    successMessage.value = null
  }, 3000)
}
function showError(msg: string) {
  errorMessage.value = msg
}

// ==========================================
// Vue Flow Setup & Core State
// ==========================================
const { project, removeNodes, getSelectedNodes, findNode, fitView } = useVueFlow()

const nodes = ref(treeStore.nodes)
const edges = ref(treeStore.edges)

// Clipboard & UI State
const clipboard = ref<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] })
const pasteCount = ref(0)
const mousepos = ref({ x: 0, y: 0 })
const showContextMenu = ref(false)
const selectedNodeId = ref<string | null>(null)
const selectedNodeType = ref<string | undefined>(undefined)
const isDarkMode = ref(false)

// Keep reactive sync
watch(nodes, (val) => { treeStore.nodes = val }, { deep: true })
watch(edges, (val) => { treeStore.edges = val }, { deep: true })

// Update all nodes with dark mode state
watch(isDarkMode, (val) => {
  nodes.value.forEach(node => {
    if (node.data) {
      node.data.isDarkMode = val
    }
  })
})

const isRenaming = ref(false)
const renameText = ref('')
const targetNodeId = ref<string | null>(null)

// Mouse movement tracker for pinpoint node placement

// ==========================================
// Import / Export (ZIP & JSON)
// ==========================================
async function exportToZip() {
  const zip = new JSZip()
  const imgFolder = zip.folder('photos')

  // Clone nodes to avoid mutating live reactive state
  const nodesCopy = JSON.parse(JSON.stringify(treeStore.nodes))

  nodesCopy.forEach((node: any, index: number) => {
    if (node.data?.photoUrl && node.data.photoUrl.startsWith('data:image')) {
      // Extract base64 raw string and mime format
      const matches = node.data.photoUrl.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/)
      if (matches) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1]
        const base64Data = matches[2]
        const fileName = `person_${node.id || index}.${ext}`

        // Add binary image to ZIP folder
        imgFolder?.file(fileName, base64Data, { base64: true })

        // Replace bulky Base64 URL with filename reference
        node.data.photoFileName = fileName
        delete node.data.photoUrl
      }
    }
  })

  // Add JSON topology file
  zip.file('tree.json', JSON.stringify({ nodes: nodesCopy, edges: treeStore.edges }, null, 2))

  // Generate and download ZIP file
  const blob = await zip.generateAsync({ type: 'blob' })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `family-tree-${new Date().toISOString().slice(0, 10)}.zip`
  link.click()
  URL.revokeObjectURL(link.href)
}

async function importZipFile(file: File) {
  try {
    const zip = await JSZip.loadAsync(file)

    // 1. Locate the JSON data file inside the ZIP archive
    const jsonZipFile = zip.file('tree.json') || zip.file('data.json') || Object.values(zip.files).find(f => f.name.endsWith('.json'))

    if (!jsonZipFile) {
      console.warn('Import failed: Invalid ZIP archive - No JSON data file found.')
      return
    }

    const jsonText = await jsonZipFile.async('text')
    const treeData = JSON.parse(jsonText)

    if (!treeData.nodes) {
      console.warn('Import failed: Invalid JSON structure - Missing nodes array.')
      return
    }

    // Helper: Determine MIME type based on file extension
    const getMimeType = (filename: string) => {
      const ext = filename.split('.').pop()?.toLowerCase()
      if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
      if (ext === 'webp') return 'image/webp'
      if (ext === 'svg') return 'image/svg+xml'
      return 'image/png'
    }

    // 2. Process nodes and extract/attach image data
    for (const node of treeData.nodes) {
      if (!node.data) continue

      // Scenario A: Image filename is explicitly stored in node data
      const imageName = node.data.photoFileName || node.data.photoName

      if (imageName) {
        // Search across the entire ZIP archive for matching image filename (case-insensitive)
        const matchedZipEntry = Object.values(zip.files).find(
            (f) => !f.dir && f.name.toLowerCase().endsWith(imageName.toLowerCase())
        )

        if (matchedZipEntry) {
          const base64Data = await matchedZipEntry.async('base64')
          const mimeType = getMimeType(matchedZipEntry.name)
          node.data.photoUrl = `data:${mimeType};base64,${base64Data}`
        } else {
          console.log(`Image "${imageName}" not found in ZIP archive for node ${node.id}`)
        }
      }
      // Scenario B: photoUrl points to a relative file path inside the ZIP (e.g. "photos/person_1.jpg")
      else if (node.data.photoUrl && !node.data.photoUrl.startsWith('data:') && !node.data.photoUrl.startsWith('http')) {
        const relativePath = node.data.photoUrl.replace(/^\.\//, '')
        const matchedZipEntry = zip.file(relativePath) || Object.values(zip.files).find(
            (f) => !f.dir && f.name.toLowerCase().endsWith(relativePath.toLowerCase())
        )

        if (matchedZipEntry) {
          const base64Data = await matchedZipEntry.async('base64')
          const mimeType = getMimeType(matchedZipEntry.name)
          node.data.photoUrl = `data:${mimeType};base64,${base64Data}`
        } else {
          console.log(`Image at path "${relativePath}" not found in ZIP archive for node ${node.id}`)
        }
      }
    }

    // 3. Update the global tree store state
    treeStore.nodes = treeData.nodes
    treeStore.edges = treeData.edges || []
    treeStore.saveToStorage()

    console.log('ZIP Archive imported successfully!')
  } catch (error) {
    console.error('Failed to import ZIP archive:', error)
  }
}

function clearGraph() {
  nodes.value = []
  edges.value = []
}

// ==========================================
// Clipboard Operations & Shortcuts
// ==========================================
function copySelected() {
  const selected = getSelectedNodes.value
  if (!selected.length) return

  const selectedIds = new Set(selected.map((n) => n.id))
  const filteredEdges = (edges.value as Edge[]).filter(e => selectedIds.has(e.source) && selectedIds.has(e.target))

  clipboard.value = {
    nodes: JSON.parse(JSON.stringify(selected)),
    edges: JSON.parse(JSON.stringify(filteredEdges)) as Edge[]
  }
  pasteCount.value = 0
}

function cutSelected() {
  const selected = getSelectedNodes.value
  if (!selected.length) return
  copySelected()
  removeNodes(selected.map((n) => n.id))
}

function pasteClipboard() {
  if (!clipboard.value.nodes.length) return

  pasteCount.value++
  const offset = pasteCount.value * 30
  const idMap = new Map<string, string>()
  const newNodes: Node[] = []

  nodes.value.forEach((n) => ((n as any).selected = false))
  edges.value.forEach((e) => ((e as any).selected = false))

  clipboard.value.nodes.forEach((node) => {
    const newId = `${node.type || 'node'}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    idMap.set(node.id, newId)

    newNodes.push({
      ...JSON.parse(JSON.stringify(node)),
      id: newId,
      position: { x: node.position.x + offset, y: node.position.y + offset },
      selected: true,
    })
  })

  const edgesArray = clipboard.value.edges as Edge[]
  const mapped = edgesArray.map((edge) => {
    const newSource = idMap.get(edge.source)
    const newTarget = idMap.get(edge.target)
    if (!newSource || !newTarget) return null
    return {
      ...JSON.parse(JSON.stringify(edge)),
      id: `e_${newSource}-${newTarget}_${Date.now()}`,
      source: newSource,
      target: newTarget,
      selected: true,
    }
  })
  const newEdges = mapped.filter((e): e is Edge => e !== null)

  const nodesArray = nodes.value as Node[]
  const edgesArray2 = edges.value as Edge[]
  nodesArray.push(...newNodes)
  edgesArray2.push(...newEdges)
  ;(nodes as any).value = nodesArray
  ;(edges as any).value = edgesArray2
}

function resetView() {
  setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50)
}

function handleKeyDown(event: KeyboardEvent) {
  if (['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) return
  const isCmdOrCtrl = event.metaKey || event.ctrlKey

  // Ctrl + S -> Save locally to persistent storage
  if (isCmdOrCtrl && event.key.toLowerCase() === 's') {
    event.preventDefault()
    triggerSave()
    return
  }

  // Ctrl + E -> Export to .ZIP package
  if (isCmdOrCtrl && event.key.toLowerCase() === 'e') {
    event.preventDefault()
    exportToZip()
    return
  }

  // F2 Rename shortcut
  if (event.key === 'F2') {
    event.preventDefault()
    const selected = getSelectedNodes.value
    if (selected.length > 0) startRename(selected[0]?.id)
    return
  }

  // Clipboard operations
  if (isCmdOrCtrl && event.key.toLowerCase() === 'c') {
    event.preventDefault()
    copySelected()
  } else if (isCmdOrCtrl && event.key.toLowerCase() === 'x') {
    event.preventDefault()
    cutSelected()
  } else if (isCmdOrCtrl && event.key.toLowerCase() === 'v') {
    event.preventDefault()
    pasteClipboard()
  } else if (isCmdOrCtrl && (event.key === '0' || event.code === 'Digit0')) {
    event.preventDefault()
    resetView()
  }
}

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))

// ==========================================
// Connection Logic
// ==========================================
function onConnect(connection: Connection) {
  if (connection.source === connection.target) return

  const sourceNode = findNode(connection.source)
  const targetNode = findNode(connection.target)
  if (!sourceNode || !targetNode) return

  const sourceHandle = connection.sourceHandle || ''
  const targetHandle = connection.targetHandle || ''
  const sourceIsSide = sourceHandle.includes('left') || sourceHandle.includes('right')
  const targetIsSide = targetHandle.includes('left') || targetHandle.includes('right')

  const isFromMarriageBottom = sourceNode.type === 'marriage' && sourceHandle === 'bottom'

  if (isFromMarriageBottom) {
    if (targetNode.type !== 'person' || targetHandle !== 'top') {
      showError('Children can only be connected to the top side of a Person node.')
      return
    }

    const exists = edges.value.some((e) => e.source === connection.source && e.target === connection.target)
    if (exists) return

    const newEdges = addEdge({ ...connection, type: 'smoothstep' }, edges.value as any) as Edge[]
    ;(edges as any).value = newEdges
    return
  }

  if (targetNode.type === 'marriage' && targetHandle === 'bottom') {
    showError('The bottom handle of a marriage node is reserved for children connections.')
    return
  }

  const involvesMarriageNode = sourceNode.type === 'marriage' || targetNode.type === 'marriage'

  if (involvesMarriageNode || sourceIsSide || targetIsSide) {
    if (sourceNode.type !== 'person' || targetNode.type !== 'person') {
      showError('A marriage connection can only be established directly between two Person nodes.')
      return
    }

    if (!sourceIsSide || !targetIsSide) {
      showError('Marriage connections are only allowed between the SIDE handles of Person nodes.')
      return
    }

    const marriageId = `marriage_${sourceNode.id}_${targetNode.id}_${Date.now()}`
    const midX = (sourceNode.position.x + targetNode.position.x) / 2 + 45
    const midY = (sourceNode.position.y + targetNode.position.y) / 2 + 5

    const newMarriageNode: Node = {
      id: marriageId,
      type: 'marriage',
      position: { x: midX, y: midY },
      data: { active: true, isDarkMode: isDarkMode.value },
    }

    const sourceIsLeft = sourceNode.position.x < targetNode.position.x

    const edgeA: Edge = {
      id: `e_${sourceNode.id}-${marriageId}`,
      source: sourceNode.id,
      sourceHandle: connection.sourceHandle,
      target: marriageId,
      targetHandle: sourceIsLeft ? 'left' : 'right',
      type: 'smoothstep',
    }

    const edgeB: Edge = {
      id: `e_${targetNode.id}-${marriageId}`,
      source: targetNode.id,
      sourceHandle: connection.targetHandle,
      target: marriageId,
      targetHandle: sourceIsLeft ? 'right' : 'left',
      type: 'smoothstep',
    }

    ;(nodes as any).value = [...(nodes.value as Node[]), newMarriageNode]
    ;(edges as any).value = [...(edges.value as Edge[]), edgeA, edgeB]
    return
  }

  ;(edges as any).value = addEdge({ ...connection, type: 'smoothstep' }, edges.value as any) as Edge[]
}

// ==========================================
// Canvas Helpers & Handlers
// ==========================================
function showPaneContextMenu(event: MouseEvent) {
  event.preventDefault()
  mousepos.value = { x: event.clientX, y: event.clientY }
  selectedNodeId.value = null
  selectedNodeType.value = undefined
  showContextMenu.value = true
}

function showNodeContextMenu(event: NodeMouseEvent) {
  const mouseEvent = event.event as MouseEvent
  mouseEvent.preventDefault()
  mouseEvent.stopPropagation()

  mousepos.value = { x: mouseEvent.clientX, y: mouseEvent.clientY }
  selectedNodeId.value = event.node.id
  selectedNodeType.value = event.node.type

  nodes.value.forEach((n) => ((n as any).selected = n.id === event.node.id))
  showContextMenu.value = true
}

function hideMenu() {
  showContextMenu.value = false
}

function addNode(type: string = 'person') {
  const container = document.querySelector('.flow-container')
  const bounds = container?.getBoundingClientRect() || { left: 0, top: 0 }

  const position = project({
    x: mousepos.value.x - bounds.left,
    y: mousepos.value.y - bounds.top,
  })

  const newId = (nodes.value.length + 1).toString()
  const newNode: Node = {
    id: newId,
    type: type,
    position,
    data: { firstName: `Person ${newId}`, isAlive: true, isDarkMode: isDarkMode.value },
  }
  ;(nodes as any).value = [...(nodes.value as Node[]), newNode]
  hideMenu()
}

function deleteNode() {
  if (selectedNodeId.value) removeNodes([selectedNodeId.value])
  hideMenu()
}

function toggleMarriage() {
  if (!selectedNodeId.value) return
  const node = findNode(selectedNodeId.value)
  if (node && node.type === 'marriage') {
    node.data = node.data || {}
    node.data.active = !node.data.active
  }
  hideMenu()
}

function startRename(id?: string) {
  const targetId = id || selectedNodeId.value
  if (!targetId) return
  const node = findNode(targetId)
  if (node) {
    targetNodeId.value = targetId
    renameText.value = node.data?.firstName || ''
    isRenaming.value = true
  }
  hideMenu()
}

function saveRename(newLabel: string) {
  if (targetNodeId.value) {
    const node = findNode(targetNodeId.value)
    if (node) node.data = { ...node.data, firstName: newLabel }
  }
  isRenaming.value = false
  targetNodeId.value = null
}

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
}

watch(
    isDarkMode,
    (dark) => {
      if (dark) {
        document.body.classList.add('dark', 'dark-mode')
      } else {
        document.body.classList.remove('dark', 'dark-mode')
      }
    },
    { immediate: true }
)
function openPersonDetails() {
  if (selectedNodeId.value && selectedNodeType.value === 'person') {
    router.push(`/person/${selectedNodeId.value}`)
    hideMenu()
  }
}
</script>

<template>
  <div class="page-wrapper" :class="{ dark: isDarkMode }" @click="hideMenu">
    <ToastNotification :message="errorMessage" @close="errorMessage = null" />

    <TopBar
        :is-dark-mode="isDarkMode"
        @toggle-dark-mode="toggleDarkMode"
        @cut="cutSelected"
        @copy="copySelected"
        @paste="pasteClipboard"
        @reset-view="resetView"
        @reset-zoom="resetView"
        @export-json="exportToZip"
        @clear-graph="clearGraph"
        @import-file="importZipFile"
    />

    <ContextMenu
        v-if="showContextMenu"
        :x="mousepos.x"
        :y="mousepos.y"
        :selected-node-id="selectedNodeId"
        :selected-node-type="selectedNodeType"
        :is-dark-mode="isDarkMode"
        @add-node="(type) => addNode(type || 'person')"
        @rename-node="startRename()"
        @edit-details="openPersonDetails"
        @toggle-marriage="toggleMarriage"
        @delete-node="deleteNode"
    />

    <RenameModal
        :is-open="isRenaming"
        :initial-value="renameText"
        @save="saveRename"
        @cancel="isRenaming = false"
    />

    <div class="flow-container">
      <VueFlow
          v-model:nodes="nodes"
          v-model:edges="edges"
          :class="{ dark: isDarkMode }"
          @connect="onConnect"
          @pane-context-menu="showPaneContextMenu"
          @node-context-menu="showNodeContextMenu"
      >
        <Background variant="dots" :gap="20" :size="1.5" :pattern-color="isDarkMode ? '#475569' : '#cbd5e1'" />

        <template #node-person="personProps">
          <PersonNode v-bind="personProps" />
        </template>

        <template #node-marriage="marriageProps">
          <MarriageNode v-bind="marriageProps" />
        </template>
      </VueFlow>
    </div>
  </div>
</template>

<style scoped>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.page-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #f8fafc;
  color: #0f172a;
}

.page-wrapper.dark {
  background: #0f172a;
  color: #f8fafc;
}

.flow-container {
  flex: 1;
  width: 100%;
}
</style>