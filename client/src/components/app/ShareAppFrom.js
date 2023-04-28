import {Form, Select} from "antd";
import React from "react";
import {useStore} from "@/stores";
const {Option} = Select;

const ShareAppFrom = React.forwardRef((props, ref) => {
    const {userStore,appStore} = useStore()
//定义提交方法
    async function onFinish(values) {
        appStore.shareApp(props.item.id ,values).then()
    }

//定义模板
    return (
        <Form
            ref={ref}
            onFinish={onFinish}
            layout="vertical">
            <Form.Item
                name="googleAccount"
                label="googleAccount"
                rules={[{required: true, message: 'Please select googleAccount!', type: 'array'}]}
            >
                <Select mode="multiple" placeholder="Please select googleAccount">
                    {/*获取勾选的被分享谷歌账户信息*/}
                    {userStore.userList.map((item,index)=>{
                        return   <Option key={index} value={item.googleAccount}>{item.googleAccount}</Option>
                    })}
                </Select>
            </Form.Item>
        </Form>

    );
})
export default ShareAppFrom




