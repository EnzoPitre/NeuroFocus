// ===== VARIABLES GLOBALES =====
let audioElements = {};
let activeAudios = new Set();
let globalVolume = 0.5;

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeAudio();
    initializeParticles();
    initializeSoundButtons();
    initializeVolumeControl();
    initializeStopButton();
    initializeCursor();
    
    console.log('🎵 NeuroFocus initialized - Ready for immersive focus!');
});

// ===== GESTION DU CURSEUR PERSONNALISÉ =====
function initializeCursor() {
    const cursor = document.querySelector('body::before');
    
    document.addEventListener('mousemove', (e) => {
        document.documentElement.style.setProperty('--cursor-x', e.clientX + 'px');
        document.documentElement.style.setProperty('--cursor-y', e.clientY + 'px');
    });
    
    // Mise à jour du CSS pour le curseur
    const style = document.createElement('style');
    style.textContent = `
        body::before {
            left: var(--cursor-x, 0px);
            top: var(--cursor-y, 0px);
        }
    `;
    document.head.appendChild(style);
}

// ===== INITIALISATION AUDIO =====
function initializeAudio() {
    const soundTypes = ['pluie', 'mer', 'cafe', 'feu', 'vent', 'bibliotheque', 'foret', 'synthwave'];
    
    soundTypes.forEach(sound => {
        const audioElement = document.getElementById(`audio-${sound}`);
        if (audioElement) {
            audioElements[sound] = audioElement;
            audioElement.volume = globalVolume;
            
            // Gestion des erreurs de chargement
            audioElement.addEventListener('error', function() {
                console.warn(`⚠️ Audio file not found: sons/${sound}.mp3`);
            });
            
            audioElement.addEventListener('loadstart', function() {
                console.log(`🎵 Loading audio: ${sound}`);
            });
        }
    });
}

// ===== PARTICULES FLOTTANTES =====
function initializeParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 25;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer);
    }
    
    // Créer de nouvelles particules périodiquement
    setInterval(() => {
        if (particlesContainer.children.length < particleCount) {
            createParticle(particlesContainer);
        }
    }, 2000);
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Position et taille aléatoires
    const startX = Math.random() * window.innerWidth;
    const size = Math.random() * 3 + 1;
    
    particle.style.left = startX + 'px';
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.animationDelay = Math.random() * 20 + 's';
    
    container.appendChild(particle);
    
    // Supprimer la particule après l'animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 25000);
}

// ===== BOUTONS DE SONS =====
function initializeSoundButtons() {
    const soundButtons = document.querySelectorAll('.sound-btn');
    
    soundButtons.forEach(button => {
        button.addEventListener('click', function() {
            const soundType = this.getAttribute('data-sound');
            toggleSound(soundType, this);
        });
        
        // Effet de hover avec son
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(0) scale(1)';
            }
        });
    });
}

// ===== TOGGLE SOUND =====
function toggleSound(soundType, buttonElement) {
    const audio = audioElements[soundType];
    
    if (!audio) {
        showNotification(`Son "${soundType}" non disponible`, 'error');
        return;
    }
    
    if (activeAudios.has(soundType)) {
        // Arrêter le son
        audio.pause();
        audio.currentTime = 0;
        activeAudios.delete(soundType);
        buttonElement.classList.remove('active');
        buttonElement.style.transform = 'translateY(0) scale(1)';
        
        showNotification(`${getSoundDisplayName(soundType)} arrêté`, 'info');
    } else {
        // Jouer le son
        audio.volume = globalVolume;
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                activeAudios.add(soundType);
                buttonElement.classList.add('active');
                buttonElement.style.transform = 'translateY(-2px) scale(1.05)';
                
                showNotification(`${getSoundDisplayName(soundType)} activé`, 'success');
            }).catch(error => {
                console.error('Erreur de lecture:', error);
                showNotification(`Erreur lors de la lecture de ${soundType}`, 'error');
            });
        }
    }
    
    updateActiveCounter();
}

