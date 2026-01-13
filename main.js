const input = document.getElementById("product-image");
const preview = document.getElementById("imagePreview");
const counter = document.getElementById("imageCounter");
const form = document.querySelector(".order-form");



const MAX_IMAGES = 3;
let images = []; 

/* ===== INIT ===== */
counter.style.display = "none";

/* ===== FILE CHANGE ===== */
input.addEventListener("change", () => {
  const files = Array.from(input.files);

  if (images.length + files.length > MAX_IMAGES) {
    alert(`Chỉ được upload tối đa ${MAX_IMAGES} ảnh`);
    input.value = "";
    return;
  }

  files.forEach(file => {
    resizeImage(file, 256,256, blob => {
      images.push({
        blob,
        url: URL.createObjectURL(blob)
      });
      renderPreview();
    });
  });

  input.value = "";
});

/* ===== RENDER PREVIEW ===== */
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

    const removeBtn = document.createElement("button");
    removeBtn.className = "preview-remove";
    removeBtn.textContent = "×";
    removeBtn.onclick = () => {
      images.splice(index, 1);
      renderPreview();
    };

    wrapper.appendChild(img);
    wrapper.appendChild(removeBtn);
    preview.appendChild(wrapper);
  });
}

/* ===== RESIZE IMAGE ===== */
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

      canvas.toBlob(blob => callback(blob), "image/jpeg", 0.9);
    };
    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

/* ===== SUBMIT ===== */
form.addEventListener("submit", e => {
  e.preventDefault();

  const formData = new FormData();
  images.forEach((img, index) => {
    formData.append(`images[${index}]`, img.blob, `image_${index + 1}.jpg`);
  });

  console.log("Submit:", images.length, "ảnh (đúng thứ tự)");
});

/* ===============================
   BACKEND DISPLAY HANDLER
================================ */

/* Format tiền VND */
function formatVND(value) {
  if (value === null || value === undefined) return "";
  return value.toLocaleString("vi-VN") + " VND";
}

/* Render dữ liệu backend lên UI */
function renderBackendData(data) {
  // User name
  const userNameEl = document.querySelector(".user-value");
  if (userNameEl && data.user?.name) {
    userNameEl.textContent = data.user.name;
  }

  // Distance
  const distanceEl = document.getElementById("distanceValue");
  if (distanceEl && data.distanceKm !== undefined) {
    distanceEl.value = data.distanceKm + " km";
  }

  // Price estimate
  const priceMinEl = document.getElementById("priceMin");
  const priceMaxEl = document.getElementById("priceMax");

  if (priceMinEl && data.priceEstimate?.min !== undefined) {
    priceMinEl.value = formatVND(data.priceEstimate.min);
  }

  if (priceMaxEl && data.priceEstimate?.max !== undefined) {
    priceMaxEl.value = formatVND(data.priceEstimate.max);
  }

  // Insurance
  const insuranceEl = document.getElementById("insuranceValue");
  if (insuranceEl && data.insuranceValue !== undefined) {
    insuranceEl.value = formatVND(data.insuranceValue);
  }
}

/* ===============================
   MOCK BACKEND RESPONSE
================================ */
const backendData = {
  price_min: 120000,
  price_max: 180000,
  distance_km: 15.6
};

document.getElementById("priceMin").textContent =
  backendData.price_min.toLocaleString("vi-VN") + " đ";

document.getElementById("priceMax").textContent =
  backendData.price_max.toLocaleString("vi-VN") + " đ";

document.getElementById("distanceValue").textContent =
  backendData.distance_km + " km";
