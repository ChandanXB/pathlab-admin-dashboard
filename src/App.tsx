import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ConfigProvider as AntdConfigProvider } from 'antd';
import CssBaseline from '@mui/material/CssBaseline';
import muiTheme from '@/styles/muiTheme';
import antdTheme from '@/config/antdConfig';
import { NotificationProvider } from '@/shared/contexts/NotificationContext';
import { AppRouter } from '@/router';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <AntdConfigProvider theme={antdTheme}>
        <NotificationProvider>
          <Toaster position="top-right" reverseOrder={false} />
          <CssBaseline />
          <AppRouter />
        </NotificationProvider>
      </AntdConfigProvider>
    </MuiThemeProvider>
  );
}

export default App;
