/* exported MediaControls */
'use strict';

/**
 * Dependencies
 */
var ForwardRewindController = require('./forward_rewind_controller.js');

var dom = {};
var player = null;
var forwardRewindController;
 
function MediaControls(domElements) {
  console.log('begin MediaControls constructor');
  this.name = 'foo';
  console.log('this: ' + this.name);

  this.touchStartID = null;
  this.isPausedWhileDragging = null;
  this.dragging = false;
  this.sliderRect = null;

  dom = domElements;
  forwardRewindController = new ForwardRewindController();

  console.log('end MediaControls constructor');
}

MediaControls.prototype = {

  initialize: function(playerElement) {
    console.log('initialize, this: ' + this.name);

    player = playerElement;
    forwardRewindController.init(player);

    /*
    ** play/rewind/forward events
    */
    dom.play.addEventListener('click', handlePlayButtonClick);
    dom.seekForward.addEventListener('click',
                                     forwardRewindController.handleSeekForward);
    dom.seekBackward.addEventListener('click',
                                     forwardRewindController.handleSeekBackward);
    var videoToolbar = dom.seekForward.parentElement;
    videoToolbar.addEventListener('contextmenu', handleStartLongPressing);
    videoToolbar.addEventListener('touchend', handleStopLongPressing);

    /*
    ** slider
    */
    dom.sliderWrapper.addEventListener('touchstart', handleSliderTouchStart.bind(this));
    dom.sliderWrapper.addEventListener('touchmove', handleSliderTouchMove.bind(this));
    dom.sliderWrapper.addEventListener('touchend', handleSliderTouchEnd.bind(this));

    /*
    ** The fullscreen button
    */
    dom.fullscreenButton.addEventListener('click', handleFullscreenButtonClick);

    /*
    ** Media loading
    */
    player.addEventListener('loadedmetadata', handleLoadedMetadata);

    /*
    ** Media begins playing
    */
    player.addEventListener('play', handleMediaPlaying);

    /*
    ** Media is paused
    */
    player.addEventListener('pause', handleMediaPaused);
  },

  updateSlider: function() {
    updateSliderWorker.call(this);
  }
};

/*
** Functions handling events.
*/
function handlePlayButtonClick() {
  dom.mediaControlsComponent.dispatchEvent(
    new CustomEvent('play-button-click'));
}

function handleStartLongPressing(event) {

  if (event.target.id === dom.seekForward.id) {
    forwardRewindController.handleLongPressForward();
  } else if (event.target.id === dom.seekBackward.id) {
    forwardRewindController.handleLongPressBackward();
  } else {
    return;
  }
}

function handleStopLongPressing(event) {
  forwardRewindController.handleLongPressStop();
}

function handleFullscreenButtonClick(event) {
  dom.mediaControlsComponent.dispatchEvent(
    new CustomEvent('fullscreen-button-click', {detail: event}));
}

function handleMediaPlaying() {
  dom.play.classList.remove('paused');
}

function handleMediaPaused() {
  dom.play.classList.add('paused');
}

/*
** End event handling functions.
*/

/*
** "Worker" functions.
*/
function updateSliderWorker() {

  // We update the slider when we get a 'seeked' event.
  // Don't do updates while we're seeking because the position we fastSeek()
  // to probably isn't exactly where we requested and we don't want jerky
  // updates
  if (player.seeking) {
    return;
  }

  var percent = (player.currentTime / player.duration) * 100;
  if (isNaN(percent)) {
    return;
  }

  percent += '%';

  dom.elapsedText.textContent =
                  formatDuration(player.currentTime);
  dom.elapsedTime.style.width = percent;

  // Don't move the play head if the user is dragging it.
  if (!this.dragging) {
    movePlayHead(percent);
  }
}

function movePlayHead(percent) {
  if (navigator.mozL10n.language.direction === 'ltr') {
    dom.playHead.style.left = percent;
  }
  else {
    dom.playHead.style.right = percent;
  }
}

function handleSliderTouchStart(event) {

  // We can't do anything if we don't know our duration
  if (player.duration === Infinity) {
    return false;
  }

  // If we have a touch start event, we don't need others.
  if (null != this.touchStartID) {
    return false;
  }

  this.dragging = true;
  this.touchStartID = event.changedTouches[0].identifier;

  // Save the state of whether the media element is paused or not
  // and if it is not, pause it.
  if (player.paused) {
    this.isPausedWhileDragging = true;
  }
  else {
    this.isPausedWhileDragging = false;
    player.pause();
  }
  
  // calculate the slider wrapper size for slider dragging.
  this.sliderRect = dom.sliderWrapper.getBoundingClientRect();

  handleSliderTouchMove.call(this, event);
}

function handleSliderTouchMove(event) {

  var touch = event.changedTouches.identifiedTouch(this.touchStartID);

  // We don't care the event not related to touchStartID
  if (!touch) {
    return;
  }

  function getTouchPos() {
    return (navigator.mozL10n.language.direction === 'ltr') ?
       (touch.clientX - this.sliderRect.left) :
       (this.sliderRect.right - touch.clientX);
  }

  var touchPos = getTouchPos.call(this);

  var pos = touchPos / this.sliderRect.width;
  pos = Math.max(pos, 0);
  pos = Math.min(pos, 1);

  // Update the slider to match the position of the user's finger.
  // Note, however, that we don't update the displayed time until
  // we actually get a 'seeked' event.
  var percent = pos * 100 + '%';
  dom.playHead.classList.add('active');
  movePlayHead(percent);
  dom.elapsedTime.style.width = percent;
  player.fastSeek(player.duration * pos);
}

function handleSliderTouchEnd(event) {

  // We don't care the event not related to touchStartID
  if (!event.changedTouches.identifiedTouch(this.touchStartID)) {
    return false;
  }

  this.dragging = false;
  this.touchStartID = null;

  dom.playHead.classList.remove('active');

  // If the media was playing when the user began dragging the slider
  // (and the slider was not dragged to the end), begin playing the
  // media.
  if (!(this.isPausedWhileDragging ||
        player.currentTime === player.duration)) {
    player.play();
  }
}

function handleLoadedMetadata() {
  console.log('setting duration to ' + player.duration);
  dom.durationText.textContent = formatDuration(player.duration);
}

function formatDuration(duration) {
  function padLeft(num, length) {
    var r = String(num);
    while (r.length < length) {
      r = '0' + r;
    }
    return r;
  }
  
  duration = Math.round(duration);
  var minutes = Math.floor(duration / 60);
  var seconds = duration % 60;
  if (minutes < 60) {
    return padLeft(minutes, 2) + ':' + padLeft(seconds, 2);
  }
  var hours = Math.floor(minutes / 60);
  minutes = Math.floor(minutes % 60);
  return hours + ':' + padLeft(minutes, 2) + ':' + padLeft(seconds, 2);
}

module.exports = MediaControls;

