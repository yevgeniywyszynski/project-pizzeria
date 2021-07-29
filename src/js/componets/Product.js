import AmountWidget from './AmountWidget.js';
import {select, templates, classNames} from '../settings.js';
import {utils} from '../utils.js';
class Product {
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.dom = {};

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    // consolelog('new Product:', thisProduct);
  }
  renderInMenu(){
    const thisProduct = this;
      
    /* generate HTML based on tamlete */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    /* create element using utils.createElemntFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    // consolelog(thisProduct.element);
    /*find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;
    
    thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;
      
    /* START: add event listener to clickable trigger on event click */
    thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {
      /* prevent default action for event */
      event.preventDefault();
      /* find active product (product that has active class) */
      const productActive = document.querySelector(select.all.menuProductsActive);
      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if(productActive && thisProduct.element !== productActive){
        productActive.classList.remove(classNames.menuProduct.wrapperActive);
      }
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
    });

  }
  initOrderForm(){
    const thisProduct = this;
    //console.log('initOrderForm');

    thisProduct.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
      
    for(let input of thisProduct.dom.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
      
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  initAmountWidget(){
    const thisProduct = this;
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      if(thisProduct.amountWidget){
        thisProduct.processOrder();
      }
    });
    
    thisProduct.amountWidget = new AmountWidget (thisProduct.amountWidgetElem);
  }

  processOrder() {
    const thisProduct = this;
    
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    // console.log('formData', formData);
    
    // set price to default price
    let price = thisProduct.data.price;
    // console.log(price);
    
    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      // console.log(paramId, param);
    
      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        // console.log(optionId, option);

        const isSelected = formData[paramId].includes(optionId);

        if(isSelected){
          if(!option.default){
            price = price + option.price;
          }
        } else if (option.default){
          price = price - option.price;
        }
        /* pobrac informacje o obrazku ktory nas interesuje */
        const optionImg = this.imageWrapper.querySelector('.' + paramId + '-' + optionId);
        console.log(optionImg);

        if(optionImg){
          if(isSelected){
            optionImg.classList.add(classNames.menuProduct.imageVisible);
          } else {
            optionImg.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }

    thisProduct.priceSingle = price;

    /* multiply price by amount */
    price *= thisProduct.amountWidget.value;

    // update calculated price in the HTML
    thisProduct.priceElem.innerHTML = price;
  }

  addToCart(){
    const thisProduct = this;
    // consolelog(thisProduct);
    //app.cart.add(thisProduct.prepareCartProduct());

    const add_to_cart_evt = new CustomEvent('add-to-cart',{
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      }
    });
    thisProduct.element.dispatchEvent(add_to_cart_evt);
  }

  prepareCartProduct(){
    const thisProduct = this;

    const productSummary = {};

    productSummary.id = thisProduct.id;
    productSummary.name = thisProduct.data.name;
    productSummary.amount = thisProduct.amountWidget.value;
    productSummary.priceSingle = thisProduct.priceSingle;
    productSummary.price = productSummary.priceSingle * productSummary.amount;
    productSummary.params = thisProduct.prepareCartProductParams();
    return productSummary;
  }

  prepareCartProductParams(){
    const thisProduct = this;
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    // console.log('formData', formData);
    const paramsToReturn = {};
    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      // console.log(paramId, param);
      paramsToReturn[paramId] = {
        label: param.label,
        options: {}
      };
      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        // console.log(optionId, option);
      
        const isSelected = formData[paramId].includes(optionId);
      
        if(isSelected){
          paramsToReturn[paramId].options[optionId] = option.label;
        }     
      }
    }
    return paramsToReturn;
  }
}

export default Product;
