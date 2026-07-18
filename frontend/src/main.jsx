import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { ToastProvider } from "./context/ToastContext";
import ErrorBoundary from "./components/ErrorBoundary";

import "./styles/globals.css";
import "./styles/toast.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ErrorBoundary>
            <BrowserRouter>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </BrowserRouter>
        </ErrorBoundary>
    </React.StrictMode>
);
