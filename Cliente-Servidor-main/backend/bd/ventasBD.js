const ventasBD = require("./conexion").ventas; // Se asume que ya configuraste ventas en conexion.js
const admin = require('firebase-admin'); // Importar admin para usar Timestamp de Firestore

// Validar el estatus permitido
const estatusPermitidos = ["pendiente", "vendido", "cancelado"];

// Función para convertir marca de tiempo de Firestore a fecha y hora legible
function timestampToReadableDate(timestamp) {
    const date = new Date(timestamp._seconds * 1000); // Convertir segundos a milisegundos
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Mostrar todas las ventas
async function mostrarVentas() {
    const ventasSnapshot = await ventasBD.get();  // Obtener todas las ventas desde Firestore
    const ventas = [];
    ventasSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.fecha_hora && data.fecha_hora._seconds) {
            data.fecha_hora = timestampToReadableDate(data.fecha_hora); // Convertir la fecha a formato legible
        }
        ventas.push({ id: doc.id, ...data });
    });
    return ventas;
}

// Buscar venta por ID
async function buscarPorId(id) {
    const ventaDoc = await ventasBD.doc(id).get();
    if (!ventaDoc.exists) {
        return null;  // Si no existe la venta, retorna null
    }
    
    const data = ventaDoc.data();
    if (data.fecha_hora && data.fecha_hora._seconds) {
        data.fecha_hora = timestampToReadableDate(data.fecha_hora); // Convertir la fecha a formato legible
    }
    
    return { id: ventaDoc.id, ...data };
}

// Crear nueva venta
async function nuevaVenta(data) {
    // Ignorar cualquier valor proporcionado en 'fecha_hora' y usar la fecha y hora actual en formato Timestamp
    const fechaHora = admin.firestore.Timestamp.now();  // Usa Timestamp de Firestore para la fecha y hora actual

    // Estructurar la venta con todos los datos proporcionados, asegurando campos obligatorios
    const venta = {
        cantidad: data.cantidad || 0, // Asegurar que cantidad esté presente
        id_producto: data.id_producto || null, // Asegurar que id_producto esté presente
        id_usuario: data.id_usuario || null, // Asegurar que id_usuario esté presente
        estatus: data.estatus || "pendiente",  // Estado inicial de la venta es "pendiente"
        fecha_hora: fechaHora  // Usa Timestamp en lugar de string
    };

    // Verificar que los campos obligatorios no sean nulos o vacíos
    if (!venta.id_producto || !venta.id_usuario) {
        throw new Error("Los campos 'id_producto' y 'id_usuario' son obligatorios.");
    }

    const nuevaVentaRef = await ventasBD.add(venta);  // Agregar nueva venta con ID automático
    return nuevaVentaRef.id;  // Retornar el ID de la venta creada
}

// Función para modificar todos los campos de una venta
async function modificarVenta(id, data) {
    const venta = await buscarPorId(id);
    if (!venta) {
        return { error: "La venta no existe" };  // Retorna error si no existe
    }

    // Actualizar la venta con los datos proporcionados
    await ventasBD.doc(id).update({
        cantidad: data.cantidad || venta.cantidad,
        id_producto: data.id_producto || venta.id_producto,
        id_usuario: data.id_usuario || venta.id_usuario,
        estatus: data.estatus || venta.estatus,
        fecha_hora: data.fecha_hora ? admin.firestore.Timestamp.fromDate(new Date(data.fecha_hora)) : venta.fecha_hora
    });

    return { success: true, message: "Venta modificada con éxito." };
}

// Actualizar el estatus de la venta
async function actualizarEstatus(id, nuevoEstatus) {
    if (!estatusPermitidos.includes(nuevoEstatus)) {
        return { error: "Estatus no permitido. Debe ser 'pendiente', 'vendido' o 'cancelado'." };
    }

    const venta = await buscarPorId(id);
    if (!venta) {
        return { error: "La venta no existe" };  // Retorna error si no existe
    }

    await ventasBD.doc(id).update({ estatus: nuevoEstatus });
    return { success: true, message: `Venta actualizada a '${nuevoEstatus}' con éxito.` };
}

// Cancelar venta (actualizar estatus a "cancelado")
async function cancelarVenta(id) {
    return await actualizarEstatus(id, "cancelado");
}

// Marcar venta como vendida (actualizar estatus a "vendido")
async function marcarComoVendida(id) {
    return await actualizarEstatus(id, "vendido");
}

// Borrar venta por ID
async function borrarVenta(id) {
    const venta = await buscarPorId(id);
    if (!venta) {
        return { error: "La venta no existe" };  // Retorna error si no existe
    }

    await ventasBD.doc(id).delete();  // Eliminar la venta
    return { success: true, message: "Venta borrada con éxito." };
}

module.exports = {
    mostrarVentas,
    nuevaVenta,
    buscarPorId,
    cancelarVenta,
    marcarComoVendida,
    modificarVenta,
    borrarVenta  // Nueva función para borrar venta
};
