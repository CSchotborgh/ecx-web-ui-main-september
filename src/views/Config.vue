<template>
    <ToastComponent />
    <AlertModal 
        :show="showAlertModal" 
        title="Password Change" 
        message="Do you want to apply password change?"
        :onConfirm="handleConfirm"
        @update:show="showAlertModal = $event"
        />
    <UpdateDateTimeModal 
        v-if="showUpdateDateTimeModal"
        :datetime="currentDateTime"
        :isModalOpen="showUpdateDateTimeModal"
        :is12HourFormat="true"
        @close="closeDateTimeModal"
        /> 

    <fwb-modal v-if="showConfirmClearEventLogModal" :style="{top: `${scrollTop}px`, left: `${scrollLeft}px`}" class="fixed z-10" @close="closeConfirmClearEventLogModal">
      <template #body>
          <p class="text-base leading-relaxed text-gray-400">
            This will completely clear all entries in the event log (which includes alarms) and create 
            a new log entry identifying that the event log was cleared. The total event log count will be
            1 when successfully cleared.
            <br/><br/>Event Log Count: {{ eventLogCount }}
            <br/><br/>
            Proceed?
          </p>
      </template>
      <template #footer>
          <div class="flex justify-between">
              <fwb-button @click="closeConfirmClearEventLogModal" color="alternative">Cancel</fwb-button>
              <fwb-button @click="handleClearEventLog" gradient="blue">Accept</fwb-button>
          </div>
      </template>
    </fwb-modal>

        <fwb-modal v-if="showConfirmRebootControllerModal" :style="{top: `${scrollTop}px`, left: `${scrollLeft}px`}" class="fixed z-10" @close="closeConfirmRebootControllerModal">
      <template #body>
          <p class="text-base leading-relaxed text-gray-400">
            This will initiate a reboot command to the Universal Controller, returning into a freshly powered on state.
            If the controller feels sluggish and unresponsive, rebooting may fix the issue.
            <br/><br/>
            Proceed?
          </p>
      </template>
      <template #footer>
          <div class="flex justify-between">
              <fwb-button @click="closeConfirmRebootControllerModal" color="alternative">Cancel</fwb-button>
              <fwb-button @click="handleRebootController" gradient="blue">Accept</fwb-button>
          </div>
      </template>
    </fwb-modal>

    <!-- <fwb-modal v-if="showConfirmRestoreFactoryModal" :style="{top: `${scrollTop}px`, left: `${scrollLeft}px`}" class="fixed z-10" @close="closeConfirmRestoreFactoryModal">
      <template #body>
          <p class="text-base leading-relaxed text-gray-400">
            WARNING! This will completely reset all configurations and event log data (includes alarms), as well
            as restoring the default Enconnex self-signed certificates. All applications will restart and any logged
            in users will be automatically logged out. This WILL reset all network interfaces to the default of
            DHCP enabled, so if you are not using DHCP, expect to lose connection 
            <br /><br/>
            Proceed?
          </p>
      </template>
      <template #footer>
          <div class="flex justify-between">
              <fwb-button @click="closeConfirmRestoreFactoryModal" color="alternative">Cancel</fwb-button>
              <fwb-button @click="handleClearEventLog" gradient="blue">Accept</fwb-button>
          </div>
      </template>
    </fwb-modal> -->

    <main class="container text-white">
      <div class="max-h-fit my-6 grid grid-rows-1 border rounded-3xl bg-slate-800">
        <div class="my-6 mx-2">
          <div class="container flex flex-row">
            <div class="flex items-start text-2xl">Configuration:</div>
          </div>
          
          <div class="container flex flex-row mt-10">
            <div class="flex items-start">General Settings</div>
            <div class="flex gap-3 flex-1 justify-end">
              <button @click="showGeneralSettings = !showGeneralSettings">
                <div v-if="showGeneralSettings">[ - ]</div>
                <div v-else>[ + ]</div>
              </button>
            </div>
          </div>

          <Transition>
              <div v-show="showGeneralSettings" class="border rounded-3xl mx-6 my-2">
                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                  <div class="m-4">
                    <fwb-select
                      v-model="modified_units"
                      :options="unit_options"
                      label="Temperature Units"
                      :placeholder="db_units_name"
                      size="sm"
                      @change="handleUnitChange"
                      >
                    </fwb-select>
                  </div>
                  <div class="m-4">
                    <fwb-select
                      v-model="modified_ntp_enabled"
                      :options="yes_no_options"
                      label="NTP Client Enabled"
                      :placeholder="db_ntp_enabled_name"
                      size="sm"
                      @change="handleNTPSynchronizationChange"
                      >
                    </fwb-select>
                  </div>
                </div>  
                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                  <div class="m-4">
                    <fwb-select
                      v-model="modified_timezone"
                      :options="timezones_options"
                      label="Time Zone"
                      :placeholder="db_timezone_name"
                      size="sm"
                      @change="handleTimezoneChange"
                      >
                    </fwb-select>
                  </div>  
                  <div class="m-4">
                    <fwb-input v-model="modified_ntp_server" label="NTP Server" :placeholder="db_ntp_server">
                      <template #suffix>
                        <fwb-button v-if="showApplyNTPServer" @click="handleNTPServerChange" size="xs" gradient="green">Apply</fwb-button>
                      </template>
                    </fwb-input>
                  </div>
                </div>  
                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                  <div class="m-4">
                    <fwb-input v-model="currentDateTime" label="Controller Local Time (24hr format)" disabled="true">
                      <template #suffix>
                        <fwb-button @click.prevent="openDateTimeModal" gradient="blue" size="xs" pill>Manually Set Date/Time</fwb-button>
                      </template>
                    </fwb-input>
                  </div>  
                </div>  
             </div>  
          </Transition>    

          <div class="flex items-center justify-center w-full">
              <hr class="w-11/12 h-px my-6 bg-gray-200 border-0 dark:bg-gray-300">
          </div>

          <div class="container flex flex-row">
              <div class="flex items-start">Network Settings</div>
              <div class="flex gap-3 flex-1 justify-end">
                  <button @click="showNetworkSettings = !showNetworkSettings">
                      <div v-if="showNetworkSettings">[ - ]</div>
                      <div v-else>[ + ]</div>
                  </button>
              </div>
          </div>

          <Transition>
              <div v-show="showNetworkSettings" class="border rounded-3xl mx-6 my-2">
                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2 mt-4">Real-Time Network</div>
                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2 mt-6">
                  <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                    <div class="m-4">Primary MAC Address:</div>
                    <div class="m-4">{{ rt_primary_mac }}</div>
                  </div>
                  <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                    <div class="m-4">Primary Link Status:</div>
                    <div class="m-4 flex flex-row mx-auto">
                      <div class="flex-2">{{ rt_primary_link }}</div>
                      <div class="flex-1"><img :src="primary_link_led" alt="Link Status" class="ml-2 w-6 h-6" /></div>
                    </div>
                  </div>
                </div>
                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                  <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                    <div class="m-4">Primary IPv4 Address:</div>
                    <div class="m-4">{{ rt_primary_ipv4_address }}</div>
                  </div>
                  <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                    <div class="m-4">Primary IPv4 Netmask:</div>
                    <div class="m-4">{{ rt_primary_ipv4_netmask }}</div>
                  </div>
                </div>
                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                  <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                    <div class="m-4">Primary IPv4 Gateway:</div>
                    <div class="m-4">{{ rt_primary_ipv4_gateway }}</div>
                  </div>
                  <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                    <div class="m-4">Primary IPv4 DNS:</div>
                    <div class="m-4">{{ rt_primary_ipv4_dns }}</div>
                  </div>
                </div>  
                <div class="container mx-auto grid grid-cols-1">
                  <div class="grid grid-cols-1 m-1 text-center border rounded align-middle">
                    <div class="m-4">Primary IPv6 Address(es):</div>
                    <div class="m-1">
                      <ul>
                        <li v-for="(part, index) in rt_primary_ipv6_address" :key="index">{{ part }}</li>
                      </ul>
                    </div>
                  </div>
                </div>  

                <div class="container mx-auto mt-6 grid grid-cols-1 sm:grid-cols-2">
                  <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                    <div class="m-4">Secondary MAC Address:</div>
                    <div class="m-4">{{ rt_secondary_mac }}</div>
                  </div>
                  <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                    <div class="m-4">Secondary Link Status:</div>
                    <div class="m-4 flex flex-row mx-auto">
                      <div class="flex-2">{{ rt_secondary_link }}</div>
                      <div class="flex-1"><img :src="secondary_link_led" alt="Link Status" class="ml-2 w-6 h-6" /></div>
                    </div>
                  </div>
                </div>
                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                  <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                    <div class="m-4">Secondary IPv4 Address:</div>
                    <div class="m-4">{{ rt_secondary_ipv4_address }}</div>
                  </div>
                  <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                    <div class="m-4">Secondary IPv4 Netmask:</div>
                    <div class="m-4">{{ rt_secondary_ipv4_netmask }}</div>
                  </div>
                </div>
                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                  <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                    <div class="m-4">Secondary IPv4 Gateway:</div>
                    <div class="m-4">{{ rt_secondary_ipv4_gateway }}</div>
                  </div>
                  <div class="grid grid-cols-1 m-1 text-center border rounded align-middle sm:grid-cols-2">
                    <div class="m-4">Secondary IPv4 DNS:</div>
                    <div class="m-4">{{ rt_secondary_ipv4_dns }}</div>
                  </div>
                </div>  
                <div class="container mx-auto grid grid-cols-1">
                  <div class="grid grid-cols-1 m-1 text-center border rounded align-middle">
                    <div class="m-4">Secondary IPv6 Address(es):</div>
                    <div class="m-1">
                      <ul>
                        <li v-for="(part, index) in rt_secondary_ipv6_address" :key="index">{{ part }}</li>
                      </ul>
                    </div>
                  </div>
                </div>  

                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2 mt-4">Primary Ethernet</div>
                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                  <div class="m-4">
                    <fwb-select
                      v-model="modified_eth0_interface"
                      :options="enable_disable_options"
                      label="Interface"
                      :placeholder="eth0_db_interface_name"
                      size="sm"
                      @change="handlePrimaryInterfaceChange"
                      >
                    </fwb-select>
                  </div>
                  <div class="m-4 ">
                    <fwb-select
                      v-model="modified_eth0_ipv4_enabled"
                      :options="enable_disable_options"
                      label="IPv4"
                      :placeholder="eth0_db_ipv4_enabled_name"
                      size="sm"
                      @change="handlePrimaryIPv4EnabledChange"
                      >
                    </fwb-select>
                  </div>
                </div>  
                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                  <div class="m-4">
                    <fwb-select
                      v-model="modified_eth0_ipv4_dhcp"
                      :options="enable_disable_options"
                      label="IPv4 DHCP"
                      :placeholder="eth0_db_ipv4_dhcp_name"
                      size="sm"
                      @change="handlePrimaryIPv4DHCPChange"
                      >
                    </fwb-select>
                  </div>
                  <div class="m-4">
                    <fwb-select
                      v-model="modified_eth0_ipv6_enabled"
                      :options="enable_disable_options"
                      label="IPv6"
                      :placeholder="eth0_db_ipv6_enabled_name"
                      size="sm"
                      @change="handlePrimaryIPv6Change"
                      >
                    </fwb-select>
                  </div>

                </div>  
                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                  <div class="m-4 flex flex-col">
                    <fwb-input v-model="modified_eth0_static_ip" label="Static IP (Primary)" :disabled="modified_eth0_ipv4_dhcp == 'enabled'" :placeholder="eth0_db_static_ip" :class="modified_eth0_ipv4_dhcp == 'enabled' ? '!text-gray-500' : '!text-white'">
                      <template #suffix>
                        <fwb-button v-if="showApplyPrimaryStaticIPv4 && isHelper_eth0_static_ipEmpty" @click="handlePrimaryIPv4AddressChange" size="xs" gradient="green">Apply</fwb-button>
                      </template>
                      <template #helper>
                        <div v-show="!isHelper_eth0_static_ipEmpty" class="justify-center text-red-400">{{ helper_eth0_static_ip }}</div>
                      </template>
                    </fwb-input>
                  </div>
                  <div class="m-4">
                    <fwb-input v-model="modified_eth0_ipv4_netmask" label="Netmask (Primary)" :disabled="modified_eth0_ipv4_dhcp == 'enabled'" :placeholder="eth0_db_ipv4_netmask" :class="modified_eth0_ipv4_dhcp == 'enabled' ? '!text-gray-500' : '!text-white'">
                      <template #suffix>
                        <fwb-button v-if="showApplyPrimaryNetmaskIPv4 && isHelper_eth0_ipv4_netmaskEmpty" @click="handlePrimaryIPv4NetmaskChange" size="xs" gradient="green">Apply</fwb-button>
                      </template>
                      <template #helper>
                        <div v-show="!isHelper_eth0_ipv4_netmaskEmpty" class="justify-center text-red-400">{{ helper_eth0_ipv4_netmask }}</div>
                      </template>
                    </fwb-input>
                  </div>

                </div>
                
                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                  <div class="m-4 flex flex-col">
                    <fwb-input v-model="modified_eth0_ipv4_gateway" label="Gateway Address (Primary)" :disabled="modified_eth0_ipv4_dhcp == 'enabled'" :placeholder="eth0_db_ipv4_gateway" :class="modified_eth0_ipv4_dhcp == 'enabled' ? '!text-gray-500' : '!text-white'">
                      <template #suffix>
                        <fwb-button v-if="showApplyPrimaryGateway && isHelper_eth0_gateway_ipEmpty" @click="handlePrimaryIPv4GatewayChange" size="xs" gradient="green">Apply</fwb-button>
                      </template>
                      <template #helper>
                        <div v-show="!isHelper_eth0_gateway_ipEmpty" class="justify-center text-red-400">{{ helper_eth0_gateway_ip }}</div>
                      </template>
                    </fwb-input>
                  </div>
                  <div class="m-4">
                  </div>
                </div>

                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2 mt-10">Secondary Ethernet</div>
                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                  <div class="m-4">
                    <fwb-select
                      v-model="modified_eth1_interface"
                      :options="enable_disable_options"
                      label="Interface"
                      :placeholder="eth1_db_interface_name"
                      size="sm"
                      @change="handleSecondaryInterfaceChange"
                      >
                    </fwb-select>
                  </div>
                  <div class="m-4">
                    <fwb-select
                      v-model="modified_eth1_ipv4_enabled"
                      :options="enable_disable_options"
                      label="IPv4"
                      :placeholder="eth1_db_ipv4_enabled_name"
                      size="sm"
                      @change="handleSecondaryIPv4EnabledChange"
                      >
                    </fwb-select>
                  </div>
                </div>  
                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                  <div class="m-4">
                    <fwb-select
                      v-model="modified_eth1_ipv4_dhcp"
                      :options="enable_disable_options"
                      label="IPv4 DHCP"
                      :placeholder="eth1_db_ipv4_dhcp_name"
                      size="sm"
                      @change="handleSecondaryIPv4DHCPChange"
                      >
                    </fwb-select>
                  </div>
                  <div class="m-4">
                    <fwb-select
                      v-model="modified_eth1_ipv6_enabled"
                      :options="enable_disable_options"
                      label="IPv6"
                      :placeholder="eth1_db_ipv6_enabled_name"
                      size="sm"
                      @change="handleSecondaryIPv6Change"
                      >
                    </fwb-select>
                  </div>
                </div>  

                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                  <div class="m-4 flex flex-col">
                    <fwb-input v-model="modified_eth1_static_ip" label="Static IP (Secondary)" :disabled="modified_eth1_ipv4_dhcp == 'enabled'" :placeholder="eth1_db_static_ip" :class="modified_eth1_ipv4_dhcp == 'enabled' ? '!text-gray-500' : '!text-white'">
                      <template #suffix>
                        <fwb-button v-if="showApplySecondaryStaticIPv4 && isHelper_eth1_static_ipEmpty" @click="handleSecondaryIPv4AddressChange" size="xs" gradient="green">Apply</fwb-button>
                      </template>
                      <template #helper>
                        <div v-show="!isHelper_eth1_static_ipEmpty" class="justify-center text-red-400">{{ helper_eth1_static_ip }}</div>
                      </template>
                   </fwb-input>
                  </div>
                  <div class="m-4">
                    <fwb-input v-model="modified_eth1_ipv4_netmask" label="Netmask (Secondary)" :disabled="modified_eth1_ipv4_dhcp == 'enabled'" :placeholder="eth1_db_ipv4_netmask" :class="modified_eth1_ipv4_dhcp == 'enabled' ? '!text-gray-500' : '!text-white'">
                      <template #suffix>
                        <fwb-button v-if="showApplySecondaryNetmaskIPv4 && isHelper_eth1_ipv4_netmaskEmpty" @click="handleSecondaryIPv4NetmaskChange" size="xs" gradient="green">Apply</fwb-button>
                      </template>
                      <template #helper>
                        <div v-show="!isHelper_eth1_ipv4_netmaskEmpty" class="justify-center text-red-400">{{ helper_eth1_ipv4_netmask }}</div>
                      </template>
                    </fwb-input>
                  </div>
                </div>  

                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                  <div class="m-4 flex flex-col">
                    <fwb-input v-model="modified_eth1_ipv4_gateway" label="Gateway Address (Secondary)" :disabled="modified_eth1_ipv4_dhcp == 'enabled'" :placeholder="eth1_db_ipv4_gateway" :class="modified_eth1_ipv4_dhcp == 'enabled' ? '!text-gray-500' : '!text-white'">
                      <template #suffix>
                        <fwb-button v-if="showApplySecondaryGateway && isHelper_eth1_gateway_ipEmpty" @click="handleSecondaryIPv4GatewayChange" size="xs" gradient="green">Apply</fwb-button>
                      </template>
                      <template #helper>
                        <div v-show="!isHelper_eth1_gateway_ipEmpty" class="justify-center text-red-400">{{ helper_eth1_gateway_ip }}</div>
                      </template>
                    </fwb-input>
                  </div>
                  <div class="m-4">
                  </div>
                </div>

              </div>    
          </Transition>    

          <div class="flex items-center justify-center w-full">
              <hr class="w-11/12 h-px my-6 bg-gray-200 border-0 dark:bg-gray-300">
          </div>

          <div class="container flex flex-row">
              <div class="flex items-start">Administration Controls</div>
              <div class="flex gap-3 flex-1 justify-end">
                  <button @click="showAdminSettings = !showAdminSettings">
                      <div v-if="showAdminSettings">[ - ]</div>
                      <div v-else>[ + ]</div>
                  </button>
              </div>
          </div>

          <Transition>
              <div v-show="showAdminSettings" class="border rounded-3xl mx-6 my-2">
                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                  <div class="m-4">
                    <fwb-button @click.prevent="openConfirmClearEventLogModal" gradient="red" pill>Clear Event Log</fwb-button>
                  </div>
                  <div class="m-4 pt-2">
                    Event Log Count: {{ eventLogCount }}
                  </div>
                </div>  
                <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2">
                  <div class="m-4">
                    <fwb-button @click.prevent="openConfirmRebootControllerModal" gradient="red" pill>Reboot Controller</fwb-button>
                  </div>
                  <div class="m-4 pt-2">
                    Uptime: {{ formattedUptime }}
                  </div>
                </div>  

             </div>  
          </Transition>    

        </div>
      </div>
    </main>
