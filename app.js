let player;
let isPlayerReady = false;
const htmlAudioPlayer = new Audio();
let currentMotor = 'none';
let currentTrackIndex = 0;
let currentRoom = 'raids';

// Estructura de Datos de las Salas (Guardadas localmente en memoria)
const roomsData = {
    raids: {
        name: "Sala de Raids ⚔️",
        tracks: [
            { type: 'youtube', id: '4n6WP9qHyRM', title: 'Invincible (WoW Theme)', artist: 'Russell Brower' },
            { type: 'youtube', id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley' }
        ]
    },
    chill: {
        name: "Taberna / Chill 🍺",
        tracks: [
            { type: 'mp3', id: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', title: 'Demo Tradicional AI', artist: 'Suno Engine' }
        ]
    }
};

// 1. Renderizar la Lista de Canales y Mapear Presencia de Usuarios
function renderRooms() {
    const container = document.getElementById('rooms-container');
    container.innerHTML = '';

    Object.keys(roomsData).forEach(roomId => {
        const room = roomsData[roomId];
        const div = document.createElement('div');
        div.className = `channel-item ${roomId === currentRoom ? 'active' : ''}`;
        div.setAttribute('data-room', roomId);

        // Estructura interna de la sala
        let htmlContent = `<span><i class="fa-solid fa-volume-high"></i> ${room.name}</span>`;
        
        // Si la sala es la activa, renderizamos quirúrgicamente a "Jaiden" adentro
        if (roomId === currentRoom) {
            htmlContent += `
                <div class="user-badge-container">
                    <span class="user-badge"><i class="fa-solid fa-circle"></i> Jaiden</span>
                </div>
            `;
        }

        div.innerHTML = htmlContent;
        
        // Evento para cambiar de sala
        div.onclick = () => switchRoom(roomId);
        container.appendChild(div);
    });
}

// Lógica de salto entre canales de audio
function switchRoom(roomId) {
    currentRoom = roomId;
    document.getElementById('active-room-title').innerText = roomsData[currentRoom].name;
    
    currentTrackIndex = 0;
    renderPlaylist();
    renderRooms(); // Volver a dibujar para actualizar la presencia de Jaiden

    if (roomsData[currentRoom].tracks.length > 0) {
        loadTrack(0);
    } else {
        resetPlayerUI();
    }
}

// 2. Renderizar la Playlist con Botón de Eliminar quirúrgico
function renderPlaylist() {
    const tbody = document.getElementById('playlist-body');
    tbody.innerHTML = '';
    const currentTracks = roomsData[currentRoom].tracks;

    currentTracks.forEach((track, index) => {
        const tr = document.createElement('tr');
        if (index === currentTrackIndex) tr.classList.add('active-track');
        
        const icon = track.type === 'youtube' 
            ? '<i class="fa-brands fa-youtube" style="color:#ff0000"></i>' 
            : '<i class="fa-solid fa-file-audio" style="color:#00a8ff"></i>';
        
        tr.innerHTML = `
            <td>${icon}</td>
            <td>${track.title}</td>
            <td>${track.artist}</td>
            <td style="text-align: right;">
                <button class="btn-delete-track" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;

        // Al hacer clic en la fila se reproduce, MENOS si se hace clic en el botón borrar
        tr.onclick = (e) => {
            if (e.target.closest('.btn-delete-track')) return;
            loadTrack(index);
        };

        tbody.appendChild(tr);
    });

    // Añadir lógica a los botones de borrado
    document.querySelectorAll('.btn-delete-track').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const targetIndex = parseInt(btn.getAttribute('data-index'));
            removeTrack(targetIndex);
        };
    });
}

// Función Quirúrgica para borrar canciones de la Playlist
function removeTrack(index) {
    const tracks = roomsData[currentRoom].tracks;
    tracks.splice(index, 1); // Quitar del array de la sala

    // Reajustar puntero de reproducción si borramos la canción activa
    if (index === currentTrackIndex) {
        currentTrackIndex = 0;
        if (tracks.length > 0) {
            loadTrack(0);
        } else {
            resetPlayerUI();
        }
    } else if (index < currentTrackIndex) {
        currentTrackIndex--; // Desplazar índice hacia arriba para no perder consistencia
    }

    renderPlaylist();
}

// Crear salas dinámicas desde la interfaz
document.getElementById('btn-create-room').onclick = () => {
    const roomName = prompt("Introduce el nombre para tu nuevo canal de audio:");
    if (!roomName || !roomName.trim()) return;

    const id = 'custom_' + Date.now();
    roomsData[id] = {
        name: roomName.trim(),
        tracks: []
    };

    renderRooms();
    switchRoom(id); // Te une automáticamente al canal creado
};

// Limpiar UI si no quedan pistas
function resetPlayerUI() {
    if(isPlayerReady) player.pauseVideo();
    htmlAudioPlayer.pause();
    document.getElementById('track-title').innerText = "Selecciona un tema";
    document.getElementById('track-artist').innerText = "Artista";
    document.querySelector('#btn-play i').classList.replace('fa-pause', 'fa-play');
}

// Inicialización segura del IFrame Player de YouTube
window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player('youtube-audio-player', {
        height: '0', width: '0',
        videoId: roomsData[currentRoom].tracks[0]?.id || '',
        events: {
            'onReady': () => { isPlayerReady = true; },
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerStateChange(event) {
    const playIcon = document.querySelector('#btn-play i');
    if (event.data === YT.PlayerState.PLAYING) {
        playIcon.classList.replace('fa-play', 'fa-pause');
    } else {
        playIcon.classList.replace('fa-pause', 'fa-play');
    }
    if (event.data === YT.PlayerState.ENDED) nextTrack();
}

// Motor Híbrido
function loadTrack(index) {
    const tracks = roomsData[currentRoom].tracks;
    if (!tracks || tracks.length === 0) return;

    currentTrackIndex = index;
    const track = tracks[index];

    if(isPlayerReady) player.pauseVideo();
    htmlAudioPlayer.pause();

    document.getElementById('track-title').innerText = track.title;
    document.getElementById('track-artist').innerText = track.artist;
    const badge = document.getElementById('source-badge');

    if (track.type === 'youtube') {
        currentMotor = 'youtube';
        badge.innerText = 'YT';
        badge.style.backgroundColor = '#ff0000';
        if (isPlayerReady) player.loadVideoById(track.id);
    } else {
        currentMotor = 'mp3';
        badge.innerText = 'MP3';
        badge.style.backgroundColor = '#00a8ff';
        htmlAudioPlayer.src = track.id;
        htmlAudioPlayer.play();
        document.querySelector('#btn-play i').classList.replace('fa-play', 'fa-pause');
    }
    renderPlaylist();
}

// Control Maestro Play/Pause
document.getElementById('btn-play').addEventListener('click', () => {
    const playIcon = document.querySelector('#btn-play i');
    if (currentMotor === 'youtube' && isPlayerReady) {
        if (player.getPlayerState() === YT.PlayerState.PLAYING) { player.pauseVideo(); } else { player.playVideo(); }
    } else if (currentMotor === 'mp3') {
        if (htmlAudioPlayer.paused) { htmlAudioPlayer.play(); playIcon.classList.replace('fa-play', 'fa-pause'); } 
        else { htmlAudioPlayer.pause(); playIcon.classList.replace('fa-pause', 'fa-play'); }
    }
});

function nextTrack() {
    let nextIdx = currentTrackIndex + 1;
    if (nextIdx >= roomsData[currentRoom].tracks.length) nextIdx = 0;
    loadTrack(nextIdx);
}
document.getElementById('btn-next').onclick = nextTrack;

document.getElementById('btn-prev').onclick = () => {
    let prevIdx = currentTrackIndex - 1;
    if (prevIdx < 0) prevIdx = roomsData[currentRoom].tracks.length - 1;
    loadTrack(prevIdx);
};

document.getElementById('volume-range').addEventListener('input', (e) => {
    const val = e.target.value;
    if (isPlayerReady) player.setVolume(val);
    htmlAudioPlayer.volume = val / 100;
});

// Alternador de Vistas
document.getElementById('toggle-admin-view').addEventListener('click', (e) => {
    const searchView = document.getElementById('wrapper-search-view');
    const adminView = document.getElementById('wrapper-admin-view');
    const btn = e.currentTarget;

    if (adminView.style.display === 'none') {
        adminView.style.display = 'block';
        searchView.style.display = 'none';
        btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Modo Buscador';
    } else {
        adminView.style.display = 'none';
        searchView.style.display = 'block';
        btn.innerHTML = '<i class="fa-solid fa-gear"></i> Modo Manual';
    }
});

function parseYouTubeTarget(input) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=||shorts\/)([^#\&\?]*).*/;
    const match = input.match(regExp);
    return (match && match[2].length === 11) ? match[2] : input;
}

// Inserción Manual
document.getElementById('song-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('admin-title').value.trim();
    const artist = document.getElementById('admin-artist').value.trim();
    const rawUrl = document.getElementById('admin-url').value.trim();
    let type = document.getElementById('admin-type').value;

    let finalId = rawUrl;
    if (type === 'youtube') {
        finalId = parseYouTubeTarget(rawUrl);
        if (finalId.length !== 11) { alert('⚠️ Enlace de YT inválido.'); return; }
    }

    roomsData[currentRoom].tracks.push({ type: type, id: finalId, title: title, artist: artist });
    renderPlaylist();
    if (roomsData[currentRoom].tracks.length === 1) loadTrack(0);
    document.getElementById('song-form').reset();
});

// Buscador Simulado
document.getElementById('btn-search').addEventListener('click', () => {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;
    const container = document.getElementById('search-results');
    container.innerHTML = '';

    const mock = [
        { type: 'youtube', id: '4n6WP9qHyRM', title: `${query} (Video Track)`, artist: 'YouTube Engine' },
        { type: 'mp3', id: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', title: `${query} (Audio Local)`, artist: 'Cloud Storage' }
    ];

    mock.forEach(res => {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.innerHTML = `<span><strong>[${res.type.toUpperCase()}]</strong> ${res.title}</span> <button><i class="fa-solid fa-square-plus"></i></button>`;
        div.querySelector('button').onclick = () => {
            roomsData[currentRoom].tracks.push(res);
            renderPlaylist();
            container.innerHTML = '';
            document.getElementById('search-input').value = '';
        };
        container.appendChild(div);
    });
});

// Carga Inicial del Sistema
renderRooms();
renderPlaylist();