"use strict"; 

var AYR = AYR || {};

(function(){


  // Cache DOM elements for future use
  var currentContent = document.createElement('div');
  var cachedContent = document.createElement('div');
  var mainContent = document.querySelector('main');
  var onloadContent = document.querySelector('.content-container');
  var contentDisplayWrapper = document.querySelector('.content-display-wrapper');
  var contentDisplay = document.createElement('div');
  var contentPages = document.createElement('div');
  var displayContent = document.querySelector('.content-display-wrapper > .content-display');
  var loader = document.querySelector('.loader-wrapper');
  var menuBtn = document.querySelector('.menu-btn');
  var siteNav = document.querySelector('.site-nav');
  var siteHeader = document.querySelector('.site-header');
  var last_known_scroll_position = 0;
  var ticking = false;

  // If ontouchstart exists then set click handler to touchstart otherwise set clickhandler to click
  var clickHandler = ('ontouchstart' in document.documentElement ? "touchstart" : "click");

  // Names of all pages
  var pageNames = ['index', 'projects', 'resume', 'contact', 'oksanatanasiv', 'chartbeat', 'aliyayrobinson', 'hakimrobinson', 'chartbeatblog', 'chronicles', 'infor-healthcare', 'mry-blog', 'neutrogena', 'tweetshow'];

  /**************************************/
  /*   Application Object
  /***************************************************/
  AYR = {
    currPageName:"",
    contentElement: {},

    init: function () {
      console.log('init');

      onloadContent.classList.add('collapsed');

      // If browser has history api pushstate method then add dynamic navigation features to site
      if( history.pushState ) {

        AYR.pageLocation.registerObserver(AYR.pageState);

        /**************************************/
        /*   History.popstate
        /***************************************************/
        window.onpopstate = function (e) {
          console.log('*****************onpopstate/onload triggered*********************');
          AYR.updateCurrPage();
          AYR.pageLocation.notifyObservers(AYR.currPageName);
        }

        /**************************************/
        /*   Navigation link click
        /***************************************************/
        document.addEventListener(clickHandler, function(e){
          var el = e.target;
          var trigger;

          // Cache trigger element if clicking on an element with nav-trigger class or has a direct parent with same class name
          if( ayrApi.hasClass(el, 'nav-trigger') ){
            trigger = el;
          } else if ( ayrApi.hasClass(el.parentNode, 'nav-trigger') ) {
            trigger = el.parentNode;
          }

          // If trigger exists for click event then grab page name from href. Push href as new address url. Update current page property. Notify Page Location Observers.
          if( !(trigger === undefined) ){
            e.preventDefault();
            var href = (trigger.href) ? trigger.href : trigger.getAttribute('xlink:href'); //incase link is in svg element
            var thisPage = href.split('/').pop().replace('.html','');
            history.pushState(null, null, href);
            AYR.updateCurrPage();
            AYR.pageLocation.notifyObservers(AYR.currPageName);
          }
        });

      } // End History

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
        AYR.updateCurrPage();

        ayrApi.toTop();

        // Add class to element of sliding content
        contentDisplay.classList.add('content-display');

        // Create Element that will hold all page content elements
        contentPages.classList.add('content-pages');
        contentPages.classList.add('collapsed');

        // Add Content Pages Element to main element
        mainContent.insertBefore(contentPages, mainContent.childNodes[0]);

        // Add Content Display Wrapper Element to main element
        mainContent.insertBefore(contentDisplayWrapper, mainContent.childNodes[0]);

        // Add initial Content Display Element as a child of the Content Display Wrapper Element
        contentDisplayWrapper.insertBefore(contentDisplay, contentDisplayWrapper.childNodes[0]);

        // Create a document fragment to add all new page elements to Content Pages elemwn at one time
        var pagesFragment = document.createDocumentFragment();

        // Add Empty Content Pages element as child of the pages fragement element
        pagesFragment.appendChild(contentPages);

        // For each page in pageNames array create element with corresponding page data and add to the content pages element
        for (var i=0; i < pageNames.length; i++){
          (function(i) {
            ayrApi.getAjax(pageNames[i] + '.html', function(data){ 
              var newContentPage = document.createElement('div');
              newContentPage.classList.add(pageNames[i] + '-page');
              var newContent = document.createElement( 'html' );
              newContent.innerHTML = data;
              var pageContent = newContent.querySelector( '.content-wrapper' ); 
              newContentPage.innerHTML += pageContent.outerHTML;
              contentPages.appendChild(newContentPage);
            });
          })(i);
        }

        // Add page fragment that now has the no longer empty contentPages element to the main element
        mainContent.appendChild(pagesFragment);

        // Before animating in new page content, maks sure all of the content Pages have been loaded first 
        var loadInt = setInterval(function(){ 
          if ( document.body.contains(document.querySelector('.content-pages > .' + AYR.currPageName + '-page')) ){
            
            var newPage =  document.querySelector('.content-pages > .' + AYR.currPageName + '-page').cloneNode(true);

            contentDisplayWrapper.style.height = document.querySelector('.content-pages > .' + AYR.currPageName + '-page').offsetHeight + 'px';

            document.querySelector('.content-display-wrapper > .content-display').appendChild(newPage);
            document.querySelector('.content-display-wrapper > .content-display').classList.add('active');

            if(AYR.currPageName === "resume"){
              AYR.growSkills();
            }

            loader.classList.add('collapsed');

            clearInterval(loadInt);
          }
        }, 10);
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

    growSkills: function() {
      var skillsArr = [];
      var skills = document.querySelectorAll('.skill');
      for (var i=0; i<skills.length; i++){
        skillsArr.push(skills[i].getAttribute('data-rating'));
      };
      d3.selectAll(".skill")
      .data(skillsArr)
      .style("font-size", "0px")
      .transition(5000)
      .delay(function(d, i) {
          return i * 100;
      })
      .style("font-size", function(d) { return d * 2.5  + "px"; });
    },

    slideOutActive: function(){
      var activePage = document.querySelector('.active');
      activePage.classList.add('slide-out');
    },

    slideInNew: function(contentElement){
      var newPage = document.querySelector('.content-display-wrapper > .content-display:not(.active)');
      newPage.classList.add('slide-in');
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

    updateCurrPage: function() {
      var thisPage = location.href.split('/')[location.href.split('/').length -1 ];
      AYR.currPageName = (thisPage === "") ? "index" : thisPage.replace('.html','');
    },

    transitionContent: function(page){
      console.log('*****************transitionContent*********************');
      ayrApi.toTop();

      var pageURL = page + ".html";

      AYR.updateCurrPage();
      AYR.currPageName = page;
      AYR.collapseMobileNav();


      var newPageContainer = document.createElement('div');

      // Clone new page contents
      var newPage =  document.querySelector('.content-pages > .' + AYR.currPageName + '-page').cloneNode(true);
      
      // Add class content-display to new page 
      newPage.classList.add('content-display');

      // Update container hieght
      contentDisplayWrapper.style.height = document.querySelector('.content-pages > .' + AYR.currPageName + '-page').offsetHeight + 'px';
      
      // Add cloned page content to container
      contentDisplayWrapper.appendChild(newPage);
      
      // Move any active containers to the left of the screen, out of the view of the user.
      document.querySelector('.active').style.left = -document.body.offsetWidth + 'px';

      // Make cloned page active. The active class adds transition animation
      newPage.classList.add('active');

      // Remove the old active container
      document.querySelectorAll('.active')[0].parentNode.removeChild(document.querySelectorAll('.active')[0]);
      
      if(AYR.currPageName === "resume"){
        AYR.growSkills();
      }
    }
  };

})(); // End Self Evoking Function

AYR.init();