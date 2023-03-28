/**
 * Layout/Home
 */

import {Layout, Popover} from 'antd'
import {Outlet, Link, useNavigate} from 'react-router-dom'
import {observer} from 'mobx-react-lite'
import {HolderOutlined} from '@ant-design/icons'
import './index.scss'
import React from "react";
const {Header} = Layout

const NavLayout = () => {
    return (
        <Layout>
            <Header className="header">
                <div className="logo"/>
                <div className="user-info">
                    <span className="user-name">A</span>
                    <span className="user-operate">
                         <Popover placement="bottomRight" title={<span>admin@gmail.com</span>} content={<div>
                             <div className="user-setting">Account setting</div>
                             <div className="user-help">Help</div>
                             <Link className="user-logout" to='/login'>Sign out</Link>
                         </div>} trigger="click">
               <HolderOutlined />
            </Popover>
          </span>
                </div>
            </Header>
            <Layout className="layout-content">
                <Outlet />
            </Layout>
        </Layout>
    )
}

export default observer(NavLayout)




