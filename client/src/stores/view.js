// view模块api接口逻辑
import {makeAutoObservable} from 'mobx'
import {
    getId,
    http
} from '@/utils'

class View {
    views = []
    view = []

    constructor() {
        makeAutoObservable(this)
    }

    // 获取view list
    getViews = async (appId) => {
        const res = await http.post('/api/view/getView', {appId: appId})
        this.views = res.data
        return res
    }
    // 创建view
    createView = async (req) => {
        req.userId = getId()
        const res = await http.post('/api/view/addView', req)
        this.view = res
    }
    // 修改view
    editView = async (req) => {
        req.userId = getId()
        const res = await http.post('/api/view/editView', req)
        this.view = res

    }
    // 删除view
    deleteView = async (view) => {
        const res = await http.post('/api/view/deleteView', view)
        this.view = res
    }

}

export default View