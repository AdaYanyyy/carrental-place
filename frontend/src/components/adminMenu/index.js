import React, { useState } from 'react';
import { Menu, Switch } from 'antd';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; // 引入useNavigate
import Toast from '../Toast';

function getItem(label, key, icon, children, onClick) {
  return {
    key,
    icon,
    children,
    label,
    onClick, // 添加onClick属性
  };
}

const NavigationMenu = () => {
  const navigate = useNavigate(); // 使用useNavigate
  const [theme, setTheme] = useState('light');
  const [current, setCurrent] = useState('1');
  const [openKeys, setOpenKeys] = useState(['sub1', 'sub2', 'sub4']);

  const changeTheme = (value) => {
    setTheme(value ? 'dark' : 'light');
  };

  const onClick = (e) => {
    setCurrent(e.key);
    // 根据不同的key跳转到不同的路由
    switch (e.key) {
      case '1':
        navigate('/auth/admindashboard');
        break;
      case '2':
        navigate('/auth/adminuser');
        break;
      case '5':
        navigate('/auth/adminparking');
        break;
      case '7':
        navigate('/auth/admindata');
        break;


      case '8':
        Toast.success("This is not yet completed")
        break;
      case '9':
        navigate('/auth/adminorder');
        break;

      case '10':
        navigate('/auth/adminhelp');
        break;
      case '11':
        Toast.success("logout");
        localStorage.removeItem('Authorization');
        localStorage.removeItem('admin_email');

        navigate('/');
        break;
      default:
        break;
    }
  };

  const onOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  const items = [
    getItem('Admin', 'sub1', <MailOutlined />, [
      getItem('Admin Dashboard', '1'), // 给按钮命名

      getItem('Administrator Data Statistics', 'sub3', null, [
        getItem('Admin Statistics', '7'),
        //getItem('Option 8', '8')
      ]),
    ]),
    getItem('Management', 'sub2', <AppstoreOutlined />, [
      getItem('Admin User', '2'), // 给按钮命名
      getItem('Parking Management', '5'), // 给按钮命名
      getItem('Order Management', '9'), // 给按钮命名
      getItem('Customer Service', '10'), // 给按钮命名

    ]),
    getItem('Account Settings', 'sub4', <SettingOutlined />, [

      getItem('log out', '11'),
      //getItem('Option 12', '12')
    ]),
  ];

  return (
    <>
      <Switch
        checked={theme === 'dark'}
        onChange={changeTheme}
        checkedChildren="Dark"
        unCheckedChildren="Light"
      />
      <>
        <Menu
          onClick={onClick}
          onOpenChange={onOpenChange}
          openKeys={openKeys}
          style={{ width: 256 }}
          mode="inline"
          theme={theme}
          items={items}
          selectedKeys={[current]}
        />
      </>

    </>
  );
};

export default NavigationMenu;
