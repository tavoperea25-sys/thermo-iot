import { Navigate, Outlet } from "react-router-dom";

import { haySesion } from "../services/auth";

const ProtectedRoute = () => {

    if (!haySesion()) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;

};

export default ProtectedRoute;
