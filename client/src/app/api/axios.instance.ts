import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8500';

interface TokenPayload {
    accessToken: string;
    refreshToken: string;
}

interface FailedQueueItem {
    resolve: (token: string) => void;
    reject: (error: AxiosError) => void;
}

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: AxiosError | null, token: string | null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else if (token) prom.resolve(token);
    });
    failedQueue = [];
};

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// ⭐ REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Check both localStorage and sessionStorage for token
        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// ⭐ RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // If token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                            }
                            resolve(axiosInstance(originalRequest));
                        },
                        reject,
                    });
                });
            }

            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

                if (!refreshToken) {
                    throw new Error("No refresh token available");
                }

                const res = await axios.post<TokenPayload>(
                    `${API_URL}/auth/refresh-token`,
                    { refreshToken }
                );

                const newAccessToken = res.data.accessToken;

                // Store in both localStorage and sessionStorage for consistency
                localStorage.setItem("accessToken", newAccessToken);
                sessionStorage.setItem("accessToken", newAccessToken);

                processQueue(null, newAccessToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }

                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError as AxiosError, null);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                sessionStorage.removeItem("accessToken");
                sessionStorage.removeItem("refreshToken");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;


// import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

// const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8500' // BACKEND - SERVER HTTP API


// interface TokenPayload {
//     accessToken: string;
//     refreshToken: string;
// }

// interface FailedQueueItem {
//     resolve: (token: string) => void;
//     reject: (error: AxiosError) => void;
// }

// let isRefreshing = false;
// let failedQueue: FailedQueueItem[] = [];

// const processQueue = (error: AxiosError | null, token: string | null) => {
//     failedQueue.forEach((prom) => {
//         if (error) prom.reject(error);
//         else if (token) prom.resolve(token);
//     });
//     failedQueue = [];
// };

// const axiosInstance: AxiosInstance = axios.create({
//     baseURL: API_URL,
//     withCredentials: true,
// });

// // ⭐ REQUEST INTERCEPTOR
// axiosInstance.interceptors.request.use(
//     (config: InternalAxiosRequestConfig) => {
//         const token = localStorage.getItem("accessToken");
//         if (token && config.headers) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error: AxiosError) => Promise.reject(error)
// );

// // ⭐ RESPONSE INTERCEPTOR
// axiosInstance.interceptors.response.use(
//     (response) => response,

//     async (error: AxiosError) => {
//         const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

//         // If token expired
//         if (error.response?.status === 401 && !originalRequest._retry) {
//             originalRequest._retry = true;

//             if (isRefreshing) {
//                 return new Promise((resolve, reject) => {
//                     failedQueue.push({
//                         resolve: (token: string) => {
//                             if (originalRequest.headers) {
//                                 originalRequest.headers.Authorization = `Bearer ${token}`;
//                             }
//                             resolve(axiosInstance(originalRequest));
//                         },
//                         reject,
//                     });
//                 });
//             }

//             isRefreshing = true;

//             try {
//                 const refreshToken = localStorage.getItem("refreshToken");

//                 const res = await axios.post<TokenPayload>(
//                     `${API_URL}/auth/refresh-token`,
//                     { refreshToken }
//                 );

//                 const newAccessToken = res.data.accessToken;

//                 localStorage.setItem("accessToken", newAccessToken);

//                 processQueue(null, newAccessToken);

//                 if (originalRequest.headers) {
//                     originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//                 }

//                 return axiosInstance(originalRequest);
//             } catch (refreshError) {
//                 processQueue(refreshError as AxiosError, null);
//                 localStorage.removeItem("accessToken");
//                 localStorage.removeItem("refreshToken");
//                 window.location.href = "/login";
//                 return Promise.reject(refreshError);
//             } finally {
//                 isRefreshing = false;
//             }
//         }

//         return Promise.reject(error);
//     }
// );

// export default axiosInstance;
