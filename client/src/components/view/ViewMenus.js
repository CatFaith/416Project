import {Button, Col, Menu, message, Modal, Popover, Row} from "antd";
import {DeleteOutlined, EditOutlined, FileTextOutlined, MoreOutlined, PlusOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import ViewDialog from "@/components/view/ViewDialog";
import {useStore} from "@/stores";
import {useNavigate, useParams} from "react-router-dom";
import {observer} from 'mobx-react-lite'

const ViewMenus = (props) => {
    const {viewStore} = useStore()
    const [showViewDialog, setShowViewDialog] = useState(false)
    const [operationType, setOperationType] = useState("create")
    const [view, setView] = useState([])
    const [showCheckBox, setShowCheckBox] = useState(false)
    const navigate = useNavigate();
    const appId=useParams().appId
    const closeViewDialog = () => {
        setShowViewDialog(false)
    }
    const [selectedKeys,setSelectedKeys]=useState("")

    useEffect(() => {
        viewStore.getViews(appId).then(()=>{
            setSelectedKeys(JSON.parse(JSON.stringify(viewStore.views[0])).id.toString())
        })
    }, viewStore)
    const onDelete = async (id) => {
        await viewStore.deleteView(id)
        if (viewStore.view.code == 200) {
            message.success('Delete success')
            viewStore.getViews(appId).then()
            setShowCheckBox(false)
            setSelectedKeys(JSON.parse(JSON.stringify(viewStore.views[0])).id.toString())
        }
    }
    const goView = (id) =>{
        // navigate("/"+appId+"/views?id="+id);
        setSelectedKeys(id.toString())
        props.getViewMenusId(id)
    }

    //左侧菜单模板设置
    return (
        <Menu
            mode="inline"
            style={{height: '100%', background: "#f5f5f5"}}
            selectedKeys={[selectedKeys]}
        >
            <Menu.Item disabled="true" style={{fontSize: "larger"}}>
                App Edit
            </Menu.Item>
            <Menu.Item onClick={() => {
                setView([]);
                setOperationType("create");
                setShowViewDialog(true);
            }}>
                <Row>
                    <Col span={6} style={{fontSize: "larger"}}>
                        #view
                    </Col>
                    <Col span={3} offset={15} style={{fontSize: "larger"}}>
                        <PlusOutlined/>
                    </Col>
                </Row>
                <ViewDialog
                    item={view}
                    appId={props.appId}
                    operationType={operationType}
                    visible={showViewDialog}
                    close={closeViewDialog}
                ></ViewDialog>
            </Menu.Item>
            {/*遍历view list获取菜单值*/}
            {viewStore.views.length > 0 ? viewStore.views.map((item,index) => {
                return <Menu.Item key={item.id} onClick={()=>goView(item.id)}>
                    <Row >
                        <Col span={3} offset={1} >
                            <FileTextOutlined/>
                        </Col>
                        <Col span={17}  onClick={()=>goView(item.id)}>
                            {item.viewName}
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
            }) : null}


            {/*//设置弹出表单*/}
            <ViewDialog
                item={view}
                appId={props.appId}
                operationType={operationType}
                visible={showViewDialog}
                close={closeViewDialog}
                viewType="view"
            ></ViewDialog>
            <Modal
                visible={showCheckBox}
                title="Delete View"
                okText="Submit"
                onOk={() => onDelete(view)}
                onCancel={() => {
                    setShowCheckBox(false)
                }}
                destroyOnClose>
                <p>Are you sure to delete {view.viewName} ?</p>
            </Modal>
        </Menu>


    );
}
export default observer(ViewMenus)