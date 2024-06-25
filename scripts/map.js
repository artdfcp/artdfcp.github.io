// Initialisation de la carte centree sur la France
var map = L.map('map').setView([46.9, 3.5], 6); 

let geojsonLayers = []; // Pour stocker les couches GeoJSON
var geoJsonLayerGroup = L.layerGroup().addTo(map);

let totalFiles = 10; // Nombre total de json à charger
let loadedFiles = 0; // Compteur de json chargés

// OSM
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    opacity: 0.7
}).addTo(map);


// URL vercel de la fonction qui renvoie geojson
var apiEndpoint = 'https://get-me-home-back.vercel.app/api/geojson';
var newApiEndpoint = 'https://get-me-home-back.vercel.app/api/newgeojson';

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

//couleurs des scores
function getpopupColor(d) {
    if (d == 0) {
        return '#ff0000';
    } else if (d > 0 && d < 10) {
        return '#d41500';
    } else if (d >= 10 && d < 20) {
        return '#bf2000';
    } else if (d >= 20 && d < 30) {
        return '#aa2b00';
    } else if (d >= 30 && d < 40) {
        return '#953500';
    } else if (d >= 40 && d < 50) {
        return '#804000';
    } else if (d >= 50 && d < 60) {
        return '#6a4b00';
    } else if (d >= 60 && d < 70) {
        return '#555500';
    } else if (d >= 70 && d < 80) {
        return '#406000';
    } else if (d >= 80 && d < 90) {
        return '#2b6b00';
    } else if (d >= 90 && d <= 100) {
        return '#157500';
    } else if (d == 100) {
        return '#008000';
    }
}

// ajouter les infos à chaque entité geojson
function onEachFeature(feature, layer) {
    if (feature.properties) {

        // Info ville ------------------------------------------------
        var nom_ville = feature.properties["NOM"];
        var score = feature.properties["score"];
        var color = getpopupColor(score);
        var popupContent = "<p><strong>"+ nom_ville + " : <span style='color:" + color + "'>" + score + "</span> %</strong></p><p><span style='color:white'>-</span></p>";
        
        // Info densité pop -------------------------------------------
        var pop_km2_value = feature.properties["pop_km2"];
        var pop_desc_score_value = feature.properties["score_dpop_desc"];
        var pop_asc_score_value = feature.properties["score_dpop_asc"];

        if (pop_km2_value !== undefined && pop_desc_score_value !== undefined) {
            var color1 = getpopupColor(pop_desc_score_value);
            var color2 = getpopupColor(pop_asc_score_value);
            popupContent += "<p>Densité de population : " + pop_km2_value + " hab/km² (<strong><span style='color:" + color1 + "'>" + pop_desc_score_value + "</span> ou <span style='color:" + color2 + "'>" + pop_asc_score_value + "</span></strong>)</p>";
        } else if (pop_km2_value !== undefined || pop_desc_score_value !== undefined) {
            popupContent += "<p>Densité de population : N/A hab/km² (-)</p>";
        }

        // Info forêt -------------------------------------------
        var foret_ha = feature.properties["foret_ha"];
        var score_foret = feature.properties["score_foret"];

        if (foret_ha !== undefined && score_foret !== undefined) {
            var color = getpopupColor(score_foret);
            popupContent += "<p>Forêt (rayon de 10km) : " + foret_ha + " ha (<strong><span style='color:" + color + "'>" + score_foret + "</span></strong>)</p>";
        } else if (foret_ha !== undefined || score_foret !== undefined) {
            popupContent += "<p>Forêt (rayon de 10km) : N/A ha (-)</p>";
        }
        
        layer.bindPopup(popupContent);
    }
}

