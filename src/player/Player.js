import React, { useState, useEffect, useRef } from 'react';
import './Player.scss';

const Player = (props) => {
  const parent = useRef();
  const audio = useRef();
  const [data] = useState(props.data);
  const [playing, setPlaying] = useState(props.playing);
  const [repeat, setRepeat] = useState(props.repeat);
  const [shuffle, setShuffle] = useState(props.shuffle);
  const [tracksVisible, setTracksVisible] = useState(props.tracksVisible);
  const [toolTipVisible, setToolTipVisible] = useState(false);
  const [toolTipPos, setToolTipPos] = useState(0);
  const [toolTipValue, setToolTipValue] = useState(0);
  const [toolTipValueClass, setToolTipValueClass] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setIndex] = useState(0);
  const [shuffleData, setShuffleData] = useState([]);
  //const [mode, setMode] = useState('large');

  // listen for when track is loaded or playing
  useEffect(() => {
    audio.current.addEventListener('loadedmetadata', () => {
      setDuration(audio.current.duration);
    });
    audio.current.addEventListener('timeupdate', () => {
      const nDuration = audio.current.duration;
      var currentTime = audio.current.currentTime;
      setCurrentTime(currentTime);

      var remainingTime = nDuration - currentTime;
      setRemainingTime(remainingTime);

      const progress = (currentTime / nDuration) * 100;
      setProgress(progress);
    });
  }, []);

  // go to the next track when the previous one ends
  useEffect(() => {
    audio.current.addEventListener('ended', () => {
      setIndex(currentIndex + 1);
    });
  }, [currentIndex]);

  // set source for current track
  useEffect(() => {
    if(shuffle) {
      if(shuffleData && shuffleData[currentIndex]) {
        audio.current.src = shuffleData[currentIndex].file;
      }
    } else {
      if (data && data[currentIndex]) {
        audio.current.src = data[currentIndex].file;
      }
    }
  }, [currentIndex, data, shuffle, shuffleData]);

  // play or pause current track
  useEffect(() => {
    if (playing) {
      audio.current.play();
    } else {
      audio.current.pause();
    }
  }, [playing]);

  // logic for repeat
  useEffect(() => {
    if (currentIndex > data.length - 1) {
      if (repeat) {
        setIndex(0);
        setPlaying(true);
      } else {
        setIndex(data.length);
        setPlaying(false);
      }
    }
  }, [currentIndex, data, repeat]);

  // logic for shuffle
  useEffect(() => {
    const copy = JSON.parse(JSON.stringify(props.data));
    if (shuffle) {
      setShuffleData(shuffleArray(copy));
    }
  }, [shuffle, props.data]);

  function set(index) {
    setIndex(index);
    play();
  }

  function next() {
    if (currentIndex === data.length - 1) {
      if (repeat) {
        setIndex(0);
      }
    } else {
      setIndex(currentIndex + 1);
    }
    play();
  }

  function prev() {
    if (currentIndex === 0) {
      setIndex(data.length - 1);
    } else {
      setIndex(currentIndex - 1);
    }
    play();
  }

  function play() {
    setPlaying(true);
  }

  function pause() {
    setPlaying(false);
  }

  function seek(e) {
    var target = e.currentTarget;
    var position =
      (e.pageX - target.offsetLeft - parent.current.offsetLeft) /
      target.offsetWidth;
    audio.current.currentTime = position * duration;
    play();
  }

  function updateToolTip(e) {
    var target = e.currentTarget;
    var position = (e.pageX - target.offsetLeft) / target.offsetWidth;
    var percentPosition = position * 100;
    setToolTipVisible(true);
    setToolTipPos(percentPosition);
    if (percentPosition > 0) {
      setToolTipValue(position * duration);
    }
    if (percentPosition < 10) {
      setToolTipValueClass('left');
    } else if (percentPosition > 90) {
      setToolTipValueClass('right');
    } else {
      setToolTipValueClass('');
    }
  }

  return (
    <div className="player" ref={parent}>
      <div className="player__container">
        <audio
          ref={audio}
          src={data[props.index ? props.index : 0].file}
          autoPlay={playing}
        />
        <div className="player__main">
          <div className="player__images">
            <div className="player__info">
              <div className="player__header">
                <h3 className="player__title">
                  {shuffle ? shuffleData[currentIndex] && shuffleData[currentIndex].track : data[currentIndex] && data[currentIndex].track}
                </h3>
                <h5 className="player__artist">
                  {shuffle ? shuffleData[currentIndex] && shuffleData[currentIndex].artist : data[currentIndex] && data[currentIndex].artist}
                </h5>
              </div>
            </div>
            <div className="player__controls --small">
              <div className="player__buttons --left">
                <span
                  className={`player__button --repeat --controls --small ${
                    repeat ? 'active' : ''
                  }`}
                  onClick={() => setRepeat(!repeat)}
                >
                  <i
                    className="player__icon --repat fa fa-repeat"
                    aria-hidden="true"
                  ></i>
                </span>
                <span
                  className={`player__button --shuffle --small --controls ${
                    shuffle ? 'active' : ''
                  }`}
                  onClick={() => {
                    setShuffle(!shuffle);
                  }}
                >
                  <i
                    className="player__icon --shuffle fa fa-random"
                    aria-hidden="true"
                  ></i>
                </span>
              </div>
              <span
                className="player__button --prev --controls  --small"
                onClick={() => prev()}
              >
                <i
                  className="player__icon --prev fa fa-backward"
                  aria-hidden="true"
                ></i>
              </span>
              {!playing && (
                <span
                  className="player__button --play --controls --small"
                  onClick={() => play()}
                >
                  <i
                    className="player__icon --play fa fa-play"
                    aria-hidden="true"
                  ></i>
                </span>
              )}
              {playing && (
                <span
                  className="player__button --pause --controls  --small"
                  onClick={() => pause()}
                >
                  <i
                    className="player__icon --pause fa fa-pause"
                    aria-hidden="true"
                  ></i>
                </span>
              )}
              <span
                className="player__button --next --controls  --small"
                onClick={() => next()}
              >
                <i
                  className="player__icon --next fa fa-forward"
                  aria-hidden="true"
                ></i>
              </span>
            </div>
            {/*<div className='player__mode'>
              {mode === 'large' && (
                <span
                  className='player__mode-button --small'
                  onClick={() => {
                    setMode('small');
                    setTracksVisible(false);
                  }}
                >
                  <i
                    className='player__icon --small fa fa-compress'
                    aria-hidden='true'
                  ></i>
                </span>
              )}
              {mode === 'small' && (
                <span
                  className='player__mode-button --large'
                  onClick={() => {
                    setMode('large');
                    setTracksVisible(true);
                  }}
                >
                  <i
                    className='player__icon --large fa fa-expand'
                    aria-hidden='true'
                  ></i>
                </span>
              )}
                </div>*/}
            {data.map((item, index) => (
              <div
                key={index}
                className={`player__image ${
                  getActiveTrack() ? 'active' : ''
                }`}
                style={{
                  left: `${-(getActiveIndex() * 100)}%`
                }}
                onClick={() => play()}
              >
                <div
                  className="player__background"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
              </div>
            ))}
          </div>
          <div
            className="player__progress --container"
            onMouseOver={(e) => updateToolTip(e)}
            onMouseMove={(e) => updateToolTip(e)}
            onMouseOut={() => setToolTipVisible(false)}
          >
            <div
              className={`player__tooltip ${toolTipVisible ? 'active' : ''}`}
              style={{ left: `${toolTipPos}%` }}
            >
              <span className={`player__tooltip-value ${toolTipValueClass}`}>
                {convertTime(toolTipValue)}
              </span>
            </div>
            <span className="player__time --current">
              {convertTime(currentTime)}
            </span>
            <div className="player__progress --bar">
              <span
                className="player__progress --background"
                onClick={(e) => seek(e)}
              >
                <span
                  className="player__progress --indicator"
                  style={{ width: `${progress}%` }}
                ></span>
              </span>
            </div>
            <span className="player__time --remaining">
              {remainingTime
                ? `-${convertTime(remainingTime)}`
                : convertTime(duration)}
            </span>
          </div>
          <div className="player__controls">
            <div className="player__buttons --left">
              <span
                className={`player__button --repeat --controls ${
                  repeat ? 'active' : ''
                }`}
                onClick={() => setRepeat(!repeat)}
              >
                <i
                  className="player__icon --repat fa fa-repeat"
                  aria-hidden="true"
                ></i>
              </span>
              <span
                className={`player__button --shuffle --controls ${
                  shuffle ? 'active' : ''
                }`}
                onClick={() => {
                  setShuffle(!shuffle);
                }}
              >
                <i
                  className="player__icon --shuffle fa fa-random"
                  aria-hidden="true"
                ></i>
              </span>
            </div>
            <span
              className="player__button --prev --controls"
              onClick={() => prev()}
            >
              <i
                className="player__icon --prev fa fa-backward"
                aria-hidden="true"
              ></i>
            </span>
            {!playing && (
              <span
                className="player__button --play --controls"
                onClick={() => play()}
              >
                <i
                  className="player__icon --play fa fa-play"
                  aria-hidden="true"
                ></i>
              </span>
            )}
            {playing && (
              <span
                className="player__button --pause --controls"
                onClick={() => pause()}
              >
                <i
                  className="player__icon --pause fa fa-pause"
                  aria-hidden="true"
                ></i>
              </span>
            )}
            <span
              className="player__button --next --controls"
              onClick={() => next()}
            >
              <i
                className="player__icon --next fa fa-forward"
                aria-hidden="true"
              ></i>
            </span>
            <span
              className={`player__button --tracks --controls ${
                tracksVisible ? 'active' : ''
              }`}
              onClick={() => setTracksVisible(!tracksVisible)}
            >
              <i
                className="player__icon --tracks fa fa-list"
                aria-hidden="true"
              ></i>
            </span>
          </div>
        </div>
        <div className={`player__tracks ${tracksVisible ? 'active' : ''}`}>
          <div className="player__scroll" >
            {data.map((item, index) => (
              <div
                key={index}
                className={`player__track ${
                  getActiveTrack(index, item) ? 'active' : ''
                }`}
                onClick={() => {
                  set(index);
                }}
              >
                {/*<div
                  className='player__track-image'
                  style={{ backgroundImage: `url(${item.image})` }}
                ></div>*/}
                <div className="player__track-info">
                  <p>{item.track}</p>
                  <p>{item.artist}</p>
                </div>
                <div className="player__track-buttons">
                  <span className="player__track-button --favorite">
                    <i className="player__icon --favorite fas fa-heart"></i>
                  </span>
                  <span className="player__track-button --add">
                    <i className="player__icon --add fas fa-plus"></i>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  function getActiveTrack(index) {
    if(shuffle && shuffleData[currentIndex]) {
      const currentTrack = shuffleData[currentIndex].track;
      return data.findIndex(x => x.track === currentTrack) === index;
    } else {
      if(data && data[currentIndex]) {
        return currentIndex === index;
      }
    }
  }

  function getActiveIndex() {
    if(shuffle && shuffleData[currentIndex]) {
      const currentTrack = shuffleData[currentIndex].track;
      return data.findIndex(x => x.track === currentTrack);
    } else {
      return currentIndex;
    }
  }
}

function convertTime(inputSeconds) {
  var seconds = Math.floor(inputSeconds % 60);

  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  var minutes = Math.floor(inputSeconds / 60);
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  return minutes + ':' + seconds;
}

function shuffleArray(oldArray) {
  var j, x, i;
  var newArray = oldArray;
  for (i = newArray.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = newArray[i];
    newArray[i] = newArray[j];
    newArray[j] = x;
  }
  return newArray;
}

export default Player;
