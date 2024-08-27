import React, { useState, useEffect, useRef } from 'react';
import { Layout, Table, Button, Modal, Form, Input, Space, Select, Upload, message } from 'antd';
import { DeleteOutlined, EditOutlined, SearchOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { getadminparking } from '../api/user';
import { Toast } from '../components';
import request from "../api/index";

const { Content, Header } = Layout;
const { Column } = Table;

const ParkingManagement = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [parkingData, setParkingData] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedParking, setSelectedParking] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const searchInput = useRef(null);

  const handleFetchParkingSpaces = async () => {
    try {
      const response = await getadminparking();
      if (response && Array.isArray(response)) {
        setParkingData(response);
        Toast.success('Parking data fetched successfully.');
      } else {
        Toast.error('Failed to fetch parking data.');
      }
    } catch (error) {
      Toast.error('An error occurred while fetching parking data.');
    }
  };

  useEffect(() => {
    handleFetchParkingSpaces();
  }, []);

  const showEditModal = async (record) => {
    setSelectedParking(record);
    const res = await request.get(`/adminparking/parking-spaces/${record.id}/`);
    if (res && !res.error) {
      const parkingData = res;
      console.log(res)
      form.setFieldsValue({
        location: parkingData.location,
        day_price: parkingData.day_price,
        hour_price: parkingData.hour_price,
        income: parkingData.income,
        rate: parkingData.rate,
        car_type: parkingData.car_type,
        owner: parkingData.owner
      });
      setImageUrl(parkingData.img_path);
      console.log("admin image:", parkingData.img_path)
      setEditModalVisible(true);
    } else {
      Toast.error('Failed to fetch parking space details.');
    }
  };

  const handleEditParkingSpace = async () => {
    const values = await form.validateFields();
    try {
      const updatedParkingData = {
        ...values,
        img_path: imageUrl
      };
      const res = await request.put(`/adminparking/parking-spaces/${selectedParking.id}/`, updatedParkingData);
      if (!res.error) {
        Toast.success('Parking space edited successfully.');
        setEditModalVisible(false);
        handleFetchParkingSpaces();
      } else {
        Toast.error('Failed to edit parking space.');
      }
    } catch (error) {
      Toast.error('An error occurred. Please try again.');
    }
  };

  const handleDeleteParkingSpace = async (id) => {
    try {
      const res = await request.delete(`/adminparking/parking-spaces/${id}/`);
      if (!res.error) {
        Toast.success("Parking space deleted successfully.");
        handleFetchParkingSpaces();
      } else {
        Toast.error('Failed to delete parking space.');
      }
    } catch (error) {
      Toast.error('An error occurred. Please try again.');
    }
  };


  const fileToDataURL = (file) => {
    const reader = new FileReader();
    return new Promise(function (resolve) {
      reader.onload = function (event) {
        resolve(event.target.result);
      };
      reader.readAsDataURL(file);
    });
  };

  const onImagesChange = async (e) => {
    try {
      if (!e.fileList || e.fileList.length === 0) {
        console.log("没有文件被上传");
        return;
      }

      const lastImageIndex = e.fileList.length - 1;
      const imageDataURL = await fileToDataURL(e.fileList[lastImageIndex].originFileObj);
      console.log('imageDataURL:', imageDataURL);
      setImageUrl(imageDataURL);
    } catch (error) {
      console.error("处理图片时发生错误:", error);
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
      record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current.select());
      }
    },
    render: text => text
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="site-layout-sub-header-background" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0 }}>
        <h1 style={{ color: 'white', marginLeft: '20px' }}>Parking Management</h1>
      </Header>
      <Content style={{ margin: '0 16px' }}>
        <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
          <Table dataSource={parkingData} rowKey="id">
            <Column title="ID" dataIndex="id" key="id" {...getColumnSearchProps('id')} />
            <Column title="Location" dataIndex="location" key="location" {...getColumnSearchProps('location')} />
            <Column title="Day Price" dataIndex="day_price" key="day_price" {...getColumnSearchProps('day_price')} />
            <Column title="Hour Price" dataIndex="hour_price" key="hour_price" {...getColumnSearchProps('hour_price')} />
            <Column title="Rate" dataIndex="rate" key="rate" {...getColumnSearchProps('rate')} />
            <Column title="Car Type" dataIndex="car_type" key="car_type" {...getColumnSearchProps('car_type')} />
            <Column title="Income" dataIndex="income" key="income" {...getColumnSearchProps('income')} />
            <Column title="Owner" dataIndex="owner" key="owner" {...getColumnSearchProps('owner')} />
            <Column
              title="Actions"
              key="actions"
              render={(text, record) => (
                <Space size="middle">
                  <Button icon={<DeleteOutlined />} onClick={() => handleDeleteParkingSpace(record.id)}>
                    Delete
                  </Button>
                  <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
                    Edit
                  </Button>
                </Space>
              )}
            />
          </Table>
          <Modal
            title="Edit Parking Space"
            visible={editModalVisible}
            onOk={handleEditParkingSpace}
            onCancel={() => setEditModalVisible(false)}
            okText="Save"
          >
            <Form form={form} layout="vertical">
              <Form.Item name="location" label="Location" rules={[{ required: true, message: 'Please input the location!' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="day_price" label="Day Price" rules={[{ required: true, message: 'Please input the day price!' }]}>
                <Input type="number" />
              </Form.Item>
              <Form.Item name="hour_price" label="Hour Price" rules={[{ required: true, message: 'Please input the hour price!' }]}>
                <Input type="number" />
              </Form.Item>
              <Form.Item name="rate" label="Rate" rules={[{ required: true, message: 'Please input the rate!' }]}>
                <Input type="number" />
              </Form.Item>
              <Form.Item name="car_type" label="Car Type" rules={[{ required: true, message: 'Please select the car type!' }]}>
                <Select>
                  <Select.Option value="Small">Small</Select.Option>
                  <Select.Option value="Medium">Medium</Select.Option>
                  <Select.Option value="Large">Large</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="income" label="Income" rules={[{ required: true, message: 'Please input the income!' }]}>
                <Input type="number" />
              </Form.Item>
              <Form.Item name="owner" label="Owner" rules={[{ required: true, message: 'Please input the owner ID!' }]}>
                <Input type="number" />
              </Form.Item>
              <Form.Item label="Image">
                <Upload
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={onImagesChange}

                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="Parking Space" style={{ width: '100%' }} />
                  ) : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>


            </Form>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default ParkingManagement;
