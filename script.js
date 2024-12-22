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
    }

    async init() {
        try {
            const response = await fetch('letras.json');
            if (!response.ok) throw new Error('Error al cargar las letras');
            const data = await response.json();
            // Asegurarnos de que data.himnos es un array
            this.songs = Array.isArray(data.himnos) ? data.himnos : [];
            if (this.songs.length === 0) {
                console.error('No se encontraron himnos en el archivo');
                return;
            }
            this.renderSongList();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error:', error);
            // Mostrar mensaje de error al usuario
            this.songList.innerHTML = '<li class="error-message">Error al cargar los himnos. Por favor, intente más tarde.</li>';
        }
    }

    setupEventListeners() {
        this.searchInput.addEventListener('input', () => this.handleSearch());
        // Agregar botón para volver a la lista
        const backButton = document.createElement('button');
        backButton.textContent = 'Volver a la lista';
        backButton.className = 'button back-button';
        backButton.addEventListener('click', () => this.showSongList());
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
            li.addEventListener('click', () => this.displayLyrics(song));
            this.songList.appendChild(li);
        });
    }

    displayLyrics(song) {
        this.currentSong = song;
        this.currentSongTitle.textContent = `${song.numero}. ${song.titulo}`;
        
        // Mostrar letras en quechua
        this.quechuaLyrics.innerHTML = '';
        if (song.letra && song.letra.quechua) {
            song.letra.quechua.forEach(line => {
                if (line.trim()) {
                    const p = document.createElement('p');
                    p.className = 'lyrics-line quechua-line';
                    p.textContent = line;
                    this.quechuaLyrics.appendChild(p);
                }
            });
        }

        // Mostrar letras en castellano
        this.castellanoLyrics.innerHTML = '';
        if (song.letra && song.letra.castellano) {
            song.letra.castellano.forEach(line => {
                if (line.trim()) {
                    const p = document.createElement('p');
                    p.className = 'lyrics-line castellano-line';
                    p.textContent = line;
                    this.castellanoLyrics.appendChild(p);
                }
            });
        }

        // Mostrar el contenedor de letras
        this.lyricsContainer.style.display = 'block';
        this.songList.style.display = 'none';
    }

    showSongList() {
        this.lyricsContainer.style.display = 'none';
        this.songList.style.display = 'block';
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    const songManager = new SongManager();
}); 