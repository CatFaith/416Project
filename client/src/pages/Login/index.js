import {Card, Form, Input, Button, message } from 'antd'
import logo from '@/assets/logo.png'
import {useNavigate} from 'react-router-dom'
import './index.scss'
import { useStore } from '@/stores'


function Login() {
    const { userStore } = useStore()
    const navigate = useNavigate()
    //实现save方法
    async function onFinish(values) {
        await userStore.login(values)
        // 跳转首页
        navigate('/', {replace: true})
        message.success('login suucess')
    }
    return (
        <div className="login">
            <Card className="login-container">
                <img className="login-logo" src={logo} alt=""/>
                <Form
                    //定义表单默认数据
                    initialValues={{
                        remember: true,
                        googleAccount: 'Eric@gmail.com',
                        userName:'Eric',
                        googleToken:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlck5hbWUiOiJFcmljIiwiZ29vZ2xlQWNjb3VudCI6IkVyaWNAZ21haWwuY29tIiwiaWF0IjoxNjgwMDY1MTY2LCJleHAiOjE2ODAzMjQzNjZ9.aKHeH1IoQYpAFOQuagkRLIhqAhEStPX0DTTJz7Tb7iQ',
                    }}
                    //定义确定键方法
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        label="userName"
                        name="userName"
                    >
                        <Input size="large" placeholder="name"/>
                    </Form.Item>
                    <Form.Item
                        label="googleAccount"
                        name="googleAccount">
                        <Input size="large" placeholder="googleAccount"/>
                    </Form.Item>
                    <Form.Item
                        hidden
                        label="googleToken"
                        name="googleToken">
                        <Input size="large" placeholder="googleToken"/>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block>
                            login
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default Login;
