import {Button, Card, message, Popover} from "antd";
import {EditOutlined, EllipsisOutlined, SettingOutlined, ShareAltOutlined, DeleteOutlined} from "@ant-design/icons";
import app1 from '@/assets/app1.jpg'
import {useNavigate} from 'react-router-dom'
import React, {useState} from "react";
import {useStore} from '@/stores'
import AppDialog from "@/components/app/AppDialog";

const {Meta} = Card;
//props:父组件传过来的参数
const AddCard = (props) => {
    //state参数：在页面实现双向绑定
    const [operationType, setOperationType] = useState("edit")
    const [showAppDialog, setShowAppDialog] = useState(false)
    const [showPopover, setShowPopover] = useState(false)
    //通过改变state参数实现弹出来的展开和闭合
    const closeAddDialog = () => {
        setShowAppDialog(false)
    }
    //调用store里的方法
    const {appStore, viewStore} = useStore()
    //通过useNavigate实现页面跳转
    const navigate = useNavigate();


    const goViews = () => {
        //页面跳转到views
        navigate("/views", {state: {appId: props.item.id}});
    }
    const goAppDetail = () => {
        //页面跳转到appDetail
        navigate("/appDetail", {state: {appId: props.item.id}});
    }

    const onDelete = async (id) => {
        //await 等待await方法执行后再继续执行下一个方法
        await appStore.deleteApp(id)
        if (appStore.app.code == 200) {
            //返回状态码为200调用message组件提示
            message.success('Delete Success')
            appStore.getApps().then()
        }
    }
    return (
        <Card
            style={{width: "90%"}}
            cover={
                <img
                    style={{height: 150}}
                    alt="example"
                    src={app1}
                />
            }
            actions={[
                <SettingOutlined key="setting" onClick={goViews}/>,
                <EditOutlined key="edit" onClick={goAppDetail}/>,
                <Popover
                    visible={showPopover}
                    placement="top"
                    trigger="click"
                    content={
                        <div>
                            <div>
                                {/*//设置表单类型，打开表单，关闭弹出框*/}
                                <Button type="text" size="middle" onClick={() => {
                                    setOperationType("edit");
                                    setShowAppDialog(true);
                                    setShowPopover(false)
                                }}><EditOutlined/>Edit</Button>
                            </div>
                            <div>
                                <Button type="text" size="middle" onClick={() => {
                                    setOperationType("share");
                                    setShowAppDialog(true);
                                    setShowPopover(false)
                                }}><ShareAltOutlined/>Share</Button>
                            </div>
                            <div>
                                {/*//调用onDelete方法*/}
                                <Button type="text" size="middle"
                                        onClick={() => onDelete(props.item.id)}><DeleteOutlined/>Delete</Button>
                            </div>
                        </div>}>
                    {/*//打开关闭弹出框*/}
                    <EllipsisOutlined key="ellipsis"
                                      onClick={() => showPopover ? setShowPopover(false) : setShowPopover(true)}/>
                </Popover>
            ]}>
            <Meta
                title={props.item.appName}
                description={props.item.googleAccount}
            />
            {/*//调用弹出from表单*/}
            <AppDialog
                operationType={operationType}
                item={props.item}
                visible={showAppDialog}
                close={closeAddDialog}
            ></AppDialog>
        </Card>
    );
}

export default AddCard



