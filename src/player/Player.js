import React, { useState, useEffect, useRef, useCallback } from 'react';

import './Player.scss';

const Player = (props) => {
  const parent = useRef();
  const audio = useRef();
  const [data] = useState(props.data);
  const [playing, setPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setIndex] = useState(1);
  const [tracksVisible, setTracksVisible] = useState(true);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [toolTipPos, setToolTipPos] = useState(0);
  const [toolTipVisible, setToolTipVisible] = useState(false);
  const [toolTipValue, setToolTipValue] = useState(0);
  const [toolTipValueClass, setToolTipValueClass] = useState('');
  const [mode, setMode] = useState('large');
  const [history, setHistory] = useState([]);

  const random = useCallback(() => {
    // get a random track
    var item = data[Math.floor(Math.random() * data.length)];
    if (history.length !== data.length) {
      // make sure the track hasn't already been played and that it's not the current track
      if (history.indexOf(item) < 0 && data.indexOf(item) !== currentIndex) {
        setHistory([...history, item]);
        // otherwise call this method again
      } else {
        random();
      }
    }
  }, [currentIndex, data, history]);

  useEffect(() => {
    audio.current.addEventListener('loadedmetadata', () => {
      const nDuration = audio.current.duration;
      setDuration(nDuration);
    });
    audio.current.addEventListener('timeupdate', () => {
      const nDuration = audio.current.duration;
      var currentTime = audio.current.currentTime;
      setCurrentTime(currentTime);

      var remainingTime = nDuration - currentTime;
      setRemainingTime(remainingTime);

      if (currentTime === nDuration) {
        setIndex((currentIndex) => currentIndex + 1);
      }

      const progress = (currentTime / nDuration) * 100;
      setProgress(progress);
    });
  }, [currentIndex, data]);

  // play or pause current track
  useEffect(() => {
    if (playing) {
      audio.current.play();
    } else {
      audio.current.pause();
    }
  }, [playing]);

  // set source for current track
  useEffect(() => {
    if (data) {
      if (data[currentIndex]) {
        audio.current.src = data[currentIndex].file;
      }
    }
  }, [currentIndex, data]);

  // logic for repeat
  useEffect(() => {
    if (currentIndex > data.length - 1) {
      if (repeat) {
        setIndex(-1);
        setPlaying(true);
      } else {
        setIndex(data.length - 1);
        setPlaying(false);
      }
    }
  }, [currentIndex, data, repeat, shuffle]);

  // setup and teardown logic for shuffle
  useEffect(() => {
    if (shuffle) {
      const item = data[currentIndex];
      // add the current track to history when shuffle is enabled
      if (history.indexOf(item) < 0) {
        setHistory([...history, item]);
      }
      // if history list is full and repeat is enabled clear the history to continue
      if (history.length === data.length) {
        if (repeat) {
          setHistory([]);
        }
      }
    } else {
      // if shuffle is diabled clear the history
      if (history.length) {
        setHistory([]);
      }
    }
  }, [shuffle, history, data, currentIndex, repeat]);

  // set current track from history
  useEffect(() => {
    if (data && history.length) {
      // get the latest track from history and check to make sure it's defined
      const item = history[history.length - 1];
      if (history[history.length - 1]) {
        // get the index of the track and set the current index from that
        const index = data.findIndex((i) => i.track === item.track);
        setIndex(index);
      }
    }
  }, [data, history]);

  function set(index) {
    setIndex(index);
    play();
  }

  function next() {
    if (shuffle) {
      random();
    } else {
      if (currentIndex === data.length - 1) {
        if (repeat) {
          setIndex(0);
        }
      } else {
        setIndex((currentIndex) => currentIndex + 1);
      }
    }
    play();
  }

  function prev() {
    if (currentIndex === 0) {
      setIndex(data.length - 1);
    } else {
      setIndex((currentIndex) => currentIndex - 1);
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
    <div className={`player ${mode}`} ref={parent}>
      <div className="player__player">
        <audio
          ref={audio}
          src={data[props.index ? props.index : 0].file}
          autoPlay={playing}
        />
        <div className="player__top">
          <div className="player__info">
            <div className="player__header">
              <h3 className="player__title">
                {data[currentIndex] && data[currentIndex].track}
              </h3>
              <h5 className="player__artist">
                {data[currentIndex] && data[currentIndex].artist}
              </h5>
            </div>
          </div>
          <div className="player__images">
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
            <div className="player__mode">
              {mode === 'large' && (
                <span
                  className="player__mode-button --small"
                  onClick={() => {
                    setMode('small');
                    setTracksVisible(false);
                  }}
                >
                  <i
                    className="player__icon --small fa fa-compress"
                    aria-hidden="true"
                  ></i>
                </span>
              )}
              {mode === 'small' && (
                <span
                  className="player__mode-button --large"
                  onClick={() => {
                    setMode('large');
                    setTracksVisible(true);
                  }}
                >
                  <i
                    className="player__icon --large fa fa-expand"
                    aria-hidden="true"
                  ></i>
                </span>
              )}
            </div>
            {data.map((item, index) => (
              <div
                key={item.track}
                className={`player__image ${
                  index === currentIndex ? 'active' : ''
                }`}
                style={{
                  left: `${-(currentIndex * 100)}%`
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
        </div>
        <div className="player__main">
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
          <div className="player__scroll">
            {data.map((item, index) => (
              <div
                key={index}
                className={`player__track ${
                  index === currentIndex ? 'active' : ''
                }`}
                onClick={() => {
                  set(index);
                }}
              >
                {/*<div
                  className="player__track-image"
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
};

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

export default Player;
