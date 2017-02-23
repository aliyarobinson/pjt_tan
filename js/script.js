"use strict"; 

var AYR = AYR || {};

(function(){


  // Cache DOM elements for future use
  var mainContent = document.querySelector('main');
  var loader = document.querySelector('.loader-wrapper');
  var menuBtn = document.querySelector('.menu-btn');
  var siteNav = document.querySelector('.site-nav');
  var siteHeader = document.querySelector('.site-header');
  var last_known_scroll_position = 0;
  var ticking = false;

  // If ontouchstart exists then set click handler to touchstart otherwise set clickhandler to click
  var clickHandler = ('ontouchstart' in document.documentElement ? "touchstart" : "click");

  /**************************************/
  /*   Application Object
  /***************************************************/
  AYR = {
    currPageName:"",
    contentElement: {},

    init: function () {
      console.log('init');

      /**************************************/
      /*   Mobile Navigation Trigger
      /***************************************************/
      menuBtn.addEventListener(clickHandler, function(e) { 
        this.classList.toggle('active');
        siteNav.classList.toggle('active');
        siteHeader.classList.toggle('mobile-active');
      });


      /**************************************/
      /*   Window Scroll
      /***************************************************/
      // Reference: https://developer.mozilla.org/en-US/docs/Web/Events/scroll
      // Reference: http://www.html5rocks.com/en/tutorials/speed/animations/

      function doSomething(scroll_pos) {
        if(ayrApi.isMobile() === false) {
          if(last_known_scroll_position >= 100 ){
            siteHeader.classList.add('small');
          }else{
            siteHeader.classList.remove('small');
          }
        }
      }

      window.addEventListener('scroll', function(e) {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        last_known_scroll_position = scrollTop;
        if (!ticking) {
          window.requestAnimationFrame(function() {
            doSomething(last_known_scroll_position);
            ticking = false;
          });
        }
        ticking = true;
      });


      /**************************************/
      /*   Window Load
      /***************************************************/
      window.onload = function (e,afterPages) {
        ayrApi.toTop();

      }


      /**************************************/
      /*   Window Resize
      /***************************************************/
      // Reference: https://developer.mozilla.org/en-US/docs/Web/Events/resize
      var optimizedResize = (function() {
          var callbacks = [],
              running = false;
          
          // fired on resize event
          function resize() {
              if (!running) {
                  running = true;
                  if (window.requestAnimationFrame) {
                      window.requestAnimationFrame(runCallbacks);
                  } else {
                      setTimeout(runCallbacks, 66);
                  }
              }
          }

          // run the actual callbacks
          function runCallbacks() {
              callbacks.forEach(function(callback) {
                  callback();
              });
              running = false;
          }

          // adds callback to loop
          function addCallback(callback) {
              if (callback) {
                  callbacks.push(callback);
              }
          }

          return {
              // public method to add additional callback
              add: function(callback) {
                  if (!callbacks.length) {
                      window.addEventListener('resize', resize);
                  }
                  addCallback(callback);
              }
          }
      }());

      // start process
      optimizedResize.add(function() {
        if(ayrApi.isMobile()){
          siteHeader.classList.remove('small');
        } else {
          if(last_known_scroll_position >= 100 ){
            siteHeader.classList.add('small');
          }else{
            siteHeader.classList.remove('small');
          }
        }

        // Resize Content Display Wrapper based on new height of content on resize
        contentDisplayWrapper.style.height = document.querySelector('.content-pages > .' + AYR.currPageName + '-page').offsetHeight + 'px';
      });

    }, // End Init

    pageLocation: {
      observers: [],
      registerObserver: function(observer){
        this.observers.push(observer);
      },
      notifyObservers: function(page){
        var thisPage = page;
        for(var i = 0; i < this.observers.length; i++) {
          this.observers[i].notify(thisPage);
        }
      }
    },

    pageState: {
      notify: function(page) {
        if (ayrApi.isHome(page)){
          page = "index";
        } 
        AYR.transitionContent(page);
      }
    },

    collapseMobileNav: function() {
      // Collapse Mobile Nav When navigation link is clicked in mobile view
      if(ayrApi.hasClass(siteNav, 'active')){
        siteNav.classList.remove('active');
        menuBtn.classList.remove('active');
      }
      if(ayrApi.hasClass(siteHeader, 'mobile-active')){
        siteHeader.classList.remove('mobile-active');
      }
    }
  };

})(); // End Self Evoking Function

AYR.init();