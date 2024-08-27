import React, { useState, useEffect } from 'react';
import {
  Box, Container, CssBaseline, Typography, Paper, Grid, IconButton, List, ListItem, Avatar, Divider, Link, Modal, TextField, Button, ListItemText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import userAvatar from '../material/deer.png';
import { Toast } from '../components';
import { sendreview, getsinglereview } from '../api/user';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
const FlexContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
}));

const MessageText = styled('div')(({ theme, admin }) => ({
  marginLeft: admin ? 'auto' : 0,
  marginRight: admin ? 0 : 'auto',
  maxWidth: '80%',
}));



const faqList = [
  {
    question: 'What requirements need to be met to rent a parking space?',
    answer: 'When booking a parking space, you usually need to provide a method of payment, such as a credit card or debit card.\n\n- Documentation proving you have paid for the parking space rental.\n- A valid form of identification, such as a driver\'s license or passport.\n- A rental agreement signed with the parking space rental company.'
  },
  {
    question: 'Is there an age requirement to rent a parking space?',
    answer: 'Generally, renting a parking space does not have strict age requirements like renting a car does. However, if you are renting through certain services or platforms, they may require you to provide a valid driver\'s license or proof of age to ensure the legality of the rental.'
  },
  {
    question: 'Can I rent a parking space for someone else?',
    answer: 'Yes, as long as their vehicle meets any specific requirements of the parking lot. When booking, make sure to fill out the correct vehicle information.'
  },
  {
    question: 'How can I find the best deal on parking space rentals?',
    answer: 'You can find the best deal on parking space rentals by comparing different parking lots and online platforms. Many websites and applications allow users to compare prices at different locations to find a suitable parking option.'
  },
  {
    question: 'What should I consider when choosing a parking space?',
    answer: '- Location: Choose a parking space close to your destination to save time.\n- Security: Consider the parking lot\'s security measures, such as surveillance cameras, security personnel, etc.\n- Size Restrictions: Ensure the parking space can accommodate the size of your vehicle.\n- Rental Terms: Review the terms of the rental agreement to understand if long-term rentals are allowed, any restrictions, etc.'
  },
  {
    question: 'Are all fees included in the rental price?',
    answer: 'This depends on the terms of your parking space rental. Some rental prices include all fees, such as management fees and maintenance fees, while others may charge additional fees. Make sure you understand all possible fees before signing the rental agreement, including any fees for additional services.'
  }
];

const fixedBottomStyle = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  padding: 2,
  backgroundColor: '#fff',
  boxShadow: '0px -2px 5px rgba(0, 0, 0, 0.2)',
};

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '800px',
  height: 'auto',
  maxHeight: '90vh',
  minHeight: '20vh',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflow: 'auto',
};

export default function CustomerService() {
  const [open, setOpen] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const [userMessages, setUserMessages] = useState([]);

  const abs = async () => {
    try {

      const response = await getsinglereview();
      if (response && Array.isArray(response)) {

        setUserMessages(response);
      } else {
        Toast.error('Failed to fetch messages.');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      Toast.error('An error occurred while fetching the messages.');
    }
  };

  useEffect(() => {
    abs();
  }, []);



  const sendMessage = async () => {
    if (!newMessage.trim()) {

      Toast.error('Please enter a message before sending.');
      return;
    }

    const messageData = {
      question: newMessage
    };

    console.log(messageData);

    try {

      const response = await sendreview(messageData);
      if (response.success) {
        setNewMessage('');
        Toast.success(response.success);
        abs();
      } else {
        Toast.error(response.error || 'Failed to send message.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Toast.error('An error occurred while sending the message.');
    }
  };


  const handleOpen = (faq) => {
    setSelectedFAQ(faq);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  return (
    <Container component="main" maxWidth="lg" sx={{ paddingBottom: '100px' }}>

      <CssBaseline />
      <Typography
        component="h1"
        variant="h3"
        align="center"
        sx={{
          marginTop: 8,
          marginBottom: 4,
          fontWeight: 'bold',
          color: 'black',
          textShadow: '1px 1px 2px gray'
        }}
      >
        Customer Service Page
      </Typography>
      <Box elevation={2} sx={{ marginTop: 4, padding: 2 }}>
        <Typography variant="h4" align="center" sx={{ marginBottom: 2, fontWeight: 'bold', color: 'black' }}>
          Frequently Asked Questions (FAQ)
        </Typography>
        <Grid container spacing={2}>
          {faqList.map((faq, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Link href="#" onClick={() => handleOpen(faq)} underline="hover" sx={{ cursor: 'pointer' }}>
                <Typography variant="body1">{faq.question}</Typography>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Typography variant="h4" align="center" sx={{ marginTop: 4, marginBottom: 2, fontWeight: 'bold', color: 'black' }}>
        Messages & Replies
      </Typography>

      <Paper elevation={2} sx={{ marginBottom: 2 }}>
        {userMessages.length === 0 ? (
          <Typography variant="body1" align="center" sx={{ padding: 2 }}>
            There are no messages yet. Be the first to leave a message!
          </Typography>
        ) : (
          <List sx={{ bgcolor: 'background.paper' }}>
            {userMessages.map((message, index) => (
              <>
                <React.Fragment key={index}>
                  <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                    <FlexContainer>
                      <IconButton aria-label="account">
                        <AccountCircleOutlinedIcon sx={{ width: 40, height: 40 }} />
                      </IconButton>
                      <Paper elevation={1} sx={{ padding: 1, flexGrow: 1, margin: '0 8px', bgcolor: 'background.paper', maxWidth: '100%' }}>
                        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                          {message.question}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                          Created at: {new Date(message.created_at).toLocaleString()}
                        </Typography>
                      </Paper>
                      <Box>
                      </Box>
                    </FlexContainer>
                    <FlexContainer>
                      <Paper elevation={1} sx={{ padding: 1, flexGrow: 1, margin: '8px 8px 0 0', bgcolor: 'background.paper', maxWidth: '100%' }}>
                        <Typography variant="body1" sx={{ color: 'gray', textAlign: 'right', wordBreak: 'break-word' }}>
                          {message.answer !== null ? message.answer : "The administrator has not replied yet."}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', textAlign: 'right' }}>
                          Updated at: {new Date(message.updated_at).toLocaleString()}
                        </Typography>
                      </Paper>
                      <Avatar alt="Admin" src={userAvatar} sx={{ width: 40, height: 40, marginLeft: 2 }} />
                    </FlexContainer>
                  </ListItem>
                  {index < userMessages.length - 1 && <Divider component="li" />}
                </React.Fragment>
              </>

            ))}
          </List>
        )}
      </Paper>




      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#fff', margintop: 50 }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} alignItems="center" sx={{ padding: 2 }}>
            <Grid item xs={10}>
              <TextField
                fullWidth
                label="Type your message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => sendMessage(newMessage)}
              >
                Send
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h5"
            component="h2"
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 'bold',
              marginBottom: 2
            }}
          >
            <HelpOutlineIcon sx={{ mr: 1 }} />
            {selectedFAQ?.question}
          </Typography>
          <Typography
            id="modal-modal-description"
            variant="h6"
            sx={{
              mt: 4,
              whiteSpace: 'pre-wrap',
            }}
          >
            {selectedFAQ?.answer}
          </Typography>
        </Box>
      </Modal>

    </Container>
  );
}