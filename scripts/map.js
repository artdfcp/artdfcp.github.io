// Initialiser la carte
var map = L.map('map').setView([48.8566, 2.3522], 13); // Coordonnées de Paris

// Ajouter une couche de tuiles OSM
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Charger et afficher le fichier GeoJSON
axios.get('path/to/your/file.geojson')
    .then(function (response) {
        L.geoJSON(response.data).addTo(map);
    })
    .catch(function (error) {
        console.log(error);
    });