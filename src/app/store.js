import { configureStore } from "@reduxjs/toolkit";
import propertyReducer from "./features/propertySlice";


const store = configureStore({
  reducer: {
    property: propertyReducer,
  },
});

export default store;