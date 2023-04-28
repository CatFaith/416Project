import { Modal} from "antd";
import ViewFrom from "@/components/view/ViewFrom";
import React from "react";
import {observer} from "mobx-react-lite";

const ViewDialog = (props) => {
    //实现子组件信息传递给父组件
    const ref = React.createRef();
    const onSave = () => {
        ref.current.submit()
        props.close()
    }
//定义弹出框模板
    return (
        <Modal
            visible={props.visible}
            //根据父组件传入数据改变title名称
            title={props.operationType=="create"?"Add "+props.viewType:"Edit "+props.viewType}
            okText="save"
            onOk={() => onSave()}
            onCancel={props.close}
            destroyOnClose>
            {/*//调用子组件*/}
            <ViewFrom ref={ref}
                      viewId={props.viewId}
                      viewType={props.viewType}
                      operationType={props.operationType}
                      appId={props.appId}
                      item={props.item}
                      close={props.close}
            ></ViewFrom>
        </Modal>
    );
}
export default observer(ViewDialog)