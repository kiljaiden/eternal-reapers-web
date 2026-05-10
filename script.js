const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    databaseURL: "TU_DATABASE_URL",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.addEventListener('DOMContentLoaded', () => {
    loadBlog();
    loadRoster(); // Ahora desde Firebase
    handleVisits();
    if(document.getElementById('calendar-container')) generateCalendar();
});

// Cargar Noticias
function loadBlog() {
    database.ref('blog').on('value', snap => {
        const container = document.getElementById('noticias-grid');
        if(!container) return;
        container.innerHTML = '';
        snap.forEach(child => {
            const post = child.val();
            container.innerHTML += `
                <div class="blog-post">
                    <h3>${post.titulo}</h3>
                    <p>${post.cuerpo}</p>
                    <small>${post.fecha}</small>
                </div>
            `;
        });
    });
}

// Cargar Roster (Sustituye al XML)
function loadRoster() {
    database.ref('oficiales').on('value', snap => {
        const list = document.getElementById('roster-list');
        list.innerHTML = '';
        snap.forEach(child => {
            const m = child.val();
            list.innerHTML += `
                <div class="member-item">
                    <div class="status-dot"></div>
                    <div>
                        <div style="font-weight:bold">${m.nombre}</div>
                        <div style="font-size:0.7rem; color:#888">${m.rango}</div>
                    </div>
                </div>
            `;
        });
    });
}

// Contador Visitas
function handleVisits() {
    database.ref('stats/visits').transaction(c => (c || 0) + 1);
    database.ref('stats/visits').on('value', snap => {
        document.getElementById('visit-count').innerText = snap.val();
    });
}

// Calendario Fix
function generateCalendar() {
    const container = document.getElementById('calendar-container');
    const dias = ["D", "L", "M", "X", "J", "V", "S"];
    let html = '<div style="display:grid; grid-template-columns:repeat(7,1fr); gap:5px">';
    for(let i=1; i<=31; i++) {
        html += `<div style="background:#111; padding:10px; border:1px solid #333; text-align:center">${i}</div>`;
    }
    html += '</div>';
    container.innerHTML = html;
}
document.addEventListener('DOMContentLoaded', () => {
    generateCalendar();
    // ... tus otras funciones de Firebase y XML
});
