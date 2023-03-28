import {Layout, Button, Menu, Card, Col, Row} from 'antd';
import React from 'react';
import {FieldTimeOutlined, ShareAltOutlined, PlusOutlined} from '@ant-design/icons'
import './index.scss'
import app1 from '@/assets/app1.jpg'

function Apps() {
    const {Sider, Content} = Layout;
    const {Meta} = Card;
    const arr =[{
        appName:"app1",
        author:"admin@gmail.com",
        src:app1
    },{
        appName:"app2",
        author:"admin@gmail.com",
        src:app1
    },{
        appName:"app3",
        author:"admin@gmail.com",
        src:app1
    },{
        appName:"app4",
        author:"admin@gmail.com",
        src:app1
    },{
        appName:"app5",
        author:"admin@gmail.com",
        src:app1
    }]
    
    return (
        <div className="Apps" style={{height: '100%'}}>
            <Layout>
                <Sider style={{background: "#f5f5f5", height: '100%'}}>

                    <Menu
                        mode="inline"
                        style={{height: '100%', background: "#f5f5f5"}}
                    >
                        <Button type="dashed" shape="round" icon={<PlusOutlined/>} size="large"
                                style={{marginLeft: "15px", marginTop: "10px"}}>
                            Create
                        </Button>
                        <Menu.Item icon={<FieldTimeOutlined/>}>
                            Recent
                        </Menu.Item>
                        <Menu.Item icon={<ShareAltOutlined/>}>
                            Share
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Content style={{margin: 30}}>
                    <Row>
                        {arr.map(item=>{
                          return  <Col span={6} style={{marginBottom: 30}}>
                                <Card
                                    hoverable
                                    style={{width: "90%"}}
                                    cover={<img alt="example" src={item.src}/>}>
                                    <Meta title={item.appName} description={item.author}/>
                                </Card>
                            </Col>

                        })}



                    </Row>

                </Content>
            </Layout>
        </div>
    );
}

export default Apps;

