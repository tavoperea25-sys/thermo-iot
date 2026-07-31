import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

vi.mock("../services/auth", () => ({
    haySesion: vi.fn()
}));

import ProtectedRoute from "./ProtectedRoute";
import { haySesion } from "../services/auth";

const renderConRuta = () => render(

    <MemoryRouter initialEntries={["/privado"]}>
        <Routes>
            <Route element={<ProtectedRoute />}>
                <Route path="/privado" element={<div>Contenido privado</div>} />
            </Route>
            <Route path="/login" element={<div>Pantalla de login</div>} />
        </Routes>
    </MemoryRouter>

);

describe("ProtectedRoute", () => {

    test("muestra el contenido protegido si hay sesión", () => {

        haySesion.mockReturnValue(true);

        renderConRuta();

        expect(screen.getByText("Contenido privado")).toBeInTheDocument();

    });

    test("redirige a /login si no hay sesión", () => {

        haySesion.mockReturnValue(false);

        renderConRuta();

        expect(screen.getByText("Pantalla de login")).toBeInTheDocument();
        expect(screen.queryByText("Contenido privado")).not.toBeInTheDocument();

    });

});
