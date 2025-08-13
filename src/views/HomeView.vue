<template>
    <div v-show="hasActiveAlarms" class="text-center mx-auto italic bg-red-600 text-white">Cooling Unit reports active alarms!</div>
    <div v-show="!modbus_connected" class="text-center mx-auto italic bg-yellow-300 text-black">Cooling Unit Error: Check connection cable</div>
    <main class="container text-white">
        <ToastComponent />

        <SliderTempsModal
            v-if="showSupplyModal"
            :temperatureType="targetTemperatureType"
            :temperatureValue="targetTemperatureValue"
            :showModal="showSupplyModal"
            :minValue="12.0"
            @close="showSupplyModal = false"
            @submit="handleUpdateSupplyAirTarget"
        />

        <SliderTempsModal
            v-if="showReturnModal"
            :temperatureType="targetTemperatureType"
            :temperatureValue="targetTemperatureValue"
            :showModal="showReturnModal"
            :minValue="18.0"
            @close="showReturnModal = false"
            @submit="handleUpdateReturnAirTarget"
        />

        <div class="text-center mx-auto mt-6 italic text-sm flex flex-row justify-center">
            <div class="mx-2">{{ server_time }}</div>
            <div class="mx-2" v-show="ntp_synced"><fwb-badge type="green" size="xs">NTP SYNC</fwb-badge></div>
        </div>
        <div class="max-h-fit my-6 grid grid-rows-1 border rounded-3xl bg-slate-800">
            <div class="my-6 w-full">
                <div class="container flex flex-row">
                    <div class="flex flex-2 sm:flex-1 items-start text-2xl">Cabinet</div>
                </div>

                <div class="mx-auto">
                    <!-- Horizontal separator for RCU Control grids -->
                    <div class="inline-flex items-center justify-center w-full">
                        <hr class="w-11/12 h-px mt-6 bg-gray-200 border-0 dark:bg-gray-300">
                        <span class="absolute mt-6 px-3 font-medium text-gray-900 hidden md:block -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-800 uppercase">Signals from Cooling Unit</span>
                        <span class="absolute mt-6 px-3 font-medium text-gray-900 md:hidden -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-800 uppercase">Signals from RCU</span>
                    </div>

                    <!-- Cabinet status flags -->
                    <div class="grid grid-cols-2 m-2 md:grid-cols-4 mx-auto p-2 gap-8 text-white w-full">
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Alarm Activated:</div>
                            <div v-if="cabinet_fault" class="text-3xl grid-rows-1 text-red-500">YES</div>
                            <div v-else class="text-3xl grid-rows-1 text-green-500">No</div>
                        </div>
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Door Sensor:</div>
                            <div v-if="cabinet_door_sensor" class="text-3xl grid-rows-1 text-red-500">OPENED</div>
                            <div v-else class="text-3xl grid-rows-1 text-green-500">CLOSED</div>
                        </div>
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Water Sensor:</div>
                            <div v-if="cabinet_water_sensor" class="text-3xl grid-rows-1 text-red-500">WATER DETECTED</div>
                            <div v-else class="text-3xl grid-rows-1 text-green-500">OK</div>
                        </div>
                        <div class="custom-grid">
                            <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Smoke Sensor:</div>
                            <div v-if="cabinet_smoke_sensor" class="text-3xl grid-rows-1 text-red-500">SMOKE DETECTED</div>
                            <div v-else class="text-3xl grid-rows-1 text-green-500">OK</div>
                        </div>
                    </div>

                    <!-- Horizontal separator for Event Log section -->
                    <div class="inline-flex items-center justify-center w-full">
                        <hr class="w-11/12 h-px mt-6 bg-gray-200 border-0 dark:bg-gray-300">
                        <span class="absolute mt-6 px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-800 uppercase">Events Log</span>
                    </div>

                    <div class="m-4 mx-6 text-center w-5/6 md:w-full flex flex-row">
                        <div class="flex flex-1 justify-center">Log Entries: {{ eventsCount }} <span v-show="events_bg_difference > 0">&nbsp;(+{{ events_bg_difference }})</span></div>
                        <div class="flex flex-1 justify-center hidden md:block">
                            <fwb-button gradient="blue" :disabled="eventsDisableButton" size="xs" pill @click="retrieveEventLogs">Refresh Log</fwb-button>
                        </div>
                    </div>

                    <div class="max-h-60 overflow-y-auto m-6 text-center sm:hidden">
                        Use a wider resolution to properly view event log.
                    </div>

                    <div class="max-h-60 overflow-y-auto m-6 text-center hidden sm:block">
                        <fwb-table class="z-0 divide-y divide-gray-200 bg-gray-200">
                            <fwb-table-head class="bg-gray-50 sticky top-0 z-10">
                                <fwb-table-head-cell class="!px-1 !py-2 text-center text-sm font-medium text-gray-500 uppercase tracking-tighter">
                                    Timestamp
                                </fwb-table-head-cell>
                                <fwb-table-head-cell class="!px-1 !py-2 text-center text-sm font-medium text-gray-500 uppercase tracking-tighter">
                                    Reporter
                                </fwb-table-head-cell>
                                <fwb-table-head-cell class="!px-1 !py-2 text-center text-sm font-medium text-gray-500 uppercase tracking-tighter">
                                    Target
                                </fwb-table-head-cell>
                                <fwb-table-head-cell class="!px-1 !py-2 text-center text-sm font-medium text-gray-500 uppercase tracking-tighter">
                                    Type
                                </fwb-table-head-cell>
                                <fwb-table-head-cell class="!px-1 !py-2 text-center text-sm font-medium text-gray-500 uppercase tracking-tighter">
                                    Event 
                                </fwb-table-head-cell>
                            </fwb-table-head>
                            <fwb-table-body>
                                <fwb-table-row v-for="(eventRow, index) in eventRows" :key="index">
                                    <fwb-table-cell class="!px-1 !py-2 !whitespace-normal max-w-[120px] md:max-w-none text-center text-xs md:text-sm lg:text-lg text-gray-500">
                                    {{ eventRow.timestamp }}
                                    </fwb-table-cell>
                                    <fwb-table-cell class="!px-1 !py-2 whitespace-nowrap text-center text-xs md:text-sm lg:text-lg text-gray-500">
                                    {{ eventRow.origin }}
                                    </fwb-table-cell>
                                    <fwb-table-cell class="!px-1 !py-2 whitespace-nowrap text-center text-xs md:text-sm lg:text-lg text-gray-500">
                                    {{ eventRow.target }}
                                    </fwb-table-cell>
                                    <fwb-table-cell class="!px-1 !py-2 whitespace-nowrap text-center text-xs md:text-sm lg:text-lg text-gray-500">
                                    {{ eventRow.type }}
                                    </fwb-table-cell>
                                    <fwb-table-cell class="!px-1 !py-2 whitespace-normal text-center text-xs md:text-sm lg:text-lg text-gray-500">
                                    {{ eventRow.event }}
                                    </fwb-table-cell>
                                </fwb-table-row>
                            </fwb-table-body>
                        </fwb-table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Top level container for Cooling Unit section -->
        <div class="max-h-fit my-6 grid grid-rows-1 border rounded-3xl bg-slate-800">
            <div class="my-6 mx-2">
                <div class="container flex flex-row">
                    <div class="flex flex-2 sm:flex-1 items-start text-2xl">Cooling Unit</div>
                    <div class="hidden sm:flex flex-2 justify-center">
                        <fwb-badge v-if="machineActiveReal" class="mx-2 m-1 hidden md:block" type="green" size="sm">ON</fwb-badge>
                        <fwb-badge v-else class="mx-2 m-1 hidden md:block" type="default" size="sm">OFF</fwb-badge>
                        <fwb-badge v-if="controlModeReal" class="mx-2 m-1 hidden md:block" type="green" size="sm">Return Air</fwb-badge>
                        <fwb-badge v-else class="mx-2 m-1 hidden md:block" type="purple" size="sm">Supply Air</fwb-badge>
                        <alert-icon class="w-6 h-6 mx-2 mt-1 hidden md:block" v-show="hasActiveAlarms"/>
                        <fan-icon class="w-6 h-6 mx-2 mt-1 hidden md:block animate-spin" v-show="isFanRunning" />
                        <cold-icon class="w-6 h-6 mx-2 mt-1 hidden md:block" v-show="isCoolingActive"/>
                        <heat-icon class="w-6 h-6 mx-2 mt-1 hidden md:block" v-show="isHeatingActive"/>
                    </div>
                    <div class="flex gap-3 flex-1 justify-end">
                        <button @click="showInternalGrid = !showInternalGrid">
                            <div v-if="showInternalGrid" class="text-2xl">[ - ]</div>
                            <div v-else class="text-2xl">[ + ]</div>
                        </button>
                    </div>
                </div>
                <div v-show="showInternalGrid" class="flex justify-center uppercase text-xs italic m-2 mt-6">Last updated:&nbsp;&nbsp;<div id="updatedTime">{{ timestamp }}</div></div>   
                <div v-show="showInternalGrid" class="flex justify-center uppercase text-xs italic m-2 mt-6">
                    <div v-if="modbus_connected" class="text-green-500">MODBUS: Connected</div>
                    <div v-else class="text-red-500">MODBUS Error: {{ modbus_error }}</div>
                </div>   
                <Transition>
                    <div v-show="showInternalGrid" >
                        <!-- Horizontal separator for Controls grids -->
                        <div class="inline-flex items-center justify-center w-full">
                            <hr class="w-11/12 h-px mt-6 bg-gray-200 border-0 dark:bg-gray-300">
                            <span class="absolute mt-6 px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-800 uppercase">Controls</span>
                        </div>

                        <!-- Control grids -->
                        <div v-show="loggedIn == false" class="flex justify-center text-sm italic m-2">Log in to modify controls</div>
                        <div class="grid grid-cols-1 m-2 sm:grid-cols-3 mx-auto gap-8 w-full justify-around" :class="modbus_connected ? 'text-white' : '!text-gray-500'">
                            <div class="custom-grid border-none"  :class="{ 'grid-rows-2' : loggedIn }">
                                <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Power:</div>
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
                                    <fwb-button @click.prevent="openSupplyModal" color="blue" pill>Modify</fwb-button>
                                </div>
                            </div>
                            <div v-else class="custom-grid border-none" :class="{ 'grid-rows-2' : loggedIn }">
                                <div class="m-auto grid grid-rows-1 gap-4 text-center text-sm table-label">Return Air Target ({{ degreeSymbol }}):</div>
                                <div class="text-4xl">{{ returnAirTargetReal }}</div>
                                <div v-show="loggedIn" class="m-auto w-1/2 justify-center">
                                    <fwb-button @click.prevent="openReturnModal" color="blue" pill>Modify</fwb-button>
                                </div>
                            </div>
                        </div>

                        <!-- HR separator for Real Time Data section-->
                        <div class="inline-flex items-center justify-center w-full">
                            <hr class="w-11/12 h-px mt-6 bg-gray-200 border-0 dark:bg-gray-300">
                            <span class="absolute mt-6 px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-800 uppercase">Real Time Data</span>
                        </div>

                        <!-- Real time data grids -->
                        <div class="grid grid-cols-2 m-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mx-auto p-2 gap-8 w-full" :class="modbus_connected ? 'text-white' : '!text-gray-500'">
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
                    </div>
                </Transition>
            </div>
        </div>

        <!-- Top level container for Networking section -->
        <div class="max-h-fit my-6 grid grid-rows-1 border rounded-3xl bg-slate-800">
            <div class="my-6 mx-2">
                <div class="container flex flex-row">
                    <div class="flex flex-2 sm:flex-1 items-start text-2xl">Networking</div>
                    <div class="flex gap-3 flex-1 justify-end">
                        <button @click="showNetworkingGrid = !showNetworkingGrid">
                            <div v-if="showNetworkingGrid" class="text-2xl">[ - ]</div>
                            <div v-else class="text-2xl">[ + ]</div>
                        </button>
                    </div>
                </div>
                <Transition>
                    <div v-show="showNetworkingGrid" class="text-lg">
                        <div class="container mx-auto grid grid-cols-1 md:grid-cols-2 mt-6">
                            <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                                <div class="m-4">Primary Link Status:</div>
                                <div class="m-4 flex flex-row mx-auto">
                                    <div class="flex-2">{{ rt_primary_link }}</div>
                                    <div class="flex-1"><img :src="primary_link_led" alt="Link Status" class="ml-2 w-6 h-6" /></div>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                                <div class="m-4">Primary IPv4 Address:</div>
                                <div class="m-4">{{ rt_primary_ipv4_address }}</div>
                            </div>
                        </div>
                        <div class="container mx-auto grid grid-cols-1 md:grid-cols-2">
                            <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                                <div class="m-4">Primary Gateway:</div>
                                <div class="m-4">{{ rt_primary_gateway_address }}</div>
                            </div>
                            <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                                <div class="m-4">Primary Netmask:</div>
                                <div class="m-4">{{ rt_primary_netmask_address }}</div>
                            </div>
                        </div>

                        <div v-show="rt_primary_ipv6_address.length > 0" class="container mx-auto grid grid-cols-1">
                            <div class="grid grid-cols-1 m-1 text-center border rounded align-middle">
                                <div class="m-4">Primary IPv6 Address(es):</div>
                                <div class="m-1">
                                    <ul>
                                        <li v-for="(part, index) in rt_primary_ipv6_address" :key="index">{{ part }}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>  
                        <div class="container mx-auto mt-6 grid grid-cols-1 md:grid-cols-2">
                            <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                                <div class="m-4">Secondary Link Status:</div>
                                <div class="m-4 flex flex-row mx-auto">
                                    <div class="flex-2">{{ rt_secondary_link }}</div>
                                    <div class="flex-1"><img :src="secondary_link_led" alt="Link Status" class="ml-2 w-6 h-6" /></div>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                                <div class="m-4">Secondary IPv4 Address:</div>
                                <div class="m-4">{{ rt_secondary_ipv4_address }}</div>
                            </div>
                        </div>
                        <div class="container mx-auto grid grid-cols-1 md:grid-cols-2">
                            <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                                <div class="m-4">Secondary Gateway:</div>
                                <div class="m-4">{{ rt_secondary_gateway_address }}</div>
                            </div>
                            <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                                <div class="m-4">Secondary Netmask:</div>
                                <div class="m-4">{{ rt_secondary_netmask_address }}</div>
                            </div>
                        </div>
                        <div v-show="rt_secondary_ipv6_address.length > 0" class="container mx-auto grid grid-cols-1">
                            <div class="grid grid-cols-1 m-1 text-center border rounded align-middle">
                                <div class="m-4">Secondary IPv6 Address(es):</div>
                                <div class="m-1">
                                    <ul>
                                        <li v-for="(part, index) in rt_secondary_ipv6_address" :key="index">{{ part }}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>  
                        <div v-show="ntp_enabled" class="container mx-auto mt-6 grid grid-cols-1 md:grid-cols-2">
                            <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                                <div class="m-4">NTP Synchronized:</div>
                                <div class="m-4 flex flex-row mx-auto">
                                    <div class="flex-2">{{ ntp_synced_text }}</div>
                                    <div class="flex-1"><img :src="ntp_synced_led" alt="Link Status" class="ml-2 w-6 h-6" /></div>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                                <div class="m-4">NTP Synchronized Server:</div>
                                <div class="m-4">{{ ntp_synced_server }}</div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>

        <!-- Top level container for System Diagnostics section -->
        <div class="max-h-fit my-6 grid grid-rows-1 border rounded-3xl bg-slate-800">
            <div class="my-6 mx-2">
                <div class="container flex flex-row">
                    <div class="flex flex-2 sm:flex-1 items-start text-2xl">System</div>
                    <div class="flex gap-3 flex-1 justify-end">
                        <button @click="showSystemGrid = !showSystemGrid">
                            <div v-if="showSystemGrid" class="text-2xl">[ - ]</div>
                            <div v-else class="text-2xl">[ + ]</div>
                        </button>
                    </div>
                </div>
                <Transition>
                    <div v-show="showSystemGrid" class="text-lg">
                        <div class="container mx-auto grid grid-cols-1 md:grid-cols-2 mt-6">
                            <div class="system-grid-item">
                                <div class="m-4">CPU Usage:</div>
                                <div class="m-4 flex flex-row mx-auto">
                                    <div class="flex-2">{{ cpu_usage }}%</div>
                                    <div class="flex-1"><img :src="led_cpu_usage" alt="CPU Usage" class="ml-2 w-6 h-6" /></div>
                                </div>
                            </div>
                            <div class="system-grid-item">
                                <div class="m-4">Load Averages:</div>
                                <div class="m-4">{{ load_avg }}</div>
                            </div>
                        </div>
                        <div class="container mx-auto grid grid-cols-1 md:grid-cols-2">
                            <div class="system-grid-item">
                                <div class="m-4">Memory Usage:</div>
                                <div class="m-4">{{ memory_used }}MB / {{ memory_total }}MB</div>
                            </div>
                            <div class="system-grid-item">
                                <div class="m-4">Storage Usage:</div>
                                <div class="m-4">{{ storage_used }}MB / {{ storage_total }}MB</div>
                            </div>
                        </div>

                        <div class="container mx-auto grid grid-cols-1 md:grid-cols-2">
                            <div class="system-grid-item">
                                <div class="m-4">Flash Wear Level:</div>
                                <div class="m-4 flex flex-row mx-auto">
                                    <div class="flex-2">{{ flash_wear }}</div>
                                    <div class="flex-1"><img :src="led_flash_wear" alt="Wear Level" class="ml-2 w-6 h-6" /></div>
                                </div>
                            </div>
                            <div class="system-grid-item">
                                <div class="m-4">Wear Level Description:</div>
                                <div class="m-4">{{ flash_wear_text }}</div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>

        <div class="text-center mx-auto mt-6 italic text-sm">
            <div class="m-2">[ System Uptime: {{ formattedUptime }} ]</div>
            <div class="m-2">[ Version: {{ sw_revision }} - Build: {{ sw_build }} - Release: {{ sw_release }} ]</div>
        </div>

    </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { FwbBadge, FwbSelect, FwbButton, FwbTable, FwbTableBody, FwbTableRow, FwbTableCell, FwbTableHead, FwbTableHeadCell } from 'flowbite-vue'
