const API_URL = "http://localhost:5000/api/products";

// ================= PRODUCTS =================

const productsContainer = document.getElementById("productsContainer");

function displayProducts(products) {
  if (!productsContainer) return;

  productsContainer.innerHTML = "";

  if (products.length === 0) {
    productsContainer.innerHTML = `<p class="text-center text-danger">No products found.</p>`;
    return;
  }

  products.forEach((product) => {
    productsContainer.innerHTML += `
      <div class="col-md-4">
        <div class="card h-100 shadow-sm">
          <img src="${product.image}" class="card-img-top product-img" alt="${product.name}">
          <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">${product.description}</p>
            <p class="fw-bold">Rs. ${product.price}</p>
            <a href="product-details.html?id=${product._id}" class="btn btn-primary">View Details</a>
          </div>
        </div>
      </div>
    `;
  });
}

async function loadProducts() {
  try {
    const response = await fetch(API_URL);
    const products = await response.json();

    displayProducts(products);
  } catch (error) {
    productsContainer.innerHTML = `<p class="text-danger">Failed to load products.</p>`;
  }
}

if (productsContainer) {
  loadProducts();
}

// ================= SEARCH PRODUCTS =================

const searchInput = document.getElementById("searchInput");

if (searchInput) {
  searchInput.addEventListener("keyup", async () => {
    const searchText = searchInput.value.toLowerCase();

    const response = await fetch(API_URL);
    const products = await response.json();

    const filteredProducts = products.filter((product) =>
      product.name.toLowerCase().includes(searchText)
    );

    displayProducts(filteredProducts);
  });
}

// ================= PRODUCT DETAILS =================

const productDetails = document.getElementById("productDetails");

async function loadProductDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  try {
    const response = await fetch(`${API_URL}/${productId}`);
    const product = await response.json();

    productDetails.innerHTML = `
      <div class="col-md-6">
        <img src="${product.image}" class="img-fluid rounded shadow" alt="${product.name}">
      </div>

      <div class="col-md-6">
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <h4>Rs. ${product.price}</h4>
        <p><strong>Category:</strong> ${product.category}</p>
        <p><strong>Stock:</strong> ${product.stock}</p>

        <button class="btn btn-success" onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.image}')">
          Add to Cart
        </button>
      </div>
    `;
  } catch (error) {
    productDetails.innerHTML = `<p class="text-danger">Failed to load product details.</p>`;
  }
}

if (productDetails) {
  loadProductDetails();
}

// ================= CART =================

function addToCart(id, name, price, image) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingProduct = cart.find((item) => item.id === id);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({
      id,
      name,
      price,
      image,
      quantity: 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Product added to cart!");
}

const cartContainer = document.getElementById("cartContainer");
const cartTotal = document.getElementById("cartTotal");

function loadCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    cartContainer.innerHTML = `<p class="text-center">Your cart is empty.</p>`;
    cartTotal.innerHTML = "";
    return;
  }

  let total = 0;

  cartContainer.innerHTML = cart
    .map((item, index) => {
      total += item.price * item.quantity;

      return `
        <div class="card mb-3 shadow-sm">
          <div class="row g-0 align-items-center">
            <div class="col-md-2">
              <img src="${item.image}" class="img-fluid rounded-start">
            </div>

            <div class="col-md-6">
              <div class="card-body">
                <h5>${item.name}</h5>
                <p>Price: Rs. ${item.price}</p>
                <p>Quantity: ${item.quantity}</p>
              </div>
            </div>

            <div class="col-md-4 text-end pe-4">
              <button class="btn btn-danger" onclick="removeFromCart(${index})">Remove</button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  cartTotal.innerHTML = `Total: Rs. ${total}`;
}

function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart.splice(index, 1);

  localStorage.setItem("cart", JSON.stringify(cart));

  loadCart();
}

if (cartContainer) {
  loadCart();
}

// ================= CHECKOUT =================

const checkoutItems = document.getElementById("checkoutItems");
const checkoutTotal = document.getElementById("checkoutTotal");
const checkoutForm = document.getElementById("checkoutForm");

function loadCheckout() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let total = 0;

  if (cart.length === 0) {
    checkoutItems.innerHTML = "<p>Your cart is empty.</p>";
    checkoutTotal.innerHTML = "";
    return;
  }

  checkoutItems.innerHTML = cart
    .map((item) => {
      total += item.price * item.quantity;

      return `
        <p>
          <strong>${item.name}</strong><br>
          Quantity: ${item.quantity} | Rs. ${item.price}
        </p>
      `;
    })
    .join("");

  checkoutTotal.innerHTML = `Total: Rs. ${total}`;
}

if (checkoutItems) {
  loadCheckout();
}

if (checkoutForm) {
  checkoutForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const customerName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    let totalAmount = 0;

    cart.forEach((item) => {
      totalAmount += item.price * item.quantity;
    });

    const orderData = {
      customerName,
      email,
      phone,
      address,
      items: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      totalAmount,
    };

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Order placed successfully!");

        localStorage.removeItem("cart");

        window.location.href = "products.html";
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to place order.");
    }
  });
}

// ================= REGISTER =================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration Successful!");
        window.location.href = "login.html";
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Server Error!");
    }
  });
}

// ================= LOGIN =================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert(`Welcome ${data.user.firstName}!`);
        window.location.href = "products.html";
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Server Error!");
    }
  });
}

// ================= AUTH STATUS =================

function updateNavbar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navLinks = document.querySelector(".navbar-nav");

  if (navLinks && user) {
    navLinks.innerHTML = `
      <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
      <li class="nav-item"><a class="nav-link" href="products.html">Products</a></li>
      <li class="nav-item"><a class="nav-link" href="cart.html">Cart</a></li>
      <li class="nav-item"><span class="nav-link">Hi, ${user.firstName}</span></li>
      <li class="nav-item"><button class="btn btn-danger btn-sm ms-2" onclick="logout()">Logout</button></li>
    `;
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  alert("Logged out successfully!");
  window.location.href = "login.html";
}

updateNavbar();