import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getToken } from "../../utils/utils";
import toast from "../shared/Toast";

export const privateRequest = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  timeout: 20000,
});

// Request handler: Add Authorization header if token exists
const requestHandler = (request: AxiosRequestConfig): AxiosRequestConfig => {
  const token = getToken();
  if (token && request.headers) {
    request.headers.Authorization = `Basic ${token}`;
  }
  return request;
};

// Clear token from localStorage
const clearToken = () => {
  localStorage.removeItem("token");
};

// Response error handler
const responseErrorHandler = (error: any): Promise<any> => {
  if (error.response) {
    const { status, data, message } = error.response;

    switch (status) {
      case 401:
        clearToken();
        toast.error("Session expired, please login.");
        setTimeout(() => (window.location.href = "/"), 500);
        break;
      case 400:
        toast.error(data?.message || "Bad Request");
        break;
      case 403:
        toast.error(data?.message || "Access Denied");
        break;
      case 404:
        toast.error("Resource Not Found");
        break;
      case 500:
        toast.error("Server Error. Please try again later.");
        break;
      default:
        toast.error(data?.message || message || "An error occurred.");
    }
  } else {
    toast.error("Network Error. Please try again.");
  }

  return Promise.reject(error);
};

// Apply interceptors
privateRequest.interceptors.request.use(requestHandler);
privateRequest.interceptors.response.use(
  (response: AxiosResponse) => response,
  responseErrorHandler
);

// Typed API methods
export const privateGet = <T>(
  endPoint: string,
  config: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> => privateRequest.get<T>(endPoint, config);

export const privatePost = <T>(
  endPoint: string,
  data: unknown,
  config: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> => privateRequest.post<T>(endPoint, data, config);

export const privatePut = <T>(
  endPoint: string,
  data: unknown,
  config: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> => privateRequest.put<T>(endPoint, data, config);

export const privateDelete = <T>(
  endPoint: string,
  config: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> => privateRequest.delete<T>(endPoint, config);

export default privateRequest;
