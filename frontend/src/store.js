import { combineReducers, configureStore } from "@reduxjs/toolkit";
import productsReducer from "./slices/productsSlice";
import productReducer from './slices/productSlice';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import userReducer from './slices/userSlice';
import databaseReducer from './slices/databaseSlice';

const reducer = combineReducers({
    productsState: productsReducer,
    productState: productReducer,
    authState: authReducer,
    cartState: cartReducer,
    orderState: orderReducer,
    userState: userReducer,
    databaseState: databaseReducer
});

const store = configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST']
            }
        })
});

export default store;