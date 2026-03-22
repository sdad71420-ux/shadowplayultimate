// 🔥 FIREBASE CONFIG (REPLACE WITH YOUR REAL KEYS)
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_APP.firebaseapp.com",
  projectId: "YOUR_ID"
};

// INIT FIREBASE
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();

// =======================
// 📄 NAVIGATION
// =======================
function showPage(page) {
  document.querySelectorAll("section").forEach(sec => {
    sec.classList.remove("active");
  });
  document.getElementById(page).classList.add("active");
}

// =======================
// 📦 LOAD CONTENT
// =======================
function loadContent() {
  db.collection("content")
    .where("approved", "==", true)
    .get()
    .then(snapshot => {

      snapshot.forEach(doc => {
        let item = doc.data();
        item.id = doc.id;

        let container = document.getElementById(item.category);

        if (!container) return;

        let card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
          <img src="${item.image}">
          <h3>${item.title}</h3>
          <p>$${item.price || 0}</p>
          <p>⬇ ${item.downloads || 0}</p>
          <button onclick="downloadItem('${item.id}','${item.link}')">
            Download
          </button>
        `;

        container.appendChild(card);
      });

    });
}

// =======================
// ⬇ DOWNLOAD COUNTER
// =======================
function downloadItem(id, link) {

  const ref = db.collection("content").doc(id);

  ref.get().then(doc => {
    let current = doc.data().downloads || 0;

    ref.update({
      downloads: current + 1
    });

    window.open(link, "_blank");
  });

}

// =======================
// 📤 UPLOAD SYSTEM
// =======================
const form = document.getElementById("uploadForm");

if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();

    const user = auth.currentUser;

    db.collection("content").add({
      title: title.value,
      category: category.value,
      image: image.value,
      link: link.value,
      price: Number(price.value) || 0,
      user: user ? user.email : "anonymous",
      approved: false,
      downloads: 0,
      views: 0,
      rating: 0
    });

    alert("Uploaded! Waiting for admin approval 🔥");
    form.reset();
  });
}

// =======================
// 🔐 AUTH SYSTEM
// =======================
function signup() {
  auth.createUserWithEmailAndPassword(email.value, password.value)
    .then(() => alert("Account created ✅"))
    .catch(err => alert(err.message));
}

function login() {
  auth.signInWithEmailAndPassword(email.value, password.value)
    .then(() => alert("Logged in 🔥"))
    .catch(err => alert(err.message));
}

function logout() {
  auth.signOut();
}

// =======================
// 👤 PROFILE PAGE
// =======================
auth.onAuthStateChanged(user => {

  if (!user) return;

  const emailEl = document.getElementById("userEmail");
  if (emailEl) emailEl.innerText = user.email;

  const uploadsContainer = document.getElementById("myUploads");
  if (!uploadsContainer) return;

  db.collection("content")
    .where("user", "==", user.email)
    .get()
    .then(snapshot => {

      uploadsContainer.innerHTML = "";

      snapshot.forEach(doc => {
        let item = doc.data();

        let card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
          <h3>${item.title}</h3>
          <p>⬇ ${item.downloads || 0}</p>
        `;

        uploadsContainer.appendChild(card);
      });

    });

});

// =======================
// 🛡 ADMIN PANEL
// =======================
function loadAdmin() {

  const container = document.getElementById("adminContent");
  if (!container) return;

  db.collection("content").get().then(snapshot => {

    container.innerHTML = "";

    snapshot.forEach(doc => {
      let item = doc.data();

      let div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <h3>${item.title}</h3>
        <button onclick="approve('${doc.id}')">Approve</button>
        <button onclick="deleteItem('${doc.id}')">Delete</button>
      `;

      container.appendChild(div);
    });

  });
}

function approve(id) {
  db.collection("content").doc(id).update({ approved: true });
  alert("Approved ✅");
}

function deleteItem(id) {
  db.collection("content").doc(id).delete();
  alert("Deleted ❌");
}

// =======================
// 📊 DASHBOARD
// =======================
function loadDashboard() {

  const downloadsEl = document.getElementById("totalDownloads");
  if (!downloadsEl) return;

  let totalDownloads = 0;

  db.collection("content").get().then(snapshot => {

    snapshot.forEach(doc => {
      totalDownloads += doc.data().downloads || 0;
    });

    downloadsEl.innerText = totalDownloads;

  });
}

// =======================
// 🚀 INIT
// =======================
window.onload = () => {
  loadContent();
  loadAdmin();
  loadDashboard();
};