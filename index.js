// Import and configure dotenv
require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Use the PORT environment variable if available

const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

app.get('/', (req, res) => {
    res.status(200).send({
        message: "You are on Homepage",
        info: {
            login: "Send verification code through /login . It contains two params i.e. phonenumber and channel(sms/call)",
            verify: "Verify the received code through /verify . It contains two params i.e. phonenumber and code"
        }
    });
});

app.get('/login', (req, res) => {
    const phoneNumber = req.query.phonenumber;
    const channel = req.query.channel === 'call' ? 'call' : 'sms';

    if (phoneNumber) {
        client.verify.services(process.env.SERVICE_ID)
            .verifications
            .create({
                to: `+${phoneNumber}`,
                channel: channel
            })
            .then(data => {
                res.status(200).send({
                    message: "Verification is sent!!",
                    phonenumber: phoneNumber,
                    data
                });
            })
            .catch(error => {
                res.status(500).send({
                    message: "Error sending verification code",
                    error: error.message
                });
            });
    } else {
        res.status(400).send({
            message: "Wrong phone number :(",
            phonenumber: phoneNumber
        });
    }
});

app.get('/verify', (req, res) => {
    const phoneNumber = req.query.phonenumber;
    const code = req.query.code;

    if (phoneNumber && code && code.length === 4) {
        client.verify.services(process.env.SERVICE_ID)
            .verificationChecks
            .create({
                to: `+${phoneNumber}`,
                code: code
            })
            .then(data => {
                if (data.status === "approved") {
                    res.status(200).send({
                        message: "User is Verified!!",
                        data
                    });
                } else {
                    res.status(400).send({
                        message: "Code verification failed",
                        data
                    });
                }
            })
            .catch(error => {
                res.status(500).send({
                    message: "Error verifying code",
                    error: error.message
                });
            });
    } else {
        res.status(400).send({
            message: "Wrong phone number or code :(",
            phonenumber: phoneNumber
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running at ${port}`);
});
