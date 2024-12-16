import { gameEnd, gameStart } from './game.handler.js';
import { moveStageHandler } from './stage.handlers.js';

const handelrMappings = {
  2: gameStart,
  3: gameEnd,
  11: moveStageHandler,
};

export default handelrMappings;
