import CartProduct from './CartProduct.js';
import { settings, select, templates, classNames } from '../settings.js';
import { utils } from '../utils.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();

    // consolelog('new Cart', thisCart);
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);

    thisCart.dom.subTotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);

    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);

    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);

    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);

    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);

    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    // consolelog(thisCart.dom.productList);

  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      products: [],
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.dom.subTotalPrice.innerHTML,
      totalNumber: thisCart.dom.totalNumber.innerHTML,
      deliveryFee: thisCart.dom.deliveryFee.innerHTML,       
    };
    for(let prod of thisCart.products){
      payload.products.push(prod.getData());
    }
    console.log(payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
        
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
  }

  add(menuProduct){
    const thisCart = this;

    //console.log('adding product', menuProduct);

    /* wygeneruj kod html na podstawie tamplates */
    const generatedHTML = templates.cartProduct(menuProduct);
    /* zmien kod HTML na element dom uzyj funkcji utils */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    /*dodaj element DOM do listy porduktow */
    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    // consolelog('thisCart.products', thisCart.products);

    thisCart.update();
  }

  update(){
    const thisCart = this;

    const deliveryFee = settings.cart.defaultDeliveryFee;

    let totalNumber = 0;
    let subTotalPrice = 0;

    for(let product of thisCart.products){
      totalNumber = totalNumber + product.amount;
      subTotalPrice = subTotalPrice + product.price;
    }
    if(!totalNumber == 0){
      thisCart.totalPrice = subTotalPrice + deliveryFee;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
        
      for(let totalP of thisCart.dom.totalPrice){
        totalP.innerHTML = thisCart.totalPrice;
      }
    } else{
      thisCart.dom.deliveryFee.innerHTML = 0;
      thisCart.totalPrice = 0;
      for(let totalP of thisCart.dom.totalPrice){
        totalP.innerHTML = 0;
      }
    }

    thisCart.dom.totalNumber.innerHTML = totalNumber;
    thisCart.dom.subTotalPrice.innerHTML = subTotalPrice;


    console.log(thisCart);
    console.log(deliveryFee);
    console.log(totalNumber);
    console.log(thisCart.totalPrice);
  }

  remove(removeProduct){
    const thisCart = this;
    /* usuniecie reprezentacji produktu z HTML-a */
    removeProduct.dom.wrapper.remove();
    /* usuniecie o danym produkcie z tablicy thisCart.products */
    const idx = thisCart.products.indexOf(removeProduct);
    /* usuniecie z listy produktow produktu */
    thisCart.products.splice(idx, 1);
    console.log(thisCart.products);
    thisCart.update();
  }
}

export default Cart;