const Colors = {
  light: {
    primary: {
      main: '#007AFF',
      light: '#66ADFF',
      dark: '#0051B3',
    },
    secondary: {
      main: '#FF9500',
      light: '#FFB366',
      dark: '#CC7700',
    },
    text: '#1A1A1A',
    textSecondary: '#1A1A1A99', // slightly muted
    background: '#F8F9FA',
    card: '#FFFFFF',
    border: '#E0E0E0',
    success: {
      main: '#34C759',
      light: '#8FDF9E',
      dark: '#1E7D34',
    },
    danger: {
      main: '#FF3B30',
      light: '#FF6969',
      dark: '#CC2E25',
    },
    warning: {
      main: '#FFCC00',
      light: '#FFE066',
      dark: '#B38F00',
    },
    info: {
      main: '#5AC8FA',
      light: '#9BDBFB',
      dark: '#2D9CDB',
    },
    challenges: {
      mental: '#5856D6',
      physical: '#32D74B',
      social: '#FF9500',
      emotional: '#5AC8FA',
    },
    tabBar: {
      background: '#FFFFFF',
      icon: '#8E8E93',
      selected: '#007AFF',
    },
    input: {
      background: '#FFFFFF',
      text: '#1A1A1A',
      placeholder: '#8E8E93',
    },
    gradient: {
      primary: ['#007AFF', '#0051B3'], // Example primary gradient
      secondary: ['#FF9500', '#CC7700'], // Example secondary gradient
    },
  },
  dark: {
    primary: {
      main: '#0A84FF',
      light: '#409CFF',
      dark: '#0063CC',
    },
    secondary: {
      main: '#FF9F0A',
      light: '#FFB340',
      dark: '#D67F00',
    },
    text: '#FFFFFF',
    textSecondary: '#FFFFFF99', // a muted white
    background: '#000000',
    card: '#1C1C1E',
    border: '#38383A',
    success: {
      main: '#30D158',
      light: '#5BDD7D',
      dark: '#1E7D34',
    },
    danger: {
      main: '#FF453A',
      light: '#FF6969',
      dark: '#CC2E25',
    },
    warning: {
      main: '#FFD60A',
      light: '#FFE066',
      dark: '#B38F00',
    },
    info: {
      main: '#64D2FF',
      light: '#9BDBFB',
      dark: '#2D9CDB',
    },
    challenges: {
      mental: '#7D7AFF',
      physical: '#4CD964',
      social: '#FF9F0A',
      emotional: '#64D2FF',
    },
    tabBar: {
      background: '#1C1C1E',
      icon: '#8E8E93',
      selected: '#0A84FF',
    },
    input: {
      background: '#2C2C2E',
      text: '#FFFFFF',
      placeholder: '#8E8E93',
    },
    gradient: {
      primary: ['#0A84FF', '#0063CC'],
      secondary: ['#FF9F0A', '#D67F00'],
    },
  },
} as const;

export default Colors;
