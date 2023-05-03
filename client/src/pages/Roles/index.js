import {observer} from 'mobx-react-lite'
import {Button, Checkbox, Col, Form, Input, Layout, Menu, message, Modal, Popover, Row, Select} from "antd";
import React, {useEffect, useState} from "react";
import {DeleteOutlined, EditOutlined, FileTextOutlined, MoreOutlined, PlusOutlined} from "@ant-design/icons";
import {useStore} from "@/stores";
import {useParams} from "react-router-dom";
import ViewDialog from "@/components/view/ViewDialog";

import type {SelectProps} from 'antd';

const {Sider, Content} = Layout;

const {Option} = Select;


const Roles = () => {
    //get view list
    const {viewStore} = useStore()
    const appId = useParams().appId
    const viewId = useParams().viewId
    const [selectedKeys,setSelectedKeys]=useState([])
    useEffect(() => {
        viewStore.getRoles(viewId).then(()=>{
            setSelectedKeys(JSON.parse(JSON.stringify(viewStore.roles[0])).id.toString())
            setRoleItem({
                id:viewStore.roles[0].id,
                allowedActions:  viewStore.roles[0].allowedActions,
                editColumns:  viewStore.roles[0].editColumns,
                columns:  viewStore.roles[0].columns
            })
        })}, viewStore)

    const [showCheckBox, setShowCheckBox] = useState(false)
    const onDelete = async (id) => {
        await viewStore.deleteView(id)
        if (viewStore.view.code == 200) {
            message.success('Delete success')
            await viewStore.getRoles(viewId).then()
            setShowCheckBox(false)
            setSelectedKeys(JSON.parse(JSON.stringify(viewStore.roles[0])).id.toString())
        }
    }
    //add&edit view parameter
    const [showViewDialog, setShowViewDialog] = useState(false)
    const [operationType, setOperationType] = useState("create")
    const [view, setView] = useState([])
    const closeViewDialog = () => {
        setShowViewDialog(false)
    }
    const options: SelectProps['options'] = [];
    viewStore.allColumns.map((item)=>{
        options.push({
            label: item,
            value: item,
        })
    })

    const [form] = Form.useForm();

    async function onFinish(values) {
        values.appId=appId
        await viewStore.editView(values).then()
        if (viewStore.view.code == 200) {
            //状态码为200的时候调用以下方法
            message.success('Edit success')
        }
    };

    const onReset = () => {
        form.resetFields();
    };

    const [roleItem,setRoleItem] = useState({
        id:null,
        allowedActions:  [],
        editColumns:  [],
        columns:  []
    })
    const getViewData = (id) => {
        //控制左侧导航栏焦点
        setSelectedKeys(id.toString())

        viewStore.roles.map((item,index)=>{
            if (item.id==id){
                setRoleItem({
                    id:item.id,
                    allowedActions:  item.allowedActions,
                    editColumns:  item.editColumns,
                    columns:  item.columns
                })
            }
        })
        form.setFieldsValue(roleItem)
    }

    const getSelect = (value) => {
        roleItem.columns.push(value)
        setRoleItem({...roleItem})
    }

    const removeSelect = (value) => {
        roleItem.columns.forEach(function (item, index, arr) {
            if (item == value) {
                arr.splice(index, 1);
            }
        });
        setRoleItem({...roleItem})
    }

    const openESelect = (value) => {
        roleItem.allowedActions = value
        setRoleItem({...roleItem})
    }
    form.setFieldsValue(roleItem)
    return (
        <div className="ViewDetail" style={{height: '100%'}}>

            <Layout>
                <Sider style={{background: "#f5f5f5", height: '100%'}}>
                    <Menu
                        mode="inline"
                        style={{height: '100%', background: "#f5f5f5"}}
                        selectedKeys={[selectedKeys]}
                    >
                        <Menu.Item disabled="true" style={{fontSize: "larger"}}>
                            Role Edit
                        </Menu.Item>
                        <Menu.Item onClick={() => {
                            setView([]);
                            setOperationType("create");
                            setShowViewDialog(true);
                        }}>
                            <Row>
                                <Col span={6} style={{fontSize: "larger"}}>
                                    #role
                                </Col>
                                <Col span={3} offset={15} style={{fontSize: "larger"}}>
                                    <PlusOutlined/>
                                </Col>
                            </Row>
                            <ViewDialog
                                item={view}
                                appId={appId}
                                viewType="role"
                                operationType={operationType}
                                visible={showViewDialog}
                                close={closeViewDialog}
                            ></ViewDialog>
                        </Menu.Item>
                        {viewStore.roles?viewStore.roles.map((item, index) => {
                            return <Menu.Item key={item.id} onClick={() => getViewData(item.id)}>
                                <Row>
                                    <Col span={3} offset={1} style={{}}>
                                        <FileTextOutlined/>
                                    </Col>
                                    <Col span={17}>
                                        {item.roleName}
                                    </Col>
                                    <Col span={3} offset={0}>
                                        {/*//设置弹出框*/}
                                        <Popover
                                            placement="top"
                                            trigger="click"
                                            content={
                                                <div>
                                                    <div>
                                                        <Button type="text"
                                                                size="middle"
                                                                disabled={showViewDialog||showCheckBox}
                                                                onClick={() => {
                                                                    setView(item);
                                                                    setShowViewDialog(true);
                                                                    setOperationType("edit")
                                                                }}><EditOutlined/>Edit</Button>
                                                    </div>
                                                    <div>
                                                        <Button type="text"
                                                                size="middle"
                                                                disabled={showViewDialog||showCheckBox}
                                                                onClick={() => {
                                                                    setShowCheckBox(true);
                                                                    setView(item);
                                                                }}><DeleteOutlined/>Delete</Button>
                                                    </div>
                                                </div>}>
                                            <MoreOutlined key="ellipsis"/>
                                        </Popover>
                                    </Col>
                                </Row>
                            </Menu.Item>
                        }):null}

                    </Menu>
                </Sider>
                <Content style={{margin: "3% 10%"}}>
                    <Form
                        name="basic"
                        form={form}
                        onFinish={onFinish}
                        autoComplete="off"
                        layout="vertical"
                    >
                        <Form.Item
                            //隐藏这个输入框
                            hidden
                            label="id"
                            name="id"
                        >
                            <Input/>
                        </Form.Item>
                        <Form.Item>
                            <div style={{fontSize: "26px"}}>
                                Viewable Columns:
                            </div>
                        </Form.Item>
                        <Form.Item
                            // label="Viewable Columns"
                            name="columns"
                            style={{maxWidth: "100%"}}
                            rules={[{required: true, message: 'Please input your viewable columns!'}]}
                        >
                            <Select mode="multiple" placeholder="Please select googleAccount" size="large"
                                    onSelect={getSelect} onDeselect={removeSelect}>
                                {options.map((item, index) => {
                                    return <Option key={index} value={item.value}>{item.label}</Option>
                                })}
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <div style={{fontSize: "26px"}}>
                                Allowed Action:
                            </div>
                        </Form.Item>
                        <Form.Item
                            // label="Allowed Action"
                            name="allowedActions"
                            style={{maxWidth: "100%"}}>
                            <Checkbox.Group style={{display: "table"}} onChange={openESelect}>
                                <Checkbox value="add" style={{fontSize: "20px", marginBottom: "20px"}}>Add
                                    Record</Checkbox>
                                <br/>
                                <Checkbox value="delete" style={{fontSize: "20px", marginBottom: "20px"}}>Delete
                                    Record</Checkbox>
                                <br/>
                                <Checkbox value="edit" style={{fontSize: "20px", marginBottom: "20px"}}
                                          >Edit Record</Checkbox>
                            </Checkbox.Group>
                        </Form.Item>
                        <Form.Item
                            // label="Viewable Columns"
                            hidden={roleItem.allowedActions.indexOf("edit")==-1}
                            name="editColumns"
                            style={{maxWidth: "100%"}}
                        >
                            <Select mode="multiple" placeholder="Please select googleAccount" size="large">
                                {roleItem.columns.map((item, index) => {
                                    return <Option key={index} value={item}>{item}</Option>
                                })}
                            </Select>
                        </Form.Item>
                        <Form.Item style={{float: "right"}}>
                            <Button htmlType="button" onClick={onReset} size="large">
                                Reset
                            </Button>
                            <Button type="primary" htmlType="submit" style={{margin: "0 20px"}} size="large">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>

                </Content>
            </Layout>
            <Modal
                visible={showCheckBox}
                title="Delete View"
                okText="Submit"
                onOk={() => onDelete(view)}
                onCancel={() => {
                    setShowCheckBox(false)
                }}
                destroyOnClose>
                <p>Are you sure to delete {view.roleName} ?</p>
            </Modal>
            <ViewDialog
                item={view}
                appId={appId}
                operationType={operationType}
                viewType="role"
                visible={showViewDialog}
                close={closeViewDialog}
                viewId={viewId}
            ></ViewDialog>
        </div>
    );
}

export default observer(Roles);














