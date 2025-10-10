// 환경/배경 프리셋 타입 및 데이터 정의

export type EnvironmentType =
  | 'forest'
  | 'dungeon'
  | 'cave'
  | 'castle'
  | 'town'
  | 'desert'
  | 'mountain'
  | 'ocean'
  | 'sky';

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export type Weather = 'clear' | 'rain' | 'snow' | 'fog' | 'storm' | 'cloudy';

export type Perspective = 'side-scroll' | 'top-down' | 'isometric' | '3/4-view';

export type Mood =
  | 'peaceful'
  | 'mysterious'
  | 'dark'
  | 'bright'
  | 'epic'
  | 'gloomy';

export interface EnvironmentLayers {
  foreground: boolean;
  midground: boolean;
  background: boolean;
  parallax: boolean; // 시차 효과
}

export interface EnvironmentPreset {
  assetType: 'background' | 'tileset';

  environment: EnvironmentType;

  // 시간/날씨
  timeOfDay: TimeOfDay;
  weather: Weather;

  // 레이어
  layers: EnvironmentLayers;

  // 스타일
  perspective: Perspective;
  tileability: boolean; // 타일링 가능 여부

  // 분위기
  mood: Mood;

  // 색상 (선택적)
  dominantColor?: string;
  accentColor?: string;
}

// 기본값
export const DEFAULT_ENVIRONMENT_PRESET: EnvironmentPreset = {
  assetType: 'background',
  environment: 'forest',
  timeOfDay: 'day',
  weather: 'clear',
  layers: {
    foreground: true,
    midground: true,
    background: true,
    parallax: false,
  },
  perspective: 'side-scroll',
  tileability: false,
  mood: 'peaceful',
  dominantColor: '#4A7C59',
  accentColor: '#87CEEB',
};

// 선택 옵션 라벨 매핑
export const ENVIRONMENT_TYPE_OPTIONS: Record<EnvironmentType, string> = {
  forest: '숲',
  dungeon: '던전',
  cave: '동굴',
  castle: '성',
  town: '마을',
  desert: '사막',
  mountain: '산',
  ocean: '바다',
  sky: '하늘',
};

export const TIME_OF_DAY_OPTIONS: Record<TimeOfDay, string> = {
  dawn: '새벽',
  day: '낮',
  dusk: '석양',
  night: '밤',
};

export const WEATHER_OPTIONS: Record<Weather, string> = {
  clear: '맑음',
  rain: '비',
  snow: '눈',
  fog: '안개',
  storm: '폭풍',
  cloudy: '흐림',
};

export const PERSPECTIVE_OPTIONS: Record<Perspective, string> = {
  'side-scroll': '사이드 스크롤',
  'top-down': '탑다운',
  isometric: '아이소메트릭',
  '3/4-view': '3/4 뷰',
};

export const MOOD_OPTIONS: Record<Mood, string> = {
  peaceful: '평화로운',
  mysterious: '신비로운',
  dark: '어두운',
  bright: '밝은',
  epic: '웅장한',
  gloomy: '음울한',
};

// 환경별 추천 색상
export const ENVIRONMENT_COLOR_MAP: Record<
  EnvironmentType,
  { dominant: string; accent: string }
> = {
  forest: { dominant: '#4A7C59', accent: '#87CEEB' },
  dungeon: { dominant: '#2C2C2C', accent: '#8B4513' },
  cave: { dominant: '#4A4A4A', accent: '#6495ED' },
  castle: { dominant: '#808080', accent: '#FFD700' },
  town: { dominant: '#8B7355', accent: '#F0E68C' },
  desert: { dominant: '#EDC9AF', accent: '#FF4500' },
  mountain: { dominant: '#778899', accent: '#FFFFFF' },
  ocean: { dominant: '#4682B4', accent: '#00CED1' },
  sky: { dominant: '#87CEEB', accent: '#FFA500' },
};
