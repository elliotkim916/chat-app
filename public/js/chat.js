/* eslint-disable no-console */
'use strict';

const socket = io();

// Elements
const $messageForm = document.querySelector('#messageForm');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
  // get new message element
  const $newMessage = $messages.lastElementChild;

  // get height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
  
  // visible height
  const visibleHeight = $messages.offsetHeight;
  
  // height of messages container
  const containerHeight = $messages.scrollHeight;

  // how far have I scrolled?
  // scrollTop - amount of distance we scrolled from the top of scrollbar
  const scrollOffset = $messages.scrollTop + visibleHeight;

  // checking to see if we were at the bottom before the last message was added
  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight; // this will push us to the bottom
    // scrollheight is the min height the element would require in order to fil all the content in the viewport without using a vertical scrollbar
  }
};

socket.on('message', ({ username, text, createdAt }) => {
  console.log(text);
  const html = Mustache.render(messageTemplate, {
    username,
    message: text,
    createdAt: moment(createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('locationMessage', ({ username, locationURL, createdAt }) => {
  console.log(locationURL);
  const html = Mustache.render(locationTemplate, {
    username,
    locationURL,
    createdAt: moment(createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('roomData', ({ room, users }) => {
  console.log(users);
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', e => {
  e.preventDefault();
  $messageFormButton.setAttribute('disabled', 'disabled');

  const msg = e.target.elements.message.value;

  socket.emit('sendMessage', msg, (error) => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log('Message delivered!');
  });
});

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.');
  }

  $sendLocationButton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition(({ coords : { latitude, longitude } }) => {
    const location = { latitude, longitude };

    socket.emit('sendLocation', location, () => {
      $sendLocationButton.removeAttribute('disabled');
      console.log('Location shared!');
    });
  });
});

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
// The join event is emitted when the chat.js file is loaded and parsed so right when we switch to the chat.html page.