// js/intro.js - VERSIÓN SIN LOCALSTORAGE (intro siempre visible)
document.addEventListener('DOMContentLoaded', function() {
    console.log('Intro - Video interactivo');
    
    const introSection = document.getElementById('intro-section');
    const videoContainer = document.getElementById('video-container');
    const introVideo = document.getElementById('intro-video');
    const mainContent = document.getElementById('main-content');
    const backgroundAudio = document.getElementById('background-audio');
    const musicToggle = document.getElementById('music-toggle'); // Añadimos referencia
    
    let videoStarted = false;
    let introCompleted = false;
    
    // Función para actualizar el icono de música
    function updateMusicIcon(isPlaying) {
        if (musicToggle) {
            const icon = musicToggle.querySelector('i');
            if (icon) {
                icon.className = isPlaying ? 'fas fa-volume-up' : 'fas fa-volume-mute';
            }
        }
    }
    
    // Función para completar la intro
    function completeIntro() {
        if (introCompleted) return;
        introCompleted = true;
        
        console.log('Completando intro...');
        
        // Fade out de la intro
        if (introSection) {
            introSection.style.opacity = '0';
            introSection.style.transition = 'opacity 0.8s ease';
            
            setTimeout(() => {
                introSection.classList.add('hidden');
                
                // Quitar la clase que bloquea el scroll
                document.body.classList.remove('no-scroll');
                
                // Mostrar contenido principal
                if (mainContent) {
                    mainContent.classList.remove('hidden');
                    mainContent.style.opacity = '0';
                    mainContent.style.animation = 'fadeIn 1s ease forwards';
                    
                    // Forzar reflow para activar animación
                    void mainContent.offsetWidth;
                }
            }, 800);
        }
    }
    
    // Función para saltar la intro (por si acaso)
    function skipIntro() {
        if (introCompleted) return;
        
        console.log('Saltando intro...');
        introCompleted = true;
        
        // Pausar video si está reproduciéndose
        if (introVideo) {
            introVideo.pause();
        }
        
        // Ocultar intro inmediatamente
        if (introSection) {
            introSection.classList.add('hidden');
        }
        
        // Quitar la clase que bloquea el scroll
        document.body.classList.remove('no-scroll');
        
        // Mostrar contenido principal
        if (mainContent) {
            mainContent.classList.remove('hidden');
            mainContent.style.opacity = '1';
            
            // Forzar reflow para asegurar que se muestre
            void mainContent.offsetWidth;
        }
    }
    
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
    
    // 3. AL INTERACTUAR - REPRODUCIR VIDEO Y AUDIO
    function startVideoOnTouch() {
        if (videoStarted) return;
        videoStarted = true;
        
        console.log('🎬 Iniciando video...');
        
        // Reproducir música de fondo
        if (backgroundAudio) {
            backgroundAudio.volume = 1.0;
            backgroundAudio.play()
                .then(() => {
                    console.log('✅ Música reproduciéndose');
                    // Actualizar el icono a "sonido activo"
                    updateMusicIcon(true);
                })
                .catch(e => {
                    console.log('🔇 Audio bloqueado, necesita interacción');
                    // Si no se puede reproducir, mantener el icono de silencio
                    updateMusicIcon(false);
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
                    setTimeout(completeIntro, 3000);
                });
        }
        
        // Remover listeners para evitar múltiples ejecuciones
        document.removeEventListener('click', startVideoOnTouch);
        document.removeEventListener('pointerup', startVideoOnTouch);
    }
    
    // 4. CONFIGURAR INTERACCIÓN EN TODA LA PANTALLA
    document.addEventListener('click', startVideoOnTouch);
    document.addEventListener('pointerup', startVideoOnTouch);
    
    // 5. CUANDO EL VIDEO TERMINA
    if (introVideo) {
        introVideo.addEventListener('ended', completeIntro);
        introVideo.addEventListener('error', completeIntro);
    }
});