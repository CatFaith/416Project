import {Button, Layout, Menu, Tabs, Radio, Table, Space, Modal, Form, Input, Row} from "antd";
import React, {useEffect, useState} from 'react';
import {
    DoubleLeftOutlined,
    DoubleRightOutlined,
    SaveOutlined
} from "@ant-design/icons";
import {useStore} from "@/stores";
import {useLocation} from "react-router-dom";

const {Sider, Content} = Layout

function AppDetail() {
    //定义State参数
    const [hasViews, setHasViews] = useState(true)
    const [showElem, setShowElem] = useState(true)
    //获取url数据
    const appId = useLocation().state.appId
    //调用view list 方法
    const {viewStore} = useStore()
    useEffect(() => {
        viewStore.getViews(appId).then(() => {
            setHasViews(viewStore.views)
        })
    }, viewStore)
    //定义表格数据
    const dataSource = [
        {
            key: '1',
            name: 'ray',
            email: "ray@gmail.com",
            phone: '13525425876',
        },
        {
            key: '2',
            name: 'lay',
            email: "lay@gmail.com",
            phone: '13525425876',
        },
    ];
    //定义表格头
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
        }, {
            title: 'Action',
            key: 'action',
            render: () => (
                <Space size="middle">
                    <a>Edit</a>
                </Space>
            ),
        },
    ];
    //定义表格选中状态
    const rowSelection = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
    };
    //定义表格
    const children = <Table dataSource={dataSource} columns={columns}
                            rowSelection={{type: "checkbox", ...rowSelection,}}/>
    //定义标签数据
    const [views, setViews] = useState(viewStore.views.map((item) => {
        return {
            label: item.viewName,
            key: item.id,
            children: children,
        };
    }))

    //定义stata参数
    const [addRecord, setAddRecord] = useState(false);


    //定义模板
    return (
        <div className="AppDetail" style={{height: '100%'}}>
            <Layout>
                <Sider style={{background: "#f5f5f5", height: '100%'}}>
                    <Menu
                        mode="inline"
                        style={{height: '100%', background: "#f5f5f5",}}
                    >
                        <div>
                            <Button type="text" icon={<DoubleLeftOutlined/>} size="large"
                                    style={{marginLeft: "15px", marginTop: "50px"}}></Button>
                            <Button type="text" icon={<SaveOutlined/>} size="large"
                                    style={{marginLeft: "15px", marginTop: "10px"}}></Button>
                            <Button type="text" icon={<DoubleRightOutlined/>} size="large"
                                    style={{marginLeft: "15px", marginTop: "10px"}}></Button>
                        </div>
                        <Menu.Item onClick={() => setAddRecord(true)}>
                            Add record
                        </Menu.Item>
                        <Menu.Item>
                            Delete record
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Content style={{marginTop: 30, marginLeft: 20, marginRight: 30}}>
                    <Radio.Group size="large" defaultValue="apps" style={{marginBottom: 30}}>
                        <Radio.Button value="apps" onClick={() => setShowElem(true)}>Apps</Radio.Button>
                        <Radio.Button value="database" onClick={() => setShowElem(false)}>Database</Radio.Button>
                    </Radio.Group>
                    {showElem ?
                        <Tabs
                            defaultActiveKey="1"
                            tabPosition="top"
                            style={{height: 220}}
                            items={views}/> : ''}
                    <Modal
                        title="Add record"
                        centered
                        open={addRecord}
                        onOk={() => setAddRecord(false)}
                        onCancel={() => setAddRecord(false)}
                        width={400}
                        okText="save"
                    >
                        <Form
                            name="basic"
                            initialValues={{remember: true}}
                            autoComplete="off"
                            layout="vertical"
                        >
                            <Form.Item
                                label="Name"
                                name="name"
                                style={{maxWidth: "100%"}}
                                rules={[{required: true, message: 'Please input your name!'}]}
                            >
                                <Input/>
                            </Form.Item>

                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[{required: true, message: 'Please input your email!'}]}
                            >
                                <Input/>
                            </Form.Item>
                            <Form.Item
                                label="Phone Number"
                                name="phone"
                                rules={[{required: true, message: 'Please input your phone number!'}]}
                            >
                                <Input/>
                            </Form.Item>
                        </Form>
                    </Modal>
                </Content>
            </Layout>
        </div>
    );
}

export default AppDetail;
