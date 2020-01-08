import AudioPlayer from './AudioPlayer';
import './style.scss';

const createPlayer = (url, name) => {
  const audioPlayer = new AudioPlayer(url, name);
  return audioPlayer.render();
};

const root = document.getElementById('root');

const player = createPlayer();

root.append(player);
