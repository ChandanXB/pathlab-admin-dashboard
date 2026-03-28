import React, { useState, useEffect, useRef } from 'react';
import {
    Button,
    Card,
    Input,
    Form
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { useAgents } from '../hooks/useAgents';
import { type CollectionAgent } from '../services/collectionAgentService';
import { useNavigate } from 'react-router-dom';
import { AgentTable, AgentFormModal } from '../components';

const CollectionAgentManager: React.FC = () => {
    const {
        agents,
        loadingAgents,
        loadingMoreAgents,
        agentPagination,
        setAgentFilters,
        createAgent,
        updateAgent,
        deleteAgent,
        loadMore,
    } = useAgents();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<CollectionAgent | null>(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();

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

    const handleDelete = async (id: number) => {
        await deleteAgent(id);
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
            // Error handled by form
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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: isMobile ? 16 : 24 }}>
            <Card
                title={isMobile ? "Agents" : "Collection Agents Management"}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
                styles={{ 
                    header: { padding: isMobile ? '8px 16px' : '16px 24px' },
                    body: { 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        minHeight: 0, 
                        overflow: 'hidden', 
                        padding: isMobile ? '16px' : '24px' 
                    } 
                }}
            >
                <div style={{ 
                    marginBottom: 16, 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between', 
                    gap: isMobile ? 12 : 16,
                    flexShrink: 0 
                }}>
                    <Input
                        placeholder="Search agents..."
                        prefix={<SearchOutlined />}
                        style={{ width: isMobile ? '100%' : 300 }}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        block={isMobile}
                    >
                        Add New Agent
                    </Button>
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
