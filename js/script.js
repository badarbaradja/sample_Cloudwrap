// GANTI SELURUH FILE JAVASCRIPT ANDA DENGAN KODE INI

document.addEventListener('DOMContentLoaded', function() {

    // =============================================
    // 0. PENGATURAN PENTING
    // =============================================
    // Ganti dengan URL Web App dari Google Apps Script Anda
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzdpz5YyD8tGjZBonjK8wiKHo2tK6dqtEiO0uQqZpt9fuxiLVi9qrYJsfoa0jXBx_wk_A/exec"
    // =============================================
    // 1. DEKLARASI SEMUA ELEMEN HALAMAN
    // =============================================
    
    // Halaman & Section
    const landingPage = document.getElementById('landing-page');
    const toppingMainSection = document.getElementById('topping-main-section');
    const additionalToppingSection = document.getElementById('additional-topping-section');
    const paymentSection = document.getElementById('payment-section');

    // Tombol Navigasi
    const startButton = document.getElementById('start-btn');
    const nextToAdditionalToppingBtn = document.getElementById('next-to-additional-topping-btn');
    const backBtn = document.getElementById('back-btn');
    const backFromPaymentBtn = document.getElementById('back-from-payment-btn');
    const skipBtn = document.getElementById('skip-btn');
    const nextToPaymentBtn = document.getElementById('next-to-payment-btn');
    const finishOrderBtn = document.getElementById('finish-order-btn');

    // Tampilan Kustomisasi Utama
    const toppingOverlayImg = document.getElementById('topping-overlay-img');
    const toppingItems = document.querySelectorAll('#topping-main-section .topping-item');
    const orderDetails = document.getElementById('order-details');
    const minusBtn = document.getElementById('minus-btn');
    const plusBtn = document.getElementById('plus-btn');
    const quantityDisplay = document.getElementById('quantity-display');
    const totalPriceDisplay = document.getElementById('total-price-display');
    
    // Tampilan Topping Tambahan (Struktur Sederhana)
    const mainToppingInAdditional = document.getElementById('main-topping-in-additional');
    const additionalToppingOverlay = document.getElementById('additional-topping-overlay');
    const additionalItems = document.querySelectorAll('#additional-topping-section .topping-item');
    const finalPriceDisplay = document.getElementById('final-price-display');

    // Halaman Pembayaran & Form
    const orderSummaryText = document.getElementById('order-summary-text');
    const finalPriceText = document.getElementById('final-price-text');
    
    // Theme Switch
    const themeToggle = document.getElementById('theme-checkbox');

    // =============================================
    // 2. VARIABEL STATUS PESANAN (STATE)
    // =============================================
    let quantity = 1;
    let mainTopping = { name: null, price: 0 };
    let additionalTopping = { name: null, price: 0 };

    // =============================================
    // 3. FUNGSI-FUNGSI UTAMA
    // =============================================

    // Fungsi untuk transisi antar halaman
    function showSection(sectionToShow, sectionToHide) {
        if (sectionToHide) {
            sectionToHide.classList.remove('active');
            // Menunggu transisi selesai sebelum menyembunyikan
            setTimeout(() => {
                if (sectionToHide) sectionToHide.style.display = 'none';
            }, 300);
        }
        if (sectionToShow) {
            sectionToShow.style.display = 'block';
            setTimeout(() => {
                sectionToShow.classList.add('active');
                sectionToShow.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 10);
        }
    }

    // Fungsi tunggal untuk mengupdate semua harga di UI
    function updateTotalDisplay() {
        const basePrice = mainTopping.price * quantity;
        const finalPrice = basePrice + additionalTopping.price;
        
        // Update harga di halaman pertama
        if (totalPriceDisplay) totalPriceDisplay.textContent = `Rp ${basePrice.toLocaleString('id-ID')}`;
        
        // Update harga di halaman kedua
        if (finalPriceDisplay) finalPriceDisplay.textContent = `Total: Rp ${finalPrice.toLocaleString('id-ID')}`;
        
        // Update ringkasan & harga di halaman pembayaran
        let summary = `Cloudwrap with ${mainTopping.name}` + (additionalTopping.name ? ` plus ${additionalTopping.name}` : '') + ` (x${quantity})`;
        if (orderSummaryText) orderSummaryText.textContent = summary;
        if (finalPriceText) finalPriceText.textContent = `Total: Rp ${finalPrice.toLocaleString('id-ID')}`;
    }

    // =============================================
    // 4. LOGIKA THEME SWITCH
    // =============================================
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            themeToggle.checked = true;
        }
    }
    function switchTheme(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }
    themeToggle.addEventListener('change', switchTheme, false);

    // =============================================
    // 5. EVENT LISTENERS UNTUK ALUR PESANAN
    // =============================================

    // Klik tombol START
    startButton.addEventListener('click', () => showSection(toppingMainSection, landingPage));

    // Klik pilihan topping utama
    toppingItems.forEach(item => {
        item.addEventListener('click', () => {
            toppingItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');

            mainTopping.name = item.dataset.topping;
            mainTopping.price = parseInt(item.dataset.price);
            
            toppingOverlayImg.src = `img/topping-${mainTopping.name}.png`;
            toppingOverlayImg.classList.add('active');
            
            quantity = 1;
            quantityDisplay.textContent = quantity;
            orderDetails.classList.remove('hidden');
            nextToAdditionalToppingBtn.classList.remove('hidden');
            updateTotalDisplay();
        });
    });

    // Kontrol Jumlah (+/-)
    minusBtn.addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            quantityDisplay.textContent = quantity;
            updateTotalDisplay();
        }
    });
    plusBtn.addEventListener('click', () => {
        quantity++;
        quantityDisplay.textContent = quantity;
        updateTotalDisplay();
    });

    // Klik NEXT ke topping tambahan
    nextToAdditionalToppingBtn.addEventListener('click', () => {
        // Siapkan halaman topping tambahan
        mainToppingInAdditional.src = toppingOverlayImg.src;
        additionalTopping.name = null;
        additionalTopping.price = 0;
        additionalToppingOverlay.src = '';
        additionalToppingOverlay.classList.remove('active');
        additionalItems.forEach(i => i.classList.remove('selected'));
        updateTotalDisplay();
        showSection(additionalToppingSection, toppingMainSection);
    });

    // Klik pilihan topping tambahan (logika disederhanakan)
    additionalItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('selected')) {
                // Batal memilih
                item.classList.remove('selected');
                additionalTopping.name = null;
                additionalTopping.price = 0;
                additionalToppingOverlay.classList.remove('active');
            } else {
                // Memilih topping baru
                additionalItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                additionalTopping.name = item.dataset.topping;
                additionalTopping.price = parseInt(item.dataset.price);
                additionalToppingOverlay.src = `img/icon-${additionalTopping.name}.png`;
                additionalToppingOverlay.classList.add('active');
            }
            updateTotalDisplay();
        });
    });
    // Tambahkan event listener untuk tombol back dari halaman payment
