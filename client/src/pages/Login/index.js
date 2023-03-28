import {Card, Form, Input, Checkbox, Button} from 'antd'
import logo from '@/assets/logo.png'
import {useNavigate} from 'react-router-dom'
import './index.scss'

function Login() {
    const navigate = useNavigate()

    async function onFinish(values) {
        // 跳转首页
        navigate('/apps', {replace: true})
    }

    return (
        <div className="login">
            <Card className="login-container">
                <img className="login-logo" src={logo} alt=""/>
                <Form
                    validateTrigger={['onBlur', 'onChange']}
                    initialValues={{
                        remember: true,
                        mobile: 'admin@163.com',
                        code: 'admin'
                    }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="mobile"
                        rules={[
                            {
                                required: true,
                                message: 'Enter Email',
                            },
                            {
                                pattern: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
                                message: 'Incorrect Information',
                                validateTrigger: 'onBlur'
                            }
                        ]}
                    >
                        <Input size="large" placeholder="Email"/>
                    </Form.Item>
                    <Form.Item
                        name="code"
                        rules={[
                            {
                                required: true,
                                message: 'Enter Password',
                            }
                        ]}
                    >
                        <Input size="large" placeholder="Enter Password"/>
                    </Form.Item>
                    <Form.Item
                        name="remember"
                        valuePropName="checked"
                    >
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
