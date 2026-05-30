import { useState, useCallback, useRef } from 'react';
import { aiAssistantService, type AIContext } from '../services/aiAssistantService';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isError?: boolean;
}

const QUICK_PROMPTS = [
    { label: '📦 Order Summary', text: 'Give me a complete summary of all orders and their current statuses.' },
    { label: '💰 Revenue Insights', text: 'Analyze my revenue — today vs yesterday, and overall trends.' },
    { label: '👥 Patient Growth', text: 'How many patients do I have? Give me insights on patient count.' },
    { label: '🏥 Doctors', text: 'List all doctors in our network with their specialties and contact details.' },
    { label: '🚴 Collection Agents', text: 'Show me all collection agents and their current pending pickups.' },
    { label: '⚠️ Needs Attention', text: 'Which orders need immediate attention or action?' },
    { label: '📊 Completion Rate', text: 'What is my order completion rate and how can I improve operations?' },
    { label: '🔍 Pending Backlog', text: 'How many orders are pending or processing? What should I do?' },
];

const GREETING: ChatMessage = {
    id: 'greeting',
    role: 'assistant',
    content: `👋 Hello! I'm **PathLab AI**, your intelligent analytics assistant.\n\nI have access to your **live dashboard data** — orders, revenue, patients, and more. Ask me anything or use the quick prompts below!\n\n_Try: "How are my orders doing today?"_`,
    timestamp: new Date(),
};

export const useAIAssistant = (context: AIContext) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
    const [loading, setLoading] = useState(false);
    const abortRef = useRef(false);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || loading) return;

        const userMsg: ChatMessage = {
            id: `u-${Date.now()}`,
            role: 'user',
            content: text.trim(),
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);
        abortRef.current = false;

        try {
            const reply = await aiAssistantService.analyze(text.trim(), context);
            if (abortRef.current) return;

            const assistantMsg: ChatMessage = {
                id: `a-${Date.now()}`,
                role: 'assistant',
                content: reply,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (err: any) {
            if (abortRef.current) return;
            const errorMsg: ChatMessage = {
                id: `e-${Date.now()}`,
                role: 'assistant',
                content: `❌ **Error:** ${err.message || 'Something went wrong. Please try again.'}`,
                timestamp: new Date(),
                isError: true,
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            if (!abortRef.current) setLoading(false);
        }
    }, [context, loading]);

    const clearChat = useCallback(() => {
        abortRef.current = true;
        setLoading(false);
        setMessages([GREETING]);
    }, []);

    const openDrawer = useCallback(() => setIsOpen(true), []);
    const closeDrawer = useCallback(() => {
        abortRef.current = true;
        setIsOpen(false);
    }, []);

    return {
        isOpen,
        openDrawer,
        closeDrawer,
        messages,
        loading,
        sendMessage,
        clearChat,
        quickPrompts: QUICK_PROMPTS,
    };
};
