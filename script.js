class SongManager {
    constructor() {
        this.songs = [];
        this.currentSong = null;
        this.searchInput = document.getElementById('searchInput');
        this.songList = document.getElementById('songList');
        this.lyricsContainer = document.getElementById('lyricsOverlay');
        this.currentSongTitle = document.getElementById('currentSongTitle');
        this.quechuaLyrics = document.getElementById('quechuaLyrics');
        this.castellanoLyrics = document.getElementById('castellanoLyrics');
        this.closeLyricsButton = document.getElementById('closeLyrics');
        this.modalOpen = false;
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        this.hasUserInteracted = false;
        
        this.init();
        this.setupTabNavigation();
        this.setupModalClose();
        if (this.isMobile) {
            this.setupMobileNavigation();
        }
    }

    async init() {
        try {
            const response = await fetch('letras.json');
            const data = await response.json();
            this.songs = data.himnos;
            
            console.log(`Himnos cargados: ${this.songs.length}`);
            this.renderSongList();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error cargando los himnos:', error);
            this.songList.innerHTML = '<div class="empty-message">Error al cargar los himnos</div>';
        }
    }

    setupEventListeners() {
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.closeLyricsButton.addEventListener('click', () => this.showSongList());
    }

    handleSearch() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const filteredSongs = this.songs.filter(song => 
            song.numero.toString().includes(searchTerm) ||
            song.titulo.toLowerCase().includes(searchTerm)
        );
        this.renderSongList(filteredSongs);
    }

    renderSongList(songs = this.songs) {
        this.songList.innerHTML = '';
        
        if (!Array.isArray(songs) || songs.length === 0) {
            this.songList.innerHTML = '<div class="empty-message">No se encontraron himnos</div>';
            return;
        }
        
        songs.forEach(song => {
            const card = document.createElement('div');
            card.className = 'song-card';
            
            card.innerHTML = `
                <div class="song-number-wrapper">
                    <span class="song-number">${song.numero}</span>
                </div>
                <div class="song-info">
                    <h3 class="song-title">${song.titulo}</h3>
                    <div class="song-languages">
                        ${song.letra.quechua ? '<span class="language-tag">Quechua</span>' : ''}
                        ${song.letra.castellano ? '<span class="language-tag">Castellano</span>' : ''}
                    </div>
                </div>
            `;
            
            card.addEventListener('click', () => this.displayLyrics(song));
            this.songList.appendChild(card);
        });
    }

    displayLyrics(song) {
        this.currentSong = song;
        this.currentSongTitle.textContent = `${song.numero}. ${song.titulo}`;
        this.hasUserInteracted = true;
        
        // Mostrar letras en quechua
        this.quechuaLyrics.innerHTML = '';
        if (song.letra.quechua) {
            song.letra.quechua.forEach(line => {
                if (line.trim()) {
                    const p = document.createElement('p');
                    p.className = 'lyrics-line';
                    p.textContent = line;
                    this.quechuaLyrics.appendChild(p);
                }
            });
        }

        // Mostrar letras en castellano
        this.castellanoLyrics.innerHTML = '';
        if (song.letra.castellano) {
            song.letra.castellano.forEach(line => {
                if (line.trim()) {
                    const p = document.createElement('p');
                    p.className = 'lyrics-line';
                    p.textContent = line;
                    this.castellanoLyrics.appendChild(p);
                }
            });
        }

        // Mostrar el modal y actualizar historial
        this.lyricsContainer.classList.add('active');
        this.modalOpen = true;
        history.pushState({ modal: true }, '', window.location.pathname);
    }

    showSongList() {
        this.lyricsContainer.classList.remove('active');
        this.modalOpen = false;
        if (this.hasUserInteracted) {
            history.pushState({ list: true }, '', window.location.pathname);
        }
    }

    setupTabNavigation() {
        const tabs = document.querySelectorAll('.tab');
        const sections = document.querySelectorAll('.lyrics-section');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                // Actualizar tabs
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Actualizar secciones
                sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === `${targetTab}Lyrics`) {
                        section.classList.add('active');
                    }
                });
            });
        });
    }

    setupModalClose() {
        // Cerrar al hacer clic en el botón X
        this.closeLyricsButton.addEventListener('click', () => {
            if (this.modalOpen) {
                this.showSongList();
            }
        });
        
        // Cerrar al hacer clic fuera del modal
        this.lyricsContainer.addEventListener('click', (event) => {
            if (event.target === this.lyricsContainer && this.modalOpen) {
                this.showSongList();
            }
        });

        // Agregar manejador de tecla Escape
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.modalOpen) {
                this.showSongList();
            }
        });
    }

    setupMobileNavigation() {
        let backPressCount = 0;
        let backPressTimer;

        // Manejar el botón de retroceso
        window.addEventListener('popstate', (event) => {
            event.preventDefault();

            if (this.modalOpen) {
                // Si el modal está abierto, simplemente cerrarlo
                this.showSongList();
            } else {
                // Lógica de doble toque para salir
                backPressCount++;
                
                if (backPressCount === 1) {
                    // Primer toque del botón atrás
                    window.alert('Presiona atrás nuevamente para salir de la aplicación');
                    
                    // Reiniciar el contador después de 2 segundos
                    backPressTimer = setTimeout(() => {
                        backPressCount = 0;
                    }, 2000);

                    // Mantener al usuario en la aplicación
                    history.pushState({ list: true }, '', window.location.pathname);
                } else if (backPressCount === 2) {
                    // Segundo toque dentro del tiempo límite
                    clearTimeout(backPressTimer);
                    if (window.confirm('¿Estás seguro que deseas salir de la aplicación?')) {
                        window.close();
                        // Si window.close() no funciona (común en móviles)
                        window.location.href = 'about:blank';
                    } else {
                        // Si cancela, reiniciar contador y mantener en la app
                        backPressCount = 0;
                        history.pushState({ list: true }, '', window.location.pathname);
                    }
                }
            }
        });

        // Inicializar el historial
        if (!this.modalOpen) {
            history.pushState({ list: true }, '', window.location.pathname);
        }
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando aplicación...');
    const songManager = new SongManager();
}); 