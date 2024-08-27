import React, { useState, useEffect } from 'react';
import { Layout, Statistic, Row, Col, Progress, Space } from 'antd';
import { UserOutlined, CarOutlined, DollarCircleOutlined, FundProjectionScreenOutlined, PercentageOutlined, CalendarOutlined, RedEnvelopeOutlined } from '@ant-design/icons';
import { Toast } from '../components';
import request from '../api';

const { Content, Header } = Layout;

const getStatistics = async () => {
    return request.get("/adminparking/TotalView");
};

const AdminDataStatistics = () => {
    const [stats, setStats] = useState({});

    const fetchData = async () => {
        try {
            const response = await getStatistics();
            if (response) {
                setStats(response);
                Toast.success('Data fetched successfully.');
            } else {
                Toast.error('Failed to fetch data.');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            Toast.error('An error occurred while fetching data.');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header className="site-layout-sub-header-background" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0 }}>
                <h1 style={{ color: 'white', marginLeft: '20px', marginTop: '10px' }}>Data Statistics</h1>
            </Header>
            <Content style={{ margin: '0 16px' }}>
                <div className="site-layout-background" style={{ padding: 24, minHeight: 360, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Row gutter={[16, 16]} justify="space-around">
                            <Col span={8}>
                                <Statistic title="Total Users" value={stats.total_users} prefix={<UserOutlined />} />
                            </Col>
                            <Col span={8}>
                                <Statistic title="Total Parking Spaces" value={stats.total_parking_spaces} prefix={<CarOutlined />} />
                            </Col>
                            <Col span={8}>
                                <Statistic title="Total Income" value={stats.total_income} precision={2} prefix={<DollarCircleOutlined />} />
                                <Progress percent={Math.round((stats.total_income / (stats.total_income + stats.booking_income)) * 100)} status="active" />
                            </Col>
                        </Row>
                        <Row gutter={[16, 16]} justify="space-around">
                            <Col span={8}>
                                <Statistic title="Booking Income" value={stats.booking_income} precision={2} prefix={<FundProjectionScreenOutlined />} />
                                <Progress percent={Math.round((stats.booking_income / (stats.total_income + stats.booking_income)) * 100)} status="active" />
                            </Col>
                            <Col span={8}>
                                <Statistic title="Day Income" value={stats.day_income} precision={2} prefix={<RedEnvelopeOutlined />} />
                            </Col>
                            <Col span={8}>
                                <Statistic title="Monthly Income" value={stats.monthly_income} precision={2} prefix={<CalendarOutlined />} />
                            </Col>
                        </Row>
                        <Row gutter={[16, 16]} justify="space-around">
                            <Col span={8}>
                                <Statistic title="Cancellation Ratio" value={stats.cancel_ratio} precision={2} suffix="%" prefix={<PercentageOutlined />} />
                            </Col>
                        </Row>
                    </Space>
                </div>
            </Content>
        </Layout>
    );
};

export default AdminDataStatistics;
