import React, { useState, useRef, useEffect } from 'react';
import { Space, Table, Button, Modal, Input, Layout, Form, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getadminusers, adminaddusers } from '../api/user';
import { Toast } from '../components';
import request from "../api/index";
const { Column } = Table;
const { Header, Content } = Layout;
const { Item } = Form;
const App = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [addUserVisible, setAddUserVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [userData, setUserData] = useState([]);

  const [editUserVisible, setEditUserVisible] = useState(false);

  const searchInput = useRef(null);
  const [form] = Form.useForm();
  const [formEdit] = Form.useForm();
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${title}`}
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
    render: (text) =>
      searchedColumn === dataIndex ? (
        <span style={{ fontWeight: 'bold' }}>{text}</span>
      ) : (
        text
      ),
  });

  const handleDetail = (record) => {
    setModalContent(record);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    console.log(record);
    formEdit.setFieldsValue({
      username: record.username,
      email: record.email,
      password: record.password,
      phone: record.phone,
      carCode: record.carCode,
      carType: record.carType,
      userid: record.id,
    });
    setEditUserVisible(true);
  };
  const handleDelete = async (record) => {
    try {
      console.log(record.id);
      const res = await request.delete(`/adminparking/accounts/${record.id}/`);
      console.log(res);
      if (!res) {
        console.log(res);
        Toast.success('User deleted successfully!');
        fetchUserData();
      } else {
        Toast.error('Failed to delete user. Please check your details.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      Toast.error('An error occurred. Please try again.');
    }
  };

  const handleAddUser = () => {
    setAddUserVisible(true);
  };

  const handleSaveUser = async () => {
    try {
      const values = await form.validateFields();
      const user = {
        last_login: new Date().toISOString(),
        username: values.name,
        phone: values.phone || '',
        email: values.email,
        carType: values.carType,
        carCode: values.plate,
        password: values.password,
        is_staff: false,
      };
      const res = await adminaddusers(user);
      if (res) {
        console.log(res);
        Toast.success('User added successfully!');
        setAddUserVisible(false);
        fetchUserData();
      } else if (res && res.error) {
        Toast.error(res.error);
      } else {
        Toast.error('Failed to add user. Please check your details.');
      }
    } catch (error) {
      Toast.error('An error occurred. Please try again.');
    }
  };
  const handleSaveEditedUser = async (record) => {
    try {
      const editedUser = formEdit.getFieldsValue();
      editedUser.last_login = new Date().toISOString();
      console.log(editedUser);
      const res = await request.put(`/adminparking/accounts/${editedUser.userid}/`, editedUser);
      if (res) {
        console.log(res);
        Toast.success('User edited successfully!');
        setEditUserVisible(false);
        fetchUserData();
      } else if (res && res.error) {
        Toast.error(res.error);
      } else {
        Toast.error('Failed to edit user. Please check your details.');
      }
    } catch (error) {
      Toast.error('An error occurred. Please try again.');
    }
  };
  const handleCancelAddUser = () => {
    setAddUserVisible(false);
  };
  const handleCancelEditUser = () => {
    setEditUserVisible(false);
    formEdit.resetFields();
  };
  const fetchUserData = async () => {
    try {
      const response = await getadminusers();
      console.log(response);
      if (response && Array.isArray(response)) {
        setUserData(response);
        Toast.success('User data fetched successfully.');
      } else {
        Toast.error('Failed to fetch user data.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Toast.error('An error occurred while fetching user data.');
    }
  };
  useEffect(() => {
    fetchUserData();
  }, []);


  return (
    <>
      <Layout style={{ minHeight: '100vh' }}>
        <Header className="site-layout-sub-header-background" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0 }}>
          <h1 style={{ color: 'white', marginLeft: '20px', marginTop: '10px' }}>User Management</h1>

          <Button type="primary" onClick={handleAddUser} style={{ background: 'white', color: 'gold', border: 'none', marginRight: '180px', marginTop: '10px' }}>Add User</Button>
        </Header>
        <Content style={{ margin: 0 }}>
          <div className="site-layout-background" style={{ padding: 0, minHeight: 360 }}>
            <Table dataSource={userData} rowKey="id" pagination={{ pageSize: 6 }} style={{ padding: 5 }}>
              <Column title="ID" dataIndex="id" key="id" />
              {/*              <Column title="Last Login" dataIndex="last_login" key="last_login" {...getColumnSearchProps('last_login', 'Last Login')} /> */}
              <Column title="Username" dataIndex="username" key="username" {...getColumnSearchProps('username', 'Username')} />
              <Column title="Phone" dataIndex="phone" key="phone" {...getColumnSearchProps('phone', 'Phone')} />
              <Column title="Email" dataIndex="email" key="email" {...getColumnSearchProps('email', 'Email')} />
              <Column title="Car Type" dataIndex="carType" key="carType" {...getColumnSearchProps('carType', 'Car Type')} />
              <Column title="Car Code" dataIndex="carCode" key="carCode" {...getColumnSearchProps('carCode', 'Car Code')} />
              {/*               <Column
  title="Is Staff"
  dataIndex="is_staff"
  key="is_staff"
  {...getColumnSearchProps('is_staff', 'Is Staff')}
/>
 */}

              <Column
                title="Action"
                key="action"
                render={(_, record) => (
                  <Space size="middle">
                    <Button type="link" onClick={() => handleDetail(record)}>Detail</Button>
                    <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
                    <Button type="link" onClick={() => handleDelete(record)}>Delete</Button>
                  </Space>
                )}
              />
            </Table>
            <Modal
              title="User Details"
              visible={isModalVisible}
              onOk={() => setIsModalVisible(false)}
              onCancel={() => setIsModalVisible(false)}
              footer={[
                <Button key="back" onClick={() => setIsModalVisible(false)}>
                  Return
                </Button>,
              ]}
            >
              <p><strong>ID:</strong> {modalContent.id}</p>
              {/*               <p><strong>Last Login:</strong> {modalContent.last_login}</p> */}
              <p><strong>Username:</strong> {modalContent.username}</p>
              <p><strong>Phone:</strong> {modalContent.phone}</p>
              <p><strong>Email:</strong> {modalContent.email}</p>
              <p><strong>Car Type:</strong> {modalContent.carType}</p>
              <p><strong>Car Code:</strong> {modalContent.carCode}</p>
              <p><strong>Is Staff:</strong> {modalContent.is_staff ? 'Yes' : 'No'}</p>
            </Modal>
            <Modal
              title="Add User"
              visible={addUserVisible}
              onOk={handleSaveUser}
              onCancel={handleCancelAddUser}
              okText="Save"
            >
              <Form form={form} layout="vertical">
                <Item label="Name" name="name" rules={[{ required: true, message: 'Please enter name' }]}>
                  <Input />
                </Item>
                <Item label="Email" name="email" rules={[{ required: true, message: 'Please enter email' }]}>
                  <Input />
                </Item>
                <Item label="Password" name="password" rules={[{ required: true, message: 'Please enter password' }]}>
                  <Input.Password />
                </Item>
                <Item label="Confirm Password" name="confirmedPassword" rules={[{ required: true, message: 'Please confirm password' }]}>
                  <Input.Password />
                </Item>
                <Item label="Phone" name="phone">
                  <Input />
                </Item>
                <Item label="Plate Number" name="plate">
                  <Input />
                </Item>
                <Item label="Car Type" name="carType" rules={[{ required: true, message: 'Please select car type' }]}>
                  <Select>
                    <Select.Option value="SUV">SUV</Select.Option>
                    <Select.Option value="MPV">MPV</Select.Option>
                    <Select.Option value="CAR">CAR</Select.Option>
                  </Select>
                </Item>
              </Form>
            </Modal>
            {/* edit modal */}
            <Modal
              title="Edit User"
              visible={editUserVisible}
              onOk={handleSaveEditedUser}
              onCancel={handleCancelEditUser}
              okText="Edit"
              destroyOnClose={true} // 设置destroyOnClose属性为true
            >
              <Form form={formEdit} layout="vertical"   >
                <Item label="User ID" name="userid">
                  <Input disabled />
                </Item>
                <Item label="Name" name="username" rules={[{ required: true, message: 'Please enter name' }]}>
                  <Input />
                </Item>
                <Item label="Email" name="email" rules={[{ required: true, message: 'Please enter email' }]}>
                  <Input />
                </Item>
                <Item label="Password" name="password" rules={[{ required: true, message: 'Please enter password' }]}>
                  <Input.Password />
                </Item>

                <Item label="Phone" name="phone">
                  <Input />
                </Item>
                <Item label="Plate Number" name="carCode">
                  <Input />
                </Item>
                <Item label="Car Type" name="carType" rules={[{ required: true, message: 'Please select car type' }]}>
                  <Select>
                    <Select.Option value="SUV">SUV</Select.Option>
                    <Select.Option value="MPV">MPV</Select.Option>
                    <Select.Option value="CAR">CAR</Select.Option>
                  </Select>
                </Item>
              </Form>

            </Modal>
          </div>
        </Content>
      </Layout>
    </>
  );
};

export default App;
