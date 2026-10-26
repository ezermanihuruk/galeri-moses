document.addEventListener("DOMContentLoaded", function () {
  // Data cadangan (fallback) agar galeri langsung muncul tanpa blank
  const fallbackGallery = [
    {
      title: "Monochrome Portrait",
      category: "Black and White",
      image: "images/gallery-1.webp",
      desc: "Eksplorasi kontras dan ekspresi dalam balutan warna hitam putih."
    },
    {
      title: "Live Stage Performance",
      category: "Stage",
      image: "images/gallery-2.webp",
      desc: "Menangkap energi dan pencahayaan panggung yang dinamis."
    },
    {
      title: "Action Sport Shot",
      category: "Sport",
      image: "images/gallery-3.webp",
      desc: "Momen cepat penuh ketegangan dalam dunia olahraga."
    },
    {
      title: "Urban Fashion Style",
      category: "Human",
      image: "images/gallery-4.webp",
      desc: "Gaya busana jalanan dengan estetika modern."
    },
    {
      title: "Cultural Event Moments",
      category: "Event",
      image: "images/gallery-5.webp",
      desc: "Dokumentasi acara dan interaksi manusia yang autentik."
    },
    {
      title: "Street Architecture",
      category: "Arsitektur",
      image: "images/gallery-6.webp",
      desc: "Garis dan sudut bangunan kota dari sudut pandang unik."
    }
  ];

  let allGalleryItems = [...fallbackGallery];
  const gridContainer = document.getElementById("gallery-grid");

  // Fungsi untuk merender grid galeri ke HTML
  function renderGallery(items) {
    if (!gridContainer) return;
    
    gridContainer.innerHTML = "";

    if (items.length === 0) {
      gridContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #777;">Belum ada foto dalam kategori ini.</p>';
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "gallery-card";
      card.setAttribute("data-category", item.category);

      card.innerHTML = `
        <div class="img-wrapper">
          <img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async">
        </div>
        <div class="gallery-info">
          <h4>${item.title}</h4>
        </div>
      `;

      // Event klik untuk membuka modal Lightbox
      card.addEventListener("click", function () {
        openModal(item.image, item.title, item.desc || item.title);
      });

      gridContainer.appendChild(card);
    });
  }

  // Render awal menampilkan semua data
  renderGallery(allGalleryItems);

  // Fungsi Filter Kategori yang terhubung dengan tombol HTML Anda
  window.filterCategory = function (category) {
    const buttons = document.querySelectorAll(".filter-btn");
    
    // Perbarui kelas active pada tombol
    buttons.forEach((btn) => {
      const onclickAttr = btn.getAttribute("onclick") || "";
      if (onclickAttr.includes(`'${category}'`) || onclickAttr.includes(`"${category}"`)) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Filter berdasarkan kategori
    if (category === "all") {
      renderGallery(allGalleryItems);
    } else {
      const filtered = allGalleryItems.filter((item) => item.category.toLowerCase() === category.toLowerCase());
      renderGallery(filtered);
    }
  };

  // Fungsi Lightbox Modal
  window.openModal = function (imgSrc, title, desc) {
    const modal = document.getElementById("lightbox-modal");
    const modalImg = document.getElementById("modal-img");
    const modalTitle = document.getElementById("modal-title");
    const modalText = document.getElementById("modal-text");

    if (modal && modalImg) {
      modalImg.src = imgSrc;
      if (modalTitle) modalTitle.textContent = title;
      if (modalText) modalText.textContent = desc;
      modal.style.display = "flex";
    }
  };

  window.closeModal = function () {
    const modal = document.getElementById("lightbox-modal");
    if (modal) {
      modal.style.display = "none";
    }
  };
});
