<template>
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <transition-group name="toast" tag="div">
        <fwb-toast
          v-for="(toast, index) in toasts"
          :key="toast.id"
          :type="toast.type"
          @close="removeToast(index)"
          closable
          class="m-1 border rounded"
        >
        <template v-if="toast.type === 'info'" #icon>
          <img src="/images/about.svg" class="h-6 w-6" />
        </template>
        {{ toast.message }}
        </fwb-toast>
      </transition-group>
    </div>
  </template>
  
  <script setup>
  import { toasts, removeToast } from '../stores/toastManager';
  import { FwbToast } from 'flowbite-vue';  

  </script>
  