import { createContext, useContext, useEffect, useState } from "react";

interface AudioProps {
  playing?: boolean;
  autoPlay?: boolean;
  play?: () => void;
  pause?: () => void;
  toggle?: () => void;
}

interface AudioPlayerContextProps {
  loadedAudio: { [key: string]: AudioProps; };
  loadAudio: (name: string, url: string, loop?: boolean, autoPlay?: boolean) => void;
  playAudio: (name: string) => void;
  pauseAudio: (name: string) => void;
  toggleAudio: (name: string) => void;
}

const emptyLoadedAudio: { [key: string]: AudioProps; } = {};

const AudioPlayerContext = createContext<AudioPlayerContextProps>({
  loadedAudio: emptyLoadedAudio,
  loadAudio: () => { throw new Error("AudioPlayerProvider is missing") },
  playAudio: () => {},
  pauseAudio: () => {},
  toggleAudio: () => {}
});

interface AudioPlayerProviderProps {
  children: React.ReactNode;
}

export function AudioPlayerProvider({ children }: AudioPlayerProviderProps) {
  const [loadedAudio, setLoadedAudio] = useState(emptyLoadedAudio);
  const [firstInteraction, setFirstInteraction] = useState(false);

  useEffect(() => {
    Object.values(loadedAudio).forEach(audio => {
      if (audio.autoPlay && audio.play) {
        audio.play();
      }
    });
  }, [loadedAudio, firstInteraction]);

  const loadAudio = (name: string, url: string, loop: boolean = false, autoPlay: boolean = false) => {
    if (!(name in loadedAudio)) {
      const audio: AudioProps = {};
      const player = new Audio(url);
      player.loop = loop;
      const isPlaying = () => loadedAudio[name]?.playing;
      const setPlaying = (playing: boolean) => {
        audio.playing = playing;
      };
      const play = () => {
        if (!isPlaying()) {
          try {
            player.play()
              .then(() => {
                setPlaying(true);
                audio.autoPlay = false;
                setFirstInteraction(true);
              })
              .catch(_ => {
                // Ignore errors
              });
          } catch (e) {
            // Ignore errors
          }
        }
      };
      const pause = () => {
        if (isPlaying()) {
          player.pause();
          setPlaying(false);
        }
      };
      player.addEventListener("ended", () => setPlaying(false));
      audio.playing = false;
      audio.autoPlay = autoPlay;
      audio.play = play;
      audio.pause = pause;
      audio.toggle = () => {
        if (!isPlaying()) {
          play();
        } else {
          pause();
        }
      };
      setLoadedAudio(prevLoadedAudio => ({
        ...prevLoadedAudio,
        [name]: audio
      }));
    }
  };

  const playAudio = (name: string) => {
    if (name in loadedAudio && loadedAudio[name].play) {
      loadedAudio[name].play();
    }
  };

  const pauseAudio = (name: string) => {
    if (name in loadedAudio && loadedAudio[name].pause) {
      loadedAudio[name].pause();
    }
  };

  const toggleAudio = (name: string) => {
    if (name in loadedAudio && loadedAudio[name].toggle) {
      loadedAudio[name].toggle();
    }
  };

  const value = {
    loadedAudio,
    loadAudio,
    playAudio,
    pauseAudio,
    toggleAudio
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      <div onClick={() => setFirstInteraction(true)}>
        {children}
      </div>
    </AudioPlayerContext.Provider>
  );
}

export const useAudioPlayer = () => {
  return useContext(AudioPlayerContext);
};
