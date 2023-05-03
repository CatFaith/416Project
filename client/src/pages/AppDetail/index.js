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
    Select, Checkbox, Switch, Col
} from "antd";
import React, {useEffect, useState, useRef} from 'react';
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

const AppDetail = () => {
    const [form] = Form.useForm();
    const [filterForm] = Form.useForm();
    let referenceList = []
    let [reference, setReference] = useState([])
    let [allowedAction, setAllowedAction] = useState([])
    let [nameList, setNameList] = useState([])
    let [editNameList, setEditNameList] = useState([])
    let [fromNames, setFromNames] = useState([])
    let [fromType, setFromType] = useState('')
    let [dataList, setDataList] = useState([])
    let [role, setRole] = useState('')
    let [filter, setFilter] = useState()
    let [userFilter, setUserFilter] = useState()
    let [editFilter, setEditFilter] = useState()
    let dataItem = ''
    let rowNumIndex = null
    const {viewStore, userStore} = useStore()
    const appId = useParams().appId
    const navigate = useNavigate();
    let [columns, setColumns] = useState([])
    let [viewId, setViewId] = useState(null)
    let showType = "all"
    const [addRecord, setAddRecord] = useState(false);
    const [showCheckBox, setShowCheckBox] = useState(false)
    const [recordId, setRecordId] = useState(false)


    const getTableData = () => {
        dataList = []
        setDataList(dataList = [])
        columns = []
        setColumns([])
        viewStore.detailData.map((item, index) => {
            //通过view id去判断是否是初始化页面，初始化页面直接获取第一个数据
            if (viewId == null ? index == 0 : item.id == viewId) {
                viewId = item.id
                setViewId(viewId)
                //获取reference对应的字段和当前view字段做比较
                item.reference.map((item, index) => {
                    referenceList.push(item[0])
                })
                role=item.role
                setRole(role)
                filter=item.filter
                setFilter(filter)
                userFilter=item.userFilter
                setUserFilter(userFilter)
                editFilter=item.editFilter
                setEditFilter(editFilter)
                filterForm.setFieldsValue({editFilter: editFilter,filter: filter,userFilter: userFilter})
                //reference数据
                reference = item.reference
                setReference(reference)
                //允许的操作
                allowedAction = item.allowedAction
                setAllowedAction(allowedAction)
                //可修改的列
                editNameList = item.editableColumns
                setEditNameList(editNameList)
                //当前view数据遍历组装成需要的数据
                item.viewData.map((item, index) => {
                    //index为0的数据是表头
                    if (index == 0) {
                        nameList = item.rowData
                        setNameList(nameList)
                        item.rowData.map((item, index) => {
                            //rowNum不展示
                            if (item != "rowNum") {
                                if (referenceList.indexOf(item) != -1) {
                                    // columns.push({title: item, dataIndex: item, key:item,render: (text: string) => <a onClick={showRefData}>{text}</a>})
                                    columns.push({
                                        title: item,
                                        dataIndex: item,
                                        key: item,
                                        render: (text: string) => <a onClick={() => showRefData(item, text)}>{text}</a>
                                    })
                                } else {
                                    columns.push({title: item, dataIndex: item, key: item})
                                }
                            } else {
                                //获取rowNum的存储位置
                                rowNumIndex = index
                            }

                        })
                    } else {
                        let rowDataL = item.rowData.length
                        //拼装成所需要的对象格式{}
                        item.rowData.map((item, index) => {
                            if (index == 0) {
                                dataItem = '{'
                            }
                            if (index == rowNumIndex) {
                                dataItem = dataItem + '"key":' + item + ','
                            }
                            dataItem = dataItem + '"' + nameList[index] + '":' + '"' + item + '"'
                            if (index < (rowDataL - 1)) {
                                dataItem = dataItem + ','
                            }
                            if (index == (rowDataL - 1)) {
                                dataItem = dataItem + '}'
                            }
                        })
                        //table需要展示的所有数据
                        dataList.push({...JSON.parse(dataItem)})
                        let changeList = []
                        //过滤出userFilter为自己的gmail的数据
                        if (showType == "userFilter") {
                            dataList.map((item) => {
                                if (item.createBy.toString() == userStore.gmail.toString()) {
                                    changeList.push(item)
                                }
                            })
                            dataList = changeList
                        }
                        //过滤出filter为true的数据
                        if (showType == "filter") {
                            dataList.map((item) => {
                                if (item.filter.toString() == "TRUE") {
                                    changeList.push(item)
                                }
                            })
                            dataList = changeList
                        }
                    }
                })
            }
        })
        //当table数据不为空时根据allowedAction的数据添加删除或者修改操作列
        if (dataList.length != 0) {
            //设置teble数据
            setDataList([...dataList])
            //设置table的title
            setColumns([...columns, {
                title: 'Action',
                dataIndex: '',
                key: 'x',
                render: (_, record: { key: React.Key }) =>
                    dataList.length >= 1 ? (
                        <div>
                            {/*通过allowedAction可以来判断是否有权限修改和删除*/}
                            <a hidden={allowedAction.indexOf("edit") == -1} onClick={() => editColumns(record)}
                               style={{marginRight: "10px"}}>Edit</a>
                            <a hidden={allowedAction.indexOf("delete") == -1}
                               onClick={() => deleteColumns(record)}>Delete</a>
                        </div>
                    ) : null,
            }])
        }
    }
    //调用后端方法获取页面所有数据
    useEffect(() => {
        viewStore.getViewForGoogleSheet(appId).then(() => {
            getTableData()

        })
    }, viewStore)

    const onChangeFilter = () => {
        filterForm.validateFields().then(async (values) => {
            viewStore.editFilter({...values,id:viewId}).then()
            console.log(values)
        }).catch((err) => {
            console.log(err)
        })
    }

    //定义table标签在Tabs里引用，columns为teble数据，dataList为table的title
    const children = <div>
        <Form
            hidden={role != "developers"}
            name="basic"
            form={filterForm}
        >
            <Row justify="end">
                <Col span={3}>
                    <Form.Item label="filter:" name="filter" valuePropName="checked">
                        <Switch onChange={onChangeFilter}/>
                    </Form.Item>
                </Col>
                <Col span={3}>
                    <Form.Item label="userFilter:" name="userFilter" valuePropName="checked">
                        <Switch onChange={onChangeFilter}/>
                    </Form.Item>
                </Col>
                <Col span={3}>
                    <Form.Item label="editFilter:" name="editFilter" valuePropName="checked">
                        <Switch onChange={onChangeFilter}/>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
        <Table columns={columns} dataSource={dataList}/>
    </div>


    //根据筛选条件展示数据
    const changeRecordDate = (values) => {
        //设置showType的类型，在getTableData（）方法里根据showType过滤table的数据
        showType = values.key
        getTableData()
    }

    //切换view页面
    const onChange = (id) => {
        //设置viewId，在getTableData（）方法里根据viewId过滤table的数据
        viewId = id
        getTableData()
    }

    //弹出框展示ref数据
    const showRefData = async (refName, refId) => {
        setFromType("Show")
        // 取出点击列对应的view名
        let refTableName = reference.map((item) => {
            if (item[0] == refName) {
                return item[1].toString()
            }
        }).toString()
        let refIdIndex = null
        let refDate = []
        let refTitle = []
        viewStore.detailData.map((item) => {
            // 根据view名过滤数据
            if (item.viewName == refTableName) {
                item.viewData.map((item, index) => {

                    if (index == 0) {
                        // 在表头行获取id对应的位置下标
                        refTitle = item.rowData
                        item.rowData.map((item, index) => {
                            if (item == 'id') {
                                refIdIndex = index
                            }
                        })
                    } else {
                        // 根据id获取相应的数据
                        if (item.rowData[refIdIndex] == refId) {
                            refDate = item.rowData
                        }

                    }
                })
            }
        })
        setFromNames(refTitle)
        let showData = {}
        let showDataL = refTitle.length
        //拼接弹出框的数据
        refTitle.map((item, index) => {
            if (index == 0) {
                showData = '{'
            }
            showData = showData + '"' + item + '":' + '"' + refDate[index] + '"'
            if (index < (showDataL - 1)) {
                showData = showData + ','
            }
            if (index == (showDataL - 1)) {
                showData = showData + '}'
            }
        })
        //渲染from表单
        form.setFieldsValue(JSON.parse(showData))
        setAddRecord(true)


    }

    //加载修改from表单数据
    const editColumns = (value) => {
        if (role=="developers" || value.createBy == userStore.gmail) {
            if (role=="developers" || value.editable=="TRUE"){
                setFromNames([...editNameList, "key"])
                setFromType("Edit")
                let editData = {}
                let editNameL = editNameList.length
                editNameList.map((item, index) => {
                    if (index == 0) {
                        editData = '{'
                    }
                    editData = editData + '"' + item + '":' + '"' + value[item] + '"'
                    if (index < (editNameL - 1)) {
                        editData = editData + ','
                    }
                    if (index == (editNameL - 1)) {
                        editData = editData + '}'
                    }
                })
                form.setFieldsValue({...JSON.parse(editData), key: value.key})
                setAddRecord(true)
            }else {
                message.warning("Not modifiable")
            }
        } else {
            message.warning("No Permission")
        }

    }

    //加载新增from表单数据
    const onAddRecord = (value) => {
        setFromNames(editNameList)
        setFromType("Add")
        form.resetFields();
        setAddRecord(true)
    }

    //新增和修改保存按钮
    const saveRecord = () => {
        form.validateFields().then(async (values) => {
            //通过判断fromType类型调用不同的方法
            if (fromType == "Add") {
                viewStore.addRecordToGoogleSheet({id: viewId, rowData: values}).then(() => {
                    if (viewStore.operateRes.code == 200) {
                        message.success('Add success')
                        viewStore.getViewForGoogleSheet(appId).then(() => {
                            getTableData()
                        })
                        //关闭弹出框
                        setAddRecord(false)
                    }
                    if (viewStore.operateRes.code == 500) {
                        message.warning(viewStore.operateRes.data)
                    }
                })
            } else {
                let rowNum = values.key
                delete values.key
                viewStore.editRecordToGoogleSheet({id: viewId, rowNum: rowNum, rowData: values}).then(() => {
                    if (viewStore.operateRes.code == 200) {
                        message.success('Add success')
                        viewStore.getViewForGoogleSheet(appId).then(() => {
                            getTableData()
                        })
                        //关闭弹出框
                        setAddRecord(false)
                    }
                    if (viewStore.operateRes.code == 500) {
                        message.warning(viewStore.operateRes.data)
                    }
                })
            }
        }).catch((err) => {

        })
    }

    //删除提示框
    const deleteColumns = (value) => {
        if (role=="developers" ||value.createBy == userStore.gmail) {
            setShowCheckBox(true)
            setRecordId(value.key)
        } else {
            message.warning("No Permission")
        }

    }
    //删除一行数据
    const onDelete = async (value) => {
        viewStore.deleteRecordToGoogleSheet({id: viewId, rowNum: value}).then((res) => {
            if (viewStore.operateRes.code == 200) {
                message.success("Delete success")
                viewStore.getViewForGoogleSheet(appId).then(() => {
                    getTableData()
                })
                //关闭弹出框
                setShowCheckBox(false)
            }
            if (viewStore.operateRes.code == 500) {
                message.warning(viewStore.operateRes.data)
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

                        <Button type="dashed"
                                onClick={onAddRecord}
                                icon={<EditOutlined/>}
                                shape="round"
                            // 根据allowedAction的值判断该用户是否有权限添加行数据
                                disabled={allowedAction.indexOf("add") == -1}
                                size="large"
                                style={{marginLeft: 20, marginTop: 35, marginBottom: 15}}>
                            Add record
                        </Button>

                        {/*<Menu.Item disabled={allowedAction.indexOf("add") == -1} onClick={onAddRecord}>*/}
                        {/*    <EditOutlined style={{marginRight: "10px"}}/>Add record*/}
                        {/*</Menu.Item>*/}
                        <Menu.Item key="all" onClick={changeRecordDate}>
                            <BankOutlined style={{marginRight: "10px"}}/>All
                        </Menu.Item>
                        <Menu.Item key="userFilter" onClick={changeRecordDate} hidden={role != "developers"}>
                            <UserOutlined style={{marginRight: "10px"}}/>User filter
                        </Menu.Item>
                        <Menu.Item key="filter" onClick={changeRecordDate} hidden={role != "developers"}>
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
                        // 遍历出所有view名称展示到tab，children为table
                        items={viewStore.detailTabs.map(item => {
                            item = {...item, children: children}
                            return item
                        })}/>
                </Content>
            </Layout>
            <Modal
                title={fromType + " record"}
                centered
                //通过addRecord参数控制modal的开关
                open={addRecord}
                onOk={saveRecord}
                onCancel={() => setAddRecord(false)}
                width={400}
                okText="save"
                //当为ref展示的时候禁用提交按钮
                okButtonProps={{disabled: fromType == "Show"}}
            >
                <Form
                    name="basic"
                    autoComplete="off"
                    layout="vertical"
                    //绑定form，通过form调用from表单相关方法
                    form={form}
                    //当为ref展示的时候禁用表单修改功能
                    disabled={fromType == "Show"}
                >
                    {fromNames.map((item, index) => {
                        // 过滤掉id,createBy,rowNum不展示
                        if (item != "id" && item != "createBy" && item != "rowNum") {
                            return <Form.Item
                                label={item}
                                name={item}
                                // 当item为key时隐藏该列数据
                                hidden={item == "key"}
                                style={{maxWidth: "100%"}}
                                rules={[{required: true, message: 'Please input your ' + item + '!'}]}>
                                {
                                    // filter和editable用下拉选择框展示，其余用input
                                    item != "filter" && item != "editable" ?
                                        <Input placeholder={"Please input your " + item}/> :
                                        <Select placeholder={"Please select your" + item}
                                                options={[
                                                    {value: 'TRUE', label: 'TRUE'},
                                                    {value: 'FALSE', label: 'FALSE'}]}>
                                        </Select>
                                }
                            </Form.Item>
                        }
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



