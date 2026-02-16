import type { ThemeConfig } from 'antd';
import colors from '../styles/colors';

const antdTheme: ThemeConfig = {
    token: {
        colorPrimary: colors.primary,
        borderRadius: 8,
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        Button: {
            controlHeight: 40, // Fixed height to a more reasonable default
            fontWeight: 600,
        },
    },
};

export default antdTheme;
