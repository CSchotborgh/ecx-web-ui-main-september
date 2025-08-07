<template>
    <div v-if="show" id="alert-modal" tabindex="-1" aria-hidden="true" class="fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50">
      <div class="relative p-4 w-full max-w-md max-h-full">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <!-- Modal header -->
          <div class="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ title }}
            </h3>
            <button type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" @click="closeModal">
              <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
              <span class="sr-only">Close modal</span>
            </button>
          </div>
          <!-- Modal body -->
          <div class="p-4">
            <p class="text-sm text-gray-500 dark:text-gray-300">
              {{ message }}
            </p>
            <div class="flex justify-end space-x-4 mt-4">
              <button @click="cancelAction" class="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
              <button @click="confirmAction" class="bg-blue-500 text-white px-4 py-2 rounded">Confirm</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const props = defineProps({
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: 'Alert',
    },
    message: {
      type: String,
      default: 'Are you sure?',
    },
    onCancel: {
      type: Function,
      default: () => {},
    },
    onConfirm: {
      type: Function,
      default: () => {},
    },
  });
  
  const emit = defineEmits(['update:show']);
  
  const closeModal = () => {
    emit('update:show', false);
  };
  
  const cancelAction = () => {
    props.onCancel();
    closeModal();
  };
  
  const confirmAction = () => {
    props.onConfirm();
    closeModal();
  };
  </script>