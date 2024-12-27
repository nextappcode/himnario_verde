// Cargar y mostrar los himnos
let himnosData = []; // Variable global para almacenar los himnos

async function cargarHimnos() {
    try {
        const response = await fetch('letras.json');
        const data = await response.json();
        himnosData = data.himnos; // Guardamos los himnos en la variable global
        mostrarHimnos(himnosData);
        configurarBusqueda();
    } catch (error) {
        console.error('Error al cargar los himnos:', error);
    }
}

// Función para filtrar himnos
function filtrarHimnos(query) {
    if (!query) return himnosData;
    
    query = query.toLowerCase().trim();
    return himnosData.filter(himno => {
        const numero = himno.numero.toString();
        const tituloQuechua = (himno.titulo_quechua || himno.titulo || '').toLowerCase();
        const tituloCastellano = (himno.titulo_castellano || '').toLowerCase();
        
        return numero.includes(query) || 
               tituloQuechua.includes(query) || 
               tituloCastellano.includes(query);
    });
}

// Configurar la búsqueda en tiempo real
function configurarBusqueda() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const query = this.value;
        const himnosFiltrados = filtrarHimnos(query);
        mostrarHimnos(himnosFiltrados);
    });
}

// Función para actualizar los himnos periódicamente
async function actualizarHimnos() {
    try {
        const response = await fetch('letras.json');
        const data = await response.json();
        const songList = document.getElementById('songList');
        
        // Solo actualizar si hay cambios
        const currentContent = songList.innerHTML;
        const tempDiv = document.createElement('div');
        mostrarHimnos(data.himnos, tempDiv);
        
        if (tempDiv.innerHTML !== currentContent) {
            himnosData = data.himnos; // Actualizamos los datos globales
            const searchInput = document.getElementById('searchInput');
            const query = searchInput ? searchInput.value : '';
            const himnosFiltrados = filtrarHimnos(query);
            mostrarHimnos(himnosFiltrados);
        }
    } catch (error) {
        console.error('Error al actualizar los himnos:', error);
    }
}

// Mostrar los himnos en la interfaz
function mostrarHimnos(himnos, container = document.getElementById('songList')) {
    container.innerHTML = '';
    himnos.sort((a, b) => parseInt(a.numero) - parseInt(b.numero));

    himnos.forEach(himno => {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';
        
        const songNumber = document.createElement('div');
        songNumber.className = 'song-number';
        songNumber.textContent = himno.numero;
        
        const songTitles = document.createElement('div');
        songTitles.className = 'song-titles';
        
        const tituloQuechua = document.createElement('div');
        tituloQuechua.className = 'song-title quechua';
        tituloQuechua.textContent = himno.titulo_quechua || himno.titulo || '';
        tituloQuechua.style.cursor = 'pointer';
        tituloQuechua.dataset.numero = himno.numero;
        tituloQuechua.dataset.idioma = 'quechua';
        
        songTitles.appendChild(tituloQuechua);
        
        if (himno.titulo_castellano) {
            const tituloCastellano = document.createElement('div');
            tituloCastellano.className = 'song-title castellano';
            tituloCastellano.textContent = himno.titulo_castellano;
            tituloCastellano.style.cursor = 'pointer';
            tituloCastellano.dataset.numero = himno.numero;
            tituloCastellano.dataset.idioma = 'castellano';
            songTitles.appendChild(tituloCastellano);
        }
        
        const songButtons = document.createElement('div');
        songButtons.className = 'song-buttons';
        
        const btnQuechua = document.createElement('button');
        btnQuechua.className = 'btn-quechua';
        btnQuechua.textContent = 'Quechua';
        btnQuechua.dataset.numero = himno.numero;
        btnQuechua.dataset.idioma = 'quechua';
        
        const btnCastellano = document.createElement('button');
        btnCastellano.className = 'btn-castellano';
        btnCastellano.textContent = 'Castellano';
        btnCastellano.dataset.numero = himno.numero;
        btnCastellano.dataset.idioma = 'castellano';
        
        songButtons.appendChild(btnQuechua);
        songButtons.appendChild(btnCastellano);
        
        songCard.appendChild(songNumber);
        songCard.appendChild(songTitles);
        songCard.appendChild(songButtons);
        
        container.appendChild(songCard);
    });

    // Agregar event listeners después de crear los elementos
    container.querySelectorAll('.song-title, .btn-quechua, .btn-castellano').forEach(element => {
        element.addEventListener('click', function() {
            const numero = this.dataset.numero;
            const idioma = this.dataset.idioma;
            mostrarLetra(numero, idioma);
        });
    });
}

