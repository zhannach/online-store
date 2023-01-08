const purchaseTemplate = `
<div class="modal">
  <div class="modal-content">
    <div class="purchase-cart">
      <form class="purchase-form">
        <!-- Person Details -->
        <div class="person-details">
          <div class="person-header">
            <h4 class="title">Address details</h4>
          </div>
          <!-- Person Name -->
          <div class="person-name">
            <input type="text" class="name-input form-input" placeholder="Name" maxlength="30" />
          </div>
          <!-- Person Phone -->
          <div class="person-phone">
            <input type="text" class="phone-input form-input" placeholder="Phone number" maxlength="20" />
          </div>
          <!-- Person Address -->
          <div class="person-address">
            <input type="text" class="address-input form-input" placeholder="Delivery address" />
          </div>
          <!-- Person Email -->
          <div class="person-email">
            <input type="email" class="email-input form-input" placeholder="E-mail" />
          </div>
        </div>
        <!-- Card Details -->
        <div class="credit-card">
          <div class="card-header">
            <h4 class="title">Card details</h4>
          </div>
          <div class="card-body">
            <!-- Card Number -->
            <div class="input__container">
              <label for="card-number"> Card number : </label>
              <div class="person-number">
                <div class="card-ico__container">
                  <input
                    type="tel"
                    id="card-number"
                    class="card-input form-input"
                    placeholder="XXXX XXXX XXXX XXXX"
                    pattern="[0-9]*"
                    autocomplete="cc-number"
                    maxlength="16"
                  />
                  <span for="card-number" class="card-icon"></span>
                </div>
              </div>
            </div>
            <!-- Card Verification Field -->
            <div class="card-verification">
              <div class="input__container">
                <label for="card-exp"> Exp date : </label>
                <div class="person-exp">
                  <input
                    type="tel"
                    id="card-exp"
                    type="text"
                    placeholder="MM/YY"
                    class="exp-input form-input"
                    autocapitalize="cc-exp"
                    pattern="[0-9]*"
                    maxlength="5"
                  />
                </div>
              </div>
              <div class="input__container">
                <label for="card-cvv"> CVV : </label>
                <div class="person-cvv">
                  <input
                    type="tel"
                    id="card-cvv"
                    class="form-input cvv-input"
                    placeholder="XXX"
                    pattern="[0-9]*"
                    autocomplete="cc-number"
                    maxlength="3"
                  />
                </div>
              </div>
            </div>
            <!-- Button -->
            <button type="button" class="proceed-btn">Proceed</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>`;

export default purchaseTemplate;
