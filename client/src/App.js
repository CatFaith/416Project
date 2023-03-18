// APP Class
import './index.css';
import { React } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import {
    Home,
    detailView, 
    Drive,
    EditPanel,
    Toolbar
} from './components'


const App = () => {
    return (
        <BrowserRouter>
            <AuthContextProvider>
                <GlobalStoreContextProvider>              
                    <AppBanner />
                    <Switch>
                        <Route path="/" exact component={Home} />
                        <Route path="/dev/" exact component={DeveloperView} />
                        <Route path="/role/" exact component={RoleMembershipSheet} />
                        <Route path="/user/" exact component={UserView}/>
                    </Switch>
                    <Statusbar />
                </GlobalStoreContextProvider>
            </AuthContextProvider>
        </BrowserRouter>
    )
}

export default App