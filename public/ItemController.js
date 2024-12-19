import Item from './Item.js';
import { gameAssetsData, isSocketReady } from './Socket.js';

class ItemController {
  INTERVAL_MIN = 1200;
  INTERVAL_MAX = 3000;

  nextInterval = null;
  items = [];

  constructor(ctx, itemImages, scaleRatio, speed, score) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.itemImages = itemImages;
    this.scaleRatio = scaleRatio;
    this.speed = speed;
    this.score = score;

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
      const unlockedItemImages = this.itemImages.filter((item) => {
        return this.score.isItemUnlocked(item.id);
      });

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
    } catch (error) {}
  }

  update(gameSpeed, deltaTime) {
    if (this.nextInterval <= 0) {
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
