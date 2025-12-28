import axios, {AxiosInstance, InternalAxiosRequestConfig} from 'axios';

// baseURL içindeki noktalı virgül hatası düzeltildi
const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
});

// İstek interceptor'ı: Her isteğe otomatik olarak Token ekler
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            // Bearer token yapısı sunucu tarafındaki AuthGuard ile uyumludur
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;