import axios from 'axios';
import { useUserStore } from '@/stores/user'
import { addToast } from '@/stores/toastManager.js';
import ToastComponent from '@/components/ToastComponent.vue';
import { reportVersion } from '@/assets/version';
import SliderTempsModal from '@/components/SliderTempsModal.vue';

import AlertIcon from '@/icons/alert.svg';
import FanIcon from '@/icons/fan.svg';
import ColdIcon from '@/icons/cool.svg';
import HeatIcon from '@/icons/fire.svg';

const suppress_toasts = ref(true);

const usingFahrenheit = ref(true);

const degreeSymbol = ref('°F');
const userStore = useUserStore();

let showInternalGrid = ref(true);
let showNetworkingGrid = ref(true);
let showSystemGrid = ref(true);
let loggedIn = ref(userStore.isLoggedIn);

// Modal variables for Supply/Return Air
const showSupplyModal = ref(false);
const showReturnModal = ref(false);

let targetTemperatureType = ref('Supply');
let targetTemperatureValue = ref(0);

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

const fahrenheit = computed(() => {
  return ((temperatureValue.value * 9/5) + 32).toFixed(1);
});

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

// General Config
let ntp_enabled = ref(false);

const retrieveGeneralConfig = async () => {

    await axios.get('/v1/api/edgerack/0/config/general')
    .then(response => {
        if (response.status === 200) {
            data = response.data;

            // parsing retrieved json data
            for (let i = 0; i < data.length; i++){
                ntp_enabled.value = data[i]['ntp-enabled'] == 'yes' ? true : false;
            }
        }
    }).catch(error => {
        console.error('Error fetching general config:', response.status);
    });
}

