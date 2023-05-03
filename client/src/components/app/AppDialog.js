import { Modal} from "antd";
import AppFrom from "@/components/app/AppFrom";
import React from "react";
import ShareAppFrom from "@/components/app/ShareAppFrom";

const AppDialog = (props) => {
    //实现子组件信息传到父组件
    const ref = React.createRef();
    const onSave = () => {
        //调用子组件的提交方法
        ref.current.submit()
        //调用父组件的关闭弹窗方法
        // props.close()
    }
    //根据父组件传过来的数据设定title值
    const title= props.operationType=="create"?"Add App":props.operationType=="edit"?"Edit App":"Share App"

    return (
        <Modal
            // 是否展示
            visible={props.visible}
            title={title}
            okText="save"
            //确定
            onOk={() => onSave()}
            //取消
            onCancel={() => props.close()}
            destroyOnClose>
            {/*//根据父组件传过来的数据设定调用的子组件*/}
            {props.operationType=="share"?<ShareAppFrom ref={ref} item={props.item} close={props.close}></ShareAppFrom>:<AppFrom ref={ref} item={props.item} close={props.close}></AppFrom>}
        </Modal>
    );
}
export default AppDialog
