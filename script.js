// ================ INITIALISATION ================
let clientsDB = JSON.parse(localStorage.getItem('clientsDB')) || [];

// ================ AUTHENTIFICATION ================
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (email && password) {
        localStorage.setItem('userEmail', email);
        if (email.includes('admin@')) {
            showPage('dashboard-page');
        } else {
            showPage('document-page');
        }
    } else {
        alert('Veuillez remplir tous les champs');
    }
});

// ================ GESTION DOCUMENT CLIENT ================
if (document.getElementById('gasForm')) {
    // Initialisation SignaturePad
    const canvas = document.getElementById('signaturePad');
    const signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
    });

    document.getElementById('clearSignature').addEventListener('click', () => signaturePad.clear());

    
    document.getElementById('gasForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const edl = document.getElementById('clientEdl').value.trim();
    const clientIndex = clientsDB.findIndex(c => c.edl === edl);
    
    if (clientIndex === -1) {
        alert("EDL introuvable !");
        return;
    }
    
        if (signaturePad.isEmpty()) {
            alert("Veuillez signer le document");
            return;
        }
        
        // Mise à jour du client
    clientsDB[clientIndex] = {
        ...clientsDB[clientIndex],
        status: "Signé",
        signedAt: new Date().toISOString(),
            signature: signaturePad.toDataURL()
    };
    
    localStorage.setItem('clientsDB', JSON.stringify(clientsDB));
        alert("Document signé !");
            showPage('dashboard-page');
});
}
window.downloadSignature = function(edl) {
    const client = clientsDB.find(c => c.edl === edl);
    if (!client?.signature) return;

    const link = document.createElement('a');
    link.href = client.signature;
    link.download = `signature_${client.edl}_${client.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// ================ DASHBOARD ADMIN ================
// ===== AFFICHAGE DU TABLEAU =====
function loadClientsTable() {
    const tbody = document.querySelector('#documentsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = clientsDB.map(client => `
        <tr>
            <td>${client.edl}</td>
            <td>${client.name}</td>
            <td>${client.address || '-'}</td>
            <td>${client.floor || '-'}</td>
            <td>${client.signedAt ? new Date(client.signedAt).toLocaleDateString('fr-FR') : '-'}</td>
            <td class="status ${client.status.toLowerCase()}">${client.status}</td>
            <td>
                ${client.signature ? 
                    `<button onclick="viewSignature('${client.edl}')" class="btn-view-signature">
                        <i class="fas fa-eye"></i> Voir
                    </button>` : 
                    '<span class="no-signature">Non signé</span>'
                }
                <button onclick="deleteClient('${client.edl}')" class="btn-delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
            <td>
                <input type="checkbox" ${client.reopened ? 'checked' : ''}
                    onchange="toggleReopen('${client.edl}', this.checked)">
            </td>
            <td>${client.comments || '-'}</td>
        </tr>
    `).join('');
}

window.viewSignature = function(edl) {
    const client = clientsDB.find(c => c.edl === edl);
    if (!client?.signature) {
        alert("Aucune signature trouvée pour ce client");
        return;
    }

    // Créer une modal pour afficher la signature
    const modal = document.createElement('div');
    modal.className = 'signature-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h3>Signature de ${client.name}</h3>
            <p>EDL: ${client.edl} - Signé le ${new Date(client.signedAt).toLocaleDateString('fr-FR')}</p>
            <img src="${client.signature}" alt="Signature" class="signature-img">
            <div class="modal-actions">
                <button onclick="downloadSignature('${client.edl}')">
                    <i class="fas fa-download"></i> Télécharger
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};
// Charge les données au démarrage
document.addEventListener('DOMContentLoaded', loadClientsTable);

// ================ FONCTIONS UTILITAIRES ================
window.deleteClient = function(edl) {
    if (confirm("Supprimer ce client ?")) {
        clientsDB = clientsDB.filter(c => c.edl !== edl);
        localStorage.setItem('clientsDB', JSON.stringify(clientsDB));
        loadClientsTable();
    }
};

window.toggleReopen = function(edl) {
    console.log("Réouverture pour EDL:", edl);
    // Logique supplémentaire si nécessaire
};

function showPage(pageId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.toggle('hidden', section.id !== pageId);
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadClientsTable();
    if (document.getElementById('signaturePad')) {
        // Redimensionnement canvas
        const resizeCanvas = () => {
            const canvas = document.getElementById('signaturePad');
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }
});
///////////======================side bar interactivité==================================================
// Gestion du toggle
document.getElementById('clientCreationToggle')?.addEventListener('click', function(e) {
    e.preventDefault();
    this.classList.toggle('active');
    
    // Animation spéciale
    if (this.classList.contains('active')) {
        const icon = this.querySelector('.magic-icon');
        icon.style.animation = 'pulse 1s';
        setTimeout(() => {
            icon.style.animation = '';
        }, 1000);
}
});

// Effet soumission
document.getElementById('addClientForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const btn = this.querySelector('button');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Création...';
    
    // Simulation traitement
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> Réussi !';
        btn.style.background = '#4CAF50';
        
        // Réinitialisation après 2s
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-sparkle"></i> Créer';
            btn.style.background = 'rgba(165, 214, 167, 0.2)';
            e.target.reset();
        }, 2000);
    }, 1500);
    
    // Ici votre logique d'ajout client...
});
// ===== AJOUT CLIENT =====
document.getElementById('addClientForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const edl = document.getElementById('newEdl').value.trim();
    const name = document.getElementById('newClientName').value.trim();
    const floor = document.getElementById('newFloor').value.trim();
    const address = document.getElementById('newAddress').value.trim();

    // Validation
    if (!edl || !name) {
        alert("EDL et Nom sont obligatoires !");
        return;
    }

    // Vérifie les doublons
    if (clientsDB.some(client => client.edl === edl)) {
        alert("Cet EDL existe déjà !");
        return;
    }

    // Ajoute le client
    clientsDB.push({
        edl, name, floor, address,
        status: "En attente",
        signedAt: null,
        signature: null
    });

    // Sauvegarde + affichage
    localStorage.setItem('clientsDB', JSON.stringify(clientsDB));
    loadClientsTable(); // Rafraîchit le tableau
    this.reset(); // Réinitialise le formulaire
    console.log("Client ajouté :", { edl, name }); // Debug
});
// ================ IMPORT EXCEL ================
document.getElementById('excelImport').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const newClients = [];

            // Traiter chaque feuille du fichier Excel
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                
                console.log(`Données de la feuille "${sheetName}":`, jsonData); // Debug

                // 1. Extraire l'adresse depuis l'en-tête de la colonne F
                let address = "";
                const headerF = worksheet['F1'] ? worksheet['F1'].v : "";
                if (typeof headerF === 'string') {
                    const addressMatch = headerF.match(/(\d+.+)/); // Capture tout après le numéro
                    if (addressMatch) address = addressMatch[0].trim();
                }

                // 2. Traiter chaque ligne de la feuille
                jsonData.forEach(row => {
                    if (!row['Référence'] && !row['reference']) return; // Ignorer les lignes sans référence
                    
                    newClients.push({
                        edl: (row['Référence'] || row['reference'] || "").toString().trim(),
                        name: (row['PDS - Occupant'] || row['Occupant'] || "").toString().trim(),
                        floor: (row['Etage'] || row['Étage'] || "").toString().trim(),
                        address: address,
                        status: "En attente",
                        signedAt: null,
                        signature: null,
                        comments: (row['PDS - commentaires EPI'] || row['Commentaires'] || "").toString().trim()
                    });
                });
            });

            // 3. Filtrer et ajouter les nouveaux clients
            const uniqueNewClients = newClients.filter(client => 
                client.edl && !clientsDB.some(c => c.edl === client.edl)
            );

            clientsDB = [...clientsDB, ...uniqueNewClients];
            localStorage.setItem('clientsDB', JSON.stringify(clientsDB));
            
            // 4. Mettre à jour l'interface
            loadClientsTable();
            updateStatsCards();
            
            alert(`${uniqueNewClients.length} nouveaux clients importés depuis ${workbook.SheetNames.length} feuille(s) !`);

        } catch (error) {
            console.error("Erreur complète:", error);
            alert(`Échec de l'import: ${error.message}`);
        }
    };
    reader.readAsArrayBuffer(file);
});
//============ filtre client============>

