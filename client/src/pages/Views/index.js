import {Button, Col, Form, Input, Layout, Row,  Select} from "antd";
import React, {useEffect, useState} from "react";
import { useLocation  } from 'react-router-dom';
import {useStore} from "@/stores";
//引用组件
import ViewMenus from "@/components/view/ViewMenus";

const {Sider, Content} = Layout;
const {Option} = Select;

function View() {
    //定义state数据
    const [hasViews, setHasViews] = useState(true)
    const {viewStore} = useStore()
    //获取url带的数据
    const appId=useLocation().state.appId
    //调用服务器方法
    useEffect(() => {
        viewStore.getViews(appId).then(()=>{
            setHasViews(viewStore.views)
            })
    }, viewStore)

    return (
        <div className="ViewDetail" style={{ height: '100%'}}>
            <Layout>
                <Sider style={{background: "#f5f5f5", height: '100%'}}>
                    {/*//引用组件*/}
                    <ViewMenus appId={appId} hasViews={hasViews}></ViewMenus>
                </Sider>
                <Content style={{margin: 30}}>
                    <Form
                        name="basic"
                        initialValues={{ remember: true }}
                        autoComplete="off"
                        layout="vertical"
                    >
                        <Form.Item
                            label="Template"
                            name="template"
                            style={{maxWidth: "30%"}}
                        >
                            <Select defaultValue="None">
                                <Option value="Template">Template</Option>
                                <Option value="Template1">Template1</Option>
                                <Option value="Template2">Template2</Option>
                                <Option value="None">None</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Background"
                            name="background"
                            style={{maxWidth: "30%"}}
                        >
                            <Select defaultValue="None">
                                <Option value="Background">Background</Option>
                                <Option value="Background1">Background1</Option>
                                <Option value="Background2">Background2</Option>
                                <Option value="None">None</Option>
                            </Select>
                        </Form.Item>

                        <Row>
                            <Col span={8} >
                                <Form.Item
                                    label="Columns"
                                    name="columns"
                                    style={{maxWidth: "90%"}}
                                >
                                    <Select defaultValue="columns1">
                                        <Option value="Columns">Columns</Option>
                                        <Option value="Columns1">Columns1</Option>
                                        <Option value="Columns2">Columns2</Option>
                                        <Option value="None">None</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8} >
                                <Form.Item
                                    label="Type"
                                    name="type"
                                    style={{maxWidth: "90%"}}
                                >
                                    <Select defaultValue="URL">
                                        <Option value="URL">URL</Option>
                                        <Option value="URL1">URL1</Option>
                                        <Option value="URL2">URL2</Option>
                                        <Option value="None">None</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8} >
                                <Form.Item
                                    label="Name"
                                    name="phone"
                                    style={{maxWidth: "90%"}}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                    <Button type="primary" >Add Column</Button>
                </Content>
            </Layout>

        </div>
    );
}

export default View;



