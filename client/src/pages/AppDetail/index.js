import {Button, Layout, Menu, Tabs, Radio, Table, Space, Modal, Form, Input, Row, Popconfirm, message} from "antd";
import React, {useEffect, useState,useRef} from 'react';
import {
    DoubleLeftOutlined,
    DoubleRightOutlined, EditOutlined,
    SaveOutlined,ProfileOutlined,UserOutlined,BankOutlined
} from "@ant-design/icons";
import {useStore} from "@/stores";
import {useNavigate, useParams} from "react-router-dom";
import {observer} from "mobx-react-lite";

const {Sider, Content} = Layout

const AppDetail=()=> {
    const [form] = Form.useForm();

    let referenceList=[]
    let [reference,setReference ]= useState([])
    let [allowedAction,setAllowedAction ]= useState([])
    // const allowedActionRef = useRef();
    // useEffect(() => {
    //     allowedActionRef.current = allowedAction;
    // }, [allowedAction]);
    // let nameList=[]
    let [nameList,setNameList ]= useState([])
    let [editNameList,setEditNameList ]= useState([])
    let [fromNames,setFromNames ]= useState([])
    let [fromType,setFromType ]= useState('')
    let [dataList,setDataList ]= useState([])
    // let [addRecordTitle,setAddRecordTitle]= useState([])
    let dataItem=''
    let idIndex=null
    const {viewStore,userStore} = useStore()
    const appId = useParams().appId
    const navigate = useNavigate();
    let [columns,setColumns]=useState([])
    let viewId=null
    let showType="all"

    const getTableData=()=>{
        console.log("showType",showType)

        dataList=[]
        setDataList(dataList=[])

        columns=[]
        setColumns([])
        
        viewStore.detailData.map((item,index)=>{
            if(viewId==null? index==0:item.id==viewId){
                viewId=item.id
                item.reference.map((item,index)=>{
                    referenceList.push(item[0])
                })

                reference=item.reference
                setReference(reference)
                allowedAction=item.allowedAction
                setAllowedAction(allowedAction)
                editNameList=item.editableColumns
                setEditNameList(editNameList)
                
                item.viewData.map((item,index)=>{
                    if (index==0){
                        nameList =item.rowData
                        setNameList(nameList)
                        item.rowData.map((item,index)=>{
                            if (item=="id"){
                                idIndex=index
                            }
                            if (referenceList.indexOf(item) != -1){
                                // columns.push({title: item, dataIndex: item, key:item,render: (text: string) => <a onClick={showRefData}>{text}</a>})

                                columns.push({title: item, dataIndex: item, key:item,render: (text: string) => <a onClick={()=>showRefData(item,text)}>{text}</a>})
                            }else {
                                columns.push({title: item, dataIndex: item, key: item})
                            }
                        })
                    }else {
                        let rowDataL= item.rowData.length
                        item.rowData.map((item,index)=>{
                                if(index==0){
                                    dataItem ='{'
                                }
                                if (index==idIndex){
                                    dataItem=dataItem+'"key":'+item+','
                                }
                                dataItem=dataItem+'"'+nameList[index]+'":'+'"'+item+'"'
                                if (index<(rowDataL-1)){
                                    dataItem=dataItem+','
                                }
                                if(index==(rowDataL-1)){
                                    dataItem =dataItem+'}'
                                }
                        })
                        dataList.push({...JSON.parse(dataItem)})
                        let changeList =[]
                        if(showType=="userFilter"){
                            dataList.map((item)=>{
                                if(item.createBy.toString() ==userStore.gmail.toString()){
                                    changeList.push(item)
                                }
                            })
                            dataList = changeList
                        }
                        if (showType=="filter"){
                            dataList.map((item)=>{
                                if(item.filter.toString() =="TRUE"){
                                    changeList.push(item)
                                }
                            })
                            dataList = changeList
                        }
                    }
                })
            }
        })
        if (dataList.length!=0){
            setDataList([...dataList])
            setColumns([...columns,{
                title: 'Action',
                dataIndex: '',
                key: 'x',
                render:(_, record: { key: React.Key }) =>
                    dataList.length >= 1 ? (
                        <div>
                            <a hidden={allowedAction.indexOf("edit") == -1} onClick={() => editColumns(record)} style={{marginRight: "10px"}}>Edit</a>
                            <a hidden={allowedAction.indexOf("delete") == -1} onClick={() => deleteColumns(record.key)}>Delete</a>
                        </div>
                    ) : null,
            }])
        }
    }

    useEffect(() => {
        viewStore.getViewForGoogleSheet(appId).then(()=>{
            getTableData()
        })
    }, viewStore)

    const children =  <Table columns={columns} dataSource={dataList}/>

    const [addRecord, setAddRecord] = useState(false);
    const [showCheckBox, setShowCheckBox] = useState(false)
    const [recordId, setRecordId] = useState(false)
    const  deleteColumns=(id)=>{
        setShowCheckBox(true)
        setRecordId(id)
        console.log(id)
    }
    const onDelete = async (value) => {
        console.log(value)
    }

    const showRefData = async (refName,refId) => {
        setFromType("Show")
        let refTableName= reference.map((item)=>{
            if (item[0]==refName){
                return item[1].toString()
            }
        }).toString()
        refId=11
        refTableName="course"
        let refIdIndex=null
        let refDate =[]
        let refTitle=[]
        viewStore.detailData.map((item)=>{
            if (item.viewName==refTableName){
                item.viewData.map((item,index)=>{
                    if(index==0){
                        refTitle=item.rowData
                        item.rowData.map((item,index)=>{
                            if (item=='id'){
                                refIdIndex=index
                            }
                        })
                    }else {
                        if (item.rowData[refIdIndex]==refId){
                            refDate=item.rowData
                        }

                    }
                })
            }
        })
        // console.log("refDate",refDate)
        // console.log("refTitle",refTitle)
        setFromNames(refTitle)
        let showData={}
        let showDataL=refTitle.length
        refTitle.map((item,index)=>{
            console.log(item)
            if(index==0){
                showData ='{'
            }
            showData=showData+'"'+item+'":'+'"'+refDate[index]+'"'
            if (index<(showDataL-1)){
                showData=showData+','
            }
            if(index==(showDataL-1)){
                showData =showData+'}'
            }
        })
        console.log(showData)
        form.setFieldsValue(JSON.parse(showData))
        setAddRecord(true)


    }
    const editColumns=(value)=>{
        console.log(value)
        setFromNames(editNameList)
        setFromType("Edit")
        let editData={}
        let editNameL=editNameList.length
        editNameList.map((item,index)=>{
            if(index==0){
                editData ='{'
            }
            editData=editData+'"'+item+'":'+'"'+value[item]+'"'
            if (index<(editNameL-1)){
                editData=editData+','
            }
            if(index==(editNameL-1)){
                editData =editData+'}'
            }
        })
        console.log(JSON.parse(editData))
        form.setFieldsValue(JSON.parse(editData))

        setAddRecord(true)
    }
    const onAddRecord=(value)=>{
        console.log(value)
        setFromNames(nameList)
        setFromType("Add")
        form.resetFields();
        setAddRecord(true)
    }

    const changeRecordDate=(values)=>{
        showType=values.key
        getTableData()
    }

    const onChange = (id) =>{
        // console.log(id)
        viewId=id
        getTableData()
    }


    //定义模板
    return (
        <div className="AppDetail" style={{height: '100%'}}>
            <Layout>
                <Sider style={{background: "#f5f5f5", height: '100%'}}>
                    <Menu
                        mode="inline"
                        style={{height: '100%', background: "#f5f5f5",}}
                        defaultSelectedKeys="all"
                    >
                        <div>
                            <Button type="text" icon={<DoubleLeftOutlined/>} size="large" onClick={() => navigate("/")}
                                    style={{marginLeft: "15px", marginTop: "50px"}}></Button>
                            <Button type="text" icon={<SaveOutlined/>} size="large"
                                    style={{marginLeft: "15px", marginTop: "10px"}}></Button>
                            <Button type="text" icon={<DoubleRightOutlined/>} size="large"
                                    style={{marginLeft: "15px", marginTop: "10px"}}></Button>

                        </div>
                        <Menu.Item disabled={allowedAction.indexOf("add") == -1} onClick={onAddRecord}>
                            <EditOutlined style={{marginRight: "10px"}}/>Add record
                        </Menu.Item>
                        <Menu.Item key="all" onClick={changeRecordDate}>
                            <BankOutlined style={{marginRight: "10px"}}/>All
                        </Menu.Item>
                        <Menu.Item key="userFilter" onClick={changeRecordDate}>
                            <UserOutlined  style={{marginRight: "10px"}}/>User filter
                        </Menu.Item>
                        <Menu.Item key="filter" onClick={changeRecordDate}>
                            <ProfileOutlined style={{marginRight: "10px"}}/>Filter
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Content style={{marginTop: 30, marginLeft: 20, marginRight: 30}}>
                    <Tabs
                        defaultActiveKey="1"
                        tabPosition="top"
                        style={{height: 220}}
                        onChange={onChange}
                        items={viewStore.detailTabs.map(item=>{
                            item={...item,children: children}
                            return item
                        })}/>
                </Content>
            </Layout>
            <Modal
                title={fromType+" record"}
                centered
                open={addRecord}
                onOk={() => setAddRecord(false)}
                onCancel={() => setAddRecord(false)}
                width={400}
                okText="save"
                okButtonProps={{ disabled: fromType=="Show" }}
            >
                <Form
                    name="basic"
                    autoComplete="off"
                    layout="vertical"
                    form={form}
                    disabled={fromType=="Show"}
                >
                    {fromNames.map((item,index)=>{
                        return <Form.Item

                            label={item}
                            name={item}
                            style={{maxWidth: "100%"}}
                            rules={[{required: true, message: 'Please input your '+item+'!'}]}
                        >
                            <Input/>
                        </Form.Item>
                    })}

                </Form>
            </Modal>
            <Modal
                visible={showCheckBox}
                title="Delete View"
                okText="Submit"
                onOk={() => onDelete(recordId)}
                onCancel={() => {
                    setShowCheckBox(false)
                }}
                destroyOnClose>
                <p>Are you sure to delete {recordId} ?</p>
            </Modal>
        </div>
    );
}

export default observer(AppDetail);



