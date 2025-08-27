..import axios from 'axios';

export function persistState({ store }) {

  const storedState = localStorage.getItem(store.$id);

  if (storedState) {
    try {
      const parsedState = JSON.parse(storedState);
      const now = new Date().getTime();

      if (parsedState.expiry && now > parsedState.expiry) {
        localStorage.removeItem(store.$id);
      } else {
        store.$patch(parsedState.data);

        // Reapply axios headers
        if (parsedState.data.csrfToken) {
          axios.defaults.headers.common['x-csrf-token'] = parsedState.data.csrfToken;
        }
        if (parsedState.data.accessToken) {
          axios.defaults.headers.common['x-access-token'] = parsedState.data.accessToken;
        }

        // Validate tokens
        store.validateTokens().then(isValid => {
          if (!isValid) {
            store.logout();
          }
        });
      }
    } catch (error) {
      localStorage.removeItem(store.$id); // Clear invalid state
    }
  }

  store.$subscribe((mutation, state) => {
    if (state.isLoggedIn === false) {
      localStorage.removeItem(store.$id);
    } else {
      const now = new Date().getTime();
      const expiry = now + 24 * 60 * 60 * 1000; // 1 day expiry (in milliseconds)

      const stateToStore = JSON.stringify({
        data: state,
        expiry: expiry
      });

      localStorage.setItem(store.$id, stateToStore);
    }
  });
}