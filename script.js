/* ==========================================================================
   GALERI MOSES - SCRIPT
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. FILTERING GALERI ---
  const filterBtns = document.querySelectorAll(".filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");

  if (filterBtns.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Hapus kelas active dari semua tombol filter
        filterBtns.forEach((b) => b.classList.remove("active"));
        // Tambahkan kelas active pada tombol yang diklik
        btn.classList.add("active");

        const filterValue = btn.getAttribute("data-filter");

        galleryItems.forEach((item) => {
          if (filterValue === "all" || item.classList.contains(filterValue)) {
            item.style.display = "block";
            setTimeout(() => {
              item.style.opacity = "1";
              item.style.transform = "scale(1)";
            }, 50);
          } else {
            item.style.opacity = "0";
            item.style.transform = "scale(0.8)";
            setTimeout(() => {
              item.style.display = "none";
            }, 300);
          }
        });
      });
    });
  }

  // --- 2. LIGHTBOX / MODAL PREVIEW ---
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const closeBtn = document.querySelector(".lightbox .close");

  // Fungsi Buka Lightbox
  function attachLightboxEvents(items) {
    items.forEach((item) => {
      item.addEventListener("click", () => {
        const img = item.querySelector("img");
        const title = item.querySelector("h3") ? item.querySelector("h3").innerText : "";
        const category = item.querySelector(".category") ? item.querySelector(".category").innerText : "";

        if (lightbox && lightboxImg) {
          lightboxImg.src = img.src;
          if (lightboxCaption) {
            lightboxCaption.innerHTML = `<h3>${title}</h3><p>${category}</p>`;
          }
          lightbox.style.display = "flex";
        }
      });
    });
  }

  attachLightboxEvents(galleryItems);

  // Tutup Lightbox
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      if (lightbox) lightbox.style.display = "none";
    });
  }

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        lightbox.style.display = "none";
      }
    });
  }

  // --- 3. PEMUATAN OTOMATIS FOTO DARI DECAP CMS (/admin) ---
  const galleryGrid = document.querySelector(".gallery-grid") || document.querySelector(".grid");

  async function loadCMSPhotos() {
    if (!galleryGrid) return;

    try {
      // Mengambil daftar file markdown hasil upload admin dari GitHub API
      const res = await fetch("https://api.github.com/repos/ezermanihuruk/galeri-moses/contents/content/gallery");
      if (!res.ok) return;

      const files = await res.json();

      for (const file of files) {
        if (file.name.endsWith(".md")) {
          const fileRes = await fetch(file.download_url);
          const text = await fileRes.text();

          // Membaca Frontmatter YAML di dalam file markdown
          const parts = text.split("---");
          if (parts.length >= 3 && typeof jsyaml !== "undefined") {
            const data = jsyaml.load(parts[1]);

            if (data && data.image) {
              // Normalisasi nama kategori ke class filter (contoh: "Black and White" -> "black-and-white")
              const catClass = data.category ? data.category.toLowerCase().trim().replace(/\s+/g, "-") : "all";

              // Buat elemen item galeri baru
              const newItem = document.createElement("div");
              newItem.className = `gallery-item ${catClass}`;

              newItem.innerHTML = `
                <img src="${data.image}" alt="${data.title || 'Foto Galeri'}">
                <div class="overlay">
                  <h3>${data.title || ''}</h3>
                  <span class="category">${data.category || ''}</span>
                </div>
              `;

              // Masukkan foto baru dari admin ke urutan paling depan
              galleryGrid.prepend(newItem);

              // Pasang event Lightbox pada foto baru ini
              attachLightboxEvents([newItem]);
            }
          }
        }
      }
    } catch (err) {
      console.log("Memuat foto bawaan lokal...", err);
    }
  }

  // Jalankan pemuatan foto dari CMS tanpa mengganggu elemen yang sudah ada
  loadCMSPhotos();
});
