

document.addEventListener("DOMContentLoaded", function () {

    // ==================================================
    // 0. DATA DARI data.js + HELPER UMUM
    // ==================================================

    const USERS    = typeof dataPengguna    !== "undefined" ? dataPengguna    : [];
    const CATALOG  = typeof dataKatalogBuku !== "undefined" ? dataKatalogBuku : [];
    const TRACKING = typeof dataTracking    !== "undefined" ? dataTracking    : {};

    // "en" = Good Morning, ...   |   "id" = Selamat Pagi, ...
    const GREETING_LANG = "en";
    const LOCALE = GREETING_LANG === "id" ? "id-ID" : "en-GB";

    function readJSON(key, fallback) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value === null || value === undefined ? fallback : value;
        } catch (error) {
            console.error("Storage error (" + key + "):", error);
            return fallback;
        }
    }

    function escapeHTML(value) {
        return String(value === undefined || value === null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function formatRupiah(price) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(price);
    }

    // Terima "2025-08-25", "2025-08-25 10:12:20", ISO string, atau Date
    function parseDate(value) {
        if (!value) return null;
        if (value instanceof Date) return value;

        const text = String(value).trim();

        // ISO lengkap dengan zona waktu (mis. dari toISOString)
        if (/T.*(Z|[+-]\d{2}:\d{2})$/.test(text)) {
            const iso = new Date(text);
            return isNaN(iso) ? null : iso;
        }

        const m = text.match(
            /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/
        );

        if (m) {
            return new Date(
                +m[1], +m[2] - 1, +m[3],
                +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)
            );
        }

        const fallback = new Date(text);
        return isNaN(fallback) ? null : fallback;
    }

    function formatDate(value, withTime) {
        const date = parseDate(value);
        if (!date) return "-";

        let result = date.toLocaleDateString(LOCALE, {
            day: "numeric", month: "long", year: "numeric"
        });

        if (withTime) {
            result += ", " + date.toLocaleTimeString(LOCALE, {
                hour: "2-digit", minute: "2-digit"
            });
        }

        return result;
    }

    function addDays(date, days) {
        const copy = new Date(date.getTime());
        copy.setDate(copy.getDate() + days);
        return copy;
    }

    function getUser() {
        const user = readJSON("tandaiUser", null);
        if (!user) return null;
        return {
            name: user.nama || user.name || "",
            email: user.email || ""
        };
    }

    function showToast(message) {
        let toast = document.getElementById("toast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "toast";
            toast.className = "toast";
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(function () {
            toast.classList.remove("show");
        }, 2200);
    }


    // ==================================================
    // 1. LOGIN & REGISTER
    // ==================================================

    const container   = document.getElementById("container");
    const registerBtn = document.getElementById("register");
    const loginBtn    = document.getElementById("login");
    const loginForm   = document.getElementById("loginForm");
    const signupForm  = document.getElementById("signupForm");

    if (registerBtn && container) {
        registerBtn.addEventListener("click", function () {
            container.classList.add("active");
        });
    }

    if (loginBtn && container) {
        loginBtn.addEventListener("click", function () {
            container.classList.remove("active");
        });
    }

    function saveSession(user) {
        localStorage.setItem("tandaiUser", JSON.stringify({
            id: user.id,
            nama: user.nama,
            email: user.email,
            role: user.role
        }));
    }

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const email = document.getElementById("loginEmail").value
                .trim().toLowerCase();
            const password = document.getElementById("loginPassword").value;

            // pengguna bawaan (data.js) + pengguna yang mendaftar lewat Sign Up
            const allUsers = USERS.concat(readJSON("tandaiUsers", []));

            const loggedInUser = allUsers.find(function (user) {
                return user.email.toLowerCase() === email &&
                       user.password === password;
            });

            if (loggedInUser) {
                saveSession(loggedInUser);
                alert("Login berhasil! Selamat datang, " + loggedInUser.nama + ".");
                window.location.href = "dashboard.html";
            } else {
                alert("Email atau password yang Anda masukkan salah. Silakan coba kembali.");
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const name = document.getElementById("signupName").value.trim();
            const email = document.getElementById("signupEmail").value.trim();
            const password = document.getElementById("signupPassword").value;

            if (!name || !email || !password) {
                alert("Please complete all fields!");
                return;
            }

            const registered = readJSON("tandaiUsers", []);
            const exists = USERS.concat(registered).some(function (user) {
                return user.email.toLowerCase() === email.toLowerCase();
            });

            if (exists) {
                alert("This email is already registered. Please sign in.");
                return;
            }

            const newUser = {
                id: Date.now(),
                nama: name,
                email: email,
                password: password,
                role: "User"
            };

            registered.push(newUser);
            localStorage.setItem("tandaiUsers", JSON.stringify(registered));

            saveSession(newUser);

            alert("Account created successfully! Welcome to Tandai Shop.");
            window.location.href = "dashboard.html";
        });
    }


    // ==================================================
    // 2. DATA BUKU (genre + buku ajar dari data.js)
    // ==================================================

    const genreBooks = [
        { id: 1,  title: "The Love Hypothesis",        category: "romance",       price: 95000,  stock: 25, image: "love.jpg" },
        { id: 2,  title: "The Adventure Begins",       category: "action",        price: 110000, stock: 18, image: "adventurebegin.jpg" },
        { id: 3,  title: "Behind the Mind",            category: "psychological", price: 120000, stock: 12, image: "behind.jpg" },
        { id: 4,  title: "The Haunted House",          category: "supernatural",  price: 85000,  stock: 8,  image: "house.jpg" },
        { id: 5,  title: "The Ultimate Self Care",     category: "beauty",        price: 75000,  stock: 15, image: "care.jpg" },
        { id: 6,  title: "Fitness for Everyone",       category: "sports",        price: 90000,  stock: 10, image: "fitnes.jpg" },
        { id: 7,  title: "The Art of Cooking",         category: "cooking",       price: 100000, stock: 20, image: "cook.jpg" },
        { id: 8,  title: "My First Picture Book",      category: "picture",       price: 65000,  stock: 14, image: "images/picture-book.jpg" },
        { id: 9,  title: "The Little Explorer",        category: "chapter",       price: 70000,  stock: 9,  image: "images/little-explorer.jpg" },
        { id: 10, title: "Young and Free",             category: "young-adult",   price: 88000,  stock: 16, image: "images/young-and-free.jpg" },
        { id: 11, title: "English Made Easy",          category: "english",       price: 95000,  stock: 11, image: "images/english-made-easy.jpg" },
        { id: 12, title: "Learning Foreign Languages", category: "foreign",       price: 105000, stock: 7,  image: "images/foreign-languages.jpg" }
    ];

    // Buku ajar dari data.js -> diubah ke format yang dipakai halaman
    const textBooks = CATALOG.map(function (item, index) {
        return {
            id: 101 + index,
            code: item.kodeBarang,
            title: item.namaBarang,
            category: "textbook",
            edition: item.edisi,
            price: Number(String(item.harga).replace(/[^0-9]/g, "")),
            stock: Number(item.stok),
            image: item.cover
        };
    });

    const books = genreBooks.concat(textBooks);

    const categoryLabels = {
        textbook: "Textbook (Buku Ajar)",
        "young-adult": "Young Adult",
        psychological: "Psychological Horror",
        supernatural: "Supernatural Horror",
        english: "English (ESL)",
        foreign: "Foreign Language"
    };

    function getCategoryLabel(category) {
        return categoryLabels[category] || category.replace(/-/g, " ");
    }

    function getStockStatus(stock) {
        if (stock > 10) return "Available";
        if (stock > 0) return "Low Stock";
        return "Out of Stock";
    }


    // ==================================================
    // 3. LOGOUT
    // ==================================================

    document.querySelectorAll("[data-logout], #logoutBtn").forEach(function (el) {
        el.addEventListener("click", function (event) {
            event.preventDefault();

            if (confirm("Are you sure you want to log out?")) {
                localStorage.removeItem("tandaiUser");
                window.location.href = "index.html";
            }
        });
    });


    // ==================================================
    // 4. DASHBOARD: NAVIGASI HALAMAN
    // ==================================================

    function showPage(pageId) {

        const target = document.getElementById(pageId);
        if (!target) return;

        document.querySelectorAll(".nav-item[data-page]").forEach(function (nav) {
            nav.classList.toggle("active", nav.dataset.page === pageId);
        });

        document.querySelectorAll(".page").forEach(function (page) {
            page.classList.toggle("active", page === target);
        });
    }

    document.querySelectorAll(".nav-item[data-page], .nav-item[data-link]")
        .forEach(function (item) {
            item.addEventListener("click", function () {
                if (this.dataset.link) {
                    window.location.href = this.dataset.link;
                    return;
                }
                showPage(this.dataset.page);
            });
        });


    // ==================================================
    // 5. DASHBOARD: GREETING (WAKTU LOKAL + NAMA)
    // ==================================================

    const greetingWords = {
        en: ["Good Morning", "Good Afternoon", "Good Evening", "Good Night"],
        id: ["Selamat Pagi", "Selamat Siang", "Selamat Sore", "Selamat Malam"]
    };

    function getDayPeriod(hour) {
        if (hour >= 5 && hour < 11)  return 0; // pagi
        if (hour >= 11 && hour < 15) return 1; // siang
        if (hour >= 15 && hour < 18) return 2; // sore
        return 3;                              // malam
    }

    function displayGreeting() {

        const greetingElement = document.getElementById("greeting");
        if (!greetingElement) return;

        const now = new Date();
        const user = getUser();
        const word = greetingWords[GREETING_LANG][getDayPeriod(now.getHours())];

        greetingElement.textContent =
            user && user.name ? word + ", " + user.name + "!" : word + "!";

        const timeElement = document.getElementById("greetingTime");

        if (timeElement) {
            timeElement.textContent =
                now.toLocaleDateString(LOCALE, {
                    weekday: "long", day: "numeric",
                    month: "long", year: "numeric"
                }) + " • " +
                now.toLocaleTimeString(LOCALE, {
                    hour: "2-digit", minute: "2-digit"
                });
        }
    }

    displayGreeting();

    if (document.getElementById("greeting")) {
        setInterval(displayGreeting, 30000);
    }


    // ==================================================
    // 6. DASHBOARD: KARTU STATISTIK & STOK PER KATEGORI
    // ==================================================

    const statTitles = document.getElementById("statTitles");
    const statStock = document.getElementById("statStock");
    const statCategories = document.getElementById("statCategories");

    if (statTitles && statStock && statCategories) {
        statTitles.textContent = books.length;
        statStock.textContent = books.reduce(function (sum, b) { return sum + b.stock; }, 0);
        statCategories.textContent = new Set(books.map(function (b) { return b.category; })).size;
    }

    const catalogSelect = document.getElementById("catalogSelect");
    const stockDisplay = document.getElementById("stockDisplay");

    if (catalogSelect && stockDisplay) {

        catalogSelect.addEventListener("change", function () {

            const category = this.value;

            if (!category) {
                stockDisplay.innerHTML = "<p>Please select a category.</p>";
                return;
            }

            const list = category === "all"
                ? books
                : books.filter(function (b) { return b.category === category; });

            if (list.length === 0) {
                stockDisplay.innerHTML = "<p>Stock information is unavailable.</p>";
                return;
            }

            const totalStock = list.reduce(function (sum, b) { return sum + b.stock; }, 0);

            stockDisplay.innerHTML =
                "<h3>Stock Availability</h3>" +
                "<p>Titles: " + list.length + "</p>" +
                "<p>Available Stock: " + totalStock + " Books</p>" +
                "<p>Status: " + getStockStatus(totalStock) + "</p>";
        });
    }


    // ==================================================
    // 7. PESANAN, TRACKING, DAN SERVICES
    // ==================================================

    function readOrders() {
        const orders = readJSON("tandaiOrders", []);
        return Array.isArray(orders) ? orders : [];
    }

    const TRACK_STAGES = ["Order Processed", "Shipped", "In Transit", "Delivered"];

    // Tracking dari data.js (nomor DO)
    function normalizeDataTracking(t) {

        const history = (t.perjalanan || []).map(function (step) {
            return { time: parseDate(step.waktu), text: step.keterangan };
        });

        const last = history[history.length - 1];
        const delivered = !!last && /selesai antar/i.test(last.text);

        let stage = 0;
        if (delivered) stage = 3;
        else if (t.status === "Dalam Perjalanan") stage = 2;
        else if (t.status === "Dikirim") stage = 1;

        const shipDate = parseDate(t.tanggalKirim);

        return {
            number: t.nomorDO,
            name: t.nama,
            stage: stage,
            courier: t.ekspedisi,
            shipDate: shipDate,
            receivedDate: delivered ? last.time : null,
            estimate: !delivered && shipDate
                ? formatDate(addDays(shipDate, 3)) : null,
            packageType: t.paket,
            total: t.total,
            history: history
        };
    }

    // Tracking dari pesanan yang dibuat di checkout (nomor resi)
    function normalizeOrderTracking(order) {

        const created = parseDate(order.createdAt);

        return {
            number: order.resi,
            name: order.customer ? order.customer.name : "-",
            stage: 0,
            courier: order.ekspedisi || "-",
            shipDate: created,
            receivedDate: null,
            estimate: order.estimateFrom && order.estimateTo
                ? formatDate(order.estimateFrom) + " – " + formatDate(order.estimateTo)
                : null,
            packageType: order.paket || "Regular",
            total: formatRupiah(order.total),
            history: [{
                time: created,
                text: "Order received and is being processed by Tandai Shop"
            }]
        };
    }

    function findTracking(code) {

        const key = String(code).trim().toUpperCase();
        if (!key) return null;

        const fromData = Object.keys(TRACKING).map(function (k) {
            return TRACKING[k];
        }).find(function (t) {
            return String(t.nomorDO).toUpperCase() === key;
        });

        if (fromData) return normalizeDataTracking(fromData);

        const order = readOrders().find(function (o) {
            return String(o.resi || "").toUpperCase() === key ||
                   String(o.orderId || "").toUpperCase() === key;
        });

        return order && order.resi ? normalizeOrderTracking(order) : null;
    }

    function renderTracking(t) {

        const percent = Math.round((t.stage / (TRACK_STAGES.length - 1)) * 100);

        const steps = TRACK_STAGES.map(function (label, index) {
            let css = "";
            if (index < t.stage) css = "done";
            else if (index === t.stage) css = t.stage === 3 ? "done" : "current";

            return '<li class="' + css + '">' +
                       '<span class="step-dot">' +
                           (index <= t.stage && css === "done"
                               ? '<i class="fa-solid fa-check"></i>' : index + 1) +
                       '</span>' +
                       '<span class="step-label">' + label + '</span>' +
                   '</li>';
        }).join("");

        const timeline = t.history.slice().reverse().map(function (step) {
            return '<li><time>' + escapeHTML(formatDate(step.time, true)) + '</time>' +
                   '<span>' + escapeHTML(step.text) + '</span></li>';
        }).join("");

        return '' +
        '<div class="track-card">' +
            '<div class="track-head">' +
                '<div><span class="track-label">Tracking No.</span>' +
                '<h4>' + escapeHTML(t.number) + '</h4>' +
                '<p>' + escapeHTML(t.name) + '</p></div>' +
                '<span class="track-badge">' + TRACK_STAGES[t.stage] + '</span>' +
            '</div>' +

            '<div class="progress-track">' +
                '<div class="progress-bar"><div class="progress-fill" style="width:' + percent + '%"></div></div>' +
                '<ol class="progress-steps">' + steps + '</ol>' +
            '</div>' +

            '<dl class="track-details">' +
                '<div><dt>Courier</dt><dd>' + escapeHTML(t.courier) + '</dd></div>' +
                '<div><dt>Ship Date</dt><dd>' + escapeHTML(formatDate(t.shipDate)) + '</dd></div>' +
                '<div><dt>Received Date</dt><dd>' +
                    (t.receivedDate
                        ? escapeHTML(formatDate(t.receivedDate))
                        : 'Not received yet' + (t.estimate ? '<small>Estimated: ' + escapeHTML(t.estimate) + '</small>' : '')) +
                '</dd></div>' +
                '<div><dt>Package Type</dt><dd>' + escapeHTML(t.packageType) + '</dd></div>' +
                '<div><dt>Total Payment</dt><dd>' + escapeHTML(t.total) + '</dd></div>' +
            '</dl>' +

            '<h4 class="track-subtitle">Shipment History</h4>' +
            '<ul class="track-timeline">' + timeline + '</ul>' +
        '</div>';
    }

    const serviceSelect = document.getElementById("serviceSelect");
    const serviceDisplay = document.getElementById("serviceDisplay");

    function getTrackingChips() {

        const user = getUser();
        const numbers = [];

        Object.keys(TRACKING).forEach(function (key) {
            if (user && TRACKING[key].nama === user.name) {
                numbers.push(TRACKING[key].nomorDO);
            }
        });

        readOrders().forEach(function (order) {
            if (order.resi) numbers.push(order.resi);
        });

        return numbers;
    }

    function renderServicePanel(service) {

        if (!serviceDisplay) return;

        if (service === "tracking") {

            const chips = getTrackingChips();
            const sample = Object.keys(TRACKING).join(" or ");

            serviceDisplay.innerHTML =
                '<h3>Tracking Your Order</h3>' +
                '<p>Enter your delivery number (DO) or tracking number (resi).' +
                (chips.length ? '' : ' Try ' + escapeHTML(sample) + '.') + '</p>' +
                '<form id="trackForm" class="track-form">' +
                    '<input type="text" id="trackInput" placeholder="e.g. 20230012" required>' +
                    '<button type="submit">Track Order</button>' +
                '</form>' +
                (chips.length
                    ? '<div class="track-chips"><span>Your shipments:</span>' +
                      chips.map(function (n) {
                          return '<button type="button" class="track-chip" data-track="' + escapeHTML(n) + '">' + escapeHTML(n) + '</button>';
                      }).join("") + '</div>'
                    : '') +
                '<div id="trackResult"></div>';

        } else if (service === "view-order") {

            const count = readOrders().length;

            serviceDisplay.innerHTML =
                '<h3>View Order</h3>' +
                '<p>You have ' + count + ' order' + (count === 1 ? '' : 's') +
                ' with tracking number, products, total price, and estimated delivery.</p>' +
                '<a class="service-link" href="orders.html">' +
                '<i class="fa-solid fa-box"></i> Open My Orders</a>';

        } else if (service === "payment") {

            serviceDisplay.innerHTML =
                '<h3>Payment</h3>' +
                '<p>Choose your preferred payment method at checkout: ' +
                'Bank Transfer, E-Wallet, or Cash on Delivery.</p>';

        } else {

            serviceDisplay.innerHTML = "<p>Please select a service.</p>";
        }
    }

    function runTracking(code) {

        const result = document.getElementById("trackResult");
        const input = document.getElementById("trackInput");

        if (!result) return;
        if (input) input.value = code;

        const tracking = findTracking(code);

        result.innerHTML = tracking
            ? renderTracking(tracking)
            : '<p class="track-empty">No shipment found for "' + escapeHTML(code) +
              '". Please check the number and try again.</p>';
    }

    if (serviceSelect && serviceDisplay) {

        serviceSelect.addEventListener("change", function () {
            renderServicePanel(this.value);
        });

        // event delegation: panel dibuat ulang lewat innerHTML
        serviceDisplay.addEventListener("submit", function (event) {
            if (event.target.id !== "trackForm") return;
            event.preventDefault();
            runTracking(document.getElementById("trackInput").value);
        });

        serviceDisplay.addEventListener("click", function (event) {
            const chip = event.target.closest(".track-chip");
            if (chip) runTracking(chip.dataset.track);
        });

        // dibuka dari halaman orders: dashboard.html?track=NOMOR
        const trackParam = new URLSearchParams(window.location.search).get("track");

        if (trackParam) {
            showPage("services");
            serviceSelect.value = "tracking";
            renderServicePanel("tracking");
            runTracking(trackParam);
        }
    }


    // ==================================================
    // 8. HALAMAN COLLECTION & STOCK
    // ==================================================

    const bookGrid = document.getElementById("bookGrid");
    const bookSearch = document.getElementById("bookSearch");
    const bookCount = document.getElementById("bookCount");
    const emptyMessage = document.getElementById("emptyMessage");
    const bookCategory = document.getElementById("bookCategory");

    function displayBooks(bookList) {

        if (!bookGrid) return;

        bookGrid.innerHTML = "";

        if (bookCount) {
            bookCount.textContent = bookList.length + " Books Available";
        }

        if (emptyMessage) {
            emptyMessage.hidden = bookList.length !== 0;
        }

        bookList.forEach(function (book) {

            const card = document.createElement("article");
            card.className = "book-card";

            // ---- sampul ----
            const cover = document.createElement("div");
            cover.className = "book-cover";

            const image = document.createElement("img");
            image.src = book.image;
            image.alt = "Cover " + book.title;
            image.loading = "lazy";

            image.onerror = function () {
                image.remove();
                cover.classList.add("no-image");
                cover.innerHTML =
                    '<i class="fa-solid fa-book-open"></i>' +
                    '<span>' + escapeHTML(book.title) + '</span>';
            };

            cover.appendChild(image);

            // ---- informasi ----
            const statusText = getStockStatus(book.stock);
            const statusClass = statusText.toLowerCase().replace(/ /g, "-");

            const info = document.createElement("div");
            info.className = "book-info";

            info.innerHTML =
                '<span class="book-category">' + escapeHTML(getCategoryLabel(book.category)) + '</span>' +
                '<h3 class="book-title">' + escapeHTML(book.title) + '</h3>' +
                (book.code
                    ? '<p class="book-meta">' + escapeHTML(book.code) + ' · Edition ' + escapeHTML(book.edition) + '</p>'
                    : '') +
                '<p class="book-price">' + formatRupiah(book.price) + '</p>' +
                '<p class="book-stock">Stock: ' + book.stock + ' Books</p>' +
                '<span class="stock-status ' + statusClass + '">' + statusText + '</span>' +
                '<button class="add-to-cart" type="button" data-id="' + book.id + '"' +
                    (book.stock === 0 ? ' disabled' : '') + '>' +
                    '<i class="fa-solid fa-cart-plus"></i> ' +
                    (book.stock === 0 ? 'Out of Stock' : 'Add to Cart') +
                '</button>';

            card.append(cover, info);
            bookGrid.appendChild(card);
        });
    }

    function filterBooks() {

        if (!bookGrid) return;

        const keyword = bookSearch ? bookSearch.value.toLowerCase().trim() : "";
        const selected = bookCategory ? bookCategory.value : "all";

        const filtered = books.filter(function (book) {

            const matchesSearch =
                book.title.toLowerCase().includes(keyword) ||
                (book.code || "").toLowerCase().includes(keyword) ||
                getCategoryLabel(book.category).toLowerCase().includes(keyword);

            const matchesCategory =
                !selected || selected === "all" || book.category === selected;

            return matchesSearch && matchesCategory;
        });

        displayBooks(filtered);
    }

    if (bookSearch) {
        bookSearch.addEventListener("input", filterBooks);
    }

    if (bookCategory) {

        const categoryFromURL =
            new URLSearchParams(window.location.search).get("category");

        const validCategory = Array.from(bookCategory.options).some(function (option) {
            return option.value === categoryFromURL;
        });

        if (categoryFromURL && validCategory) {
            bookCategory.value = categoryFromURL;
        }

        bookCategory.addEventListener("change", function () {

            // di dashboard tidak ada daftar buku -> buka halaman collection
            if (!bookGrid) {
                if (this.value) {
                    window.location.href =
                        "stock.html?category=" + encodeURIComponent(this.value);
                }
                return;
            }

            filterBooks();
        });
    }


    // ==================================================
    // 9. SHOPPING CART
    // ==================================================

    let cart = readJSON("tandaiCart", []);
    if (!Array.isArray(cart)) cart = [];

    function saveCart() {
        localStorage.setItem("tandaiCart", JSON.stringify(cart));
    }

    function updateCartCount() {

        const cartCount = document.getElementById("cartCount");
        if (!cartCount) return;

        cartCount.textContent = cart.reduce(function (total, item) {
            return total + Number(item.quantity || 0);
        }, 0);
    }

    function addToCart(bookId) {

        const book = books.find(function (b) { return b.id === bookId; });
        if (!book) return;

        const existing = cart.find(function (item) { return item.id === bookId; });

        if (existing) {

            if (existing.quantity >= book.stock) {
                showToast("Maximum available stock reached!");
                return;
            }

            existing.quantity++;

        } else {

            cart.push({
                id: book.id,
                title: book.title,
                category: book.category,
                price: book.price,
                stock: book.stock,
                image: book.image,
                quantity: 1
            });
        }

        saveCart();
        updateCartCount();
        renderCart();

        showToast(book.title + " added to cart");
    }

    if (bookGrid) {
        bookGrid.addEventListener("click", function (event) {

            const button = event.target.closest(".add-to-cart");
            if (!button || button.disabled) return;

            addToCart(Number(button.dataset.id));
        });
    }

    const shoppingCartBtn = document.getElementById("shoppingCartBtn");
    const cartDrawer = document.getElementById("cartDrawer");
    const cartOverlay = document.getElementById("cartOverlay");
    const closeCart = document.getElementById("closeCart");
    const continueShopping = document.getElementById("continueShopping");

    function openCart() {
        if (!cartDrawer || !cartOverlay) return;
        renderCart();
        cartDrawer.classList.add("show");
        cartOverlay.classList.add("show");
    }

    function closeCartDrawer() {
        if (!cartDrawer || !cartOverlay) return;
        cartDrawer.classList.remove("show");
        cartOverlay.classList.remove("show");
    }

    if (shoppingCartBtn) shoppingCartBtn.addEventListener("click", openCart);
    if (closeCart) closeCart.addEventListener("click", closeCartDrawer);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCartDrawer);
    if (continueShopping) continueShopping.addEventListener("click", closeCartDrawer);

    function renderCart() {

        const cartItems = document.getElementById("cartItems");
        const cartSubtotal = document.getElementById("cartSubtotal");

        if (!cartItems || !cartSubtotal) return;

        cartItems.innerHTML = "";

        if (cart.length === 0) {

            const empty = document.createElement("p");
            empty.className = "empty-cart";
            empty.textContent = "Your shopping cart is empty.";
            cartItems.appendChild(empty);

        } else {

            cart.forEach(function (item) {

                const cartItem = document.createElement("div");
                cartItem.className = "cart-item";

                cartItem.innerHTML =
                    '<div class="cart-item-info">' +
                        '<h3>' + escapeHTML(item.title) + '</h3>' +
                        '<p>' + formatRupiah(item.price) + '</p>' +
                        '<div class="quantity-control">' +
                            '<button class="quantity-btn" type="button" data-action="decrease" data-id="' + item.id + '">−</button>' +
                            '<span>' + item.quantity + '</span>' +
                            '<button class="quantity-btn" type="button" data-action="increase" data-id="' + item.id + '">+</button>' +
                        '</div>' +
                        '<button class="remove-cart" type="button" data-action="remove" data-id="' + item.id + '">Remove</button>' +
                    '</div>';

                cartItems.appendChild(cartItem);
            });
        }

        cartSubtotal.textContent = formatRupiah(
            cart.reduce(function (total, item) {
                return total + item.price * item.quantity;
            }, 0)
        );
    }

    const cartItemsElement = document.getElementById("cartItems");

    if (cartItemsElement) {
        cartItemsElement.addEventListener("click", function (event) {

            const button = event.target.closest("[data-action]");
            if (!button) return;

            const bookId = Number(button.dataset.id);
            const action = button.dataset.action;
            const item = cart.find(function (p) { return p.id === bookId; });

            if (!item) return;

            if (action === "increase") {

                if (item.quantity >= item.stock) {
                    showToast("Maximum available stock reached!");
                    return;
                }
                item.quantity++;

            } else if (action === "decrease") {

                item.quantity--;

                if (item.quantity <= 0) {
                    cart = cart.filter(function (p) { return p.id !== bookId; });
                }

            } else if (action === "remove") {

                cart = cart.filter(function (p) { return p.id !== bookId; });
            }

            saveCart();
            updateCartCount();
            renderCart();
        });
    }

    if (bookGrid) filterBooks();

    updateCartCount();
    renderCart();

    const checkoutBtn = document.getElementById("checkoutBtn");

    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", function () {

            if (cart.length === 0) {
                showToast("Your shopping cart is empty!");
                return;
            }

            window.location.href = "checkout.html";
        });
    }


    // ==================================================
    // 10. CHECKOUT + RECEIPT POP-UP
    // ==================================================

    const checkoutItems = document.getElementById("checkoutItems");
    const checkoutTotal = document.getElementById("checkoutTotal");
    const checkoutForm = document.getElementById("checkoutForm");
    const receiptModal = document.getElementById("receiptModal");
    const receiptContent = document.getElementById("receiptContent");

    function displayCheckoutSummary() {

        if (!checkoutItems || !checkoutTotal) return;

        checkoutItems.innerHTML = "";

        if (cart.length === 0) {

            checkoutItems.innerHTML =
                '<p class="checkout-empty">Your shopping cart is empty.</p>';

            checkoutTotal.textContent = formatRupiah(0);

            if (checkoutForm) {
                checkoutForm.querySelector('button[type="submit"]').disabled = true;
            }
            return;
        }

        let total = 0;

        cart.forEach(function (item) {

            const subtotal = item.price * item.quantity;
            total += subtotal;

            const book = books.find(function (b) { return b.id === item.id; });
            const imagePath = item.image || (book ? book.image : "");

            const row = document.createElement("div");
            row.className = "checkout-item";

            row.innerHTML =
                '<img src="' + escapeHTML(imagePath) + '" alt="' + escapeHTML(item.title) + '" onerror="this.style.display=\'none\'">' +
                '<div class="checkout-item-info">' +
                    '<h3>' + escapeHTML(item.title) + '</h3>' +
                    '<p>' + item.quantity + ' × ' + formatRupiah(item.price) + '</p>' +
                '</div>' +
                '<strong>' + formatRupiah(subtotal) + '</strong>';

            checkoutItems.appendChild(row);
        });

        checkoutTotal.textContent = formatRupiah(total);
    }

    function generateResi() {
        return "TDI" + String(Date.now()).slice(-9) +
               String(Math.floor(Math.random() * 90) + 10);
    }

    function showReceipt(order) {

        if (!receiptModal || !receiptContent) return;

        const rows = order.items.map(function (item) {
            return '<tr>' +
                '<td>' + escapeHTML(item.title) + '</td>' +
                '<td class="r-center">' + item.quantity + '</td>' +
                '<td class="r-right">' + formatRupiah(item.price) + '</td>' +
                '<td class="r-right">' + formatRupiah(item.price * item.quantity) + '</td>' +
            '</tr>';
        }).join("");

        receiptContent.innerHTML =
            '<div class="receipt-top">' +
                '<i class="fa-solid fa-circle-check"></i>' +
                '<h2 id="receiptTitle">Order Placed Successfully</h2>' +
                '<p>Thank you for shopping at Tandai Shop</p>' +
            '</div>' +

            '<div class="receipt-meta">' +
                '<div><span>Order ID</span><strong>' + escapeHTML(order.orderId) + '</strong></div>' +
                '<div><span>Tracking No. (Resi)</span><strong>' + escapeHTML(order.resi) + '</strong></div>' +
                '<div><span>Date</span><strong>' + escapeHTML(order.date) + '</strong></div>' +
                '<div><span>Payment</span><strong>' + escapeHTML(order.paymentMethod) + '</strong></div>' +
            '</div>' +

            '<div class="receipt-section">' +
                '<span>Deliver to</span>' +
                '<strong>' + escapeHTML(order.customer.name) + '</strong>' +
                '<p>' + escapeHTML(order.customer.address) + '</p>' +
                '<p>' + escapeHTML(order.customer.phone) + '</p>' +
            '</div>' +

            '<table class="receipt-table">' +
                '<thead><tr><th>Product</th><th class="r-center">Qty</th><th class="r-right">Price</th><th class="r-right">Subtotal</th></tr></thead>' +
                '<tbody>' + rows + '</tbody>' +
            '</table>' +

            '<div class="receipt-total"><span>Total Payment</span><strong>' + formatRupiah(order.total) + '</strong></div>' +

            '<p class="receipt-estimate"><i class="fa-solid fa-truck"></i> ' +
                escapeHTML(order.ekspedisi) + ' · Estimated delivery: ' +
                escapeHTML(formatDate(order.estimateFrom)) + ' – ' +
                escapeHTML(formatDate(order.estimateTo)) + '</p>';

        receiptModal.hidden = false;
        document.body.classList.add("modal-open");
    }

    const printReceipt = document.getElementById("printReceipt");

    if (printReceipt) {
        printReceipt.addEventListener("click", function () {
            window.print();
        });
    }

    if (checkoutForm) {

        // isi otomatis data akun yang sedang login
        const sessionUser = getUser();

        if (sessionUser) {
            const nameField = document.getElementById("customerName");
            const emailField = document.getElementById("customerEmail");
            if (nameField && !nameField.value) nameField.value = sessionUser.name;
            if (emailField && !emailField.value) emailField.value = sessionUser.email;
        }

        displayCheckoutSummary();

        checkoutForm.addEventListener("submit", function (event) {

            event.preventDefault();

            if (cart.length === 0) {
                alert("Your shopping cart is empty!");
                return;
            }

            const customerName = document.getElementById("customerName").value.trim();
            const customerEmail = document.getElementById("customerEmail").value.trim();
            const customerPhone = document.getElementById("customerPhone").value.trim();
            const customerAddress = document.getElementById("customerAddress").value.trim();
            const paymentMethod = document.getElementById("paymentMethod").value;

            if (!customerName || !customerEmail || !customerPhone ||
                !customerAddress || !paymentMethod) {
                alert("Please complete all checkout information!");
                return;
            }

            const now = new Date();
            const couriers = ["JNE", "Pos Indonesia", "J&T Express"];

            const newOrder = {
                orderId: "TS-" + Date.now(),
                resi: generateResi(),
                createdAt: now.toISOString(),
                date: formatDate(now, true),
                ekspedisi: couriers[Math.floor(Math.random() * couriers.length)],
                paket: "Regular",
                estimateFrom: addDays(now, 3).toISOString(),
                estimateTo: addDays(now, 5).toISOString(),

                customer: {
                    name: customerName,
                    email: customerEmail,
                    phone: customerPhone,
                    address: customerAddress
                },

                paymentMethod: paymentMethod,

                items: cart.map(function (item) {
                    return {
                        id: item.id,
                        title: item.title,
                        price: item.price,
                        quantity: item.quantity
                    };
                }),

                total: cart.reduce(function (total, item) {
                    return total + item.price * item.quantity;
                }, 0),

                status: "Processing"
            };

            const orders = readOrders();
            orders.unshift(newOrder);
            localStorage.setItem("tandaiOrders", JSON.stringify(orders));

            // kosongkan keranjang, lalu tampilkan struk
            cart = [];
            saveCart();
            updateCartCount();

            checkoutForm.querySelector('button[type="submit"]').disabled = true;
            displayCheckoutSummary();

            showReceipt(newOrder);
        });
    }


    // ==================================================
    // 11. VIEW ORDER (RIWAYAT PESANAN)
    // ==================================================

    const orderList = document.getElementById("orderList");
    const orderCount = document.getElementById("orderCount");
    const orderEmpty = document.getElementById("orderEmpty");

    function displayOrders() {

        if (!orderList) return;

        orderList.innerHTML = "";

        const orders = readOrders();

        if (orderCount) {
            orderCount.textContent = orders.length + (orders.length === 1 ? " Order" : " Orders");
        }

        if (orderEmpty) {
            orderEmpty.hidden = orders.length !== 0;
        }

        orders.forEach(function (order) {

            const items = order.items || [];
            const customer = order.customer || {};

            const products = items.map(function (item) {
                return '<div class="order-product">' +
                    '<span class="op-name">' + escapeHTML(item.title) + '</span>' +
                    '<span class="op-qty">Qty: ' + item.quantity + '</span>' +
                    '<strong>' + formatRupiah(item.price * item.quantity) + '</strong>' +
                '</div>';
            }).join("");

            const estimate = order.estimateFrom && order.estimateTo
                ? formatDate(order.estimateFrom) + " – " + formatDate(order.estimateTo)
                : "-";

            const card = document.createElement("article");
            card.className = "order-card";

            card.innerHTML =
                '<div class="order-card-header">' +
                    '<div>' +
                        '<span class="order-label">Order ID</span>' +
                        '<h3>' + escapeHTML(order.orderId) + '</h3>' +
                        '<p>' + escapeHTML(order.date) + '</p>' +
                    '</div>' +
                    '<span class="order-status">' + escapeHTML(order.status) + '</span>' +
                '</div>' +

                '<div class="order-shipping">' +
                    '<div><span>Tracking No. (Resi)</span><strong>' + escapeHTML(order.resi || "-") + '</strong></div>' +
                    '<div><span>Courier</span><strong>' + escapeHTML(order.ekspedisi || "-") + '</strong></div>' +
                    '<div><span>Estimated Delivery</span><strong>' + escapeHTML(estimate) + '</strong></div>' +
                '</div>' +

                '<div class="order-products">' +
                    '<h4>Ordered Books</h4>' +
                    products +
                '</div>' +

                '<div class="order-customer">' +
                    '<h4>Customer Information</h4>' +
                    '<p>' + escapeHTML(customer.name) + '</p>' +
                    '<p>' + escapeHTML(customer.email) + '</p>' +
                    '<p>' + escapeHTML(customer.phone) + '</p>' +
                    '<p>' + escapeHTML(customer.address) + '</p>' +
                '</div>' +

                '<div class="order-card-footer">' +
                    '<div><span>Payment Method</span><strong>' + escapeHTML(order.paymentMethod) + '</strong></div>' +
                    '<div><span>Total Payment</span><strong>' + formatRupiah(order.total) + '</strong></div>' +
                '</div>' +

                (order.resi
                    ? '<a class="order-track-link" href="dashboard.html?track=' + encodeURIComponent(order.resi) + '">' +
                      '<i class="fa-solid fa-location-dot"></i> Track This Order</a>'
                    : '');

            orderList.appendChild(card);
        });
    }

    displayOrders();

});
