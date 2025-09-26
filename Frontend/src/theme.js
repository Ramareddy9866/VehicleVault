import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#C2B280',
      contrastText: '#1A1A1A',
    },
    secondary: {
      main: '#4B4B4D',
      contrastText: '#F5F5F5',
    },
    accent: {
      main: '#A0522D',
      contrastText: '#F5F5F5',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#4B4B4D',
    },
    warning: {
      main: '#A0522D',
      contrastText: '#F5F5F5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#C2B280',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: '#C2B280',
          color: '#1A1A1A',
          '&:hover': {
            backgroundColor: '#A0522D',
            color: '#F5F5F5',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#1A1A1A',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardWarning: {
          backgroundColor: '#A0522D',
          color: '#F5F5F5',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
})

export default theme
