// Registrar el Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registrado con éxito:', registration.scope);
            })
            .catch(error => {
                console.log('Error al registrar ServiceWorker:', error);
            });
    });

    // Mostrar mensaje cuando esté offline/online
    window.addEventListener('online', () => {
        document.getElementById('offlineMessage').style.display = 'none';
    });
    
    window.addEventListener('offline', () => {
        document.getElementById('offlineMessage').style.display = 'block';
    });
}
