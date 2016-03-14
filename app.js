"use strict";

const MilkCocoa = require('milkcocoa');
const inbox = require('inbox');
const nodemailer = require('nodemailer');
const iconv = require('iconv');
const conv = new iconv.Iconv("UTF-8", "UTF-8");
const MailParser = require("mailparser").MailParser;
const mailparser = new MailParser();
const config = require('./config');
const milkcocoa = new MilkCocoa(config.milkcocoa);
const ds = milkcocoa.dataStore('nippo');

const auth = {user: config.mail.user, pass: config.mail.pass};

var imap = inbox.createConnection(false, 'imap.gmail.com', {secureConnection: true, auth});

imap.on('connect', function() {
    console.log('connected');
    imap.openMailbox('INBOX', function(error) {
        if (error) throw error;
    });
});

imap.connect();

imap.on("new", function(message) {
    console.log('日時:' + message.date);
    console.log('送信者:' + message.from.name + '-' + message.from.address);
    console.log('タイトル:' + message.title);

    imap
    .createMessageStream(message.UID)
    .pipe(mailparser)
    .on("end", function(mail) {
        console.log(mail.text);
        ds.push({v:mail.text}, (err, sended) => {
          console.log('送信:', sended);
        });
    });
});
