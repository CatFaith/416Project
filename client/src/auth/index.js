import React, { createContext, useEffect, useState } from "react"
import { useHistory } from 'react-router-dom'
import api from '../api'

const AuthContext = createContext();

// THESE ARE ALL THE TYPES OF UPDATES TO OUR AUTH STATE THAT CAN BE PROCESSED
export const AuthActionType = {
    LOGIN_USER:"lOGIN_USER",
    GET_LOGGED_IN: "GET_LOGGED_IN",
    REGISTER_USER: "REGISTER_USER",
    LOGOUT_USER: "LOGOUT_USER",
    ACCOUNT_ERROR: "ACCOUNT_ERROR"
}

function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        user: null,
        loggedIn: false,
        error: false
    });
    const history = useHistory();

    useEffect(() => {
        auth.getLoggedIn();
    }, []);

    const authReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case AuthActionType.LOGIN_USER:{
                return setAuth({
                    user:payload.user,
                    loggedIn: true,
                    error: false
                })
            }
            case AuthActionType.GET_LOGGED_IN: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    error: false
                });
            }
            case AuthActionType.REGISTER_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: true,
                    error: false
                })
            }
            case AuthActionType.LOGOUT_USER: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                    error: false
                })
            }
            case AuthActionType.ACCOUNT_ERROR: {
                return setAuth({
                    user:null,
                    loggedIn: false,
                    error: true
                })
            }
            default:
                return auth;
        }
    }

    // auth.loginUser = async function (userdata, store) {
    //     try{
    //         const response = await api.loginUser(userdata);
    //         if(response.status === 200){
    //             authReducer({
    //                 type: AuthActionType.LOGIN_USER,    
    //                 payload: {
    //                     loggedIn: response.data.loggedIn,
    //                     user: response.data.user 
    //                 }
    //             })
    //             history.push("/");
    //             console.log("login call")
    //             store.loadIdNamePairs();
    //             console.log("after call")
    //         }
    //     }catch(e){
    //         authReducer({
    //             type: AuthActionType.ACCOUNT_ERROR,
    //             payload: null
    //         })
    //     }
    // }

    // auth.getLoggedIn = async function () {
    //     const response = await api.getLoggedIn();
    //     if (response.status === 200) {
    //         authReducer({
    //             type: AuthActionType.SET_LOGGED_IN,
    //             payload: {
    //                 loggedIn: response.data.loggedIn,
    //                 user: response.data.user
    //             }
    //         });
    //     }
    // }

    // auth.registerUser = async function(userData, store) {
    //     try{
    //         const response = await api.registerUser(userData);   
    //         console.log("register", response.data);   
    //         if (response.status === 200) {
    //             authReducer({
    //                 type: AuthActionType.REGISTER_USER,
    //                 payload: {
    //                     user: response.data.user
    //                 }
    //             })
    //             history.push("/");
    //             store.loadIdNamePairs();
    //         }
    //     }catch(e){
    //         authReducer({
    //             type: AuthActionType.ACCOUNT_ERROR,
    //             payload: null
    //         })
    //     }
    // }

    // auth.logoutUser = async function(){
    //     const response = await api.logoutUser();
    //     if(response.status === 200){
    //         authReducer({
    //             type: AuthActionType.LOGOUT_USER,
    //             payload: null
    //         })
    //         history.push("/")
    //     }
    // }

    return (
        <AuthContext.Provider value={{
            auth
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider };