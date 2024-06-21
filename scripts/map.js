// Initialisation de la carte
var map = L.map('map').setView([46.9, 3.5], 6); 

// Ajout tuiles OSM
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


// URL de la fonction API geojson sur Vercel
var apiEndpoint = 'https://get-me-home-back.vercel.app/api/geojson';

// Définir une échelle de couleurs basée sur une variable
function getColor(value) {
    // Utilisation de chroma.js pour créer une échelle de couleurs
    var colorScale = chroma.scale(['red', 'white', 'green']).domain([0, 1]); // Adaptez la plage de valeurs selon vos données
    return colorScale(value).hex();
}

// Fonction de style pour les entités GeoJSON
function style(feature) {
    return {
        fillColor: getColor(feature.properties.score), // Remplacez yourVariable par le nom de votre variable
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// Charger et afficher le GeoJSON depuis la fonction API
fetch(apiEndpoint)
    .then(function(response) {        
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(function(data) {
        console.log('GeoJSON data:', data);
        // Ajout du GeoJSON à la carte Leaflet avec le style dynamique
        L.geoJSON(data, { style: style }).addTo(map);
    })
    .catch(function(error) {
        console.error('There has been a problem with your fetch operation:', error);
    });