
<template>
  <div v-if="show" id="alert-modal" tabindex="-1" aria-hidden="true" class="modal-overlay">
    <div class="relative p-4 w-full max-w-md max-h-full flex justify-center items-center min-h-screen">
      <!-- Modal content -->
      <div class="modal-content">
        <!-- Modal header -->
        <div class="modal-header">
          <h3 class="text-xl font-semibold">
            {{ title }}
          </h3>
          <button type="button" class="btn-icon" @click="closeModal">
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span class="sr-only">Close modal</span>
          </button>
        </div>
        <!-- Modal body -->
        <div class="modal-body">
          <p class="text-sm">
            {{ message }}
          </p>
        </div>
        <!-- Modal footer -->
        <div class="modal-footer">
          <button @click="cancelAction" class="btn-secondary">Cancel</button>
          <button @click="confirmAction" class="btn-primary">Confirm</button>
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
