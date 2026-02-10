import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false
});

// Добавляем Bearer‑токен
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Set language header from local storage or default to 'ru'
    const lang = window.localStorage.getItem("lang") || "ru";
    config.params = { ...config.params, lang };
  }
  return config;
});

// Интерцептор для обработки унифицированного ответа
apiClient.interceptors.response.use(
  (response) => {
    // Если бэкенд вернул { data, code, message }, пробрасываем data
    if (response.data && "data" in response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

