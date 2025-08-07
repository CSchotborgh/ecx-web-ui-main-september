import { createPinia } from 'pinia';
import { persistState } from '@/assets/persistState';

const pinia = createPinia();
pinia.use(persistState);

export default pinia;