document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById('searchInput');
    const suggestionsContainer = document.getElementById('suggestionsContainer');

    searchInput.addEventListener("input", function() {
        const query = this.value;

        if (query.length < 3) {
            suggestionsContainer.innerHTML = ''; // Nettoyer les suggestions si moins de 3 caractères
            return;
        }

        fetch(https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=5)
            .then(response => response.json())
            .then(data => {
                const suggestions = data.features.map(feature => feature.properties.city).filter((value, index, self) => self.indexOf(value) === index);
                displaySuggestions(suggestions);
            })
            .catch(error => console.error('Erreur lors de la récupération des données:', error));
    });

    function displaySuggestions(suggestions) {
        suggestionsContainer.innerHTML = ''; // Nettoyer les suggestions précédentes

        suggestions.forEach(suggestion => {
            const suggestionElement = document.createElement('div');
            suggestionElement.textContent = suggestion;
            suggestionElement.style.padding = '10px';
            suggestionElement.style.cursor = 'pointer';
            suggestionElement.addEventListener('click', function() {
                searchInput.value = suggestion; // Mettre à jour l'input avec la suggestion sélectionnée
                suggestionsContainer.innerHTML = ''; // Nettoyer les suggestions
            });

            suggestionsContainer.appendChild(suggestionElement);
        });
    }
});