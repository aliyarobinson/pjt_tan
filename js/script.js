"use strict"; 

var AYR = AYR || {};

(function($){


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
    grid : $('.grid'),

    init: function () {
      console.log('init');

      /**************************************/
      /*   Mobile Navigation Trigger
      /***************************************************/

      $('.menu-btn').on('click', function() {
        $(this).toggleClass('active');
        $('.site-nav').toggleClass('active');
        $('.site-header').toggleClass('mobile-active');
      })



      /**************************************/
      /*   To Top Code
      /***************************************************/
  
      $(window).scroll(function() {

        AYR.addTopLink();
        
          // var yPos = -($(window).scrollTop()); 

          // if(yPos <= -240){
          //   $('.top').removeClass('hidden');
          // }else{
          //   $('.top').addClass('hidden');
          // }
      });

      $('.top').on('click', function(e){
        e.preventDefault();
        AYR.scrollTo( e, 'html,body');
      });

      $('.soft-scroll').on('click', function(e){
        e.preventDefault();
        let scrollElem = $(this).attr('href');
        AYR.scrollTo( e, scrollElem);
      });

      $(document).on( 'click', '.filter-btn', function( event ) {
        console.log('************** filter button click fired *****************');
        event.preventDefault();
        var $this = $(this);
        // var filterGroup = $this.data('filter-group');
        var filterName = $this.data('filter');

        AYR.filterGrid(filterName);
        AYR.scrollTo( event, '.sub-nav');

        // if(filterGroup){
        //   var newURL = CBCL.baseURL + '#/' + filterGroup + '/' + filterName;
        // } else {
        //   var newURL = CBCL.baseURL + '#';
        // }

        // location.href = newURL;
      });

      /**************************************/
      /*   Share button Click Script
      /***************************************************/
      $(document).on( 'click', '.share-mod a', function(e) {
        /*************Open Shares in New Window Code**********/
        e.preventDefault();
        var url = $(this).attr('href');
        AYR.popupCenter(url,'shareWindow','600', '600');
      });

      /*************Support Us Share Click Code**********/
      $(document).on( 'click', '.support-links .share', function(e) {
        $(this).addClass('active');
      });


      /**************************************/
      /*   Scrollbar Activation
      /***************************************************/
      $(".site-nav.active").mCustomScrollbar();


      /**************************************/
      /*   Window Load
      /***************************************************/
      window.onload = function (e,afterPages) {

        AYR.addTopLink();

        // var yPos = -($(window).scrollTop()); 

        // if(yPos <= -240){
        //   $('.top').removeClass('hidden');
        // }else{
        //   $('.top').addClass('hidden');
        // }

        // ayrApi.toTop();
      }


      /**************************************/
      /*   Window Resize
      /***************************************************/

      $(window).on('resize', function(argument) {
        console.log('resize: ', $(window).width());

        if(AYR.isMobile()){
          console.log('mobile');
        } else{
          console.log('not mobile');
          $('.site-header').removeClass('mobile-active');
          $('.menu-btn').removeClass('active');
          $('.site-nav').removeClass('active');
        }
      });

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
      // optimizedResize.add(function() {
      //   if(ayrApi.isMobile()){
      //     siteHeader.classList.remove('small');
      //   } else {
      //     if(last_known_scroll_position >= 100 ){
      //       siteHeader.classList.add('small');
      //     }else{
      //       siteHeader.classList.remove('small');
      //     }
      //   }

      //   // Resize Content Display Wrapper based on new height of content on resize
      //   contentDisplayWrapper.style.height = document.querySelector('.content-pages > .' + AYR.currPageName + '-page').offsetHeight + 'px';
      // });

    }, // End Init

    /********************************************************************/
    /*                                                                  */
    /*          Opens Share buttons in centered new window              */
    /*                                                                  */
    /********************************************************************/

    popupCenter: function(url, title, w, h) {
      // http://stackoverflow.com/questions/4068373/center-a-popup-window-on-screen
      var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
      var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

      var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
      var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

      var left = ((width / 2) - (w / 2)) + dualScreenLeft;
      var top = ((height / 2) - (h / 2)) + dualScreenTop;
      var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

      // Puts focus on the newWindow
      if (window.focus) {
          newWindow.focus();
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
    },

    filterGrid: function(filterStr) {
      console.log('************** filterGrid fired *****************');
      // var filterString ='.' + elemGroup + '-' + elemFilter;
      var filterString ='.' + filterStr;
      console.log('filterString: ',filterString);

      if(!(filterStr === '*')){
      console.log('************** filter CODE fired *****************');

        AYR.grid.isotope({
          itemSelector: '.grid-item',
          filter: filterString,
          animationEngine: 'best-available',
          percentPosition: true
        });
      } else {
        console.log('************** filter ALL fired *****************');
        AYR.grid.isotope({

          filter: '*',
          animationEngine: 'best-available',
          percentPosition: true
        });
      }
      // CBCL.scrollTop('html, body', CBCL.siteHeaderHeight);
    },


    addTopLink: function(argument) {
      var yPos = -($(window).scrollTop()); 

      if(yPos <= -240){
        $('.top').removeClass('hidden');
      }else{
        $('.top').addClass('hidden');
      }
    },

     isMobile: function(){
      // var mobileWidth = 950;
      var mobileWidth = 670;
      var isiPad = navigator.userAgent.match(/iPad/i) != null;

      if (($(window).width() < mobileWidth) || isiPad  ) {
        return true;
      } else {
        return false;
      }
    },

    scrollTo: function(e, elem){
     $('html,body').animate({                                                             
          scrollTop: $(elem).offset().top
      }, 1000);
    }

  };

})(jQuery); // End Self Evoking Function

AYR.init();