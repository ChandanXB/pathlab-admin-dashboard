import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Button, Form, Breadcrumb, Space, message, Input } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { couponService } from '../services/couponService';
import type { Coupon } from '../types/coupon.types';
import CouponTable from '../components/CouponTable';
import CouponFormModal from '../components/CouponFormModal';
import axiosInstance from '@/config/apiClient';
import { debounce } from '@/shared/utils/debounce';

const CouponManager: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [form] = Form.useForm();

  // For applicability selection
  const [tests, setTests] = useState([]);
  const [packages, setPackages] = useState([]);

  const fetchCoupons = useCallback(async (currentPage: number, search: string, isLoadMore: boolean = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await couponService.getAllCoupons({ 
        search: search,
        page: currentPage,
        limit: 15
      });
      
      const newCoupons = response.data || [];
      const total = response.meta?.total || 0;
      
      if (isLoadMore) {
        setCoupons(prev => [...prev, ...newCoupons]);
      } else {
        setCoupons(newCoupons);
      }
      
      setHasMore(coupons.length + newCoupons.length < total);
    } catch (error) {
      message.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [coupons.length]);

  const fetchDependencies = async () => {
    try {
      const [testsRes, packagesRes] = await Promise.all([
        axiosInstance.get('/lab-tests', { params: { limit: 1000 } }),
        axiosInstance.get('/routine-checkups', { params: { limit: 1000 } })
      ]);
      setTests(testsRes.data.data || []);
      setPackages(packagesRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch tests/packages');
    }
  };

  useEffect(() => {
    fetchCoupons(1, searchText);
    fetchDependencies();
  }, [searchText]); // Re-fetch on search change

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCoupons(nextPage, searchText, true);
    }
  };

  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchText(value);
      setPage(1);
    }, 500),
    []
  );

  const handleAdd = () => {
    setEditingCoupon(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: Coupon) => {
    setEditingCoupon(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await couponService.deleteCoupon(id);
      message.success('Coupon deleted successfully');
      setPage(1);
      fetchCoupons(1, searchText);
    } catch (error) {
      message.error('Failed to delete coupon');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingCoupon) {
        await couponService.updateCoupon(editingCoupon.id, values);
        message.success('Coupon updated successfully');
      } else {
        await couponService.createCoupon(values);
        message.success('Coupon created successfully');
      }
      setIsModalVisible(false);
      setPage(1);
      fetchCoupons(1, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '16px' }}>
        <Breadcrumb items={[{ title: 'Home' }, { title: 'Marketing' }, { title: 'Coupon Codes' }]} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Coupon Management</h2>
        <Space>
          <Input
            placeholder="Search by code..."
            prefix={<SearchOutlined />}
            onChange={(e) => debouncedSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Create Coupon
          </Button>
        </Space>
      </div>

      <Card 
        bordered={false} 
        className="shadow-sm" 
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px 24px' } }}
      >
        <CouponTable
          data={coupons}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onLoadMore={handleLoadMore}
          scroll={{ x: 800, y: 'calc(100vh - 350px)' }}
        />
      </Card>

      <CouponFormModal
        visible={isModalVisible}
        editingCoupon={editingCoupon}
        form={form}
        onSubmit={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        tests={tests}
        packages={packages}
      />
    </div>
  );
};

export default CouponManager;
