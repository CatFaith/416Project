// 封装axios
import axios from 'axios'
import { getToken } from './ls'
import { history } from './history'
import {message} from "antd";

const http = axios.create({
  baseURL: 'http://localhost:8080/',
  timeout: 5000
})

//request前处理逻辑
http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = token

  }
  return config
}, (error) => {
  return Promise.reject(error)
})

//response处理逻辑
http.interceptors.response.use((response) => {
  return response.data
}, (error) => {
  // if (error.response.status == 401) {
  //   history.push('/login')
  // }
  if (error.code=="ECONNABORTED"){
    message.error(error.message)
  }
  return Promise.reject(error)
})

export { http }