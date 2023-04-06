/**
 * 入口页面文件，路由
 */

import {unstable_HistoryRouter as HistoryRouter, Routes, Route} from 'react-router-dom'
import {lazy,Suspense} from "react";
import { AuthComponent } from '@/components/AuthComponent'
import { history } from '@/utils'
import './app.scss'
//引入页面资源文件
const Layout = lazy(() => import('@/pages/Layout'))
const Login = lazy(() => import('@/pages/Login'))
const Apps = lazy(() => import('@/pages/Apps'))
const Views = lazy(() => import('@/pages/Views'))
const AppDetail = lazy(() => import('@/pages/AppDetail'))
//初始化
function App() {
    return (
        <HistoryRouter history={history}>
            <div className="app">
                <Suspense fallback={<div style={{textAlign: 'center', marginTop: 200}}>loading...</div>}>
                    <Routes>
                        //设置主页
                        <Route path='/' element={
                            <AuthComponent>
                                <Layout />
                            </AuthComponent>
                        }>
                            <Route index element={<Apps/>}></Route>
                            <Route path='/appDetail' element={<AppDetail/>}></Route>
                            <Route path='/views' element={<Views/>}></Route>
                        </Route>
                        <Route path='/login' element={<Login/>}></Route>
                    </Routes>
                </Suspense>
            </div>
        </HistoryRouter>

    );
}

export default App;
