import { sendEvent } from './Socket.js';

class Score {
  score = 0;
  HIGH_SCORE_KEY = 'highScore';
  stageChange = true;

  constructor(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
    this.currentStage = 1000;
    this.scorePerSecond = 3;
    this.score = 0;
    this.stages = null;
  }

  update(deltaTime) {
    this.score += deltaTime * 0.001 * this.scorePerSecond;
    // 점수가 200점 이상이 될 시 서버에 메세지 전송
    if (Math.floor(this.score) >= 200 && this.stageChange) {
      this.stageChange = false;
      sendEvent(11, {
        currentStage: this.currentStage,
        targetStage: this.currentStage + 1,
      });
      this.stageChange = true;
      this.currentStage += 1;
    }
  }

  getItem(itemId) {
    this.score += itemId * 10;
  }

  reset() {
    this.score = 0;
    this.currentStageId = 1000;
    this.stageChange = true;
  }

  setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    if (this.score > highScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
    }
  }

  getScore() {
    return this.score;
  }

  draw() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = '#525250';

    // 점수와 최고점수 표시
    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const highScoreX = scoreX - 125 * this.scaleRatio;
    const topY = 20 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
    const highScorePadded = highScore.toString().padStart(6, 0);

    this.ctx.fillText(scorePadded, scoreX, topY);
    this.ctx.fillText(`HI ${highScorePadded}`, highScoreX, topY);

    // 현재 스테이지 표시
    const stageLevel = this.currentStageId - 999;
    const stageText = `STAGE ${stageLevel}`;

    // 스테이지 표시 위치 (왼쪽 상단)
    const stageX = 20 * this.scaleRatio;
    const stageY = topY;

    // 스테이지 텍스트 그리기
    this.ctx.fillStyle = '#525250';
    this.ctx.fillText(stageText, stageX, stageY);
  }
}

export default Score;
