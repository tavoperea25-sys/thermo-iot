import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FlaskConical } from "lucide-react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { IncubadoraProvider } from "../context/IncubadoraContext";
import { DemoProvider, useDemo } from "../context/DemoContext";
import { TourProvider } from "../context/TourContext";

import "../styles/layout.css";

const BannerDemo = () => {

    const { demoActivo } = useDemo();

    if (!demoActivo) return null;

    return (

        <div className="demo-banner">
            <FlaskConical size={15} />
            Estás viendo datos simulados — modo demo activo, no es información real de tu ESP32.
        </div>

    );

};

const MainLayout = () => {

    const [sidebarAbierto, setSidebarAbierto] = useState(false);

    const location = useLocation();

    return (

        <DemoProvider>

            <TourProvider>

                <IncubadoraProvider>

                    <div className="layout">

                        <Sidebar
                            abierto={sidebarAbierto}
                            onCerrar={() => setSidebarAbierto(false)}
                        />

                        <div className="layout-content">

                            <Navbar
                                onAbrirMenu={() => setSidebarAbierto(true)}
                            />

                            <BannerDemo />

                            <main className="page-content">

                                <div className="page-transition" key={location.pathname}>

                                    <Outlet />

                                </div>

                            </main>

                        </div>

                    </div>

                </IncubadoraProvider>

            </TourProvider>

        </DemoProvider>

    );

};

export default MainLayout;
