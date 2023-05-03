import {Button, Col, Form, Input, Layout, Row, Select, Cascader, Divider, message} from "antd";
import React, {useEffect, useState} from "react";
import {observer} from 'mobx-react-lite'
import {useParams, useLocation, useNavigate} from 'react-router-dom';
import {useStore} from "@/stores";

//引用组件
import ViewMenus from "@/components/view/ViewMenus";

const {Sider, Content} = Layout;

interface Option {
    value: string | number;
    label: string;
    children?: Option[];
}


const View = () => {
    const navigate = useNavigate()
    const state = useLocation()
    //定义state数据
    const {viewStore} = useStore()

    //获取url带的数据
    const appId=useParams().appId
    // viewStore.getViews(appId).then()
    const [viewId,setViewId]=useState()
    //调用服务器方法
    // const [columnsList, setColumnsList] = useState({"columns0": "a","name0": "222" ,"type0": [ "reference", "sheet1" ],"label0": "false","columns1": "a","name1": "222" ,"type1": [ "reference", "sheet1" ],"label1": "false"})
    // const [nameList, setNameList] = useState([["columns0","name0","type0","label0"],["columns1","name1","type1","label1"]])
    let [columnsList, setColumnsList] = useState({})
    const [nameList, setNameList] = useState([])
    useEffect(() => {
        viewStore.getViews(appId).then(()=>{
            setViewId(JSON.parse(JSON.stringify(viewStore.views[0])).id)
            setNameList(JSON.parse(JSON.stringify(viewStore.views[0])).nameList)
            setColumnsList(JSON.parse(JSON.stringify(viewStore.views[0])).columnsList)

            form.setFieldsValue(columnsList)
        })
    }, viewStore)

    let options: Option[] = [
        {
            value: 'text',
            label: 'text',
        },
        {
            value: 'boolean',
            label: 'boolean',
        },
        {
            value: 'number',
            label: 'number',
        },{
            value: 'url',
            label: 'url',
        },
        {
            value: 'reference',
            label: 'reference',
            children:viewStore.viewNameArr ,
        },
    ];

    const getViewMenusId=(viewMenusId)=>{
        viewStore.views.map((item,index)=>{
            if (item.id==viewMenusId){
                setViewId(viewMenusId)
                setNameList(item.nameList)
                setColumnsList(item.columnsList)
            }
        })
    }

    const addColumn=()=>{
        let nameItem=["columns"+nameList.length,"name"+nameList.length,"type"+nameList.length,"label"+nameList.length]
        nameList.push(nameItem)
        setNameList([...nameList])
    }
    const [form] = Form.useForm();
    async function onFinish(values){
        values.id=viewId
        viewStore.editOrAddViewColumn(values).then()
        message.success('Edit Success')

    };

    const onReset = () => {
        // form.resetFields();
        viewStore.getViews(appId).then(()=>{
            setNameList(JSON.parse(JSON.stringify(viewStore.views[0])).nameList)
            setColumnsList(JSON.parse(JSON.stringify(viewStore.views[0])).columnsList)
            form.setFieldsValue(columnsList)
        })
    };
    const goRole=()=>{
        navigate("/"+appId+"/"+viewId+"/roles");
    }
    form.setFieldsValue(columnsList)
    return (
        <div className="ViewDetail" style={{ height: '100%'}}>
            <Layout>
                <Sider style={{background: "#f5f5f5", height: '100%'}}>
                    {/*//引用组件*/}
                    <ViewMenus appId={appId}  getViewMenusId={getViewMenusId}></ViewMenus>
                </Sider>
                <Content style={{margin: 30}}>
                    <Form
                        name="basic"
                        form={form}
                        onFinish={onFinish}
                        // initialValues={columnsList}
                        autoComplete="off"
                        layout="vertical"
                    >
                        <Form.Item>
                            <Button type="primary" ghost htmlType="button" onClick={goRole} size="large" >
                                Edit Role
                            </Button>
                            <Button type="primary" disabled={viewStore.viewNameArr.length==0} htmlType="submit" style={{float:"right",margin:"0 20px"}} size="large">
                                Submit
                            </Button>
                            <Button htmlType="button"  disabled={viewStore.viewNameArr.length==0}  onClick={onReset} style={{float:"right"}} size="large">
                                Reset
                            </Button>

                        </Form.Item>
                        {/*<Divider />*/}
                        {nameList?nameList.map(item=>{
                            return <Row>
                                <Col span={6} >
                                    <Form.Item
                                        label="Columns"
                                        name={item[0]}
                                        style={{maxWidth: "90%"}}
                                    >
                                        <Select>
                                            <Option value="a">A</Option>
                                            <Option value="b">B</Option>
                                            <Option value="c">C</Option>
                                            <Option value="d">D</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={6} >
                                    <Form.Item
                                        label="Name"
                                        name={item[1]}
                                        style={{maxWidth: "90%"}}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={6} >
                                    <Form.Item
                                        label="Type"
                                        name={item[2]}
                                        style={{maxWidth: "90%"}}
                                    >
                                        <Cascader options={options} placeholder="Please select" />
                                    </Form.Item>
                                </Col>
                                <Col span={6} >
                                    <Form.Item
                                        label="Label"
                                        name={item[3]}
                                        style={{maxWidth: "90%"}}
                                    >
                                        <Select >
                                            <Option value="TRUE">TRUE</Option>
                                            <Option value="FALSE">FALSE</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        }):null}

                        <Form.Item >
                            <Button type="primary"  disabled={viewStore.viewNameArr.length==0}  onClick={addColumn} style={{float:"right",marginRight: "20px"}}  ghost>Add Column</Button>
                        </Form.Item>

                    </Form>

                </Content>
            </Layout>

        </div>
    );
}

export default observer(View);






