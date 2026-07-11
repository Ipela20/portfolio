/* =====================================================================
   SCRIPT.JS — Comportements interactifs du portfolio
   Sections : menu mobile / scroll spy, formulaire de contact (EmailJS),
   effet machine à écrire, chargement dynamique des compétences et
   projets (JSON), cartes retournables, animations ScrollReveal,
   modal CV.
===================================================================== */

$(document).ready(function () {

    // Menu mobile (hamburger) : ouverture/fermeture au clic
    $('#menu').click(function () {
        $(this).toggleClass('fa-times');
        $('.navbar').toggleClass('nav-toggle');
    });

    $(window).on('scroll load', function () {
        // Ferme le menu mobile si l'utilisateur scrolle
        $('#menu').removeClass('fa-times');
        $('.navbar').removeClass('nav-toggle');

        // Bouton "retour en haut" visible après 60px de scroll
        if (window.scrollY > 60) {
            document.querySelector('#scroll-top').classList.add('active');
        } else {
            document.querySelector('#scroll-top').classList.remove('active');
        }

        // Header transparent -> blanc après 30px de scroll
        if (window.scrollY > 30) {
            document.querySelector('.header').classList.add('scrolled');
        } else {
            document.querySelector('.header').classList.remove('scrolled');
        }

        // Scroll spy : met en surbrillance le lien du menu correspondant
        // à la section actuellement visible
        $('section').each(function () {
            let height = $(this).height();
            let offset = $(this).offset().top - 200;
            let top = $(window).scrollTop();
            let id = $(this).attr('id');

            if (top > offset && top < offset + height) {
                $('.navbar ul li a').removeClass('active');
                $('.navbar').find(`[href="#${id}"]`).addClass('active');
            }
        });
    });

    // Défilement fluide vers les ancres (#section)
    $('a[href*="#"]').on('click', function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top,
        }, 500, 'linear')
    });

    // Envoi du formulaire de contact via EmailJS
    $("#contact-form").submit(function (event) {
        emailjs.init({
            publicKey: "pvAFYY_9NxS-fzFEm"
        });

        emailjs.sendForm('service_b0gfcva', 'template_qait78d', '#contact-form')
            .then(function (response) {
                console.log('SUCCESS!', response.status, response.text);
                document.getElementById("contact-form").reset();
                alert("Message envoyé avec succès !");
            }, function (error) {
                console.log('FAILED...', error);
                alert("Échec de l'envoi. Réessayez !");
            });
        event.preventDefault();
    });

});

// Change le titre de l'onglet + le favicon quand l'utilisateur quitte
// puis revient sur la page
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === "visible") {
        document.title = "Portfolio | Boris Igor BALIMA";
        $("#favicon").attr("href", "assets/images/favicon.png");
    } else {
        document.title = "Come Back To Portfolio";
        $("#favicon").attr("href", "assets/images/favhand.png");
    }
});

// Boutons "Voir plus / Voir moins" dans la section Expérience
document.querySelectorAll('.voir-plus-btn').forEach(button => {
    button.addEventListener('click', () => {
        const details = button.nextElementSibling;
        if (details.style.display === "block") {
            details.style.display = "none";
            button.textContent = "Voir plus";
        } else {
            details.style.display = "block";
            button.textContent = "Voir moins";
        }
    });
});

// Effet machine à écrire du sous-titre sur l'accueil
var typed = new Typed(".typing-text", {
    strings: ["Front-End Developer", "Ingénieur IA", "Ingénieur IoT"],
    loop: true,
    typeSpeed: 50,
    backSpeed: 25,
    backDelay: 500,
});

/**
 * Charge un fichier JSON (compétences ou projets).
 * @param {"skills"|"projects"} type
 */
async function fetchData(type = "skills") {
    const response = type === "skills"
        ? await fetch("skills.json")
        : await fetch("Projects/projects.json"); // "Projects" avec P majuscule : doit correspondre EXACTEMENT au nom du dossier suivi par Git (sensible à la casse en ligne, contrairement à Windows en local)
    return await response.json();
}

