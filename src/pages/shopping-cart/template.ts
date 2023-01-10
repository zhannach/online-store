const cartTemplate = `
  <li class="cart-item">
    <section class="cart-item__details">
      <div class="cart-item__id"></div>
      <div class="cart-item__image"></div>
      <div class="cart-item__description">
        <h3 class="cart-item__title"></h3>
        <div class="cart-item__detail">
          <h3 class="brand__title">
            Brand:
            <span class="brand__name"></span>
          </h3>
        </div>
        <div class="cart-item__detail">
          <h3 class="cart-category__title">Category:</h3>
          <span class="cart-category__name"></span>
        </div>
        <div class="cart-item__detail">
          <h3 class="amount__title">
            Stock:
            <span class="amount__name"></span>
          </h3>
        </div>
      </div>
    </section>
    <div class="cart-item__price"></div>
    <div class="cart-item__quantity">
      <button class="cart-item__btn btn-minus">-</button>
      <span class="cart-item__amount">1</span>
      <button class="cart-item__btn btn-plus">+</button>
    </div>
    <div class="cart-item__total"></div>
  </li>`;
export default cartTemplate;
