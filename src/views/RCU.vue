
<style scoped>
.fixed {
    position: fixed;
}
</style>

<template>
    <div v-show="hasActiveAlarms" class="text-center mx-auto italic bg-red-600 text-white">Cooling Unit reports active alarms!</div>
    <div v-show="!modbus_connected" class="text-center mx-auto italic bg-yellow-300 text-black">Cooling Unit Error: Check connection cable</div>
    <ToastComponent />

    <SliderTempsModal
        v-if="showSupplyModal"
        :temperatureType="targetTemperatureType"
        :temperatureValue="targetTemperatureValue"
        :showModal="showSupplyModal"
        @close="showSupplyModal = false"
        @submit="handleUpdateSupplyAirTarget"
    />

    <SliderTempsModal
        v-if="showReturnModal"
        :temperatureType="targetTemperatureType"
        :temperatureValue="targetTemperatureValue"
        :showModal="showReturnModal"
        @close="showReturnModal = false"
        @submit="handleUpdateReturnAirTarget"
    />

    <!-- Modal for confirming clearing of logs -->
    <fwb-modal v-if="isShowClearLog" :style="{top: `${scrollTop}px`, left: `${scrollLeft}px`}" class="fixed z-10" @close="closeShowClearLog">
        <template #body>
            <p class="text-base leading-relaxed text-gray-400">
                Confirm clearing of alarm logs?
            </p>
        </template>
        <template #footer>
            <div class="flex justify-between">
                <fwb-button @click="closeShowClearLog" color="alternative">Cancel</fwb-button>
                <fwb-button @click="sendClearLogCommand" gradient="green">Accept</fwb-button>
            </div>
        </template>
    </fwb-modal>
    <main class="container text-white">

        <!-- Header and Expansion/Collapse Control -->
        <div class="flex flex-row">
            <div class="flex flex-1 justify-start">
                <h1 class="mt-6">System Overview</h1>
            </div>
            <div class="flex justify-end mt-6">
                <button @click="toggleExpansion">
                    <div v-if="triggerExpandAll">[ Collapse All ]</div>
                    <div v-else>[ Expand All ]</div>
                </button>
            </div>
        </div>
        
        <!-- Last updated section -->
        <div class="flex justify-center uppercase text-xs italic mt-2">Last updated:<div id="updatedTime">&nbsp; {{ timestamp }}</div></div>   
        <div class="flex justify-center uppercase text-xs italic m-2 mt-2">
            <div v-if="modbus_connected" class="text-green-500">MODBUS: Connected</div>
            <div v-else class="text-red-500">MODBUS Error: {{ modbus_error }}</div>
        </div>

        <!-- Single Column Layout -->
        <div class="space-y-6 mt-6">   

        <!-- States Grid -->
        <div class="max-h-fit my-6 grid grid-rows-1 border rounded-3xl bg-slate-800">
            <div class="my-6 mx-2">
                <div class="container flex flex-row">
                    <div class="flex items-start">States:</div>
                    <div class="flex gap-3 flex-1 justify-end">
                        <button @click="showInternalGridStates = !showInternalGridStates">
                            <div v-if="showInternalGridStates">[ - ]</div>
                            <div v-else>[ + ]</div>
                        </button>
                    </div>
                </div>
                <Transition>    
                    <div v-show="showInternalGridStates" class="grid grid-cols-2 m-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 mx-auto p-2 gap-8 text-white w-full">
                        <div class="custom-grid border-none dark:rounded-full dark:bg-gray-600" :class="{ 'dark:bg-green-600' : machineActiveReal }">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Machine:</div>
                            <div class="flex justify-center">
                                <div v-if="machineActiveReal"><fwb-badge type="green" size="md">ON</fwb-badge></div>
                                <div v-else><fwb-badge type="default" size="md">OFF</fwb-badge></div>
                            </div>                        
                        </div>
                        <div class="custom-grid border-none dark:rounded-full dark:bg-gray-600" :class="{ 'dark:bg-yellow-500' : selfCheckActiveReal }" >
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Self-Check:</div>
                            <div class="flex justify-center">
                                <div v-if="selfCheckActiveReal"><fwb-badge type="yellow" size="md">ON</fwb-badge></div>
                                <div v-else><fwb-badge type="default" size="md">OFF</fwb-badge></div>
                            </div>
                        </div>
                        <div class="custom-grid border-none dark:rounded-full dark:bg-gray-600" :class="{ 'dark:bg-green-600' : coolingActiveReal }">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Cooling:</div>
                            <div class="flex justify-center">
                                <div v-if="coolingActiveReal"><fwb-badge type="green" size="md">ON</fwb-badge></div>
                                <div v-else><fwb-badge type="default" size="md">OFF</fwb-badge></div>
                            </div>
                        </div>
                        <div class="custom-grid border-none dark:rounded-full dark:bg-gray-600" :class="{ 'dark:bg-red-500' : heatingActiveReal }">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Heating:</div>
                            <div class="flex justify-center">
                                <div v-if="heatingActiveReal"><fwb-badge type="red" size="md">ON</fwb-badge></div>
                                <div v-else><fwb-badge type="default" size="md">OFF</fwb-badge></div>
                            </div>
                        </div>
                        <div class="custom-grid border-none dark:rounded-full dark:bg-gray-600" :class="{ 'dark:bg-green-500' : dehumidifierActiveReal }">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Dehumidifier:</div>
                            <div class="flex justify-center">
                                <div v-if="dehumidifierActiveReal"><fwb-badge type="green" size="md">ON</fwb-badge></div>
                                <div v-else><fwb-badge type="default" size="md">OFF</fwb-badge></div>
                            </div>
                        </div>
                        <div class="custom-grid border-none dark:rounded-full dark:bg-gray-600" :class="{ 'dark:bg-sky-600' : humidifierActiveReal }">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Humidifier:</div>
                            <div class="flex justify-center">
                                <div v-if="humidifierActiveReal"><fwb-badge type="default" size="md">ON</fwb-badge></div>
                                <div v-else><fwb-badge type="default" size="md">OFF</fwb-badge></div>
                            </div>
                        </div>
                        <div class="custom-grid border-none dark:rounded-full dark:bg-gray-600" :class="{ 'dark:bg-red-500' : dryContactAlarmingActiveReal }">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Alarm Active:</div>
                            <div class="flex justify-center">
                                <div v-if="dryContactAlarmingActiveReal"><fwb-badge type="red" size="md">YES</fwb-badge></div>
                                <div v-else><fwb-badge type="default" size="md">NO</fwb-badge></div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>

        <!-- Control Grid -->
        <div class="max-h-fit my-6 grid grid-rows-1 border rounded-3xl bg-slate-800">
            <div class="my-6 mx-2">
                <div class="container flex flex-row">
                    <div class="flex items-start">Control:</div>
                    <div class="flex gap-3 flex-1 justify-end">
                        <button @click="showInternalGridControl = !showInternalGridControl">
                            <div v-if="showInternalGridControl">[ - ]</div>
                            <div v-else>[ + ]</div>
                        </button>
                    </div>
                </div>
                <Transition>    
                    <div>
                        <div v-show="!loggedIn" class="flex justify-center text-sm italic m-2">Log in to modify controls</div>
                        <div v-show="showInternalGridControl" class="grid grid-cols-1 m-2 sm:grid-cols-3 mx-auto gap-8 w-full justify-around" :class="modbus_connected ? 'text-white' : '!text-gray-500'">
                            <div class="custom-grid border-none"  :class="{ 'grid-rows-2' : loggedIn }">
                                <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Machine:</div>
                                <div class="flex justify-center">
                                    <div v-if="machineActiveReal"><fwb-badge type="green" size="md">ON</fwb-badge></div>
                                    <div v-else><fwb-badge type="default" size="md">OFF</fwb-badge></div>
                                </div>
                                <div v-show="loggedIn" class="mx-auto">
                                    <fwb-select
                                        v-model="machineActiveDisplay"
                                        :options="state_options"
                                        :disabled="machineActiveProcessing"
                                        :placeholder="state_name"
                                        size="sm"
                                        @change="handleToggleMachineActive"
                                    />
                                </div>
                            </div>
                            <div class="custom-grid border-none" :class="{ 'grid-rows-2' : loggedIn }">
                                <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Control Mode:</div>
                                <div class="flex justify-center">
                                    <div v-if="controlModeReal"><fwb-badge type="green" size="md">Return Air</fwb-badge></div>
                                    <div v-else><fwb-badge type="purple" size="md">Supply Air</fwb-badge></div>
                                </div>
                                <div v-show="loggedIn" class="mx-auto">
                                    <fwb-select
                                        v-model="controllingAirDisplay"
                                        :options="control_options"
                                        :disabled="controllingAirProcessing"
                                        :placeholder="controlmode_name"
                                        size="sm"
                                        @change="handleToggleControllingAir"
                                    />
                                </div>
                            </div>
                            <div v-if="!controlModeReal" class="custom-grid border-none" :class="{ 'grid-rows-2' : loggedIn }">
                                <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Supply Air Target ({{ degreeSymbol }}):</div>
                                <div class="text-4xl">{{ supplyAirTargetReal }}</div>
                                <div v-show="loggedIn" class="m-auto w-1/2 justify-center">
                                    <fwb-button @click.prevent="openSupplyModal" color="default" pill>Modify</fwb-button>
                                </div>
                            </div>
                            <div v-else class="custom-grid border-none" :class="{ 'grid-rows-2' : loggedIn }">
                                <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Return Air Target ({{ degreeSymbol }}):</div>
                                <div class="text-4xl">{{ returnAirTargetReal }}</div>
                                <div v-show="loggedIn" class="m-auto w-1/2 justify-center">
                                    <fwb-button @click.prevent="openReturnModal" color="default" pill>Modify</fwb-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>

        <!-- Temperature Grid -->
        <div class="max-h-fit my-6 grid grid-rows-1 border rounded-3xl bg-slate-800">
            <div class="my-6 mx-2">
                <div class="container flex flex-row">
                    <div class="flex items-start">Temperatures / Humidity:</div>
                    <div class="flex gap-3 flex-1 justify-end">
                        <button @click="showInternalGridTemps = !showInternalGridTemps">
                            <div v-if="showInternalGridTemps">[ - ]</div>
                            <div v-else>[ + ]</div>
                        </button>
                    </div>
                </div>
                <Transition>    
                    <div v-show="showInternalGridTemps" class="grid grid-cols-2 m-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mx-auto p-2 gap-8 w-full" :class="modbus_connected ? 'text-white' : '!text-gray-500'">
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Return Air<br />Temp ({{ degreeSymbol }}):</div>
                            <div class="text-4xl grid-rows-1">{{ returnAirTempReal }}</div>
                        </div>
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Return Air<br />Humidity:</div>
                            <div class="text-4xl">{{ returnAirHumReal }}%</div>
                        </div>
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Supply Air<br />Temp ({{ degreeSymbol }}):</div>
                            <div class="text-4xl">{{ supplyAirTempReal }}</div>
                        </div>
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Supply Air<br />Humidity:</div>
                            <div class="text-4xl">{{ supplyAirHumReal }}%</div>
                        </div>
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Discharge<br />Temp ({{ degreeSymbol }}):</div>
                            <div class="text-4xl">{{ dischargeTempReal }}</div>
                        </div>
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Suction<br />Temp ({{ degreeSymbol }}):</div>
                            <div class="text-4xl">{{ suctionTempReal }}</div>
                        </div>
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Evaporator<br />Temp ({{ degreeSymbol }}):</div>
                            <div class="text-4xl">{{ evapTempReal }}</div>
                        </div>
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Condenser<br />Temp ({{ degreeSymbol }}):</div>
                            <div class="text-4xl">{{ condTempReal }}</div>
                        </div>
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Outdoor<br />Temp ({{ degreeSymbol }}):</div>
                            <div class="text-4xl">{{ outdoorTempReal }}</div>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>

        <!-- Fans/Motors Grid -->
        <div class="max-h-fit my-6 grid grid-rows-1 border rounded-3xl bg-slate-800">
            <div class="my-6 mx-2">
                <div class="container flex flex-row">
                    <div class="flex items-start">Fans / Motors:</div>
                    <div class="flex gap-3 flex-1 justify-end">
                        <button @click="showInternalGridMotors = !showInternalGridMotors">
                            <div v-if="showInternalGridMotors">[ - ]</div>
                            <div v-else>[ + ]</div>
                        </button>
                    </div>
                </div>
                <Transition>    
                    <div v-show="showInternalGridMotors" class="grid grid-cols-2 m-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mx-auto p-2 gap-8 w-full" :class="modbus_connected ? 'text-white' : '!text-gray-500'">
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Internal Fan (RPM)</div>
                            <div class="text-4xl">{{ internalFanReal }}</div>
                        </div>
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">External Fan (RPM)</div>
                            <div class="text-4xl">{{ externalFanReal }}</div>
                        </div>
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Condenser Motor (RPM)</div>
                            <div class="text-4xl">{{ condenserMotorReal }}</div>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>

        <!-- Other Grid -->
        <div class="max-h-fit my-6 grid grid-rows-1 border rounded-3xl bg-slate-800">
            <div class="my-6 mx-2">
                <div class="container flex flex-row">
                    <div class="flex items-start">Other Metrics:</div>
                    <div class="flex gap-3 flex-1 justify-end">
                        <button @click="showInternalGridOther = !showInternalGridOther">
                            <div v-if="showInternalGridOther">[ - ]</div>
                            <div v-else>[ + ]</div>
                        </button>
                    </div>
                </div>
                <Transition>    
                    <div v-show="showInternalGridOther" class="grid grid-cols-2 m-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mx-auto p-2 gap-8 w-full" :class="modbus_connected ? 'text-white' : '!text-gray-500'">
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">AC Voltage (VAC)</div>
                            <div class="text-4xl">{{ acVoltageReal }}</div>
                        </div>
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Compressor Heater <br />Current (A)</div>
                            <div class="text-4xl">{{ compCurrentReal }}</div>
                        </div>
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">EEV Position</div>
                            <div class="text-4xl">{{ eevPositionReal }}</div>
                        </div>
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">High Pressure (Bar)</div>
                            <div class="text-4xl">{{ highPressureReal }}</div>
                        </div>
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Low Pressure (Bar)</div>
                            <div class="text-4xl">{{ lowPressureReal }}</div>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>

        <!-- Alarm Logs Grid -->
        <div class="max-h-fit my-6 grid grid-rows-1 border rounded-3xl bg-slate-800">
            <div class="my-6 mx-2">
                <div class="container flex flex-row">
                    <div class="flex flex-1 items-start">Alarm Logs:</div>
                    <div class="flex gap-3 flex-1 justify-end">
                        <button @click="showInternalAlarmGrid = !showInternalAlarmGrid">
                            <div v-if="showInternalAlarmGrid">[ - ]</div>
                            <div v-else>[ + ]</div>
                        </button>
                    </div>
                </div>
                <Transition>    
                    <div v-show="showInternalAlarmGrid && (alarm_count > 0)" class="m-2 mx-auto p-2 gap-8 text-white w-full">                        

                        <div class="m-4 mx-6 text-center w-5/6 md:w-full flex flex-row">
                            <div class="flex flex-1 justify-center">Alarm Entries: {{ alarm_count }}  <span v-show="events_bg_difference > 0">&nbsp;(+{{ events_bg_difference }})</span></div>
                            <div class="flex flex-1 justify-center hidden sm:block">
                                <fwb-button gradient="blue" :disabled="alarmsDisableButton" size="xs" pill @click="retrieveAlarmLogs">Refresh Log</fwb-button>
                            </div>
                        </div>

                        <div class="max-h-100 overflow-y-auto m-6 text-center sm:hidden">
                            Use a wider resolution to properly view alarm log.
                        </div>

                        <div class="max-h-100 overflow-y-auto m-6 flex justify-center text-center hidden sm:block">
                            <fwb-table class="data-table z-0">
                                <fwb-table-head class="sticky top-0 z-10">
                                    <fwb-table-head-cell class="!px-1 !py-2 text-center text-xs font-medium uppercase tracking-wider">
                                        Start Timestamp
                                    </fwb-table-head-cell>
                                    <fwb-table-head-cell class="!px-1 !py-2 text-center text-xs font-medium uppercase tracking-wider">
                                        Description
                                    </fwb-table-head-cell>
                                    <fwb-table-head-cell class="!px-1 !py-2 text-center text-xs font-medium uppercase tracking-wider">
                                        Duration
                                    </fwb-table-head-cell>
                                </fwb-table-head>
                                <fwb-table-body>
                                    <fwb-table-row v-for="log in logs" :key="log.timestamp">
                                        <fwb-table-cell class="!px-1 !py-2 whitespace-nowrap text-center text-xs md:text-sm lg:text-lg">
                                            {{ log.start_timestamp }}
                                        </fwb-table-cell>
                                        <fwb-table-cell class="!px-1 !py-2 whitespace-nowrap text-center text-xs md:text-sm lg:text-lg">
                                            {{ log.description }}
                                        </fwb-table-cell>
                                        <fwb-table-cell class="!px-1 !py-2 whitespace-nowrap text-center text-xs md:text-sm lg:text-lg">
                                            {{ convertSecondsToTime(log.difference) }}
                                        </fwb-table-cell>
                                    </fwb-table-row>
                                </fwb-table-body>
                            </fwb-table>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>
        </div>
    </main>
