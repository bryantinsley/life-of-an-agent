import Reveal from 'reveal.js';
import 'reveal.js/dist/reveal.css';

const deck = new Reveal({
  hash: true,
  controls: true,
  controlsLayout: 'bottom-right',
  progress: true,
  slideNumber: 'c/t',
  transition: 'slide',
  transitionSpeed: 'default',
  backgroundTransition: 'fade',
  center: false,
  width: 1280,
  height: 720,
  margin: 0.04,
  minScale: 0.2,
  maxScale: 2.0,
  keyboard: {
    // disable the jump-to-slide shortcut entirely
    71: null,
  },
});

deck.initialize();
