/**
 * Dependencies
 */

var MediaPlayerHelper = require('./lib/media_player_helper');
  
function registerComponent(name, props) {
  console.log(Date.now() + '-- registering element ' + name);

  var baseElement = Object.create(HTMLElement.prototype);
  var elemProto = Object.assign(baseElement, props);
  
  var elem = document.registerElement(name, { prototype: elemProto });

  console.log('registered element ' + name);

  return elem;
}

var gaiaMediaPlayer = registerComponent('gaia-media-player', {
  /**
   * 'createdCallback' is called when the element is first created.
   */
  createdCallback: function() {
    console.log(Date.now() + '-- createdCallback, gaia-media-player web component, begin');

    var shadowRoot = this.createShadowRoot();
    shadowRoot.innerHTML = this.template;

    var dom = {};
    var ids = ['mediaControlsContainer', 'player-header', 'video-title',
               'options', 'picker-done', 'media-controls'
    ];

    function toCamelCase(str) {
      return str.replace(/\-(.)/g, function replacer(str, p1) {
        return p1.toUpperCase();
      });
    }

    ids.forEach(function createElementRef(name) {
      //var camelName = toCamelCase(name);
      dom[toCamelCase(name)] = shadowRoot.getElementById(name);
      //console.log('loaded ' + camelName + ': ' + dom[camelName]);
    });

    dom.mediaPlayerComponent = this;

    this.mediaPlayerHelper = new MediaPlayerHelper(dom);
    console.log('mediaPlayerHelper: ' + this.mediaPlayerHelper);
    console.log(Date.now() + '-- createdCallback, gaia-media-player web component, end');
  },

  initialize: function(mediaPlayer) {
    console.log('mediaPlayerComponent.initialize begin');
    this.mediaPlayerHelper.initialize(mediaPlayer);
    console.log('mediaPlayerComponent.initialize done');
  },

  template: `

  <style>

  /*
   * while videoControls are hidden, they should stay on screen for mousedown events
   */
  #videoControlsContainer.hidden {
    display: block;
    visibility: visible;
  }

  /* video player controls */
  #videoControlsContainer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    opacity: 1;
    will-change: opacity;
    -moz-transition: opacity 0.5s;
  }
  #videoControlsContainer.hidden {
    opacity: 0;
  }
  
  #videoControlsContainer.hidden > * {
    pointer-events: none;
  }

  /**
   * 1. COMPLEX: Scoped style-sheets within <gaia-header>
   *    trump all other rules. !important is required
   *    for an app to over-ride the default appearance
   *    of content within the custom-element. This may
   *    change when we get ':host' and ':content' selectors
   *    in shadow-dom.
   */
  
  /* hide options when picking */
  body.pick-activity #options {
    display: none !important; /* 1 */
  }

  /* hide picker 'done' when not picking */
  body:not(.pick-activity) #picker-done {
    display: none !important; /* 1 */
  }

  </style>

  <div id="mediaControlsContainer">
    <section role="region">
      <gaia-header id="player-header" action="back">
        <h1 id="video-title"></h1>
        <button id="options" data-icon="more"></button>
        <button id="picker-done" data-l10n-id="done">Done</button>
      </gaia-header>
      <gaia-media-controls id="media-controls"></gaia-media-controls>
    </section>
  </div>`
});

module.exports = gaiaMediaPlayer

