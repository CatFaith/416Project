import { Modal} from "antd";
import ViewFrom from "@/components/view/ViewFrom";
import React from "react";

const ViewDialog = (props) => {
    //实现子组件信息传递给父组件
    const ref = React.createRef();
    const onSave = () => {
        ref.current.submit()
    }
//定义弹出框模板
    return (
        <Modal
            visible={props.visible}
            //根据父组件传入数据改变title名称
            title={props.operationType=="create"?"Add View":"Edit View"}
            okText="save"
            onOk={() => onSave()}
            onCancel={props.close}
            destroyOnClose>
            {/*//调用子组件*/}
            <ViewFrom ref={ref}
                      appId={props.appId}
                      item={props.item}
                      close={props.close}
            ></ViewFrom>
        </Modal>
    );
}
export default ViewDialog