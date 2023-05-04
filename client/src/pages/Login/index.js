import {Card, Form, Input, Button, message } from 'antd'
import logo from '@/assets/logo.png'
import {useNavigate} from 'react-router-dom'
import './index.scss'
import { useStore } from '@/stores'

import React, {useEffect,useState} from "react";
import {GoogleLogin} from 'react-google-login';
import { gapi } from 'gapi-script';

function Login() {
    const { userStore } = useStore()
    const navigate = useNavigate()
    const clientId = '1043175129211-cuk2sn4jkrcspjhh278ia6jmrkp0m581.apps.googleusercontent.com';
    useEffect(() => {
        const initClient = () => {
            gapi.client.init({
                clientId: clientId,
                scope: ''
            });
        };
        gapi.load('client:auth2', initClient);
    });

    const onSuccess = async (res) => {
        await userStore.login({
            "userName": res.profileObj.name,
            "googleAccount": res.profileObj.email,
            "googleToken": res.tokenObj.access_token
        })
        navigate('/', {replace: true})
        message.success('login success')
    };
    const onFailure = (err) => {
        message.warning('login failed')
        window.location.reload()
    };

    return (
        <div className="login">
            <Card className="login-container">
                <img className="login-logo" src={logo} alt=""/>
                <div  className="google_logo" >
                    <GoogleLogin
                        clientId={clientId}
                        buttonText="Sign in with Google"
                        onSuccess={onSuccess}
                        onFailure={onFailure}
                        // cookiePolicy={'single_host_origin'}
                        isSignedIn={false}
                    />
                </div>

            </Card>
        </div>
    );
}


export default Login;
