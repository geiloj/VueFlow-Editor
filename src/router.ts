// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import CanvasView from '@/views/CanvasView.vue'
import PersonDetailView from '@/views/PersonDetailView.vue'

const routes = [
    { path: '/', name: 'canvas', component: CanvasView },
    { path: '/person/:id', name: 'person-detail', component: PersonDetailView, props: true }
]

export const router = createRouter({
    // Dynamischer Base-Pfad statt starrer Root '/'
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})