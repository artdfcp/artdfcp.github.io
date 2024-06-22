let geojsonLayers = []; // Pour stocker les couches GeoJSON
// Initialisation de la carte centree sur la France
var map = L.map('map').setView([46.9, 3.5], 6); 
let totalFiles = 10; // Nombre total de json à charger
let loadedFiles = 0; // Compteur de json chargés

// OSM
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    opacity: 0.7
}).addTo(map);


// URL vercel de la fonction qui renvoie geojson
var apiEndpoint = 'https://get-me-home-back.vercel.app/api/geojson';

// échelle de couleurs avec chroma.js
function getColor(value) {
    var colorScale = chroma.scale(['red', 'green']).domain([0, 100]);
    return colorScale(value).hex();
}

// style sur la variable score du geojson
function style(feature) {
    return {
        fillColor: getColor(feature.properties.score),
        weight: 0.2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
}

// ajouter les infos à chaque entité geojson
function onEachFeature(feature, layer) {
    if (feature.properties) {
        for (var key in feature.properties) {
            if (key = "NOM") {
                var popupContent = "<p><strong>"+feature.properties[key]+"</strong></p><ul>";
            }
        }
        for (var key in feature.properties) {
            popupContent += "<p>" + key + ": " + feature.properties[key] + "</p>";
        }
        popupContent += "</ul>";
        layer.bindPopup(popupContent);
    }
}

// fonction pour charger et afficher le geojson depuis le back
function fetch_geojson(apiEndpoint, fileName){
    // ajout du nom de fichier dans les paramètres de requête
    const urlWithParams = `${apiEndpoint}?fileName=${encodeURIComponent(fileName)}`;
    
    fetch(urlWithParams)
        .then(function(response) {        
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(function(data) {
            console.log('GeoJSON data:', data);
            // Ajout du GeoJSON des communes + style sur la variable score
            let layer = L.geoJSON(data, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);
            geojsonLayers.push(layer); // ajout à la liste des couches
            loadedFiles++;

            // active le bouton si tous les fichiers sont chargés
            if (loadedFiles === totalFiles) {
                const hide_json = document.getElementById('hide_json');
                hide_json.disabled = false;
                hide_json.style.pointerEvents = 'auto';
                hide_json.style.opacity = '1';
            }
        })
        .catch(function(error) {
            console.error('There has been a problem with your fetch operation:', error);
        });
}
//fetch tous les subset geojson
for (let i = 1; i < 11; i++) {
    let filename = `communes_generalise_v3_sub${i}.geojson`
    fetch_geojson(apiEndpoint, filename)
}

// légende des scores
var legend = L.control({ position: 'bottomleft' });

legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<div class="color-bar"></div>';
    div.innerHTML += '<div class="labels"><span>0</span><span>50</span><span>100</span></div>';
    return div;
};

// cacher/afficher couches GeoJSON
document.getElementById('hide_json').addEventListener('click', function() {
    geojsonLayers.forEach(layer => {
        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
            this.textContent = 'Afficher les scores';
        } else {
            layer.addTo(map);
            this.textContent = 'Cacher les scores';
        }
    });
});

legend.addTo(map);