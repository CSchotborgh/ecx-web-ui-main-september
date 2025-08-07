
<template>
  <div class="theme-toggle-container">
    <button
      @click="themeStore.toggleTheme()"
      class="theme-toggle-btn"
      :title="`Switch to ${getNextTheme()} mode`"
    >
      <div class="theme-icon">
        <svg v-if="themeStore.isSuperDark" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
        <svg v-else-if="themeStore.isDark" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
        </svg>
        <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </div>
      <span class="theme-label">{{ getCurrentThemeLabel() }}</span>
    </button>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const getCurrentThemeLabel = () => {
  switch (themeStore.currentTheme) {
    case 'super-dark':
      return 'Super Dark'
    case 'dark':
      return 'Dark'
    case 'light':
      return 'Light'
    default:
      return 'Theme'
  }
}

const getNextTheme = () => {
  switch (themeStore.currentTheme) {
    case 'super-dark':
      return 'Dark'
    case 'dark':
      return 'Light'
    case 'light':
      return 'Super Dark'
    default:
      return 'Dark'
  }
}
</script>

<style scoped>
.theme-toggle-container {
  @apply flex items-center;
}

.theme-toggle-btn {
  @apply flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 text-gray-300 hover:text-white;
  background: transparent;
  border: 1px solid transparent;
}

.theme-toggle-btn:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
}

.theme-icon {
  @apply flex items-center justify-center;
}

.theme-label {
  @apply text-sm font-medium;
}
</style>
