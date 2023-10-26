import { extendTheme } from '@chakra-ui/react'

const breakpoints = {
  sm: '30em',
  md: '48em',
  lg: '62em',
  xl: '80em',
  '2xl': '96em',
  '3xl': '110em',
  '4xl': '124em',
}

export const lightTheme = extendTheme({
  initialColorMode: 'light',
  breakpoints,
  colors: {
    mainBackgroundColor: '#F5F5F5',
    containerContentBackgroundAlpha: '#ffffffdd',//'linear-gradient(125deg, rgba(234,229,255,1) 0%, rgba(251,245,255,1) 50%, rgba(234,229,255,1) 100%);',
    containerContentBackground: '#ffffff',//'linear-gradient(125deg, rgba(234,229,255,1) 0%, rgba(251,245,255,1) 50%, rgba(234,229,255,1) 100%);',
    gradient3: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(239,239,239,1) 50%, rgba(255,255,255,1) 100%)',//'linear-gradient(125deg, rgba(225,222,251,1) 0%, rgba(242,237,255,1) 50%, rgba(225,222,251,1) 100%);',
    gradient2: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(239,239,239,1) 50%, rgba(255,255,255,1) 100%)',//'linear-gradient(125deg, rgba(234,229,255,1) 0%, rgba(251,245,255,1) 50%, rgba(234,229,255,1) 100%);',
    gradient1: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(239,239,239,1) 50%, rgba(255,255,255,1) 100%)',//'linear-gradient(125deg, rgba(242,237,255,1) 0%, rgba(169,155,255,1) 50%, rgba(242,237,255,1) 100%);',
    mainBackground: '#F5F5F5',
    verticalGradient: 'linear-gradient(0deg, #100e21ff, #2a255722 60%)',
    verticalGradientTopBottom: 'linear-gradient(180deg, #100e21ff, #2a255722 60%)',
    verticalGradientGray: 'linear-gradient(0deg, rgba(51,51,51,0.2) 0%, rgba(51,51,51,0.7) 40%, rgba(51,51,51,0.7) 60%, rgba(51,51,51,0.2) 100%)',
    announcementBarBackgroundColor: "transparent",
    announcementBarBackground: 'none',//"url('/assets/landing/graphic1.webp')",
    contrastMainTextColor: '#ffffff',
    secContrastMainTextColor: '#E6E6E6',
    mainTextColor: '#18205D',
    mainTextColorLight: '#18205Daa',
    mainTextColorLight2: '#18205Ddd',
    mainTextColorAlpha: '#18205D11',
    mainTextColorLightAlpha: '#18205D88',
    // secondaryTextColor: '#333333',
    // secondaryTextColor: '#2457DF',
    secondaryTextColor: '#7448DC',
    accentTextColor: '#7448DC',
    accentTextColorAlpha: '#7448DC22',
    secAccentTextColor: '#FFC35C',
    secAccentTextColorAlpha: '#FFC35C22',
    lightAccentTextColor: '#784BA0',
    navBarBackgroundColor: '#FEFEFE',
    navBarBackground: undefined,
    navBarBorderColor: '#cccccc',
    accentChartBgColor: '#F5F5F5',
    footerBgColor: '#dcdcdc',
    barUnfilledColor: '#7448DC22',
    barFilledColor: '#7448DC',
    modalContentBg: 'white',
    primary: {
      50: '#c0c0c0',
      100: '#c3c3c3',
      150: '#c6c6c6',
      200: '#c9c9c9',
      250: '#cccccc',
      300: '#d0d0d0',
      350: '#d3d3d3',
      400: '#d6d6d6',
      450: '#d9d9d9',
      500: '#dcdcdc',
      550: '#e0e0e0',
      600: '#e3e3e3',
      650: '#e6e6e6',
      700: '#e9e9e9',
      750: '#ececec',
      800: '#f0f0f0',
      850: '#f3f3f3',
      900: '#f6f6f6',
      950: '#f9f9f9',
    },
    inverse: {
      50: '#eeedf7',
      100: '#dddbf0',
      150: '#ccc9e8',
      200: '#bbb7e0',
      250: '#aaa5d9',
      300: '#9993d1',
      350: '#8881c9',
      400: '#776fc2',
      450: '#665cba',
      500: '#564bb1',
      550: '#4d449f',
      600: '#453c8d',
      650: '#3c347b',
      700: '#332d69',
      750: '#2a2557',
      800: '#221d45',
      850: '#191633',
      900: '#100e21',
      950: '#0f0d1f',
    },
    primaryPlus: '#6200ff',
    primaryAlpha: '#5E17EB22',
    darkPrimary: '#221d45',
    darkPrimaryAlpha: '#221d4522',
    lightPrimary: '#bbb7e0',
    lightPrimaryAlpha: '#bbb7e022',
    secondary: '#49C235',
    secondaryPlus: '#00FF8A',
    secondaryAlpha: '#34E79522',
    success: '#49C235',
    successAlpha: '#49C23522',
    successLight: '#25C9A199',
    lightWarning: 'orangered',
    error: '#F44061',
    errorAlpha: '#F4406166',
    warning: '#ed8936',
    warningAlpha: '#ed893622',
    info: '#4299e1',
    infoAlpha: '#4299e122',
  },
  fonts: {
    body: 'Inter',
  },
  styles: {
    global: (props) => ({
      body: {
        fontFamily: 'Inter'
      },
    }),
  },
  components: {
    Text: {
      baseStyle: {
        color: '#18205D',
      },
    },
  },
});

