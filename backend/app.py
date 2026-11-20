
from flask import Flask, jsonify, request
from flask_cors import CORS
from database import obtener_conexion

app = Flask(__name__)
CORS(app)


# =====================================
# RUTA PRINCIPAL
# =====================================

@app.route("/")
def inicio():
    return jsonify({
        "mensaje": "API del Sistema de Gestion de Bodega funcionando"
    })


# =====================================
# LISTAR PRODUCTOS
# =====================================

@app.route("/api/productos", methods=["GET"])
def listar_productos():
    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor(dictionary=True)

        cursor.execute("SELECT * FROM productos ORDER BY id DESC")
        productos = cursor.fetchall()

        return jsonify(productos)

    except Exception as error:
        return jsonify({"error": str(error)}), 500

    finally:
        if cursor:
            cursor.close()

        if conexion and conexion.is_connected():
            conexion.close()


# =====================================
# REGISTRAR PRODUCTOS
# =====================================

@app.route("/api/productos", methods=["POST"])
def agregar_producto():
    datos = request.get_json()

    if not datos:
        return jsonify({"error": "No se recibieron datos"}), 400

    nombre = datos.get("nombre")
    tipo = datos.get("tipo")
    anio = datos.get("anio")
    stock = datos.get("stock")

    if not nombre or not tipo or anio is None or stock is None:
        return jsonify({"error": "Faltan datos del producto"}), 400

    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        consulta = """
            INSERT INTO productos (nombre, tipo, anio, stock)
            VALUES (%s, %s, %s, %s)
        """

        valores = (nombre, tipo, anio, stock)

        cursor.execute(consulta, valores)
        conexion.commit()

        return jsonify({
            "mensaje": "Producto registrado correctamente"
        }), 201

    except Exception as error:
        if conexion:
            conexion.rollback()

        return jsonify({"error": str(error)}), 500

    finally:
        if cursor:
            cursor.close()

        if conexion and conexion.is_connected():
            conexion.close()

# =====================================
# ELIMINAR PRODUCTO
# =====================================

@app.route("/api/productos/<int:id>", methods=["DELETE"])
def eliminar_producto(id):
    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute(
            "DELETE FROM productos WHERE id = %s",
            (id,)
        )

        if cursor.rowcount == 0:
            return jsonify({"error": "Producto no encontrado"}), 404

        conexion.commit()

        return jsonify({
            "mensaje": "Producto eliminado correctamente"
        })

    except Exception as error:
        if conexion:
            conexion.rollback()

        return jsonify({"error": str(error)}), 500

    finally:
        if cursor:
            cursor.close()

        if conexion and conexion.is_connected():
            conexion.close()
# =====================================
# EDITAR PRODUCTO
# =====================================

@app.route("/api/productos/<int:id>", methods=["PUT"])
def editar_producto(id):
    datos = request.get_json()

    if not datos:
        return jsonify({"error": "No se recibieron datos"}), 400

    nombre = datos.get("nombre")
    tipo = datos.get("tipo")
    anio = datos.get("anio")
    stock = datos.get("stock")

    if not nombre or not tipo or anio is None or stock is None:
        return jsonify({"error": "Faltan datos del producto"}), 400

    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        consulta = """
            UPDATE productos
            SET nombre = %s, tipo = %s, anio = %s, stock = %s
            WHERE id = %s
        """

        valores = (nombre, tipo, anio, stock, id)

        cursor.execute(consulta, valores)

        if cursor.rowcount == 0:
            cursor.execute(
                "SELECT id FROM productos WHERE id = %s",
                (id,)
            )

            if not cursor.fetchone():
                return jsonify({"error": "Producto no encontrado"}), 404

        conexion.commit()

        return jsonify({
            "mensaje": "Producto actualizado correctamente"
        })

    except Exception as error:
        if conexion:
            conexion.rollback()

        return jsonify({"error": str(error)}), 500

    finally:
        if cursor:
            cursor.close()

        if conexion and conexion.is_connected():
            conexion.close()
    # =====================================
# LISTAR LOTES
# =====================================

@app.route("/api/lotes", methods=["GET"])
def listar_lotes():
    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor(dictionary=True)

        cursor.execute("SELECT * FROM lotes ORDER BY id DESC")
        lotes = cursor.fetchall()

        for lote in lotes:
            lote["fecha"] = lote["fecha"].strftime("%Y-%m-%d")

        return jsonify(lotes)

    except Exception as error:
        return jsonify({"error": str(error)}), 500

    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()


# =====================================
# REGISTRAR LOTE
# =====================================

