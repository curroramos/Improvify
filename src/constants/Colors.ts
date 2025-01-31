// constants/Colors.ts

export interface ColorScheme {
  primary: {
    main: string;
    light: string;
    dark: string;
  };
  secondary: {
    main: string;
    light: string;
    dark: string;
  };
  text: string;
  textSecondary: string;  // Add this
  background: string;
  card: string;
  border: string;
  success: {
    main: string;
    light: string;
    dark: string;
  };
  danger: {
    main: string;
    light: string;
    dark: string;
  };
  warning: {
    main: string;
    light: string;
    dark: string;
  };
  info: {
    main: string;
    light: string;
    dark: string;
  };
  challenges: {
    mental: string;
    physical: string;
    social: string;
    emotional: string;
  };
  tabBar: {
    background: string;
    icon: string;
    selected: string;
  };
  input: {
    background: string;
    text: string;
    placeholder: string;
  };
}

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
  },
} as const;

export default Colors;
