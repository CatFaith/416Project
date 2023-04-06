import {Form, Input, message} from "antd";
import React from "react";
import {useStore} from '@/stores'

const ViewFrom = React.forwardRef((props, ref) => {
    const {viewStore} = useStore()
    //根据传过来的数据定义默认参数
    const item = props.item.id ? {
        remember: true,
        id: props.item.id,
        appId: props.item.appId,
        viewName: props.item.viewName,
        savedDataUrl: props.item.savedDataUrl,
        columns: props.item.columns,
        viewType: props.item.viewType,
        allowedActions: props.item.allowedActions,
        roles: props.item.roles,
    } : {
        remember: true,
        appId: props.appId,
    }

    async function onFinish(values) {
        //根据是否传入viewId来判断调用edit方法还是create方法
        props.item.id ? await viewStore.editView(values).then() : await viewStore.createView(values).then()
        if (viewStore.view.code == 200) {
            message.success("Operation Success")
            window.location.reload()
        }
    }
//定义表单模板
    return (
        <Form
            ref={ref}
            onFinish={onFinish}
            initialValues={item}
            layout="vertical">
            <Form.Item
                //隐藏这个输入框
                hidden
                label="id"
                name="id"
            >
                <Input/>
            </Form.Item>
            <Form.Item
                hidden
                label="appId"
                name="appId"
            >
                <Input/>
            </Form.Item>
            <Form.Item
                label="viewName"
                name="viewName"
                style={{maxWidth: "100%"}}
                //表单校验规则
                rules={[{required: true, message: 'Please input your viewName!'}]}
            >
                <Input/>
            </Form.Item>

            <Form.Item
                label="savedDataUrl"
                name="savedDataUrl"
                rules={[{required: true, message: 'Please input your savedDataUrl!'}]}
            >
                <Input/>
            </Form.Item>
            <Form.Item
                label="columns"
                name="columns"
                rules={[{required: true, message: 'Please input your columns!'}]}
            >
                <Input/>
            </Form.Item>
            <Form.Item
                label="viewType"
                name="viewType"
                rules={[{required: true, message: 'Please input your viewType!'}]}
            >
                <Input/>
            </Form.Item>
            <Form.Item
                label="allowedActions"
                name="allowedActions"
                rules={[{required: true, message: 'Please input your allowedActions!'}]}
            >
                <Input/>
            </Form.Item>
            <Form.Item
                label="roles"
                name="roles"
                rules={[{required: true, message: 'Please input your roles!'}]}
            >
                <Input/>
            </Form.Item>
        </Form>
    );
})
export default ViewFrom