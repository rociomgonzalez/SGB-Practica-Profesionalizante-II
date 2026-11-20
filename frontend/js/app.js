

function mostrar(id) {
  document.querySelectorAll(".pantalla").forEach(p => {
    p.classList.remove("activa");
  });

  document.getElementById(id).classList.add("activa");

  if (id === "stock") {
    mostrarStock();
  }

  if (id === "ventas") {
    mostrarVentas();
  }
  if (id === "reportes") {
  mostrarReportes();
  }

  let menu = document.querySelector(".menu-principal");

  if (
    id === "panel" ||
    id === "login" ||
    ["productos", "lotes", "produccion", "stock",
     "ventas", "tareas", "vinedos", "recepcion",
     "empleados", "reportes"].includes(id)
  ) {
    menu.style.display = "none";
  } else {
    menu.style.display = "flex";
  }
}


function login() {
  let u = document.getElementById("user").value;
  let p = document.getElementById("pass").value;

  if (u !== "" && p !== "") {
    mostrar("panel");
  } else {
    alert("Complete los campos");
  }
}

function volver() {
  document.querySelectorAll(".pantalla").forEach(p => {
    p.classList.remove("activa");
  });

  document.getElementById("panel").classList.add("activa");
}

function abrirModal() {
  document.getElementById("modal").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}

function cerrarSesion() {
  document.getElementById("modal").style.display = "none";

  document.querySelectorAll(".pantalla").forEach(p => {
    p.classList.remove("activa");
  });

  document.getElementById("login").classList.add("activa");
}


// PRODUCTOS

const API_PRODUCTOS = "http://127.0.0.1:5000/api/productos";

let productos = [];
let indiceEdicion = null;

// CONSULTAR PRODUCTOS EN MYSQL

async function cargarProductos() {
  try {
    const respuesta = await fetch(API_PRODUCTOS);

    if (!respuesta.ok) {
      throw new Error("No se pudieron consultar los productos");
    }

    productos = await respuesta.json();

    mostrarProductos();

  } catch (error) {
    console.error("Error al cargar productos:", error);
    alert("No se pudo conectar con la base de datos.");
  }
}

function mostrarFormularioProducto() {
  document.getElementById("formulario-producto").style.display = "block";
}

function ocultarFormularioProducto() {
  document.getElementById("formulario-producto").style.display = "none";
  indiceEdicion = null;
}

// REGISTRAR PRODUCTO EN MYSQL