// ===== SKILLS : affichage en cartes catégorisées =====
function showSkills(categories) {
    let skillsContainer = document.getElementById("skillsContainer");
    let html = "";

    categories.forEach(category => {
        html += `
        <div class="skill-category">
          <div class="skill-category-header">
            <span class="skill-category-icon"><i class="fas ${category.categoryIcon}"></i></span>
            <h3 class="skill-category-title">${category.category}</h3>
          </div>
          <div class="skill-category-grid">`;

        category.items.forEach(skill => {
            html += `
            <div class="bar">
              <div class="info">
                <img src="${skill.icon}" alt="${skill.name}" />
                <span>${skill.name}</span>
              </div>
            </div>`;
        });

        html += `
          </div>
        </div>`;
    });

    skillsContainer.innerHTML = html;
}

// ===== PROJETS : cartes qui se retournent au survol (recto/verso) =====
function showProjects(projects) {
    let projectsContainer = document.querySelector("#work .box-container");
    let projectHTML = "";

    projects.forEach(project => {
        projectHTML += `
        <div class="flip-card">
          <div class="flip-card-inner">

            <div class="flip-card-front">
              <div class="box-img-wrap">
                <img loading="lazy" draggable="false"
                     src="assets/images/projects/${project.image}" alt="${project.name}"
                     onerror="this.onerror=null; this.src='https://img.icons8.com/fluency/96/000000/code-file.png'; this.classList.add('img-fallback');" />
              </div>
              <span class="flip-hint"><i class="fas fa-sync-alt"></i> Survoler pour en savoir plus</span>
            </div>

            <div class="flip-card-back">
              <h3>${project.name}</h3>
              <p>${project.desc}</p>
              <a href="${project.links.view}" class="btn" target="_blank"><i class="fas fa-eye"></i> View</a>
            </div>

          </div>
        </div>`;
    });

    projectsContainer.innerHTML = projectHTML;

    // Anime l'apparition des cartes projets au scroll
    // (instance locale car les cartes n'existent qu'après ce rendu)
    const srtopProjects = ScrollReveal({
        origin: 'top',
        distance: '80px',
        duration: 1000,
        reset: true
    });
    srtopProjects.reveal('.work .flip-card', { interval: 200 });
}

// Chargement initial des données dynamiques
fetchData().then(data => showSkills(data));
fetchData("projects").then(data => showProjects(data));

// Effet tilt 3D léger au survol des éléments marqués .tilt
VanillaTilt.init(document.querySelectorAll(".tilt"), {
    max: 15,
});

/* ===== Animations ScrollReveal (apparition au scroll) ===== */
const srtop = ScrollReveal({
    origin: 'top',
    distance: '80px',
    duration: 1000,
    reset: true
});

// Accueil
srtop.reveal('.home .content h3', { delay: 200 });
srtop.reveal('.home-subtitle', { delay: 200 });
srtop.reveal('.home-cta', { delay: 400 });
srtop.reveal('.home-socials a', { interval: 200 });

// À propos
srtop.reveal('.about .content h3', { delay: 200 });
srtop.reveal('.about .content .tag', { delay: 200 });
srtop.reveal('.about .content p', { delay: 200 });
srtop.reveal('.about .content .box-container', { delay: 200 });
srtop.reveal('.about .content .resumebtn', { delay: 200 });

// Compétences
srtop.reveal('.skills .container', { interval: 200 });
srtop.reveal('.skill-category', { interval: 200 });

// Formation
srtop.reveal('.education .box', { interval: 200 });

// Expérience
srtop.reveal('.experience .timeline', { delay: 400 });
srtop.reveal('.experience .timeline .container', { interval: 400 });

// Contact
srtop.reveal('.contact .container', { delay: 400 });
srtop.reveal('.contact .container .form-group', { delay: 400 });

/* ===== Modal CV ===== */
const cvModal = document.getElementById('cvModal');

document.querySelectorAll('.open-cv-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        cvModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

function closeCvModal() {
    cvModal.classList.remove('active');
    document.body.style.overflow = '';
}

document.querySelector('.cv-modal-close').addEventListener('click', closeCvModal);
document.querySelector('.cv-modal-overlay').addEventListener('click', closeCvModal);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCvModal();
});