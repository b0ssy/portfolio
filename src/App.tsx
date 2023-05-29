import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import Home from "./pages/Home";
import PageNotFound from "./pages/errors/PageNotFound";
import { store, persistor } from "./redux/store";
import "./App.css";

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <BrowserRouter>
          <Routes>
            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* 404 */}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}
