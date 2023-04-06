import {Button, Col, Menu, message, Popover, Row} from "antd";
import {DeleteOutlined, EditOutlined, FileTextOutlined, MoreOutlined, PlusOutlined} from "@ant-design/icons";
import React, {useState} from "react";
import ViewDialog from "@/components/view/ViewDialog";
import {useStore} from "@/stores";


const ViewMenus = (props) => {
    const {viewStore} = useStore()
    const [showViewDialog, setShowViewDialog] = useState(false)
    const [operationType, setOperationType] = useState("create")
    const [view, setView] = useState([])
    const closeViewDialog = () => {
        setShowViewDialog(false)
    }
    const onDelete = async (id) => {
        await viewStore.deleteView(id)
        if (viewStore.view.code == 200) {
            message.success('Delete success')
        }
        window.location.reload()

    }
    //左侧菜单模板设置
    return (
        <Menu
            mode="inline"
            style={{height: '100%', background: "#f5f5f5"}}
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
            {props.hasViews ? viewStore.views.map(item => {
                return <Menu.Item>
                    <Row>
                        <Col span={3} offset={1} style={{}}>
                            <FileTextOutlined/>
                        </Col>
                        <Col span={17} style={{}}>
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
                                            <Button type="text" size="middle" onClick={() => {
                                                setView(item);
                                                setShowViewDialog(true);
                                                setOperationType("edit")
                                            }}><EditOutlined/>Edit</Button>
                                        </div>
                                        <div>
                                            <Button type="text" size="middle" onClick={()=>onDelete(item)}><DeleteOutlined/>Delete</Button>
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
            ></ViewDialog>
        </Menu>


    );
}
export default ViewMenus