// fonction pour charger et afficher le geojson depuis le back
function fetch_geojson(apiEndpoint, fileName){
    // ajout du nom de fichier dans les paramètres de requête
    const urlWithParams = `${apiEndpoint}?fileName=${encodeURIComponent(fileName)}`;
    loadedFiles = 0 //réinitialise le compte
    
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
            });

            // ajout à la liste des couches pour une gestion ultérieure
            geoJsonLayerGroup.addLayer(layer);
            geojsonLayers.push(layer); 
            loadedFiles++;

            // active les boutons si tous les fichiers sont chargés
            if (loadedFiles === totalFiles) {
                const hide_json = document.getElementById('hide_json');
                hide_json.disabled = false;
                hide_json.style.pointerEvents = 'auto';
                hide_json.style.opacity = '1';
            }

            if (loadedFiles === totalFiles) {
                const apply_search = document.getElementById('sendButton');
                apply_search.disabled = false;
                apply_search.style.pointerEvents = 'auto';
                apply_search.style.opacity = '1';
            }
        })
        .catch(function(error) {
            console.error('There has been a problem with your fetch operation:', error);
        });
}
//fonction pour fetch tous les subset geojson
function fetch_all_geojson(apiEndpoint) {
    for (let i = 1; i < 11; i++) {
        let filename = `communes_generalise_v3_sub${i}.geojson`
        fetch_geojson(apiEndpoint, filename)
    }    
}
//======================================================================
// fonction pour charger et afficher le nouveau geojson depuis le back
function fetch_new_geojson(newApiEndpoint, filename, parameters){
    parameters.filename = filename;
    // ajout du nom de fichier dans les paramètres de requête
    //const urlWithParams = `${apiEndpoint}?fileName=${encodeURIComponent(filename)}`;
    loadedFiles = 0 //réinitialise le compte

    fetch(newApiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(parameters)
    })
    .then(response => response.json())
    .then(data => {
        console.log('GeoJSON modifié:', data);
        // Ajout du GeoJSON des communes + style sur la variable score
        let layer = L.geoJSON(data, {
            style: style,
            onEachFeature: onEachFeature
        });

        // ajout à la liste des couches pour une gestion ultérieure
        geoJsonLayerGroup.addLayer(layer);
        geojsonLayers.push(layer); 
        loadedFiles++;

        // active les boutons si tous les fichiers sont chargés
        if (loadedFiles === totalFiles) {
            const hide_json = document.getElementById('hide_json');
            hide_json.disabled = false;
            hide_json.style.pointerEvents = 'auto';
            hide_json.style.opacity = '1';
        }

        if (loadedFiles === totalFiles) {
            const apply_search = document.getElementById('sendButton');
            apply_search.disabled = false;
            apply_search.style.pointerEvents = 'auto';
            apply_search.style.opacity = '1';
        }
    })
    .catch(error => console.error('Erreur:', error));
}

//fonction pour fetch tous les subset geojson
function fetch_all_new_geojson(newApiEndpoint, parameters) {
    console.log("fetch new data")
    for (let i = 1; i < 11; i++) {
        let filename = `communes_generalise_v3_sub${i}.geojson`
        fetch_new_geojson(newApiEndpoint, filename, parameters)
    }    
}

//fetch tous les geojson au chargement de la page
fetch_all_geojson(apiEndpoint)


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

// slidebars ================================================

// génère le texte à côté de la slidebar
function slider_string_val(value) {
    if (value == 0) {
        return '0 (peu importe)'
    } else if (value == 10) {
        return '10 (très important)'
    } else {
        return value
    }
}

// MAJ qd bouge le curseur
function updateSliderValue(sliderId, valueId) {
    var slider = document.getElementById(sliderId);
    var valueSpan = document.getElementById(valueId);
    valueSpan.textContent = slider_string_val(slider.value);
}

document.getElementById('poids_dpop_desc').addEventListener('input', function() {
    updateSliderValue('poids_dpop_desc', 'value_poids_dpop_desc');
});
document.getElementById('poids_foret').addEventListener('input', function() {
    updateSliderValue('poids_foret', 'value_poids_foret');
});

// récupérer les valeurs quand on clique sur le bouton puis fetch avec nouveaux paramètres quand appuie sur le bouton
document.getElementById('sendButton').addEventListener('click', function() {
    //désactivation du bouton
    var sendButton = document.getElementById('sendButton')
    sendButton.disabled = true;
    sendButton.style.pointerEvents = 'none';
    sendButton.style.opacity = '0.5';
    // get users params
    var value_poids_dpop_desc = document.getElementById('poids_dpop_desc').value;
    var value_poids_foret = document.getElementById('poids_foret').value;
    var values = {
        poids_dpop_desc: parseInt(value_poids_dpop_desc),
        poids_foret: parseInt(value_poids_foret)
    };
    console.log(values);
    // clear layer and get updated jsons
    geoJsonLayerGroup.clearLayers();
    fetch_all_new_geojson(newApiEndpoint, values)
});