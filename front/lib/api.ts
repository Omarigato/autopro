import axios, { AxiosError } from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://192.168.0.18:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false
});

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Добавляем Bearer‑токен
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const lang = window.localStorage.getItem("lang") || "ru";
    config.params = { ...config.params, lang };
  }
  return config;
});

// Ответ: разворачиваем data из обёртки { data, code, message }
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === "object" && "data" in response.data) {
      return response.data.data;
    }
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    // 401 и есть refresh_token — пробуем обновить access token
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      originalRequest &&
      !originalRequest._retry
    ) {
      const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        originalRequest._retry = true;
        try {
          const res = await axios.post(API_BASE_URL + "/auth/refresh", {
            refresh_token: refreshToken,
          });
          const payload = res.data?.data ?? res.data;
          if (payload?.access_token) {
            window.localStorage.setItem(TOKEN_KEY, payload.access_token);
            if (payload.refresh_token) {
              window.localStorage.setItem(REFRESH_TOKEN_KEY, payload.refresh_token);
            }
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${payload.access_token}`;
            }
            return apiClient.request(originalRequest);
          }
        } catch (_) {
          window.localStorage.removeItem(TOKEN_KEY);
          window.localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      }
    }

    const data = error.response?.data;
    return Promise.reject(data ?? error);
  }
);

