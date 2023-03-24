import './index.css';
import { React } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { AuthContextProvider } from './auth';
import { GlobalStoreContextProvider } from './store'
import {
  AppBanner,
  DetailView,
  DevView,
  Drive,
  EditPanel,
  Home,
  TableView,
  ToolBar,
  WelcomeScreen
} from './components'
import './App.css';

const App = () => {
  return (
      <BrowserRouter>
          <AppBanner />
          <Switch>
            <Route path="/" exact component={WelcomeScreen} />
          </Switch>
      </BrowserRouter>
  )
}

export default App;
