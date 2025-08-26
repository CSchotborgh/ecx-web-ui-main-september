import axios from "axios";

const appVersion = {
    version: '1.0.1'
};

export const reportVersion = async () => {
    try {
        const response = await axios.post('/v1/api/edgerack/0/realtime/report-version', {
            version: appVersion.version,
        });
        return response.data;
    } catch (error) {
        // Silently handle version reporting errors (e.g., when API is not available)
        console.debug('Version reporting unavailable:', error.message);
        return null;
    }
};