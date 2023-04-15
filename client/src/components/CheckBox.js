import { Modal} from "antd";
import React from "react";

const CheckBox = (props) => {
    return (
        <Modal
            visible={props.visible}
            title={props.title}
            okText="Submit"
            onOk={props.submit}
            onCancel={props.close}
            destroyOnClose>
        </Modal>
    );
}
export default CheckBox