// Fonction de filtrage
function filterClients() {
    const searchTerm = document.getElementById('clientSearch').value.toLowerCase();
    const filteredClients = clientsDB.filter(client => 
        client.edl.toLowerCase().includes(searchTerm) || 
        (client.address && client.address.toLowerCase().includes(searchTerm))
    );
    
    updateTable(filteredClients);
}

// Mise à jour du tableau (séparée pour réutilisation)
function updateTable(clientsToDisplay) {
    const tbody = document.querySelector('#documentsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = clientsToDisplay.map(client => `
        <tr>
            <td>${client.edl}</td>
            <td>${client.name}</td>
            <td>${client.address || '-'}</td>
        <td>${client.floor || '-'}</td>
            <td>${client.signedAt ? new Date(client.signedAt).toLocaleDateString('fr-FR') : '-'}</td>
            <td class="status ${client.status.toLowerCase()}">${client.status}</td>
            <td>
                ${client.signature ? 
                    `<button onclick="viewSignature('${client.edl}')"><i class="fas fa-eye"></i></button>` : ''
                }
                <button onclick="deleteClient('${client.edl}')"><i class="fas fa-trash"></i></button>
            </td>
                 <td>
                <input 
                    type="checkbox" 
                    ${client.reopened ? 'checked' : ''}
                    onchange="toggleReopen('${client.edl}', this.checked)"  >
            </td>
        
            <td>
                <textarea 
                    class="comment-field" 
                    onblur="updateComments('${client.edl}', this.value)"
                    ${!client.edl ? 'disabled' : ''}  <!-- Désactivé si pas de référence -->
                >${client.comments || ''}</textarea>
            </td>
            </tr>
    `).join('');
}

// Modification de loadClientsTable()
function loadClientsTable() {
    updateTable(clientsDB); // Affiche tous les clients par défaut
}

// Recherche en temps réel (optionnel)
document.getElementById('clientSearch')?.addEventListener('input', filterClients);

// ========= outil aide a ladresse =======  //
let autocomplete;

function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('clientAddress'),
        { types: ['address'], componentRestrictions: { country: 'fr' } }
    );

    // Optionnel : Remplir automatiquement les champs associés
    autocomplete.addListAener('place_changed', () => {
        const place = autocomplete.getPlace();
        console.log("Adresse sélectionnée :", place.formatted_address);
        
        // Exemple : Extraire le code postal
        const postalCode = place.address_components.find(c => 
            c.types.includes('postal_code')
        )?.long_name;
        if (postalCode) {
            document.getElementById('postalCode').value = postalCode;
        }
    });
}

// Bloque la soumission du formulaire si l'adresse n'est pas valide
document.getElementById('gasForm')?.addEventListener('submit', (e) => {
    if (!autocomplete.getPlace()) {
        e.preventDefault();
        alert("Veuillez sélectionner une adresse valide");
    }
});

//  OpenData France
document.getElementById('clientAddress').addEventListener('input', async (e) => {
    const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${e.target.value}&limit=5`);
    const data = await response.json();
    console.log("Suggestions :", data.features);
});

