export const colors = {
    primary: '#004aad', // Brand Blue
    secondary: '#00897b', // Teal
    accent: '#fbc02d', // Yellow/Gold
    danger: '#d32f2f', // Red
    success: '#52c41a', // Green
    warning: '#faad14', // Orange
    info: '#1890ff', // Blue

    // Neutral Colors
    white: '#ffffff',
    black: '#000000',
    background: '#f0f2f5',
    textDark: '#1a1a1a',
    textLight: '#ffffff',
    textSecondary: 'rgba(0, 0, 0, 0.45)',
    textMuted: 'rgba(255, 255, 255, 0.65)',
    textExtraMuted: 'rgba(255, 255, 255, 0.45)',

    // Admin Sidebar/Layout Colors
    sidebarBg: '#001529',
    sidebarBorder: 'rgba(255, 255, 255, 0.1)',

    // UI Elements
    borderLight: '#e2e8f0',
    cardShadow: 'rgba(0,0,0,0.02)',
    headerShadow: 'rgba(0,21,41,.08)',

    // Stat Card Backgrounds (translucent)
    stats: {
        patients: '#e6f7ff',
        tests: '#f6ffed',
        reports: '#fff1f0',
        revenue: '#fffbe6'
    },

    // Order/Status Colors
    status: {
        pending: '#fa8c16',   // Orange
        assigned: '#13c2c2',  // Cyan
        collected: '#1890ff', // Blue
        processing: '#722ed1',// Purple
        completed: '#52c41a', // Green
        cancelled: '#f5222d', // Red
    },

    // Layout Suffixes & Transparency (Alpha values for HEX)
    alpha: {
        badgeBg: '15',    // 8.2% opacity
        badgeGlow: '20',  // 12.5% opacity
        sidebarShadow: '0d', // 5% opacity
    },

    // Specific Layout Colors
    layout: {
        adminGlow: 'rgba(24, 144, 255, 0.1)',
        agentSidebarEnd: '#002140',
        agentSiderShadow: 'rgba(29, 35, 41, 0.05)',
        scrollbarThumb: 'rgba(255, 255, 255, 0.2)',
    },

    // ANC Specific Colors
    anc: {
        primary: '#eb2f96',     // Pink
        light: '#fff0f6',       // Light Pink
        gradient: ['#eb2f96', '#ff85c0'],
        trimester: '#722ed1',   // Purple
        trimesterLight: '#f9f0ff',
    },

    // UI/Borders and Accents
    ui: {
        bgLight: '#f8fafc',
        border: '#f0f0f0',
        label: '#8c8c8c',
        text: '#262626',
        cardShadow: '0 4px 15px rgba(0,0,0,0.05)',
    },

    // Chart specific colors
    charts: {
        revenue: ['#52c41a', '#95de64'], // Green gradient
        volume: ['#1890ff', '#40a9ff'],  // Blue gradient
        volumeBg: '#e6f7ff',
        text: '#8c8c8c',
        border: '#f0f0f0',
    },
    
    // Marketing/Campaign specific colors
    marketing: {
        bannerGradient: ['#2196F3', '#003366'],
        title: '#1A365D',
        subtitle: '#4A5568',
        description: '#718096',
        label: '#94A3B8',
        targetText: '#1E293B',
        couponBg: '#F8FAFC',
        couponBorder: '#E2E8F0'
    }
};

export default colors;
