import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { useAuthStore } from '@/store/authStore';
import { agentOrderService } from '../services/agentOrderService';
import type { AgentOrder, AgentProfile } from '../services/agentOrderService';

export const useAgentOrders = () => {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<AgentOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<AgentProfile | null>(null);

    const agentId = user?.agentId;

    const fetchOrders = useCallback(async () => {
        if (!agentId) return;
        setLoading(true);
        try {
            const response = await agentOrderService.getMyOrders(agentId);
            setOrders(response.data || []);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    }, [agentId]);

    const fetchProfile = useCallback(async () => {
        if (!agentId) return;
        try {
            const data = await agentOrderService.getAgentProfile(agentId);
            setProfile(data);
        } catch (error) {
            console.error('Failed to fetch profile', error);
        }
    }, [agentId]);

    useEffect(() => {
        fetchOrders();
        fetchProfile();
    }, [fetchOrders, fetchProfile]);

    // --- Derived Stats ---
    const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
    const pendingOrders = orders.filter(o => o.assignment_status === 'pending');
    const acceptedOrders = orders.filter(o => o.assignment_status === 'accepted' || o.assignment_status === 'picking_up' || o.assignment_status === 'reached');
    const collectedOrders = orders.filter(o => o.assignment_status === 'collected' || o.status === 'collected');
    const completedOrders = orders.filter(o => o.status === 'completed');

    const todayOrders = orders.filter(o => {
        const today = new Date().toDateString();
        return new Date(o.createdAt).toDateString() === today;
    });

    const stats = {
        totalAssigned: orders.length,
        pendingPickups: pendingOrders.length,
        activePickups: acceptedOrders.length,
        collectedToday: todayOrders.filter(o => o.status === 'collected' || o.assignment_status === 'collected').length,
        completedTotal: completedOrders.length,
    };

    // --- Actions ---
    const acceptPickup = async (orderId: number) => {
        try {
            await agentOrderService.updateAssignmentStatus(orderId, 'accepted');
            message.success('Pickup accepted!');
            fetchOrders();
        } catch (error) {
            message.error('Failed to accept pickup');
        }
    };

    const startPickup = async (orderId: number) => {
        try {
            await agentOrderService.updateAssignmentStatus(orderId, 'picking_up');
            message.success('On the way to pickup!');
            fetchOrders();
        } catch (error) {
            message.error('Failed to start pickup');
        }
    };

    const markReached = async (orderId: number) => {
        try {
            await agentOrderService.updateAssignmentStatus(orderId, 'reached');
            message.success('Timestamp recorded: You have reached!');
            fetchOrders();
        } catch (error) {
            message.error('Failed to record arrival');
        }
    };

    const markCollected = async (orderId: number, proofData?: {
        samplePhoto: string;
        paymentMode: 'cash' | 'upi';
        paymentProof?: string;
        amountPaid?: number;
    }) => {
        try {
            if (proofData) {
                await agentOrderService.uploadCollectionProof(orderId, proofData);
            } else {
                await agentOrderService.updateOrderStatus(orderId, 'completed');
                await agentOrderService.updateAssignmentStatus(orderId, 'collected');
            }
            message.success('Sample marked as collected!');
            fetchOrders();
        } catch (error) {
            message.error('Failed to mark as collected');
        }
    };

    const claimBroadcastedOrder = async (orderId: number) => {
        try {
            await agentOrderService.acceptOrder(orderId);
            message.success('Great! Order claimed successfully.');
            fetchOrders();
            return true;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to claim order';
            message.error(errorMsg);
            fetchOrders(); // Refresh to show updated status
            return false;
        }
    };

    return {
        orders,
        activeOrders,
        pendingOrders,
        acceptedOrders,
        collectedOrders,
        completedOrders,
        todayOrders,
        loading,
        stats,
        profile,
        acceptPickup,
        claimBroadcastedOrder,
        startPickup,
        markReached,
        markCollected,
        refresh: fetchOrders,
    };
};
