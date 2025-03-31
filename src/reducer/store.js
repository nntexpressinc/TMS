import { configureStore } from "@reduxjs/toolkit";
import event from "./event";

export const store = configureStore({
  reducer: { event },
});
