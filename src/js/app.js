import { settings, select, classNames } from './settings.js';
import Product from './componets/Product.js';
import Cart from './componets/Cart.js';
import Booking from './componets/Booking.js';
import Home from './componets/Home.js';

const app = {
  initHome: function(){
    const thisApp = this;

    const homePage = document.querySelector(select.containerOf.home);
    thisApp.home = new Home(homePage);
  },

  initBooking: function(){
    const thisApp = this;

    const widgetReservation = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(widgetReservation);
  },

  initPages: function(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');
    

    let pageMatchingHash = thisApp.pages[0].id;

    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }


    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href atribute */
        const id = clickedElement.getAttribute('href').replace('#', '');
        
        /* run thisApp.activePage with that id */

        thisApp.activatePage(id);
        
        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function(pageId){
    const thisApp = this;

    //add class active to matching pages, remove from non-matching
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    //console.log(thisApp.navLinks);
    //add class active to matching links, remove from non-matching
    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }

  },

  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event){
      thisApp.cart.add(event.detail.product);
    });
  },
  initMenu: function(){
    const thisApp = this;
    // console.log('thisApp.data:', thisApp.data);

    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }

  },
  initData: function(){
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /* execute initMenu method */
        thisApp.initMenu();
        console.log('parsedResponse', parsedResponse);
      });
      
    console.log(url);
  },
  init: function(){
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initHome();
  },
};
app.init();

new Flickity( '.carusel-wrapper', {
});