// MODBUS Status
let modbus_connected = ref(false);
let modbus_error = ref('N/A');

let controllingAirProcessing = ref(false);
let controllingAirTarget = ref(false);
let controllingAirDisplay = ref(false);

let returnAirTarget = ref('80.6');
let supplyAirTarget = ref('66.2');

let alarm_count = ref(0);

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

// Event log elements
const eventRows = ref([]);
const visibleRows = eventRows.value.slice(0, 40);
let eventsCount = ref(0);
let eventsCountBackground = ref(0);
let eventsExcludeAlarms = ref(false);
let eventsDisableButton = ref(false);

const retrieveEventLogs = async () => {

    eventsDisableButton.value = true;

    await axios.get('/v1/api/events/count', {
        params: {
            'exclude-alarms' : eventsExcludeAlarms.value
        }
    })
    .then(response => {
        if (response.status === 200) {
            data = response.data;

            // parsing retrieved json data
            for (let i = 0; i < data.length; i++){
                eventsCount.value = data[i].count;
            }
        }
    })
    .catch(error => {
        console.error('Error fetching data:', response.status);
    });

    // Pull event log entries
    await axios.get('/v1/api/events/all', {
        params: {
            'exclude-alarms' : eventsExcludeAlarms.value
        }
    })
    .then(response => {
        if (response.status === 200) {
            eventRows.value = response.data;
        }
    })
    .catch(error =>  {
        console.error('Error fetching data:', error);
    });

    setTimeout(() => {
        eventsDisableButton.value = false; 
    }, 2000);
}

