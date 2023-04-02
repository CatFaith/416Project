import axios from 'axios'
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
})

export const getApp = (payload) => api.get(`/app`)
export const creatApp = () => api.post(`/app`)

const apis = {
    getApp
}

export default apis
