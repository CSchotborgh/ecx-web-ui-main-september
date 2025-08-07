import { defineStore } from 'pinia'
import axios from 'axios';

export const useUserStore = defineStore('user', {
    state: () => ({
        isLoggedIn: false,
        csrfToken: null,
        accessToken: null,
        greeting: '',
        loggedInUser: null,
        errorMessage: '',
        last_modified: '',
        last_login: '',
        last_login_interface: '',
        second_last_login: '',
        second_last_login_interface: ''
        }),
    actions: {
        async retrieveCsrfToken() {
            try {
                const response = await axios.get('/v1/api/csrftoken');
                this.csrfToken = response.data.csrfToken;
                axios.defaults.headers.common['x-csrf-token'] = this.csrfToken;
                this.errorMessage = '';
            } catch (error) {
                console.error('Failed to retrieve CSRF token:', error);
                this.errorMessage = error.response?.data?.error || 'Failed to retrieve CSRF token';
            }
        },
        async validateTokens() {
            try {
                const response = await axios.post('/v1/api/login/validate', {},
                    {
                        'x-csrf-token': this.csrfToken,
                        'x-access-token': this.accessToken
                    }
                );
                this.errorMessage = '';
                return response.status === 200;
            } catch (error) {
                this.errorMessage = error.response?.data?.error || 'Failed to validate tokens';
                this.logOut()
                return false;
            }
        },
        async loginProcess(username, password) {
            try {
                if (!this.csrfToken) {
                    await this.retrieveCsrfToken();
                }

                const loginResponse = await axios.post('/v1/api/auth/sessions',
                { username, password },
                {
                    headers: {
                        'x-csrf-token': this.csrfToken,
                        'x-access-token': this.accessToken    
                    }
                });

                if (loginResponse.status === 200) {
                    this.isLoggedIn = true;
                    this.accessToken = loginResponse.data.token;
                    this.errorMessage = '';
                    axios.defaults.headers.common['x-access-token'] = this.accessToken;
                    await this.retrieveGreeting();
                }
            } catch (error) {
                console.error('Login failed:', error.response?.data?.error);
                this.errorMessage = error.response?.data?.error || 'Failed login process';
            }
        },
        async retrieveUserStats() {
            try {
                const response = await axios.get('/v1/api/auth/user', {
                    headers: {
                        'x-access-token': this.accessToken,
                        'x-csrf-token': this.csrfToken,
                    }
                });
                this.last_modified = response.data[0]['password-last-modified'];
                this.last_login = response.data[0]['current-login-timestamp'];
                this.last_login_interface = response.data[0]['current-login-interface'];
                this.second_last_login = response.data[0]['previous-login-timestamp'];
                this.second_last_login_interface = response.data[0]['previous-login-interface'];
                this.errorMessage = '';
            } catch (error) {
                console.error('Failed to retrieve user stats:', error.response?.data?.error);
                this.errorMessage = error.response?.data?.error || 'Failed to retrieve user stats';
            }
        },
        async retrieveGreeting() {
            try {
                const response = await axios.get('/v1/api/auth/sessions', {
                    headers: {
                        'x-access-token': this.accessToken,
                        'x-csrf-token': this.csrfToken,
                    }
                });
                this.greeting = response.data.message;
                this.loggedInUser = response.data.username;
                this.errorMessage = '';
            } catch (error) {
                console.error('Failed to retrieve greeting:', error.response?.data?.error);
                this.errorMessage = error.response?.data?.error || 'Failed to retrieve greeting';
            }
        },
        async logOut() {
            try {
                const response = await axios.delete('/v1/api/auth/sessions', {
                    headers: {
                        'x-access-token': this.accessToken,
                        'x-csrf-token': this.csrfToken,
                    }
                });
                this.errorMessage = '';
                console.log('Successfully logged out from the server!');
            } catch (error) {
                console.error('Failed to properly log out!');
                this.errorMessage = error.response?.data?.error || 'Failed to properly log out';
            }

            delete axios.defaults.headers.common['x-csrf-token'];
            delete axios.defaults.headers.common['x-access-token'];

            this.$reset();
        }
    }   
});