</template>


<script setup>
import { ref, watch, onMounted, computed, onUnmounted } from 'vue';
import { useUserStore } from '../stores/user.js';
import { addToast } from '@/stores/toastManager.js';
import ToastComponent from '@/components/ToastComponent.vue';
import { FwbInput, FwbButton, FwbSelect, FwbModal } from 'flowbite-vue';
import AlertModal from '@/components/AlertModal.vue';
import axios from 'axios';
import UpdateDateTimeModal from '@/components/UpdateDateTimeModal.vue';



const showGeneralSettings = ref(true);
const showNetworkSettings = ref(true);
const showAdminSettings = ref(true);
const showAlertModal = ref(false);
const showUpdateDateTimeModal = ref(false);
const showConfirmClearEventLogModal = ref(false);
const showConfirmRestoreFactoryModal = ref(false);
const showConfirmRebootControllerModal = ref(false);

// Date/Time settings
let currentDateTime = ref('');
const closeDateTimeModal = () => {
  showUpdateDateTimeModal.value = false;
}
const openDateTimeModal = () => {
  showUpdateDateTimeModal.value = true;
}

// Administration Settings
let eventLogCount = ref(0);

const closeConfirmClearEventLogModal = () => {
  showConfirmClearEventLogModal.value = false;
}
const openConfirmClearEventLogModal = () => {
  showConfirmClearEventLogModal.value = true;
}

