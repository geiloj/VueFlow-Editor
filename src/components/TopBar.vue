<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{
  isDarkMode?: boolean
  hideEditMenu?: boolean
  hideClearOption?: boolean
}>()

const emit = defineEmits<{
  (e: 'save-local'): void
  (e: 'export-zip'): void
  (e: 'import-file', file: File): void
  (e: 'import-json', data: string): void
  (e: 'clear-graph'): void
  (e: 'reset-zoom'): void
  (e: 'toggle-dark-mode'): void
  (e: 'copy'): void
  (e: 'cut'): void
  (e: 'paste'): void
}>()

const activeMenu = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

function toggleMenu(name: string) {
  activeMenu.value = activeMenu.value === name ? null : name
}

function closeMenus() {
  activeMenu.value = null
}

function triggerFileInput() {
  fileInputRef.value?.click()
  closeMenus()
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Check if file is a ZIP archive
  if (file.name.endsWith('.zip')) {
    emit('import-file', file)
  } else {
    // Standard JSON text reading
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content) {
        emit('import-json', content)
      }
    }
    reader.readAsText(file)
  }

  target.value = ''
}

function handleSaveLocal() {
  emit('save-local')
  closeMenus()
}

function handleExportZip() {
  emit('export-zip')
  closeMenus()
}

function handleClear() {
  emit('clear-graph')
  closeMenus()
}

function handleResetZoom() {
  emit('reset-zoom')
  closeMenus()
}

function handleCopy() {
  emit('copy')
  closeMenus()
}

function handleCut() {
  emit('cut')
  closeMenus()
}

function handlePaste() {
  emit('paste')
  closeMenus()
}

function handleGlobalClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.top-bar')) {
    closeMenus()
  }
}

onMounted(() => {
  window.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  window.removeEventListener('click', handleGlobalClick)
})
</script>

<template>
  <div class="top-bar" :class="{ dark: isDarkMode }" @click.stop>
    <div class="left-section">
      <!-- App Title -->
      <div class="app-title">
        VueFlow Editor
      </div>

      <!-- Hidden Input for File Import -->
      <input
          ref="fileInputRef"
          type="file"
          accept=".zip,.json"
          style="display: none"
          @change="handleFileUpload"
      />

      <!-- Menu Items -->
      <div class="menu-items">
        <!-- File Menu -->
        <div class="menu-group">
          <button
              class="menu-btn"
              :class="{ active: activeMenu === 'file' }"
              @click="toggleMenu('file')"
          >
            File
          </button>
          <div v-if="activeMenu === 'file'" class="dropdown">
            <div class="dropdown-item" @click="handleSaveLocal">
              <span>Save Local State</span>
              <span class="shortcut">Ctrl+S</span>
            </div>
            <div class="dropdown-item" @click="triggerFileInput">
              <span>Import ZIP...</span>
              <span class="shortcut">Ctrl+O</span>
            </div>
            <div class="dropdown-item" @click="handleExportZip">
              <span>Export ZIP...</span>
              <span class="shortcut">Ctrl+E</span>
            </div>
            <div class="divider"></div>
            <div v-if="!hideClearOption" class="dropdown-item danger" @click="handleClear">
              <span>Clear Canvas</span>
            </div>
          </div>
        </div>

        <!-- Edit Menu -->
        <div v-if="!hideEditMenu" class="menu-group">
          <button
              class="menu-btn"
              :class="{ active: activeMenu === 'edit' }"
              @click="toggleMenu('edit')"
          >
            Edit
          </button>
          <div v-if="activeMenu === 'edit'" class="dropdown">
            <div class="dropdown-item" @click="handleCopy">
              <span>Copy</span>
              <span class="shortcut">Ctrl+C</span>
            </div>
            <div class="dropdown-item" @click="handleCut">
              <span>Cut</span>
              <span class="shortcut">Ctrl+X</span>
            </div>
            <div class="dropdown-item" @click="handlePaste">
              <span>Paste</span>
              <span class="shortcut">Ctrl+V</span>
            </div>
          </div>
        </div>

        <!-- View Menu -->
        <div class="menu-group">
          <button
              class="menu-btn"
              :class="{ active: activeMenu === 'view' }"
              @click="toggleMenu('view')"
          >
            View
          </button>
          <div v-if="activeMenu === 'view'" class="dropdown">
            <div class="dropdown-item" @click="handleResetZoom">
              <span>Reset Zoom & View</span>
              <span class="shortcut">Ctrl+0</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Section: Professional SVG Theme Toggle -->
    <div class="right-section">
      <div
          class="theme-toggle"
          :class="{ 'is-dark': isDarkMode }"
          role="button"
          tabindex="0"
          title="Toggle dark mode"
          @click="emit('toggle-dark-mode')"
          @keydown.enter.prevent="emit('toggle-dark-mode')"
          @keydown.space.prevent="emit('toggle-dark-mode')"
      >
        <!-- Sun Icon -->
        <svg
            class="theme-icon sun"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>

        <!-- Moon Icon -->
        <svg
            class="theme-icon moon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f3f3f3;
  border-bottom: 1px solid #dcdcdc;
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
  user-select: none;
  box-sizing: border-box;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.top-bar.dark {
  background-color: #1f1f1f;
  border-bottom-color: #333333;
}

