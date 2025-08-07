<!-- src/components/SliderTempsModal.vue -->
<template>
  <div class="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50">
    <div class="relative p-4 w-full max-w-md max-h-full">
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
        <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            Modifying Target Temperature
          </h3>
          <button type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" @click="closeModal">
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span class="sr-only">Close modal</span>
          </button>
        </div>

        <div class="p-4 md:p-5">
          <div class="m-6">
            <label for="temperatureValue" class="block mb-2 text-sm font-medium text-white">
              {{ temperatureType }} Air Target Temperature
            </label>
            <input
              id="temperatureValue"
              type="range"
              :min="minimumValue"
              max="50.0"
              step="0.1"
              v-model="temperatureValue"
              class="w-full h-3 rounded-lg cursor-pointer bg-gray-600"
            />
            <span class="text-white"> {{ fahrenheit }} ℉  ({{ temperatureValue }} ℃)</span> 
          </div>

          <div class="flex justify-between mt-10 mx-6">
            <fwb-button @click.prevent="closeModal" color="alternative" pill>Cancel</fwb-button>
            <fwb-button @click.prevent="submit" gradient="blue" pill>Apply</fwb-button>
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