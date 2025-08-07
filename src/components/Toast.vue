<template>
    <div
      v-if="show"
      class="fixed top-4 right-4 max-w-xs w-full rounded"
      role="alert"
    >
      <fwb-toast
        class="max-w-xs border"
        @close="hideToast"
        :type="type"
        closable
      >{{ message }}</fwb-toast>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, defineProps } from 'vue';
  import { FwbToast } from 'flowbite-vue';
  
  const props = defineProps({
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    visible: {
      type: Boolean,
      required: true,
    }
  });
  
  const emit = defineEmits(['update:visible']);
  const show = ref(true);
  
  const hideToast = () => {
    show.value = false;
    emit('update:visible', false);
  };
  
  watch(() => props.visible, (newVal) => {
    if (newVal) {
      show.value = true;
      setTimeout(hideToast, 5000);
    }
  });

</script>
  
  <style scoped>
  .fixed {
    position: fixed;
    z-index: 50;
  }
  </style>
  