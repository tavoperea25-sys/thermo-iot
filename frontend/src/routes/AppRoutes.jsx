import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import CargandoPagina from "../components/CargandoPagina";

import Login from "../pages/Login";
import Register from "../pages/Register";

// Carga diferida: el código de cada página (y sus dependencias,
// como Chart.js para el Dashboard) solo se descarga la primera
// vez que alguien realmente entra a esa sección — no todo junto
// al cargar el sitio.

const Dashboard = lazy(() => import("../pages/Dashboard"));
const Incubadoras = lazy(() => import("../pages/Incubadoras"));
const Alarmas = lazy(() => import("../pages/Alarmas"));
const Eventos = lazy(() => import("../pages/Eventos"));
const Configuracion = lazy(() => import("../pages/Configuracion"));
const Sistema = lazy(() => import("../pages/Sistema"));
const Perfil = lazy(() => import("../pages/Perfil"));
const NotFound = lazy(() => import("../pages/NotFound"));

const AppRoutes = () => {

    return (

        <Suspense fallback={<CargandoPagina />}>

            <Routes>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route element={<ProtectedRoute />}>

                    <Route element={<MainLayout />}>

                        <Route path="/" element={<Dashboard />} />
                        <Route path="/incubadoras" element={<Incubadoras />} />
                        <Route path="/alarmas" element={<Alarmas />} />
                        <Route path="/eventos" element={<Eventos />} />
                        <Route path="/configuracion" element={<Configuracion />} />
                        <Route path="/sistema" element={<Sistema />} />
                        <Route path="/perfil" element={<Perfil />} />

                    </Route>

                </Route>

                <Route path="*" element={<NotFound />} />

            </Routes>

        </Suspense>

    );

};

export default AppRoutes;