const events_bg_difference = computed(() => {
    return eventsCountBackground.value - eventsCount.value
})

// Variables for real time view
let returnAirTempReal = ref('0.0');
let returnAirHumReal = ref('0');
let supplyAirTempReal = ref('0.0');
let supplyAirHumReal = ref('0');
let internalFanReal = ref('0');
let externalFanReal = ref('0');
let condenserMotorReal = ref('0');
let machineActiveReal = ref(false);
let controlModeReal = ref(false);
let returnAirTargetReal = ref('0.0');
let supplyAirTargetReal = ref('0.0');

let returnAirTargetCelsius = ref(0);
let supplyAirTargetCelsius = ref(0);

let ntp_synced = ref(false);
let ntp_synced_text = ref('N/A');
let ntp_synced_server = ref('N/A');
let ntp_synced_led = ref('');

// Variables for Cabinet Status
let cabinet_fault = ref(false);
let cabinet_door_sensor = ref(false);
let cabinet_water_sensor = ref(false);
let cabinet_smoke_sensor = ref(false);

let timestamp = ref('N/A');
let server_time = ref('N/A');

let data = [];
let intervalId;

// Status icon variables
let hasActiveAlarms = ref(false);
let isFanRunning = ref(true);
let isCoolingActive = ref(false);
let isHeatingActive = ref(false);

