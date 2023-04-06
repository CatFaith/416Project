import {Form, Input, message} from "antd";
import React from "react";
import {useStore} from '@/stores'


const AppFrom = React.forwardRef((props, ref) => {
    const {appStore} = useStore()
    //定义表单默认值
    const item= props.item?{
        remember: true,
        appName: props.item.appName,
        roleMemberSheet: props.item.roleMemberSheet,
        savedDataUrl: props.item.savedDataUrl,
        published:props.item.published,
        developer: props.item.developer
    }:[]
    //定义提交方法
    async function onFinish(values) {
        if (props.item){
            //补齐req参数调用后端方法
            values.id=props.item.id
            await appStore.editApp(values)
        }else {
            await appStore.createApp(values)
        }

        if (appStore.app.code == 200) {
            //状态码为200的时候调用以下方法
            message.success('create success')
            appStore.getApps().then()
        }
    }
//定义模板
    return (
        <Form
            ref={ref}
            onFinish={onFinish}
            initialValues={item}
            layout="vertical">
            <Form.Item
                label="appName"
                name="appName"
                style={{maxWidth: "100%"}}
                rules={[{required: true, message: 'Please input your appName!'}]}
            >
                <Input/>
            </Form.Item>
            <Form.Item
                label="roleMemberSheet"
                name="roleMemberSheet"
                style={{maxWidth: "100%"}}
                rules={[{required: true, message: 'Please input your roleMemberSheet!'}]}
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
                label="published"
                name="published"
                rules={[{required: true, message: 'Please input your published!'}]}
            >
                <Input/>
            </Form.Item>
            <Form.Item
                label="developer"
                name="developer"
                rules={[{required: true, message: 'Please input your developer!'}]}
            >
                <Input/>
            </Form.Item>
        </Form>
    );
})
export default AppFrom