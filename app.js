const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

let cart = [];
let buttonsDOM = [];

class Storage {
  static saveProducts(products) {
    localStorage.setItem('product', JSON.stringify(products));
  }

  static getProduct(id) {
    const products = JSON.parse(localStorage.getItem('product'));
    return products.find(product => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : [];
  }
}
class Products {
  async getProducts() {
    try {
      const result = await fetch('products.json');
      const data = await result.json();
      let products = data.items;
      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (err) {
      console.log(err);
    }
  }
}

class UI {
  displayProducts(products) {
    let result = '';
    products.forEach(product => {
      result += `
			<article class="product">
      <div class="img-container">
      <img src=${product.image} class="product-img" />
      <button class="bag-btn" data-id=${product.id}>
      <i class="fas fa-shopping-cart"></i>
      add to bag
      </button>
      </div>
      <h3>${product.title}</h3>
      <h4>$ ${product.price}</h4>
      </article>
			`;
    });
    productsDOM.innerHTML = result;
  }

  getBagButtons() {
    const buttons = [...document.querySelectorAll('.bag-btn')];
    buttonsDOM = buttons;
    buttons.forEach(button => {
      const { id } = button.dataset;
      const inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = 'In Cart';
        button.disabled = true;
      }
      button.addEventListener('click', e => {
        e.target.innerText = 'In Cart';
        e.target.disabled = true;
        const cartItem = { ...Storage.getProduct(id), amount: 1 };

        cart = [...cart, cartItem];
        Storage.saveCart(cart);

        this.setCartValues(cart);

        this.addCartItem(cartItem);

        this.showCart();
      });
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
    <img src="${item.image}"/>
      <div>
      <h4>${item.title}</h4>
      <h5>$${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div class="">
      <i class="fas fa-chevron-up" data-id=${item.id}></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>
    
    `;
    cartContent.appendChild(div);
  }

  showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('showCart');
  }

  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }

  hideCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
  }

  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  }

  cartLogic() {
    clearCartBtn.addEventListener('click', () => this.clearCart());
    cartContent.addEventListener('click', e => {
      if (e.target.classList.contains('remove-item')) {
        const removeItem = e.target;
        const { id } = removeItem.dataset;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (e.target.classList.contains('fa-chevron-up')) {
        const addAmount = e.target;
        const { id } = addAmount.dataset;
        const tempItem = cart.find(item => item.id);
        tempItem.amount += 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (e.target.classList.contains('fa-chevron-down')) {
        const loweAmount = e.target;
        const {id} = loweAmount.dataset;
        const tempItem = cart.find(item => item.id);
        tempItem.amount -= 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          loweAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(loweAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }

  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }

  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    const button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }

  clearCart() {
    const cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.firstElementChild);
    }
    this.hideCart();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const products = new Products();
  const ui = new UI();
  ui.setupApp();
  products
    .getProducts()
    .then(items => {
      ui.displayProducts(items);
      Storage.saveProducts(items);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
