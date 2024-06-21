// Initialisation de la carte
var map = L.map('map').setView([46.9, 3.5], 6); 

// Ajout tuiles OSM
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


// URL de la fonction API geojson sur Vercel
var apiEndpoint = 'https://get-me-home-back.vercel.app/api/geojson';

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
        L.geoJSON(data).addTo(map);
    })
    .catch(function(error) {
        console.error('There has been a problem with your fetch operation:', error);
    });