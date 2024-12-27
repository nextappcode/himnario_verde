// Estado global
let himnos = [];

// Cargar himnos desde el archivo JSON
async function cargarHimnos() {
    try {
        const response = await fetch('../letras.json');
        const data = await response.json();
        himnos = data.himnos.map(himno => ({
            ...himno,
            titulo_quechua: himno.titulo || himno.titulo_quechua,
            titulo_castellano: himno.titulo_castellano || '',
        }));
        mostrarListaHimnos();
    } catch (error) {
        mostrarError('Error al cargar los himnos: ' + error.message);
    }
}

// Mostrar lista de himnos
function mostrarListaHimnos() {
    mostrarListaHimnosEnContenedor(himnos, document.getElementById('lista-himnos'));
}

// Función auxiliar para mostrar himnos en un contenedor específico
function mostrarListaHimnosEnContenedor(himnos, container) {
    container.innerHTML = '';
    
    himnos.sort((a, b) => parseInt(a.numero) - parseInt(b.numero));
    
    himnos.forEach((himno, index) => {
        const div = document.createElement('div');
        div.className = 'himno-item';
        
        const titulo = document.createElement('h3');
        titulo.textContent = `Himno ${himno.numero}`;
        
        const titulos = document.createElement('div');
        titulos.className = 'titulos';
        
        const tituloQuechua = document.createElement('p');
        tituloQuechua.innerHTML = `<strong>Título Quechua:</strong> ${himno.titulo_quechua}`;
        
        titulos.appendChild(tituloQuechua);
        
        if (himno.titulo_castellano) {
            const tituloCastellano = document.createElement('p');
            tituloCastellano.innerHTML = `<strong>Título Castellano:</strong> ${himno.titulo_castellano}`;
            titulos.appendChild(tituloCastellano);
        }
        
        const botones = document.createElement('div');
        botones.className = 'botones';
        
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.addEventListener('click', () => editarHimno(index));
        
        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.className = 'eliminar';
        btnEliminar.addEventListener('click', () => eliminarHimno(index));
        
        botones.appendChild(btnEditar);
        botones.appendChild(btnEliminar);
        
        div.appendChild(titulo);
        div.appendChild(titulos);
        div.appendChild(botones);
        
        container.appendChild(div);
    });
}

// Función para manejar las peticiones al servidor
async function guardarEnServidor(datos) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch('../guardar_cambios.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const resultado = await response.json();

        if (!resultado.success) {
            throw new Error(resultado.error || 'Error al guardar los cambios');
        }

        return resultado;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('La operación tardó demasiado tiempo');
        }
        throw error;
    }
}

// Función para preparar los datos para guardar
function prepararDatosParaGuardar() {
    const himnosParaGuardar = himnos.map(himno => ({
        ...himno,
        titulo_quechua: himno.titulo_quechua,
        titulo_castellano: himno.titulo_castellano || '',
    }));

    return { himnos: himnosParaGuardar };
}

// Función para recargar los datos
async function recargarDatos() {
    try {
        const response = await fetch('../letras.json');
        const data = await response.json();
        himnos = data.himnos.map(himno => ({
            ...himno,
            titulo_quechua: himno.titulo || himno.titulo_quechua,
            titulo_castellano: himno.titulo_castellano || '',
        }));
        mostrarListaHimnos();
    } catch (error) {
        mostrarError('Error al recargar los datos: ' + error.message);
    }
}

// Añadir nuevo himno
async function agregarHimno() {
    try {
        const numero = document.getElementById('nuevo-numero').value;
        const tituloQuechua = document.getElementById('nuevo-titulo-quechua').value;
        const tituloCastellano = document.getElementById('nuevo-titulo-castellano').value;
        const letraQuechua = document.getElementById('nueva-letra-quechua').value;
        const letraCastellano = document.getElementById('nueva-letra-castellano').value;

        if (!numero || !tituloQuechua || !letraQuechua || !letraCastellano) {
            throw new Error('Los campos número, título en quechua y letras son obligatorios');
        }

        const nuevoHimno = {
            numero: numero,
            titulo_quechua: tituloQuechua,
            titulo_castellano: tituloCastellano || '',
            letra: {
                quechua: letraQuechua.split('\n').filter(linea => linea.trim() !== ''),
                castellano: letraCastellano.split('\n').filter(linea => linea.trim() !== '')
            }
        };
        
        himnos.push(nuevoHimno);
        
        // Guardamos en el servidor
        try {
            const datos = prepararDatosParaGuardar();
            await guardarEnServidor(datos);
            await recargarDatos(); // Recargamos los datos después de guardar
            
            const formulario = document.querySelector('#formulario-nuevo form');
            if (formulario) {
                formulario.reset();
            }
            
            document.getElementById('formulario-nuevo').style.display = 'none';
            mostrarMensaje('Himno agregado correctamente');
        } catch (errorGuardado) {
            himnos.pop(); // Revertimos el cambio si falla el guardado
            console.error('Error al guardar:', errorGuardado);
            mostrarError('Error al guardar el himno: ' + errorGuardado.message);
        }
    } catch (error) {
        console.error('Error al agregar:', error);
        mostrarError('Error al agregar el himno: ' + error.message);
    }
}

