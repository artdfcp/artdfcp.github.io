// Initialisation de la carte centree sur la France
var map = L.map('map').setView([46.9, 3.5], 6); 

// OSM
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    opacity: 0.7
}).addTo(map);


// URL vercel de la fonction qui renvoie geojson
var apiEndpoint = 'https://get-me-home-back.vercel.app/api/geojson';

// échelle de couleurs avec chroma.js
function getColor(value) {
    var colorScale = chroma.scale(['red', 'white', 'green']).domain([0, 1]);
    return colorScale(value).hex();
}

// style sur la variable score du geojson
function style(feature) {
    return {
        fillColor: getColor(feature.properties.score),
        weight: 0.5,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
}

// Charger et afficher le geojson depuis le back
fetch(apiEndpoint)
    .then(function(response) {        
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(function(data) {
        console.log('GeoJSON data:', data);
        // Ajout du GeoJSON des communes + style sur la variable score
        L.geoJSON(data, { style: style }).addTo(map);
    })
    .catch(function(error) {
        console.error('There has been a problem with your fetch operation:', error);
    });



// Légende des scores
var legend = L.control({ position: 'bottomleft' });

legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<div class="color-bar"></div>';
    div.innerHTML += '<div class="labels"><span>0</span><span>0.5</span><span>1</span></div>';
    return div;
};

legend.addTo(map);