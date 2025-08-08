<template>
    <div class="modal-overlay overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center w-full h-full">
        <div class="relative p-4 w-full max-w-md max-h-full">
            <div class="modal-content relative rounded-lg shadow">
                <!-- Close button positioned at top right -->
                <button
                    type="button"
                    class="absolute top-3 right-3 z-10 btn-icon text-secondary bg-transparent hover:bg-surface hover:text-primary rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                    @click="closeModal"
                >
                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                    <span class="sr-only">Close modal</span>
                </button>
                <div class="modal-header flex items-center p-4 md:p-5 border-b rounded-t">
                    <h3 class="text-xl font-semibold text-primary">
                        Manually Set Date and Time
                    </h3>
                </div>

                <div class="modal-body p-4 md:p-5">
                    <p class="mb-4 text-sm text-secondary">Current Date and Time: <span class="italic font-bold">{{ datetime }}</span></p>

                    <!-- Responsive dropdown inputs for updating date and time -->
                    <div class="mb-4 sm:flex sm:space-x-4">
                        <div class="flex-1 mb-4 sm:mb-0">
                            <fwb-select
                                v-model="selectedYear"
                                :options="year_options"
                                label="Year"
                                :placeholder="selectedYear"
                                size="sm"
                                @change="updateDaysInMonth"
                                >
                            </fwb-select>
                        </div>

                        <div class="flex-1 mb-4 sm:mb-0">
                            <fwb-select
                                v-model="selectedMonth"
                                :options="month_options"
                                label="Month"
                                :placeholder="selectedMonth"
                                size="sm"
                                @change="updateDaysInMonth"
                                >
                            </fwb-select>
                        </div>

                        <div class="flex-1">
                            <fwb-select
                                v-model="selectedDay"
                                :options="days_options"
                                label="Day"
                                :placeholder="selectedDay"
                                size="sm"
                                >
                            </fwb-select>
                        </div>
                    </div>

                    <div class="mb-4 sm:flex sm:space-x-4">
                        <div class="flex-1 mb-4 sm:mb-0">
                            <fwb-select
                                v-model="selectedHour"
                                :options="hour_options"
                                label="Hour"
                                :placeholder="selectedHour"
                                size="sm"
                                >
                            </fwb-select>
                        </div>

                        <div class="flex-1 mb-4 sm:mb-0">
                            <fwb-select
                                v-model="selectedMinute"
                                :options="minute_options"
                                label="Minute"
                                :placeholder="selectedMinute"
                                size="sm"
                                >
                            </fwb-select>
                        </div>

                        <div class="flex-1 mb-4 sm:mb-0">
                            <fwb-select
                                v-model="selectedSeconds"
                                :options="second_options"
                                label="Second"
                                :placeholder="selectedSeconds"
                                size="sm"
                                >
                            </fwb-select>
                        </div>

                        <div class="flex-1 mb-4 sm:mb-0">
                            <fwb-select
                                v-model="selectedAmPm"
                                :options="am_pm_options"
                                label="AM/PM"
                                :placeholder="selectedAmPm"
                                size="sm"
                                >
                            </fwb-select>
                        </div>
                    </div>
                    <p class="mb-4 text-sm text-secondary">New Date and Time: {{ datetimeString }}</p>

                    <div class="flex justify-between mt-10 mx-6">
                        <fwb-button @click.prevent="closeModal" class="btn-secondary" pill>Cancel</fwb-button>
                        <fwb-button @click.prevent="submitForm" class="btn-primary" pill>Set Date/Time</fwb-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, defineProps, defineEmits } from 'vue';
import { FwbButton, FwbSelect } from 'flowbite-vue';
import axios from 'axios';

const year_options = [
  { value: '2024', name: '2024'},
  { value: '2025', name: '2025'},
  { value: '2026', name: '2026'},
  { value: '2027', name: '2027'},
  { value: '2028', name: '2028'},
  { value: '2029', name: '2029'},
  { value: '2030', name: '2030'},
  { value: '2031', name: '2031'},
  { value: '2032', name: '2032'},
  { value: '2033', name: '2033'},
  { value: '2034', name: '2034'},
  { value: '2035', name: '2035'},
  { value: '2036', name: '2036'},
  { value: '2037', name: '2037'},
  { value: '2038', name: '2038'}
]

const month_options = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
]

