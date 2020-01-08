import moment from 'moment';
import createElement from '../common/createElement';
import audio from '../assets/love.mp3';
import theme from '../theme';
import './style.scss';

let data = [];
class AudioPlayer {
  constructor(audioURL = audio, nameAudio = 'Shortparis - Любовь') {
    this.audioElement = document.createElement('audio');
    this.audioElement.src = audioURL;
    this.nameAudio = nameAudio;
    this.playInterval = null;
    this.timeContainer = createElement('div', '', {}, []);
    this.iconPlay = createElement('i', [ 'fa', 'fa-play' ], {
      styles: {
        color: theme.primaryLight
      }
    });
    this.buttonPlay = createElement('button', 'button-play', {
      styles: {
        background: 'transparent',
        border: 'none'
      }
    });
    this.canvas = createElement('canvas', '', {
      styles: {
        height: '100%'
      }
    });
    this.durationElement = createElement('div', 'duration', {}, []);
    this.timeControls = createElement(
      'div',
      'time-control',
      {
        styles: {
          width: '100%',
          'font-weight': '100',
          color: theme.primary
        }
      },
      []
    );
    this.buttonSpeed = createElement(
      'div',
      'button-speed',
      {
        styles: {
          cursor: 'pointer'
        },
        'data-action': 'toggle-speed'
      },
      '1x'
    );
    this.draw = this.draw.bind(this);
  }

  play() {
    this.audioElement['play']();
    this.iconPlay.classList.replace('fa-play', 'fa-pause');

    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.source = this.audioCtx.createMediaElementSource(this.audioElement);
    }

    const analyser = this.audioCtx.createAnalyser();

    const processor = this.audioCtx.createScriptProcessor(2048, 1, 1);

    this.source.connect(analyser);
    this.source.connect(processor);
    analyser.connect(this.audioCtx.destination);
    processor.connect(this.audioCtx.destination);
    analyser.fftSize = 256;

