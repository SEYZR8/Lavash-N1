const products = [

    {
        id: 1,
        name: "Lavash Klassik",
        category: "lavash",
        price: 28000,
        image: "🌯",
        description: "Go‘sht, pomidor, bodring, sous"
    },

    {
        id: 2,
        name: "Lavash Pishloqli",
        category: "lavash",
        price: 32000,
        image: "🌯",
        description: "Go‘sht, pishloq, sabzavot va maxsus sous",
        badge: "TOP"
    },

    {
        id: 3,
        name: "Lavash Achchiq",
        category: "lavash",
        price: 30000,
        image: "🌯",
        description: "Achchiq sous, go‘sht va yangi sabzavot"
    },

    {
        id: 4,
        name: "Burger N1",
        category: "burger",
        price: 35000,
        image: "🍔",
        description: "Mol go‘shti, pishloq, salat va sous",
        badge: "TOP"
    },

    {
        id: 5,
        name: "Cheeseburger",
        category: "burger",
        price: 38000,
        image: "🍔",
        description: "Go‘sht, cheddar pishloq va maxsus sous"
    },

    {
        id: 6,
        name: "Double Burger",
        category: "burger",
        price: 49000,
        image: "🍔",
        description: "Ikki dona go‘sht, pishloq va sous"
    },

    {
        id: 7,
        name: "Fri Kartoshka",
        category: "snack",
        price: 16000,
        image: "🍟",
        description: "Qarsildoq va issiq kartoshka",
        badge: "TOP"
    },

    {
        id: 8,
        name: "Chicken Nuggets",
        category: "snack",
        price: 22000,
        image: "🍗",
        description: "Qarsildoq tovuq nuggetlari"
    },

    {
        id: 9,
        name: "Coca-Cola",
        category: "drink",
        price: 10000,
        image: "🥤",
        description: "Sovutilgan Coca-Cola"
    },

    {
        id: 10,
        name: "Fanta",
        category: "drink",
        price: 10000,
        image: "🥤",
        description: "Sovutilgan Fanta"
    },

    {
        id: 11,
        name: "Sprite",
        category: "drink",
        price: 10000,
        image: "🥤",
        description: "Sovutilgan Sprite"
    },

    {
        id: 12,
        name: "Choy",
        category: "drink",
        price: 7000,
        image: "☕",
        description: "Issiq qora choy"
    }

];

let cart = JSON.parse(localStorage.getItem('lavash_cart') || '[]');

let currentCategory = "all";

const productsGrid =
    document.getElementById("productsGrid");

const searchInput =
    document.getElementById("searchInput");

const cartButton =
    document.getElementById("cartButton");

const mobileCartButton =
    document.getElementById("mobileCartButton");

const cartDrawer =
    document.getElementById("cartDrawer");

const closeCart =
    document.getElementById("closeCart");

const overlay =
    document.getElementById("overlay");

const cartItems =
    document.getElementById("cartItems");

const cartCount =
    document.getElementById("cartCount");

const mobileCartCount =
    document.getElementById("mobileCartCount");

const cartTotal =
    document.getElementById("cartTotal");

const checkoutButton =
    document.getElementById("checkoutButton");

const checkoutModal =
    document.getElementById("checkoutModal");

const closeCheckout =
    document.getElementById("closeCheckout");

const checkoutForm =
    document.getElementById("checkoutForm");

const toast =
    document.getElementById("toast");


function formatPrice(price) {

    return new Intl.NumberFormat("uz-UZ")
        .format(price) + " so‘m";

}


function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


async function loadProductsFromAPI() {
    try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("API");
        const result = await response.json();
        if (Array.isArray(result.data) && result.data.length) {
            products.length = 0;
            result.data.forEach(p => products.push({
                id: p.id,
                name: p.name,
                category: p.category,
                price: Number(p.price),
                image: p.image || "🌯",
                description: p.description || ""
            }));
            renderProducts();
        }
    } catch (error) {
        console.warn("API mahsulotlari yuklanmadi, demo ma'lumotlar ishlatilmoqda.", error);
    }
}

function renderProducts() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const filtered =
        products.filter(product => {

            const categoryMatch =
                currentCategory === "all" ||
                product.category === currentCategory;

            const searchMatch =
                product.name
                    .toLowerCase()
                    .includes(search) ||
                product.description
                    .toLowerCase()
                    .includes(search);

            return categoryMatch && searchMatch;

        });


    if (filtered.length === 0) {

        productsGrid.innerHTML = `
            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:60px 10px;
            ">
                <div style="font-size:50px;">🔎</div>
                <h3>Mahsulot topilmadi</h3>
                <p style="color:#777;">
                    Boshqa mahsulot nomini qidirib ko‘ring.
                </p>
            </div>
        `;

        return;

    }


    productsGrid.innerHTML =
        filtered.map(product => {

            return `

                <article class="product-card">

                    <div class="product-image">

                        ${
                            product.badge
                            ?
                            `<span class="product-badge">
                                ${product.badge}
                            </span>`
                            :
                            ""
                        }

                        ${product.image}

                    </div>

                    <div class="product-body">

                        <h3>
                            ${product.name}
                        </h3>

                        <p class="product-description">
                            ${product.description}
                        </p>

                        <div class="product-bottom">

                            <span class="product-price">
                                ${formatPrice(product.price)}
                            </span>

                            <button
                                class="add-button"
                                onclick="addToCart(${product.id})"
                            >
                                +
                            </button>

                        </div>

                    </div>

                </article>

            `;

        }).join("");

}


