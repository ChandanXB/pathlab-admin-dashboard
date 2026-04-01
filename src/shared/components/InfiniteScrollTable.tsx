import React, { useEffect, useState } from 'react';
import { Table, Spin } from 'antd';
import type { TableProps } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import '@/styles/shared/InfiniteScrollTable.css';

interface InfiniteScrollTableProps<T> extends Omit<TableProps<T>, 'pagination'> {
    hasMore: boolean;
    next: () => void;
    loadingMore?: boolean;
    endMessage?: React.ReactNode;
    scrollParentId?: string;
    height?: number | string;
}

/**
 * A reusable Ant Design Table component with Infinite Scroll capabilities.
 * It wraps the Ant Design Table and integrates it with react-infinite-scroll-components.
 */
const InfiniteScrollTable = <T extends object>({
    hasMore,
    next,
    loading,
    loadingMore,
    dataSource = [],
    scroll,
    endMessage,
    height,
    ...props
}: InfiniteScrollTableProps<T>) => {
    const [scrollTarget, setScrollTarget] = useState<HTMLElement | null>(null);

    // We need to find the Ant Design table body to attach the scroll listener correctly
    // if we want to keep the fixed header feature of Antd Table.
    useEffect(() => {
        const findTableBody = () => {
            const body = document.querySelector('.infinite-scroll-table-wrapper .ant-table-body') as HTMLElement;
            if (body) {
                setScrollTarget(body);
            }
        };

        // Delay slightly to ensure Antd has rendered the table internal structure
        const timeout = setTimeout(findTableBody, 100);
        return () => clearTimeout(timeout);
    }, [dataSource]);

    const loader = (
        <div style={{ textAlign: 'center', padding: '10px' }}>
            <Spin size="small" /> Loading more...
        </div>
    );

    return (
        <div
            className="infinite-scroll-table-wrapper"
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
            <Table
                {...props}
                dataSource={dataSource}
                pagination={false}
                sticky
                scroll={scroll}
                loading={loading && dataSource.length === 0}
            />

            {scrollTarget && (
                <InfiniteScroll
                    dataLength={dataSource.length}
                    next={next}
                    hasMore={hasMore && !loadingMore} // Prevents double triggers
                    loader={null}
                    scrollableTarget={scrollTarget as any}
                    scrollThreshold={0.9}
                >
                    <div />
                </InfiniteScroll>
            )}

            {/* Manual indicators for smoother UI */}
            <div style={{ flexShrink: 0 }}>
                {loadingMore && loader}
            </div>
        </div>
    );
};

export default InfiniteScrollTable;
