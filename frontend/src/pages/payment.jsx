import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from "jspdf";
import dayjs from 'dayjs';
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { format, setYear, setMonth, setDate, setHours, setMinutes, setSeconds } from 'date-fns';
import { userAvatarBase64 } from '../image'
import { Modal, Input, Button, Space, Form, Select } from 'antd';
import { payOrder, getCoupons } from '../api/payment';

const { Option } = Select;

const PaymentModal = ({ isOpen, onClose, orderDetails, coupons }) => {
  const [form] = Form.useForm();
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [countdown, setCountdown] = useState(1800);
  const [totalPrice, setTotalPrice] = useState(orderDetails.totalPrice);

  const [cardInfo, setCardInfo] = useState({
    fullName: '',
    phoneNumber: '',
    slotNumber: '',
    carType: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'Australia',
  });
  useEffect(() => {
    setSelectedCoupon(null);
    setTotalPrice(orderDetails.totalPrice);
  }, [orderDetails]);

  useEffect(() => {
    let timerId;
    if (countdown > 0) {
      timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      onClose();
    }
    return () => clearTimeout(timerId);
  }, [countdown, onClose]);

  const handleChange = (name, event) => {
    setCardInfo({ ...cardInfo, [name]: event.target.value });
  };

  const handleSelectChange = (name, value) => {

    setCardInfo({ ...cardInfo, [name]: value });
    if (name === 'couponId') {
      const coupon = coupons.find(c => c.id === value);
      if (coupon) {
        const newTotalPrice = (orderDetails.totalPrice * coupon.discount).toFixed(2);
        setTotalPrice(newTotalPrice);
        setSelectedCoupon(coupon.discount);
      }
    } else {
      setCardInfo({ ...cardInfo, [name]: value });
    }
  };

  const navigate = useNavigate();
  const goToLink = (url) => {
    navigate(url);
  };

  const generatePDF = async () => {

    const orderInfo = {
      car_type: cardInfo.carType,
      car_code: cardInfo.plateNumber,
      start_time: orderDetails.startTime,
      end_time: orderDetails.endTime,
      parking_space: orderDetails.spaceId,
      income: totalPrice,
      status: 'Booked'
    }
    console.log('orderInfo:', orderInfo);
    console.log('cardInfo', cardInfo);
    console.log('price', totalPrice);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const imageWidth = 50;
    const imageHeight = 50;
    const marginLeft = 15;
    const marginTop = 15;
    const marginBottom = 10;


    doc.addImage(userAvatarBase64, 'PNG', (pageWidth - imageWidth) / 2, marginTop, imageWidth, imageHeight);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('CloseAI Parking Management', pageWidth / 2, marginTop + imageHeight + 20, null, null, 'center');
    doc.setFontSize(16);
    doc.text('Reservation Receipt', pageWidth / 2, marginTop + imageHeight + 35, null, null, 'center');
    doc.addPage();


    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Parking Reservation Receipt', marginLeft, marginTop);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - marginLeft - 40, marginTop);


    doc.setDrawColor(0);
    doc.line(marginLeft, marginTop + 3, pageWidth - marginLeft, marginTop + 3);


    let currentHeight = marginTop + 10;
    doc.setFontSize(15);
    doc.text('order Details:', marginLeft, currentHeight += 10);

    doc.setFontSize(12);
    doc.text(`Order ID: ${orderDetails.orderId}`, marginLeft, currentHeight += 10);
    doc.text(`Start Time: ${orderDetails.startTime}`, marginLeft, currentHeight += 6);
    doc.text(`End Time: ${orderDetails.endTime}`, marginLeft, currentHeight += 6);
    doc.text(`Total Price: ${totalPrice}`, marginLeft, currentHeight += 6);


    doc.setFontSize(12);
    doc.text('Reservation Details:', marginLeft, currentHeight += 10);

    doc.setFontSize(10);
    doc.text(`Reservant Name: ${cardInfo.fullName}`, marginLeft, currentHeight += 6);
    doc.text(`Contact Number: ${cardInfo.phoneNumber}`, marginLeft, currentHeight += 6);


    doc.text('Parking Slot Details:', marginLeft, currentHeight += 10);
    doc.text(`Slot Number: ${cardInfo.slotNumber}`, marginLeft, currentHeight += 6);
    doc.text(`Expiry Date: ${cardInfo.expiryMonth}/${cardInfo.expiryYear}`, marginLeft, currentHeight += 6);
    doc.text(`CVV: ${cardInfo.cvv}`, marginLeft, currentHeight += 6);

    doc.text('Billing Address:', marginLeft, currentHeight += 10);
    doc.text(cardInfo.addressLine1, marginLeft, currentHeight += 6);
    if (cardInfo.addressLine2) {
      doc.text(cardInfo.addressLine2, marginLeft, currentHeight += 6);
    }
    doc.text(`${cardInfo.city}, ${cardInfo.state}, ${cardInfo.postcode}`, marginLeft, currentHeight += 6);
    doc.text(`Country: ${cardInfo.country}`, marginLeft, currentHeight += 6);


    doc.setFontSize(11);
    doc.text('Thank you for using CloseAI Parking Management System.', pageWidth / 2, pageHeight - marginBottom, null, null, 'center');


    doc.addImage(userAvatarBase64, 'PNG', marginLeft, pageHeight - marginBottom - imageHeight, imageWidth, imageHeight);

    doc.save('Parking_Reservation_Receipt.pdf');
    const data = await payOrder(orderInfo);
    console.log('status:', data);
    goToLink('/auth/user-current-order');

  };

  return (
    <Modal
      title="Payment Information"
      open={isOpen}
      onCancel={onClose}
      width={1024}
      footer={
        [
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" form="paymentForm" htmlType="submit">
            Save
          </Button>,
        ]}
    >
      <p>Time left: {Math.floor(countdown / 60)}:{countdown % 60 < 10 ? `0${countdown % 60}` : countdown % 60}</p>
      <Form
        id="paymentForm"
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        onFinish={generatePDF} >
        <Form.Item
          name="fullName"
          label="Full name"
          rules={[{ required: true, message: 'Please input your full name!' }]}
        >
          <Input
            value={cardInfo.fullName}
            onChange={(e) => handleChange('fullName', e)}
          />
        </Form.Item>
        <Form.Item
          name="phoneNumber"
          label="Phone number"
          rules={[{ required: true, message: 'Please input your Phone!' }]}
        >
          <Input
            value={cardInfo.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e)}
          />

        </Form.Item>
        <Form.Item label="Start Time">
          <Input value={orderDetails.startTime} readOnly />
        </Form.Item>
        <Form.Item label="End Time">
          <Input value={orderDetails.endTime} readOnly />
        </Form.Item>
        <Form.Item label="Total Price">
          <Input value={totalPrice} readOnly />
        </Form.Item>
        <Form.Item
          name="plateNumber"
          label="Plate Number"
          rules={[{ required: true, message: 'Please input your plate number!' }]}>
          <Input
            placeholder="Enter you plate number"
            value={''}
            onChange={(e) => handleChange('plateNumber', e)}
          />
        </Form.Item>

        <Form.Item label="Car Type"
          name="carType"
          rules={[{ required: true, message: 'Please select the type of your car!' }]}
        >
          <Select
            value={cardInfo.carType}
            onChange={(value) => handleSelectChange('carType', value)}
            style={{ width: 120 }}
          >
            <Option value="SUV">SUV</Option>
            <Option value="CAR">CAR</Option>
            <Option value="MPV">MPV</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="slotNumber"
          label="Card number"
          rules={[{ required: true, message: 'Please input your plate number!' }]}>
          <Input
            placeholder="Enter parking slot number"
            value={cardInfo.slotNumber}
            onChange={(e) => handleChange('slotNumber', e)}
          />
        </Form.Item>
        <Form.Item
          name="expiryMonth"
          label="Expiration Date">
          <Space>
            <Select
              value={cardInfo.expiryMonth}
              onChange={(value) => handleSelectChange('expiryMonth', value)}
              style={{ width: 100 }}
            >
              {[...Array(12).keys()].map(month => (
                <Option key={month + 1} value={month + 1}>
                  {String(month + 1).padStart(2, '0')}
                </Option>
              ))}
            </Select>
            <Select
              value={cardInfo.expiryYear}
              onChange={(value) => handleSelectChange('expiryYear', value)}
              style={{ width: 100 }}
            >
              {[...Array(12).keys()].map(year => (
                <Option key={year} value={new Date().getFullYear() + year}>
                  {new Date().getFullYear() + year}
                </Option>
              ))}
            </Select>
          </Space>
        </Form.Item>
        <Form.Item
          name="cvv"
          label="CVV"
          rules={[{ required: true, message: 'Please type the cvv!' }]}
        >
          <Input
            value={cardInfo.cvv}
            onChange={(e) => handleChange('cvv', e)}
            maxLength={3}
          />
        </Form.Item>
        <Form.Item
          name="addressLine1"
          label="Address Line 1"
          rules={[{ required: true, message: 'Please enter address!' }]}
        >
          <Input
            placeholder="Address/Street (optional)/Door number (optional)"
            value={cardInfo.addressLine1}
            onChange={(e) => handleChange('addressLine1', e)}
          />
        </Form.Item>
        <Form.Item label="Address Line 2">
          <Input
            placeholder="Addition to Address (optional)"
            value={cardInfo.addressLine2}
            onChange={(e) => handleChange('addressLine2', e)}
          />
        </Form.Item>
        <Form.Item
          name="city"
          label="City"
          rules={[{ required: true, message: 'Please type the city!' }]}
        >
          <Input
            value={cardInfo.city}
            onChange={(e) => handleChange('city', e)}
          />
        </Form.Item>
        <Form.Item
          name="state"
          label="State / Territory / Province / Region"
          rules={[{ required: true, message: 'Please type the state!' }]}
        >
          <Input
            value={cardInfo.state}
            onChange={(e) => handleChange('state', e)}
          />
        </Form.Item>
        <Form.Item
          name="postcode"
          label="Postcode"
          rules={[{ required: true, message: 'Please type the postcode!' }]}
        >
          <Input
            value={cardInfo.postcode}
            onChange={(e) => handleChange('postcode', e)}
          />
        </Form.Item>
        <Form.Item
          name="country"
          label="Country"
          rules={[{ required: true, message: 'Please select the Country!' }]}
        >
          <Select
            value={cardInfo.country}
            onChange={(value) => handleSelectChange('country', value)}
          >
            <Option value="Australia">Australia</Option>

          </Select>
        </Form.Item>
        <Form.Item label="Select Coupon">
          <Select
            onChange={(value) => handleSelectChange('couponId', value)}
            value={selectedCoupon}
          >
            {coupons.map(coupon => (
              <Option key={coupon.id} value={coupon.id}>
                Discount: {coupon.discount * 100}%
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal >

  );
};



export default PaymentModal;
