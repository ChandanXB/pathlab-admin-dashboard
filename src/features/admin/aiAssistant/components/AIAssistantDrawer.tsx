import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Drawer, Button, Input, Tooltip, Typography, Space, Divider } from 'antd';
import {
    SendOutlined,
    RobotOutlined,
    ClearOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import type { ChatMessage } from '../hooks/useAIAssistant';
import './AIAssistantDrawer.css';

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
    open: boolean;
    onClose: () => void;
    messages: ChatMessage[];
    loading: boolean;
    onSend: (msg: string) => void;
    onClear: () => void;
    quickPrompts: { label: string; text: string }[];
    context: {
        totalPatients: number;
        totalRevenue: number;
        activeTests: number;
        pendingReports: number;
    };
}

/** Very lightweight markdown renderer — handles **bold**, bullet lists */
const renderMarkdown = (text: string): React.ReactNode => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
        // Bullet line
        if (/^[-*•]\s/.test(line)) {
            const content = parseBold(line.replace(/^[-*•]\s/, ''));
            return <li key={i} style={{ marginBottom: 2 }}>{content}</li>;
        }
        // Numbered list
        if (/^\d+\.\s/.test(line)) {
            const content = parseBold(line.replace(/^\d+\.\s/, ''));
            return <li key={i} style={{ marginBottom: 2 }}>{content}</li>;
        }
        // Empty line
        if (line.trim() === '') return <br key={i} />;
        // Normal paragraph
        return <p key={i} style={{ margin: '0 0 4px' }}>{parseBold(line)}</p>;
    });
};

/** Parse **bold** markers */
const parseBold = (text: string): React.ReactNode => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
        i % 2 === 1
            ? <strong key={i}>{part}</strong>
            : part
    );
};

const AIAssistantDrawer: React.FC<Props> = ({
    open, onClose, messages, loading, onSend, onClear, quickPrompts, context
}) => {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (open) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 80);
        }
    }, [messages, loading, open]);

    const handleSend = useCallback(() => {
        if (!inputValue.trim() || loading) return;
        onSend(inputValue);
        setInputValue('');
    }, [inputValue, loading, onSend]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (date: Date) =>
        new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    return (
        <Drawer
            className="ai-drawer"
            title={
                <Space size={10} align="center">
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #722ed1, #531dab)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(114,46,209,0.5)',
                        flexShrink: 0,
                    }}>
                        <RobotOutlined style={{ color: '#fff', fontSize: 16 }} />
                    </div>
                    <div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
                            PathLab AI
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, lineHeight: 1 }}>
                            Analytics Assistant · Live Data
                        </div>
                    </div>
                </Space>
            }
            extra={
                <Tooltip title="Clear conversation">
                    <Button
                        type="text"
                        size="small"
                        icon={<ClearOutlined style={{ color: 'rgba(255,255,255,0.6)' }} />}
                        onClick={onClear}
                        style={{ border: 'none', background: 'transparent' }}
                    />
                </Tooltip>
            }
            placement="right"
            width={400}
            open={open}
            onClose={onClose}
            mask={false}
            style={{ top: 64 }}          // below header
            styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' } }}
        >
            {/* ─── Live Context Stats Strip ─────────────────────── */}
            <div className="ai-context-strip">
                <div className="ai-context-item">
                    <div className="ai-context-value">{context.totalPatients.toLocaleString('en-IN')}</div>
                    <div className="ai-context-label">Patients</div>
                </div>
                <div className="ai-context-item">
                    <div className="ai-context-value">₹{(context.totalRevenue || 0).toLocaleString('en-IN')}</div>
                    <div className="ai-context-label">Revenue</div>
                </div>
                <div className="ai-context-item">
                    <div className="ai-context-value">{context.activeTests}</div>
                    <div className="ai-context-label">Active</div>
                </div>
                <div className="ai-context-item">
                    <div className="ai-context-value" style={{ color: context.pendingReports > 5 ? '#ff7875' : '#95de64' }}>
                        {context.pendingReports}
                    </div>
                    <div className="ai-context-label">Pending</div>
                </div>
            </div>

            {/* ─── Messages Area ─────────────────────────────────── */}
            <div className="ai-messages-area">
                {messages.map((msg) => (
                    <div key={msg.id} className={`ai-message-row ${msg.role === 'user' ? 'user' : ''}`}>
                        <div className={`ai-avatar ${msg.role === 'user' ? 'user' : 'bot'}`}>
                            {msg.role === 'user' ? '👤' : '🤖'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
                            <div className={`ai-bubble ${msg.role === 'user' ? 'user' : 'bot'} ${msg.isError ? 'error' : ''}`}>
                                {renderMarkdown(msg.content)}
                            </div>
                            <div className="ai-bubble-time">{formatTime(msg.timestamp)}</div>
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                    <div className="ai-message-row">
                        <div className="ai-avatar bot">🤖</div>
                        <div className="ai-typing-bubble">
                            <div className="ai-typing-dot" />
                            <div className="ai-typing-dot" />
                            <div className="ai-typing-dot" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* ─── Quick Prompts ─────────────────────────────────── */}
            <div className="ai-quick-prompts">
                <div style={{ width: '100%', marginBottom: 6 }}>
                    <Text type="secondary" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        <ThunderboltOutlined style={{ marginRight: 4 }} />
                        Quick Prompts
                    </Text>
                </div>
                {quickPrompts.map((qp, i) => (
                    <button
                        key={i}
                        className="ai-quick-btn ant-btn"
                        disabled={loading}
                        onClick={() => { onSend(qp.text); }}
                        style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
                    >
                        {qp.label}
                    </button>
                ))}
            </div>

            <Divider style={{ margin: 0 }} />

            {/* ─── Input Area ────────────────────────────────────── */}
            <div className="ai-input-area">
                <TextArea
                    className="ai-text-input"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about orders, revenue, patients…"
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    disabled={loading}
                    style={{ flex: 1, fontSize: 13, borderRadius: 12 }}
                />
                <Tooltip title={loading ? 'AI is thinking…' : 'Send (Enter)'}>
                    <button
                        className="ai-send-btn ant-btn"
                        onClick={handleSend}
                        disabled={loading || !inputValue.trim()}
                        style={{
                            width: 38, height: 38, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #722ed1, #531dab)',
                            border: 'none', cursor: loading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(114,46,209,0.4)',
                            flexShrink: 0, transition: 'transform 0.2s, box-shadow 0.2s',
                            opacity: loading || !inputValue.trim() ? 0.5 : 1,
                        }}
                    >
                        <SendOutlined style={{ color: '#fff', fontSize: 14 }} />
                    </button>
                </Tooltip>
            </div>
        </Drawer>
    );
};

export default AIAssistantDrawer;
