document.addEventListener("DOMContentLoaded", function(){
  const input = document.querySelector('#recherche');
  const sugestion = document.querySelector("#sugestion");
  const h2Nom = document.getElementById("nom");
  const icon_temp = document.getElementById("icon_temp");
  const pDescription = document.getElementById("description");
  const pTemperature = document.getElementById("temperature");
  const pHumidite = document.getElementById("humidite");
  const pVent = document.getElementById("vent");
  const pPresipitation = document.getElementById("presipitation");
  var lat = 49.4333;
  var lon = 2.0833;
  var map; // Référence à l'objet de carte
  var marker; // Référence au marqueur

  // Fonction pour initialiser la carte et ajouter le marqueur
  function initMap() {
    map = L.map('map').setView([lat, lon], 13);
    marker = L.marker([lat, lon]).addTo(map);

    // Ajouter les popups
    marker.bindPopup().openPopup();

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Appeler la fonction pour récupérer les données météo pour Beauvais
    getWeatherData(lat, lon)
      .then(weatherData => {
        const name = weatherData.name;
        const description = weatherData.weather[0].description;
        const iconUrl = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`;
        const temp = weatherData.main.temp;
        const hum = weatherData.main.humidity;
        const vent = weatherData.wind.speed;
        const presip = weatherData.clouds.all;
        // Effacer le contenu existant de la div resultat
        // resultatDiv.innerHTML = "";
    
        h2Nom.textContent = name;
        icon_temp.src = (iconUrl);
        pDescription.textContent = description;
        pTemperature.textContent = "Température : " + temp;
        pHumidite.textContent = "Humidité : " + hum;
        pVent.textContent = "Vent : " + vent;
        pPresipitation.textContent = "Présipitation : " + presip;
        
        // Mettre à jour le contenu du popup de la carte Leaflet
        const popupContent = `
            <b>${name}</b><br>
            Description: ${description}<br>
            Temperature: ${temp}°C<br>
            Humidity: ${hum}%<br>
            Wind Speed: ${vent} m/s<br>
            Cloudiness: ${presip}%
        `;
        marker.bindPopup(popupContent).openPopup();
    })
    .catch(error => {
        console.error('Erreur lors de la récupération des données:', error);
    });
  }

  // Appeler la fonction pour initialiser la carte au chargement de la page
  initMap();

  input.addEventListener("input", function() {
    const query = this.value;

    if (query.length < 3) {
        sugestion.innerHTML = ''; // Nettoyer les suggestions si moins de 3 caractères
        return;
    }

    fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=5`)
        .then(response => response.json())
        .then(data => {
            const suggestions = data.features.map(feature => feature.properties).filter((value, index, self) => self.indexOf(value) === index);
            updateAutocompleteSuggestions(suggestions);
        })
        .catch(error => console.error('Erreur lors de la récupération des données:', error));
  });

  // Fonction pour mettre à jour les suggestions d'autocomplétion dans le champ de recherche
  function updateAutocompleteSuggestions(suggestions) {
    // Effacer les anciennes suggestions
    sugestion.innerHTML = "";
    // Ajouter les nouvelles suggestions
    suggestions.forEach(suggestion => {
      const ville = suggestion.label;
      const codePost = suggestion.postcode;
      const option = document.createElement('div');
      option.textContent = ville + " " + codePost;
      option.addEventListener('click', function() {
        input.value = ville; // Mettre à jour l'input avec la suggestion sélectionnée
        sugestion.innerHTML = ''; // Nettoyer les suggestions
        

        // Récupérer les données de la ville sélectionnée et afficher les données météo
        getCityData(ville, codePost)
          .then(cityData => {
            // Récupérer les coordonnées de la ville
            lon = cityData.features[0].geometry.coordinates[0];
            lat = cityData.features[0].geometry.coordinates[1];

            // Mettre à jour les coordonnées du marqueur
            marker.setLatLng([lat, lon]);

            // Centrer la carte sur les nouvelles coordonnées
            map.setView([lat, lon]);

            // Appeler la fonction pour récupérer les données météo
            return getWeatherData(lat, lon);
          })
          .then(weatherData => {
            const name = weatherData.name;
            const description = weatherData.weather[0].description;
            const iconUrl = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`;
            const temp = weatherData.main.temp;
            const hum = weatherData.main.humidity;
            const vent = weatherData.wind.speed;
            const presip = weatherData.clouds.all;
            // Effacer le contenu existant de la div resultat
            // resultatDiv.innerHTML = "";
        
            h2Nom.textContent = name;
            icon_temp.src = (iconUrl);
            pDescription.textContent = description;
            pTemperature.textContent = "Température : " + temp;
            pHumidite.textContent = "Humidité : " + hum;
            pVent.textContent = "Vent : " + vent;
            pPresipitation.textContent = "Présipitation : " + presip;
        
            // Mettre à jour le contenu du popup de la carte Leaflet
            const popupContent = `
                <b>${name}</b><br>
                Description: ${description}<br>
                Temperature: ${temp}°C<br>
                Humidity: ${hum}%<br>
                Wind Speed: ${vent} m/s<br>
                Cloudiness: ${presip}%
            `;
            marker.bindPopup(popupContent).openPopup();
        })
        
        
          .catch(error => {
            console.error('Erreur lors de la récupération des données:', error);
          });
      });

      sugestion.appendChild(option);
    });
  }

  // Écouter l'événement de soumission du formulaire
  const form = document.querySelector('#form');
  form.addEventListener('submit', function(event) {
    // Empêcher le comportement par défaut du formulaire (rechargement de la page)
    event.preventDefault();

    // Récupérer la valeur du champ de recherche
    const ville = input.value;

    // Appeler la fonction pour récupérer les données de la ville
    getCityData(ville)
      .then(cityData => {
        // Récupérer les coordonnées de la ville
        lon = cityData.features[0].geometry.coordinates[0];
        lat = cityData.features[0].geometry.coordinates[1];

        // Mettre à jour les coordonnées du marqueur
        marker.setLatLng([lat, lon]);

        // Centrer la carte sur les nouvelles coordonnées
        map.setView([lat, lon]);

        // Appeler la fonction pour récupérer les données météo
        return getWeatherData(lat, lon);
      })
      .then(weatherData => {
        const name = weatherData.name;
        const description = weatherData.weather[0].description;
        const iconUrl = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`;
        const temp = weatherData.main.temp;
        const hum = weatherData.main.humidity;
        const vent = weatherData.wind.speed;
        const presip = weatherData.clouds.all;
        // Effacer le contenu existant de la div resultat
        // resultatDiv.innerHTML = "";
    
        h2Nom.textContent = name;
        icon_temp.src = (iconUrl);
        pDescription.textContent = description;
        pTemperature.textContent = "Température : " + temp;
        pHumidite.textContent = "Humidité : " + hum;
        pVent.textContent = "Vent : " + vent;
        pPresipitation.textContent = "Présipitation : " + presip;
    
        // Mettre à jour le contenu du popup de la carte Leaflet
        const popupContent = `
            <b>${name}</b><br>
            Description: ${description}<br>
            Temperature: ${temp}°C<br>
            Humidity: ${hum}%<br>
            Wind Speed: ${vent} m/s<br>
            Cloudiness: ${presip}%
        `;
        marker.bindPopup(popupContent).openPopup();
    })
    
    
      .catch(error => {
        console.error('Erreur lors de la récupération des données:', error);
      });
  });
});

function getWeatherData(lat, lon) {
  return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=0d47d640a383307597fca125db84f064&units=metric&lang=fr`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur de réseau');
      }
      return response.json();
    })
    .catch(error => {
      console.error('Erreur:', error);
    });
}

function getCityData(nom, postcode) {
  let url = `https://api-adresse.data.gouv.fr/search/?q=${nom}`;
  if (postcode) {
    url += `&postcode=${postcode}`;
  }
  url += "&autocomplete=1";
  
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur de réseau');
      }
      return response.json();
    })
    .catch(error => {
      console.error('Erreur:', error);
      throw error;
    });
}
