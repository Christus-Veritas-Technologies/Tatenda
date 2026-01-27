import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

/**
 * Base API client using axios
 * All backend requests should go through this client
 */
const apiClient = axios.create({
  baseURL: "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies for authentication
});

// Request interceptor for adding auth headers or logging
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens or other headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors globally
    if (error.response?.status === 401) {
      // Redirect to auth page on unauthorized
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Generic API request function
 * Use this for all backend requests
 */
export async function apiRequest<T = unknown>(
  config: AxiosRequestConfig
): Promise<T> {
  const response: AxiosResponse<T> = await apiClient(config);
  return response.data;
}

/**
 * GET request helper
 */
export async function apiGet<T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  return apiRequest<T>({ ...config, method: "GET", url });
}

/**
 * POST request helper
 */
export async function apiPost<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  return apiRequest<T>({ ...config, method: "POST", url, data });
}

/**
 * PUT request helper
 */
export async function apiPut<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  return apiRequest<T>({ ...config, method: "PUT", url, data });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  return apiRequest<T>({ ...config, method: "DELETE", url });
}

export default apiClient;
