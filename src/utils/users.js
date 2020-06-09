'use strict';

const users = [];

const addUser = ({ id, username, room }) => {
  // clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // validate the data
  if (!username || !room) {
    return {
      error: 'Username and room are required!'
    };
  }

  // check for existing user
  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });

  // validate username
  if (existingUser) {
    return {
      error: 'Username is in use!'
    };
  }

  // store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex(user => user.id === id);

  // index is -1 if didnt find match, 0 or greater if match found
  if (index !== -1) {
    return users.splice(index, 1)[0];
    // returns array of deleted items, also removes user from users array
  }
};

const getUser = (id) => {
  return users.find(user => user.id === id);
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter(user => user.room === room);
};

const getAllUsers = () => {
  return users;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  getAllUsers
};