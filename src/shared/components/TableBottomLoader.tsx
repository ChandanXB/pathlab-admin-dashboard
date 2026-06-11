import React from 'react';
import { Spin } from 'antd';

interface TableBottomLoaderProps {
    loading: boolean;
}

const TableBottomLoader: React.FC<TableBottomLoaderProps> = ({ loading }) => {
    if (!loading) return null;

    return (
        <div style={{ 
            textAlign: 'center', 
            background: 'transparent',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            color: '#8c8c8c'
        }}>
            <Spin size="small" /> 
            <span>Loading more records...</span>
        </div>
    );
};

export default TableBottomLoader;
