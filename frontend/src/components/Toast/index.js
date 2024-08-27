import React from 'react';
import ReactDOM from 'react-dom';
import { Snackbar, Alert } from '@mui/material';

function ToastItem (props) {
  const { content, duration = 3000, type } = props;
  // 开关控制：默认true,调用时会直接打开
  const [visible, setVisible] = React.useState(true);
  // 关闭消息提示
  const handleClose = () => {
    setVisible(false);
  };
  return (
    <Snackbar
      open={visible}
      autoHideDuration={duration}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity={type}>
        {content}
      </Alert>
    </Snackbar>
  );
}

const Toast = {
  dom: null,
  success (content, duration) {
    // create a dom
    const dom = document.createElement('div');
    // define components
    const JSXdom = (
      <ToastItem content={content} duration={duration} type='success' />
    );
    // render dom
    ReactDOM.render(JSXdom, dom);
    // append child into body
    document.body.appendChild(dom);
  },
  error (content, duration) {
    const dom = document.createElement('div');
    const JSXdom = (
      <ToastItem content={content} duration={duration} type='error' />
    );
    ReactDOM.render(JSXdom, dom);
    document.body.appendChild(dom);
  },
  warning (content, duration) {
    const dom = document.createElement('div');
    const JSXdom = (
      <ToastItem content={content} duration={duration} type='warning' />
    );
    ReactDOM.render(JSXdom, dom);
    document.body.appendChild(dom);
  },
  info (content, duration) {
    const dom = document.createElement('div');
    const JSXdom = (
      <ToastItem content={content} duration={duration} type='info' />
    );
    ReactDOM.render(JSXdom, dom);
    document.body.appendChild(dom);
  },
};

export default Toast;
