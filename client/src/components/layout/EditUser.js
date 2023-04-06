import { Modal} from "antd";
import React from "react";
import EditUserFrm from "@/components/layout/EditUserFrm";

const AppDialog = (props) => {
    //实现子组件信息传到父组件
    const ref = React.createRef();
    const onSave = () => {
        //调用子组件的提交方法
        ref.current.submit()
        //调用父组件的关闭弹窗方法
        props.close()
    }
//定义弹出框模板
    return (
        <Modal
            visible={props.visible}
            title="Edit User"
            okText="save"
            onOk={() => onSave()}
            onCancel={() => props.close()}
            destroyOnClose>
            <EditUserFrm ref={ref}></EditUserFrm>
        </Modal>
    );
}
export default AppDialog