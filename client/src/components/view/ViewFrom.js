import {Form, Input, message} from "antd";
import React, {useEffect, useState} from "react";
import {useStore} from '@/stores'
import {useNavigate, useParams} from 'react-router-dom'
import {observer} from "mobx-react-lite";

const ViewFrom = React.forwardRef((props, ref) => {
    const {viewStore} = useStore()
    const navigate = useNavigate();
    const appId=useParams().appId
    let item={}
    //根据传过来的数据定义默认参数



    if(props.viewType=="role"){
        item = props.operationType=="create" ? {
            remember: true,
            id: props.viewId,
            appId: props.appId,
        } : {
            remember: true,
            id: props.item.id,
            appId: props.appId,
            roleName: props.item.roleName,
        }
    }
    console.log("item",props.item)

    if(props.viewType=="view"){
        item = props.operationType=="create" ? {
            remember: true,
            appId: props.appId,
        } : {
            remember: true,
            id: props.item.id,
            appId: props.item.appId,
            viewName: props.item.viewName,
            savedDataUrl: props.item.savedDataUrl
        }
    }

    async function onFinish(values) {
        //根据是否传入viewId来判断调用edit方法还是create方法
        props.operationType=="create" ? await viewStore.createView(values).then():await viewStore.editView(values).then()
        if (viewStore.view.code == 200) {
            message.success("Operation Success")
            props.viewType=="role"?props.operationType=="create"?viewStore.getRoles(viewStore.view.data.id).then():viewStore.getRoles( props.item.id).then():viewStore.getViews(appId).then()
            props.viewType=="role"?navigate("/"+appId+"/"+props.viewId+"/roles"):navigate("/"+appId+"/views");
            props.close()
            window.location.reload()
        }
        if (viewStore.view.code == 500) {
            message.warning(viewStore.view.data)
        }
        // props.viewType=="role"?navigate("/"+appId+"/"+props.viewId+"/roles"):navigate("/"+appId+"/views");

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

            {props.viewType=="role"?
                <Form.Item
                    label="roleName"
                    name="roleName"
                    style={{maxWidth: "100%"}}
                    //表单校验规则
                    rules={[{required: true, message: 'Please input your roleName!'}]}
                >
                    <Input/>
                </Form.Item>:
                <div>
                    <Form.Item
                        label="viewName"
                        name="viewName"
                        style={{maxWidth: "100%"}}
                        //表单校验规则
                        rules={[{required: true, message: 'Please input your viewName!'}]}
                    >
                        <Input/>
                    </Form.Item>
                    {props.operationType=="create"?
                        <Form.Item
                            label="savedDataUrl"
                            name="savedDataUrl"
                            style={{maxWidth: "100%"}}
                            //表单校验规则
                            // rules={[{required: true, message: 'Please input your savedDataUrl!'}]}
                        >
                            <Input/>
                        </Form.Item>:null }
                </div>
            }
        </Form>
    );
})

export default observer(ViewFrom)