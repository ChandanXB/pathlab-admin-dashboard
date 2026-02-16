import React, { useState, useEffect } from 'react';
import {
    Button,
    Card,
    Input,
    Space,
    Form,
    message
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { collectionAgentService, type CollectionAgent } from '../services/collectionAgentService';
import { AgentTable, AgentFormModal } from '../components';

const CollectionAgentManager: React.FC = () => {
    const [agents, setAgents] = useState<CollectionAgent[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<CollectionAgent | null>(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const response = await collectionAgentService.getAgents({
                search: searchText
            });
            setAgents(response.data);
        } catch (error) {
            message.error('Failed to fetch collection agents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, [searchText]);

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
        try {
            await collectionAgentService.deleteAgent(id);
            message.success('Agent deleted successfully');
            fetchAgents();
        } catch (error) {
            message.error('Failed to delete agent');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingAgent) {
                await collectionAgentService.updateAgent(editingAgent.id, values);
                message.success('Agent updated successfully');
            } else {
                await collectionAgentService.createAgent(values);
                message.success('Agent created successfully');
            }
            setIsModalOpen(false);
            fetchAgents();
        } catch (error) {
            message.error('Failed to save agent');
        }
    };

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="Collection Agents Management">
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <Input
                        placeholder="Search by name, phone or email"
                        prefix={<SearchOutlined />}
                        style={{ width: 300 }}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        Add New Agent
                    </Button>
                </div>

                <AgentTable
                    agents={agents}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </Card>

            <AgentFormModal
                visible={isModalOpen}
                editingAgent={editingAgent}
                form={form}
                onOk={handleModalOk}
                onCancel={() => setIsModalOpen(false)}
            />
        </Space>
    );
};

export default CollectionAgentManager;
