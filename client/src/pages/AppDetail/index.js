import {
    Button,
    Layout,
    Menu,
    Tabs,
    Radio,
    Table,
    Space,
    Modal,
    Form,
    Input,
    Row,
    Popconfirm,
    message,
    Select
} from "antd";
import React, {useEffect, useState,useRef} from 'react';
import {
    DoubleLeftOutlined,
    DoubleRightOutlined, EditOutlined,
    SaveOutlined, ProfileOutlined, UserOutlined, BankOutlined, PlusOutlined
} from "@ant-design/icons";
import {useStore} from "@/stores";
import {useNavigate, useParams} from "react-router-dom";
import {observer} from "mobx-react-lite";
import {keyboard} from "@testing-library/user-event/dist/keyboard";
const {Option} = Select;
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
    // let idIndex=null
    let rowNumIndex=null
    const {viewStore,userStore} = useStore()
    const appId = useParams().appId
    const navigate = useNavigate();
    let [columns,setColumns]=useState([])
    let [viewId,setViewId]=useState(null)
    let showType="all"
    const [addRecord, setAddRecord] = useState(false);
    const [showCheckBox, setShowCheckBox] = useState(false)
    const [recordId, setRecordId] = useState(false)


    const getTableData=()=>{
        console.log("showType",showType)
        dataList=[]
        setDataList(dataList=[])
        columns=[]
        setColumns([])
        viewStore.detailData.map((item,index)=>{
            //通过view id去判断是否是初始化页面，初始化页面直接获取第一个数据
            if(viewId==null? index==0:item.id==viewId){
                console.log("viewId",item.id)
                viewId=item.id
                setViewId(viewId)
                console.log("viewId",viewId)
                //获取reference对应的字段和当前view字段做比较
                item.reference.map((item,index)=>{
                    referenceList.push(item[0])
                })
                //reference数据
                reference=item.reference
                setReference(reference)
                //允许的操作
                allowedAction=item.allowedAction
                setAllowedAction(allowedAction)
                //可修改的列
                editNameList=item.editableColumns
                setEditNameList(editNameList)
                //当前view数据遍历组装成需要的数据
                item.viewData.map((item,index)=>{
                    //index为0的数据是表头
                    if (index==0){
                        nameList =item.rowData
                        setNameList(nameList)
                        item.rowData.map((item,index)=>{
                            // if (item=="id"){
                            //     //获取id的存储位置
                            //     idIndex=index
                            // }
                            //rowNum不展示
                            if(item!="rowNum"){
                                if (referenceList.indexOf(item) != -1 ){
                                    // columns.push({title: item, dataIndex: item, key:item,render: (text: string) => <a onClick={showRefData}>{text}</a>})
                                    columns.push({title: item, dataIndex: item, key:item,render: (text: string) => <a onClick={()=>showRefData(item,text)}>{text}</a>})
                                }else {
                                    columns.push({title: item, dataIndex: item, key: item})
                                }
                            }else {
                                //获取rowNum的存储位置
                                rowNumIndex=index
                            }

                        })
                    }else {
                        let rowDataL= item.rowData.length
                        //拼装成所需要的对象格式{}
                        item.rowData.map((item,index)=>{
                                if(index==0){
                                    dataItem ='{'
                                }
                                if (index==rowNumIndex){
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
                        //所有数据
                        dataList.push({...JSON.parse(dataItem)})
                        let changeList =[]
                        //userFilter为自己的数据
                        if(showType=="userFilter"){
                            dataList.map((item)=>{
                                if(item.createBy.toString() ==userStore.gmail.toString()){
                                    changeList.push(item)
                                }
                            })
                            dataList = changeList
                        }
                        //filter为true的数据
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
        //数据不为空时添加操作列
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
                            <a hidden={allowedAction.indexOf("delete") != -1} onClick={() => deleteColumns(record.key)}>Delete</a>
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


    //根据筛选条件展示数据
    const changeRecordDate=(values)=>{
        showType=values.key
        getTableData()
    }

    //切换view页面
    const onChange = (id) =>{
        console.log("viewId",id)
        viewId=id
        getTableData()
    }

    //弹出框展示ref数据
    const showRefData = async (refName,refId) => {
        setFromType("Show")
        // 取出点击列对应的view名
        let refTableName= reference.map((item)=>{
            if (item[0]==refName){
                return item[1].toString()
            }
        }).toString()
        let refIdIndex=null
        let refDate =[]
        let refTitle=[]
        viewStore.detailData.map((item)=>{
            // 根据view名过滤数据
            if (item.viewName==refTableName){
                item.viewData.map((item,index)=>{

                    if(index==0){
                        // 在表头行获取id对应的位置下标
                        refTitle=item.rowData
                        item.rowData.map((item,index)=>{
                            if (item=='id'){
                                refIdIndex=index
                            }
                        })
                    }else {
                        // 根据id获取相应的数据
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
        //拼接弹出框的数据
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
        //渲染from表单
        form.setFieldsValue(JSON.parse(showData))
        setAddRecord(true)


    }

    //加载修改from表单数据
    const editColumns=(value)=>{
        console.log("edit",value)
        setFromNames([...editNameList,"key"])
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
        form.setFieldsValue({...JSON.parse(editData),key:value.key})

        setAddRecord(true)
    }

    //加载新增from表单数据
    const onAddRecord=(value)=>{
        console.log("add",value)
        console.log("add",nameList)
        setFromNames(nameList)
        setFromType("Add")
        form.resetFields();
        setAddRecord(true)
    }

    //新增和修改保存按钮
    const saveRecord=()=>{
        form.validateFields().then(async (values) => {
            console.log(viewId)
            console.log(values)
            console.log({id:viewId,rowData:values})
            if (fromType=="Add"){
                viewStore.addRecordToGoogleSheet({id:viewId,rowData:values}).then((res)=>{
                    if (res.code==200){
                        message.success('Add success')
                        viewStore.getViewForGoogleSheet(appId).then(()=>{
                            getTableData()
                        })
                        setAddRecord(false)
                    }
                    if (res.code==500){
                        message.warning(res.data)
                    }
                })
            }else {
                let rowNum = values.key
                delete values.key
                viewStore.editRecordToGoogleSheet({id:viewId,rowNum:rowNum,rowData:values}).then((res)=>{
                    if (res.code==200){
                        message.success('Add success')
                        viewStore.getViewForGoogleSheet(appId).then(()=>{
                            getTableData()
                        })
                        setAddRecord(false)
                    }
                    if (res.code==500){
                        message.warning(res.data)
                    }
                })
            }
        }).catch((err)=>{

        })
    }

    //删除提示框
    const  deleteColumns=(id)=>{
        setShowCheckBox(true)
        setRecordId(id)
        console.log(id)
    }
    //删除一行数据
    const onDelete = async (value) => {
        console.log("Delete",value)
        viewStore.deleteRecordToGoogleSheet({id:viewId,rowNum:value}).then((res)=>{
            if (res.code==200){
                message.success("Delete success")
                viewStore.getViewForGoogleSheet(appId).then(()=>{
                    getTableData()
                })
            }
            if (res.code==500){
                message.warning(res.data)
            }
        })
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
                        {/*<div>*/}
                        {/*    <Button type="text" icon={<DoubleLeftOutlined/>} size="large" onClick={() => navigate("/")}*/}
                        {/*            style={{marginLeft: "15px", marginTop: "50px"}}></Button>*/}
                        {/*    <Button type="text" icon={<SaveOutlined/>} size="large"*/}
                        {/*            style={{marginLeft: "15px", marginTop: "10px"}}></Button>*/}
                        {/*    <Button type="text" icon={<DoubleRightOutlined/>} size="large"*/}
                        {/*            style={{marginLeft: "15px", marginTop: "10px"}}></Button>*/}

                        {/*</div>*/}

                            <Button  type="dashed"
                                     onClick={onAddRecord}
                                     icon={<EditOutlined/>}
                                     shape="round"
                                     disabled={allowedAction.indexOf("add") == -1}
                                     size="large"
                                     style={{marginLeft: 20, marginTop: 35,marginBottom:15}}>
                               Add record
                            </Button>

                        {/*<Menu.Item disabled={allowedAction.indexOf("add") == -1} onClick={onAddRecord}>*/}
                        {/*    <EditOutlined style={{marginRight: "10px"}}/>Add record*/}
                        {/*</Menu.Item>*/}
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
                onOk={saveRecord}
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
                        // 过滤掉id,createBy,rowNum不展示
                        if(item!="id" && item!="createBy" && item!="rowNum" ){
                        return <Form.Item
                            label={item}
                            name={item}
                            hidden={item=="key"}
                            style={{maxWidth: "100%"}}
                            rules={[{required: true, message: 'Please input your '+item+'!'}]}>
                            {
                                // filter和editable用下拉选择框展示
                                item!= "filter" && item!= "editable"?
                                    <Input placeholder={"Please input your "+item}/>:
                                    <Select placeholder={"Please select your"+item}
                                            options={[
                                                { value: 'TRUE', label: 'TRUE' },
                                                { value: 'FALSE', label: 'FALSE' }]}>
                                    </Select>
                            }
                        </Form.Item>
                        }})}

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



