import {Button, Card, message, Popover, Modal} from "antd";
import {EditOutlined, EllipsisOutlined, SettingOutlined, ShareAltOutlined, DeleteOutlined} from "@ant-design/icons";
import app1 from '@/assets/app1.jpg'
import {useNavigate} from 'react-router-dom'
import React, {useState} from "react";
import {useStore} from '@/stores'
import AppDialog from "@/components/app/AppDialog";
const {Meta} = Card;
//props:父组件传过来的参数
const AddCard = (props) => {
    // const [messageApi, contextHolder] = message.useMessage();
    // messageApi.open({type: 'warning',content: 'This is a warning message', });
    //state参数：在页面实现双向绑定
    const [operationType, setOperationType] = useState("edit")
    const [showAppDialog, setShowAppDialog] = useState(false)
    const [showPopover, setShowPopover] = useState(false)
    const [showCheckBox, setShowCheckBox] = useState(false)
    //通过改变state参数实现弹出来的展开和闭合
    const closeAddDialog = () => {
        setShowAppDialog(false)
    }
    //调用store里的方法
    const {appStore, userStore} = useStore()
    //通过useNavigate实现页面跳转
    const navigate = useNavigate();

    const isHasPermission=(url)=>{
        appStore.checkAuthorization(props.item).then(()=>{
            if (appStore.authorization.code==200){
                navigate(url);
            }
            if(appStore.authorization.code==500){
                message.warning(appStore.authorization.data)
            }
        })
    }
    const goViews = () => {
        isHasPermission("/"+props.item.id+"/views")
        //页面跳转到views
    }
    const goAppDetail = () => {
        //页面跳转到appDetail
        isHasPermission("/"+props.item.id+"/detail")
    }

    const onDelete = async (id) => {
        //await 等待await方法执行后再继续执行下一个方法
        await appStore.deleteApp(id)
        if (appStore.app.code == 200) {
            //返回状态码为200调用message组件提示
            message.success('Delete Success')
            appStore.getApps().then(()=>{
                }
            )
        }
        setShowCheckBox(false)
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
                <Button type="text" block
                        onClick={goViews}
                        disabled={(userStore.id==props.item.userId || props.item.developer.indexOf("," + userStore.id + ",") != -1)?false:true }>
                    <SettingOutlined key="setting"/>
                </Button>,
                <Button type="text" block onClick={goAppDetail}>
                    <EditOutlined key="edit" />
                </Button>,
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
                                        onClick={() => {
                                            setShowCheckBox(true)
                                            setShowPopover(false)
                                        }}><DeleteOutlined/>Delete</Button>
                            </div>

                        </div>}>
                    {/*//打开关闭弹出框*/}
                    <Button type="text"
                            block
                            onClick={() => showPopover ? setShowPopover(false) : setShowPopover(true)}
                            disabled={(userStore.id==props.item.userId || props.item.developer.indexOf("," + userStore.id + ",") != -1)?false:true }>
                        <EllipsisOutlined key="ellipsis"/>
                    </Button>
                </Popover>
            ]}>
            <Meta
                title={props.item.appName}
                description={props.item.googleAccount}
            />
            <Modal
                visible={showCheckBox}
                title="Delete App"
                okText="Submit"
                onOk={() => onDelete(props.item.id)}
                onCancel={() => {
                    setShowCheckBox(false)
                    setShowPopover(false)
                }}
                destroyOnClose>
                <p>Are you sure to delete {props.item.appName} ?</p>
            </Modal>
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






