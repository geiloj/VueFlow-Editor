// src/store/useTreeStore.ts
import { reactive, watch } from 'vue'
import type { Node, Edge } from '@vue-flow/core'

export interface PersonData {
    firstName?: string
    lastName?: string
    country?: string
    birthDate?: string
    isAlive?: boolean
    deathDate?: string
    description?: string
    photoUrl?: string
    photoFileName?: string
}

const STORAGE_KEY = 'vueflow_family_tree_data'

function loadFromStorage(): { nodes: Node[]; edges: Edge[] } | null {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
        try {
            return JSON.parse(data)
        } catch {
            return null
        }
    }
    return null
}

const initialData = loadFromStorage()

export const treeStore = reactive({
    nodes: (initialData?.nodes || [
        { id: '1', type: 'person', position: { x: 150, y: 100 }, data: { firstName: 'Parent A', isAlive: true } },
        { id: '2', type: 'person', position: { x: 450, y: 100 }, data: { firstName: 'Parent B', isAlive: true } },
        { id: '3', type: 'person', position: { x: 300, y: 300 }, data: { firstName: 'Child 1', isAlive: true } },
    ]) as Node[],
    edges: (initialData?.edges || []) as Edge[],

    getNode(id: string) {
        return this.nodes.find((n) => n.id === id)
    },

    updatePersonData(id: string, updatedData: PersonData) {
        const node = this.getNode(id)
        if (node) {
            node.data = { ...node.data, ...updatedData }
            this.saveToStorage()
        }
    },

    saveToStorage() {
        const dataToSave = JSON.stringify({ nodes: this.nodes, edges: this.edges })
        localStorage.setItem(STORAGE_KEY, dataToSave)
    }
})

// Automatically keep persistent storage updated when nodes or edges change
watch(
    () => [treeStore.nodes, treeStore.edges],
    () => {
        treeStore.saveToStorage()
    },
    { deep: true }
)