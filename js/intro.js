// js/intro.js - VERSIÓN CON VIDEO SIMPLE
document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando intro con video...');
    
    // Elementos básicos
    const introSection = document.getElementById('intro-section');
    const videoContainer = document.getElementById('video-container');
    const introVideo = document.getElementById('intro-video');
    const skipButton = document.getElementById('skip-intro');
    const loadingOverlay = document.getElementById('loading-overlay');
    const mainContent = document.getElementById('main-content');
    const backgroundAudio = document.getElementById('background-audio');
    
    let introCompleted = false;
    
    // 1. OCULTAR PANTALLA DE CARGA RÁPIDAMENTE
    setTimeout(() => {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
            loadingOverlay.classList.add('hidden');
        }
    }, 500);
    
    // 2. INICIAR TODO AUTOMÁTICAMENTE
    function startIntroAutomatically() {
        console.log('Iniciando intro automáticamente...');
        
        // Iniciar música de fondo (con muted primero para evitar bloqueos)
        if (backgroundAudio) {
            // Primero intentar con volumen muy bajo
            backgroundAudio.volume = 0.1;
            backgroundAudio.muted = false;
            
            // Intentar reproducir
            const playPromise = backgroundAudio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('Audio iniciado correctamente');
                        // Aumentar volumen gradualmente
                        setTimeout(() => {
                            backgroundAudio.volume = 0.3;
                        }, 1000);
                    })
                    .catch(error => {
                        console.log('Audio bloqueado, se necesitará interacción:', error);
                        // Mostrar instrucción para interactuar
                        showInteractionPrompt();
                    });
            }
        }
        
        // Iniciar video
        if (introVideo) {
            // Quitar muted para que tenga audio si el video lo tiene
            introVideo.muted = false;
            
            // Reproducir video
            introVideo.play()
                .then(() => {
                    console.log('Video reproduciéndose');
                })
                .catch(error => {
                    console.log('Video bloqueado:', error);
                    // Si el video falla, mostrar imagen estática
                    showStaticEnvelope();
                });
        }
    }
    
    // 3. CUANDO EL VIDEO TERMINA
    if (introVideo) {
        introVideo.addEventListener('ended', function() {
            console.log('Video terminado, completando intro...');
            completeIntro();
        });
        
        // También manejar errores del video
        introVideo.addEventListener('error', function() {
            console.log('Error en video, usando fallback...');
            completeIntro();
        });
    }
    
    // 4. FUNCIÓN PARA COMPLETAR INTRO
    function completeIntro() {
        if (introCompleted) return;
        introCompleted = true;
        
        // Guardar que ya se vio
        localStorage.setItem('introSeen', 'true');
        
        // Fade out de la intro
        if (introSection) {
            introSection.style.opacity = '0';
            introSection.style.transition = 'opacity 0.8s ease';
            
            setTimeout(() => {
                introSection.style.display = 'none';
                
                // Mostrar contenido principal
                if (mainContent) {
                    mainContent.classList.remove('hidden');
                    mainContent.style.opacity = '0';
                    mainContent.style.animation = 'fadeIn 1s ease forwards';
                }
            }, 800);
        }
    }
    
    // 5. BOTÓN SALTAR
    if (skipButton) {
        skipButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            skipIntro();
        });
    }
    
    // 6. SALTAR INTRO
    function skipIntro() {
        if (introCompleted) return;
        
        console.log('Saltando intro...');
        introCompleted = true;
        localStorage.setItem('introSeen', 'true');
        
        // Pausar video si está reproduciéndose
        if (introVideo) {
            introVideo.pause();
        }
        
        // Ocultar intro inmediatamente
        if (introSection) {
            introSection.style.display = 'none';
        }
        
        // Mostrar contenido principal
        if (mainContent) {
            mainContent.classList.remove('hidden');
            mainContent.style.opacity = '1';
        }
        
        // Asegurar que la música siga
        if (backgroundAudio && backgroundAudio.paused) {
            backgroundAudio.play().catch(e => {
                console.log('No se pudo reanudar audio:', e);
            });
        }
    }
    
    // 7. FALLBACK: Mostrar sobre estático si no hay video
    function showStaticEnvelope() {
        console.log('Mostrando sobre estático...');
        
        // Crear imagen de sobre cerrado
        const staticEnvelope = document.createElement('div');
        staticEnvelope.className = 'static-envelope';
        staticEnvelope.innerHTML = `
            <img src="assets/images/envelope-closed.jpg" alt="Sobre cerrado" 
                 style="width:100%; height:100%; object-fit:cover; border-radius:10px;">
            <div class="envelope-overlay">
                <h3>Jeison & Sonia</h3>
                <p>Invitación de Boda</p>
                <p class="instruction">Toca para abrir</p>
            </div>
        `;
        
        // Añadir al contenedor
        if (videoContainer) {
            videoContainer.appendChild(staticEnvelope);
        }
        
        // Hacer clicable
        staticEnvelope.style.cursor = 'pointer';
        staticEnvelope.addEventListener('click', function() {
            // Mostrar sobre abierto
            this.innerHTML = `
                <img src="assets/images/envelope-open.jpg" alt="Sobre abierto"
                     style="width:100%; height:100%; object-fit:cover; border-radius:10px;">
                <div class="letter-content">
                    <h2>Jeison & Sonia</h2>
                    <p class="subtitle">Tienen el honor de invitarles</p>
                    <p>a la celebración de su matrimonio</p>
                    <p class="date">5 de septiembre de 2026</p>
                    <p class="location">Finca La Losilla</p>
                    <p class="time">17:00 horas</p>
                </div>
            `;
            
            // Esperar 3 segundos y completar
            setTimeout(completeIntro, 3000);
        });
    }
    
    // 8. MOSTRAR PROMPT DE INTERACCIÓN
    function showInteractionPrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'interaction-prompt';
        prompt.innerHTML = `
            <p>👆 Toca la pantalla para activar la música</p>
        `;
        prompt.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 1000;
            text-align: center;
        `;
        
        document.body.appendChild(prompt);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            prompt.remove();
        }, 5000);
    }
    
    // 9. INICIAR TODO
    // Verificar si ya se vio antes
    if (localStorage.getItem('introSeen') === 'true') {
        console.log('Intro ya vista anteriormente, saltando...');
        skipIntro();
    } else {
        // Iniciar automáticamente después de un breve delay
        setTimeout(startIntroAutomatically, 1000);
        
        // También permitir iniciar con cualquier interacción
        document.addEventListener('click', function() {
            if (!introCompleted) {
                // Si el audio estaba pausado por bloqueo, intentar reproducir
                if (backgroundAudio && backgroundAudio.paused) {
                    backgroundAudio.play().then(() => {
                        console.log('Audio iniciado por interacción del usuario');
                    });
                }
            }
        }, { once: true });
    }
    
    // 10. CONFIGURAR TOGGLE DE MÚSICA (si existe)
    const musicToggle = document.getElementById('music-toggle');
    if (musicToggle && backgroundAudio) {
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