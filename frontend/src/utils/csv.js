export function exportarCSV(filas, columnas, nombreArchivo) {

    if (!filas || filas.length === 0) {
        return false;
    }

    const encabezado = columnas.map((c) => c.label).join(",");

    const cuerpo = filas.map((fila) =>

        columnas.map((c) => {

            const valor = fila[c.key] ?? "";
            const texto = String(valor).replace(/"/g, '""');

            return `"${texto}"`;

        }).join(",")

    ).join("\n");

    // BOM al inicio para que Excel reconozca bien los acentos (UTF-8).
    const csv = "\uFEFF" + encabezado + "\n" + cuerpo;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    return true;

}
