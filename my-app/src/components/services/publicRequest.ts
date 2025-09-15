import axios, { AxiosResponse } from "axios";

const publicRequest = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
});

export const get = <T>(endPoint: string): Promise<AxiosResponse<T>> => {
  return publicRequest.get<T>(endPoint);
};

export const post = <T>(endPoint: string, data: unknown): Promise<AxiosResponse<T>> => {
  return publicRequest.post<T>(endPoint, data);
};

export const put = <T>(endPoint: string, id: string | number, data: unknown): Promise<AxiosResponse<T>> => {
  return publicRequest.put<T>(`${endPoint}/${id}`, data);
};

export const deleteRequest = <T>(endPoint: string, id: string | number): Promise<AxiosResponse<T>> => {
  return publicRequest.delete<T>(`${endPoint}/${id}`);
};

export default publicRequest;