const handleClearEventLog = async (event) => {
  showConfirmClearEventLogModal.value = false;

  try {
    await axios.put('/v1/api/events/clear');
    addToast('success', `Successfully cleared Event Log!`);
  } catch (error) {
    addToast('danger', `Failed to clear Event Log! ${error}`);
  }
};

const handleRebootController = async () => {
  showConfirmRebootControllerModal.value = false;

  try {
    await axios.post('/v1/api/edgerack/0/reboot');
    addToast('success', `Controller is rebooting!`);
  } catch (error) {
    addToast('danger', `Failed to send reboot command! ${error}`);
  }
};

const closeConfirmRebootControllerModal = () => {
  showConfirmRebootControllerModal.value = false;
}

const openConfirmRebootControllerModal = () => {
  showConfirmRebootControllerModal.value = true;
}

const closeConfirmRestoreFactoryModal = () => {
  showConfirmRestoreFactoryModal.value = false;
}
const openConfirmRestoreFactoryModal = () => {
  showConfirmRestoreFactoryModal.value = true;
}

// Network settings as modified by user
let modified_eth0_interface = ref('');
let modified_eth0_ipv4_enabled = ref('');
let modified_eth0_ipv4_dhcp = ref('');
let modified_eth0_static_ip = ref('');
let modified_eth0_ipv4_netmask = ref('');
let modified_eth0_ipv4_gateway = ref('');
let modified_eth0_ipv6_enabled = ref('');

