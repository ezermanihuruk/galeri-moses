document.addEventListener("DOMContentLoaded", () => {
  // 1. FILTERING GALERI BAWAAN (TIDAK DIUBAH SAMA SEKALI)
  const filterBtns = document.querySelectorAll(".filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");

  if (filterBtns.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const filterValue = btn.getAttribute("data-filter");

        document.querySelectorAll(".gallery-item").forEach((item) => {
          if (filterValue === "all" || item.classList.contains(filterValue)) {
            item.style.display = "";
          } else {
            item.style.display = "none";
          }
        });
      });
    });
  }

  // 2. FUNGSI MENAMBAHKAN FOTO DARI ADMIN TANPA MERUSAK CSS
  const galleryGrid = document.querySelector(".gallery-grid") || document.querySelector(".portfolio-grid") || document.querySelector(".grid");

  async function loadCMSPhotos() {
    if (!galleryGrid || typeof jsyaml === "undefined") return;

    try {
      const res = await fetch("https://api.github.com/repos/ezermanihuruk/galeri-moses/contents/content/gallery");
      if (!res.ok) return;

      const files = await res.json();

      for (const file of files) {
        if (file.name && file.name.endsWith(".md")) {
          const fileRes = await fetch(file.download_url);
          const text = await fileRes.text();

          const parts = text.split("---");
          if (parts.length >= 3) {
            const data = jsyaml.load(parts[1]);

            if (data && data.image) {
              // Mapping nama kategori dari admin ke class filter CSS kamu
              const catClass = data.category ? data.category.toLowerCase().trim().replace(/\s+/g, "-") : "all";

              // Elemen baru persis sesuai struktur gallery-item asli kamu
              const newItem = document.createElement("div");
              newItem.className = `gallery-item ${catClass}`;

              newItem.innerHTML = `
                <img src="${data.image}" alt="${data.title || 'Foto Galeri'}">
                <div class="overlay">
                  <h3>${data.title || ''}</h3>
                  <p>${data.category || ''}</p>
                </div>
              `;

              // Menambahkan foto baru ke kategori tanpa merusak foto lama
              galleryGrid.prepend(newItem);
            }
          }
        }
      }
    } catch (err) {
      console.warn("Gagal memuat foto CMS, menggunakan foto lokal bawaan.", err);
    }
  }

  loadCMSPhotos();
});