// Copies of real-time network settings from API
let rt_primary_ipv4_address = ref('');
let rt_primary_ipv6_address = ref([]);
let rt_primary_netmask_address = ref('');
let rt_primary_gateway_address = ref('');
let rt_primary_link = ref('');
let primary_link_led = ref('');

let rt_secondary_ipv4_address = ref('');
let rt_secondary_ipv6_address = ref([]);
let rt_secondary_netmask_address = ref('');
let rt_secondary_gateway_address = ref('');
let rt_secondary_link = ref('');
let secondary_link_led = ref('');

// Software Package Revision variables
let sw_revision = ref('');
let sw_build = ref('');
let sw_release = ref('');

// System Statistics variables
let cpu_usage = ref('');
let led_cpu_usage = ref('');
let load_avg = ref('');
let led_load_avg = ref('');
let memory_used = ref(0);
let memory_total = ref(0);
let led_memory = ref('');
let storage_used = ref(0);
let storage_total = ref(0);
let led_storage = ref('');
let flash_wear = ref(0);
let flash_wear_text = ref('');
let led_flash_wear = ref('');

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
        showToast('danger', "Failed to update machine state!");
        console.log("Error changing machine state! ", error.response.error);
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
        showToast('danger', "Failed to update control mode!");
        console.log("Error changing machine state! ", error.response.error);
    })

}


let uptimeSeconds = ref(0);

const formattedUptime = computed(() => {
  const days = Math.floor(uptimeSeconds.value / (3600 * 24));
  const hours = Math.floor((uptimeSeconds.value % (3600 * 24)) / 3600);
  const minutes = Math.floor((uptimeSeconds.value % 3600) / 60);
  const seconds = uptimeSeconds.value % 60;

  if (days > 0) {
    return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  } else if (hours > 0) {
    return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  } else if (minutes > 0) {
    return `${minutes} minutes, ${seconds} seconds`;
  } else {
    return `${seconds} seconds`;
  }
});

