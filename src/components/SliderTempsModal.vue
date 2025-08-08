<!-- src/components/SliderTempsModal.vue -->
<template>
  <div class="modal-overlay overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center w-full h-full">
    <div class="relative p-4 w-full max-w-md max-h-full">
      <div class="modal-content relative rounded-lg shadow">
        <!-- Close button positioned at top right -->
        <button type="button" class="absolute top-3 right-3 z-10 btn-icon text-secondary bg-transparent hover:bg-surface hover:text-primary rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center" @click="closeModal">
          <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
          <span class="sr-only">Close modal</span>
        </button>
        <div class="modal-header flex items-center p-4 md:p-5 border-b rounded-t">
          <h3 class="text-xl font-semibold text-primary">
            Modifying Target Temperature
          </h3>
        </div>

        <div class="modal-body p-4 md:p-5">
          <div class="m-6">
            <label for="temperatureValue" class="block mb-2 text-sm font-medium text-primary">
              {{ temperatureType }} Air Target Temperature
            </label>
            <input
              id="temperatureValue"
              type="range"
              :min="minimumValue"
              max="50.0"
              step="0.1"
              v-model="temperatureValue"
              class="w-full h-3 rounded-lg cursor-pointer bg-surface accent-primary"
            />
            <span class="text-primary"> {{ fahrenheit }} ℉  ({{ temperatureValue }} ℃)</span> 
          </div>

          <div class="flex justify-between mt-10 mx-6">
            <fwb-button @click.prevent="closeModal" class="btn-secondary" pill>Cancel</fwb-button>
            <fwb-button @click.prevent="submit" class="btn-primary" pill>Apply</fwb-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { FwbButton } from 'flowbite-vue';

const props = defineProps({
  temperatureType: {
    type: String,
    required: true,
  },
  temperatureValue: {
    type: Number,
    required: true,
  },
  minValue:{
    type: Number,
    required: true,
  },
  showModal: {
    type: Boolean,
    required: true,
  },
});  
  
const emit = defineEmits(['close', 'submit']);

const temperatureType = ref(props.temperatureType);
const temperatureValue = ref(props.temperatureValue);
const minimumValue = ref(props.minValue);
const showModal = ref(props.showModal);

const fahrenheit = computed(() => {
  return ((temperatureValue.value * 9/5) + 32).toFixed(1);
});

const closeModal = () => {
  emit('close');
};  
  
const submit = () => {
  emit('submit', temperatureValue.value);
  closeModal();
};

// Watch the modal state and toggle body scroll accordingly
watch(showModal, (newValue) => {
  if (newValue) {
    document.body.classList.add('modal-open');
  } else {
    document.body.classList.remove('modal-open');
  }
});

// Ensure modal behavior when mounted/unmounted
onMounted(() => {
  if (showModal.value) {
    document.body.classList.add('modal-open');
  }
  console.log(`min value: ${minimumValue.value}`);
});

onBeforeUnmount(() => {
  document.body.classList.remove('modal-open');
});

</script>