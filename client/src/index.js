//架构核心包
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 导入antd样式文件
import 'antd/dist/reset.css';
// 引入index.scss文件
import './index.scss'


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
