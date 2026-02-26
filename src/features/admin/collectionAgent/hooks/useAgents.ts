import { useState, useEffect } from 'react';
import { message } from 'antd';
import { collectionAgentService, type CollectionAgent, type CollectionAgentFormData } from '../services/collectionAgentService';

export const useAgents = (enabled: boolean = true) => {
    const [agents, setAgents] = useState<CollectionAgent[]>([]);
    const [loadingAgents, setLoadingAgents] = useState(false);
    const [loadingMoreAgents, setLoadingMoreAgents] = useState(false);
    const [agentPagination, setAgentPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
        hasMore: true,
    });
    const [agentFilters, setAgentFilters] = useState<any>({
        page: 1,
        limit: 20,
        search: '',
    });

    const fetchAgents = async (resetData = false) => {
        if (resetData) {
            setLoadingAgents(true);
            setAgents([]);
        } else {
            setLoadingMoreAgents(true);
        }

        try {
            const response = await collectionAgentService.getAgents(agentFilters);

            const data = Array.isArray(response) ? response : response.data || [];

            if (resetData || agentFilters.page === 1) {
                setAgents(data);
            } else {
                setAgents((prev) => [...prev, ...data]);
            }

            const pagination = response.meta || response.pagination;
            if (pagination) {
                setAgentPagination({
                    current: pagination.page,
                    pageSize: pagination.limit,
                    total: pagination.total,
                    hasMore: pagination.page < pagination.totalPages,
                });
            } else {
                setAgentPagination(prev => ({ ...prev, hasMore: false }));
            }
        } catch (error: any) {
            message.error('Failed to fetch agents');
        } finally {
            setLoadingAgents(false);
            setLoadingMoreAgents(false);
        }
    };

    const createAgent = async (values: CollectionAgentFormData) => {
        try {
            await collectionAgentService.createAgent(values);
            message.success('Agent created successfully');
            setAgentFilters((prev: any) => ({ ...prev, page: 1 }));
            return true;
        } catch (error: any) {
            return false;
        }
    };

    const updateAgent = async (id: number, values: Partial<CollectionAgentFormData>) => {
        try {
            await collectionAgentService.updateAgent(id, values);
            message.success('Agent updated successfully');
            setAgentFilters((prev: any) => ({ ...prev, page: 1 }));
            return true;
        } catch (error: any) {
            return false;
        }
    };

    const deleteAgent = async (id: number) => {
        try {
            await collectionAgentService.deleteAgent(id);
            message.success('Agent deleted successfully');
            setAgentFilters((prev: any) => ({ ...prev, page: 1 }));
            return true;
        } catch (error: any) {
            return false;
        }
    };

    const loadMore = () => {
        if (agentPagination.hasMore && !loadingMoreAgents) {
            setAgentFilters((prev: any) => ({ ...prev, page: (prev.page || 1) + 1 }));
        }
    };

    useEffect(() => {
        if (!enabled) return;
        const shouldReset = agentFilters.page === 1;
        fetchAgents(shouldReset);
    }, [agentFilters]);

    return {
        agents,
        loadingAgents,
        loadingMoreAgents,
        agentPagination,
        agentFilters,
        setAgentFilters,
        createAgent,
        updateAgent,
        deleteAgent,
        loadMore,
    };
};
