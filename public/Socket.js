import { CLIENT_VERSION } from './Constants.js';

const socket = io('http://localhost:3000', {
  query: {
    clientVersion: CLIENT_VERSION,
  },
});

let gameAssetsData = null;
let isSocketReady = false;

socket.on('gameAssets', (data) => {
  gameAssetsData = data;
  isSocketReady = true;
  console.log('Game assets loaded:', gameAssetsData);
});

let userId = null;
socket.on('response', (data) => {
  console.log('Server response:', data);
  if (data.status === 'success' && data.stageData) {
    // 서버로부터 받은 스테이지 데이터 처리
    console.log('Stage update successful:', data.stageData);
  } else if (data.status === 'fail') {
    console.error('Stage update failed:', data.message);
  }
});

socket.on('connection', (data) => {
  console.log('connection: ', data);
  userId = data.uuid;
});

const sendEvent = (handlerId, payload) => {
  socket.emit('event', {
    userId,
    clientVersion: CLIENT_VERSION,
    handlerId,
    payload,
  });
};

export { sendEvent, gameAssetsData, isSocketReady };
