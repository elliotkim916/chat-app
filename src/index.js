/* eslint-disable no-console */
'use strict';

const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
  console.log('New WebSocket connection!');

  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit('message', generateMessage('Admin', 'Welcome!'));
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  socket.on('sendMessage', (msg, callback) => {
    const filter = new Filter();
    const user = getUser(socket.id);

    if (filter.isProfane(msg)) {
      return callback('Profanity is not allowed!');
    }

    io.to(user.room).emit('message', generateMessage(user.username, msg));
    callback();
  });

  socket.on('sendLocation', ({ latitude, longitude }, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`));
    callback();
  });

  socket.on('disconnect', () => {
    const removedUser = removeUser(socket.id);

    if (removedUser) {
      io.to(removedUser.room).emit('message', generateMessage('Admin', `${removedUser.username} has left!`));
      io.to(removedUser.room).emit('roomData', {
        room: removedUser.room,
        users: getUsersInRoom(removedUser.room)  
      });
    }
  });
});

server.listen(port, () => {
  console.log('Listening on PORT ' + port);
});