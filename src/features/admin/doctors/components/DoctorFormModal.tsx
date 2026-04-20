import { Form, Input, Select, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { Doctor } from '../types/doctor.types';
import SharedModal from '@/shared/components/SharedModal';
import { ACCOUNT_STATUSES } from '@/shared/constants/app.constants';

const { Option } = Select;

interface DoctorFormModalProps {
    visible: boolean;
    editingDoctor: Doctor | null;
    form: any;
    onOk: () => void;
    onCancel: () => void;
}

const DoctorFormModal: React.FC<DoctorFormModalProps> = ({
    visible,
    editingDoctor,
    form,
    onOk,
    onCancel,
}) => {
    const fee = Form.useWatch('consultation_fee', form) || 0;
    const rate = Form.useWatch('commission_rate', form) || 30;

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileUpload = async (file: File) => {
        try {
            const base64 = await fileToBase64(file);
            form.setFieldsValue({ profile_image: base64 });
            return false;
        } catch (error) {
            message.error('Failed to process image');
            return Upload.LIST_IGNORE;
        }
    };

    return (
        <SharedModal
            title={editingDoctor ? "Edit Doctor" : "Onboard New Doctor"}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            okText={editingDoctor ? "Update" : "Onboard"}
            width={850}
            centered={true}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ status: 'active' }}
            >
                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                    <Form.Item 
                        name="profile_image" 
                        label="Profile Photo" 
                        style={{ margin: 0 }}
                        getValueFromEvent={() => {
                            // AntD Upload throws an event, we ignore it and return the string we set manually
                            return form.getFieldValue('profile_image');
                        }}
                    >
                        <Upload
                            maxCount={1}
                            beforeUpload={handleFileUpload}
                            accept="image/*"
                            showUploadList={false}
                            listType="picture-card"
                            style={{ width: '100px', height: '100px' }}
                        >
                            {form.getFieldValue('profile_image') ? (
                                <img src={form.getFieldValue('profile_image')} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                            ) : (
                                <div><UploadOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
                            )}
                        </Upload>
                    </Form.Item>

                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0 16px' }}>
                        <Form.Item
                            name="name"
                            label="Full Name"
                            rules={[{ required: true, message: 'Please enter doctor name' }]}
                        >
                            <Input placeholder="Dr. John Doe" />
                        </Form.Item>

                        <Form.Item
                            name="specialty"
                            label="Specialty"
                            rules={[{ required: true, message: 'Please enter specialty' }]}
                        >
                            <Input placeholder="e.g. Cardiologist" />
                        </Form.Item>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0 16px' }}>
                    <Form.Item
                        name="status"
                        label="Status"
                    >
                        <Select>
                            {ACCOUNT_STATUSES.map(as => (
                                <Option key={as.value} value={as.value}>{as.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[{ required: true, message: 'Please enter phone number' }]}
                        getValueFromEvent={(e) => {
                            let val = e.target.value.replace(/[^\d+]/g, '');
                            if (val.startsWith('+91')) return val.slice(0, 13);
                            if (val.startsWith('91')) return val.slice(0, 12);
                            return val.slice(0, 10);
                        }}
                    >
                        <Input placeholder="9999999999" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email Address (Login ID)"
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Invalid email' }
                        ]}
                    >
                        <Input type="email" placeholder="doctor@example.com" />
                    </Form.Item>

                    <Form.Item
                        name="experience_years"
                        label="Experience (Years)"
                    >
                        <Input type="number" placeholder="e.g. 10" />
                    </Form.Item>

                    <Form.Item
                        name="consultation_fee"
                        label="Consultation Fee (₹)"
                        rules={[{ required: true, message: 'Please enter fee' }]}
                    >
                        <Input type="number" prefix="₹" placeholder="500" />
                    </Form.Item>

                    <Form.Item
                        name="commission_rate"
                        label="Lab Commission (%)"
                        initialValue={30}
                        rules={[{ required: true, message: 'Please enter commission rate' }]}
                    >
                        <Input type="number" suffix="%" placeholder="30" />
                    </Form.Item>
                </div>

                <div style={{ 
                    marginBottom: 24, 
                    padding: '12px 16px', 
                    background: '#f8fafc', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ color: '#64748b', fontSize: '13px' }}>
                        Revenue Distribution Preview:
                    </div>
                    <div style={{ display: 'flex', gap: 24 }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Doctor Receives</div>
                            <div style={{ fontWeight: 700, color: '#10b981' }}>
                                ₹{(fee * (1 - rate / 100)).toFixed(2)}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Lab Gains</div>
                            <div style={{ fontWeight: 700, color: '#004aad' }}>
                                ₹{(fee * (rate / 100)).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: editingDoctor ? '1fr' : '2fr 1fr', gap: '0 16px' }}>
                    <Form.Item
                        name="address"
                        label="Clinic Address"
                        rules={[{ required: true, message: 'Please enter address' }]}
                    >
                        <Input placeholder="Clinic or Hospital Address" />
                    </Form.Item>

                    {!editingDoctor && (
                        <Form.Item
                            name="password"
                            label="Login Password"
                            rules={[{ required: true, message: 'Please set a login password' }]}
                        >
                            <Input.Password placeholder="Default password for first login" />
                        </Form.Item>
                    )}
                </div>

                <Form.Item
                    name="bio"
                    label="About Doctor"
                >
                    <Input.TextArea rows={3} placeholder="Brief description about the doctor..." />
                </Form.Item>
            </Form>
        </SharedModal>
    );
};

export default DoctorFormModal;