backFromPaymentBtn.addEventListener('click', () => {
    showSection(additionalToppingSection, paymentSection);
});
    // Tombol navigasi di halaman topping tambahan
    backBtn.addEventListener('click', () => showSection(toppingMainSection, additionalToppingSection));

    skipBtn.addEventListener('click', () => {
        additionalTopping.name = null; // Pastikan topping tambahan kosong
        additionalTopping.price = 0;
        updateTotalDisplay(); // Update total harga sebelum pindah
        showSection(paymentSection, additionalToppingSection);
    });

    nextToPaymentBtn.addEventListener('click', () => {
        updateTotalDisplay(); // Update total harga sebelum pindah
        showSection(paymentSection, additionalToppingSection);
    });
    

    // Tombol FINISH ORDER (final) - VERSI PERBAIKAN
finishOrderBtn.addEventListener('click', function(e) {
    e.preventDefault(); // Mencegah perilaku default form/tombol

    const customerName = document.getElementById('customer-name').value;
    const customerWhatsapp = document.getElementById('customer-whatsapp').value;

    if (!customerName || !customerWhatsapp) {
        alert("Please fill in your Name and WhatsApp Number.");
        return;
    }

    finishOrderBtn.disabled = true;
    finishOrderBtn.textContent = "SENDING...";

    const finalPrice = (mainTopping.price * quantity) + additionalTopping.price;
    const orderDetailsText = `Cloudwrap with ${mainTopping.name}` + (additionalTopping.name ? ` plus ${additionalTopping.name}` : '') + ` (x${quantity})`;

    // Buat objek FormData
    const formData = new FormData();
    formData.append('nama', customerName);
    formData.append('whatsapp', customerWhatsapp);
    formData.append('pesanan', orderDetailsText);
    formData.append('jumlah', quantity);
    formData.append('total', finalPrice);
    // Kita belum mengirim file, hanya data teks untuk saat ini

    fetch(SCRIPT_URL, {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.result === "success") {
            alert("Your order has been placed successfully! Thank you!");
            window.location.reload(); 
        } else {
            // Tampilkan pesan error dari server jika ada
            console.error("Server Error:", data.message);
            alert("There was an error placing your order. Please try again.");
            finishOrderBtn.disabled = false;
            finishOrderBtn.textContent = "FINISH ORDER";
        }
    })
    .catch(error => {
        console.error("Fetch Error:", error);
        alert("A network error occurred. Please check your connection and try again.");
        finishOrderBtn.disabled = false;
        finishOrderBtn.textContent = "FINISH ORDER";
    });
});

}); // AKHIR DARI BLOK DOMContentLoaded