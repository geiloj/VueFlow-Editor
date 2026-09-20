<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { useRouter } from 'vue-router'

const props = defineProps<{
  id: string
  data: {
    firstName?: string
    lastName?: string
    birthDate?: string
    deathDate?: string
    isAlive?: boolean
    photoUrl?: string
    photoFileName?: string
    // Falls das Bild als Blob oder File-Objekt im Node gespeichert ist
    photoBlob?: Blob | File
  }
}>()

const router = useRouter()

function extractYear(dateStr?: string): string {
  if (!dateStr) return ''
  return dateStr.split('-')[0]
}

// Ermittelt die korrekte Bild-Quelle
const resolvedPhotoUrl = computed(() => {
  // 1. Wenn bereits eine gueltige photoUrl (Base64 oder Blob-URL) existiert:
  if (props.data.photoUrl && (props.data.photoUrl.startsWith('data:') || props.data.photoUrl.startsWith('blob:'))) {
    return props.data.photoUrl
  }

  // 2. Falls eine Blob-Datei vorliegt, erstelle temporär eine Object-URL
  if (props.data.photoBlob) {
    return URL.createObjectURL(props.data.photoBlob)
  }

  // 3. Fallback auf photoUrl oder photoFileName
  if (props.data.photoUrl) {
    return props.data.photoUrl
  }

  if (props.data.photoFileName) {
    return `images/${props.data.photoFileName}`
  }

  return ''
})

const lifespan = computed(() => {
  const birth = extractYear(props.data.birthDate)
  const death = extractYear(props.data.deathDate)

  if (!birth && !death) return ''
  if (birth && !death) return props.data.isAlive === false ? `${birth} - ?` : `*${birth}`
  return `${birth} - ${death}`
})

function openDetail() {
  router.push(`/person/${props.id}`)
}
</script>

<template>
  <div class="person-node" @dblclick="openDetail">
    <Handle id="top" type="target" :position="Position.Top" />
    <Handle id="left" type="source" :position="Position.Left" />
    <Handle id="left-target" type="target" :position="Position.Left" />
    <Handle id="right" type="source" :position="Position.Right" />
    <Handle id="right-target" type="target" :position="Position.Right" />

    <div class="node-card">
      <div v-if="resolvedPhotoUrl" class="photo-wrapper">
        <img :src="resolvedPhotoUrl" alt="Foto" class="node-photo" />
      </div>

      <div class="node-info">
        <div class="name-line">
          <span class="full-name">
            {{ data.firstName || 'Vorname' }} {{ data.lastName || 'Nachname' }}
          </span>
          <!-- Kreuz-Symbol wenn Person verstorben ist -->
          <span v-if="data.isAlive === false" class="death-cross" title="Verstorben">†</span>
        </div>

        <div v-if="lifespan" class="lifespan">
          {{ lifespan }}
        </div>
      </div>
    </div>

    <Handle id="bottom" type="source" :position="Position.Bottom" />
  </div>
</template>

<style scoped>
.person-node {
  padding: 8px;
  background: #ffffff;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  min-width: 140px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.node-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.photo-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #cbd5e1;
}

.node-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.name-line {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  font-size: 13px;
}

.death-cross {
  color: #ef4444;
  font-weight: bold;
}

.lifespan {
  font-size: 11px;
  color: #64748b;
  text-align: center;
}
</style>