const hour_options = [
  { value: 1, name: '01' }, { value: 2, name: '02' }, { value: 3, name: '03' },
  { value: 4, name: '04' }, { value: 5, name: '05' }, { value: 6, name: '06' }, { value: 7, name: '07' },
  { value: 8, name: '08' }, { value: 9, name: '09' }, { value: 10, name: '10' }, { value: 11, name: '11' },
  { value: 12, name: '12' }
];

const minute_options = Array.from({ length: 60 }, (_, i) => ({
  value: i, name: i.toString().padStart(2, '0')
}));

const second_options = Array.from({ length: 60 }, (_, i) => ({
  value: i, name: i.toString().padStart(2, '0')
}));

const am_pm_options = [
  { value: 'AM', name: 'AM' },
  { value: 'PM', name: 'PM' }
];

let days_options = ref([]);

// Define props and emits
const props = defineProps({
    datetime: {
        type: String,
        required: true,
    },
    isModalOpen: Boolean, // Passed from parent when modal is shown
    is12HourFormat: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close']);

// Dropdown values
let selectedYear = ref(null);
let selectedMonth = ref(null);
let selectedDay = ref(null);
let selectedHour = ref(null);
let selectedMinute = ref(null);
let selectedSeconds = ref(null);
let selectedAmPm = ref('AM');

const capturedDatetime = ref(null); // Local variable to store the initial datetime

// Extracting and setting dropdown values from the datetime prop
const setDropdownValuesFromDatetime = (inputDatetime) => {

    const dateParts = inputDatetime.split(' ');
    const date = dateParts[0];
    const time = dateParts[1];

    const [year, month, day] = date.split('-').map(Number);
    let [hour, minute, seconds] = time.split(':').map(Number);
    
    selectedYear.value = year;
    selectedMonth.value = month;
    selectedDay.value = day;
    selectedSeconds.value = seconds;
    
    const isPm = time.includes('PM') || hour >= 12;
    if (isPm && hour < 12) {
        hour += 12;
    } else if (!isPm && hour === 12) {
        hour = 0;
    }

    selectedHour.value = hour % 12 === 0 ? 12 : hour % 12; // Handle 12-hour format
    selectedMinute.value = minute;

    selectedAmPm.value = isPm ? 'PM' : 'AM';

    updateDaysInMonth();
};

// Update the number of days in the selected month and year
const updateDaysInMonth = () => {

  const month = selectedMonth.value;
  const year = selectedYear.value;

  // Get the number of days in the selected month and year
  const daysInMonth = new Date(year, month, 0).getDate();

  // Update the options for the days dropdown
  days_options.value = Array.from({ length: daysInMonth }, (_, i) => ({
    value: i + 1,
    name: (i + 1).toString()
  }));

  // Ensure the selected day is valid for the updated month
  if (selectedDay.value > daysInMonth) {
    selectedDay.value = daysInMonth;
  }

};

// Computed property to generate the datetime string in "YYYY-MM-DD HH:mm:ss" format
const datetimeString = computed(() => {
  const year = selectedYear.value;
  const month = String(selectedMonth.value).padStart(2, '0'); // Ensure two digits
  const day = String(selectedDay.value).padStart(2, '0'); // Ensure two digits  
  const hour = String(selectedHour.value).padStart(2, '0');
  const minute = String(selectedMinute.value).padStart(2, '0'); // Ensure two digits
  const second = String(selectedSeconds.value).padStart(2, '0'); // Ensure two digits

  // Create the datetime string in "YYYY-MM-DD HH:mm:ss" format
  return `${year}-${month}-${day} ${hour}:${minute}:${second} ${selectedAmPm.value}`;
});

// Watch the datetime prop and update dropdowns
// Capture the datetime only when the modal is opened
watch(
  () => props.isModalOpen,
  (isOpen) => {
    if (isOpen && props.datetime && !capturedDatetime.value) {
      capturedDatetime.value = props.datetime;
      setDropdownValuesFromDatetime(capturedDatetime.value);
    }
  },
  { immediate: true }
);

// Modal control
const closeModal = () => {
    emit('close');
};

// Submit form
const submitForm = async () => {

    const newDateTimeString = datetimeString;

    try {
        await axios.put('/v1/api/edgerack/0/datetime', {
        "datetime": newDateTimeString.value
        });
        console.log(`Successfully set time to: ${newDateTimeString.value}!`);
    } catch (error) {
        // handle error here?
        console.log(`Error setting date/time: ${error}`);
    }

    closeModal();
};
</script>