.left-section,
.right-section,
.menu-items {
  display: flex;
  align-items: center;
}

.app-title {
  font-weight: bold;
  color: #333;
  margin-right: 16px;
  padding-right: 12px;
  border-right: 1px solid #dcdcdc;
}

.top-bar.dark .app-title {
  color: #e0e0e0;
  border-right-color: #333333;
}

.menu-items {
  gap: 2px;
}

.menu-group {
  position: relative;
}

.menu-btn {
  background: none;
  border: none;
  padding: 4px 10px;
  font-size: 13px;
  color: #333;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.menu-btn:hover,
.menu-btn.active {
  background-color: #e2e2e2;
}

.top-bar.dark .menu-btn {
  color: #ccc;
}

.top-bar.dark .menu-btn:hover,
.top-bar.dark .menu-btn.active {
  background-color: #333333;
  color: #fff;
}

/* --- Professional SVG Switch Toggle --- */
.theme-toggle {
  position: relative;
  width: 44px;
  height: 22px;
  background-color: #e2e8f0;
  border-radius: 12px;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.25s ease;
  outline: none;
}

.theme-toggle:focus-visible {
  box-shadow: 0 0 0 2px #0078d4;
}

.theme-icon {
  width: 14px;
  height: 14px;
  z-index: 1;
  transition: color 0.25s ease, opacity 0.25s ease;
}

.theme-icon.sun {
  color: #f59e0b;
  margin-left: 2px;
}

.theme-icon.moon {
  color: #94a3b8;
  margin-right: 2px;
}

/* Sliding Circle Handle */
.theme-toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Active Dark Mode Toggle States */
.theme-toggle.is-dark {
  background-color: #334155;
}

.theme-toggle.is-dark::after {
  transform: translateX(22px);
  background-color: #0f172a;
}

.theme-toggle.is-dark .theme-icon.sun {
  color: #64748b;
}

.theme-toggle.is-dark .theme-icon.moon {
  color: #38bdf8;
}

/* Dropdown styling */
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 2px;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  min-width: 180px;
  z-index: 2000;
  padding: 4px 0;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.top-bar.dark .dropdown {
  background-color: #252525;
  border-color: #3a3a3a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.dropdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 14px;
  cursor: pointer;
  color: #222;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.dropdown-item:hover {
  background-color: #0078d4;
  color: white;
}

.dropdown-item.danger:hover {
  background-color: #d83b01;
  color: white;
}

.top-bar.dark .dropdown-item {
  color: #ddd;
}

.shortcut {
  font-size: 11px;
  opacity: 0.7;
  margin-left: 16px;
}

.divider {
  height: 1px;
  background-color: #e5e5e5;
  transition: background-color 0.2s ease;
}

.top-bar.dark .divider {
  background-color: #333333;
}
</style>