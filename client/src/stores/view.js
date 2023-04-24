// view模块api接口逻辑
import {makeAutoObservable} from 'mobx'
import {
    getId,
    http
} from '@/utils'

class View {
    views = []
    view = []
    detailTabs = []
    roles=[]
    allColumns=[]
    viewNameArr=[]
    detailData=[]


    constructor() {
        makeAutoObservable(this)
    }
    getViewForGoogleSheet= async (appId) => {
        console.log(appId)
        const res = await http.post('/api/view/getViewForGoogleSheet', {appId: appId})
        this.detailData = res.data
        this.detailTabs = this.detailData.map((item)=>{
            return {
                label: item.viewName,
                key: item.id
            }
        })
        console.log(res)
    }
    // 获取view list
    getViews = async (appId) => {
        const res = await http.post('/api/view/getViewColumnsByAppId', {appId: appId})
        this.views = res.data.viewData

        this.viewNameArr=[]
        res.data.viewNameArr.map((item)=>{
            console.log(item)
            console.log(this.viewNameArr)
            this.viewNameArr.push({
                label: item,
                value: item
            })
        })
    }

    editOrAddViewColumn = async (req) => {
        req.userId = getId()
        const res = await http.post('/api/view/editOrAddViewColumn', req)
        this.view = res
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

    getRoles = async (viewId) => {
        const res = await http.post('/api/view/getRoleDataByViewId', {viewId: viewId})
        this.roles = res.data.roleData
        this.allColumns=res.data.allColumns
    }


}

export default View