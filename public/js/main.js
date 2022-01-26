const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const socket = io();
const roomName = document.getElementById('room-name')
const ListUser = document.getElementById('users')
//get username and room name
const {username, room} = Qs.parse(location.search,{
  ignoreQueryPrefix: true
})
// join chat
socket.emit('joinRoom', {username, room})
// get room & users
socket.on('roomUsers', ({room, users})=>{
  outputRoomName(room)
  outputUsers(users)
})
// message from server
socket.on('message', message =>{
  console.log(message)
  outputMessage(message)
  // get room & users
  socket.on('roomUsers',({room, users})=>{
    outputRoomName(room)
    outputUsers(users)
  })
  // autoscroll
  chatMessages.scrollTop = chatMessages.scrollHeight
})

// message submit
chatForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  // get msg text
  const msg = e.target.elements.msg.value
  // emit message to server
  socket.emit('chatMessage', msg)
  // clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus()
})

// output message to html
function outputMessage(message) {
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = ` <p class="meta">${message.username}<span>${message.time}</span></p>
  <p class="text">${message.text}</p>`;
  document.querySelector('.chat-messages').appendChild(div)
}

// add room name to document
function outputRoomName(room){
  roomName.innerText = room
}
// add users to domain
function outputUsers(users){
  ListUser.innerText = `
  ${users.map(user => `<li>${user.username}</li>`).join('')}
  `
}