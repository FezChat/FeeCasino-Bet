// components/sound.js
const sounds = {
    notification: {
        url: 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3',
        volume: 0.5
    },
    win: {
        url: 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3',
        volume: 0.7
    },
    error: {
        url: 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3',
        volume: 0.5
    },
    'aviator-crash': {
        url: 'https://assets.mixkit.co/sfx/preview/mixkit-explosion-with-debris-1993.mp3',
        volume: 0.3
    }
};

export function playSound(soundName) {
    if (!sounds[soundName]) return;
    
    // Check if user has sound enabled
    const soundEnabled = localStorage.getItem('sound-enabled') !== 'false';
    if (!soundEnabled) return;
    
    const audio = new Audio(sounds[soundName].url);
    audio.volume = sounds[soundName].volume;
    
    audio.play().catch(error => {
        console.log('Audio play failed:', error);
        // Silent fail for autoplay restrictions
    });
}

export function toggleSound() {
    const current = localStorage.getItem('sound-enabled');
    const newValue = current === 'false' ? 'true' : 'false';
    localStorage.setItem('sound-enabled', newValue);
    
    return newValue === 'true';
}
