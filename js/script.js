// =============================================
// VERSI BARU - ALUR PANCAKE GLOBAL (PERSISTENT)
// =============================================

document.addEventListener('DOMContentLoaded', function() {

    // =============================================
    // 0. PENGATURAN PENTING & KONSTANTA
    // =============================================
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzdpz5YyD8tGjZBonjK8wiKHo2tK6dqtEiO0uQqZpt9fuxiLVi9qrYJsfoa0jXBx_wk_A/exec";
    const BASE_PRICE = 15000;
    const EXTRA_PRICE = 2000;
    const PANCAKE_FALL_DURATION = 2100;
    const CONTENT_FADE_DURATION = 500;
    
    const VISUAL_ASSETS_MAP = {
        'strawberries': 'strawberries.png',
        'bananas': 'pisang.png',
        'mangos': 'mangga.png',
        'oreos': 'oreo.png',
        'yupis': 'yupi.png',
        'chocolate': 'coklat.png',
        'honey': 'honey.png'
    };

    // =============================================
    // 1. VARIABEL STATUS PESANAN (STATE)
    // =============================================
    let orderState = {
        fruit: null, topping: null, sauce: null,
        extras: {}, extraCost: 0, totalCost: BASE_PRICE
    };
    let currentSectionId = null;
    let isTransitioning = false;
    
    // ✅ TAMBAHAN: Simpan posisi setiap item agar konsisten
    let itemPositions = {};

    // =============================================
    // 2. DEKLARASI ELEMEN
    // =============================================
    
    const loadingScreen = document.getElementById('loading-screen');
    const landingPage = document.getElementById('landing-page');
    const allSections = document.querySelectorAll('.customization-section');
    
    const globalPancakeContainer = document.getElementById('global-pancake-container');
    const globalVisualsContainer = document.getElementById('global-visuals-container');
    
    // 🔥 PERBAIKAN: Simpan parent asli pancake (body) dan target barunya
    const pancakeOriginalParent = globalPancakeContainer.parentNode; 
    const finishPancakeTarget = document.getElementById('finish-pancake-goes-here');

    const startButton = document.getElementById('start-btn');
    
    const choiceItemsFruit = document.querySelectorAll('#fruit-section .choice-item');
    const nextToToppingBtn = document.getElementById('next-to-topping-btn');

    const choiceItemsTopping = document.querySelectorAll('#topping-section .choice-item');
    const nextToSauceBtn = document.getElementById('next-to-sauce-btn');

    const choiceItemsSauce = document.querySelectorAll('#sauce-section .choice-item');
    const nextToExtraBtn = document.getElementById('next-to-extra-btn');

    const extraItemRows = document.querySelectorAll('#extra-section .extra-item-row');
    const extraPriceDisplaySpan = document.getElementById('extra-price-display').querySelector('span');

    const orderSummaryText = document.getElementById('order-summary-text');
    const finalPriceText = document.getElementById('final-price-text');
    const paymentProofInput = document.getElementById('payment-proof'); 
    const fileChosenText = document.getElementById('file-chosen'); 
    const finishOrderBtn = document.getElementById('finish-order-btn');

    const themeToggle = document.getElementById('theme-checkbox');

    // =============================================
    // 3. FUNGSI-FUNGSI UTAMA
    // =============================================

    function runPancakeAnimation(callback) {
        globalPancakeContainer.classList.remove('animate-drop');
        void globalPancakeContainer.offsetHeight; 
        globalPancakeContainer.classList.add('animate-drop');
        setTimeout(callback, PANCAKE_FALL_DURATION);
    }

    function showContent(sectionId) {
        const sectionToShow = document.getElementById(sectionId);
        if (sectionToShow) {
            sectionToShow.style.display = 'flex';
            sectionToShow.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // 🔥 PERBAIKAN LOGIKA POSISI PANCAKE
            if (sectionId === 'extra-section' || sectionId === 'payment-section') {
                globalPancakeContainer.classList.add('hidden');
            
            } else if (sectionId === 'finish-summary-section') {
                // 1. Pindahkan pancake ke "rumah" barunya di dalam section
                if (finishPancakeTarget) {
                    finishPancakeTarget.appendChild(globalPancakeContainer);
                }
                globalPancakeContainer.classList.remove('hidden');
                
                // 2. Hapus class/style posisi absolut agar mengikuti alur flexbox
                globalPancakeContainer.classList.remove('finish-position');
                globalPancakeContainer.classList.remove('animate-drop-finish');
                globalPancakeContainer.style.position = 'relative'; // Menjadi elemen normal
                globalPancakeContainer.style.bottom = 'auto';
                globalPancakeContainer.style.left = 'auto';
                globalPancakeContainer.style.marginLeft = 'auto';
                
            } else {
                // 1. Kembalikan pancake ke parent aslinya (body)
                if (globalPancakeContainer.parentNode !== pancakeOriginalParent) {
                    pancakeOriginalParent.appendChild(globalPancakeContainer);
                    // 2. Kembalikan style absolut untuk "mengikuti" di bawah
                    globalPancakeContainer.style.position = 'absolute';
                    globalPancakeContainer.style.left = '50%';
                    // Sesuaikan margin-left berdasarkan ukuran di CSS (default: -175px)
                    const pancakeWidth = globalPancakeContainer.offsetWidth;
                    globalPancakeContainer.style.marginLeft = `-${pancakeWidth / 2}px`;
                }

                globalPancakeContainer.classList.remove('hidden');
                globalPancakeContainer.classList.remove('finish-position');
                globalPancakeContainer.classList.remove('animate-drop-finish');
            }
            // --- AKHIR PERBAIKAN ---
            
            setTimeout(() => sectionToShow.classList.add('reveal'), 50);
            currentSectionId = sectionId;
        }
    }

    function hideCurrentContent(callback) {
        if (currentSectionId) {
            const sectionToHide = document.getElementById(currentSectionId);
            if (sectionToHide) {
                sectionToHide.classList.remove('reveal');
                
                // 🔥 PERBAIKAN: Kembalikan pancake ke body saat meninggalkan finish-section
                if (currentSectionId === 'finish-summary-section') {
                    if (globalPancakeContainer.parentNode !== pancakeOriginalParent) {
                        pancakeOriginalParent.appendChild(globalPancakeContainer);
                        // Kembalikan style absolut
                        globalPancakeContainer.style.position = 'absolute';
                        globalPancakeContainer.style.left = '50%';
                        const pancakeWidth = globalPancakeContainer.offsetWidth;
                        globalPancakeContainer.style.marginLeft = `-${pancakeWidth / 2}px`;
                    }
                    globalPancakeContainer.classList.remove('finish-position');
                    globalPancakeContainer.classList.remove('animate-drop-finish');
                }
                
                setTimeout(() => {
                    sectionToHide.style.display = 'none';
                    if (callback) callback();
                }, CONTENT_FADE_DURATION);
            } else {
                 if (callback) callback();
            }
        } else {
            if (callback) callback();
        }
    }
    
    function runFullTransition(targetSectionId) {
        if (isTransitioning) return;
        isTransitioning = true;
        
        hideCurrentContent(() => {
            if (targetSectionId === 'extra-section') {
                showContent(targetSectionId);
                isTransitioning = false;
            } 
            else if (targetSectionId === 'finish-summary-section' && currentSectionId === 'extra-section') {
                // Hapus animasi 'runPancakeAnimation' agar tidak aneh
                // Cukup tampilkan kontennya
                showContent(targetSectionId);
                isTransitioning = false;
            }
            else {
                runPancakeAnimation(() => {
                    showContent(targetSectionId);
                    isTransitioning = false;
                });
            }
        });
    }

    function updateVisuals() {
        if (!globalVisualsContainer) return;
        
        // Simpan item yang sudah ada (untuk tidak di-animasi ulang)
        const existingItems = new Set();
        const existingImages = globalVisualsContainer.querySelectorAll('.visual-item');
        existingImages.forEach(img => {
            const itemKey = img.dataset.itemKey;
            if (itemKey) existingItems.add(itemKey);
        });
        
        // Hitung item yang seharusnya ditampilkan
        let itemsToShow = [];
        if (orderState.fruit) itemsToShow.push({ name: orderState.fruit, key: `fruit-${orderState.fruit}` });
        if (orderState.topping) itemsToShow.push({ name: orderState.topping, key: `topping-${orderState.topping}` });
        if (orderState.sauce) itemsToShow.push({ name: orderState.sauce, key: `sauce-${orderState.sauce}` });
        
        for (const itemName in orderState.extras) {
            for (let i = 0; i < orderState.extras[itemName]; i++) {
                itemsToShow.push({ name: itemName, key: `extra-${itemName}-${i}` });
            }
        }
        
        // Hapus item yang tidak ada lagi
        existingImages.forEach(img => {
            const itemKey = img.dataset.itemKey;
            const stillExists = itemsToShow.some(item => item.key === itemKey);
            if (!stillExists) {
                img.remove();
                delete itemPositions[itemKey];
            }
        });
        
        // Tambahkan item baru dengan animasi
        itemsToShow.forEach(item => {
            const itemKey = item.key;
            const itemName = item.name;
            
            // Skip jika item sudah ada
            if (existingItems.has(itemKey)) return;
            
            const fileName = VISUAL_ASSETS_MAP[itemName];
            if (!fileName) {
                console.warn(`File visual untuk "${itemName}" tidak ditemukan di VISUAL_ASSETS_MAP.`);
                return;
            }
            
            // Generate atau ambil posisi yang sudah disimpan
            if (!itemPositions[itemKey]) {
                itemPositions[itemKey] = {
                    top: Math.random() * 30 + 20,
                    left: Math.random() * 40 + 30,
                    rotate: Math.random() * 60 - 30
                };
            }
            
            const pos = itemPositions[itemKey];
            
            const newImg = document.createElement('img');
            newImg.src = `img/${fileName}`;
            newImg.className = 'visual-item';
            newImg.dataset.itemKey = itemKey;
            
            // Posisi awal: di atas layar
            newImg.style.top = '-100px';
            newImg.style.left = `${pos.left}%`;
            newImg.style.transform = `translate(-50%, -50%) rotate(${pos.rotate}deg) scale(0.8)`;
            newImg.style.opacity = '0';
            
            globalVisualsContainer.appendChild(newImg);
            
            // Trigger animasi jatuh dari atas (hanya untuk item BARU)
            setTimeout(() => {
                newImg.style.opacity = '1';
                newImg.style.top = `${pos.top}%`;
                newImg.style.transform = `translate(-50%, -50%) rotate(${pos.rotate}deg) scale(1)`;
            }, 10);
        });
    }

    function updatePrice() {
        let currentExtraCost = 0;
        for (const itemName in orderState.extras) {
            currentExtraCost += orderState.extras[itemName] * EXTRA_PRICE;
        }
        orderState.extraCost = currentExtraCost;
        orderState.totalCost = BASE_PRICE + orderState.extraCost;
        if (extraPriceDisplaySpan) {
            extraPriceDisplaySpan.textContent = `Rp ${currentExtraCost.toLocaleString('id-ID')}`;
        }
        if (finalPriceText) {
            finalPriceText.textContent = `Total: Rp ${orderState.totalCost.toLocaleString('id-ID')}`;
        }
    }
    
    function updateOrderSummary() {
        let summaryParts = [];
        if (orderState.fruit) summaryParts.push(capitalize(orderState.fruit));
        if (orderState.topping) summaryParts.push(capitalize(orderState.topping));
        if (orderState.sauce) summaryParts.push(capitalize(orderState.sauce));
        
        let extraParts = [];
        for (const itemName in orderState.extras) {
            if (orderState.extras[itemName] > 0) {
                extraParts.push(`${orderState.extras[itemName]}x Extra ${capitalize(itemName)}`);
            }
        }
        let summaryString = `1x CloudWrap (${summaryParts.join(', ') || 'Polos'})`;
        if (extraParts.length > 0) {
            summaryString += ` | Tambahan: ${extraParts.join(', ')}`;
        }
        if (orderSummaryText) orderSummaryText.textContent = summaryString;
        updatePrice();
    }

    function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // =============================================
    // 4. LOGIKA THEME SWITCH
    // =============================================
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') themeToggle.checked = true;
    }
    function switchTheme(e) {
        document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
        localStorage.setItem('theme', e.target.checked ? 'dark' : 'light');
    }
    if (themeToggle) {
        themeToggle.addEventListener('change', switchTheme, false);
    } else {
        console.error("Elemen #theme-checkbox HILANG dari HTML.");
    }

    // =============================================
    // 5. EVENT LISTENERS ALUR PESANAN
    // =============================================

    startButton.addEventListener('click', () => {
        if (isTransitioning) return;
        isTransitioning = true;
        
        if (landingPage) {
            landingPage.classList.add('fade-out');
            setTimeout(() => { landingPage.style.display = 'none'; }, 300);
        }
        
        globalPancakeContainer.classList.remove('hidden');
        runPancakeAnimation(() => {
            showContent('fruit-section');
            isTransitioning = false;
        });
    });

    // ----- Navigasi Global (Tombol BACK & SKIP) -----
    document.body.addEventListener('click', (e) => {
        if (isTransitioning && !e.target.classList.contains('back-button')) return;
        
        if (e.target.classList.contains('back-button')) {
            isTransitioning = true;
            const targetSectionId = e.target.dataset.target;
            if (targetSectionId) {
                hideCurrentContent(() => {
                    showContent(targetSectionId);
                    isTransitioning = false;
                });
            }
        }
        
        if (e.target.classList.contains('skip-button')) {
            const targetSectionId = e.target.dataset.target;
            const currentSectionId = e.target.closest('.customization-section').id;

            if (currentSectionId === 'topping-section') orderState.topping = null;
            if (currentSectionId === 'sauce-section') orderState.sauce = null;
            if (currentSectionId === 'extra-section') {
                orderState.extras = {};
                orderState.extraCost = 0;
                extraItemRows.forEach(row => {
                    row.querySelector('.extra-quantity').textContent = '0';
                    row.querySelector('.extra-minus').disabled = true;
                });
                updatePrice();
            }
            updateVisuals();
            runFullTransition(targetSectionId);
        }
    });

    // ----- Section 1: Buah -----
    choiceItemsFruit.forEach(item => {
        item.addEventListener('click', () => {
            choiceItemsFruit.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            orderState.fruit = item.dataset.choice;
            updateVisuals();
            nextToToppingBtn.classList.remove('hidden');
        });
    });
    nextToToppingBtn.addEventListener('click', () => {
        runFullTransition('topping-section');
    });

    // ----- Section 2: Topping -----
    choiceItemsTopping.forEach(item => {
        item.addEventListener('click', () => {
            choiceItemsTopping.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            orderState.topping = item.dataset.choice;
            updateVisuals();
            nextToSauceBtn.classList.remove('hidden');
        });
    });
    
    nextToSauceBtn.addEventListener('click', () => {
        runFullTransition('sauce-section');
    });

    // ----- Section 3: Saus -----
    choiceItemsSauce.forEach(item => {
        item.addEventListener('click', () => {
            choiceItemsSauce.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            orderState.sauce = item.dataset.choice;
            updateVisuals();
            nextToExtraBtn.classList.remove('hidden');
        });
    });
    nextToExtraBtn.addEventListener('click', () => {
        runFullTransition('extra-section');
    });

    // ----- Section 4: Ekstra -----
    extraItemRows.forEach(row => {
        const extraName = row.dataset.extra;
        const plusBtn = row.querySelector('.extra-plus');
        const minusBtn = row.querySelector('.extra-minus');
        const quantitySpan = row.querySelector('.extra-quantity');
        orderState.extras[extraName] = 0;
        
        plusBtn.addEventListener('click', () => {
            if (orderState.extras[extraName] < 16) {
                orderState.extras[extraName]++;
                quantitySpan.textContent = orderState.extras[extraName];
                minusBtn.disabled = false;
                updatePrice();
                updateVisuals();
            }
        });
        minusBtn.addEventListener('click', () => {
            if (orderState.extras[extraName] > 0) {
                orderState.extras[extraName]--;
                quantitySpan.textContent = orderState.extras[extraName];
                if (orderState.extras[extraName] === 0) minusBtn.disabled = true;
                updatePrice();
                updateVisuals();
            }
        });
    });
    
    document.getElementById('next-to-finish-btn').addEventListener('click', () => {
        runFullTransition('finish-summary-section');
    });
    
    // ----- Section 5: Finish -----
    document.getElementById('next-to-payment-from-finish-btn').addEventListener('click', () => {
        if (isTransitioning) return;
        updateOrderSummary();
        globalPancakeContainer.classList.add('hidden');
        hideCurrentContent(() => {
            showContent('payment-section');
        });
    });
    
    // Tombol Back dari Payment
    document.getElementById('back-from-payment').addEventListener('click', () => {
       if (isTransitioning) return;
       hideCurrentContent(() => {
           // Hapus 'hidden' agar pancake muncul lagi saat kembali
           globalPancakeContainer.classList.remove('hidden');
    
           showContent('finish-summary-section');
       });
    });

    // =============================================
    // 6. PAYMENT SECTION - ✅ DENGAN ADDRESS
    // =============================================
    if (paymentProofInput) {
        paymentProofInput.addEventListener('change', function(){
            if(fileChosenText) fileChosenText.textContent = this.files[0] ? this.files[0].name : 'No file chosen';
        });
    }

    finishOrderBtn.addEventListener('click', async function() { 
        // ✅ TAMBAHAN: Ambil nilai address
        const customerName = document.getElementById('customer-name').value;
        const customerAddress = document.getElementById('customer-address').value;
        const customerWhatsapp = document.getElementById('customer-whatsapp').value;
        const paymentProofFile = paymentProofInput ? paymentProofInput.files[0] : null; 
        
        // ✅ TAMBAHAN: Validasi address
        if (!customerName || !customerAddress || !customerWhatsapp) { 
            alert("Please fill in all your information (Name, Address, WhatsApp Number)."); 
            return; 
        }
        if (!paymentProofFile) { 
            alert("Please upload your proof of payment."); 
            return; 
        }
        if (!orderState.fruit) {
            alert("Terjadi kesalahan. Silakan kembali dan pilih buah utama Anda.");
            hideCurrentContent(() => {
                globalPancakeContainer.classList.remove('hidden');
                showContent('fruit-section');
            });
            return;
        }
        
        finishOrderBtn.disabled = true;
        finishOrderBtn.textContent = "UPLOADING...";
        
        try {
            const fileData = await fileToBase64(paymentProofFile);
            updateOrderSummary();
            const orderDetailsText = orderSummaryText.textContent;
            const finalPrice = orderState.totalCost;
            
            // ✅ TAMBAHAN: Tambahkan address ke orderData
            const orderData = {
                nama: customerName, 
                alamat: customerAddress,
                whatsapp: customerWhatsapp, 
                pesanan: orderDetailsText,
                jumlah: 1, 
                total: finalPrice, 
                file: fileData, 
                fileName: paymentProofFile.name
            };
            
            finishOrderBtn.textContent = "SENDING...";
            
            const response = await fetch(SCRIPT_URL, {
                method: 'POST', 
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData) 
            });
            
            alert("Your order has been placed successfully! Thank you!");
            window.location.reload();
            
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again. Error: " + error.message);
            finishOrderBtn.disabled = false;
            finishOrderBtn.textContent = "FINISH ORDER";
        }
    });

    // =============================================
    // 7. LOGIKA LOADING SCREEN
    // =============================================
    if (loadingScreen && landingPage) { 
        const loadingTime = 2500; 
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none'; 
                landingPage.classList.add('visible'); 
                const animatedTexts = landingPage.querySelectorAll('.animated-text');
                const animatedImage = landingPage.querySelector('.animated-image');
                animatedTexts.forEach(el => {
                    el.style.animation = 'none'; 
                    el.offsetHeight; 
                    el.style.animation = '';
                });
                if (animatedImage) {
                    animatedImage.style.animation = 'none'; 
                    animatedImage.offsetHeight; 
                    animatedImage.style.animation = '';
                }
            }, 500); 
        }, loadingTime); 
    } else {
         console.error("Loading screen or landing page element not found!");
         globalPancakeContainer.classList.remove('hidden');
         globalPancakeContainer.classList.add('animate-drop');
         showContent('fruit-section'); 
    }
});