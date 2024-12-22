class SongManager {
    constructor() {
        this.songs = [];
        this.currentSong = null;
        this.searchInput = document.getElementById('searchInput');
        this.songList = document.getElementById('songList');
        this.lyricsContainer = document.getElementById('lyricsContainer');
        this.currentSongTitle = document.getElementById('currentSongTitle');
        this.quechuaLyrics = document.getElementById('quechuaLyrics');
        this.castellanoLyrics = document.getElementById('castellanoLyrics');
        
        this.init();
        this.setupHistoryHandling();
    }

    async init() {
        try {
            const response = await fetch('letras.json');
            if (!response.ok) throw new Error('Error al cargar las letras');
            const data = await response.json();
            this.songs = Array.isArray(data.himnos) ? data.himnos : [];
            if (this.songs.length === 0) {
                console.error('No se encontraron himnos en el archivo');
                return;
            }
            this.renderSongList();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error:', error);
            this.songList.innerHTML = '<li class="error-message">Error al cargar los himnos. Por favor, intente más tarde.</li>';
        }
    }

    setupHistoryHandling() {
        // Agregar estado inicial
        history.replaceState({ view: 'list' }, '');

        // Manejar eventos de navegación
        window.addEventListener('popstate', (event) => {
            const state = event.state || { view: 'list' };
            if (state.view === 'list') {
                this.showSongList(false);
            } else if (state.view === 'lyrics' && state.songId) {
                const song = this.songs.find(s => s.numero === state.songId);
                if (song) {
                    this.displayLyrics(song, false);
                }
            }
        });
    }

    setupEventListeners() {
        this.searchInput.addEventListener('input', () => this.handleSearch());
        
        // Agregar botón para volver a la lista
        const backButton = document.createElement('button');
        backButton.textContent = 'Volver a la lista';
        backButton.className = 'button back-button';
        backButton.addEventListener('click', () => {
            history.back();
        });
        this.lyricsContainer.insertBefore(backButton, this.lyricsContainer.firstChild);
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
            this.songList.innerHTML = '<li class="empty-message">No se encontraron himnos</li>';
            return;
        }
        
        songs.forEach(song => {
            const li = document.createElement('li');
            li.textContent = `${song.numero}. ${song.titulo}`;
            li.addEventListener('click', () => this.displayLyrics(song, true));
            this.songList.appendChild(li);
        });
    }

    displayLyrics(song, addToHistory = true) {
        this.currentSong = song;
        this.currentSongTitle.textContent = `${song.numero}. ${song.titulo}`;
        
        // Mostrar letras en quechua
        this.quechuaLyrics.innerHTML = '';
        if (song.letra && song.letra.quechua) {
            song.letra.quechua.forEach((line, index) => {
                if (line.trim()) {
                    const p = document.createElement('p');
                    p.className = 'lyrics-line quechua-line';
                    p.style.setProperty('--line-index', index);
                    p.textContent = line;
                    this.quechuaLyrics.appendChild(p);
                }
            });
        }

        // Mostrar letras en castellano
        this.castellanoLyrics.innerHTML = '';
        if (song.letra && song.letra.castellano) {
            song.letra.castellano.forEach((line, index) => {
                if (line.trim()) {
                    const p = document.createElement('p');
                    p.className = 'lyrics-line castellano-line';
                    p.style.setProperty('--line-index', index);
                    p.textContent = line;
                    this.castellanoLyrics.appendChild(p);
                }
            });
        }

        // Mostrar el contenedor de letras
        this.lyricsContainer.style.display = 'block';
        this.songList.style.display = 'none';

        // Agregar a la historia del navegador
        if (addToHistory) {
            history.pushState(
                { view: 'lyrics', songId: song.numero },
                '',
                `#himno-${song.numero}`
            );
        }

        // Hacer scroll al inicio
        window.scrollTo(0, 0);
    }

    showSongList(addToHistory = true) {
        this.lyricsContainer.style.display = 'none';
        this.songList.style.display = 'block';
        
        if (addToHistory) {
            history.pushState({ view: 'list' }, '', './');
        }

        // Limpiar la búsqueda
        this.searchInput.value = '';
        this.renderSongList();
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    const songManager = new SongManager();
}); 