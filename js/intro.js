// js/intro.js - VERSIÓN SIN LOADING OVERLAY
document.addEventListener('DOMContentLoaded', function() {
    console.log('Intro - Video interactivo');
    
    const introSection = document.getElementById('intro-section');
    const videoContainer = document.getElementById('video-container');
    const introVideo = document.getElementById('intro-video');
    const mainContent = document.getElementById('main-content');
    const backgroundAudio = document.getElementById('background-audio');
    
    let videoStarted = false;
    
    // 1. MOSTRAR EL VIDEO INMEDIATAMENTE
    if (videoContainer) {
        videoContainer.style.display = 'block';
        videoContainer.style.opacity = '1';
    }
    
    // 2. PREPARAR VIDEO PARA REPRODUCCIÓN
    if (introVideo) {
        // Precargar video
        introVideo.load();
        
        // Cuando el video esté listo
        introVideo.addEventListener('loadeddata', function() {
            console.log('Video cargado y listo');
        });
    }
    
    // 3. AL TOCAR CUALQUIER PARTE - REPRODUCIR VIDEO
    function startVideoOnTouch(e) {
        if (videoStarted) return;
        videoStarted = true;
        
        console.log('🎬 Iniciando video...');
        
        // Reproducir música de fondo
        if (backgroundAudio) {
            backgroundAudio.volume = 0.3;
            backgroundAudio.play().catch(e => {
                console.log('🔇 Audio bloqueado, necesita interacción');
            });
        }
        
        // Reproducir video
        if (introVideo) {
            introVideo.play()
                .then(() => {
                    console.log('✅ Video reproduciéndose');
                })
                .catch(error => {
                    console.log('❌ Error en video:', error);
                    // Si falla, mostrar contenido después de 3 segundos
                    setTimeout(showMainContent, 3000);
                });
        }
        
        // Remover listeners para evitar múltiples ejecuciones
        document.removeEventListener('click', startVideoOnTouch);
        document.removeEventListener('touchstart', startVideoOnTouch);
    }
    
    // 4. CONFIGURAR INTERACCIÓN EN TODA LA PANTALLA
    document.addEventListener('click', startVideoOnTouch);
    document.addEventListener('touchstart', startVideoOnTouch);
    
    // 5. CUANDO EL VIDEO TERMINA
    if (introVideo) {
        introVideo.addEventListener('ended', showMainContent);
        introVideo.addEventListener('error', showMainContent);
    }
    
    // 6. MOSTRAR CONTENIDO PRINCIPAL
    function showMainContent() {
        console.log('🏠 Mostrando contenido principal');
        
        if (introSection) {
            // Fade out suave
            introSection.style.opacity = '0';
            introSection.style.transition = 'opacity 0.8s ease';
            
            setTimeout(() => {
                introSection.style.display = 'none';
                
                // Mostrar contenido principal con fade in
                if (mainContent) {
                    mainContent.classList.remove('hidden');
                    mainContent.style.opacity = '0';
                    mainContent.style.animation = 'fadeIn 1s ease forwards';
                }
            }, 800);
        }
    }
    
    // 7. BOTÓN DE MÚSICA (OPCIONAL)
    const musicToggle = document.getElementById('music-toggle');
    if (musicToggle && backgroundAudio) {
        musicToggle.style.display = 'flex';
        musicToggle.addEventListener('click', function() {
            if (backgroundAudio.paused) {
                backgroundAudio.play();
                this.querySelector('i').className = 'fas fa-volume-up';
            } else {
                backgroundAudio.pause();
                this.querySelector('i').className = 'fas fa-volume-mute';
            }
        });
    }
});