@app.route("/api/lotes", methods=["POST"])
def agregar_lote():
    datos = request.get_json()

    if not datos:
        return jsonify({"error": "No se recibieron datos"}), 400

    numero = datos.get("numero")
    fecha = datos.get("fecha")
    estado = datos.get("estado")

    if not numero or not fecha or not estado:
        return jsonify({"error": "Faltan datos del lote"}), 400

    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        consulta = """
            INSERT INTO lotes (numero, fecha, estado)
            VALUES (%s, %s, %s)
        """

        cursor.execute(consulta, (numero, fecha, estado))
        conexion.commit()

        return jsonify({
            "mensaje": "Lote registrado correctamente"
        }), 201

    except Exception as error:
        if conexion:
            conexion.rollback()
        return jsonify({"error": str(error)}), 500

    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()


# =====================================
# EDITAR LOTE
# =====================================

@app.route("/api/lotes/<int:id>", methods=["PUT"])
def editar_lote(id):
    datos = request.get_json()

    if not datos:
        return jsonify({"error": "No se recibieron datos"}), 400

    numero = datos.get("numero")
    fecha = datos.get("fecha")
    estado = datos.get("estado")

    if not numero or not fecha or not estado:
        return jsonify({"error": "Faltan datos del lote"}), 400

    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute(
            """
            UPDATE lotes
            SET numero = %s, fecha = %s, estado = %s
            WHERE id = %s
            """,
            (numero, fecha, estado, id)
        )

        if cursor.rowcount == 0:
            cursor.execute("SELECT id FROM lotes WHERE id = %s", (id,))
            if not cursor.fetchone():
                return jsonify({"error": "Lote no encontrado"}), 404

        conexion.commit()

        return jsonify({
            "mensaje": "Lote actualizado correctamente"
        })

    except Exception as error:
        if conexion:
            conexion.rollback()
        return jsonify({"error": str(error)}), 500

    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()


# =====================================
# ELIMINAR LOTE
# =====================================

@app.route("/api/lotes/<int:id>", methods=["DELETE"])
def eliminar_lote(id):
    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute("DELETE FROM lotes WHERE id = %s", (id,))

        if cursor.rowcount == 0:
            return jsonify({"error": "Lote no encontrado"}), 404

        conexion.commit()

        return jsonify({
            "mensaje": "Lote eliminado correctamente"
        })

    except Exception as error:
        if conexion:
            conexion.rollback()
        return jsonify({"error": str(error)}), 500

    finally:
        if cursor:
            cursor.close()
        if conexion and conexion.is_connected():
            conexion.close()

# =====================================
# PRODUCCIÓN
# =====================================

@app.route("/api/producciones", methods=["GET"])
def listar_producciones():
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM producciones ORDER BY id DESC")
        datos = cursor.fetchall()
        for p in datos:
            p["fecha"] = p["fecha"].strftime("%Y-%m-%d")
        return jsonify(datos)
    except Exception as error:
        return jsonify({"error": str(error)}), 500
    finally:
        cursor.close()
        conexion.close()


@app.route("/api/producciones", methods=["POST"])
def agregar_produccion():
    datos = request.get_json()
    if not datos or not all(datos.get(k) is not None for k in ("producto", "cantidad", "fecha", "estado")):
        return jsonify({"error": "Faltan datos"}), 400
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        cursor.execute(
            "INSERT INTO producciones (producto, cantidad, fecha, estado) VALUES (%s,%s,%s,%s)",
            (datos["producto"], datos["cantidad"], datos["fecha"], datos["estado"])
        )
        conexion.commit()
        return jsonify({"mensaje": "Producción registrada"}), 201
    except Exception as error:
        conexion.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        cursor.close()
        conexion.close()


@app.route("/api/producciones/<int:id>", methods=["PUT", "DELETE"])
def modificar_produccion(id):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        if request.method == "DELETE":
            cursor.execute("DELETE FROM producciones WHERE id=%s", (id,))
        else:
            datos = request.get_json() or {}
            campos = ("producto", "cantidad", "fecha", "estado")
            if not all(datos.get(k) is not None for k in campos):
                return jsonify({"error": "Faltan datos"}), 400
            cursor.execute(
                "UPDATE producciones SET producto=%s, cantidad=%s, fecha=%s, estado=%s WHERE id=%s",
                (datos["producto"], datos["cantidad"], datos["fecha"], datos["estado"], id)
            )
        if cursor.rowcount == 0:
            cursor.execute("SELECT id FROM producciones WHERE id=%s", (id,))
            if not cursor.fetchone():
                return jsonify({"error": "Registro no encontrado"}), 404
        conexion.commit()
        return jsonify({"mensaje": "Operación realizada correctamente"})
    except Exception as error:
        conexion.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        cursor.close()
        conexion.close()


