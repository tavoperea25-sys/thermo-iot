import { renderHook, waitFor } from "@testing-library/react";

vi.mock("../context/IncubadoraContext", () => ({
    useIncubadora: () => ({ esp32Id: "ESP32_TEST" })
}));

vi.mock("../services/api", () => ({
    default: { get: vi.fn() }
}));

import api from "../services/api";
import useDashboard from "./useDashboard";

const mockearRespuestas = ({ mediciones, online, limites }) => {

    api.get.mockImplementation((url) => {

        if (url.includes("/iot/mediciones/")) {
            return Promise.resolve({ data: mediciones });
        }

        if (url.includes("/iot/online-status/")) {
            return Promise.resolve({ data: { online } });
        }

        if (url.includes("/iot/configuracion/")) {
            return Promise.resolve({ data: limites });
        }

        return Promise.reject(new Error(`ruta no mockeada: ${url}`));

    });

};

describe("useDashboard", () => {

    beforeEach(() => {
        api.get.mockReset();
    });

    test("carga la última medición, el estado online y los límites al montar", async () => {

        mockearRespuestas({
            mediciones: [
                { temperatura: 36, humedad: 50 },
                { temperatura: 37.5, humedad: 60 }
            ],
            online: true,
            limites: {
                temperatura_min: 36,
                temperatura_max: 38,
                humedad_min: 50,
                humedad_max: 70
            }
        });

        const { result } = renderHook(() => useDashboard());

        await waitFor(() => {
            expect(result.current.temperatura).toBe(37.5);
        });

        expect(result.current.humedad).toBe(60);
        expect(result.current.online).toBe(true);
        expect(result.current.historial).toHaveLength(2);
        expect(result.current.alarmas).toBe(0);

    });

    test("marca una alarma cuando la última lectura sale del rango configurado", async () => {

        mockearRespuestas({
            mediciones: [{ temperatura: 42, humedad: 60 }],
            online: true,
            limites: {
                temperatura_min: 36,
                temperatura_max: 38,
                humedad_min: 50,
                humedad_max: 70
            }
        });

        const { result } = renderHook(() => useDashboard());

        await waitFor(() => {
            expect(result.current.alarmas).toBe(1);
        });

    });

    test("limpia los intervalos de refresco al desmontar", async () => {

        mockearRespuestas({
            mediciones: [],
            online: false,
            limites: {
                temperatura_min: 36,
                temperatura_max: 38,
                humedad_min: 50,
                humedad_max: 70
            }
        });

        const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");

        const { unmount } = renderHook(() => useDashboard());

        await waitFor(() => {
            expect(api.get).toHaveBeenCalled();
        });

        unmount();

        expect(clearIntervalSpy).toHaveBeenCalled();

        clearIntervalSpy.mockRestore();

    });

});
