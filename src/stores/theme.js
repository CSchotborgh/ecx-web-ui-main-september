
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentTheme: 'super-dark' // 'super-dark', 'dark', 'light'
  }),
  
  getters: {
    isSuperDark: (state) => state.currentTheme === 'super-dark',
    isDark: (state) => state.currentTheme === 'dark',
    isLight: (state) => state.currentTheme === 'light',
    themeClass: (state) => {
      switch (state.currentTheme) {
        case 'light':
          return 'theme-light'
        case 'dark':
          return 'theme-dark'
        case 'super-dark':
        default:
          return 'theme-super-dark'
      }
    }
  },
  
  actions: {
    setTheme(theme) {
      this.currentTheme = theme
      this.applyThemeToDocument()
    },
    
    toggleTheme() {
      const themes = ['super-dark', 'dark', 'light']
      const currentIndex = themes.indexOf(this.currentTheme)
      const nextIndex = (currentIndex + 1) % themes.length
      this.setTheme(themes[nextIndex])
    },
    
    applyThemeToDocument() {
      const html = document.documentElement
      html.classList.remove('theme-super-dark', 'theme-dark', 'theme-light')
      html.classList.add(this.themeClass)
      
      if (this.currentTheme === 'dark') {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    }
  }
})
