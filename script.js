document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistema cargado. Obteniendo datos de la hermandad...");
    loadRoster();
});

function loadRoster() {
    fetch('database.xml')
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar el XML");
            return response.text();
        })
        .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "application/xml");
            const miembros = xml.getElementsByTagName('miembro');
            const container = document.getElementById('roster-container');

            Array.from(miembros).forEach(m => {
                const nombre = m.getElementsByTagName('nombre')[0].textContent;
                const clase = m.getElementsByTagName('clase')[0].textContent;
                const rango = m.getElementsByTagName('rango')[0].textContent;

                const card = document.createElement('div');
                card.className = 'member-card';
                card.innerHTML = `
                    <h3>${nombre}</h3>
                    <p><strong>Clase:</strong> ${clase}</p>
                    <span class="rango-tag">${rango}</span>
                `;
                container.appendChild(card);
            });
        })
        .catch(err => {
            console.error("Error:", err);
            document.getElementById('roster-container').innerHTML = 
                "<p>Error al cargar el roster. Asegúrate de usar un servidor local (Live Server).</p>";
        });
}
// 1. Configuración de Firebase (Pega aquí tus datos de la consola)
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDGELmVvBZZywbJOf6kuVKQJjKaRt6Q9ws",
  authDomain: "eternalreapersweb.firebaseapp.com",
  databaseURL: "https://eternalreapersweb-default-rtdb.firebaseio.com",
  projectId: "eternalreapersweb",
  storageBucket: "eternalreapersweb.firebasestorage.app",
  messagingSenderId: "945508907683",
  appId: "1:945508907683:web:b26cc3660298d4d6ba1d16",
  measurementId: "G-7J20NR0JDM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 2. Escuchar el envío del Formulario
const applyForm = document.getElementById('apply-form');
if(applyForm) {
    applyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nuevaSolicitud = {
            personaje: applyForm.name.value,
            clase: applyForm.class.value,
            gs: applyForm.gs.value,
            experiencia: applyForm.exp.value,
            fecha: new Date().toLocaleString()
        };

        // Guardar en Firebase
        database.ref('solicitudes').push(nuevaSolicitud)
            .then(() => {
                alert('¡Solicitud enviada con éxito!');
                applyForm.reset();
            })
            .catch(err => console.error("Error al enviar:", err));
    });
}

// 3. Mostrar Solicitudes en Tiempo Real
database.ref('solicitudes').limitToLast(5).on('value', (snapshot) => {
    const container = document.getElementById('lista-candidatos');
    container.innerHTML = ''; // Limpiar antes de recargar

    snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        const item = document.createElement('div');
        item.className = 'candidato-card';
        item.innerHTML = `
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #333; padding:10px;">
                <span><strong>${data.personaje}</strong> - ${data.clase}</span>
                <span style="color:var(--gold)">GS: ${data.gs}</span>
            </div>
            <p style="font-size:0.8rem; margin:5px; color:#888;">Aplicó el: ${data.fecha}</p>
        `;
        container.prepend(item); // Mostrar el más reciente arriba
    });
});