async function guardarProducto() {
  let nombre = document.getElementById("nombreProducto").value.trim();
  let tipo = document.getElementById("tipoProducto").value.trim();
  let anio = document.getElementById("anioProducto").value;
  let stock = document.getElementById("stockProducto").value;

  if (nombre === "" || tipo === "" || anio === "" || stock === "") {
    alert("Complete todos los campos");
    return;
  }

  if (Number(stock) < 0 || !Number.isInteger(Number(stock))) {
    alert("Ingrese un stock válido");
    return;
  }

  if (indiceEdicion !== null) {
  let producto = {
    nombre: nombre,
    tipo: tipo,
    anio: Number(anio),
    stock: Number(stock)
  };

  try {
    const respuesta = await fetch(
      `${API_PRODUCTOS}/${productos[indiceEdicion].id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(producto)
      }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.error || "No se pudo actualizar");
    }

    alert("Producto actualizado correctamente");

    await cargarProductos();

    document.getElementById("nombreProducto").value = "";
    document.getElementById("tipoProducto").value = "";
    document.getElementById("anioProducto").value = "";
    document.getElementById("stockProducto").value = "";

    ocultarFormularioProducto();

  } catch (error) {
    console.error(error);
    alert(error.message);
  }

  return;
}

  let producto = {
    nombre: nombre,
    tipo: tipo,
    anio: Number(anio),
    stock: Number(stock)
  };

  try {
    const respuesta = await fetch(API_PRODUCTOS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(producto)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.error || "No se pudo registrar el producto");
    }

    alert("Producto registrado correctamente");

    await cargarProductos();

    document.getElementById("nombreProducto").value = "";
    document.getElementById("tipoProducto").value = "";
    document.getElementById("anioProducto").value = "";
    document.getElementById("stockProducto").value = "";

    ocultarFormularioProducto();

  } catch (error) {
    console.error("Error al registrar producto:", error);
    alert(error.message);
  }
}

// MOSTRAR PRODUCTOS

function mostrarProductos() {
  let tabla = document.getElementById("lista-productos");

  tabla.innerHTML = "";

  document.getElementById("totalProductos").textContent = productos.length;

  document.getElementById("productosDisponibles").textContent =
    productos.filter(p => Number(p.stock) > 0).length;

  document.getElementById("productosSinStock").textContent =
    productos.filter(p => Number(p.stock) === 0).length;

  productos.forEach((producto, indice) => {
    let estado = producto.stock > 0 ? "Disponible" : "Sin stock";

    tabla.innerHTML += `
      <tr>
        <td>${producto.nombre}</td>
        <td>${producto.tipo}</td>
        <td>${producto.anio}</td>
        <td>${producto.stock}</td>
        <td>${estado}</td>
        <td>
          <button onclick="editarProducto(${indice})">Editar</button>
          <button onclick="eliminarProducto(${indice})">Eliminar</button>
        </td>
      </tr>
    `;
  });
}

async function eliminarProducto(indice) {
  let producto = productos[indice];

  let confirmar = confirm(
    `¿Está seguro de eliminar el producto ${producto.nombre}?`
  );

  if (!confirmar) {
    return;
  }

  try {
    const respuesta = await fetch(
      `${API_PRODUCTOS}/${producto.id}`,
      {
        method: "DELETE"
      }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.error || "No se pudo eliminar");
    }

    alert("Producto eliminado correctamente");

    await cargarProductos();

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}
function editarProducto(indice) {
  let producto = productos[indice];

  document.getElementById("nombreProducto").value = producto.nombre;
  document.getElementById("tipoProducto").value = producto.tipo;
  document.getElementById("anioProducto").value = producto.anio;
  document.getElementById("stockProducto").value = producto.stock;

  indiceEdicion = indice;
  mostrarFormularioProducto();
}

// LOTES DE PRODUCCIÓN

const API_LOTES = "http://127.0.0.1:5000/api/lotes";

let lotes = [];
let indiceEdicionLote = null;

// CARGAR LOTES DESDE MYSQL

async function cargarLotes() {
  try {
    const respuesta = await fetch(API_LOTES);

    if (!respuesta.ok) {
      throw new Error("No se pudieron consultar los lotes");
    }

    lotes = await respuesta.json();
    mostrarLotes();

  } catch (error) {
    console.error("Error al cargar lotes:", error);
    alert("No se pudieron cargar los lotes.");
  }
}

function mostrarFormularioLote() {
  document.getElementById("formulario-lote").style.display = "block";
}

function ocultarFormularioLote() {
  document.getElementById("formulario-lote").style.display = "none";
  indiceEdicionLote = null;
}

// GUARDAR LOTES EN MYSQL

async function guardarLote() {
  let numero = document.getElementById("numeroLote").value.trim();
  let fecha = document.getElementById("fechaLote").value;
  let estado = document.getElementById("estadoLote").value;

  if (numero === "" || fecha === "" || estado === "") {
    alert("Complete todos los campos");
    return;
  }

  let lote = { numero, fecha, estado };

  try {
    let url = API_LOTES;
    let metodo = "POST";

    if (indiceEdicionLote !== null) {
      url = `${API_LOTES}/${lotes[indiceEdicionLote].id}`;
      metodo = "PUT";
    }

    const respuesta = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(lote)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.error || "No se pudo guardar el lote");
    }

    alert(
      indiceEdicionLote === null
        ? "Lote registrado correctamente"
        : "Lote actualizado correctamente"
    );

    await cargarLotes();

    document.getElementById("numeroLote").value = "";
    document.getElementById("fechaLote").value = "";
    document.getElementById("estadoLote").value = "";

    ocultarFormularioLote();

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

// MOSTRAR LOTES

function mostrarLotes() {
  let contenedor = document.getElementById("lista-lotes");

  contenedor.innerHTML = "";

  lotes.forEach((lote, indice) => {
    contenedor.innerHTML += `
      <div class="card">
        <h3>Lote ${lote.numero}</h3>
        <p>Fecha: ${lote.fecha}</p>
        <p>Estado: ${lote.estado}</p>

        <button onclick="editarLote(${indice})">
          Editar
        </button>

        <button onclick="eliminarLote(${indice})">
          Eliminar
        </button>
      </div>
    `;
  });
}

// ELIMINAR LOTE

async function eliminarLote(indice) {
  let lote = lotes[indice];

  if (!confirm(`¿Desea eliminar el lote ${lote.numero}?`)) {
    return;
  }

  try {
    const respuesta = await fetch(`${API_LOTES}/${lote.id}`, {
      method: "DELETE"
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.error || "No se pudo eliminar el lote");
    }

    alert("Lote eliminado correctamente");

    await cargarLotes();

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

// EDITAR LOTE

function editarLote(indice) {
  let lote = lotes[indice];

  document.getElementById("numeroLote").value = lote.numero;
  document.getElementById("fechaLote").value = lote.fecha;
  document.getElementById("estadoLote").value = lote.estado;

  indiceEdicionLote = indice;
  mostrarFormularioLote();
}

// PRODUCCIÓN

let producciones = [];
let indiceEdicionProduccion = null;

const API_PRODUCCIONES = "http://127.0.0.1:5000/api/producciones";

function mostrarFormularioProduccion() {
  document.getElementById("formulario-produccion").style.display = "block";
}

function ocultarFormularioProduccion() {
  document.getElementById("formulario-produccion").style.display = "none";
  indiceEdicionProduccion = null;
}

async function cargarProducciones() {
  try {
    const respuesta = await fetch(API_PRODUCCIONES);

    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar las producciones");
    }

    producciones = await respuesta.json();
    mostrarProducciones();

  } catch (error) {
    console.error(error);
    alert("Error al cargar las producciones.");
  }
}

async function guardarProduccion() {
  let producto = document.getElementById("productoProduccion").value.trim();
  let cantidad = Number(document.getElementById("cantidadProduccion").value);
  let fecha = document.getElementById("fechaProduccion").value;
  let estado = document.getElementById("estadoProduccion").value;

  if (!producto || !Number.isFinite(cantidad) || cantidad <= 0 || !fecha || !estado) {
    alert("Complete correctamente todos los campos");
    return;
  }

  let produccion = { producto, cantidad, fecha, estado };

  try {
    let url = API_PRODUCCIONES;
    let metodo = "POST";

    if (indiceEdicionProduccion !== null) {
      url += "/" + producciones[indiceEdicionProduccion].id;
      metodo = "PUT";
    }

    const respuesta = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(produccion)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.error || "No se pudo guardar");
    }

    alert(resultado.mensaje);

    document.getElementById("productoProduccion").value = "";
    document.getElementById("cantidadProduccion").value = "";
    document.getElementById("fechaProduccion").value = "";
    document.getElementById("estadoProduccion").value = "";

    ocultarFormularioProduccion();
    await cargarProducciones();

  } catch (error) {
    console.error(error);
    alert("Error al guardar: " + error.message);
  }
}

function mostrarProducciones() {
  let tabla = document.getElementById("lista-produccion");
  tabla.innerHTML = "";

  document.getElementById("totalProducciones").textContent = producciones.length;

  document.getElementById("produccionesActivas").textContent =
    producciones.filter(p => p.estado !== "Finalizado").length;

  document.getElementById("produccionesFinalizadas").textContent =
    producciones.filter(p => p.estado === "Finalizado").length;

  producciones.forEach((p, indice) => {
    tabla.innerHTML += `
      <tr>
        <td>${p.producto}</td>
        <td>${p.cantidad}</td>
        <td>${p.fecha}</td>
        <td>${p.estado}</td>
        <td>
          <button onclick="editarProduccion(${indice})">Editar</button>
          <button onclick="eliminarProduccion(${indice})">Eliminar</button>
        </td>
      </tr>
    `;
  });
}

function editarProduccion(indice) {
  let p = producciones[indice];

  document.getElementById("productoProduccion").value = p.producto;
  document.getElementById("cantidadProduccion").value = p.cantidad;
  document.getElementById("fechaProduccion").value = p.fecha;
  document.getElementById("estadoProduccion").value = p.estado;

  indiceEdicionProduccion = indice;
  mostrarFormularioProduccion();
}

async function eliminarProduccion(indice) {
  if (!confirm("¿Desea eliminar esta producción?")) return;

  try {
    const respuesta = await fetch(
      API_PRODUCCIONES + "/" + producciones[indice].id,
      { method: "DELETE" }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.error || "No se pudo eliminar");
    }

    alert(resultado.mensaje);
    await cargarProducciones();

  } catch (error) {
    console.error(error);
    alert("Error al eliminar: " + error.message);
  }
}


// =====================================
// GESTIÓN DE STOCK
// =====================================

function mostrarStock() {
    const tabla = document.getElementById("lista-stock");

    tabla.innerHTML = "";

    const unidades = productos.reduce(
        (total, producto) => total + Number(producto.stock),
        0
    );

    document.getElementById("totalStock").textContent =
        productos.length;

    document.getElementById("stockDisponible").textContent =
        unidades;

    document.getElementById("stockBajo").textContent =
        productos.filter(producto => Number(producto.stock) === 0).length;

    productos.forEach((producto, indice) => {
        const stock = Number(producto.stock);

        const estado = stock > 0 ? "Disponible" : "Sin stock";

        tabla.innerHTML += `
            <tr>
                <td>${producto.nombre}</td>
                <td>${producto.tipo}</td>
                <td>${stock}</td>
                <td>${estado}</td>
                <td>
                    <button onclick="modificarStock(${indice})">
                        Modificar
                    </button>
                </td>
            </tr>
        `;
    });
}


// =====================================
// MODIFICAR STOCK EN MYSQL
// =====================================

async function modificarStock(indice) {
    const producto = productos[indice];

    if (!producto) {
        alert("No se encontró el producto.");
        return;
    }

    const cantidad = prompt(
        `Ingrese el nuevo stock de ${producto.nombre}:`,
        producto.stock
    );

    if (cantidad === null || cantidad.trim() === "") {
        return;
    }

    const nuevoStock = Number(cantidad);

    if (!Number.isInteger(nuevoStock) || nuevoStock < 0) {
        alert("Ingrese una cantidad entera válida, igual o mayor a cero.");
        return;
    }

    const datos = {
        nombre: producto.nombre,
        tipo: producto.tipo,
        anio: producto.anio,
        stock: nuevoStock
    };

    try {
        const respuesta = await fetch(
            `${API_PRODUCTOS}/${producto.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.error || "No se pudo actualizar el stock."
            );
        }

        await cargarProductos();

        mostrarStock();

        alert("Stock actualizado correctamente.");

    } catch (error) {
        console.error("Error al modificar stock:", error);
        alert(error.message);
    }
}


 // =====================================
 // GESTIÓN DE VENTAS
 // =====================================

const API_VENTAS = "http://127.0.0.1:5000/api/ventas";

let ventas = [];

async function cargarVentas() {
    try {
        const respuesta = await fetch(API_VENTAS);
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.error || "No se pudieron cargar las ventas.");
        }

        ventas = datos;
        mostrarVentas();

    } catch (error) {
        console.error("Error al cargar ventas:", error);
        alert(error.message);
    }
}