</template>

<script setup>
import { FwbBadge, FwbSelect, FwbButton, FwbInput, FwbTable, FwbTableBody, FwbTableRow, FwbTableCell, FwbTableHead, FwbTableHeadCell, FwbModal } from 'flowbite-vue';
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { useUserStore } from '../stores/user.js'
import { addToast } from '@/stores/toastManager.js';
import ToastComponent from '@/components/ToastComponent.vue';
import SliderTempsModal from '@/components/SliderTempsModal.vue';

let showInternalGridStates = ref(true);
let showInternalGridTemps = ref(true);
let showInternalGridControl = ref(true);
let showInternalGridMotors = ref(true);
let showInternalGridOther = ref(true);
let showInternalAlarmGrid = ref(true);

let triggerExpandAll = ref(true);

let hasActiveAlarms = ref(false);

let controllingAirProcessing = ref(false);
let controllingAirTarget = ref(false);
let controllingAirDisplay = ref(false);

const suppress_toasts = ref(true);

const usingFahrenheit = ref(true);

const degreeSymbol = ref('°F');

// Modal variables for Supply/Return Air
const showSupplyModal = ref(false);
const showReturnModal = ref(false);

let targetTemperatureType = ref('Supply');
let targetTemperatureValue = ref(0);

let returnAirTargetCelsius = ref(0);
let supplyAirTargetCelsius = ref(0);

