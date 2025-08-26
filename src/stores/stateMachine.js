
import { defineStore } from 'pinia'

export const useStateMachineStore = defineStore('stateMachine', {
  state: () => ({
    currentState: 'idle',
    previousState: null,
    states: {
      idle: {
        on: {
          LOGIN_START: 'authenticating',
          NAVIGATE: 'navigating',
          LOAD_DATA: 'loading'
        }
      },
      authenticating: {
        on: {
          LOGIN_SUCCESS: 'authenticated',
          LOGIN_FAILURE: 'idle',
          CANCEL: 'idle'
        }
      },
      authenticated: {
        on: {
          LOGOUT: 'idle',
          NAVIGATE: 'navigating',
          LOAD_DATA: 'loading',
          ERROR: 'error'
        }
      },
      navigating: {
        on: {
          NAVIGATION_COMPLETE: 'authenticated',
          ERROR: 'error'
        }
      },
      loading: {
        on: {
          LOAD_SUCCESS: 'authenticated',
          LOAD_FAILURE: 'error',
          CANCEL: 'authenticated'
        }
      },
      error: {
        on: {
          RETRY: 'loading',
          RESET: 'idle',
          DISMISS: 'authenticated'
        }
      }
    },
    context: {},
    history: []
  }),

  getters: {
    canTransition: (state) => (event) => {
      const currentStateConfig = state.states[state.currentState]
      return currentStateConfig && currentStateConfig.on && currentStateConfig.on[event]
    },
    
    isInState: (state) => (stateName) => {
      return state.currentState === stateName
    },
    
    getAvailableTransitions: (state) => {
      const currentStateConfig = state.states[state.currentState]
      return currentStateConfig?.on ? Object.keys(currentStateConfig.on) : []
    }
  },

  actions: {
    transition(event, payload = {}) {
      const currentStateConfig = this.states[this.currentState]
      
      if (!currentStateConfig || !currentStateConfig.on || !currentStateConfig.on[event]) {
        console.warn(`Invalid transition: ${event} from state ${this.currentState}`)
        return false
      }

      const nextState = currentStateConfig.on[event]
      
      // Store previous state and update history
      this.previousState = this.currentState
      this.history.push({
        from: this.currentState,
        to: nextState,
        event,
        timestamp: new Date().toISOString(),
        payload
      })

      // Update context with payload
      if (payload) {
        this.context = { ...this.context, ...payload }
      }

      // Transition to next state
      this.currentState = nextState
      
      console.log(`State transition: ${this.previousState} -> ${this.currentState} (${event})`)
      return true
    },

    reset() {
      this.currentState = 'idle'
      this.previousState = null
      this.context = {}
      this.history = []
    },

    goToPreviousState() {
      if (this.previousState) {
        const temp = this.currentState
        this.currentState = this.previousState
        this.previousState = temp
      }
    },

    updateContext(updates) {
      this.context = { ...this.context, ...updates }
    },

    // Convenience methods for common transitions
    startLogin(credentials) {
      return this.transition('LOGIN_START', { credentials })
    },

    loginSuccess(user) {
      return this.transition('LOGIN_SUCCESS', { user })
    },

    loginFailure(error) {
      return this.transition('LOGIN_FAILURE', { error })
    },

    logout() {
      return this.transition('LOGOUT')
    },

    startNavigation(route) {
      return this.transition('NAVIGATE', { route })
    },

    completeNavigation() {
      return this.transition('NAVIGATION_COMPLETE')
    },

    startLoading(operation) {
      return this.transition('LOAD_DATA', { operation })
    },

    loadSuccess(data) {
      return this.transition('LOAD_SUCCESS', { data })
    },

    loadFailure(error) {
      return this.transition('LOAD_FAILURE', { error })
    },

    handleError(error) {
      return this.transition('ERROR', { error })
    },

    dismissError() {
      return this.transition('DISMISS')
    },

    retry() {
      return this.transition('RETRY')
    }
  }
})
