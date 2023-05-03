// 登录模块api接口逻辑
import {makeAutoObservable} from 'mobx'
import {
    getId,
    http
} from '@/utils'
//定义 store 的 class

class App {
    apps = []
    app = {}
    authorization = false
    checkDevelopersRes=[]
    constructor() {
        makeAutoObservable(this)
    }

    // 
    checkDevelopers = async (req) => {
        const res = await http.post('/api/app/checkDevelopers', req)
        this.checkDevelopersRes = res
    }

    // 获取app list
    getApps = async () => {
        const res = await http.post('/api/app/getAppAfterLogin')
        this.apps = res.data
    }
    // 创建app
    createApp = async (app) => {
        const res = await http.post('/api/app/createApp', app)
        this.app = res
    }
    // 修改app
    editApp = async (app) => {
        app.userId=getId()
        const res = await http.post('/api/app/editApp', app)
        this.app = res
    }
    // 删除app
    deleteApp= async (id) => {
        const  req={id:id,userId:getId()}
        const res = await http.post('/api/app/deleteApp', req)
        this.app = res
    }
    // 分享app
    shareApp= async (appId,googleAccount) => {
        googleAccount.appId=appId
        const res = await http.post('/api/app/shareApp', googleAccount)
        this.app = res
    }
    checkAuthorization= async (app) => {
        const res = await http.post('/api/app/checkAuthorization', app)
        this.authorization = res
    }

}

export default App