// Editar himno existente
function editarHimno(index) {
    const himno = himnos[index];
    document.getElementById('editar-numero').value = himno.numero;
    document.getElementById('editar-titulo-quechua').value = himno.titulo_quechua;
    document.getElementById('editar-titulo-castellano').value = himno.titulo_castellano || '';
    document.getElementById('editar-letra-quechua').value = himno.letra.quechua.join('\n');
    document.getElementById('editar-letra-castellano').value = himno.letra.castellano.join('\n');
    
    document.getElementById('editor').style.display = 'block';
    document.getElementById('editor').dataset.indiceEdicion = index;
}

// Guardar edición de himno
async function guardarEdicion() {
    try {
        const index = document.getElementById('editor').dataset.indiceEdicion;
        const numero = document.getElementById('editar-numero').value;
        const tituloQuechua = document.getElementById('editar-titulo-quechua').value;
        const tituloCastellano = document.getElementById('editar-titulo-castellano').value;
        const letraQuechua = document.getElementById('editar-letra-quechua').value;
        const letraCastellano = document.getElementById('editar-letra-castellano').value;

        if (!numero || !tituloQuechua || !letraQuechua || !letraCastellano) {
            throw new Error('Los campos número, título en quechua y letras son obligatorios');
        }

        const himnoAnterior = { ...himnos[index] };
        
        himnos[index] = {
            numero: numero,
            titulo_quechua: tituloQuechua,
            titulo_castellano: tituloCastellano || '',
            letra: {
                quechua: letraQuechua.split('\n').filter(linea => linea.trim() !== ''),
                castellano: letraCastellano.split('\n').filter(linea => linea.trim() !== '')
            }
        };

        // Guardamos en el servidor
        try {
            const datos = prepararDatosParaGuardar();
            await guardarEnServidor(datos);
            await recargarDatos(); // Recargamos los datos después de guardar
            document.getElementById('editor').style.display = 'none';
            mostrarMensaje('Himno actualizado correctamente');
        } catch (errorGuardado) {
            himnos[index] = himnoAnterior; // Revertimos el cambio si falla el guardado
            console.error('Error al guardar:', errorGuardado);
            mostrarError('Error al guardar los cambios: ' + errorGuardado.message);
        }
    } catch (error) {
        console.error('Error en la edición:', error);
        mostrarError('Error al guardar la edición: ' + error.message);
    }
}

// Eliminar himno
async function eliminarHimno(index) {
    if (confirm('¿Estás seguro de que deseas eliminar este himno?')) {
        const himnoEliminado = himnos[index];
        himnos.splice(index, 1);
        
        try {
            const datos = prepararDatosParaGuardar();
            await guardarEnServidor(datos);
            await recargarDatos(); // Recargamos los datos después de eliminar
            mostrarMensaje('Himno eliminado correctamente');
        } catch (error) {
            himnos.splice(index, 0, himnoEliminado); // Revertimos la eliminación si falla
            mostrarListaHimnos();
            mostrarError('Error al eliminar el himno: ' + error.message);
        }
    }
}

// Funciones de utilidad para mensajes
function mostrarMensaje(mensaje) {
    const div = document.createElement('div');
    div.className = 'mensaje exito';
    div.textContent = mensaje;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function mostrarError(mensaje) {
    const div = document.createElement('div');
    div.className = 'mensaje error';
    div.textContent = mensaje;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// Función para actualizar los himnos periódicamente
async function actualizarHimnos() {
    try {
        const response = await fetch('../letras.json');
        const data = await response.json();
        const listaActual = document.getElementById('lista-himnos').innerHTML;
        
        // Crear un div temporal para comparar el contenido
        const tempDiv = document.createElement('div');
        const himnosTemp = data.himnos.map(himno => ({
            ...himno,
            titulo_quechua: himno.titulo || himno.titulo_quechua,
            titulo_castellano: himno.titulo_castellano || '',
        }));
        mostrarListaHimnosEnContenedor(himnosTemp, tempDiv);
        
        // Solo actualizar si hay cambios
        if (tempDiv.innerHTML !== listaActual) {
            himnos = himnosTemp;
            mostrarListaHimnos();
        }
    } catch (error) {
        console.error('Error al actualizar los himnos:', error);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    cargarHimnos();
    
    // Cerrar modales al hacer clic fuera de ellos
    window.onclick = function(event) {
        if (event.target.classList.contains('editor')) {
            event.target.style.display = 'none';
        }
    };
    
    // Actualizar cada 5 segundos
    setInterval(actualizarHimnos, 5000);
}); 