// Función para mostrar la letra
async function mostrarLetra(numero, idioma) {
    try {
        const response = await fetch('letras.json');
        const data = await response.json();
        const himno = data.himnos.find(h => h.numero === numero.toString());
        
        if (himno && himno.letra && himno.letra[idioma]) {
            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');
            modalContent.innerHTML = '';
            
            // Agregar estado al historial antes de mostrar el modal
            window.history.pushState({ modal: true }, '');
            
            // Header con número y títulos
            const header = document.createElement('div');
            header.className = 'modal-header';
            
            const numeroTitulo = document.createElement('div');
            numeroTitulo.className = 'numero-titulo';
            numeroTitulo.textContent = `${numero}.`;
            
            const titulos = document.createElement('div');
            titulos.className = 'titulos-container';
            
            const tituloCastellano = document.createElement('div');
            tituloCastellano.className = 'titulo-castellano';
            tituloCastellano.textContent = himno.titulo_castellano || '';
            
            const tituloQuechua = document.createElement('div');
            tituloQuechua.className = 'titulo-quechua';
            tituloQuechua.textContent = himno.titulo_quechua || himno.titulo || '';
            
            titulos.appendChild(tituloCastellano);
            titulos.appendChild(tituloQuechua);
            
            header.appendChild(numeroTitulo);
            header.appendChild(titulos);
            
            // Contenedor de pestañas de idioma
            const languageTabs = document.createElement('div');
            languageTabs.className = 'language-tabs';
            
            // Pestaña Quechua
            const quechuaTab = document.createElement('div');
            quechuaTab.className = `tab ${idioma === 'quechua' ? 'active' : ''}`;
            quechuaTab.innerHTML = '<span class="tab-icon">👤</span> Quechua';
            quechuaTab.dataset.numero = numero;
            quechuaTab.dataset.idioma = 'quechua';
            
            // Pestaña Castellano
            const castellanoTab = document.createElement('div');
            castellanoTab.className = `tab ${idioma === 'castellano' ? 'active' : ''}`;
            castellanoTab.innerHTML = '<span class="tab-icon">📄</span> Castellano';
            castellanoTab.dataset.numero = numero;
            castellanoTab.dataset.idioma = 'castellano';
            
            languageTabs.appendChild(quechuaTab);
            languageTabs.appendChild(castellanoTab);
            
            // Agregar event listeners a las pestañas
            [quechuaTab, castellanoTab].forEach(tab => {
                tab.addEventListener('click', function() {
                    mostrarLetra(this.dataset.numero, this.dataset.idioma);
                });
            });
            
            // Contenedor de letra
            const lyricsContainer = document.createElement('div');
            lyricsContainer.className = 'lyrics-container';
            
            // Agregar cada línea de la letra
            himno.letra[idioma].forEach((linea, index) => {
                const lineaElement = document.createElement('div');
                lineaElement.className = 'lyrics-line';
                lineaElement.textContent = linea;
                lyricsContainer.appendChild(lineaElement);
            });
            
            modalContent.appendChild(header);
            modalContent.appendChild(languageTabs);
            modalContent.appendChild(lyricsContainer);
            
            // Mostrar el modal con animación
            modal.classList.add('active');
        }
    } catch (error) {
        console.error('Error al cargar la letra:', error);
    }
}

// Configurar eventos al cargar el documento
function configurarEventos() {
    // Cerrar modal al hacer clic fuera
    const modal = document.getElementById('modal');
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            cerrarModal();
        }
    });

    // Manejar el botón atrás del navegador
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.modal) {
            // Si hay un estado del modal, mantener en la aplicación
            window.history.pushState({ modal: true }, '');
        } else {
            cerrarModal();
        }
    });
}

// Función para cerrar el modal
function cerrarModal() {
    const modal = document.getElementById('modal');
    if (modal.classList.contains('active')) {
        modal.classList.remove('active');
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    cargarHimnos();
    configurarEventos();
    
    // Agregar estado inicial al historial
    window.history.replaceState({ modal: false }, '');
    
    // Actualizar cada 5 segundos
    setInterval(actualizarHimnos, 5000);
}); 