import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Layout } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import colors from '@/styles/colors';
import { useAuthStore } from '@/store/authStore';

const { Title } = Typography;

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role.name === 'COLLECTION_AGENT') {
                navigate('/agent', { replace: true });
            } else if (user.role.name === 'DOCTOR') {
                navigate('/doctor', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const result = await authService.login(values.email, values.password);
            message.success('Login successful');

            // Result is stored in Zustand, navigate based on role
            const role = result.data.user.role.name;
            if (role === 'COLLECTION_AGENT') {
                navigate('/agent');
            } else if (role === 'DOCTOR') {
                navigate('/doctor');
            } else {
                navigate('/');
            }
        } catch (error: any) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.background }}>
            <Card style={{ width: 400, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2} style={{ color: colors.primary }}>PathLab Admin</Title>
                    <Typography.Text type="secondary">Sign in to manage your laboratory</Typography.Text>
                </div>

                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your Email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block size="large">
                            Log in
                        </Button>
                    </Form.Item>
                </Form>

            </Card>
        </Layout>
    );
};

export default Login;