// ===== BOUTON STOP ALL =====
function initializeStopButton() {
    const stopButton = document.getElementById('stopAllBtn');
    
    stopButton.addEventListener('click', function() {
        stopAllSounds();
        
        // Effet visuel
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
}

function stopAllSounds() {
    let stoppedCount = 0;
    
    activeAudios.forEach(soundType => {
        const audio = audioElements[soundType];
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            stoppedCount++;
        }
        
        // Retirer la classe active du bouton
        const button = document.querySelector(`[data-sound="${soundType}"]`);
        if (button) {
            button.classList.remove('active');
            button.style.transform = 'translateY(0) scale(1)';
        }
    });
    
    activeAudios.clear();
    updateActiveCounter();
    
    if (stoppedCount > 0) {
        showNotification(`${stoppedCount} son(s) arrêté(s)`, 'info');
    } else {
        showNotification('Aucun son à arrêter', 'warning');
    }
}

// ===== CONTRÔLE DU VOLUME =====
function initializeVolumeControl() {
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    
    volumeSlider.addEventListener('input', function() {
        const volume = this.value / 100;
        globalVolume = volume;
        
        // Mettre à jour tous les audios actifs
        Object.values(audioElements).forEach(audio => {
            audio.volume = volume;
        });
        
        // Mettre à jour l'affichage
        volumeValue.textContent = this.value + '%';
        
        // Effet visuel
        this.style.background = `linear-gradient(to right, #9b5de5 0%, #9b5de5 ${this.value}%, rgba(155, 93, 229, 0.3) ${this.value}%, rgba(155, 93, 229, 0.3) 100%)`;
    });
    
    // Initialiser l'apparence du slider
    volumeSlider.dispatchEvent(new Event('input'));
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const colors = {
        success: '#00f5d4',
        error: '#f15bb5',
        warning: '#ffaa44',
        info: '#9b5de5'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        border: 2px solid ${colors[type]};
        border-radius: 10px;
        padding: 1rem 1.5rem;
        color: white;
        font-family: 'Orbitron', monospace;
        font-size: 0.9rem;
        z-index: 10000;
        box-shadow: 0 0 20px ${colors[type]}40;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Suppression automatique
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ===== UTILITAIRES =====
function getSoundDisplayName(soundType) {
    const displayNames = {
        'pluie': 'Pluie',
        'mer': 'Océan',
        'cafe': 'Café',
        'feu': 'Feu de camp',
        'vent': 'Vent',
        'bibliotheque': 'Bibliothèque',
        'foret': 'Forêt',
        'synthwave': 'Synthwave'
    };
    
    return displayNames[soundType] || soundType;
}

function updateActiveCounter() {
    const activeCount = activeAudios.size;
    const subtitle = document.querySelector('.subtitle');
    
    if (activeCount > 0) {
        subtitle.textContent = `${activeCount} ambiance(s) active(s) • Concentration en cours`;
        subtitle.style.color = '#00f5d4';
    } else {
        subtitle.textContent = 'Concentration Immersive • Sons Relaxants • Cyberpunk Experience';
        subtitle.style.color = '#b0b0b0';
    }
}

// ===== GESTION DES ÉVÉNEMENTS CLAVIER =====
document.addEventListener('keydown', function(event) {
    // Spacebar pour arrêter tous les sons
    if (event.code === 'Space' && event.target.tagName !== 'INPUT') {
        event.preventDefault();
        stopAllSounds();
    }
    
    // Échap pour arrêter tous les sons
    if (event.code === 'Escape') {
        stopAllSounds();
    }
    
    // Contrôle volume avec flèches
    if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
        event.preventDefault();
        const volumeSlider = document.getElementById('volumeSlider');
        const currentValue = parseInt(volumeSlider.value);
        const step = 5;
        
        if (event.code === 'ArrowUp' && currentValue < 100) {
            volumeSlider.value = Math.min(100, currentValue + step);
        } else if (event.code === 'ArrowDown' && currentValue > 0) {
            volumeSlider.value = Math.max(0, currentValue - step);
        }
        
        volumeSlider.dispatchEvent(new Event('input'));
    }
});

// ===== GESTION RESPONSIVE =====
window.addEventListener('resize', function() {
    // Recalculer les particules si nécessaire
    const particles = document.querySelectorAll('.particle');
    particles.forEach(particle => {
        if (parseInt(particle.style.left) > window.innerWidth) {
            particle.style.left = Math.random() * window.innerWidth + 'px';
        }
    });
});

// ===== GESTION DE LA VISIBILITÉ =====
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Réduire le volume quand la page n'est pas visible
        Object.values(audioElements).forEach(audio => {
            if (!audio.paused) {
                audio.volume = globalVolume * 0.3;
            }
        });
    } else {
        // Restaurer le volume
        Object.values(audioElements).forEach(audio => {
            if (!audio.paused) {
                audio.volume = globalVolume;
            }
        });
    }
});

// ===== EASTER EGG - SÉQUENCE KONAMI =====
let konamiSequence = [];
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

document.addEventListener('keydown', function(event) {
    konamiSequence.push(event.code);
    
    if (konamiSequence.length > konamiCode.length) {
        konamiSequence.shift();
    }
    
    if (JSON.stringify(konamiSequence) === JSON.stringify(konamiCode)) {
        activateEasterEgg();
        konamiSequence = [];
    }
});

function activateEasterEgg() {
    showNotification('🎊 Mode Cyberpunk Ultra activé!', 'success');
    
    // Effet spécial temporaire
    const body = document.body;
    body.style.animation = 'rainbow 2s ease-in-out';
    
    // Ajouter l'animation rainbow
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            25% { filter: hue-rotate(90deg); }
            50% { filter: hue-rotate(180deg); }
            75% { filter: hue-rotate(270deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
        body.style.animation = '';
        style.remove();
    }, 2000);
    
    // Créer des particules spéciales
    createSpecialParticles();
}

function createSpecialParticles() {
    const container = document.getElementById('particles');
    const colors = ['#00f5d4', '#9b5de5', '#f15bb5', '#ffaa44'];
    
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                left: ${Math.random() * window.innerWidth}px;
                top: 100vh;
                box-shadow: 0 0 15px currentColor;
                animation: specialFloat 3s ease-out forwards;
            `;
            
            const specialAnimation = `
                @keyframes specialFloat {
                    0% {
                        transform: translateY(0) scale(1) rotate(0deg);
                        opacity: 1;
                    }
                    50% {
                        transform: translateY(-50vh) scale(2) rotate(180deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100vh) scale(0) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            
            const styleSheet = document.createElement('style');
            styleSheet.textContent = specialAnimation;
            document.head.appendChild(styleSheet);
            
            container.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
                if (styleSheet.parentNode) {
                    styleSheet.parentNode.removeChild(styleSheet);
                }
            }, 3000);
        }, i * 200);
    }
}

// ===== MESSAGE DE BIENVENUE =====
window.addEventListener('load', function() {
    setTimeout(() => {
        showNotification('🎵 Bienvenue sur NeuroFocus!', 'success');
        setTimeout(() => {
            showNotification('💡 Astuce: Utilisez Espace ou Échap pour tout arrêter', 'info');
        }, 3500);
    }, 1000);
});

console.log(`
🎵 NeuroFocus - Cyberpunk Focus App
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Contrôles disponibles:
   • Espace / Échap: Arrêter tous les sons
   • ↑/↓: Contrôler le volume
   • Code Konami: Easter egg secret!

🎧 Préparez-vous à une expérience immersive!
`);