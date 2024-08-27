import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { Layout, Table, Button, Modal, Input, Space, Form, Select, DatePicker, TimePicker } from 'antd';
import { DeleteOutlined, EditOutlined, SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Toast } from '../components';

import { getadminorders } from '../api/user';
import request from "../api/index";

const { Content, Header } = Layout;
const { Column } = Table;

const AdminOrderManagement = () => {
  const [ordersData, setOrdersData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detaildOrder, setdetaildOrder] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  const searchInput = useRef(null);

  const fetchOrders = async () => {
    try {

      const response = await getadminorders();
      if (response && Array.isArray(response)) {
        setOrdersData(response);
        Toast.success('Orders data fetched successfully.');
      } else {
        Toast.error('Failed to fetch orders data.');
      }
    } catch (error) {
      console.error('Error fetching orders data:', error);
      Toast.error('An error occurred while fetching orders data.');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDeleteOrder = async (id) => {
    try {
      // 
      const res = await request.delete(`/adminparking/orders/${id}/`);
      console.log(res);
      if (!res) {
        Toast.success("Order deletion successful.");
        fetchOrders(); // 
      } else {
        Toast.error('Failed to delete order.');
      }
    } catch (error) {
      Toast.error('An error occurred. Please try again.');
    }
  };

  const showEditModal = (record) => {
    setSelectedOrder(record); // 

    form.setFieldsValue({
      id: record.id,
      car_code: record.car_code,
      car_type: record.car_type,
      consumer: record.consumer,
      income: record.income,
      end_time: moment(record.end_time),
      start_time: moment(record.start_time),
      status: record.status,
      parking_space: record.parking_space,
    });
    setEditModalVisible(true);
  };

  const handleEditOrder = async () => {
    try {
      const values = await form.validateFields();

      const formattedValues = {
        ...values,
        start_time: values.start_time.format("YYYY-MM-DDTHH:mm:ssZ"),
        end_time: values.end_time.format("YYYY-MM-DDTHH:mm:ssZ"),
      };


      const res = await request.put(`/adminparking/orders/${selectedOrder.id}/`, formattedValues);
      console.log(res);

      if (res && !res.error) {
        Toast.success('Order edited successfully!');
        setEditModalVisible(false);
        fetchOrders();
      } else if (res && res.error) {
        Toast.error(res.error);
      } else {
        Toast.error('Failed to edit order. Please check your details.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      Toast.error('An error occurred. Please try again.');
    }
  };


  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex] && record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current.select());
      }
    },
    render: text => text,
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  // 新增的打开详情模态框的方法
  const showDetailModal = (record) => {
    setdetaildOrder(record);
    setDetailModalVisible(true);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="site-layout-sub-header-background" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0 }}>
        <h1 style={{ color: 'white', marginLeft: '20px', marginTop: '10px' }}>Order Management</h1>
      </Header>
      <Content style={{ margin: '0 16px' }}>
        <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
          <Table dataSource={ordersData} rowKey="id">
            <Column title="ID" dataIndex="id" key="id" {...getColumnSearchProps('id')} />
            <Column title="Car Code" dataIndex="car_code" key="car_code" {...getColumnSearchProps('car_code')} />
            <Column title="Car Type" dataIndex="car_type" key="car_type" {...getColumnSearchProps('car_type')} />
            <Column title="Consumer" dataIndex="consumer" key="consumer" {...getColumnSearchProps('consumer')} />
            <Column title="Start Time" dataIndex="start_time" key="start_time" {...getColumnSearchProps('start_time')} />
            <Column title="End Time" dataIndex="end_time" key="end_time" {...getColumnSearchProps('end_time')} />
            <Column title="Income" dataIndex="income" key="income" {...getColumnSearchProps('income')} />
            <Column title="Parking Space" dataIndex="parking_space" key="parking_space" {...getColumnSearchProps('parking_space')} />
            <Column title="Status" dataIndex="status" key="status" {...getColumnSearchProps('status')} />
            <Column
              title="Actions"
              key="actions"
              render={(text, record) => (
                <Space size="middle">
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteOrder(record.id)}
                  >
                    Delete
                  </Button>
                  <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>Edit</Button>
                  <Button icon={<InfoCircleOutlined />} onClick={() => showDetailModal(record)}>Detail</Button>
                </Space>
              )}
            />
          </Table>
        </div>
      </Content>

      <Modal
        title="Order Details"
        visible={detailModalVisible}
        onOk={() => setDetailModalVisible(false)}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {detaildOrder && (
          <div>
            <p>ID: {detaildOrder.id}</p>
            <p>Car Code: {detaildOrder.car_code}</p>
            <p>Car Type: {detaildOrder.car_type}</p>
            <p>Consumer: {detaildOrder.consumer}</p>
            <p>Start Time: {detaildOrder.start_time}</p>
            <p>End Time: {detaildOrder.end_time}</p>
            <p>Income: {detaildOrder.income}</p>
            <p>Parking Space: {detaildOrder.parking_space}</p>
            <p>Status: {detaildOrder.status}</p>
          </div>
        )}
      </Modal>

      <Modal
        title="Edit Order"
        visible={editModalVisible}
        onOk={handleEditOrder}
        onCancel={() => setEditModalVisible(false)}
        okText="Save"
      >
        <Form form={form} layout="vertical">

          <Form.Item name="id" label="Order ID">
            <Input disabled />
          </Form.Item>
          <Form.Item name="consumer" label="Consumer">
            <Input disabled />
          </Form.Item>
          <Form.Item name="car_code" label="Car Code">
            <Input />
          </Form.Item>
          <Form.Item name="income" label="income">
            <Input />
          </Form.Item>
          <Form.Item name="car_type" label="Car Type">
            <Select>
              <Select.Option value="Small">Small</Select.Option>
              <Select.Option value="Medium">Medium</Select.Option>
              <Select.Option value="Large">Large</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="start_time" label="Start Time">
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="end_time" label="End Time">
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select>
              <Select.Option value="Booked">Booked</Select.Option>
              <Select.Option value="Cancelled">Cancelled</Select.Option>
              <Select.Option value="Completed">Completed</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="parking_space" label="Parking Space">
            <Input disabled />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminOrderManagement;
