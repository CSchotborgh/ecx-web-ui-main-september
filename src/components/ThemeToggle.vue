<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="btn-ghost btn-sm px-2 py-2 h-8 w-8 focus-ring"
      :title="currentTheme"
      aria-label="Toggle theme"
      aria-expanded="showDropdown"
      aria-haspopup="true"
    >
      <component :is="currentIcon" class="h-4 w-4" />
      <span class="sr-only">Toggle theme</span>
    </button>

    <div 
      v-show="showDropdown" 
      class="dropdown-content absolute right-0 top-full mt-1 animate-in fade-in zoom-in"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="theme-menu"
    >
      <button
        v-for="theme in themes"
        :key="theme.name"
        @click="selectTheme(theme.name)"
        class="dropdown-item"
        :class="{ 
          'bg-muted text-foreground': themeStore.theme === theme.name 
        }"
        role="menuitem"
        :aria-checked="themeStore.theme === theme.name"
      >
        <component :is="theme.icon" class="mr-2 h-4 w-4" />
        <span class="flex-1">{{ theme.label }}</span>
        <svg 
          v-if="themeStore.theme === theme.name" 
          class="ml-2 h-4 w-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M5 13l4 4L19 7"
          />
        </svg>
      </button>
    </div>

    <!-- Backdrop -->
    <div 
      v-if="showDropdown"
      @click="closeDropdown"
      class="fixed inset-0 z-40"
      aria-hidden="true"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useThemeStore } from '@/stores/theme.js'
import { IconSun, IconMoon, IconMonitor } from 'vue-tabler-icons'

const themeStore = useThemeStore()

const showDropdown = ref(false)

const themes = computed(() => [
  { name: 'light', label: 'Light', icon: IconSun },
  { name: 'dark', label: 'Dark', icon: IconMoon },
  { name: 'super-dark', label: 'Super Dark', icon: IconMoon },
  { name: 'system', label: 'System', icon: IconMonitor }
])

const currentIcon = computed(() => {
  switch (themeStore.currentTheme) {
    case 'light':
      return IconSun
    case 'dark':
      return IconMoon
    case 'super-dark':
      return IconMoon
    case 'system':
      return IconMonitor
    default:
      return IconSun
  }
})

const currentTheme = computed(() => {
  const theme = themes.value.find(t => t.name === themeStore.theme)
  return theme ? theme.label : 'System'
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const selectTheme = (themeName) => {
  themeStore.setTheme(themeName);
  showDropdown.value = false;
};

const closeDropdown = () => {
  showDropdown.value = false;
};
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>