const tKey = 'token-key'


//存取token
const setToken = (token) => {
  return window.localStorage.setItem(tKey, token)
}

const getToken = () => {
  return window.localStorage.getItem(tKey)
}

const removeToken = () => {
  return window.localStorage.removeItem(tKey)
}

//存取gmail
const gKey = 'gmail-key'
const setGmail = (gmail) => {
  return window.localStorage.setItem(gKey, gmail)
}

const getGmail = () => {
  return window.localStorage.getItem(gKey)
}

const removeGmail = () => {
  return window.localStorage.removeItem(gKey)
}


//存取userName
const uKey = 'uname-key'
const setUName = (uname) => {
  return window.localStorage.setItem(uKey, uname)
}

const getUName = () => {
  return window.localStorage.getItem(uKey)
}

const removeUName = () => {
  return window.localStorage.removeItem(uKey)
}

//存取id
const idKey = 'id-key'
const setId = (id) => {
  return window.localStorage.setItem(idKey, id)
}

const getId = () => {
  return window.localStorage.getItem(idKey)
}

const removeId = () => {
  return window.localStorage.removeItem(idKey)
}

export {
  setToken,
  getToken,
  removeToken,
  setGmail,
  getGmail,
  removeGmail,
  setUName,
  getUName,
  removeUName,
  setId,
  getId,
  removeId
}