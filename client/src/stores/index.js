// 把所有的模块做统一处理
// 导出一个统一的方法 useStore
import React from "react"
import User from "./user"
import App from "./app"
import View from "./view"
import { configure } from "mobx"
configure({
  enforceActions: "never",
})


class RootStore {
  constructor() {
    this.userStore = new User()
    this.appStore = new App()
    this.viewStore = new View()
  }
}

// 实例化根
// 导出useStore context
const rootStore = new RootStore()
const context = React.createContext(rootStore)

const useStore = () => React.useContext(context)

export { useStore }