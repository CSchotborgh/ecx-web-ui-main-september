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
      class="absolute right-0 top-full z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="theme-menu"
    >
      <button
        v-for="theme in themes"
        :key="theme.name"
        @click="selectTheme(theme.name)"
        class="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground"
        :class="{ 
          'bg-accent text-accent-foreground': themeStore.theme === theme.name 
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
import { SunIcon, MoonIcon, DesktopIcon } from 'vue-tabler-icons'

const themeStore = useThemeStore()

const showDropdown = ref(false)

const themes = computed(() => [
  { name: 'light', label: 'Light', icon: SunIcon },
  { name: 'dark', label: 'Dark', icon: MoonIcon },
  { name: 'super-dark', label: 'Super Dark', icon: MoonIcon }, // Assuming MoonIcon can represent super dark too
  { name: 'system', label: 'System', icon: DesktopIcon }
])

const currentIcon = computed(() => {
  switch (themeStore.theme) {
    case 'light':
      return SunIcon
    case 'dark':
      return MoonIcon
    case 'super-dark':
      return MoonIcon // Or a more specific icon if available
    case 'system':
      return DesktopIcon
    default:
      return SunIcon
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
/* Add any specific styles for the dropdown if needed,
   but ControlVue styling should handle most of it. */
.focus-ring {
  outline: none;
  box-shadow: 0 0 0 2px theme('colors.primary.DEFAULT'); /* Example using theme colors */
}

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

.animate-in {
  animation: animateIn 0.2s ease-out;
}

.fade-in-0 {
  opacity: 0;
}

.zoom-in-95 {
  transform: scale(0.95);
}

@keyframes animateIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>