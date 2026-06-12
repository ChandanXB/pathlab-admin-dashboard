import React, { useEffect, useRef } from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import '@/styles/shared/InfiniteScrollTable.css';
import TableBottomLoader from './TableBottomLoader';

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
 * It manually attaches a scroll listener to the Antd table body to reliably
 * trigger the `next` function when the user scrolls to the bottom.
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
    const tableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tableNode = tableRef.current;
        if (!tableNode) return;

        let scrollTarget: HTMLElement | null = null;

        const handleScroll = (e: Event) => {
            if (loading || loadingMore || !hasMore) return;
            const target = e.target as HTMLElement;
            // Trigger when within 50px of the bottom
            if (target.scrollHeight - target.scrollTop <= target.clientHeight + 50) {
                next();
            }
        };

        const attachListener = () => {
            const body = tableNode.querySelector('.ant-table-body') as HTMLElement;
            if (body && body !== scrollTarget) {
                if (scrollTarget) {
                    scrollTarget.removeEventListener('scroll', handleScroll);
                }
                scrollTarget = body;
                scrollTarget.addEventListener('scroll', handleScroll);
                
                // If initial data doesn't fill the container, trigger next immediately
                if (hasMore && !loadingMore && scrollTarget.scrollHeight <= scrollTarget.clientHeight) {
                    next();
                }
            }
        };

        // Delay slightly to ensure Antd has rendered the table internal structure
        const timeout = setTimeout(attachListener, 100);

        // Re-attach if DOM changes
        const observer = new MutationObserver(attachListener);
        observer.observe(tableNode, { childList: true, subtree: true });

        return () => {
            clearTimeout(timeout);
            observer.disconnect();
            if (scrollTarget) {
                scrollTarget.removeEventListener('scroll', handleScroll);
            }
        };
    }, [hasMore, loading, loadingMore, next, dataSource]);

    return (
        <div
            ref={tableRef}
            className="infinite-scroll-table-wrapper"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}
        >
            <Table
                {...props}
                dataSource={dataSource}
                pagination={false}
                sticky
                scroll={scroll}
                loading={loading && dataSource.length === 0}
            />

            {/* Floating Loading Indicator */}
            {loadingMore && (
                <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 100,
                    background: '#fff',
                    padding: '8px 24px',
                    borderRadius: '24px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: '1px solid #f0f0f0'
                }}>
                    <TableBottomLoader loading={true} />
                </div>
            )}
            
            {/* End Message */}
            {!hasMore && dataSource.length > 0 && endMessage && (
                <div style={{ textAlign: 'center', padding: '16px', color: '#888' }}>
                    {endMessage}
                </div>
            )}
        </div>
    );
};

export default InfiniteScrollTable;

