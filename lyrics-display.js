class LyricsDisplay {
    constructor(lyricsTextElement, currentSongTitleElement) {
        this.lyricsText = lyricsTextElement;
        this.currentSongTitle = currentSongTitleElement;
    }

    display(song) {
        this.currentSongTitle.textContent = `${song.id}. ${song.title}`;
        this.lyricsText.innerHTML = '';
        
        const lines = song.lyrics.split('\n');
        const fragment = document.createDocumentFragment();
        
        lines.forEach((line, index) => {
            if (line.trim()) {
                const p = document.createElement('p');
                p.textContent = line;
                p.style.margin = '10px 0';
                p.style.lineHeight = '1.6';
                p.style.opacity = '0';
                p.style.animation = `fadeIn 0.5s ease forwards ${index * 0.08}s`;
                
                if (line.includes('QUECHUA:')) {
                    this.styleHeader(p, '#3498db');
                } else if (line.includes('CASTELLANO:')) {
                    this.styleHeader(p, '#2ecc71');
                } else if (line.includes('----------------------------------------')) {
                    this.styleDivider(p);
                } else {
                    this.styleLyricLine(p, line.includes('QUECHUA:') ? '#3498db' : '#2c3e50');
                }
                
                fragment.appendChild(p);
            }
        });
        
        this.lyricsText.appendChild(fragment);
        
        // Agregar estilos de animación
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    styleHeader(element, color) {
        Object.assign(element.style, {
            fontSize: '1.4rem',
            fontWeight: 'bold',
            color: color,
            textAlign: 'center',
            marginTop: '20px',
            marginBottom: '15px',
            letterSpacing: '1px'
        });
    }

    styleDivider(element) {
        Object.assign(element.style, {
            textAlign: 'center',
            margin: '30px 0',
            color: '#bdc3c7'
        });
    }

    styleLyricLine(element, color) {
        Object.assign(element.style, {
            color: color,
            padding: '5px 10px',
            borderRadius: '4px',
            transition: 'background-color 0.3s ease'
        });

        element.addEventListener('mouseover', () => {
            element.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
        });

        element.addEventListener('mouseout', () => {
            element.style.backgroundColor = 'transparent';
        });
    }
} 