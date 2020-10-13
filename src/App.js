import React from 'react';
import Drop from './drop/Drop';
import tracks from './drop/tracks.json';
import './styles.scss';

export default function App() {
  return <Drop data={tracks.data} />;
}