let modified_eth1_interface = ref('');
let modified_eth1_ipv4_enabled = ref('');
let modified_eth1_ipv4_dhcp = ref('');
let modified_eth1_static_ip = ref('');
let modified_eth1_ipv4_netmask = ref('');
let modified_eth1_ipv4_gateway = ref('');
let modified_eth1_ipv6_enabled = ref('');

let modified_units = ref('');
let modified_timezone = ref('');
let modified_ntp_enabled = ref('');
let modified_ntp_server = ref('');

// Copies of network settings from API
let eth0_db_interface = ref('');
let eth0_db_ipv4_enabled = ref('');
let eth0_db_ipv4_dhcp = ref('');
let eth0_db_static_ip = ref('');
let eth0_db_ipv4_netmask = ref('');
let eth0_db_ipv4_gateway = ref('');
let eth0_db_ipv6_enabled = ref('');

let eth1_db_interface = ref('');
let eth1_db_ipv4_enabled = ref('');
let eth1_db_ipv4_dhcp = ref('');
let eth1_db_static_ip = ref('');
let eth1_db_ipv4_netmask = ref('');
let eth1_db_ipv4_gateway = ref('');
let eth1_db_ipv6_enabled = ref('');

// Copies of general settings from API
let db_units = ref('');
let db_timezone = ref('');
let db_ntp_enabled = ref('');
let db_ntp_server = ref('');

// Copies of real-time network settings from API
let rt_primary_ipv4_address = ref('');
let rt_primary_ipv4_netmask = ref('');
let rt_primary_ipv4_gateway = ref('');
let rt_primary_ipv4_dns = ref('');
let rt_primary_ipv6_address = ref([]);
let rt_primary_mac = ref('');
let rt_primary_link = ref('');
let primary_link_led = ref('');

let rt_secondary_ipv4_address = ref('');
let rt_secondary_ipv4_netmask = ref('');
let rt_secondary_ipv4_gateway = ref('');
let rt_secondary_ipv4_dns = ref('');
let rt_secondary_ipv6_address = ref([]);
let rt_secondary_mac = ref('');
let rt_secondary_link = ref('');
let secondary_link_led = ref('');

const inputUptimeSeconds = ref(0)

