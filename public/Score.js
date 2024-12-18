import { sendEvent, gameAssetsData } from './Socket.js';

class Score {
  score = 0;
  HIGH_SCORE_KEY = 'highScore';
  stageChange = true;

  constructor(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
    this.currentStage = 1000;
    this.score = 0;
    this.stages = 1;
    this.nextStageScore = 100;
  }

  update(deltaTime) {
    this.score += deltaTime * 0.001 * gameAssetsData.stages.data[this.stages].scorePerSecond;
    if (Math.floor(this.score) === this.nextStageScore && this.stageChange) {
      this.stageChange = false;
      this.stages += 1;
      this.scorePerStage = gameAssetsData.stages.data[this.stages].scorePerSecond;
      this.nextStageScore = gameAssetsData.stages.data[this.stages + 1].score;
      const targetStage = this.currentStage + 1;
      sendEvent(11, {
        currentStage: this.currentStage,
        targetStage: targetStage,
      });
    }
  }

  getItem(itemId) {
    // 아이템 획득시 점수 변화
    this.score += itemId * 10;
  }

  reset() {
    this.score = 0;
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
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = '#525250';

    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const highScoreX = scoreX - 125 * this.scaleRatio;
    const stageX = 20 * this.scaleRatio; // 왼쪽 여백 20px

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
    const highScorePadded = highScore.toString().padStart(6, 0);
    const remainScore = (this.nextStageScore - Math.floor(this.score)).toString().padStart(3, 0);

    this.ctx.fillText(`STAGE ${this.stages}`, stageX, y);
    this.ctx.fillText(`HI ${highScorePadded}`, highScoreX, y);
    this.ctx.fillText(scorePadded, scoreX, y);
  }
}

export default Score;
