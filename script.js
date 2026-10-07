let galleryData = [];

// Fungsi Mengambil File Markdown dari Decap CMS via GitHub API (Di-fetch Paralel dengan Promise.all)
async function fetchCMSData() {
  try {
    const res = await fetch("https://api.github.com/repos/ezermanihuruk/galeri-moses/contents/content/gallery");
    if (!res.ok) return [];

    const files = await res.json();
    const mdFiles = files.filter(file => file.name && file.name.endsWith(".md"));

    // Fetch semua isi file markdown secara PARALEL (jauh lebih cepat)
    const cmsItems = await Promise.all(
      mdFiles.map(async (file) => {
        try {
          const fileRes = await fetch(file.download_url);
          const text = await fileRes.text();

          // Parsing Frontmatter YAML
          const parts = text.split("---");
          if (parts.length >= 3 && typeof jsyaml !== "undefined") {
            const data = jsyaml.load(parts[1]);
            if (data && data.image) {
              return {
                title: data.title ? data.title.trim() : "",
                category: data.category || "General",
                image: data.image,
                caption: data.caption || ""
              };
            }
          }
        } catch (err) {
          console.warn("Gagal memuat file:", file.name, err);
        }
        return null;
      })
    );

    // Filter file yang gagal / null
    return cmsItems.filter(item => item !== null);
  } catch (err) {
    console.log("CMS belum memiliki foto baru atau offline, menggunakan data lokal.", err);
    return [];
  }
}

// Memuat data dari Decap CMS + Fallback Data Bawaan
async function fetchGalleryData() {
  const defaultData = [];

  try {
    const cmsData = await fetchCMSData();
    galleryData = [...cmsData, ...defaultData];
    renderGallery(galleryData);
  } catch (error) {
    console.log("Menggunakan data bawaan awal...", error);
    galleryData = defaultData;
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

    const titleHTML = item.title ? `<div class="gallery-info"><h4>${item.title}</h4></div>` : '';

    // TAMBAHAN: loading="lazy" dan decoding="async" untuk menghemat bandwidth awal
    card.innerHTML = `
      <div class="img-wrapper">
        <img src="${item.image}" alt="${item.title || 'Foto Galeri'}" loading="lazy" decoding="async" width="400" height="280">
      </div>
      ${titleHTML}
    `;
    container.appendChild(card);
  });
}

function filterCategory(category) {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    const btnText = btn.innerText.toLowerCase();
    const catText = category.toLowerCase();

    if (btnText === catText || (category === 'all' && btnText === 'semua') || (catText === 'black and white' && btnText === 'black & white')) {
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
