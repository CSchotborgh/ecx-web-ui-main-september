
<template>
  <div class="theme-toggle-container">
    <button 
      @click="toggleTheme"
      class="theme-toggle-button"
      :class="{ 'dark': isDark }"
      :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    >
      <div class="toggle-slider" :class="{ 'translate-x-6': isDark }">
        <component 
          :is="isDark ? MoonIcon : SunIcon" 
          class="w-4 h-4 text-gray-800 dark:text-gray-200"
        />
      </div>
    </button>
    <span class="theme-label">
      {{ isDark ? 'Dark' : 'Light' }}
    </span>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

// Simple icon components
const SunIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  `
}

const MoonIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
      <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  `
}

// Theme state - defaulting to dark theme to match EDGERACK design
const isDark = ref(true)

// Initialize theme from localStorage or default to dark
onMounted(() => {
  const savedTheme = localStorage.getItem('edgerack-theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    // Default to dark theme for EDGERACK industrial aesthetic
    isDark.value = true
    localStorage.setItem('edgerack-theme', 'dark')
  }
  
  // Apply theme to document
  applyTheme()
})

// Watch for theme changes and persist to localStorage
watch(isDark, (newValue) => {
  localStorage.setItem('edgerack-theme', newValue ? 'dark' : 'light')
  applyTheme()
})

// Toggle between themes
function toggleTheme() {
  isDark.value = !isDark.value
}

// Apply theme to document root
function applyTheme() {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
  }
}

// Expose reactive theme state for parent components
defineExpose({
  isDark
})
</script>

<style scoped>
.theme-toggle-container {
  @apply flex items-center space-x-3;
}

.theme-toggle-button {
  @apply relative inline-flex h-8 w-14 items-center justify-start rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  background: #374151;
  border: 1px solid #4b5563;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.theme-toggle-button.dark {
  background: #060511;
  border-color: #6b7280;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.toggle-slider {
  @apply flex h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ease-in-out items-center justify-center shadow-md ml-1;
  border: 1px solid #d1d5db;
}

.theme-toggle-button.dark .toggle-slider {
  background: #f3f4f6;
  border-color: #9ca3af;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.theme-label {
  @apply text-sm font-medium text-gray-300 transition-colors duration-200;
  font-family: 'Lato', sans-serif;
  font-weight: 400;
}

.theme-toggle-button:hover .theme-label {
  @apply text-white;
  font-weight: 600;
}
</style>
