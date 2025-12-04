document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    const FORMSPREE_ID = "mdkqdgdo";
    // ---------------------
    // --- GESTION MUSIQUE & INTRO ---
    const startOverlay = document.getElementById('startOverlay');
    const btnEnter = document.getElementById('btnEnter');
    const music = document.getElementById('bgMusic');

    // Réglage du volume (0.5 = 50%) pour pas exploser les oreilles
    music.volume = 0.5;

    btnEnter.addEventListener('click', () => {
        // 1. On lance la musique
        music.play().catch(error => {
            console.log("Lecture auto bloquée par le navigateur :", error);
        });

        // 2. On fait disparaitre l'écran noir
        startOverlay.classList.add('fade-out');

        // 3. On le supprime complètement après l'animation (1 seconde)
        setTimeout(() => {
            startOverlay.style.display = 'none';
        }, 1000);
    });
    // -------------------------------
    // Récupération des éléments
    const btnSubmit = document.getElementById('btnSubmit');
    const form = document.getElementById('conForm');
    const successMessage = document.getElementById('successMessage');
    const finalText = document.getElementById('finalText');
    const bobarmanNameInput = document.getElementById('bobarmanName');

    // Liste des étapes dans l'ordre (ID de la Div, ID de la Checkbox, ID de la Suivante)
    // On chaine les apparitions
    const chainReaction = [
        { trigger: 'checkShots', reveal: 'divCheckCry' },
        { trigger: 'checkCry', reveal: 'divCheckReallyNot' },
        { trigger: 'checkReallyNot', reveal: 'divCheckSwear' },
        { trigger: 'checkSwear', reveal: 'divCheckParents' },
        { trigger: 'checkParents', reveal: 'divCheckVictoire' }
    ];

    // Fonction pour afficher un élément avec animation
    function revealElement(elementId) {
        const el = document.getElementById(elementId);
        if(el) {
            el.classList.remove('d-none');
            el.style.opacity = 0;
            setTimeout(() => {
                el.style.transition = "opacity 0.5s";
                el.style.opacity = 1;
            }, 50);
        }
    }

    // Fonction pour cacher un élément et tout ce qui suit (si on décoche)
    function hideElement(elementId, checkboxIdInside) {
        const el = document.getElementById(elementId);
        const box = document.getElementById(checkboxIdInside);
        if(el) el.classList.add('d-none');
        if(box) box.checked = false;
    }

    // 1. Boucle pour créer les événements de la cascade
    chainReaction.forEach((step, index) => {
        const triggerBox = document.getElementById(step.trigger);

        triggerBox.addEventListener('change', function() {
            if (this.checked) {
                revealElement(step.reveal);
            } else {
                // Si on décoche, on doit cacher TOUS les suivants en cascade
                for (let i = index; i < chainReaction.length; i++) {
                    // On cherche la div à cacher dans l'étape actuelle
                    const divToHide = chainReaction[i].reveal;
                    // On cherche la checkbox à l'intérieur de cette div pour la décocher
                    // (Astuce : on regarde l'étape suivante pour savoir quelle checkbox est le trigger suivant)
                    let checkboxToUncheck = null;
                    if (i + 1 < chainReaction.length) {
                        checkboxToUncheck = chainReaction[i+1].trigger;
                    } else {
                        // Cas particulier pour la dernière étape (Victoire)
                        checkboxToUncheck = 'checkVictoire';
                    }

                    hideElement(divToHide, checkboxToUncheck);
                }
                // On cache aussi le bouton submit si on remonte haut
                btnSubmit.classList.add('d-none');
            }
        });
    });

    // 2. Gestion de la dernière case (Victoire Charpy) -> Révèle le bouton
    const checkVictoire = document.getElementById('checkVictoire');
    checkVictoire.addEventListener('change', function() {
        if (this.checked) {
            btnSubmit.classList.remove('d-none');
        } else {
            btnSubmit.classList.add('d-none');
        }
    });

    // 3. Gestion de l'envoi VERS Formspree
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const originalBtnText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = "ENVOI EN COURS...";
        btnSubmit.disabled = true;

        const data = new FormData(form);
        const name = bobarmanNameInput.value;

        fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
            method: 'POST',
            body: data,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                form.classList.add('d-none');
                finalText.innerHTML = `Merci <strong>${name}</strong> pour ta participation.<br>Les votes seront dévoilés le <strong>Vendredi 05 Décembre</strong>.`;
                successMessage.classList.remove('d-none');
            } else {
                response.json().then(data => {
                    if (Object.hasOwn(data, 'errors')) {
                        alert("Erreur : " + data["errors"].map(error => error["message"]).join(", "));
                    } else {
                        alert("Oups, une erreur s'est produite lors de l'envoi.");
                    }
                    btnSubmit.innerHTML = originalBtnText;
                    btnSubmit.disabled = false;
                });
            }
        }).catch(error => {
            alert("Erreur réseau : Vérifie ta connexion.");
            btnSubmit.innerHTML = originalBtnText;
            btnSubmit.disabled = false;
        });
    });
});