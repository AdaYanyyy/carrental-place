import React, { useState, useEffect, useRef } from 'react';
import { Layout, Table, Button, Modal, Form, Input, Space, Select } from 'antd';
import { DeleteOutlined, MessageOutlined, SearchOutlined } from '@ant-design/icons';
import { admingethelp } from '../api/user';
import { Toast } from '../components';
import request from "../api/index";
const { Content, Header } = Layout;
const { Column } = Table;

const AdminCustomerService = () => {

  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [helpData, setHelpData] = useState([]);

  const handleUser = async () => {
    try {
      const response = await admingethelp();
      if (response) {
        setHelpData(response);
        Toast.success('User data fetched successfully.');
      } else {
        Toast.error('Failed to fetch user data.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Toast.error('An error occurred while fetching user data.');
    }
  };
  const handleCheck = () => {
    window.location.reload();
  };
  useEffect(() => {
    handleUser();
  }, []);

  const handleDeleteMessage = async (id) => {
    try {
      const res = await request.delete(`/adminparking/InquiryView?inquiry_id=${id}`);
      if (res) {
        console.log(res);
        Toast.success("Message deletion successful.");
        handleUser();
      } else if (res && res.error) {
        Toast.error(res.error);
      } else {
        Toast.error('Failed to edit user. Please check your details.');
      }
    } catch (error) {
      Toast.error('An error occurred. Please try again.');
    }
  };
  const handleReplyMessage = (record) => {
    if (record) {
      setSelectedMessage(record);
      setReplyContent(record.answer);
      setReplyModalVisible(true);
      console.log(record);
    } else {
      console.error('Selected message is null or undefined.');
    }
  };


  const handleSaveReply = async () => {
    try {
      const id = selectedMessage.id;
      const answer = replyContent;
      const url = `/adminparking/InquiryView?inquiry_id=${id}&answer=${encodeURIComponent(answer)}`;
      const response = await request.put(url);
      Toast.success('Reply saved successfully.');
      setReplyModalVisible(false);
      setReplyContent('');
      handleUser();
    } catch (error) {
      console.error('Error saving reply:', error);
      Toast.error('An error occurred while saving reply. Please try again.');
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
    render: (text) =>
      searchedColumn === dataIndex ? (
        <span style={{ fontWeight: 'bold' }}>{text}</span>
      ) : (
        text
      ),
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
        <h1 style={{ color: 'white', marginLeft: '20px', marginTop: '10px' }}>Message Management</h1>
        <Button type="primary" onClick={handleCheck} style={{ background: 'white', color: 'gold', border: 'none', marginRight: '180px', marginTop: '10px' }}>Reset</Button>

      </Header>
      <Content style={{ margin: '0 16px' }}>
        <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
          <h1>Message List</h1>
          <Table dataSource={helpData} rowKey="id">
            <Column title="ID" dataIndex="id" key="id" {...getColumnSearchProps('id')} />
            <Column title="Question" dataIndex="question" key="question" {...getColumnSearchProps('question')} />
            <Column title="Answer" dataIndex="answer" key="answer" {...getColumnSearchProps('answer')} />

            <Column title="User ID" dataIndex="user_id" key="user_id" {...getColumnSearchProps('user_id')} />
            <Column title="Created At" dataIndex="created_at" key="created_at" />
            <Column title="Updated At" dataIndex="updated_at" key="updated_at" />
            <Column
              title="Actions"
              key="actions"
              render={(text, record) => (
                <>
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteMessage(record.id)}
                    style={{ marginRight: 8 }}
                  >
                    Delete
                  </Button>
                  <Button
                    icon={<MessageOutlined />}
                    onClick={() => handleReplyMessage(record)}
                  >
                    Reply
                  </Button>
                </>
              )}
            />
          </Table>
        </div>
      </Content>
      <Modal
        title="Reply to Message"
        visible={replyModalVisible}
        onOk={handleSaveReply}
        onCancel={() => setReplyModalVisible(false)}
      >
        <Form>
          <Form.Item label="Question">
            <Input value={selectedMessage ? selectedMessage.question : ''} disabled />
          </Form.Item>
          <Form.Item label="User ID">
            <Input value={selectedMessage ? selectedMessage.user_id : ''} disabled />
          </Form.Item>
          <Form.Item label="Answer">
            <Input.TextArea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>
        </Form>
      </Modal>

    </Layout>
  );
};

export default AdminCustomerService;
