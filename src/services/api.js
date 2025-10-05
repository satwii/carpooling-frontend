import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    // IMPORTANT: Ensure this is the correct "Default domain" for your BACKEND App Service
    baseURL: 'https://carpooling-api-2025-bqeagxcng3cya4g0.eastus-01.azurewebsites.net',
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
        // FIX: Use the correct key 'authToken' to retrieve the token
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- Auth ---
// FIX: This function now handles both JSON and FormData for file uploads
export const registerUser = (userData) => {
    // If the data is already FormData, post it directly
    if (userData instanceof FormData) {
        return api.post('/register', userData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
    // Otherwise, post as JSON
    return api.post('/register', userData);
};
export const loginUser = (credentials) => api.post('/login', credentials);

// --- Trips ---
export const getAvailableTrips = (params) => api.get('/trips', { params });
export const createTrip = (tripData) => api.post('/trips', tripData);
export const getDriverTrips = () => api.get('/driver/trips');
// NEW: Added the PUT method for trip cancellation
export const cancelDriverTrip = (tripId) => api.put(`/driver/trips/${tripId}/cancel`);

// --- Driver License Upload ---
export const uploadDriverLicense = (file) => {
    const formData = new FormData();
    // CRITICAL FIX: The backend expects 'licenseFile', not 'licenseDocument'
    formData.append("licenseFile", file); 

    return api.post('/driver/upload-license', formData, {
        headers: {
            // Setting 'Content-Type' is unnecessary when using FormData, but including 
            // it doesn't hurt, as Axios handles the boundary correctly.
            // The key is ensuring the formData object is passed.
        },
    });
};


// --- Bookings ---
export const createBooking = (bookingData) => api.post('/bookings', bookingData);
export const getRiderBookings = () => api.get('/rider/bookings');
// NEW: Added the PUT method for booking cancellation
export const cancelRiderBooking = (bookingId) => api.put(`/rider/bookings/${bookingId}/cancel`);


// --- Vehicles ---
export const getDriverVehicles = () => api.get('/vehicles');
export const addVehicle = (vehicleData) => api.post('/vehicles', vehicleData);

// --- Driver Dashboard ---
export const getDriverStats = () => api.get('/driver/stats');

// --- Payment ---
export const makePayment = (paymentData) => api.post('/payments', paymentData);

export default api;