# =====================================
# TAREAS
# =====================================

@app.route("/api/tareas", methods=["GET"])
def listar_tareas():
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM tareas ORDER BY id DESC")
        datos = cursor.fetchall()
        for t in datos:
            t["fecha"] = t["fecha"].strftime("%Y-%m-%d")
        return jsonify(datos)
    except Exception as error:
        return jsonify({"error": str(error)}), 500
    finally:
        cursor.close()
        conexion.close()


@app.route("/api/tareas", methods=["POST"])
def agregar_tarea():
    datos = request.get_json() or {}
    campos = ("descripcion", "responsable", "fecha", "estado")
    if not all(datos.get(k) for k in campos):
        return jsonify({"error": "Faltan datos"}), 400
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        cursor.execute(
            "INSERT INTO tareas (descripcion, responsable, fecha, estado) VALUES (%s,%s,%s,%s)",
            tuple(datos[k] for k in campos)
        )
        conexion.commit()
        return jsonify({"mensaje": "Tarea registrada"}), 201
    except Exception as error:
        conexion.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        cursor.close()
        conexion.close()


@app.route("/api/tareas/<int:id>", methods=["PUT", "DELETE"])
def modificar_tarea(id):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        if request.method == "DELETE":
            cursor.execute("DELETE FROM tareas WHERE id=%s", (id,))
        else:
            datos = request.get_json() or {}
            campos = ("descripcion", "responsable", "fecha", "estado")
            if not all(datos.get(k) for k in campos):
                return jsonify({"error": "Faltan datos"}), 400
            cursor.execute(
                "UPDATE tareas SET descripcion=%s, responsable=%s, fecha=%s, estado=%s WHERE id=%s",
                (*[datos[k] for k in campos], id)
            )
        if cursor.rowcount == 0:
            cursor.execute("SELECT id FROM tareas WHERE id=%s", (id,))
            if not cursor.fetchone():
                return jsonify({"error": "Tarea no encontrada"}), 404
        conexion.commit()
        return jsonify({"mensaje": "Operación realizada correctamente"})
    except Exception as error:
        conexion.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        cursor.close()
        conexion.close()


# =====================================
# VIÑEDOS
# =====================================

@app.route("/api/vinedos", methods=["GET"])
def listar_vinedos():
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM vinedos ORDER BY id DESC")
        return jsonify(cursor.fetchall())
    except Exception as error:
        return jsonify({"error": str(error)}), 500
    finally:
        cursor.close()
        conexion.close()


@app.route("/api/vinedos", methods=["POST"])
def agregar_vinedo():
    datos = request.get_json() or {}
    campos = ("nombre", "variedad", "superficie", "estado", "rendimiento")
    if not all(datos.get(k) is not None for k in campos):
        return jsonify({"error": "Faltan datos"}), 400
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        cursor.execute(
            "INSERT INTO vinedos (nombre,variedad,superficie,estado,rendimiento) VALUES (%s,%s,%s,%s,%s)",
            tuple(datos[k] for k in campos)
        )
        conexion.commit()
        return jsonify({"mensaje": "Viñedo registrado"}), 201
    except Exception as error:
        conexion.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        cursor.close()
        conexion.close()


@app.route("/api/vinedos/<int:id>", methods=["PUT", "DELETE"])
def modificar_vinedo(id):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        if request.method == "DELETE":
            cursor.execute("DELETE FROM vinedos WHERE id=%s", (id,))
        else:
            datos = request.get_json() or {}
            campos = ("nombre", "variedad", "superficie", "estado", "rendimiento")
            if not all(datos.get(k) is not None for k in campos):
                return jsonify({"error": "Faltan datos"}), 400
            cursor.execute(
                "UPDATE vinedos SET nombre=%s,variedad=%s,superficie=%s,estado=%s,rendimiento=%s WHERE id=%s",
                (*[datos[k] for k in campos], id)
            )
        if cursor.rowcount == 0:
            cursor.execute("SELECT id FROM vinedos WHERE id=%s", (id,))
            if not cursor.fetchone():
                return jsonify({"error": "Viñedo no encontrado"}), 404
        conexion.commit()
        return jsonify({"mensaje": "Operación realizada correctamente"})
    except Exception as error:
        conexion.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        cursor.close()
        conexion.close()


# =====================================
# RECEPCIÓN DE UVAS
# =====================================

