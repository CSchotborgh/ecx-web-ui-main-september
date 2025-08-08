<template>
    <div v-if="show" id="alert-modal" tabindex="-1" aria-hidden="true" class="modal-overlay fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full">
      <div class="relative p-4 w-full max-w-md max-h-full">
        <!-- Modal content -->
        <div class="modal-content relative rounded-lg shadow">
          <!-- Close button positioned at top right -->
          <button type="button" class="absolute top-3 right-3 z-10 btn-icon text-secondary bg-transparent hover:bg-surface hover:text-primary rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center" @click="closeModal">
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span class="sr-only">Close modal</span>
          </button>
          <!-- Modal header -->
          <div class="modal-header flex items-center p-4 border-b rounded-t">
            <h3 class="text-xl font-semibold text-primary">
              {{ title }}
            </h3>
          </div>
          <!-- Modal body -->
          <div class="modal-body p-4">
            <p class="text-sm text-secondary">
              {{ message }}
            </p>
            <div class="flex justify-end space-x-4 mt-4">
              <button @click="cancelAction" class="btn-secondary px-4 py-2 rounded">Cancel</button>
              <button @click="confirmAction" class="btn-primary px-4 py-2 rounded">Confirm</button>
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