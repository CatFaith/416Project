// 登录模块api接口逻辑
import {makeAutoObservable} from 'mobx'
import {
    http,
    setToken,
    getToken,
    removeToken,
    getId,
    getUName,
    getGmail, setGmail, setUName, setId
} from '@/utils'

class User {
    token = getToken() || ''
    id =""
    gmail =""
    uname = ""
    userRes={}
    userList=[]
    constructor() {
        makeAutoObservable(this)
    }
    //获取用户信息
    getProfile =()=>{
        this.id = getId()
        this.gmail = getGmail()
        this.uname = getUName()
    }

    //登录
    login = async ({userName, googleAccount, googleToken}) => {
        // 调用登录接口
        const res = await http.post('/api/login', {userName, googleAccount, googleToken})
        this.token = res.data.token
        this.id = res.data.data.id
        this.gmail = res.data.data.googleAccount
        this.uname = res.data.data.userName
        // 存入token
        setToken(this.token)
        setGmail(this.gmail)
        setUName(this.uname)
        setId(this.id)

    }
    // 退出登录
    loginOut = () => {
        this.token = ''
        this.gmail = ''
        this.uname = ''
        removeToken()

    }
    // 修改用户名称
    editUserName = async (req) => {
        req.id =this.id
        const res = await http.post('/api/user/editUser', req)
        if (res.code==200){
            this.uname = req.userName
        }
        this.userRes=res
    }
    // 获取用户列表
    getUserList= async () => {
        const res = await http.post('/api/user/getUserList')
        this.userList=res.data
    }


}

export default User