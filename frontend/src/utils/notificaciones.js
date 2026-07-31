// Genera un beep corto con Web Audio API — sin archivos de audio externos.

export function reproducirBeep() {

    try {

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();

        const oscilador = ctx.createOscillator();
        const ganancia = ctx.createGain();

        oscilador.type = "sine";
        oscilador.frequency.setValueAtTime(880, ctx.currentTime);

        ganancia.gain.setValueAtTime(0.15, ctx.currentTime);
        ganancia.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        oscilador.connect(ganancia);
        ganancia.connect(ctx.destination);

        oscilador.start();
        oscilador.stop(ctx.currentTime + 0.35);

    } catch {

        // Si el navegador bloquea el audio (sin interacción previa
        // del usuario), simplemente no suena — no es crítico.

    }

}

export function notificarAlarma(mensaje) {

    reproducirBeep();

    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {

        new Notification("Thermo-IoT — Alarma", {
            body: mensaje,
            icon: "/favicon.svg"
        });

    }

}

export function pedirPermisoNotificaciones() {

    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
        Notification.requestPermission();
    }

}
