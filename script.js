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