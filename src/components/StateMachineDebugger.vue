
<template>
  <div class="state-machine-debugger p-4 bg-gray-800 text-white rounded-lg">
    <h3 class="text-lg font-bold mb-4">State Machine Debug</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Current State -->
      <div class="bg-gray-700 p-3 rounded">
        <h4 class="font-semibold mb-2">Current State</h4>
        <span class="px-2 py-1 bg-blue-600 rounded text-sm">{{ currentState }}</span>
      </div>
      
      <!-- Available Transitions -->
      <div class="bg-gray-700 p-3 rounded">
        <h4 class="font-semibold mb-2">Available Transitions</h4>
        <div class="flex flex-wrap gap-1">
          <button 
            v-for="transition in availableTransitions" 
            :key="transition"
            @click="handleTransition(transition)"
            class="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
          >
            {{ transition }}
          </button>
        </div>
      </div>
      
      <!-- Context -->
      <div class="bg-gray-700 p-3 rounded">
        <h4 class="font-semibold mb-2">Context</h4>
        <pre class="text-xs overflow-auto">{{ JSON.stringify(context, null, 2) }}</pre>
      </div>
      
      <!-- History -->
      <div class="bg-gray-700 p-3 rounded">
        <h4 class="font-semibold mb-2">Recent History</h4>
        <div class="space-y-1 max-h-32 overflow-auto">
          <div 
            v-for="(entry, index) in history.slice(-5)" 
            :key="index"
            class="text-xs"
          >
            {{ entry.from }} → {{ entry.to }} ({{ entry.event }})
          </div>
        </div>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="mt-4 flex gap-2">
      <button @click="reset" class="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm">
        Reset
      </button>
      <button @click="goToPreviousState" class="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm">
        Previous State
      </button>
    </div>
  </div>
</template>

<script setup>
import { useStateMachine } from '@/composables/useStateMachine'

const {
  currentState,
  context,
  history,
  availableTransitions,
  transition,
  reset,
  goToPreviousState
} = useStateMachine()

const handleTransition = (event) => {
  transition(event)
}
</script>
</template>
