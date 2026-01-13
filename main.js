/* =====================================================
   1. KHAI BÁO BIẾN & CẤU HÌNH
===================================================== */
const input = document.getElementById("product-image");
const preview = document.getElementById("imagePreview");
const counter = document.getElementById("imageCounter");
const form = document.querySelector(".order-form");
const MAX_IMAGES = 3;
let images = [];

// Khởi tạo trạng thái ban đầu
if (counter) counter.style.display = "none";

/* =====================================================
   2. ĐỊNH DẠNG TIỀN TỆ & CHẶN NHẬP CHỮ
===================================================== */
// Định dạng 1.000.000 khi gõ vào ô giá
document.querySelectorAll(".price-input").forEach(el => {
  el.addEventListener("input", function(e) {
    let rawValue = e.target.value.replace(/\D/g, "");
    if (rawValue === "") { e.target.value = ""; return; }
    e.target.value = parseInt(rawValue).toLocaleString("vi-VN");
  });
});

// Chỉ cho phép nhập số và dấu chấm thập phân cho Trọng lượng & Kích thước
// Thêm class 'weight-input' vào HTML cho ô trọng lượng
// Thêm class 'size-input' vào HTML cho 3 ô Dài, Rộng, Cao
const numericFields = document.querySelectorAll(".weight-input, .size-input, input[type='number']");
numericFields.forEach(field => {
  field.addEventListener("keypress", e => {
    if (!/[0-9.]/.test(e.key)) e.preventDefault();
    if (e.key === "." && field.value.includes(".")) e.preventDefault();
  });
});

/* =====================================================
   3. XỬ LÝ ẢNH (UPLOAD, RESIZE, PREVIEW)
===================================================== */
if (input) {
  input.addEventListener("change", () => {
    const files = Array.from(input.files);
    if (images.length + files.length > MAX_IMAGES) {
      alert(`Chỉ được upload tối đa ${MAX_IMAGES} ảnh`);
      input.value = "";
      return;
    }

    files.forEach(file => {
      resizeImage(file, 225, 225, blob => {
        images.push({ blob, url: URL.createObjectURL(blob) });
        renderPreview();
      });
    });
    input.value = "";
  });
}

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
    wrapper.innerHTML = `
      <img src="${item.url}" alt="preview">
      <button type="button" class="remove-image">×</button>
    `;
    wrapper.querySelector(".remove-image").onclick = () => {
      images.splice(index, 1);
      renderPreview();
    };
    preview.appendChild(wrapper);
  });
}

function resizeImage(file, width, height, callback) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => callback(blob), "image/jpeg", 0.9);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/* =====================================================
   4. HIỂN THỊ DỮ LIỆU BACKEND (GIẢ LẬP)
===================================================== */
const formatVND = (v) => v.toLocaleString("vi-VN") + " đ";

function renderBackendData(data) {
  const pMin = document.getElementById("priceMin");
  const pMax = document.getElementById("priceMax");
  const dist = document.getElementById("distanceValue");

  if (pMin) pMin.textContent = formatVND(data.price_min);
  if (pMax) pMax.textContent = formatVND(data.price_max);
  if (dist) dist.textContent = data.distance_km + " km";
}

renderBackendData({ price_min: 120000, price_max: 180000, distance_km: 15.6 });

/* =====================================================
   5. VALIDATION (KIỂM TRA LỖI)
===================================================== */
function showErrorMessage(container, text) {
  if (container.querySelector(".error-message") || 
      (container.classList.contains("size-inputs") && container.nextElementSibling?.classList.contains("error-message"))) {
    return;
  }
  const msg = document.createElement("div");
  msg.className = "error-message";
  msg.textContent = text;

  if (container.classList.contains("size-inputs")) {
    msg.style.textAlign = "center";
    container.parentNode.insertBefore(msg, container.nextSibling);
  } else {
    container.appendChild(msg);
  }
}

function resetValidation() {
  document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
  document.querySelectorAll(".error-message").forEach(el => el.remove());
}

/* =====================================================
   6. SUBMIT FORM
===================================================== */
form.addEventListener("submit", e => {
  e.preventDefault();
  resetValidation();

  let isValid = true;
  let isSizeErrorShown = false;
  const inputs = form.querySelectorAll("input:not([type='file']):not([disabled]):not([readonly])");

  inputs.forEach(input => {
    const val = input.value.trim();
    const parent = input.parentElement;

    // Kiểm tra trống
    if (val === "") {
      isValid = false;
      input.classList.add("input-error");
      if (parent.classList.contains("size-inputs")) {
        if (!isSizeErrorShown) {
          showErrorMessage(parent, "Vui lòng nhập đủ kích thước (số)");
          isSizeErrorShown = true;
        }
      } else {
        showErrorMessage(parent, "Trường này không được để trống");
      }
    } 
    // Kiểm tra định dạng số cho Trọng lượng và Kích thước
    else if (input.classList.contains("weight-input") || input.classList.contains("size-input")) {
      if (isNaN(val) || parseFloat(val) <= 0) {
        isValid = false;
        input.classList.add("input-error");
        showErrorMessage(parent, "Vui lòng nhập số dương hợp lệ");
      }
    }

    // Xóa lỗi khi gõ lại
    input.addEventListener("input", function() {
      this.classList.remove("input-error");
      if (parent.classList.contains("size-inputs")) {
        parent.nextElementSibling?.classList.contains("error-message") && parent.nextElementSibling.remove();
        isSizeErrorShown = false;
      } else {
        parent.querySelector(".error-message")?.remove();
      }
    }, { once: true });
  });

  if (!isValid) {
    document.querySelector(".input-error")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  // CHUẨN BỊ DỮ LIỆU GỬI ĐI
  const formData = new FormData();
  
  // Clean tiền tệ (bỏ dấu chấm)
  const priceInput = document.querySelector(".price-input");
  const finalPrice = priceInput ? priceInput.value.replace(/\./g, "") : 0;
  formData.append("price", finalPrice);

  // Thêm ảnh vào FormData
  images.forEach((img, i) => formData.append(`images[${i}]`, img.blob, `prod_${i}.jpg`));

  console.log("Dữ liệu gửi đi:", {
    price: finalPrice,
    images: images.length,
    weight: document.querySelector(".weight-input")?.value
  });

  alert("Tạo đơn hàng thành công!");
});