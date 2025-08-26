
import { computed } from 'vue'
import { useStateMachineStore } from '@/stores/stateMachine'

export function useStateMachine() {
  const stateMachine = useStateMachineStore()

  const currentState = computed(() => stateMachine.currentState)
  const context = computed(() => stateMachine.context)
  const history = computed(() => stateMachine.history)
  const availableTransitions = computed(() => stateMachine.getAvailableTransitions)

  // State checkers
  const isIdle = computed(() => stateMachine.isInState('idle'))
  const isAuthenticating = computed(() => stateMachine.isInState('authenticating'))
  const isAuthenticated = computed(() => stateMachine.isInState('authenticated'))
  const isNavigating = computed(() => stateMachine.isInState('navigating'))
  const isLoading = computed(() => stateMachine.isInState('loading'))
  const isError = computed(() => stateMachine.isInState('error'))

  return {
    // State
    currentState,
    context,
    history,
    availableTransitions,
    
    // State checkers
    isIdle,
    isAuthenticating,
    isAuthenticated,
    isNavigating,
    isLoading,
    isError,
    
    // Actions
    transition: stateMachine.transition,
    reset: stateMachine.reset,
    goToPreviousState: stateMachine.goToPreviousState,
    updateContext: stateMachine.updateContext,
    
    // Convenience methods
    startLogin: stateMachine.startLogin,
    loginSuccess: stateMachine.loginSuccess,
    loginFailure: stateMachine.loginFailure,
    logout: stateMachine.logout,
    startNavigation: stateMachine.startNavigation,
    completeNavigation: stateMachine.completeNavigation,
    startLoading: stateMachine.startLoading,
    loadSuccess: stateMachine.loadSuccess,
    loadFailure: stateMachine.loadFailure,
    handleError: stateMachine.handleError,
    dismissError: stateMachine.dismissError,
    retry: stateMachine.retry,
    
    // Utilities
    canTransition: stateMachine.canTransition
  }
}
