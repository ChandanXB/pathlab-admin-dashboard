import React, { useEffect, useState } from 'react';
import { Table, Spin } from 'antd';
import type { TableProps } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';

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
 * It wraps the Ant Design Table and integrates it with react-infinite-scroll-component.
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
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
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

            <style>{`
                .infinite-scroll-table-wrapper .ant-table-wrapper {
                    height: 100%;
                }
                .infinite-scroll-table-wrapper .ant-spin-nested-loading {
                    height: 100%;
                }
                .infinite-scroll-table-wrapper .ant-spin-container {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .infinite-scroll-table-wrapper .ant-table {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .infinite-scroll-table-wrapper .ant-table-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .infinite-scroll-table-wrapper .ant-table-body {
                    scrollbar-width: thin;
                    scrollbar-color: #e5e7eb transparent;
                    scroll-behavior: smooth; /* Smoother scrolling */
                    padding-bottom: 20px; /* Air at the bottom */
                }
                .infinite-scroll-table-wrapper .ant-table-body::-webkit-scrollbar {
                    width: 6px;
                }
                .infinite-scroll-table-wrapper .ant-table-body::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
                /* Ensure last row doesn't feel cramped */
                .infinite-scroll-table-wrapper .ant-table-row:last-child td {
                    border-bottom: none !important;
                }
            `}</style>
        </div>
    );
};

export default InfiniteScrollTable;
