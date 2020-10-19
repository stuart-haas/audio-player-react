import React from 'react';
import Player from './player/Player';
import tracks from './data/tracks.json';
import './styles.scss';

export default function App() {
  return <Player data={tracks.data} 
    playing={true}
    shuffle={true}
    repeat={true}
    tracksVisible={true}
  />;
}
