"use client"

import axios from "axios";

async function guardarVenta(e) {
    e.preventDefault();
    console.log("Estas en guardarVenta");
    const url = "http://localhost:3000/vent/nuevaVenta";
    const datos = {
        cantidad: document.getElementById("cantidad").value,
        id_producto: document.getElementById("id_producto").value,
        id_usuario: document.getElementById("id_usuario").value,
        estatus: document.getElementById("estatus").value,
        fecha_hora: new Date().toISOString() // Fecha y hora actual en formato ISO
    };

    try {
        const respuesta = await axios.post(url, datos);
        window.location.href = "http://localhost:3001/ventas/mostrar";
    } catch (error) {
        console.error('Error al guardar la venta:', error.response ? error.response.data : error.message);
    }
}

export default function NuevaVenta() {
    return (
        <div className="m-0 row justify-content-center">
            <form onSubmit={guardarVenta} className="col-6 mt-5" action="" method="post">
                <div className="card">
                    <div className="card-header">
                        <center><h1>Nueva Venta</h1></center>
                    </div>
                    <div className="card-body">
                        <div className="mb-3">
                            <label htmlFor="cantidad" className="form-label">Cantidad</label>
                            <input className="form-control" id="cantidad" required type="number" min="1" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="id_producto" className="form-label">ID del Producto</label>
                            <input className="form-control" id="id_producto" required type="text" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="id_usuario" className="form-label">ID del Usuario</label>
                            <input className="form-control" id="id_usuario" required type="text" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="estatus" className="form-label">Estatus</label>
                            <select className="form-control" id="estatus" required>
                                <option value="pendiente">Pendiente</option>
                                <option value="cancelado">Cancelado</option>
                                <option value="vendido">Vendido</option>
                            </select>
                        </div>
                    </div>
                    <div className="card-footer">
                        <center>
                            <button typeof="submit" className="btn btn-primary col-12" type="submit">Guardar Nueva Venta</button>
                        </center>
                    </div>
                </div>
            </form>
        </div>
    );
}
