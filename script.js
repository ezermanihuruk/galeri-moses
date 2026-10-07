/* ==========================================================================
   GALERI MOSES
   GALLERY JAVASCRIPT
   ========================================================================== */


/* ==========================================================================
   GLOBAL DATA
   ========================================================================== */

let galleryData = [];


/* ==========================================================================
   FETCH CMS DATA
   ========================================================================== */

async function fetchCMSData() {

  try {

    const response = await fetch(
      "https://api.github.com/repos/ezermanihuruk/galeri-moses/contents/content/gallery",
      {
        headers: {
          "Accept": "application/vnd.github+json"
        }
      }
    );


    /* Jika GitHub API gagal */

    if (!response.ok) {

      console.warn(
        "GitHub API gagal:",
        response.status
      );

      return [];

    }


    const files = await response.json();


    /* Pastikan response berupa array */

    if (!Array.isArray(files)) {

      return [];

    }


    /* Ambil hanya file Markdown */

    const mdFiles = files.filter(
      file =>
        file &&
        file.name &&
        file.name.endsWith(".md")
    );


    /* =========================================================
       FETCH FILE MARKDOWN SECARA PARALEL
       ========================================================= */

    const cmsItems = await Promise.all(

      mdFiles.map(
        async function (file) {

          try {

            if (!file.download_url) {

              return null;

            }


            const fileResponse =
              await fetch(file.download_url);


            if (!fileResponse.ok) {

              console.warn(
                "Gagal mengambil:",
                file.name
              );

              return null;

            }


            const text =
              await fileResponse.text();


            /* =================================================
               PARSING FRONTMATTER
               ================================================= */

            const parts =
              text.split("---");


            if (
              parts.length >= 3 &&
              typeof jsyaml !== "undefined"
            ) {

              const data =
                jsyaml.load(parts[1]);


              if (
                data &&
                data.image
              ) {

                return {

                  title:
                    data.title
                      ? String(data.title).trim()
                      : "",

                  category:
                    data.category
                      ? String(data.category)
                      : "General",

                  image:
                    String(data.image),

                  caption:
                    data.caption
                      ? String(data.caption)
                      : ""

                };

              }

            }

          }
          catch (error) {

            console.warn(
              "Gagal memuat file:",
              file.name,
              error
            );

          }


          return null;

        }
      )

    );


    /* Hapus item yang gagal */

    return cmsItems.filter(
      item => item !== null
    );

  }
  catch (error) {

    console.error(
      "Gagal mengambil data CMS:",
      error
    );

    return [];

  }

}


/* ==========================================================================
   FETCH GALLERY
   ========================================================================== */

async function fetchGalleryData() {

  const defaultData = [];


  try {

    const cmsData =
      await fetchCMSData();


    galleryData =
      [
        ...cmsData,
        ...defaultData
      ];


    renderGallery(
      galleryData
    );

  }
  catch (error) {

    console.error(
      "Gallery error:",
      error
    );


    galleryData =
      defaultData;


    renderGallery(
      galleryData
    );

  }

}


/* ==========================================================================
   RENDER GALLERY
   ========================================================================== */

function renderGallery(items) {

  const container =
    document.getElementById(
      "gallery-grid"
    );


  if (!container) {

    return;

  }


  /* Bersihkan container */

  container.innerHTML = "";


  /* Jika tidak ada foto */

  if (
    !items ||
    items.length === 0
  ) {

    container.innerHTML = `

      <div class="gallery-loading">

        Belum ada foto yang tersedia.

      </div>

    `;

    return;

  }


  /* =========================================================
     RENDER SETIAP FOTO
     ========================================================= */

  items.forEach(
    function (item) {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "gallery-card";


      /* =======================================================
         CLICK CARD
         ======================================================= */

      card.addEventListener(
        "click",
        function () {

          openModal(
            item.image,
            item.title,
            item.caption
          );

        }
      );


      /* =======================================================
         TITLE
         ======================================================= */

      const titleHTML =
        item.title

          ? `
            <div class="gallery-info">

              <h4>
                ${escapeHTML(item.title)}
              </h4>

            </div>
          `

          : "";


      /* =======================================================
         CARD HTML
         ======================================================= */

      card.innerHTML = `

        <div class="img-wrapper">

          <img
            src="${escapeHTML(item.image)}"
            alt="${escapeHTML(
              item.title || "Foto Galeri"
            )}"
            loading="lazy"
            decoding="async"
            width="400"
            height="280"
          >

        </div>

        ${titleHTML}

      `;


      container.appendChild(
        card
      );

    }
  );

}