export const darkTheme = extendTheme({
  breakpoints,
  colors: {
    mainBackgroundColor: '#2a2557',
    containerContentBackgroundAlpha: '#2a2557aa',
    containerContentBackground: '#2a2557',
    gradient3: 'linear-gradient(125deg, rgba(25,22,51,1) 0%, rgba(42,37,87,1) 50%, rgba(25,22,51,1) 100%)',
    gradient2: 'linear-gradient(125deg, rgba(34,29,69,1) 0%, rgba(51,45,105,1) 50%, rgba(34,29,69,1) 100%);',
    gradient1: 'linear-gradient(125deg, rgba(42,37,87,1) 0%, rgba(69,60,141,1) 50%, rgba(42,37,87,1) 100%);',
    mainBackground: 'radial-gradient(circle at center, #2a2557, #100e21 50%)',
    verticalGradient: 'linear-gradient(0deg, #100e21ff, #2a255722 60%)',
    verticalGradientTopBottom: 'linear-gradient(180deg, #100e21ff, #2a255722 60%)',
    verticalGradientGray: 'linear-gradient(0deg, rgba(51,51,51,0.2) 0%, rgba(51,51,51,0.7) 40%, rgba(51,51,51,0.7) 60%, rgba(51,51,51,0.2) 100%)',
    announcementBarBackgroundColor: "transparent",
    announcementBarBackground: "url('/assets/landing/graphic1.webp')",
    contrastMainTextColor: '#333',
    secContrastMainTextColor: '#303030',
    mainTextColor: '#ffffff',
    mainTextColorLight: '#ffffffaa',
    mainTextColorLight2: '#ffffffdd',
    mainTextColorAlpha: '#ffffff11',
    mainTextColorLightAlpha: '#ffffff88',
    secondaryTextColor: '#bbb7e0',
    accentTextColor: '#34E795',
    accentTextColorAlpha: '#34E79522',
    secAccentTextColor: '#FFC35C',
    secAccentTextColorAlpha: '#FFC35C22',
    lightAccentTextColor: '#dddbf0',
    navBarBackgroundColor: '#100e21',
    navBarBackground: '#100e21',
    navBarBorderColor: '#221d45',
    accentChartBgColor: '#221d45',
    footerBgColor: 'transparent',
    barUnfilledColor: '#100e21',
    barFilledColor: '#bbb7e0',
    modalContentBg: 'linear-gradient(125deg, rgba(34,29,69,1) 0%, rgba(51,45,105,1) 50%, rgba(34,29,69,1) 100%);',
    primary: {
      50: '#eeedf7',
      100: '#dddbf0',
      150: '#ccc9e8',
      200: '#bbb7e0',
      250: '#aaa5d9',
      300: '#9993d1',
      350: '#8881c9',
      400: '#776fc2',
      450: '#665cba',
      500: '#564bb1',
      550: '#4d449f',
      600: '#453c8d',
      650: '#3c347b',
      700: '#332d69',
      750: '#2a2557',
      800: '#221d45',
      850: '#191633',
      900: '#100e21',
      950: '#0f0d1f',
    },
    inverse: {
      50: '#eeedf7',
      100: '#dddbf0',
      150: '#ccc9e8',
      200: '#bbb7e0',
      250: '#aaa5d9',
      300: '#9993d1',
      350: '#8881c9',
      400: '#776fc2',
      450: '#665cba',
      500: '#564bb1',
      550: '#4d449f',
      600: '#453c8d',
      650: '#3c347b',
      700: '#332d69',
      750: '#2a2557',
      800: '#221d45',
      850: '#191633',
      900: '#100e21',
      950: '#0f0d1f',
    },
    primaryPlus: '#6200ff',
    primaryAlpha: '#5E17EB22',
    darkPrimary: '#221d45',
    darkPrimaryAlpha: '#221d4522',
    lightPrimary: '#bbb7e0',
    lightPrimaryAlpha: '#bbb7e022',
    secondary: '#34E795',
    secondaryPlus: '#00FF8A',
    secondaryAlpha: '#34E79522',
    success: '#25C9A1',
    successAlpha: '#25C9A122',
    successLight: '#25C9A199',
    lightWarning: '#edc536',
    error: '#F44061',
    errorAlpha: '#F4406166',
    warning: '#ed8936',
    warningAlpha: '#ed893622',
    info: '#4299e1',
    infoAlpha: '#4299e122',
  },
  fonts: {
    body: 'Inter',
  },
  styles: {
    global: (props) => ({
      body: {
        fontFamily: 'Inter'
      },
    }),
  },
  components: {
    Text: {
      baseStyle: {
        color: 'white',
      },
    },
  },
});

