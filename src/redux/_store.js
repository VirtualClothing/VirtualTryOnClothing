// configureStore.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistStore, persistReducer } from "redux-persist";
import { createStore, combineReducers } from "redux";

// REDUCERS
import user from "./reducers/user/reducer";
import products from "./reducers/products/reducer";
import cart from "./reducers/cart/reducer";
import drawer from "./reducers/drawer/reducer";

// COMBINING ALL REDUCERS
const combinedReducer = combineReducers({
  user,
  products,
  cart,
  drawer,
});

const persistConfig = {
  key: "root",
  whitelist: ["user", "cart"], // only these will be persisted, add other reducers if needed
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, combinedReducer);

export const store = createStore(persistedReducer);
export const persistor = persistStore(store);
