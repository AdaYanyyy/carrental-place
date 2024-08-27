import React, { useState } from 'react';
import { Button, Card, Col, Row, Steps, message } from 'antd';

const { Step } = Steps;

const parkingWorkflowSteps = [
  {
    title: 'Register Spaces',
    content: 'Parking space owners register and list their available spaces, set terms, availability, and pricing.',
  },
  {
    title: 'User Booking',
    content: 'Users search for available parking spaces based on location and time, book and pay for the parking space online.',
  },
  {
    title: 'Admin Management',
    content: 'Administrators monitor and manage these interactions, ensuring a smooth process and resolving any conflicts that arise.',
  },
];

const AdminDashboard = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div style={{ background: '#ECECEC', padding: '30px' }}>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="User Management" bordered={false}>
            Manage user accounts, set permissions, and view user activity logs. Ensure the system's security and efficiency by overseeing user interactions and access rights.
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Parking Space Management" bordered={false}>
            Oversee the allocation and status of parking spaces. Update, delete, or add parking information to optimize utilization and manage the inventory of available spots.
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: '20px' }}>
        <Col span={12}>
          <Card title="Order Management" bordered={false}>
            Handle booking processes, including viewing, updating, or cancelling reservations. Ensure smooth operation and customer satisfaction by efficiently managing the booking lifecycle.
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Customer Service Management" bordered={false}>
            Address customer inquiries and support tickets. Maintain high standards of customer service and satisfaction by managing and resolving customer issues promptly.
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: '20px' }}>
        <Col span={24}>
          <Card title="Parking Space Rental Workflow" bordered={false}>
            <Steps current={currentStep} direction="horizontal">
              {parkingWorkflowSteps.map(step => (
                <Step key={step.title} title={step.title} />
              ))}
            </Steps>
            <div style={{ marginTop: 16 }}>
              <p>{parkingWorkflowSteps[currentStep].content}</p>
              <div style={{ marginTop: 16 }}>
                {currentStep > 0 && (
                  <Button onClick={prevStep} style={{ marginRight: 8 }}>
                    Previous
                  </Button>
                )}
                {currentStep < parkingWorkflowSteps.length - 1 && (
                  <Button type="primary" onClick={nextStep}>
                    Next
                  </Button>
                )}
                {currentStep === parkingWorkflowSteps.length - 1 && (
                  <Button type="primary" onClick={() => message.success('Process complete!')}>
                    Finish
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
