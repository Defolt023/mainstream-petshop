let favorites = [];
let currentCategory = ""; // ← Здесь будем хранить текущую категорию

// Загрузка товаров
async function loadProducts(category = "") {
  const productsContainer = document.getElementById("products-container");
  if (!productsContainer) return;

  try {
    // Очищаем контейнер перед загрузкой новых данных
    productsContainer.innerHTML = "";

    // Сохраняем текущую категорию
    currentCategory = category;

    // Получаем все товары с сервера
    const response = await fetch("http://localhost:3000/api/products");

    if (!response.ok) throw new Error("Ошибка загрузки товаров");

    let allProducts = await response.json();

    // Фильтруем по категории
    const filtered = category ? allProducts.filter(p => p.category === category) : allProducts;

    // Получаем избранное пользователя
    if (window.appData?.token) {
      const favRes = await fetch("http://localhost:3000/api/auth/favorites", {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + window.appData.token,
          "Content-Type": "application/json"
        }
      });

      if (favRes.ok) {
        favorites = await favRes.json();
      } else {
        console.warn("Не удалось загрузить избранное — токен истёк или нет доступа");
        favorites = [];
      }
    }

    renderProducts(filtered);

  } catch (error) {
    console.error("Ошибка загрузки товаров:", error.message);
    productsContainer.innerHTML = "<p>Не удалось загрузить товары</p>";
  }
}

function renderProducts(products) {
  const productsContainer = document.getElementById("products-container");
  if (!productsContainer) return;

  productsContainer.innerHTML = "";

  if (products.length === 0) {
    productsContainer.innerHTML = "<p>Товаров нет</p>";
    return;
  }

  products.forEach((product) => {
    const isFavorite = favorites.some(favId => {
      return typeof favId === 'string' ? favId === product._id : favId?._id === product._id;
    });

    const inStock = product.stock > 0;
    const card = document.createElement("div");
    card.className = "product-card";

    // Формируем URL к изображению правильно
    let imageUrl = product.image || "/uploads/placeholder.png";
    if (!imageUrl.startsWith("http")) {
      imageUrl = `http://localhost:3000${product.image}`;
    }

    card.innerHTML = `
      <img src="${imageUrl}" alt="${product.name}" loading="lazy" />
      <h3>${product.name}</h3>
      <p class="price">Цена: ${product.price} ₽</p>
      <p>В наличии: ${product.stock || 0} шт.</p>
      <button class="add-to-cart" ${inStock ? "" : "disabled"}>${inStock ? "Добавить в корзину" : "Нет в наличии"}</button>
      <button class="favorite-btn" data-id="${product._id}">${isFavorite ? "⭐ В избранном" : "☆ В избранное"}</button>
    `;

    // Добавление в корзину
    card.querySelector(".add-to-cart").addEventListener("click", async () => {
      if (!window.appData?.token) {
        alert("Сначала войдите в аккаунт");
        return;
      }

      if (product.stock <= 0) {
        alert("Товар закончился");
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/api/cart/add/${product._id}`, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + window.appData.token
          }
        });

        const data = await res.json();

        if (res.ok) {
          showSuccessToast("Добавлено в корзину");
          loadProducts(); // перезагружаем товары текущей категории
        } else {
          showErrorToast(data.message || "Ошибка добавления");
        }

      } catch (err) {
        console.error("Ошибка сети:", err.message);
        alert("Ошибка сети");
      }
    });

    // Добавление/удаление из избранного
    card.querySelector(".favorite-btn").addEventListener("click", async (e) => {
      if (!window.appData?.token) return alert("Сначала войдите в аккаунт");

      const productId = e.target.dataset.id;

      const res = await fetch(`http://localhost:3000/api/auth/favorites/${productId}`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + window.appData.token
        }
      });

      const data = await res.json();
      showSuccessToast(data.message || "Изменения сохранены");

      // ✅ Обновляем список, оставаясь в той же категории
      loadProducts(currentCategory);
    });

    productsContainer.appendChild(card);
  });
}