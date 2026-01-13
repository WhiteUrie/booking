/* =====================================================
   ELEMENTS
===================================================== */
const input = document.getElementById("product-image");
const preview = document.getElementById("imagePreview");
const counter = document.getElementById("imageCounter");
const form = document.querySelector(".order-form");

/* =====================================================
   CONSTANTS & STATE
===================================================== */
const MAX_IMAGES = 3;
let images = [];

/* =====================================================
   INIT
===================================================== */
counter.style.display = "none";

/* =====================================================
   FILE INPUT CHANGE
===================================================== */
input.addEventListener("change", () => {
  const files = Array.from(input.files);

  if (images.length + files.length > MAX_IMAGES) {
    alert(`Chỉ được upload tối đa ${MAX_IMAGES} ảnh`);
    input.value = "";
    return;
  }

  files.forEach(file => {
    resizeImage(file, 225, 225, blob => {
      images.push({
        blob,
        url: URL.createObjectURL(blob)
      });
      renderPreview();
    });
  });

  input.value = "";
});

/* =====================================================
   RENDER IMAGE PREVIEW
===================================================== */
function renderPreview() {
  preview.innerHTML = "";

  if (images.length === 0) {
    counter.style.display = "none";
  } else {
    counter.style.display = "block";
    counter.textContent = `${images.length}/${MAX_IMAGES}`;
  }

  images.forEach((item, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "preview-item";

    const img = document.createElement("img");
    img.src = item.url;
    img.alt = "preview";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-image";
    removeBtn.textContent = "×";

    removeBtn.addEventListener("click", () => {
      images.splice(index, 1);
      renderPreview();
    });

    wrapper.appendChild(img);
    wrapper.appendChild(removeBtn);
    preview.appendChild(wrapper);
  });
}

/* =====================================================
   IMAGE RESIZE (CANVAS)
===================================================== */
function resizeImage(file, width, height, callback) {
  const reader = new FileReader();

  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        blob => callback(blob),
        "image/jpeg",
        0.9
      );
    };
    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

/* =====================================================
   BACKEND DISPLAY
===================================================== */
function formatVND(value) {
  return value.toLocaleString("vi-VN") + " đ";
}

function renderBackendData(data) {
  const priceMinEl = document.getElementById("priceMin");
  const priceMaxEl = document.getElementById("priceMax");
  const distanceEl = document.getElementById("distanceValue");

  if (priceMinEl && data.price_min !== undefined) {
    priceMinEl.textContent = formatVND(data.price_min);
  }

  if (priceMaxEl && data.price_max !== undefined) {
    priceMaxEl.textContent = formatVND(data.price_max);
  }

  if (distanceEl && data.distance_km !== undefined) {
    distanceEl.textContent = data.distance_km + " km";
  }
}

/* =====================================================
   MOCK BACKEND (TEST)
===================================================== */
const backendData = {
  price_min: 120000,
  price_max: 180000,
  distance_km: 15.6
};

renderBackendData(backendData);

/* =====================================================
   FORM SUBMIT
===================================================== */
form.addEventListener("submit", e => {
  e.preventDefault();

  const formData = new FormData();

  images.forEach((img, index) => {
    formData.append(
      `images[${index}]`,
      img.blob,
      `image_${index + 1}.jpg`
    );
  });

  console.log("Submit OK:", images.length, "ảnh");
  // fetch("/api/submit", { method: "POST", body: formData })
});
