// checkout.js
const cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartSummary = document.getElementById("cartSummary");

function displayCartSummary() {
  if (!cartSummary) return;

  cartSummary.innerHTML = ""; // очищаем перед отображением

  if (cart.length === 0) {
    cartSummary.innerHTML = "<p>Ваша корзина пуста.</p>";
    return;
  }

  let totalCost = 0;
  const cartList = document.createElement("ul");

  cart.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${item.name} - ${item.price} ₽`;
    cartList.appendChild(listItem);
    totalCost += item.price;
  });

  const totalElement = document.createElement("p");
  totalElement.innerHTML = `<strong>Итого:</strong> ${totalCost} ₽`;

  cartSummary.appendChild(cartList);
  cartSummary.appendChild(totalElement);
}

document.addEventListener("DOMContentLoaded", () => {
  displayCartSummary();
});

document.getElementById("order-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const pickupPoint = document.getElementById("pickup-point").value;

  if (!name || !email || !pickupPoint) {
    alert("Все поля обязательны");
    return;
  }

  if (cart.length === 0) {
    alert("Корзина пуста.");
    return;
  }

  const orderNumber = `#${Math.floor(Math.random() * 1000000)}`;
  const order = {
    orderNumber,
    name,
    email,
    pickupPoint,
    items: cart,
    totalCost: cart.reduce((total, item) => total + item.price, 0),
  };

  try {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:3000/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(order)
    });

    const data = await response.json();

    if (response.ok) {
      alert(`Спасибо за заказ! Ваш номер: ${data.orderNumber}`);
      localStorage.removeItem("cart");
      window.location.href = "index.html";
    } else {
      alert(data.message || "Ошибка при оформлении заказа");
    }
  } catch (error) {
    console.error("Ошибка отправки заказа:", error);
    alert("Ошибка сети. Попробуйте позже");
  }
});