/* ==========================================================================
   ESCAPE HTML
   Mencegah karakter tertentu merusak HTML
   ========================================================================== */

function escapeHTML(value) {

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


/* ==========================================================================
   FILTER CATEGORY
   ========================================================================== */

function filterCategory(category) {

  const buttons =
    document.querySelectorAll(
      ".filter-btn"
    );


  /* =========================================================
     UPDATE ACTIVE BUTTON
     ========================================================= */

  buttons.forEach(
    function (button) {

      const buttonText =
        button.innerText
          .toLowerCase()
          .trim();


      const categoryText =
        category
          .toLowerCase()
          .trim();


      let active = false;


      if (
        category === "all" &&
        buttonText === "semua"
      ) {

        active = true;

      }


      else if (
        buttonText === categoryText
      ) {

        active = true;

      }


      else if (
        categoryText === "black and white" &&
        buttonText === "black & white"
      ) {

        active = true;

      }


      button.classList.toggle(
        "active",
        active
      );

    }
  );


  /* =========================================================
     FILTER DATA
     ========================================================= */

  if (
    category === "all"
  ) {

    renderGallery(
      galleryData
    );

    return;

  }


  const filtered =
    galleryData.filter(
      function (item) {

        return (
          item.category &&
          item.category
            .toLowerCase()
            .trim() ===
          category
            .toLowerCase()
            .trim()
        );

      }
    );


  renderGallery(
    filtered
  );

}


/* ==========================================================================
   OPEN MODAL
   ========================================================================== */

function openModal(
  src,
  title,
  caption
) {

  const modal =
    document.getElementById(
      "lightbox-modal"
    );


  const modalImg =
    document.getElementById(
      "modal-img"
    );


  const modalTitle =
    document.getElementById(
      "modal-title"
    );


  const modalText =
    document.getElementById(
      "modal-text"
    );


  if (
    !modal ||
    !modalImg
  ) {

    return;

  }


  /* Set gambar */

  modalImg.src = src;


  modalImg.alt =
    title || "Foto Galeri";


  /* Set judul */

  if (modalTitle) {

    modalTitle.innerText =
      title || "";

  }


  /* Set caption */

  if (modalText) {

    modalText.innerText =
      caption || "";

  }


  /* Tampilkan modal */

  modal.style.display =
    "flex";


  /* Lock scroll */

  document.body.style.overflow =
    "hidden";

}


/* ==========================================================================
   CLOSE MODAL
   ========================================================================== */

function closeModal(event) {

  /*
    Jika klik gambar, jangan tutup modal.
  */

  if (
    event &&
    event.target &&
    event.target.id === "modal-img"
  ) {

    return;

  }


  const modal =
    document.getElementById(
      "lightbox-modal"
    );


  if (!modal) {

    return;

  }


  modal.style.display =
    "none";


  /* Kembalikan scroll */

  document.body.style.overflow =
    "";

}


/* ==========================================================================
   ESC KEY UNTUK MENUTUP MODAL
   ========================================================================== */

document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key === "Escape"
    ) {

      closeModal();

    }

  }
);


/* ==========================================================================
   LOAD GALLERY
   ========================================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    fetchGalleryData();

  }
);