export const OTHER_THEME_PARAMS = {
  light: {
    ANNOUNCEMENT_BAR_BORDER: '1px solid #dddddd',
    TABS_COLOR_SCHEME: 'white',
    TABS_VARIANT: 'line',
    INPUT_BORDER: undefined,//`1px solid ${theme.colors['primary']['500']}`

    BUTTON_BG: '#18205D',
    BUTTON_BORDER_COLOR: 'primary.600',
    BUTTON_BG_COLOR: '#18205D',
    BUTTON_TEXT_COLOR: 'white',
    BUTTON_BOX_SHADOW: `0 0 1px 1px ${lightTheme.colors['primary']['500']}`,

    OUTLINE_BUTTON_BG: 'transparent',//'linear-gradient(125deg, rgb(80,80,180,1) 0%, rgb(160,160,250) 100%)',
    OUTLINE_BUTTON_BG_COLOR: '',
    OUTLINE_BUTTON_BORDER_COLOR: 'mainTextColor',
    OUTLINE_BUTTON_TEXT_COLOR: 'mainTextColor',
    OUTLINE_BUTTON_BOX_SHADOW: '',

    NAV_BUTTON_BG: 'transparent',//'linear-gradient(125deg, rgb(80,80,180,1) 0%, rgb(160,160,250) 100%)',
    NAV_BUTTON_BG_COLOR: '',
    NAV_BUTTON_BORDER_COLOR: 'mainTextColor',
    NAV_BUTTON_TEXT_COLOR: 'mainTextColor',
    NAV_BUTTON_BOX_SHADOW: '',
    CHART_COLORS: [
      '#bbb7e0',
      '#9993d1',
      '#776fc2',
      '#564bb1',
      '#453c8d',
      '#332d69',
      '#221d45',
      '#100e21',
      '#0f0d1f',
    ]
  },
  dark: {
    ANNOUNCEMENT_BAR_BORDER: '1px solid #221d45',
    TABS_COLOR_SCHEME: 'white',
    TABS_VARIANT: 'solid-rounded',
    INPUT_BORDER: `none`,

    BUTTON_BG: 'primary.500',//'linear-gradient(125deg, rgb(80,80,180,1) 0%, rgb(160,160,250) 100%)';
    BUTTON_BG_COLOR: 'primary.500',
    BUTTON_BORDER_COLOR: 'primary.500',
    BUTTON_TEXT_COLOR: 'white',
    BUTTON_BOX_SHADOW: '',

    OUTLINE_BUTTON_BG: 'primary.850',//'linear-gradient(125deg, rgb(80,80,180,1) 0%, rgb(160,160,250) 100%)',
    OUTLINE_BUTTON_BG_COLOR: 'primary.600',
    OUTLINE_BUTTON_BORDER_COLOR: 'primary.600',
    OUTLINE_BUTTON_TEXT_COLOR: 'white',
    OUTLINE_BUTTON_BOX_SHADOW: '',

    NAV_BUTTON_BG: 'primary.800',//'linear-gradient(125deg, rgb(80,80,180,1) 0%, rgb(160,160,250) 100%)',
    NAV_BUTTON_BG_COLOR: 'primary.600',
    NAV_BUTTON_BORDER_COLOR: 'primary.600',
    NAV_BUTTON_TEXT_COLOR: 'white',
    NAV_BUTTON_BOX_SHADOW: '',

    THEME_NAME: 'dark',

    CHART_COLORS: [
      '#bbb7e0',
      '#9993d1',
      '#776fc2',
      '#564bb1',
      '#453c8d',
      '#332d69',
      '#221d45',
      '#100e21',
      '#0f0d1f',
    ],
  }
}