const fetchData = async () => {
    try {
        const response = await axios.get('/v1/api/all'); // Adjust your API endpoint
        if (response.status === 200) {
            data = response.data;

            // parsing retrieved json data
            for (let i = 0; i < data.length; i++){

                usingFahrenheit.value = !!data[i].using_fahrenheit;                
                degreeSymbol.value = usingFahrenheit.value ? '°F' : '°C';

                returnAirTargetReal.value = usingFahrenheit.value ? parseFloat(((data[i].returnAirTargetTemp / 10) * 1.8 + 32).toFixed(1)) : parseFloat((data[i].returnAirTargetTemp / 10).toFixed(1));
                returnAirTempReal.value = usingFahrenheit.value ? parseFloat(((data[i].returnAirTemperature / 10) * 1.8 + 32).toFixed(1)) : parseFloat((data[i].returnAirTemperature / 10).toFixed(1));
                returnAirHumReal.value = data[i].returnAirHumidity < 1000 ? parseFloat((data[i].returnAirHumidity / 10).toFixed(0)) : '-';
                supplyAirTargetReal.value = usingFahrenheit.value ? parseFloat(((data[i].supplyAirTargetTemp / 10) * 1.8 + 32).toFixed(1)) : parseFloat((data[i].supplyAirTargetTemp / 10).toFixed(1));
                supplyAirTempReal.value = usingFahrenheit.value ? parseFloat(((data[i].supplyAirTemperature / 10) * 1.8 + 32).toFixed(1)) : parseFloat((data[i].supplyAirTemperature / 10).toFixed(1));
                supplyAirHumReal.value = data[i].supplyAirHumidity < 1000 ? parseFloat((data[i].supplyAirHumidity / 10).toFixed(0)) : '-';

                // Save Celsius only data for calculations
                returnAirTargetCelsius.value = parseFloat(data[i].returnAirTargetTemp / 10).toFixed(1);
                supplyAirTargetCelsius.value = parseFloat(data[i].supplyAirTargetTemp / 10).toFixed(1);

                internalFanReal.value = parseInt((data[i].internalFanSpeed));
                externalFanReal.value = parseInt((data[i].externalFanSpeed));
                condenserMotorReal.value = parseInt((data[i].inverterCompressorSpeed));
                machineActiveReal.value = !!data[i].machine_active;
                controlModeReal.value = !!data[i].controlModeSetting;

                modbus_connected.value = !!data[i].connected;
                modbus_error.value = data[i].error;

                ntp_synced.value = !!data[i].ntp_synchronized;
                if (ntp_synced.value){
                    ntp_synced_text.value = 'Yes';
                    ntp_synced_led.value = 'images/green.png';
                } else {
                    ntp_synced_text.value = 'No';
                    ntp_synced_led.value = 'images/red.png';
                }
                ntp_synced_server.value = data[i].synchronized_server;

                // Real-Time Network 
                rt_primary_ipv4_address.value = data[i].eth0_ipv4_addr;
                if (data[i].eth0_ipv6_addr){
                    rt_primary_ipv6_address.value = data[i].eth0_ipv6_addr.split('\n');
                }
                rt_primary_netmask_address.value = data[i].eth0_ipv4_netmask;
                rt_primary_gateway_address.value = data[i].eth0_ipv4_gateway;
                rt_primary_link.value = data[i].eth0_link;
                if (rt_primary_link.value === 'up'){
                    primary_link_led.value = 'images/green.png';
                } else {
                    primary_link_led.value = 'images/red.png';
                }

                rt_secondary_ipv4_address.value = data[i].eth1_ipv4_addr;
                if (data[i].eth1_ipv6_addr){
                    rt_secondary_ipv6_address.value = data[i].eth1_ipv6_addr.split('\n');
                }
                rt_secondary_netmask_address.value = data[i].eth1_ipv4_netmask;
                rt_secondary_gateway_address.value = data[i].eth1_ipv4_gateway;
                rt_secondary_link.value = data[i].eth1_link;
                if (rt_secondary_link.value === 'up'){
                    secondary_link_led.value = 'images/green.png';
                } else {
                    secondary_link_led.value = 'images/red.png';
                }

                // System statistics
                cpu_usage.value = data[i].cpu_usage;
                if (cpu_usage.value >= 95){
                    led_cpu_usage.value = 'images/red.png';
                } else {
                    led_cpu_usage.value = 'images/green.png';
                }
                load_avg.value = data[i].load_average;
                memory_used.value = data[i].memory_usage;
                memory_total.value = data[i].memory_total;
                if (memory_used.value > 900){
                    led_memory.value = 'images/red.png';
                } else {
                    led_memory.value = 'images/green.png';
                }
                storage_used.value = data[i].storage_used;
                storage_total.value = data[i].storage_total;
                if (storage_used.value > 4608){
                    led_storage.value = 'images/red.png';
                } else {
                    led_storage.value = 'images/green.png';
                }
                flash_wear.value = data[i].flash_wear;

                if (flash_wear.value <= 10){
                    led_flash_wear.value = 'images/green.png';
                    flash_wear_text.value = 'New (<=10%)'
                } else if (flash_wear.value <= 60){
                    led_flash_wear.value = 'images/green.png';
                    flash_wear_text.value = 'Normal (<=60%)'
                } else if (flash_wear.value <= 90){
                    led_flash_wear.value = 'images/red.png';
                    flash_wear_text.value = 'Warning (<=90%)'
                } else if (flash_wear.value <= 100){
                    led_flash_wear.value = 'images/red.png';
                    flash_wear_text.value = 'Replace Immediately'
                } else {
                    led_flash_wear.value = 'images/green.png';
                }

                // Cabinet status
                cabinet_fault.value = !!data[i].drycontactalarming_active;
                cabinet_door_sensor.value = !!data[i].DoorAlarm_Active;
                cabinet_water_sensor.value = !!data[i].WaterAlarm_Active;
                cabinet_smoke_sensor.value = !!data[i].SmokeAlarm_Active;

                isCoolingActive.value = data[i].cooling_active ? true : false;
                isHeatingActive.value = data[i].heating_active ? true : false;

                if (!machineActiveProcessing.value){
                    machineActiveDisplay.value = machineActiveReal.value;
                }

                if (!controllingAirProcessing.value){
                    controllingAirDisplay.value = controlModeReal.value;
                }

                if (suppress_toasts.value){
                    supplyAirTarget.value = supplyAirTargetReal.value;
                    returnAirTarget.value = returnAirTargetReal.value;
                }


                if ((internalFanReal.value > 0) || (externalFanReal.value > 0) || (condenserMotorReal.value > 0)){
                    isFanRunning.value = true;
                } else {
                    isFanRunning.value = false;
                }
            }

        } else {
            console.error('Error fetching data:', response.status);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }

    // Pull most recent timestamp among data sets
    try {
        const response = await axios.get('/v1/api/timestamp'); // Adjust your API endpoint
        if (response.status === 200) {
            timestamp.value = response.data[0].timestamp;
        } else {
            console.error('Error fetching data:', response.status);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }

    try {
        const response = await axios.get('/v1/api/alarms/active/count'); // Adjust your API endpoint
        if (response.status === 200) {
            data = response.data;

            // parsing retrieved json data
            for (let i = 0; i < data.length; i++){
                alarm_count.value = parseInt(data[i].count);

                if (alarm_count.value > 0){
                    hasActiveAlarms.value = true;
                } else {
                    hasActiveAlarms.value = false;
                }
            }

        } else {
            console.error('Error fetching data:', response.status);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }

    await axios.get('/v1/api/server/time')
    .then(response => {
        if (response.status === 200){
            server_time.value = response.data.server_time;
        }
    })
    .catch(error => {
        console.error('Error retrieving server time!', error);
    });

    await axios.get('/v1/api/edgerack/0/realtime/uptime')
    .then(response => {
        if (response.status === 200){
            uptimeSeconds.value = response.data.uptimeInSeconds;
        }
    })
    .catch(error => {
        console.error('Error retrieving server time!', error);
    });

    await axios.get('/v1/api/events/count', {
        params: {
            'exclude-alarms' : eventsExcludeAlarms.value
        }
    })
    .then(response => {
        if (response.status === 200) {
            data = response.data;

            // parsing retrieved json data
            for (let i = 0; i < data.length; i++){
                eventsCountBackground.value = data[i].count;
            }
        }
    })
    .catch(error => {
        console.error('Error fetching data:', response.status);
    });

};

watch(() => userStore.isLoggedIn,
    (newValue) => {
        loggedIn.value = newValue;
    },
    { immediate: true }
);

let machineActiveProcessing = ref(false);
let machineActiveDisplay = ref(false);
let machineActiveTarget = ref(false);


watch(() => machineActiveReal.value, (newValue, oldValue) => {
    machineActiveProcessing.value = false;

    if (oldValue === false && newValue === true){
        tempMessageCompilation.value = "RCU is now ON!";
        showToast('info', tempMessageCompilation.value);
    } 
    if (oldValue === true && newValue === false) {
        tempMessageCompilation.value = "RCU is now OFF!";
        showToast('info', tempMessageCompilation.value);
    }
}, { immediate: true }
);

watch(() => controlModeReal.value, (newValue, oldValue) => {
    controllingAirProcessing.value = false;

    if (oldValue === false && newValue === true){
        tempMessageCompilation.value = "Now controlling Return Air!";
        showToast('info', tempMessageCompilation.value);
    } 
    if (oldValue === true && newValue === false) {
        tempMessageCompilation.value = "Now controlling Supply Air!";
        showToast('info', tempMessageCompilation.value);
    }
}, { immediate: true }
);


// Variables/functions related to Toast
let tempMessageCompilation = ref('');

let showToast = (str1, str2) => {
    if (!suppress_toasts.value){
        addToast(str1, str2);
    }
}


const retrieveSWRevision = async() => {
  try {
    const response = await axios.get('/v1/api/edgerack/0/realtime/sw-revision')
    if (response.status === 200){
        sw_revision.value = response.data.swversion;
        sw_build.value = response.data.build;
        sw_release.value = response.data.release;
    }
  } catch (error) {
      addToast('danger', `Failed to retrieve software revision data: ${error}`);
  }
};

// Helper functions for temperature icons and formatting
const getTemperatureIcon = (temp) => {
  if (temp < 18) return 'ColdIcon'; 
  if (temp > 25) return 'HeatIcon';
  return 'FanIcon'; 
};

const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const openSetpointModal = () => {
    // Logic to open modal for setpoints
    // For now, just logging
    console.log("Opening setpoint modal...");
};

// Placeholder for systemData if it's not directly available or needs computation
// In a real scenario, this would be populated by fetchData or another computed property
const systemData = computed(() => ({
    ambient_temp: supplyAirTempReal.value, // Using supply air temp as a placeholder
    supply_air_temp: supplyAirTempReal.value,
    return_air_temp: returnAirTempReal.value,
    compressor_1: machineActiveReal.value ? '1' : '0', // Example mapping
    compressor_2: machineActiveReal.value ? '1' : '0', // Example mapping
    fan_speed: internalFanReal.value, // Using internal fan speed as example
    control_mode: controlModeReal.value ? 'Return Air' : 'Supply Air'
}));

const tempUnit = computed(() => usingFahrenheit.value ? 'F' : 'C');

const lastUpdate = computed(() => timestamp.value);


onMounted(async () => {

    setTimeout(() => {
        suppress_toasts.value = false;
    }, 1000);

    try {
        await reportVersion();
    } catch (error){
        console.error('Failed to report version:', error);
    }

    await retrieveSWRevision();
    await retrieveEventLogs();
    await retrieveGeneralConfig();

    loggedIn.value = userStore.isLoggedIn;

    fetchData();
    intervalId = setInterval(fetchData, 1000); // Fetch data every second

});

onUnmounted(() => {
    clearInterval(intervalId); // Clear the interval when the component is unmounted
});

</script>

<style scoped>
/* Ensure the table headers stay fixed during scrolling */
.table-fixed-header th {
  position: sticky;
  top: 0;
  background-color: inherit;
  z-index: 10;
}

/* ControlVue specific styles (these would typically be in a global CSS file or imported) */
.card {
  background-color: theme('colors.slate.800'); /* Example: Using Tailwind's dark background */
  border-radius: theme('borderRadius.3xl'); /* Rounded corners */
  padding: theme('spacing.6');
  box-shadow: theme('boxShadow.lg'); /* Subtle shadow */
  border: 1px solid theme('colors.gray.700'); /* Border for definition */
}

.card-header {
  margin-bottom: theme('spacing.4');
  border-bottom: 1px solid theme('colors.gray.700'); /* Separator */
  padding-bottom: theme('spacing.4');
}

.card-title {
  font-size: theme('fontSize.xl');
  font-weight: theme('fontWeight.bold');
  color: theme('colors.white');
}

.card-description {
  font-size: theme('fontSize.sm');
  color: theme('colors.gray.400'); /* Muted foreground */
}

.card-content {
  /* Styles for the card body content */
}

.card-footer {
  margin-top: theme('spacing.6');
  padding-top: theme('spacing.6');
  border-top: 1px solid theme('colors.gray.700'); /* Separator */
}

.btn-default {
  background-color: theme('colors.blue.600');
  color: theme('colors.white');
  padding: theme('spacing.2') theme('spacing.4');
  border-radius: theme('borderRadius.full');
  font-weight: theme('fontWeight.semibold');
  transition: background-color 0.3s ease;
}

.btn-default:hover {
  background-color: theme('colors.blue.700');
}

.btn-primary {
  background-color: theme('colors.blue.500');
  color: theme('colors.white');
  padding: theme('spacing.2') theme('spacing.4');
  border-radius: theme('borderRadius.full');
  font-weight: theme('fontWeight.semibold');
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: theme('colors.blue.600');
}

.status-online {
  color: theme('colors.green.500');
  font-weight: theme('fontWeight.semibold');
}

.status-offline {
  color: theme('colors.red.500');
  font-weight: theme('fontWeight.semibold');
}

.text-muted-foreground {
  color: theme('colors.gray.400');
}

.text-sm {
  font-size: theme('fontSize.sm');
}

.text-lg {
  font-size: theme('fontSize.lg');
}

.text-xl {
  font-size: theme('fontSize.xl');
}

.font-bold {
  font-weight: theme('fontWeight.bold');
}

.font-semibold {
  font-weight: theme('fontWeight.semibold');
}

.tracking-tight {
  letter-spacing: theme('letterSpacing.tight');
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px; /* full rounded */
  font-size: theme('fontSize.xs');
  font-weight: theme('fontWeight.bold');
  display: inline-block;
}

.badge-secondary {
  background-color: theme('colors.blue.700');
  color: theme('colors.white');
}

.bg-success-500 {
  background-color: theme('colors.green.500');
}

.bg-error-500 {
  background-color: theme('colors.red.500');
}

.system-grid-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: theme('spacing.4');
  border: 1px solid theme('colors.gray.700');
  border-radius: theme('borderRadius.xl');
  background-color: theme('colors.slate.700'); /* Slightly darker background for contrast */
}

.custom-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 1px solid theme('colors.gray.700'); /* Example border */
  border-radius: theme('borderRadius.xl');
  padding: theme('spacing.4');
  background-color: theme('colors.slate.800'); /* Card-like background */
}

.table-label {
  color: theme('colors.gray.400'); /* Muted text for labels */
}

.table-value {
  color: theme('colors.white');
  font-weight: theme('fontWeight.semibold');
}
</style>