const openSupplyModal = () => {
    targetTemperatureType.value = "Supply";
    targetTemperatureValue.value = supplyAirTargetCelsius.value;
    showSupplyModal.value = true;
};

const openReturnModal = () => {
    targetTemperatureType.value = "Return";
    targetTemperatureValue.value = returnAirTargetCelsius.value;
    showReturnModal.value = true;
};

const handleUpdateSupplyAirTarget = async (newTemp) => {

    const numericValue = parseFloat(newTemp).toFixed(1);

    // Convert to Fahrenheit if needed
    const finalValue = usingFahrenheit ? (numericValue * 9/5) + 32 : numericValue;

    if (!isNaN(finalValue)) {

        // API trigger goes here
        await axios.put('/v1/api/edgerack/0/rcu/0', { 
            'supply-air-target': finalValue 
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then (response => {
            if (response.status === 200){
                showToast('success', "Successfully updated Supply Air Target Temperature!");
            }
        })
        .catch(error => {
            showToast('danger', "Failed to update supply air target temperature!");
        })
    } else {
        console.error("Invalid number:", convertedValue);
    }
};

const handleUpdateReturnAirTarget = async (newTemp) => {

    const numericValue = parseFloat(newTemp).toFixed(1);

    // Convert to Fahrenheit if needed
    const finalValue = usingFahrenheit ? (numericValue * 9/5) + 32 : numericValue;

    if (!isNaN(finalValue)) {
        // API trigger goes here
        await axios.put('/v1/api/edgerack/0/rcu/0', { 
            'return-air-target': finalValue 
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then (response => {
            if (response.status === 200){
                showToast('success', "Successfully updated Return Air Target Temperature!");
            }
        })
        .catch(error => {
            showToast('danger', "Failed to update return air target temperature!");
        })
    } else {
        console.error("Invalid number:", convertedValue);
    }
};

// MODBUS Status
let modbus_connected = ref(false);
let modbus_error = ref('N/A');


// Retrieving and maintaining login value from Pinia store
const userStore = useUserStore();
let loggedIn = ref(userStore.isLoggedIn);
watch(() => userStore.isLoggedIn,
  (newValue) => {
    loggedIn.value = newValue;
  },
  { immediate: true }
);


const toggleExpansion = () => {
    if (triggerExpandAll) {
        showInternalGridMotors.value = false;
        showInternalGridStates.value = false;
        showInternalGridOther.value = false;
        showInternalGridTemps.value = false;
        showInternalAlarmGrid.value = false;
        showInternalGridControl.value = false;
        
    } else {
        showInternalGridMotors.value = true;
        showInternalGridStates.value = true;
        showInternalGridOther.value = true;
        showInternalGridTemps.value = true;
        showInternalAlarmGrid.value = true;
        showInternalGridControl.value = true;
        
    }

    triggerExpandAll = !triggerExpandAll;
};

function convertSecondsToTime(seconds) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds - (hours * 3600)) / 60 );
    let remainingSeconds = seconds - (hours * 3600) - (minutes * 60);

    let final_result = '';

    if (hours > 0){
        final_result = `${hours} hr`;
    }
    if (minutes > 0){
        final_result = `${final_result} ${minutes} min`;
    }
    if (remainingSeconds > 0){
        final_result = `${final_result} ${remainingSeconds} sec`;
    }

    return `${final_result}`;
}

// States
let machineActiveReal = ref(false);
let selfCheckActiveReal = ref(false);
let coolingActiveReal = ref(false);
let heatingActiveReal = ref(false);
let dehumidifierActiveReal = ref(false);
let humidifierActiveReal = ref(false);
let dryContactAlarmingActiveReal = ref(false);

let controllingSupplyAir = ref(true);

// Variables for real time view
let returnAirTempReal = ref('0.0');
let returnAirHumReal = ref('0');
let supplyAirTempReal = ref('0.0');
let supplyAirHumReal = ref('0');
let internalFanReal = ref('0');
let externalFanReal = ref('0');
let condenserMotorReal = ref('0');
let controlModeReal = ref('0')
let returnAirTargetReal = ref('0.0');
let supplyAirTargetReal = ref('0.0');
let dischargeTempReal = ref('0.0');
let suctionTempReal = ref('0.0');
let evapTempReal = ref('0.0');
let condTempReal = ref('0.0');
let outdoorTempReal = ref('0.0');
let highPressureReal = ref('0.0');
let lowPressureReal = ref('0.0');

let returnAirTarget = ref('80.6');
let supplyAirTarget = ref('66.2');

let acVoltageReal = ref('0.0');
let compCurrentReal = ref('0.00');
let eevPositionReal = ref('0');

let timestamp = ref('N/A');

let data = [];

let logs = ref([]);
let alarm_count = ref('0');
let alarm_count_background = ref('0');
let active_alarm_count = ref(0);
let alarmsDisableButton = ref(false);

const events_bg_difference = computed(() => {
    return alarm_count_background.value - alarm_count.value
})

const control_options = [
    { value: false, name: 'Supply Air' },
    { value: true, name: 'Return Air' }
]

const getControlModeName = (value) => {
  const unit = control_options.find(option => option.value === value);
  return unit ? unit.name : '';
};

const controlmode_name = computed(() => getControlModeName(controllingAirDisplay.value));


const state_options = [
  { value: false, name: 'off'},
  { value: true, name: 'on'},
]

const getStateName = (value) => {
  const unit = state_options.find(option => option.value === value);
  return unit ? unit.name : '';
};

const state_name = computed(() => getStateName(machineActiveDisplay.value));


const fetchData = async () => {
    
    await axios.get('/v1/api/all')
    .then(response => {
        if (response.status === 200) {
            data = response.data;

            // parsing retrieved json data
            for (let i = 0; i < data.length; i++){

                usingFahrenheit.value = !!data[i].using_fahrenheit;                
                degreeSymbol.value = usingFahrenheit.value ? '°F' : '°C';

                returnAirTargetReal.value = usingFahrenheit.value ? parseFloat(((data[i].returnAirTargetTemp / 10) * 1.8 + 32).toFixed(1)) : parseFloat((data[i].returnAirTargetTemp / 10).toFixed(1));
                returnAirTempReal.value = usingFahrenheit.value ? parseFloat(((data[i].returnAirTemperature / 10) * 1.8 + 32).toFixed(1)) : parseFloat((data[i].returnAirTemperature / 10).toFixed(1));
                returnAirHumReal.value = parseFloat((data[i].returnAirHumidity / 10).toFixed(0));
                supplyAirTargetReal.value = usingFahrenheit.value ? parseFloat(((data[i].supplyAirTargetTemp / 10) * 1.8 + 32).toFixed(1)) : parseFloat((data[i].supplyAirTargetTemp / 10).toFixed(1));
                supplyAirTempReal.value = usingFahrenheit.value ? parseFloat(((data[i].supplyAirTemperature / 10) * 1.8 + 32).toFixed(1)) : parseFloat((data[i].supplyAirTemperature / 10).toFixed(1));
                supplyAirHumReal.value = data[i].supplyAirHumidity < 1000 ? parseFloat((data[i].supplyAirHumidity / 10).toFixed(0)) : '-';
                internalFanReal.value = parseInt((data[i].internalFanSpeed));
                externalFanReal.value = parseInt((data[i].externalFanSpeed));
                condenserMotorReal.value = parseInt((data[i].inverterCompressorSpeed));
                machineActiveReal.value = !!data[i].machine_active;
                controlModeReal.value = !!data[i].controlModeSetting;
                dischargeTempReal.value = data[i].dischargeTemperature < 500 ? (usingFahrenheit.value ? parseFloat(((data[i].dischargeTemperature / 10) * 1.8 + 32).toFixed(1)) : parseFloat((data[i].dischargeTemperature / 10).toFixed(1))) : '-';
                suctionTempReal.value = usingFahrenheit.value ? parseFloat(((data[i].suctionTemperature / 10) * 1.8 + 32).toFixed(1)) : parseFloat((data[i].suctionTemperature / 10).toFixed(1));
                evapTempReal.value = usingFahrenheit.value ? parseFloat(((data[i].evaporatorTemperature / 10) * 1.8 + 32).toFixed(1)) : parseFloat((data[i].evaporatorTemperature / 10).toFixed(1));
                condTempReal.value = usingFahrenheit.value ? parseFloat(((data[i].condenserTemperature / 10) * 1.8 + 32).toFixed(1)) : parseFloat((data[i].condenserTemperature / 10).toFixed(1));
                outdoorTempReal.value = data[i].outdoorTemperature < 1000 ? (usingFahrenheit.value ? parseFloat(((data[i].outdoorTemperature / 10) * 1.8 + 32).toFixed(1)) : parseFloat((data[i].outdoorTemperature / 10).toFixed(1)))  : '-';

                // Save Celsius only data for calculations
                returnAirTargetCelsius.value = parseFloat(data[i].returnAirTargetTemp / 10).toFixed(1);
                supplyAirTargetCelsius.value = parseFloat(data[i].supplyAirTargetTemp / 10).toFixed(1);

                highPressureReal.value = parseFloat((data[i].highPressure / 10).toFixed(1));
                lowPressureReal.value = parseFloat((data[i].lowPressure / 10).toFixed(1));

                acVoltageReal.value = parseFloat((data[i].acPowerVoltage / 10).toFixed(1));
                compCurrentReal.value = parseFloat((data[i].compressorHeaterCurrent / 100).toFixed(2));
                eevPositionReal.value = parseInt(data[i].eevPosition);

                modbus_connected.value = !!data[i].connected;
                modbus_error.value = data[i].error;

                selfCheckActiveReal.value = data[i].selfcheck_active ? true : false;
                coolingActiveReal.value = data[i].cooling_active ? true : false;
                heatingActiveReal.value = data[i].heating_active ? true : false;
                dehumidifierActiveReal.value = data[i].dehumidification_active ? true : false;
                humidifierActiveReal.value = data[i].humidifier_active ? true : false;
                dryContactAlarmingActiveReal.value = data[i].drycontactalarming_active ? true : false;
            
                if (!machineActiveProcessing.value){
                    machineActiveDisplay.value = machineActiveReal.value;
                }

                if (!controllingAirProcessing.value){
                    controllingAirDisplay.value = controlModeReal.value;
                }

            }
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error.response.data);
    });


    // Pull most recent timestamp among data sets
    await axios.get('/v1/api/timestamp')
    .then(response => {
        if (response.status === 200) {
            data = response.data;

            // parsing retrieved json data
            for (let i = 0; i < data.length; i++){
                timestamp.value = data[i].timestamp;
            }
        }
    })
    .catch (error => {
        console.error('Error fetching data:', error.response.data);
    });

    await axios.get('/v1/api/alarms/active/count') // Adjust your API endpoint
    .then(response => {
        if (response.status === 200) {
            data = response.data;

            // parsing retrieved json data
            for (let i = 0; i < data.length; i++){
                active_alarm_count.value = parseInt(data[i].count);

                if (active_alarm_count.value > 0){
                    hasActiveAlarms.value = true;
                } else {
                    hasActiveAlarms.value = false;
                }
            }
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error.response.error);
    });

    // Pull alarm log count - background
    await axios.get('/v1/api/alarms/count')
    .then(response => {
        if (response.status === 200) {
            data = response.data;

            // parsing retrieved json data
            for (let i = 0; i < data.length; i++){
                alarm_count_background.value = data[i].count;
            }
        }
    })
    .catch(error => {
        console.error('Error fetching data:', response.status);
    });

};

const scrollTop = ref(0);
const scrollLeft = ref(0);

const updateScroll = () => {
    scrollTop.value = window.scrollY;
    scrollLeft.value = window.scrollX;
}

const isShowClearLog = ref(false);

function closeShowClearLog () {
    isShowClearLog.value = false;
}

function showClearLog () {
    isShowClearLog.value = true;
}

// Variables/functions related to Toast
let showToast = (str1, str2) => {
    if (!suppress_toasts.value){
        addToast(str1, str2);
    }
}

// Variables/functions related to Alarm Log 
async function sendClearLogCommand () {
    closeShowClearLog();

    await axios.post('/v1/api/alarms/clear')
    .then(response => {
        if (response.status === 200){
            showToast('success', 'Successfully cleared logs!');
        }
    })
    .catch(error => {
        console.log('Error trying to clear alarm logs: ', error.response.data);
    });
}

let machineActiveProcessing = ref(false);
let machineActiveDisplay = ref(false);
let machineActiveTarget = ref(false);

watch(() => machineActiveReal.value, (newValue, oldValue) => {
    machineActiveProcessing.value = false;

    if (oldValue === false && newValue === true){
        showToast('info', "RCU is now ON!");
    } 
    if (oldValue === true && newValue === false) {
        showToast('info', "RCU is now OFF!");
    }
}, { immediate: true }
);

watch(() => controlModeReal.value, (newValue, oldValue) => {
    controllingAirProcessing.value = false;

    if (oldValue === false && newValue === true){
        showToast('info', "Now controlling Return Air!");
    } 
    if (oldValue === true && newValue === false) {
        showToast('info', "Now controlling Supply Air!");
    }
}, { immediate: true }
);

const handleToggleMachineActive = async (event) => {
    
    machineActiveProcessing.value = true
    machineActiveTarget.value = (event.target.value === 'true' ? true : false);
    const convertedValue = (machineActiveTarget.value === true) ? 'on' : 'off';
    
    await axios.put('/v1/api/edgerack/0/rcu/0', { 
        machine: convertedValue 
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then (response => {
        if (response.status === 200){
            showToast('success', "Successfully updated machine state!");
        }
    })
    .catch(error => {
        showToast('danger', `Failed to update machine state! ${error}`);
    })
}

const handleToggleControllingAir = async (event) => {
    
    controllingAirProcessing.value = true;
    controllingAirTarget.value = (event.target.value === 'true' ? true : false);
    const convertedValue = (controllingAirTarget.value === true) ? 'return' : 'supply';

    // API trigger goes here
    await axios.put('/v1/api/edgerack/0/rcu/0', { 
        'control-mode': convertedValue 
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then (response => {
        if (response.status === 200){
            showToast('success', "Successfully updated control mode!");
        }
    })
    .catch(error => {
        showToast('danger', `Failed to update control mode! ${error}`);
    })

}

const retrieveAlarmLogs = async () => {

    alarmsDisableButton.value = true;

    // Pull alarm log count
    await axios.get('/v1/api/alarms/count')
    .then(response => {
        if (response.status === 200) {
            data = response.data;

            // parsing retrieved json data
            for (let i = 0; i < data.length; i++){
                alarm_count.value = data[i].count;
            }
        }
    })
    .catch(error => {
        console.error('Error fetching data:', response.status);
    });

    // Pull alarm log entries
    await axios.get('/v1/api/alarms/all')
    .then(response => {
        if (response.status === 200) {
            logs.value = response.data;
        }
    })
    .catch(error =>  {
        console.error('Error fetching data:', error);
    });

    setTimeout(() => {
        alarmsDisableButton.value = false; 
    }, 2000);
}

let intervalId;
onMounted(async () => {

    setTimeout(() => {
        suppress_toasts.value = false;
    }, 1000);

    await retrieveAlarmLogs();

    loggedIn.value = userStore.isLoggedIn;

    window.addEventListener('scroll', updateScroll);

    fetchData();
    intervalId = setInterval(fetchData, 1000); // Fetch data every second
});

onUnmounted(() => {
    window.removeEventListener('scroll', updateScroll);
    clearInterval(intervalId); // Clear the interval when the component is unmounted
});


</script>