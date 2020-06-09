'use strict';

const socket = io();

// Elements
const $newRoomInput = document.querySelector('#room-name');
const $activeRoomOptions = document.querySelector('#active-room-options');
const $activeRoomsLabel = document.querySelector('#active-rooms-label');

// Templates
const roomsTemplate = document.querySelector('#rooms-template').innerHTML;

socket.on('landed', (users) => {
  let html = null;
  $activeRoomsLabel.style.display = 'none';
  $activeRoomOptions.style.display = 'none';
  
  if (users.length > 0) {
    html = Mustache.render(roomsTemplate, {
      users
    });

    $activeRoomsLabel.style.display = 'block';
    $activeRoomOptions.style.display = 'block';
    $activeRoomOptions.innerHTML = html;
  } 
});

$newRoomInput.addEventListener('input', e => {
  e.target.value.length > 0 ? $activeRoomOptions.disabled = true : $activeRoomOptions.disabled = false;
});

$activeRoomOptions.addEventListener('change', e => {
  e.target.value === 'Reset' ?  $newRoomInput.disabled = false : $newRoomInput.disabled = true;
});