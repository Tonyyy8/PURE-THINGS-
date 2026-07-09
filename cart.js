(function(){
  const CART_KEY = "pureThingsCart";
  const money = (n) => "€" + Number(n || 0).toFixed(0);
  function rootPrefix(){
    return location.pathname.includes("/products/") ? "../" : "";
  }
  function checkoutHref(){ return rootPrefix() + "checkout.html"; }
  function catalogueHref(){
    return rootPrefix() + "products.html";
  }
  function getCart(){
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch(e){ return []; }
  }
  function saveCart(cart){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
  }
  function addItem(item){
    const cart = getCart();
    const found = cart.find(x => x.id === item.id);
    if(found){ found.qty += 1; } else { cart.push({...item, qty:1}); }
    saveCart(cart);
    openCart();
  }
  function changeQty(id, delta){
    saveCart(getCart().map(item => item.id === id ? {...item, qty:item.qty + delta} : item).filter(item => item.qty > 0));
  }
  function removeItem(id){ saveCart(getCart().filter(item => item.id !== id)); }
  function subtotal(cart){ return cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0); }
  function ensureCartDrawer(){
    if(document.querySelector(".cart-drawer")) return;
    const drawer = document.createElement("div");
    drawer.className = "cart-drawer";
    drawer.innerHTML = `
      <div class="cart-backdrop" data-close-cart></div>
      <aside class="cart-panel" aria-label="Shopping cart">
        <div class="cart-head">
          <h2>Your cart</h2>
          <button type="button" class="cart-close" data-close-cart>×</button>
        </div>
        <div class="cart-items"></div>
        <div class="cart-footer">
          <div class="cart-subtotal"><span>Subtotal</span><strong>€0</strong></div>
          <a class="checkout-button blue-button" href="${checkoutHref()}">Go to checkout</a>
          <button type="button" class="cart-continue" data-close-cart>Keep shopping</button>
        </div>
      </aside>`;
    document.body.appendChild(drawer);
  }
  function openCart(){ ensureCartDrawer(); document.body.classList.add("cart-open"); }
  function closeCart(){ document.body.classList.remove("cart-open"); }
  function renderCart(){
    ensureCartDrawer();
    const cart = getCart();
    const count = cart.reduce((s,i)=>s+i.qty,0);
    document.querySelectorAll(".cart-toggle").forEach(btn => btn.textContent = `Cart · ${count}`);
    const itemsBox = document.querySelector(".cart-items");
    if(itemsBox){
      if(!cart.length){
        itemsBox.innerHTML = `<p class="empty-cart">Your cart is still very clean. Add a little Pure Things.</p>`;
      } else {
        itemsBox.innerHTML = cart.map(item => `
          <div class="cart-line">
            <div><strong>${item.name}</strong><small>${money(item.price)} each</small></div>
            <div class="qty-controls">
              <button type="button" data-qty="${item.id}" data-delta="-1">−</button>
              <span>${item.qty}</span>
              <button type="button" data-qty="${item.id}" data-delta="1">+</button>
            </div>
            <button class="remove-item" type="button" data-remove="${item.id}">Remove</button>
          </div>`).join("");
      }
      const sub = document.querySelector(".cart-subtotal strong");
      if(sub) sub.textContent = money(subtotal(cart));
      const checkoutButton = document.querySelector(".checkout-button");
      if(checkoutButton) checkoutButton.href = checkoutHref();
    }
    const checkoutItems = document.querySelector("#checkout-items");
    if(checkoutItems){
      if(!cart.length){
        checkoutItems.innerHTML = `<p class="empty-cart">Your cart is empty. <a href="${catalogueHref()}">Go to catalogue</a>.</p>`;
      } else {
        checkoutItems.innerHTML = cart.map(item => `
          <div class="checkout-line">
            <span>${item.name} × ${item.qty}</span>
            <strong>${money(item.price * item.qty)}</strong>
          </div>`).join("");
      }
      const sub = subtotal(cart);
      const st = document.querySelector("#checkout-subtotal");
      const total = document.querySelector("#checkout-total");
      if(st) st.textContent = money(sub);
      if(total) total.textContent = money(sub);
    }
  }
  document.addEventListener("click", function(e){
    const add = e.target.closest(".add-to-cart-btn");
    if(add){
      e.preventDefault();
      e.stopPropagation();
      addItem({
        id: add.dataset.productId || add.dataset.productName,
        name: add.dataset.productName || "Pure Things product",
        price: Number(add.dataset.productPrice || 0),
        url: add.dataset.productUrl || "#"
      });
      return;
    }
    if(e.target.closest(".cart-toggle")){ e.preventDefault(); openCart(); return; }
    if(e.target.matches("[data-close-cart]")){ closeCart(); return; }
    const qty = e.target.closest("[data-qty]");
    if(qty){ changeQty(qty.dataset.qty, Number(qty.dataset.delta)); return; }
    const rem = e.target.closest("[data-remove]");
    if(rem){ removeItem(rem.dataset.remove); return; }
  });
  document.addEventListener("submit", function(e){
    if(e.target && e.target.id === "checkout-form"){
      e.preventDefault();
      const cart = getCart();
      if(!cart.length){ alert("Your cart is empty."); return; }
      alert("Order received. This is a demo checkout; connect payments next.");
      localStorage.removeItem(CART_KEY);
      renderCart();
      window.location.href = rootPrefix() + "index.html";
    }
  });
  ensureCartDrawer();
  renderCart();
})();