import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB-RJIVsID45XTV2OrPfJbYBi3NQTJl5Eo",
  authDomain: "pharmacy-harkat.firebaseapp.com",
  projectId: "pharmacy-harkat"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= LOAD PRODUCTS =================
async function loadProducts(category = null, search = "") {
  const container = document.querySelector(".product-grid");
  const newContainer = document.getElementById("new-products");
  container.innerHTML = "";
  if (newContainer) newContainer.innerHTML = "";

  const snapshot = await getDocs(collection(db, "products"));
  let all = [];
  let found = false;
  snapshot.forEach(doc => all.push(doc.data()));

  // Page d'accueil avec Nouveaux produits
  if (!category && !search) {
    container.innerHTML = `<p style="text-align:center; width:100%; color:#666;">
      Choisissez une catégorie ou recherchez un produit
    </p>`;

    if (newContainer) {
      const latest = all.slice(-10).reverse();
      latest.forEach((p, index) => {
        const div = document.createElement("div");
        div.className = "popular-item";
        div.dataset.name = p.name;
        div.dataset.image = p.image;
        div.style.position = "relative";
        div.innerHTML = `
          ${index === 0 ? '<span class="badge">NEW</span>' : ''}
          <img src="${p.image}">
          <p>${p.name}</p>
        `;
        newContainer.appendChild(div);
      });
    }
  }

  // Section produits filtrés
  snapshot.forEach(doc => {
    const p = doc.data();
    if (category && p.category !== category) return;
    if (search && !p.name.toLowerCase().includes(search)) return;
    found = true;

    const div = document.createElement("div");
    div.className = "product";
    div.dataset.name = p.name;
    div.dataset.image = p.image;
    div.innerHTML = `
      <img src="${p.image}">
      <h3>${p.name}</h3>
      <p style="color:${p.available ? 'green' : 'red'};">
        ${p.available ? "Disponible" : "Indisponible"}
      </p>
      <button>Commander</button>
    `;
    container.appendChild(div);
  });

  if (!found && (category || search)) {
    container.innerHTML = `<p style="text-align:center; width:100%; color:#999;">Aucun résultat trouvé</p>`;
  }

  // Attache les événements popup **après génération de tous les éléments**
  attachPopupEvents();
}

// ================= SEARCH =================
const searchInput = document.getElementById("search");
searchInput.addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    loadProducts(null, searchInput.value.toLowerCase());
  }
});

// ================= POPUP & FORMULAIRE =================
let currentProduct = "";
function attachPopupEvents() {
  // Tous les produits et populaires
  document.querySelectorAll('.product, .popular-item').forEach(el => {
    el.onclick = function(e) {
      currentProduct = el.dataset.name;
      const popup = document.getElementById("popup");
      popup.style.display = "flex";
      document.getElementById("popup-img").src = el.dataset.image;
      document.getElementById("popup-name").innerText = currentProduct;
    };

    const btn = el.querySelector('button');
    if (btn) {
      btn.onclick = function(e) {
        e.stopPropagation();
        currentProduct = el.dataset.name;
        const popup = document.getElementById("popup");
        popup.style.display = "flex";
        document.getElementById("popup-img").src = el.dataset.image;
        document.getElementById("popup-name").innerText = currentProduct;
      };
    }
  });
}

window.closePopup = function() {
  document.getElementById("popup").style.display = "none";
};

// ================= WHATSAPP =================
const form = document.getElementById("delivery-form");
form.addEventListener("submit", function(e) {
  e.preventDefault();
  const clientName = document.getElementById("client-name").value;
  const clientPhone = document.getElementById("client-phone").value;
  const clientAddress = document.getElementById("client-address").value;
  const clientNote = document.getElementById("client-note").value;

  const msg = encodeURIComponent(
    `Bonjour 👋\nJe souhaite commander ce produit:\n➡️ ${currentProduct}\n\nNom: ${clientName}\nTéléphone: ${clientPhone}\nAdresse: ${clientAddress}\nRemarques: ${clientNote}`
  );

  window.open("https://wa.me/213556500591?text=" + msg);
});

// ================= FONCTION ACCUEIL =================
window.loadHome = function() {
  loadProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ================= START =================
window.loadProducts = loadProducts;
loadProducts();