function mostrarFormularioVenta() {
    const selector = document.getElementById("productoVenta");

    selector.innerHTML = '<option value="">Seleccione un producto</option>';

    productos.forEach(producto => {
        const opcion = document.createElement("option");
        opcion.value = producto.id;
        opcion.textContent = `${producto.nombre} - Stock: ${producto.stock}`;
        selector.appendChild(opcion);
    });

    if (productos.length === 0) {
        alert("Primero debe registrar productos.");
        return;
    }

    document.getElementById("formulario-venta").style.display = "block";
}

function ocultarFormularioVenta() {
    document.getElementById("formulario-venta").style.display = "none";
}

async function guardarVenta() {
    const cliente = document.getElementById("clienteVenta").value.trim();
    const productoId = document.getElementById("productoVenta").value;
    const cantidad = Number(document.getElementById("cantidadVenta").value);
    const precio = Number(document.getElementById("precioVenta").value);

    if (!cliente || !productoId || !Number.isInteger(cantidad) ||
        cantidad <= 0 || !Number.isFinite(precio) || precio <= 0) {
        alert("Complete correctamente todos los campos.");
        return;
    }

    const producto = productos.find(
        p => String(p.id) === String(productoId)
    );

    if (!producto) {
        alert("Seleccione un producto válido.");
        return;
    }

    if (cantidad > Number(producto.stock)) {
        alert("Stock insuficiente.");
        return;
    }

    const datos = {
        cliente,
        producto: producto.nombre,
        cantidad,
        precio,
        fecha: new Date().toISOString().slice(0, 10)
    };

    try {
        const respuesta = await fetch(API_VENTAS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.error || "No se pudo registrar la venta.");
        }

        await cargarProductos();
        await cargarVentas();

        mostrarStock();
        ocultarFormularioVenta();

        document.getElementById("clienteVenta").value = "";
        document.getElementById("productoVenta").value = "";
        document.getElementById("cantidadVenta").value = "";
        document.getElementById("precioVenta").value = "";

        alert(resultado.mensaje);

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function mostrarVentas() {
    const tabla = document.getElementById("lista-ventas");
    tabla.innerHTML = "";

    document.getElementById("totalVentas").textContent = ventas.length;

    const dinero = ventas.reduce(
        (total, venta) => total + Number(venta.total),
        0
    );

    document.getElementById("dineroVentas").textContent =
        "$" + dinero.toLocaleString("es-AR");

    document.getElementById("productosVendidos").textContent =
        ventas.reduce((total, venta) => total + Number(venta.cantidad), 0);

    ventas.forEach(venta => {
        tabla.innerHTML += `
            <tr>
                <td>${venta.cliente}</td>
                <td>${venta.producto}</td>
                <td>${venta.cantidad}</td>
                <td>$${Number(venta.total).toLocaleString("es-AR")}</td>
                <td>${venta.fecha}</td>
                <td>
                    <button onclick="eliminarVenta(${venta.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

async function eliminarVenta(id) {
    if (!confirm("¿Desea eliminar esta venta y devolver el stock?")) {
        return;
    }

    try {
        const respuesta = await fetch(`${API_VENTAS}/${id}`, {
            method: "DELETE"
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.error || "No se pudo eliminar la venta.");
        }

        await cargarProductos();
        await cargarVentas();
        mostrarStock();

        alert(resultado.mensaje);

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}



// =====================================
// TAREAS DIARIAS
// =====================================

const API_TAREAS = "http://127.0.0.1:5000/api/tareas";

let tareas = [];
let indiceEdicionTarea = null;

async function cargarTareas() {
    try {
        const respuesta = await fetch(API_TAREAS);
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.error || "No se pudieron cargar las tareas");
        }

        tareas = datos;
        mostrarTareas();

    } catch (error) {
        console.error("Error al cargar tareas:", error);
        alert(error.message);
    }
}

function mostrarFormularioTarea() {
    indiceEdicionTarea = null;
    document.getElementById("formulario-tarea").style.display = "block";
}

function ocultarFormularioTarea() {
    document.getElementById("formulario-tarea").style.display = "none";
}

async function guardarTarea() {
    const descripcion = document.getElementById("descripcionTarea").value.trim();
    const responsable = document.getElementById("responsableTarea").value.trim();
    const fecha = document.getElementById("fechaTarea").value;
    const estado = document.getElementById("estadoTarea").value;

    if (!descripcion || !responsable || !fecha || !estado) {
        alert("Complete todos los campos.");
        return;
    }

    const datos = { descripcion, responsable, fecha, estado };

    try {
        const editando = indiceEdicionTarea !== null;
        const id = editando ? tareas[indiceEdicionTarea].id : null;

        const respuesta = await fetch(
            editando ? `${API_TAREAS}/${id}` : API_TAREAS,
            {
                method: editando ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.error || "No se pudo guardar la tarea.");
        }

        await cargarTareas();
        ocultarFormularioTarea();

        document.getElementById("descripcionTarea").value = "";
        document.getElementById("responsableTarea").value = "";
        document.getElementById("fechaTarea").value = "";
        document.getElementById("estadoTarea").value = "";

        indiceEdicionTarea = null;
        alert("Tarea guardada correctamente.");

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function mostrarTareas() {
    const tabla = document.getElementById("lista-tareas");
    tabla.innerHTML = "";

    document.getElementById("totalTareas").textContent = tareas.length;
    document.getElementById("tareasPendientes").textContent =
        tareas.filter(t => t.estado !== "Completada").length;
    document.getElementById("tareasCompletadas").textContent =
        tareas.filter(t => t.estado === "Completada").length;

    tareas.forEach((tarea, indice) => {
        tabla.innerHTML += `
            <tr>
                <td>${tarea.descripcion}</td>
                <td>${tarea.responsable}</td>
                <td>${tarea.fecha}</td>
                <td>${tarea.estado}</td>
                <td>
                    <button onclick="editarTarea(${indice})">Editar</button>
                    <button onclick="completarTarea(${indice})">Completar</button>
                    <button onclick="eliminarTarea(${indice})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function editarTarea(indice) {
    const tarea = tareas[indice];
    if (!tarea) return;

    indiceEdicionTarea = indice;

    document.getElementById("descripcionTarea").value = tarea.descripcion;
    document.getElementById("responsableTarea").value = tarea.responsable;
    document.getElementById("fechaTarea").value = tarea.fecha;
    document.getElementById("estadoTarea").value = tarea.estado;

    document.getElementById("formulario-tarea").style.display = "block";
}

async function completarTarea(indice) {
    const tarea = tareas[indice];
    if (!tarea) return;

    try {
        const respuesta = await fetch(`${API_TAREAS}/${tarea.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                descripcion: tarea.descripcion,
                responsable: tarea.responsable,
                fecha: tarea.fecha,
                estado: "Completada"
            })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.error || "No se pudo completar la tarea.");
        }

        await cargarTareas();
        alert("Tarea completada.");

    } catch (error) {
        alert(error.message);
    }
}

async function eliminarTarea(indice) {
    const tarea = tareas[indice];
    if (!tarea || !confirm("¿Eliminar esta tarea?")) return;

    try {
        const respuesta = await fetch(`${API_TAREAS}/${tarea.id}`, {
            method: "DELETE"
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.error || "No se pudo eliminar la tarea.");
        }

        await cargarTareas();
        alert("Tarea eliminada.");

    } catch (error) {
        alert(error.message);
    }
}



 // =====================================
 // VIÑEDOS
 // =====================================

const API_VINEDOS = "http://127.0.0.1:5000/api/vinedos";

let vinedos = [];
let indiceEdicionVinedo = null;

async function cargarVinedos() {
    try {
        const respuesta = await fetch(API_VINEDOS);
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.error || "No se pudieron cargar los viñedos.");
        }

        vinedos = datos;
        mostrarVinedos();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function mostrarFormularioVinedo() {
    indiceEdicionVinedo = null;
    document.getElementById("formulario-vinedo").style.display = "block";
}

function ocultarFormularioVinedo() {
    document.getElementById("formulario-vinedo").style.display = "none";
}

async function guardarVinedo() {
    const datos = {
        nombre: document.getElementById("nombreVinedo").value.trim(),
        variedad: document.getElementById("variedadVinedo").value.trim(),
        superficie: Number(document.getElementById("superficieVinedo").value),
        estado: document.getElementById("estadoVinedo").value,
        rendimiento: Number(document.getElementById("rendimientoVinedo").value)
    };

    if (!datos.nombre || !datos.variedad || !datos.estado ||
        !Number.isFinite(datos.superficie) || datos.superficie <= 0 ||
        !Number.isFinite(datos.rendimiento) || datos.rendimiento < 0) {
        alert("Complete los campos con valores válidos.");
        return;
    }

    const editando = indiceEdicionVinedo !== null;
    const id = editando ? vinedos[indiceEdicionVinedo].id : null;

    try {
        const respuesta = await fetch(
            editando ? `${API_VINEDOS}/${id}` : API_VINEDOS,
            {
                method: editando ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.error || "No se pudo guardar el viñedo.");
        }

        await cargarVinedos();
        limpiarFormularioVinedo();
        ocultarFormularioVinedo();
        alert("Viñedo guardado correctamente.");

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function limpiarFormularioVinedo() {
    document.getElementById("nombreVinedo").value = "";
    document.getElementById("variedadVinedo").value = "";
    document.getElementById("superficieVinedo").value = "";
    document.getElementById("estadoVinedo").value = "";
    document.getElementById("rendimientoVinedo").value = "";
    indiceEdicionVinedo = null;
}

function mostrarVinedos() {
    const lista = document.getElementById("lista-vinedos");
    lista.innerHTML = "";

    document.getElementById("totalVinedos").textContent = vinedos.length;

    document.getElementById("vinedosActivos").textContent =
        vinedos.filter(v => v.estado === "Activo").length;

    document.getElementById("superficieTotal").textContent =
        vinedos.reduce((total, v) => total + Number(v.superficie), 0);

    vinedos.forEach((vinedo, indice) => {
        lista.innerHTML += `
            <div class="tarjeta">
                <h3>${vinedo.nombre}</h3>
                <p>Variedad: ${vinedo.variedad}</p>
                <p>Superficie: ${vinedo.superficie}</p>
                <p>Estado: ${vinedo.estado}</p>
                <p>Rendimiento: ${vinedo.rendimiento}</p>
                <button onclick="editarVinedo(${indice})">Editar</button>
                <button onclick="eliminarVinedo(${indice})">Eliminar</button>
            </div>
        `;
    });
}

function editarVinedo(indice) {
    const vinedo = vinedos[indice];
    if (!vinedo) return;

    indiceEdicionVinedo = indice;

    document.getElementById("nombreVinedo").value = vinedo.nombre;
    document.getElementById("variedadVinedo").value = vinedo.variedad;
    document.getElementById("superficieVinedo").value = vinedo.superficie;
    document.getElementById("estadoVinedo").value = vinedo.estado;
    document.getElementById("rendimientoVinedo").value = vinedo.rendimiento;

    document.getElementById("formulario-vinedo").style.display = "block";
}

async function eliminarVinedo(indice) {
    const vinedo = vinedos[indice];

    if (!vinedo || !confirm("¿Está seguro de eliminar este viñedo?")) return;

    try {
        const respuesta = await fetch(`${API_VINEDOS}/${vinedo.id}`, {
            method: "DELETE"
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.error || "No se pudo eliminar el viñedo.");
        }

        await cargarVinedos();
        alert("Viñedo eliminado correctamente.");

    } catch (error) {
        alert(error.message);
    }
}



 // =====================================
 // RECEPCIÓN DE UVA
 // =====================================

const API_RECEPCIONES = "http://127.0.0.1:5000/api/recepciones";

let recepciones = [];
let indiceEdicionRecepcion = null;

async function cargarRecepciones() {
    try {
        const respuesta = await fetch(API_RECEPCIONES);
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.error || "No se pudieron cargar las recepciones.");
        }

        recepciones = datos;
        mostrarRecepciones();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function mostrarFormularioRecepcion() {
    indiceEdicionRecepcion = null;
    document.getElementById("formulario-recepcion").style.display = "block";
}

function ocultarFormularioRecepcion() {
    document.getElementById("formulario-recepcion").style.display = "none";
}

function limpiarFormularioRecepcion() {
    document.getElementById("proveedorUva").value = "";
    document.getElementById("variedadUva").value = "";
    document.getElementById("cantidadUva").value = "";
    document.getElementById("fechaUva").value = "";
    document.getElementById("observacionesUva").value = "";
    indiceEdicionRecepcion = null;
}

async function guardarRecepcion() {
    const datos = {
        proveedor: document.getElementById("proveedorUva").value.trim(),
        variedad: document.getElementById("variedadUva").value.trim(),
        cantidad: Number(document.getElementById("cantidadUva").value),
        fecha: document.getElementById("fechaUva").value,
        observaciones: document.getElementById("observacionesUva").value.trim()
    };

    if (!datos.proveedor || !datos.variedad || !datos.fecha ||
        !Number.isFinite(datos.cantidad) || datos.cantidad <= 0) {
        alert("Complete los campos obligatorios con datos válidos.");
        return;
    }

    const editando = indiceEdicionRecepcion !== null;
    const id = editando ? recepciones[indiceEdicionRecepcion].id : null;

    try {
        const respuesta = await fetch(
            editando ? `${API_RECEPCIONES}/${id}` : API_RECEPCIONES,
            {
                method: editando ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.error || "No se pudo guardar la recepción.");
        }

        await cargarRecepciones();
        limpiarFormularioRecepcion();
        ocultarFormularioRecepcion();

        alert("Recepción guardada correctamente.");

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function mostrarRecepciones() {
    const lista = document.getElementById("lista-recepcion");
    lista.innerHTML = "";

    document.getElementById("totalUva").textContent =
        recepciones.reduce((total, r) => total + Number(r.cantidad), 0);

    document.getElementById("totalRecepciones").textContent =
        recepciones.length;

    document.getElementById("proveedoresActivos").textContent =
        new Set(recepciones.map(r => r.proveedor)).size;

    recepciones.forEach((recepcion, indice) => {
        lista.innerHTML += `
            <tr>
                <td>${recepcion.proveedor}</td>
                <td>${recepcion.variedad}</td>
                <td>${recepcion.cantidad}</td>
                <td>${recepcion.fecha}</td>
                <td>${recepcion.observaciones || ""}</td>
                <td>
                    <button onclick="editarRecepcion(${indice})">Editar</button>
                    <button onclick="eliminarRecepcion(${indice})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function editarRecepcion(indice) {
    const recepcion = recepciones[indice];
    if (!recepcion) return;

    indiceEdicionRecepcion = indice;

    document.getElementById("proveedorUva").value = recepcion.proveedor;
    document.getElementById("variedadUva").value = recepcion.variedad;
    document.getElementById("cantidadUva").value = recepcion.cantidad;
    document.getElementById("fechaUva").value = recepcion.fecha;
    document.getElementById("observacionesUva").value =
        recepcion.observaciones || "";

    document.getElementById("formulario-recepcion").style.display = "block";
}

async function eliminarRecepcion(indice) {
    const recepcion = recepciones[indice];

    if (!recepcion || !confirm("¿Eliminar esta recepción?")) return;

    try {
        const respuesta = await fetch(
            `${API_RECEPCIONES}/${recepcion.id}`,
            { method: "DELETE" }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.error || "No se pudo eliminar la recepción.");
        }

        await cargarRecepciones();
        alert("Recepción eliminada correctamente.");

    } catch (error) {
        alert(error.message);
    }
}


 // =====================================
 // EMPLEADOS Y ASISTENCIAS
 // =====================================

const API_EMPLEADOS = "http://127.0.0.1:5000/api/empleados";
const API_ASISTENCIAS = "http://127.0.0.1:5000/api/asistencias";

let empleados = [];
let indiceEdicionEmpleado = null;

// CARGAR EMPLEADOS Y ASISTENCIAS
async function cargarEmpleados() {
    try {
        const [respuestaEmpleados, respuestaAsistencias] = await Promise.all([
            fetch(API_EMPLEADOS),
            fetch(API_ASISTENCIAS)
        ]);

        const datosEmpleados = await respuestaEmpleados.json();
        const datosAsistencias = await respuestaAsistencias.json();

        if (!respuestaEmpleados.ok || !respuestaAsistencias.ok) {
            throw new Error("No se pudieron cargar los empleados o asistencias.");
        }

        empleados = datosEmpleados.map(empleado => ({
            ...empleado,
            asistencias: datosAsistencias
                .filter(a => Number(a.empleado_id) === Number(empleado.id))
                .map(a => a.fecha)
        }));

        mostrarEmpleados();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

// FORMULARIO
function mostrarFormularioEmpleado() {
    indiceEdicionEmpleado = null;
    document.getElementById("formulario-empleado").style.display = "block";
}

function ocultarFormularioEmpleado() {
    document.getElementById("formulario-empleado").style.display = "none";
}

function limpiarFormularioEmpleado() {
    document.getElementById("nombreEmpleado").value = "";
    document.getElementById("puestoEmpleado").value = "";
    document.getElementById("telefonoEmpleado").value = "";
    document.getElementById("correoEmpleado").value = "";
    indiceEdicionEmpleado = null;
}

// GUARDAR EMPLEADO
async function guardarEmpleado() {
    const datos = {
        nombre: document.getElementById("nombreEmpleado").value.trim(),
        puesto: document.getElementById("puestoEmpleado").value.trim(),
        telefono: document.getElementById("telefonoEmpleado").value.trim(),
        correo: document.getElementById("correoEmpleado").value.trim()
    };

    if (!datos.nombre || !datos.puesto) {
        alert("El nombre y el puesto son obligatorios.");
        return;
    }

    const editando = indiceEdicionEmpleado !== null;
    const id = editando ? empleados[indiceEdicionEmpleado].id : null;

    try {
        const respuesta = await fetch(
            editando ? `${API_EMPLEADOS}/${id}` : API_EMPLEADOS,
            {
                method: editando ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.error || "No se pudo guardar el empleado.");
        }

        await cargarEmpleados();
        limpiarFormularioEmpleado();
        ocultarFormularioEmpleado();

        alert("Empleado guardado correctamente.");

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

// MOSTRAR EMPLEADOS
function mostrarEmpleados() {
    const lista = document.getElementById("lista-empleados");
    lista.innerHTML = "";

    document.getElementById("totalEmpleados").textContent = empleados.length;

    const hoy = new Date().toISOString().slice(0, 10);

    const presentes = empleados.filter(empleado =>
        empleado.asistencias.includes(hoy)
    ).length;

    document.getElementById("asistenciasHoy").textContent = presentes;

    empleados.forEach((empleado, indice) => {
        lista.innerHTML += `
            <div class="tarjeta">
                <h3>${empleado.nombre}</h3>
                <p>Puesto: ${empleado.puesto}</p>
                <p>Teléfono: ${empleado.telefono || "No informado"}</p>
                <p>Correo: ${empleado.correo || "No informado"}</p>
                <p>Asistencias: ${empleado.asistencias.length}</p>

                <button onclick="editarEmpleado(${indice})">Editar</button>
                <button onclick="registrarAsistencia(${indice})">Registrar asistencia</button>
                <button onclick="asignarTareaEmpleado(${indice})">Asignar tarea</button>
                <button onclick="eliminarEmpleado(${indice})">Eliminar</button>
            </div>
        `;
    });
}

// EDITAR EMPLEADO
function editarEmpleado(indice) {
    const empleado = empleados[indice];
    if (!empleado) return;

    indiceEdicionEmpleado = indice;

    document.getElementById("nombreEmpleado").value = empleado.nombre;
    document.getElementById("puestoEmpleado").value = empleado.puesto;
    document.getElementById("telefonoEmpleado").value = empleado.telefono || "";
    document.getElementById("correoEmpleado").value = empleado.correo || "";

    document.getElementById("formulario-empleado").style.display = "block";
}

// REGISTRAR ASISTENCIA
async function registrarAsistencia(indice) {
    const empleado = empleados[indice];
    if (!empleado) return;

    const hoy = new Date().toISOString().slice(0, 10);

    if (empleado.asistencias.includes(hoy)) {
        alert("La asistencia de hoy ya está registrada.");
        return;
    }

    try {
        const respuesta = await fetch(API_ASISTENCIAS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                empleado_id: empleado.id,
                fecha: hoy
            })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.error || "No se pudo registrar la asistencia.");
        }

        await cargarEmpleados();
        alert("Asistencia registrada correctamente.");

    } catch (error) {
        alert(error.message);
    }
}

// ELIMINAR EMPLEADO
async function eliminarEmpleado(indice) {
    const empleado = empleados[indice];

    if (!empleado || !confirm("¿Eliminar este empleado?")) return;

    try {
        const respuesta = await fetch(`${API_EMPLEADOS}/${empleado.id}`, {
            method: "DELETE"
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.error || "No se pudo eliminar el empleado.");
        }

        await cargarEmpleados();
        alert("Empleado eliminado correctamente.");

    } catch (error) {
        alert(error.message);
    }
}

// ASIGNAR TAREA A UN EMPLEADO
function asignarTareaEmpleado(indice) {
    const empleado = empleados[indice];
    if (!empleado) return;

    mostrar("tareas");

    document.getElementById("responsableTarea").value = empleado.nombre;
    mostrarFormularioTarea();
}

// =====================================
// REPORTES GENERALES
// =====================================

function mostrarReportes() {

    const totalProductos = productos.length;

    const totalStock = productos.reduce(
        (total, producto) => total + Number(producto.stock || 0), 0
    );

    const totalProduccion = producciones.reduce(
        (total, produccion) => total + Number(produccion.cantidad || 0), 0
    );

    const totalVentas = ventas.reduce(
        (total, venta) => total + Number(venta.total || 0), 0
    );

    const totalUvaRecibida = recepciones.reduce(
        (total, recepcion) => total + Number(recepcion.cantidad || 0), 0
    );

    const tareasCompletadas = tareas.filter(
        tarea => tarea.estado === "Completada"
    ).length;

    document.getElementById("reporteProductos").textContent = totalProductos;
    document.getElementById("reporteStock").textContent = totalStock;
    document.getElementById("reporteProduccion").textContent = totalProduccion;

    document.getElementById("reporteVentas").textContent =
        "$" + totalVentas.toLocaleString("es-AR");

    document.getElementById("reporteUvas").textContent = totalUvaRecibida;
    document.getElementById("reporteTareas").textContent = tareasCompletadas;

    // Producción agrupada por variedad/producto
    const resumenProduccion = {};

    producciones.forEach(produccion => {
        const nombre = produccion.producto || "Sin especificar";

        resumenProduccion[nombre] =
            (resumenProduccion[nombre] || 0) +
            Number(produccion.cantidad || 0);
    });

    const tabla = document.getElementById("lista-reporte-produccion");

    if (tabla) {
        tabla.innerHTML = "";

        Object.entries(resumenProduccion).forEach(([producto, cantidad]) => {
            tabla.innerHTML += `
                <tr>
                    <td>${producto}</td>
                    <td>${cantidad}</td>
                </tr>
            `;
        });
    }
}


document.addEventListener("DOMContentLoaded", async () => {
    await cargarProductos();
    await cargarLotes();
    await cargarProducciones();
    await cargarVentas();
    await cargarTareas();
    await cargarVinedos();
    await cargarRecepciones();
    await cargarEmpleados();
});

function generarReportePDF() {

    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("Error: la biblioteca jsPDF no se cargó.");
        return;
    }

    const jsPDF = window.jspdf.jsPDF;
    const pdf = new jsPDF();

    pdf.setFontSize(18);
    pdf.text("Reporte del Sistema de Gestion de Bodega", 15, 20);

    pdf.setFontSize(12);

    const datos = [
        ["Productos registrados", "reporteProductos"],
        ["Unidades en stock", "reporteStock"],
        ["Litros producidos", "reporteProduccion"],
        ["Total de ventas", "reporteVentas"],
        ["Kg de uvas recibidos", "reporteUvas"],
        ["Tareas completadas", "reporteTareas"]
    ];

    let y = 40;

    pdf.text("Fecha: " + new Date().toLocaleDateString("es-AR"), 15, 30);

    datos.forEach(([titulo, id]) => {
        const elemento = document.getElementById(id);

        if (elemento) {
            pdf.text(titulo + ": " + elemento.textContent, 15, y);
            y += 12;
        }
    });

    pdf.save("Reporte_SGB.pdf");
}
