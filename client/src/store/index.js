import { type } from '@testing-library/user-event/dist/type';
import {useState} from 'react';
import apis from "../api"

function useGlobalStore ()
{
    const [store, setStore] = useState({

    });

    const storeReducer = (action) => {
        const {type, payload} = action
        switch(type){
            default: 
                return store;
        }
    }

    return {store, storeReducer};
}

export default useGlobalStore