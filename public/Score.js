import { sendEvent, gameAssetsData, isSocketReady } from './Socket.js';

class Score {
  score = 0;
  HIGH_SCORE_KEY = 'highScore';
  stageChange = true;
  unlockedItems = new Set();

  constructor(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
    this.currentStage = 1000;
    this.score = 0;
    this.stages = 1;
    this.nextStageScore = 200;

    if (isSocketReady && gameAssetsData) {
      this.checkItemUnlocks(this.currentStage);
    }
  }

  checkItemUnlocks(stageId) {
    if (!gameAssetsData || !gameAssetsData.itemUnlocks) {
      console.log('Game assets not loaded yet');
      return;
    }

    gameAssetsData.itemUnlocks.data.forEach((unlock) => {
      if (unlock.stage_id <= stageId) {
        this.unlockedItems.add(unlock.item_id);
      }
    });
  }

  update(deltaTime) {
    if (!isSocketReady || !gameAssetsData || !gameAssetsData.stages) {
      return;
    }

    // 현재 스테이지의 점수 증가율 적용
    this.score += deltaTime * 0.001 * gameAssetsData.stages.data[this.stages].scorePerSecond;

    // 다음 스테이지로 넘어갈 조건 확인
    if (Math.floor(this.score) >= this.nextStageScore && this.stageChange) {
      this.stageChange = false;
      this.stages += 1;
      this.currentStage += 1;

      // 서버에 스테이지 변경 이벤트 전송
      sendEvent(11, {
        currentStage: this.currentStage,
        targetStage: this.currentStage + 1,
        timestamp: Date.now(),
      });

      // 다음 스테이지 정보 가져오기
      const nextStage = gameAssetsData.stages.data.find(
        (stage) => stage.id === this.currentStage + 1,
      );

      if (nextStage) {
        this.nextStageScore = nextStage.score;
        this.stageChange = true;
        this.checkItemUnlocks(this.currentStage);
      }
    }
  }

  isItemUnlocked(itemId) {
    if (!isSocketReady) {
      console.log('Socket not ready');
      return false;
    }
    const isUnlocked = this.unlockedItems.has(itemId);
    return isUnlocked;
  }

  getItem(itemId) {
    // 아이템 획득시 점수 변화
    this.score += gameAssetsData.items.data[itemId - 1].score;
  }

  reset() {
    this.score = 0;
    this.stages = 1;
    this.currentStage = 1000; // 현재 스테이지 초기화
    this.nextStageScore = 200; // 다음 스테이지 점수 초기화
    this.stageChange = true; // 스테이지 변경 여부 초기화
    this.unlockedItems = new Set(); // 해금된 아이템 목록 초기화

    // 초기 스테이지의 아이템 해금 상태 체크
    if (isSocketReady && gameAssetsData) {
      this.checkItemUnlocks(this.currentStage);
    }
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