// ================fonctions de cartes ============ //


function updateStatsCards() {
    const clients = JSON.parse(localStorage.getItem('clientsDB')) || [];
    
    // 1. Documents signés
    const signedCount = clients.filter(c => c.status === "Signé").length;
    document.getElementById('signedDocsCount').textContent = signedCount;
    
    // 3. Clients NON réouverts - Version PROTÉGÉE
    const nonReopenedCount = clients.filter(client => {
        // Vérification robuste de la propriété reopened
        return client.reopened === false || client.reopened === undefined;
    }).length;
    
    document.getElementById('pendingDocsCount').textContent = nonReopenedCount;
    console.log("Clients non réouverts:", nonReopenedCount);

    // 3. PDS (nombre total de clients)
    document.getElementById('pdsCount').textContent = clients.length;
    
    // Calcul des pourcentages (exemple simplifié)
    updatePercentage('signedDocsCount', 12);
    updatePercentage('pendingDocsCount', -5); 
    updatePercentage('pdsCount', 8);
}

// Helper pour mettre à jour les pourcentages
function updatePercentage(cardId, percent) {
    const element = document.querySelector(`#${cardId} + .stat-change`);
    if (!element) return;
    
    element.classList.toggle('up', percent >= 0);
    element.classList.toggle('down', percent < 0);
    element.textContent = `${percent >= 0 ? '+' : ''}${percent}% ce mois`;
}

// Appeler cette fonction quand les données changent
document.addEventListener('DOMContentLoaded', updateStatsCards);

// À exécuter une fois dans la console
window.toggleReopen = function(edl, isChecked) {
    const clients = JSON.parse(localStorage.getItem('clientsDB'));
    const clientIndex = clients.findIndex(c => c.edl === edl);
    if (clientIndex !== -1) {
        clients[clientIndex].reopened = isChecked; // Cette ligne est cruciale
        localStorage.setItem('clientsDB', JSON.stringify(clients));
    }
};