    data = new Uint8Array(analyser.frequencyBinCount);
    processor.onaudioprocess = function() {
      analyser.getByteFrequencyData(data);
    };
    this.playInterval = setInterval(() => {
      const { currentTime, duration } = this.audioElement;
      const time = currentTime === 0 ? 0.1 : currentTime;
      this.durationElement.style.width = `${Math.round(time * 100 / duration)}%`;
      this.timeContainer.innerText = `${moment(Math.round(currentTime * 1000)).format('mm:ss')}/${moment
        .utc(Math.floor(duration * 1000))
        .format('mm:ss')}`;
      if (this.audioElement.ended) {
        this.durationElement.style.width = 0;
        this.iconPlay.classList.replace('fa-pause', 'fa-play');
        this.audioElement.currentTime = 0;
        clearInterval(this.playInterval);
      }
    }, 100 / 60);
    this.draw();
  }

  pause() {
    this.audioElement['pause']();
    this.iconPlay.classList.replace('fa-pause', 'fa-play');
    clearInterval(this.playInterval);
  }

  toggleAudio(audioURL) {
    this.audioElement.src = audioURL;
  }

  toggleMode(mode) {
    this._mode = mode;
  }

  draw() {
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let x = 0;
    data.forEach((item, i) => {
      const colorHiglight = item * 2;
      x = i * 3;
      ctx.beginPath();
      ctx.rect(x, 150, 2, -item / 2.5);
      x += 1;
      ctx.fillStyle = `rgb(${colorHiglight > 204 ? 204 : item}, ${colorHiglight * 2 > 204
        ? 100
        : 136}, ${colorHiglight > 204 ? 183 : 255}, 0.5)`;
      ctx.fill();
    });
    requestAnimationFrame(this.draw);
  }

  render() {
    const body = document.querySelector('body');
    body.onclick = (e) => {
      const { toElement } = e;
      if (toElement && toElement['data-action'] === 'toggle-speed') {
        speedList.style.opacity = 1;
        speedList.style['z-index'] = 12;
      } else {
        speedList.style.opacity = 0;
        speedList.style['z-index'] = 0;
      }
    };
    this.buttonPlay.appendChild(this.iconPlay);
    this.buttonPlay.onclick = () => (this.audioElement.paused ? this.play() : this.pause());
    const nameContainer = createElement('div', '', {}, this.nameAudio);
    this.timeControls.appendChild(nameContainer);
    this.timeContainer.innerText = `${moment(Math.round(this.audioElement.currentTime * 1000)).format(
      'mm:ss'
    )}/${moment.utc(Math.floor(this.audioElement.duration || 0 * 1000)).format('mm:ss')}`;
    this.timeControls.appendChild(this.timeContainer);

    const canvasContainer = createElement('div', 'canvas-container', {}, [ this.canvas, this.durationElement ]);
    canvasContainer.onclick = (e) => {
      const { duration } = this.audioElement;
      const { width } = canvasContainer.getBoundingClientRect();
      const timeChanged = duration / width;
      const { x } = canvasContainer.getBoundingClientRect();
      const timeStamp = (e.clientX - x) * timeChanged;
      this.audioElement.currentTime = timeStamp;
      this.durationElement.style.width = `${timeStamp * 100 / duration}%`;
    };

    const canvasWrapped = createElement('div', 'canvas-wrapped', {}, [ canvasContainer, this.timeControls ]);

    this.buttonSpeed.onclick = () => (speedList.style.opacity = 1);
    this.buttonSpeed.mouseout = () => (speedList.style.opacity = 0);
    const speedList = createElement('ul', 'speed-list', {}, []);
    const speeds = [ '0.5', '1', '1.25', '1.5', '1.75', '2', '2.5' ];
    speeds.forEach((speedItem) => {
      const speedNode = createElement('li', 'speed-item', {}, `${speedItem}x`);
      speedNode.onclick = () => {
        this.audioElement.playbackRate = parseFloat(speedItem);
        speedList.style.opacity = 0;
        this.buttonSpeed.innerText = `${speedItem}x`;
      };
      speedList.appendChild(speedNode);
    });

    const speedContainer = createElement(
      'div',
      'speed-container',
      {
        styles: {
          position: 'relative'
        }
      },
      [ this.buttonSpeed, speedList ]
    );

    const volumeIcon = createElement('i', [ 'fa', 'fa-volume-up', 'fa-control', 'volume-button' ], {}, []);
    volumeIcon.onclick = () => {
      const { width } = sliderVolume.style;
      if (width === '0px' || !width) {
        sliderVolume.style.opacity = 1;
        toggleVolumeContainer.style.width = '40%';
        setTimeout(() => (sliderVolume.style.width = '40%'), 100);
      } else {
        sliderVolume.style.width = '0';
        toggleVolumeContainer.style.width = '5%';
        setTimeout(() => (sliderVolume.style.opacity = 0), 100);
      }
    };
    const uploadIcon = createElement('i', [ 'fa', 'fa-upload', 'fa-control' ], {}, []);

    const downloadIcon = createElement('i', [ 'fa', 'fa-download', 'fa-control' ], {}, []);

    const buttonUpload = createElement(
      'button',
      'button-upload',
      {
        onclick: () => console.log('upload')
      },
      uploadIcon
    );

    const downloadAnchor = createElement(
      'a',
      '',
      {
        href: this.audioElement.src,
        download: this.audioElement.src
      },
      downloadIcon
    );
    const buttonDownload = createElement(
      'button',
      'button-download',
      {
        onclick: () => console.log('download')
      },
      downloadAnchor
    );

    const sliderVolume = createElement(
      'input',
      'slider-volume',
      {
        type: 'range',
        orient: 'vertical',
        max: this.audioElement.volume,
        min: 0,
        step: 0.1,
        onchange: (e) => (this.audioElement.volume = e.target.value)
      },
      []
    );
    const toggleVolumeContainer = createElement('div', 'toggle-volume', {}, [ volumeIcon, sliderVolume ]);

    const controlsContainer = createElement('div', 'controls-container', {}, [
      speedContainer,
      toggleVolumeContainer,
      buttonUpload,
      buttonDownload
    ]);

    const playerContainer = createElement('div', 'player-container', {}, [
      this.buttonPlay,
      canvasWrapped,
      controlsContainer
    ]);
    const container = createElement('div', '', {}, [ this.audioElement, playerContainer ]);
    return container;
  }
}

export default AudioPlayer;
