import axios, {AxiosInstance, InternalAxiosRequestConfig} from 'axios';

// baseURL içindeki noktalı virgül hatası düzeltildi
const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    timeout: 10000, // 10 saniye timeout
});

// İstek interceptor'ı: Her isteğe otomatik olarak Token ekler
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            // Bearer token yapısı sunucu tarafındaki AuthGuard ile uyumludur
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Debug için URL'i logla
        console.log('API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: Hataları yakala ve logla
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Detaylı hata loglama
        if (error.response) {
            // Server yanıt verdi ama hata kodu döndü
            console.error('API Error Response:', {
                status: error.response.status,
                statusText: error.response.statusText,
                url: error.config?.url,
                method: error.config?.method,
                data: error.response.data,
            });
        } else if (error.request) {
            // İstek gönderildi ama yanıt alınamadı
            console.error('API Error Request:', {
                url: error.config?.url,
                method: error.config?.method,
                baseURL: error.config?.baseURL,
                message: 'No response received from server',
            });
        } else {
            // İstek hazırlanırken hata oluştu
            console.error('API Error Config:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;