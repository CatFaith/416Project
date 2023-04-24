import {Layout, Button, Menu, Card, Col, Row, Radio, message} from 'antd';
import React from 'react';
import {observer} from 'mobx-react-lite'
import {FieldTimeOutlined, ShareAltOutlined, PlusOutlined} from '@ant-design/icons'
import './index.scss'
import AppDialog from "@/components/app/AppDialog";
import AddCard from "@/components/app/AppCard";

import {useStore} from '@/stores'
import {useEffect, useState} from 'react'

const {Sider, Content} = Layout;

const Apps = () => {
    //定义state参数
    const [showAppDialog, setShowAppDialog] = useState(false)
    const [showAppType, setShowAppType] = useState("recent")
    const {appStore, userStore} = useStore()
    //调用app list方法
    useEffect(() => {
        appStore.getApps().then()
    }, appStore)

    const closeAddDialog = () => {
        setShowAppDialog(false)
    }

    return (
        <div className="Apps" style={{height: '100%'}}>
            <Layout>
                <Sider style={{background: "#f5f5f5", height: '100%'}}>
                    <Menu
                        mode="inline"
                        style={{height: '100%', background: "#f5f5f5"}}
                    >
                        <Button type="dashed" shape="round" icon={<PlusOutlined/>} size="large"
                                style={{marginLeft: 20, marginTop: 35}}
                                onClick={() => {
                                    setShowAppDialog(true)
                                }}>
                            Create
                        </Button>
                        <Menu.Item icon={<FieldTimeOutlined/>} onClick={() => {
                            setShowAppType("recent")
                        }}>
                            Recent
                        </Menu.Item>
                        <Menu.Item icon={<ShareAltOutlined/>} onClick={() => {
                            setShowAppType("share")
                        }}>
                            Share
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Content style={{margin: 30}}>
                    <Row>
                        {/*//当app list有数据的时候遍历生成AddCard组件*/}
                        {appStore.apps? appStore.apps.map(item => {
                            if (showAppType == "recent" && item.userId == userStore.id) {
                                return <Col span={6} style={{marginBottom: 30}}><AddCard item={item}></AddCard> </Col>
                            }
                            if (showAppType == "share" && item.userId != userStore.id) {
                                return <Col span={6} style={{marginBottom: 30}}><AddCard item={item}></AddCard> </Col>
                            }
                        }) : null}
                    </Row>
                </Content>
            </Layout>
            {/*//调用弹出框组件*/}
            <AppDialog
                operationType="create"
                visible={showAppDialog}
                close={closeAddDialog}
            ></AppDialog>
        </div>
    );
}

export default observer(Apps);

