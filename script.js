document.addEventListener("DOMContentLoaded", async () => {
  const galleryGrid = document.querySelector(".gallery-grid") || document.querySelector(".portfolio-grid") || document.getElementById("gallery");
  const filterButtons = document.querySelectorAll(".filter-btn");

  // 1. Fungsi Render Kartu Foto ke Website
  function renderCard(title, category, imageSrc, caption, isCMS = false) {
    if (!galleryGrid) return;

    // Normalisasi kelas kategori untuk filtering (misal: "Black and White" -> "black-and-white")
    const categoryClass = category ? category.toLowerCase().trim().replace(/\s+/g, '-') : 'all';

    const card = document.createElement("div");
    card.className = `gallery-item ${categoryClass}`;
    card.setAttribute("data-category", categoryClass);

    card.innerHTML = `
      <div class="card-inner">
        <img src="${imageSrc}" alt="${title}" loading="lazy">
        <div class="overlay">
          <span class="tag">${category}</span>
          <h3>${title}</h3>
          ${caption ? `<p>${caption}</p>` : ''}
        </div>
      </div>
    `;

    // Foto baru dari CMS ditaruh di paling awal, foto lama di belakang
    if (isCMS) {
      galleryGrid.prepend(card);
    } else {
      galleryGrid.appendChild(card);
    }

    // Tambahkan event click untuk Lightbox/Modal jika ada
    card.addEventListener("click", () => openLightbox(imageSrc, title, category, caption));
  }

  // 2. Fungsi Membaca File Markdown Foto dari Decap CMS
  async function loadCMSImages() {
    try {
      const response = await fetch("https://api.github.com/repos/ezermanihuruk/galeri-moses/contents/content/gallery");
      if (!response.ok) return;

      const files = await response.json();

      for (const file of files) {
        if (file.name.endsWith(".md")) {
          const res = await fetch(file.download_url);
          const text = await res.text();

          // Parsing data Frontmatter (YAML) di dalam file Markdown
          const parts = text.split("---");
          if (parts.length >= 3) {
            const yamlData = parts[1];
            const data = jsyaml.load(yamlData);

            if (data && data.image) {
              renderCard(
                data.title || 'Untitled',
                data.category || 'General',
                data.image,
                data.caption || '',
                true
              );
            }
          }
        }
      }
    } catch (error) {
      console.warn("Belum ada data foto baru dari CMS atau gagal memuat:", error);
    }
  }

  // 3. Logika Filter Kategori Foto
  if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener("click", () => {
        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const filterValue = button.getAttribute("data-filter").toLowerCase().trim();
        const items = document.querySelectorAll(".gallery-item");

        items.forEach(item => {
          const itemCategory = item.getAttribute("data-category");
          if (filterValue === "all" || itemCategory === filterValue || itemCategory.includes(filterValue)) {
            item.style.display = "block";
          } else {
            item.style.display = "none";
          }
        });
      });
    });
  }

  // 4. Logika Lightbox / Pop-up Preview Gambar
  function openLightbox(src, title, category, caption) {
    const lightbox = document.getElementById("lightbox");
    if (!lightbox) return;

    const lightboxImg = lightbox.querySelector(".lightbox-img") || lightbox.querySelector("img");
    const lightboxTitle = lightbox.querySelector(".lightbox-title") || lightbox.querySelector("h3");
    const lightboxCaption = lightbox.querySelector(".lightbox-caption") || lightbox.querySelector("p");

    if (lightboxImg) lightboxImg.src = src;
    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxCaption) lightboxCaption.textContent = caption || category;

    lightbox.classList.add("active");
    lightbox.style.display = "flex";
  }

  // Close Lightbox
  const closeBtn = document.querySelector(".lightbox-close") || document.querySelector(".close");
  const lightbox = document.getElementById("lightbox");

  if (closeBtn && lightbox) {
    closeBtn.addEventListener("click", () => {
      lightbox.classList.remove("active");
      lightbox.style.display = "none";
    });

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove("active");
        lightbox.style.display = "none";
      }
    });
  }

  // Jalankan pemuatan foto CMS
  await loadCMSImages();
});