function formatDuration(seconds) {
  const days = Math.floor(seconds / 86400)
  seconds %= 86400
  const hours = Math.floor(seconds / 3600)
  seconds %= 3600
  const minutes = Math.floor(seconds / 60)
  seconds %= 60

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`)

  return parts.join(' ')
}

const formattedUptime = computed(() => formatDuration(inputUptimeSeconds.value))

const enable_disable_options = [
  { value: 'disabled', name: 'Disabled'},
  { value: 'enabled', name: 'Enabled' }
]

// Temperature units related
const unit_options = [
  { value: 'celsius', name: 'Celsius'},
  { value: 'fahrenheit', name: 'Fahrenheit'},
]

const getUnitName = (value) => {
  const unit = unit_options.find(option => option.value === value);
  return unit ? unit.name : '';
};

const db_units_name = computed(() => getUnitName(db_units.value));

// NTP Enabled related
const yes_no_options = [
  { value: 'no', name: 'No'},
  { value: 'yes', name: 'Yes'}
]

const getNTPEnabledName = (value) => {
  const unit = yes_no_options.find(option => option.value === value);
  return unit ? unit.name : '';
};

const db_ntp_enabled_name = computed(() => getNTPEnabledName(db_ntp_enabled.value));

// Time zone related
const timezones_options = [
  { value: 'Alaska', name: 'Alaska' },
  { value: 'Aleutian', name: 'Aleutian' },
  { value: 'Arizona', name: 'Arizona' },
  { value: 'Central', name: 'Central' },
  { value: 'East-Indiana', name: 'East-Indiana' },
  { value: 'Eastern', name: 'Eastern' },
  { value: 'Hawaii', name: 'Hawaii' },
  { value: 'Indiana-Starke', name: 'Indiana-Starke' },
  { value: 'Michigan', name: 'Michigan' },
  { value: 'Mountain', name: 'Mountain' },
  { value: 'Pacific', name: 'Pacific' },
  { value: 'Samoa', name: 'Samoa' }
];

const getTimezoneName = (value) => {
  const unit = timezones_options.find(option => option.value === value);
  return unit ? unit.name : '';
}

const db_timezone_name = computed(() => getTimezoneName(db_timezone.value));

// Primary and Secondary Network Interface related

const getEnabledDisabledSelection = (value) => {
  const selection = enable_disable_options.find(option => option.value === value);
  return selection ? selection.name : '';
}

const eth0_db_interface_name = computed(() => getEnabledDisabledSelection(eth0_db_interface.value));
const eth0_db_ipv4_enabled_name = computed(() => getEnabledDisabledSelection(eth0_db_ipv4_enabled.value));
const eth0_db_ipv4_dhcp_name = computed(() => getEnabledDisabledSelection(eth0_db_ipv4_dhcp.value));
const eth0_db_ipv6_enabled_name = computed(() => getEnabledDisabledSelection(eth0_db_ipv6_enabled.value));

const eth1_db_interface_name = computed(() => getEnabledDisabledSelection(eth1_db_interface.value));
const eth1_db_ipv4_enabled_name = computed(() => getEnabledDisabledSelection(eth1_db_ipv4_enabled.value));
const eth1_db_ipv4_dhcp_name = computed(() => getEnabledDisabledSelection(eth1_db_ipv4_dhcp.value));
const eth1_db_ipv6_enabled_name = computed(() => getEnabledDisabledSelection(eth1_db_ipv6_enabled.value));


const selectedTimezone = ref(timezones_options[0]);

const handleUnitChange = async (event) => {
  modified_units.value = event.target.value;

  try {
    const response = await axios.put('/v1/api/edgerack/0/config/general', {
      units: modified_units.value
    });
    addToast('success', `Units changed to ${modified_units.value}!`);
  } catch (error) {
    addToast('danger', `Failed to update units! ${error}`);
  }

  await retrieveGeneralConfig();
  copyRetrievedToModifyVariables();
};

const handleNTPSynchronizationChange = async (event) => {
  modified_ntp_enabled.value = event.target.value;

  try {
    const response = await axios.put('/v1/api/edgerack/0/config/general', {
      'ntp-enabled': modified_ntp_enabled.value
    });
    addToast('success', `NTP synchronization changed to ${modified_ntp_enabled.value}!`);
  } catch (error) {
    addToast('danger', `Failed to update units! ${error}`);
  }

  await retrieveGeneralConfig();
  copyRetrievedToModifyVariables();
};


const handleTimezoneChange = async (event) => {
  selectedTimezone.value = event.target.value;
  await applyTimezone();
};

const applyTimezone = async () => {
  try {
    const response = await axios.put('/v1/api/edgerack/0/config/general', {
      timezone: selectedTimezone.value
    });
    addToast('success', `Timezone changed to: ${selectedTimezone.value}!`)
  } catch (error) {
    addToast('danger', `Failed to update timezone! ${error}!`)
  }

  await retrieveGeneralConfig();
  copyRetrievedToModifyVariables();
};

const handleNTPServerChange = async () => {
  try {
    const response = await axios.put('/v1/api/edgerack/0/config/general', {
      "ntp-server": modified_ntp_server.value
    });
    addToast('success', `NTP Server changed to: ${modified_ntp_server.value}!`);
  } catch (error) {
    addToast('danger', `Failed to update ntp server! ${error}`);
  }

  await retrieveGeneralConfig();
  copyRetrievedToModifyVariables();
};

const handlePrimaryInterfaceChange = async (event) => {
  modified_eth0_interface.value = event.target.value;

  try {
    const response = await axios.put('/v1/api/edgerack/0/config/network/1', {
      interface: modified_eth0_interface.value
    });
    addToast('success', `Primary Interface ${modified_eth0_interface.value}!`);
  } catch (error) {
    addToast('danger', `Failed to update primary interface! ${error}`);
  }
  await retrievePrimaryNetworkConfig();
  copyRetrievedToModifyVariables();
};

const handlePrimaryIPv4EnabledChange = async (event) => {
  modified_eth0_ipv4_enabled.value = event.target.value;

  try {
    const response = await axios.put('/v1/api/edgerack/0/config/network/1', {
      IPv4: modified_eth0_ipv4_enabled.value
    });
    addToast('success', `Primary IPv4 ${modified_eth0_ipv4_enabled.value}!`);
  } catch (error) {
    addToast('danger', `Failed to update IPv4 state! ${error}`);
  }
  await retrievePrimaryNetworkConfig();
  copyRetrievedToModifyVariables();
};

const handlePrimaryIPv4DHCPChange = async (event) => {
  modified_eth0_ipv4_dhcp.value = event.target.value;

  try {
    const response = await axios.put('/v1/api/edgerack/0/config/network/1', {
      "IPv4-DHCP": modified_eth0_ipv4_dhcp.value
    });
    addToast('success', `Primary IPv4 DHCP ${modified_eth0_ipv4_dhcp.value}!`);
  } catch (error) {
    addToast('danger', `Failed to update IPv4 DHCP state! ${error}`);
  }
  await retrievePrimaryNetworkConfig();
  copyRetrievedToModifyVariables();
};

const handlePrimaryIPv4AddressChange = async () => {
  try {
    const response = await axios.put('/v1/api/edgerack/0/config/network/1', {
      "IPv4-address": modified_eth0_static_ip.value
    });
    addToast('success', `Primary IPv4 address changed to: ${modified_eth0_static_ip.value}!`);
  } catch (error) {
    addToast('danger', `Failed to update primary IPv4 address! ${error}`);
  }
  await retrievePrimaryNetworkConfig();
  copyRetrievedToModifyVariables();
};

const handlePrimaryIPv4NetmaskChange = async () => {
  try {
    const response = await axios.put('/v1/api/edgerack/0/config/network/1', {
      "IPv4-netmask": modified_eth0_ipv4_netmask.value
    });
    addToast('success', `Primary IPv4 netmask changed to: ${modified_eth0_ipv4_netmask.value}!`);
  } catch (error) {
    addToast('danger', `Failed to update primary IPv4 netmask! ${error}`);
  }
  await retrievePrimaryNetworkConfig();
  copyRetrievedToModifyVariables();
};

const handlePrimaryIPv4GatewayChange = async () => {
  try {
    const response = await axios.put('/v1/api/edgerack/0/config/network/1', {
      "IPv4-gateway": modified_eth0_ipv4_gateway.value
    });
    addToast('success', `Primary IPv4 Gateway address changed to: ${modified_eth0_ipv4_gateway.value}!`);
  } catch (error) {
    addToast('danger', `Failed to update primary IPv4 Gateway address! ${error}`);
  }
  await retrievePrimaryNetworkConfig();
  copyRetrievedToModifyVariables();
};

const handlePrimaryIPv6Change = async (event) => {
  modified_eth0_ipv6_enabled.value = event.target.value;

  try {
    const response = await axios.put('/v1/api/edgerack/0/config/network/1', {
      IPv6: modified_eth0_ipv6_enabled.value
    });
    addToast('success', `Primary IPv6 ${modified_eth0_ipv6_enabled.value}!`);
  } catch (error) {
    addToast('danger', `Failed to update IPv6 state! ${error}`);
  }
  await retrievePrimaryNetworkConfig();
  copyRetrievedToModifyVariables();
};

const handleSecondaryInterfaceChange = async (event) => {
  modified_eth1_interface.value = event.target.value;

  try {
    const response = await axios.put('/v1/api/edgerack/0/config/network/2', {
      interface: modified_eth1_interface.value
    });
    addToast('success', `Secondary Interface ${modified_eth1_interface.value}!`);
  } catch (error) {
    addToast('danger', `Failed to update secondary interface! ${error}`);
  }
  await retrieveSecondaryNetworkConfig();
  copyRetrievedToModifyVariables();
};

const handleSecondaryIPv4EnabledChange = async (event) => {
  modified_eth1_ipv4_enabled.value = event.target.value;

  try {
    const response = await axios.put('/v1/api/edgerack/0/config/network/2', {
      IPv4: modified_eth1_ipv4_enabled.value
    });
    addToast('success', `Secondary IPv4 ${modified_eth1_ipv4_enabled.value}!`);
  } catch (error) {
    addToast('danger', `Failed to update IPv4 state! ${error}`);
  }
  await retrieveSecondaryNetworkConfig();
  copyRetrievedToModifyVariables();
};

const handleSecondaryIPv4DHCPChange = async (event) => {
  modified_eth1_ipv4_dhcp.value = event.target.value;

  try {
    const response = await axios.put('/v1/api/edgerack/0/config/network/2', {
      "IPv4-DHCP": modified_eth1_ipv4_dhcp.value
    });
    addToast('success', `Secondary IPv4 DHCP ${modified_eth1_ipv4_dhcp.value}!`);
  } catch (error) {
    addToast('danger', `Failed to update Secondary IPv4 DHCP state! ${error}`);
  }
  await retrieveSecondaryNetworkConfig();
  copyRetrievedToModifyVariables();
};

const handleSecondaryIPv4AddressChange = async () => {
  try {
    const response = await axios.put('/v1/api/edgerack/0/config/network/2', {
      "IPv4-address": modified_eth1_static_ip.value
    });
    addToast('success', `Secondary IPv4 address changed to: ${modified_eth1_static_ip.value}!`);
  } catch (error) {
    addToast('danger', `Failed to update secondary IPv4 address! ${error}`);
  }
  await retrieveSecondaryNetworkConfig();
  copyRetrievedToModifyVariables();
};

const handleSecondaryIPv4NetmaskChange = async () => {
  try {
    const response = await axios.put('/v1/api/edgerack/0/config/network/2', {
      "IPv4-netmask": modified_eth1_ipv4_netmask.value
    });
    addToast('success', `Secondary IPv4 netmask changed to: ${modified_eth1_ipv4_netmask.value}!`);
  } catch (error) {
    addToast('danger', `Failed to update secondary IPv4 netmask! ${error}`);
  }
  await retrieveSecondaryNetworkConfig();
  copyRetrievedToModifyVariables();
};

const handleSecondaryIPv4GatewayChange = async () => {
  try {
    const response = await axios.put('/v1/api/edgerack/0/config/network/2', {
      "IPv4-gateway": modified_eth1_ipv4_gateway.value
    });
    addToast('success', `Secondary IPv4 Gateway address changed to: ${modified_eth1_ipv4_gateway.value}!`);
  } catch (error) {
    addToast('danger', `Failed to update Secondary IPv4 Gateway address! ${error}`);
  }
  await retrievePrimaryNetworkConfig();
  copyRetrievedToModifyVariables();
};

const handleSecondaryIPv6Change = async (event) => {
  modified_eth1_ipv6_enabled.value = event.target.value;

  try {
    const response = await axios.put('/v1/api/edgerack/0/config/network/2', {
      IPv6: modified_eth1_ipv6_enabled.value
    });
    addToast('success', `Secondary IPv6 ${modified_eth1_ipv6_enabled.value}!`);
  } catch (error) {
    addToast('danger', `Failed to update secondary IPv6 state! ${error}`);
  }
  await retrieveSecondaryNetworkConfig();
  copyRetrievedToModifyVariables();
};


const userStore = useUserStore();
const loggedIn = ref(userStore.isLoggedIn);
const user = ref(userStore.loggedInUser);

const validateIPv4 = (input) => {
  const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Pattern.test(input);
};

let helper_eth0_static_ip = ref('');
const isHelper_eth0_static_ipEmpty = computed (() => helper_eth0_static_ip.value === '');

watch(modified_eth0_static_ip, (newVal) => {
  if (validateIPv4(newVal)) {
    helper_eth0_static_ip.value = '';
  } else {
    helper_eth0_static_ip.value = 'Invalid IP Address.';
  }
});

let helper_eth0_gateway_ip = ref('');
const isHelper_eth0_gateway_ipEmpty = computed (() => helper_eth0_gateway_ip.value === '');

watch(modified_eth0_ipv4_gateway, (newVal) => {
  if (validateIPv4(newVal)) {
    helper_eth0_gateway_ip.value = '';
  } else {
    helper_eth0_gateway_ip.value = 'Invalid Gateway Address.';
  }
});


let helper_eth1_static_ip = ref('');
const isHelper_eth1_static_ipEmpty = computed (() => helper_eth1_static_ip.value === '');

watch(modified_eth1_static_ip, (newVal) => {
  if (validateIPv4(newVal)) {
    helper_eth1_static_ip.value = '';
  } else {
    helper_eth1_static_ip.value = 'Invalid IP Address.';
  }
});

let helper_eth1_gateway_ip = ref('');
const isHelper_eth1_gateway_ipEmpty = computed (() => helper_eth1_gateway_ip.value === '');

watch(modified_eth1_ipv4_gateway, (newVal) => {
  if (validateIPv4(newVal)) {
    helper_eth1_gateway_ip.value = '';
  } else {
    helper_eth1_gateway_ip.value = 'Invalid Gateway Address.';
  }
});


const validateNetmask = (input) => {
  const netmaskPattern = /^(254|252|248|240|224|192|128|0)\.0\.0\.0$|^255\.(254|252|248|240|224|192|128|0)\.0\.0$|^255\.255\.(254|252|248|240|224|192|128|0)\.0$|^255\.255\.255\.(254|252|248|240|224|192|128|0)$/;
  return netmaskPattern.test(input);
};

let helper_eth0_ipv4_netmask = ref('');
const isHelper_eth0_ipv4_netmaskEmpty = computed (() => helper_eth0_ipv4_netmask.value === '');

watch(modified_eth0_ipv4_netmask, (newVal) => {
  if (validateNetmask(newVal)) {
    helper_eth0_ipv4_netmask.value = '';
  } else {
    helper_eth0_ipv4_netmask.value = 'Invalid netmask.';
  }
});

let helper_eth1_ipv4_netmask = ref('');
const isHelper_eth1_ipv4_netmaskEmpty = computed (() => helper_eth1_ipv4_netmask.value === '');

watch(modified_eth1_ipv4_netmask, (newVal) => {
  if (validateNetmask(newVal)) {
    helper_eth1_ipv4_netmask.value = '';
  } else {
    helper_eth1_ipv4_netmask.value = 'Invalid netmask.';
  }
});


// Keep watching for login state to react immediately on any change
watch(() => userStore.isLoggedIn,
  (newValue) => {
    loggedIn.value = newValue;
  },
  { immediate: true }
);

watch(() => userStore.loggedInUser,
  (newValue) => {
    user.value = newValue;
  },
  { immediate: true }
);


const showApplyPrimaryStaticIPv4 = computed(() => modified_eth0_static_ip.value !== eth0_db_static_ip.value)
const showApplyPrimaryNetmaskIPv4 = computed(() => modified_eth0_ipv4_netmask.value !== eth0_db_ipv4_netmask.value)
const showApplyPrimaryGateway = computed(() => modified_eth0_ipv4_gateway.value !== eth0_db_ipv4_gateway.value)

const showApplySecondaryStaticIPv4 = computed(() => modified_eth1_static_ip.value !== eth1_db_static_ip.value)
const showApplySecondaryNetmaskIPv4 = computed(() => modified_eth1_ipv4_netmask.value !== eth1_db_ipv4_netmask.value)
const showApplySecondaryGateway = computed(() => modified_eth1_ipv4_gateway.value !== eth1_db_ipv4_gateway.value)

const showApplyNTPServer = computed(() => modified_ntp_server.value !== db_ntp_server.value)


const copyRetrievedToModifyVariables = () => {

    modified_eth0_interface.value = eth0_db_interface.value;
    modified_eth0_ipv4_enabled.value = eth0_db_ipv4_enabled.value;
    modified_eth0_ipv4_dhcp.value = eth0_db_ipv4_dhcp.value;
    modified_eth0_static_ip.value = eth0_db_static_ip.value;
    modified_eth0_ipv4_netmask.value = eth0_db_ipv4_netmask.value;
    modified_eth0_ipv4_gateway.value = eth0_db_ipv4_gateway.value;
    modified_eth0_ipv6_enabled.value = eth0_db_ipv6_enabled.value;

    modified_eth1_interface.value = eth1_db_interface.value;
    modified_eth1_ipv4_enabled.value = eth1_db_ipv4_enabled.value;
    modified_eth1_ipv4_dhcp.value = eth1_db_ipv4_dhcp.value;
    modified_eth1_static_ip.value = eth1_db_static_ip.value;
    modified_eth1_ipv4_netmask.value = eth1_db_ipv4_netmask.value;
    modified_eth1_ipv4_gateway.value = eth1_db_ipv4_gateway.value;
    modified_eth1_ipv6_enabled.value = eth1_db_ipv6_enabled.value;

    modified_units.value = db_units.value;
    modified_timezone.value = db_timezone.value;
    selectedTimezone.value = db_timezone.value;
    modified_ntp_enabled.value = db_ntp_enabled.value;
    modified_ntp_server.value = db_ntp_server.value;
}

const retrievePrimaryNetworkConfig = async() => {
  try {
      const response = await axios.get('/v1/api/edgerack/0/config/network/1')
      if (response.status === 200){
          eth0_db_interface.value = response.data[0].interface;
          eth0_db_ipv4_enabled.value = response.data[0].IPv4;
          eth0_db_ipv4_dhcp.value = response.data[0]['IPv4-DHCP'];
          eth0_db_static_ip.value = response.data[0]['IPv4-address'];
          eth0_db_ipv4_netmask.value = response.data[0]['IPv4-netmask'];
          eth0_db_ipv4_gateway.value = response.data[0]['IPv4-gateway'];
          eth0_db_ipv6_enabled.value = response.data[0].IPv6;
      }
  } catch (error) {
      addToast('danger', `Failed to retrieve primary network config: ${error}`);
  }
};

const retrieveSecondaryNetworkConfig = async() => {
  try {
    const response = await axios.get('/v1/api/edgerack/0/config/network/2')
    if (response.status === 200){
        eth1_db_interface.value = response.data[0].interface;
        eth1_db_ipv4_enabled.value = response.data[0].IPv4;
        eth1_db_ipv4_dhcp.value = response.data[0]['IPv4-DHCP'];
        eth1_db_static_ip.value = response.data[0]['IPv4-address'];
        eth1_db_ipv4_netmask.value = response.data[0]['IPv4-netmask'];
        eth1_db_ipv4_gateway.value = response.data[0]['IPv4-gateway'];
        eth1_db_ipv6_enabled.value = response.data[0].IPv6;
    }
  } catch (error) {
      addToast('danger', `Failed to retrieve secondary network config: ${error}`);
  }
};

const retrieveGeneralConfig = async() => {
  try {
      const response = await axios.get('/v1/api/edgerack/0/config/general')
      if (response.status === 200){
        db_units.value = response.data[0].units;
        db_timezone.value = response.data[0].timezone;
        db_ntp_enabled.value = response.data[0]['ntp-enabled'];
        db_ntp_server.value = response.data[0]['ntp-server'];

      }
  } catch (error) {
      addToast('danger', `Failed to retrieve secondary network config: ${error}`);
  }
};

const retrieveCurrentServerDateTime = async () => {
  try {
    const response = await axios.get('/v1/api/server/time')
    if (response.status === 200){
      currentDateTime.value = response.data.server_time;
    }
  } catch (error){
    addToast('danger', `Failed to retrieve server date/time: ${error}`);
  }
};

const retrieveControllerUptime = async () => {
  try {
    const response = await axios.get('/v1/api/edgerack/0/realtime/uptime')
    if (response.status === 200){
      inputUptimeSeconds.value = response.data.uptimeInSeconds;
    }
  } catch (error){
    addToast('danger', `Failed to retrieve server uptime: ${error}`);
  }
};

const retrieveRealtimeNetwork = async() => {
  try {
      const response = await axios.get('/v1/api/edgerack/0/realtime/network')
      if (response.status === 200){
        rt_primary_ipv4_address.value = response.data[0]['primary-IPv4-address'];
        rt_primary_ipv4_netmask.value = response.data[0]['primary-IPv4-netmask'];
        rt_primary_ipv4_gateway.value = response.data[0]['primary-IPv4-gateway'];
        rt_primary_ipv4_dns.value = response.data[0]['primary-IPv4-dns'];
        if (response.data[0]['primary-IPv6-address']){
            rt_primary_ipv6_address.value = response.data[0]['primary-IPv6-address'].split('\n');
        }
        rt_primary_mac.value = response.data[0]['primary-Interface-MAC'];
        rt_primary_link.value = response.data[0]['primary-Interface-Link'];
        if (rt_primary_link.value === 'connected'){
          primary_link_led.value = 'images/green.png';
        } else {
          primary_link_led = 'images/red.png'
        }
        
        rt_secondary_ipv4_address.value = response.data[0]['secondary-IPv4-address'];
        rt_secondary_ipv4_netmask.value = response.data[0]['secondary-IPv4-netmask'];
        rt_secondary_ipv4_gateway.value = response.data[0]['secondary-IPv4-gateway'];
        rt_secondary_ipv4_dns.value = response.data[0]['secondary-IPv4-dns'];
        if (response.data[0]['secondary-IPv6-address']){
          rt_secondary_ipv6_address.value = response.data[0]['secondary-IPv6-address'].split('\n');
        }
        rt_secondary_mac.value = response.data[0]['secondary-Interface-MAC'];
        rt_secondary_link.value = response.data[0]['secondary-Interface-Link'];
        if (rt_secondary_link.value === 'connected'){
          secondary_link_led.value = 'images/green.png';
        } else {
          secondary_link_led.value = 'images/red.png';
        }
      }
  } catch (error) {
      addToast('danger', `Failed to retrieve realtime network data: ${error}`);
  }
};

const retrieveEventLogCount = async() => {
  try {
    const response = await axios.get('/v1/api/events/count');
    if (response.status === 200){
      eventLogCount.value = response.data[0].count;
    }
  } catch (error){
    addToast('danger', `Failed to retrieve event log count: ${error}`);
  }
};

let intervalId;
let rtIntervalId;
let countIntervalId;
let uptimeIntervalId;

onMounted( async() => {
  loggedIn.value = userStore.isLoggedIn;
  user.value = userStore.loggedInUser;
  await retrievePrimaryNetworkConfig();
  await retrieveSecondaryNetworkConfig();
  await retrieveGeneralConfig();
  copyRetrievedToModifyVariables();

  // Fetch data every second
  intervalId = setInterval(retrieveRealtimeNetwork, 1000); 
  rtIntervalId = setInterval(retrieveCurrentServerDateTime, 1000);
  countIntervalId = setInterval(retrieveEventLogCount, 1000);
  uptimeIntervalId = setInterval(retrieveControllerUptime, 1000);
});

onUnmounted(() => {
  clearInterval(intervalId);
  clearInterval(rtIntervalId);
  clearInterval(countIntervalId);
  clearInterval(uptimeIntervalId);
});
</script>

