import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Button,
    Card,
    Input,
    Space,
    Form,
    message,
    Typography
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    TeamOutlined
} from '@ant-design/icons';
import colors from '@/styles/colors';
import { useAgents } from '../hooks/useAgents';
import { type CollectionAgent } from '../services/collectionAgentService';
import { useNavigate } from 'react-router-dom';
import { AgentTable, AgentFormModal } from '../components';
import SelectionToolbar from '@/shared/components/SelectionToolbar';

const { Title, Text } = Typography;

const CollectionAgentManager: React.FC = () => {
    const {
        agents,
        loadingAgents,
        loadingMoreAgents,
        agentPagination,
        agentFilters,
        setAgentFilters,
        createAgent,
        updateAgent,
        deleteAgent,
        bulkDeleteAgents,
        loadMore,
    } = useAgents();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<CollectionAgent | null>(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedAgents, setSelectedAgents] = useState<CollectionAgent[]>([]);

    const clearSelection = useCallback(() => {
        setSelectedRowKeys([]);
        setSelectedAgents([]);
    }, []);

    // Reset selection when filters change
    useEffect(() => {
        clearSelection();
    }, [agentFilters?.search, clearSelection]);



    const handleSearch = (value: string) => {
        setAgentFilters((prev: any) => ({ ...prev, search: value, page: 1 }));
    };

    const handleAdd = () => {
        setEditingAgent(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (agent: CollectionAgent) => {
        setEditingAgent(agent);
        form.setFieldsValue(agent);
        setIsModalOpen(true);
    };

    const handleEditSelected = () => {
        if (selectedAgents.length === 1) {
            handleEdit(selectedAgents[0]);
        }
    };

    const handleDelete = async (id: number) => {
        await deleteAgent(id);
    };

    const handleDeleteSelected = async () => {
        const total = selectedRowKeys.length;
        const hide = message.loading(`Deleting ${total} selected agent(s)...`, 0);
        try {
            const ids = selectedRowKeys.map(Number);
            const success = await bulkDeleteAgents(ids);
            if (success) {
                message.success(`Successfully deleted ${total} selected agent(s)`);
                clearSelection();
            } else {
                message.error('Failed to delete selected agents');
            }
        } catch (err: any) {
            message.error('Bulk delete failed: ' + err.message);
        } finally {
            hide();
        }
    };

    const handleRowClick = (agent: CollectionAgent) => {
        navigate(`/collection-agents/${agent.id}`);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            let success = false;
            if (editingAgent) {
                success = await updateAgent(editingAgent.id, values);
            } else {
                success = await createAgent(values);
            }
            if (success) setIsModalOpen(false);
        } catch (error) {
            // Validation error handled by form
        }
    };

    const [screenSize, setScreenSize] = useState(window.innerWidth);
    const isMobile = screenSize < 768;

    useEffect(() => {
        const handleResize = () => setScreenSize(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [tableHeight, setTableHeight] = useState(400);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === containerRef.current) {
                    setTableHeight(Math.max(200, entry.contentRect.height - 55));
                }
            }
        });
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
            {/* Page Header */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: isMobile ? '16px' : '0',
                flexShrink: 0
            }}>
                <Space align="center" size="middle">
                    <div style={{
                        background: colors.info,
                        padding: isMobile ? '8px' : '10px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <TeamOutlined style={{ fontSize: isMobile ? '20px' : '24px', color: colors.white }} />
                    </div>
                    <div>
                        <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>Collection Agents</Title>
                        {!isMobile && <Text type="secondary">Manage field collection agents and assignments</Text>}
                    </div>
                </Space>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    size={isMobile ? 'middle' : 'large'}
                    block={isMobile}
                >
                    Add New Agent
                </Button>
            </div>

            {/* Main Card */}
            <Card
                styles={{
                    body: {
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        padding: isMobile ? '16px' : '24px'
                    }
                }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
                {/* Toolbar area — fixed height so table never shifts */}
                <div style={{ flexShrink: 0 }}>
                    {selectedRowKeys.length > 0 ? (
                        <SelectionToolbar
                            count={selectedRowKeys.length}
                            itemName="agent"
                            onDeselect={clearSelection}
                            onEdit={handleEditSelected}
                            onDelete={handleDeleteSelected}
                            editDisabled={selectedRowKeys.length !== 1}
                        />
                    ) : (
                        <div style={{ marginBottom: 16 }}>
                            <Input
                                placeholder="Search agents..."
                                prefix={<SearchOutlined />}
                                style={{ width: isMobile ? '100%' : 350 }}
                                allowClear
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }}>
                    <AgentTable
                        agents={agents}
                        loading={loadingAgents}
                        loadingMore={loadingMoreAgents}
                        hasMore={agentPagination.hasMore}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onRowClick={handleRowClick}
                        onLoadMore={loadMore}
                        selectedRowKeys={selectedRowKeys}
                        onSelectionChange={(keys, rows) => {
                            setSelectedRowKeys(keys);
                            setSelectedAgents(rows as CollectionAgent[]);
                        }}
                        scroll={{ x: isMobile ? 'max-content' : undefined, y: tableHeight }}
                    />
                </div>
            </Card>

            <AgentFormModal
                visible={isModalOpen}
                editingAgent={editingAgent}
                form={form}
                onOk={handleModalOk}
                onCancel={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default CollectionAgentManager;
