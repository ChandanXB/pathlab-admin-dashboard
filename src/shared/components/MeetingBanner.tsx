import React, { useEffect, useState } from 'react';
import { Alert, Typography, Button } from 'antd';
import { VideoCameraOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const MeetingBanner: React.FC = () => {
    const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        const eventSource = new EventSource(`${baseUrl}/appointments/upcoming-stream?token=${token}`);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (Array.isArray(data)) {
                    setUpcomingAppointments(data);
                }
            } catch (err) {
                console.error('Failed to parse SSE data:', err);
            }
        };

        eventSource.onerror = (err) => {
            console.error('EventSource failed:', err);
        };

        return () => {
            eventSource.close();
        };
    }, []);

    // Also run a local interval to update the countdown exactly
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Filter appointments that are literally within 30 minutes from NOW
    // (We also include already started but not yet marked 'completed', perhaps within the last 60 mins)
    const activeAlerts = upcomingAppointments.filter(apt => {
        try {
            // Robust parsing for "08:10 PM" regardless of browser
            const timeMatch = apt.appointment_time?.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (!timeMatch) return false;
            
            let [_, h, m, ampm] = timeMatch;
            let hours = parseInt(h);
            if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
            
            const aptTime = new Date(apt.appointment_date);
            aptTime.setHours(hours, parseInt(m), 0, 0);
            
            const diffMs = aptTime.getTime() - currentTime.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            
            // Show alert if meeting is in 30 mins or less, or started up to 60 mins ago
            return diffMins <= 30 && diffMins > -60;
        } catch (err) {
            console.error(err);
            return false;
        }
    });

    if (activeAlerts.length === 0) return null;

    return (
        <div style={{ padding: '12px 24px', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0' }}>
            {activeAlerts.map(apt => {
                const timeMatch = apt.appointment_time?.match(/(\d+):(\d+)\s*(AM|PM)/i);
                let diffMins = 0;
                
                if (timeMatch) {
                    let [_, h, m, ampm] = timeMatch;
                    let hours = parseInt(h);
                    if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
                    if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
                    
                    const aptTime = new Date(apt.appointment_date);
                    aptTime.setHours(hours, parseInt(m), 0, 0);
                    diffMins = Math.floor((aptTime.getTime() - currentTime.getTime()) / 60000);
                }
                
                let messageStr = '';
                if (diffMins > 0) {
                    messageStr = `Meeting with ${apt.patient?.full_name || apt.doctor?.name} starts in ${diffMins} minute(s).`;
                } else if (diffMins === 0) {
                    messageStr = `Meeting with ${apt.patient?.full_name || apt.doctor?.name} is starting now!`;
                } else {
                    messageStr = `Meeting with ${apt.patient?.full_name || apt.doctor?.name} started ${Math.abs(diffMins)} minute(s) ago.`;
                }

                return (
                    <Alert
                        key={apt.id}
                        message={<Text strong>{messageStr}</Text>}
                        description="Please be prepared for your consultation."
                        type="warning"
                        showIcon
                        icon={<VideoCameraOutlined />}
                        style={{ marginBottom: 8, border: '1px solid #ffe58f', backgroundColor: '#fffbe6' }}
                        action={
                            <Button size="small" type="primary" onClick={() => navigate('/doctor/patients')}>
                                View Details
                            </Button>
                        }
                    />
                );
            })}
        </div>
    );
};

export default MeetingBanner;
