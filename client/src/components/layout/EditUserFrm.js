import {Form, Input, message} from "antd";
import React from "react";
import {useStore} from '@/stores'

const EditUser = React.forwardRef((props, ref) => {
    const {userStore} = useStore()
//实现提交方法
    async function onFinish(values) {
        await userStore.editUserName(values)
        if (userStore.userRes.code == 200) {
            //请求成功后弹出提示框
            message.success('edit success')
        }
    }
    //定义表单模板
    return (
        <Form
            ref={ref}
            onFinish={onFinish}
            initialValues={{
                remember: true,
                userName: userStore.uname
            }}
            //定义表单布局
            layout="vertical">
            <Form.Item
                label="userName"
                name="userName"
                //表单样式
                style={{maxWidth: "100%"}}
                //表单校验规则
                rules={[{required: true, message: 'Please input your userName!'}]}
            >
                <Input/>
            </Form.Item>
        </Form>
    );
})
export default EditUser