@app.route("/api/recepciones", methods=["GET"])
def listar_recepciones():
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM recepciones ORDER BY id DESC")
        datos = cursor.fetchall()
        for r in datos:
            r["fecha"] = r["fecha"].strftime("%Y-%m-%d")
        return jsonify(datos)
    except Exception as error:
        return jsonify({"error": str(error)}), 500
    finally:
        cursor.close()
        conexion.close()


@app.route("/api/recepciones", methods=["POST"])
def agregar_recepcion():
    datos = request.get_json() or {}
    campos = ("proveedor", "variedad", "cantidad", "fecha")
    if not all(datos.get(k) is not None for k in campos):
        return jsonify({"error": "Faltan datos"}), 400
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        cursor.execute(
            "INSERT INTO recepciones (proveedor,variedad,cantidad,fecha,observaciones) VALUES (%s,%s,%s,%s,%s)",
            (datos["proveedor"], datos["variedad"], datos["cantidad"], datos["fecha"], datos.get("observaciones", ""))
        )
        conexion.commit()
        return jsonify({"mensaje": "Recepción registrada"}), 201
    except Exception as error:
        conexion.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        cursor.close()
        conexion.close()


@app.route("/api/recepciones/<int:id>", methods=["PUT", "DELETE"])
def modificar_recepcion(id):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        if request.method == "DELETE":
            cursor.execute("DELETE FROM recepciones WHERE id=%s", (id,))
        else:
            datos = request.get_json() or {}
            campos = ("proveedor", "variedad", "cantidad", "fecha")
            if not all(datos.get(k) is not None for k in campos):
                return jsonify({"error": "Faltan datos"}), 400
            cursor.execute(
                "UPDATE recepciones SET proveedor=%s,variedad=%s,cantidad=%s,fecha=%s,observaciones=%s WHERE id=%s",
                (datos["proveedor"], datos["variedad"], datos["cantidad"], datos["fecha"], datos.get("observaciones", ""), id)
            )
        if cursor.rowcount == 0:
            cursor.execute("SELECT id FROM recepciones WHERE id=%s", (id,))
            if not cursor.fetchone():
                return jsonify({"error": "Recepción no encontrada"}), 404
        conexion.commit()
        return jsonify({"mensaje": "Operación realizada correctamente"})
    except Exception as error:
        conexion.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        cursor.close()
        conexion.close()


# =====================================
# EMPLEADOS
# =====================================

@app.route("/api/empleados", methods=["GET"])
def listar_empleados():
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM empleados ORDER BY id DESC")
        empleados = cursor.fetchall()
        for e in empleados:
            e["asistencias"] = []
        return jsonify(empleados)
    except Exception as error:
        return jsonify({"error": str(error)}), 500
    finally:
        cursor.close()
        conexion.close()


@app.route("/api/empleados", methods=["POST"])
def agregar_empleado():
    datos = request.get_json() or {}
    campos = ("nombre", "puesto", "telefono", "correo")
    if not all(datos.get(k) is not None for k in campos):
        return jsonify({"error": "Faltan datos"}), 400
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        cursor.execute(
            "INSERT INTO empleados (nombre,puesto,telefono,correo) VALUES (%s,%s,%s,%s)",
            tuple(datos[k] for k in campos)
        )
        conexion.commit()
        return jsonify({"mensaje": "Empleado registrado"}), 201
    except Exception as error:
        conexion.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        cursor.close()
        conexion.close()


@app.route("/api/empleados/<int:id>", methods=["PUT", "DELETE"])
def modificar_empleado(id):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        if request.method == "DELETE":
            cursor.execute("DELETE FROM empleados WHERE id=%s", (id,))
        else:
            datos = request.get_json() or {}
            campos = ("nombre", "puesto", "telefono", "correo")
            if not all(datos.get(k) is not None for k in campos):
                return jsonify({"error": "Faltan datos"}), 400
            cursor.execute(
                "UPDATE empleados SET nombre=%s,puesto=%s,telefono=%s,correo=%s WHERE id=%s",
                (*[datos[k] for k in campos], id)
            )
        if cursor.rowcount == 0:
            cursor.execute("SELECT id FROM empleados WHERE id=%s", (id,))
            if not cursor.fetchone():
                return jsonify({"error": "Empleado no encontrado"}), 404
        conexion.commit()
        return jsonify({"mensaje": "Operación realizada correctamente"})
    except Exception as error:
        conexion.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        cursor.close()
        conexion.close()


# =====================================
# ASISTENCIAS
# =====================================