function addToCart(productId) {

    const product =
        products.find(
            item => item.id === productId
        );

    if (!product) return;


    const existing =
        cart.find(
            item => item.id === productId
        );


    if (existing) {

        existing.quantity++;

    } else {

        cart.push({
            ...product,
            quantity: 1
        });

    }


    saveCart();

    renderCart();

    showToast(
        `${product.name} savatchaga qo‘shildi`
    );

}


function changeQuantity(
    productId,
    amount
) {

    const item =
        cart.find(
            product => product.id === productId
        );

    if (!item) return;


    item.quantity += amount;


    if (item.quantity <= 0) {

        cart =
            cart.filter(
                product =>
                    product.id !== productId
            );

    }


    saveCart();

    renderCart();

}


function removeFromCart(productId) {

    cart =
        cart.filter(
            product =>
                product.id !== productId
        );

    saveCart();

    renderCart();

}


function getCartCount() {

    return cart.reduce(
        (sum, item) =>
            sum + item.quantity,
        0
    );

}


function getCartTotal() {

    return cart.reduce(
        (sum, item) =>
            sum +
            item.price *
            item.quantity,
        0
    );

}


function renderCart() {

    const count =
        getCartCount();

    const total =
        getCartTotal();


    cartCount.textContent =
        count;

    mobileCartCount.textContent =
        count;

    cartTotal.textContent =
        formatPrice(total);


    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <div>🛒</div>

                <h3>
                    Savatcha bo‘sh
                </h3>

                <p>
                    Menyudan mahsulot tanlang.
                </p>

            </div>

        `;

        return;

    }


    cartItems.innerHTML =
        cart.map(item => {

            return `

                <div class="cart-item">

                    <div class="cart-item-image">
                        ${item.image}
                    </div>

                    <div>

                        <h4>
                            ${item.name}
                        </h4>

                        <div class="cart-item-price">
                            ${formatPrice(item.price)}
                        </div>

                        <div class="quantity">

                            <button
                                onclick="
                                changeQuantity(
                                    ${item.id},
                                    -1
                                )
                                "
                            >
                                −
                            </button>

                            <strong>
                                ${item.quantity}
                            </strong>

                            <button
                                onclick="
                                changeQuantity(
                                    ${item.id},
                                    1
                                )
                                "
                            >
                                +
                            </button>

                        </div>

                    </div>

                    <button
                        onclick="
                        removeFromCart(
                            ${item.id}
                        )
                        "
                        style="
                        border:0;
                        background:none;
                        color:#999;
                        "
                    >
                        ✕
                    </button>

                </div>

            `;

        }).join("");

}


function openCart() {

    cartDrawer.classList.add("open");

    overlay.classList.add("show");

    document.body.classList.add("no-scroll");

}


function closeCartDrawer() {

    cartDrawer.classList.remove("open");

    overlay.classList.remove("show");

    document.body.classList.remove("no-scroll");

}


function openCheckout() {

    if (cart.length === 0) {

        showToast(
            "Avval mahsulot tanlang"
        );

        return;

    }

    checkoutModal.classList.add("show");

}


function closeCheckoutModal() {

    checkoutModal.classList.remove("show");

}


function saveCart() {

    localStorage.setItem(
        "lavashN1Cart",
        JSON.stringify(cart)
    );

}


function loadCart() {

    const saved =
        localStorage.getItem(
            "lavashN1Cart"
        );

    if (!saved) return;


    try {

        cart =
            JSON.parse(saved);

    } catch {

        cart = [];

    }

}


document
    .querySelectorAll(".category")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".category"
                    )
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                button.classList.add(
                    "active"
                );


                currentCategory =
                    button.dataset.category;


                renderProducts();

            }
        );

    });


searchInput.addEventListener(
    "input",
    renderProducts
);


cartButton.addEventListener(
    "click",
    openCart
);


mobileCartButton.addEventListener(
    "click",
    openCart
);


closeCart.addEventListener(
    "click",
    closeCartDrawer
);


overlay.addEventListener(
    "click",
    closeCartDrawer
);


checkoutButton.addEventListener(
    "click",
    openCheckout
);


closeCheckout.addEventListener(
    "click",
    closeCheckoutModal
);


checkoutModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            checkoutModal
        ) {

            closeCheckoutModal();

        }

    }
);


checkoutForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const formData =
            new FormData(
                checkoutForm
            );


        const order = {

            customer: {

                name:
                    formData.get("name"),

                phone:
                    formData.get("phone"),

                address:
                    formData.get("address")

            },

            payment:
                formData.get("payment"),

            items:
                cart.map(item => ({

                    productId:
                        item.id,

                    name:
                        item.name,

                    quantity:
                        item.quantity,

                    price:
                        item.price

                })),

            total:
                getCartTotal()

        };


        try {

            const response =
                await fetch(
                    "https://lavash-n1.onrender.com/api/orders",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                order
                            )

                    }
                );


            const result =
                await response.json();


            if (result.success) {

                showToast(
                    "Buyurtmangiz qabul qilindi!"
                );

                cart = [];

                saveCart();

                renderCart();

                checkoutForm.reset();

                closeCheckoutModal();

                closeCartDrawer();

            } else {

                showToast(
                    "Buyurtma yuborilmadi"
                );

            }

        } catch (error) {

            console.error(error);

            showToast(
                "Server bilan aloqa yo‘q"
            );

        }

    }
);


loadCart();

renderProducts();

renderCart();

loadProductsFromAPI();
