import Item from './Item.js';
import { gameAssetsData, isSocketReady } from './Socket.js';

class ItemController {
  INTERVAL_MIN = 0;
  INTERVAL_MAX = 4000;

  nextInterval = null;
  items = [];

  constructor(ctx, itemImages, scaleRatio, speed, score) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.itemImages = itemImages;
    this.scaleRatio = scaleRatio;
    this.speed = speed;
    this.score = score;

    console.log('Score instance in constructor:', this.score);

    if (!score) {
      console.error('Score instance not provided to ItemController');
    }

    this.setNextItemTime();
  }

  setNextItemTime() {
    this.nextInterval = this.getRandomNumber(this.INTERVAL_MIN, this.INTERVAL_MAX);
  }

  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  createItem() {
    if (!isSocketReady || !gameAssetsData) {
      console.log('Waiting for socket connection and game assets...');
      return;
    }

    if (!this.score || typeof this.score.isItemUnlocked !== 'function') {
      console.error('Invalid Score instance');
      return;
    }

    try {
      console.log('Available items:', this.itemImages);
      const unlockedItemImages = this.itemImages.filter((item) => {
        console.log(`Checking item ${item.id}`);
        return this.score.isItemUnlocked(item.id);
      });

      console.log('Unlocked items:', unlockedItemImages);

      if (unlockedItemImages.length === 0) {
        console.log('No unlocked items available yet');
        return;
      }

      const index = this.getRandomNumber(0, unlockedItemImages.length - 1);
      const itemInfo = unlockedItemImages[index];
      const x = this.canvas.width * 1.5;
      const y = this.getRandomNumber(10, this.canvas.height - itemInfo.height);

      const item = new Item(
        this.ctx,
        itemInfo.id,
        x,
        y,
        itemInfo.width,
        itemInfo.height,
        itemInfo.image,
      );

      this.items.push(item);
      console.log(`아이템 생성 성공: ID ${itemInfo.id}, 위치 (${x}, ${y})`);
    } catch (error) {
      console.error('아이템 생성 중 오류:', error);
    }
  }

  update(gameSpeed, deltaTime) {
    if (this.nextInterval <= 0) {
      console.log('Attempting to create new item...');
      this.createItem();
      this.setNextItemTime();
    }

    this.nextInterval -= deltaTime;

    this.items.forEach((item) => {
      item.update(this.speed, gameSpeed, deltaTime, this.scaleRatio);
    });

    // 화면 밖으로 나간 아이템 제거
    const initialLength = this.items.length;
    this.items = this.items.filter((item) => item.x > -item.width);
    if (initialLength !== this.items.length) {
      console.log('아이템 제거됨:', initialLength - this.items.length);
    }
  }

  draw() {
    this.items.forEach((item) => item.draw());
  }

  collideWith(sprite) {
    const collidedItem = this.items.find((item) => item.collideWith(sprite));
    if (collidedItem) {
      this.ctx.clearRect(collidedItem.x, collidedItem.y, collidedItem.width, collidedItem.height);
      return {
        itemId: collidedItem.id,
      };
    }
  }

  reset() {
    this.items = [];
    this.nextInterval = null;
    this.setNextItemTime();
  }
}

export default ItemController;