@app.route("/api/asistencias", methods=["GET"])
def listar_asistencias():
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT a.id, a.empleado_id, a.fecha, e.nombre
            FROM asistencias a
            JOIN empleados e ON e.id = a.empleado_id
            ORDER BY a.fecha DESC
        """)
        datos = cursor.fetchall()
        for a in datos:
            a["fecha"] = a["fecha"].strftime("%Y-%m-%d")
        return jsonify(datos)
    except Exception as error:
        return jsonify({"error": str(error)}), 500
    finally:
        cursor.close()
        conexion.close()


@app.route("/api/asistencias", methods=["POST"])
def agregar_asistencia():
    datos = request.get_json() or {}
    if not datos.get("empleado_id") or not datos.get("fecha"):
        return jsonify({"error": "Faltan datos"}), 400
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        cursor.execute(
            "INSERT INTO asistencias (empleado_id,fecha) VALUES (%s,%s)",
            (datos["empleado_id"], datos["fecha"])
        )
        conexion.commit()
        return jsonify({"mensaje": "Asistencia registrada"}), 201
    except Exception as error:
        conexion.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        cursor.close()
        conexion.close()

# =====================================
# VENTAS
# =====================================

@app.route("/api/ventas", methods=["GET"])
def listar_ventas():
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM ventas ORDER BY id DESC")
        datos = cursor.fetchall()

        for venta in datos:
            venta["fecha"] = venta["fecha"].strftime("%Y-%m-%d")
            venta["precio"] = float(venta["precio"])
            venta["total"] = float(venta["total"])

        return jsonify(datos)

    except Exception as error:
        return jsonify({"error": str(error)}), 500

    finally:
        cursor.close()
        conexion.close()


@app.route("/api/ventas", methods=["POST"])
def agregar_venta():
    datos = request.get_json() or {}

    cliente = datos.get("cliente")
    producto = datos.get("producto")
    cantidad = datos.get("cantidad")
    precio = datos.get("precio")
    fecha = datos.get("fecha")

    if not cliente or not producto or not fecha:
        return jsonify({"error": "Faltan datos de la venta"}), 400

    try:
        cantidad = int(cantidad)
        precio = float(precio)

        if cantidad <= 0 or precio <= 0:
            raise ValueError()

    except (TypeError, ValueError):
        return jsonify({"error": "Cantidad o precio inválido"}), 400

    total = cantidad * precio

    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)

    try:
        conexion.start_transaction()

        cursor.execute(
            "SELECT id, stock FROM productos WHERE nombre = %s LIMIT 1 FOR UPDATE",
            (producto,)
        )
        producto_db = cursor.fetchone()

        if not producto_db:
            conexion.rollback()
            return jsonify({"error": "Producto no encontrado"}), 404

        if int(producto_db["stock"]) < cantidad:
            conexion.rollback()
            return jsonify({"error": "Stock insuficiente"}), 400

        cursor.execute(
            "UPDATE productos SET stock = stock - %s WHERE id = %s",
            (cantidad, producto_db["id"])
        )

        cursor.execute(
            """
            INSERT INTO ventas (cliente, producto, cantidad, precio, total, fecha)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (cliente, producto, cantidad, precio, total, fecha)
        )

        conexion.commit()

        return jsonify({
            "mensaje": "Venta registrada y stock actualizado"
        }), 201

    except Exception as error:
        conexion.rollback()
        return jsonify({"error": str(error)}), 500

    finally:
        cursor.close()
        conexion.close()


@app.route("/api/ventas/<int:id>", methods=["DELETE"])
def eliminar_venta(id):
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)

    try:
        conexion.start_transaction()

        cursor.execute(
            "SELECT producto, cantidad FROM ventas WHERE id = %s FOR UPDATE",
            (id,)
        )
        venta = cursor.fetchone()

        if not venta:
            conexion.rollback()
            return jsonify({"error": "Venta no encontrada"}), 404

        cursor.execute(
            "SELECT id FROM productos WHERE nombre = %s LIMIT 1 FOR UPDATE",
            (venta["producto"],)
        )
        producto_db = cursor.fetchone()

        if not producto_db:
            conexion.rollback()
            return jsonify({"error": "No se encontró el producto de esta venta"}), 404

        cursor.execute(
            "UPDATE productos SET stock = stock + %s WHERE id = %s",
            (venta["cantidad"], producto_db["id"])
        )

        cursor.execute("DELETE FROM ventas WHERE id = %s", (id,))

        conexion.commit()

        return jsonify({
            "mensaje": "Venta eliminada y stock devuelto correctamente"
        })

    except Exception as error:
        conexion.rollback()
        return jsonify({"error": str(error)}), 500

    finally:
        cursor.close()
        conexion.close()

# INICIAR SERVIDOR
# =====================================

if __name__ == "__main__":
    app.run(debug=True)
