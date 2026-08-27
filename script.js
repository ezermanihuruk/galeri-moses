let galleryData = [];

// Memuat data dari Decap CMS
async function fetchGalleryData() {
  const container = document.getElementById('gallery-grid');
  
  try {
    const response = await fetch('/content/gallery/index.json'); 
    if (response.ok) {
      galleryData = await response.json();
    } else {
      // Fallback Data Bawaan jika belum ada upload via CMS
      galleryData = [
        {
          title: "Energi Panggung Konser",
          category: "Stage",
          image: "images/Stage/1.jpeg",
          caption: "Pencahayaan panggung dengan kontras warna tinggi."
        },
        {
          title: "Karakter Wajah & Emosi",
          category: "Human",
          image: "images/Human/1.jpeg",
          caption: "Potret ekspresi autentik pencahayaan dramatis."
        },
        {
          title: "Bayangan & Siluet B&W",
          category: "Black and White",
          image: "images/Black%20and%20White/1.jpeg",
          caption: "Eksplorasi kontras gelap terang klasik."
        },
        {
          title: "Aksi Kecepatan Lapangan",
          category: "Sport",
          image: "images/Sport/1.jpeg",
          caption: "Membekukan gerakan dalam momen presisi tinggi."
        },
        {
          title: "Momen Perayaan",
          category: "Event",
          image: "images/Event/1.jpeg",
          caption: "Dokumentasi suasana dan kegembiraan acara."
        },
        {
          title: "Simetri Ruang & Bangunan",
          category: "Arsitektur",
          image: "images/Arsitektur/1.jpeg",
          caption: "Eksplorasi garis dan struktur arsitektur."
        }
      ];
    }
    renderGallery(galleryData);
  } catch (error) {
    console.log("Menggunakan data bawaan awal...", error);
    renderGallery(galleryData);
  }
}

function renderGallery(items) {
  const container = document.getElementById('gallery-grid');
  if (!container) return;
  
  container.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.onclick = () => openModal(item.image, item.title, item.caption);

    card.innerHTML = `
      <div class="img-wrapper">
        <img src="${item.image}" alt="${item.title}">
      </div>
      <div class="gallery-info">
        <h4>${item.title}</h4>
      </div>
    `;
    container.appendChild(card);
  });
}

function filterCategory(category) {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    const btnText = btn.innerText.toLowerCase();
    const catText = category.toLowerCase();
    
    if(btnText === catText || (category === 'all' && btnText === 'semua') || (catText === 'black and white' && btnText === 'black & white')) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (category === 'all') {
    renderGallery(galleryData);
  } else {
    const filtered = galleryData.filter(item => item.category.toLowerCase() === category.toLowerCase());
    renderGallery(filtered);
  }
}

function openModal(src, title, caption) {
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalText = document.getElementById('modal-text');
  const modal = document.getElementById('lightbox-modal');

  if (modalImg && modal) {
    modalImg.src = src;
    modalTitle.innerText = title || '';
    modalText.innerText = caption || '';
    modal.style.display = 'flex';
  }
}

function closeModal() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', fetchGalleryData);