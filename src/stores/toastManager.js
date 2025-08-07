import { ref } from 'vue';

let toastId = 0;
const toasts = ref([]);

const addToast = (type = 'info', message) => {
  const toast = { id: toastId++, message, type };
  toasts.value.push(toast);

  // Auto-remove toast after 5 seconds
  setTimeout(() => {
    removeToast(toasts.value.indexOf(toast));
  }, 5000);
};

const removeToast = (index) => {
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

export { toasts, addToast, removeToast };
