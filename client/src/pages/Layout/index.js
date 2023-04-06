/**
 * 项目整体页面布局文件
 */

import {Layout, Popover, Button} from 'antd'
import {Outlet, useNavigate} from 'react-router-dom'
import {observer} from 'mobx-react-lite'
import {MoreOutlined} from '@ant-design/icons'
import './index.scss'
import React, {useEffect, useState} from "react";
import {useStore} from '@/stores'
import EditUser from "@/components/layout/EditUser";
const {Header} = Layout
const NavLayout = () => {
    const {userStore} = useStore()
    //获取用户数据
    useEffect(() => {
        userStore.getProfile()
        userStore.getUserList().then()
    }, userStore)
    const navigate = useNavigate()

    // 退出登录 删除token 跳回到登录
    const onSignOut = () => {
        userStore.loginOut()
        navigate('/login')
    }
    //实现help按键方法
    const onHelp = () => {
    }
    //定义state参数
    const [showEditUserDialog, setShowEditUserDialog] = useState(false)
    //关闭修改框
    const closeEditDialog = () => {
        setShowEditUserDialog(false)
    }
    //定义模板
    return (
        <Layout>
            <Header className="header">
                <div className="logo"/>
                <div className="user-info">
                    <span className="user-name">{userStore.uname ? userStore.uname.slice(0, 1).toUpperCase() : "Y"}
                    </span>
                    <span className="user-operate">
                        {/*//定义弹出框*/}
                         <Popover
                             placement="bottomRight"
                             title={userStore.gmail}
                             trigger="click"
                             content={
                                 <div>
                                     <div className="user-setting">
                                         <Button type="text" onClick={() => setShowEditUserDialog(true)} size="small">Account
                                             setting</Button>
                                         <EditUser
                                             visible={showEditUserDialog}
                                             close={closeEditDialog}
                                         >
                                         </EditUser>
                                     </div>
                                     <div className="user-help">
                                         <Button type="text" onClick={onHelp} size="small">Help</Button>
                                     </div>
                                     <div>
                                         <Button type="link" onClick={onSignOut} size="small">Sign out</Button>
                                     </div>
                                 </div>}>
                                <MoreOutlined/>
                         </Popover>
                    </span>
                </div>
            </Header>
            <Layout className="layout-content">
                <Outlet/>
            </Layout>
        </Layout>
    )
}

export default observer(NavLayout)











