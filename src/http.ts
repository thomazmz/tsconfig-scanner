import axios, { AxiosRequestConfig } from 'axios'

export function request(requestConfig: AxiosRequestConfig) {
  const defaultRequestConfig = {
    method: 'get',
  }

  return axios.request({ 
    ...defaultRequestConfig,
    ...requestConfig,
  })
}