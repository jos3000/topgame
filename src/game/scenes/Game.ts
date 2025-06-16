import { Scene } from "phaser";

export class Game extends Scene {
  constructor() {
    super("Game");
  }

  preload() {
    this.load.setPath("assets");
    this.load.spritesheet("player", "spritesheet.png", {
      frameWidth: 30,
      frameHeight: 30,
      margin: 16,
      spacing: 34,
    });
  }

  create() {
    const anims = [
      {
        status: "unarmed",
        poses: [
          { pose: "idle", length: [12, 4] },
          { pose: "walk", length: 6 },
          { pose: "run", length: 8 },
          { pose: "hurt", length: 5 },
          { pose: "die", length: 7 },
        ],
      },
      {
        status: "sword",
        poses: [
          { pose: "idle", length: [12, 4] },
          { pose: "walk", length: 6 },
          { pose: "run", length: 8 },
          { pose: "hurt", length: 5 },
          { pose: "die", length: 7 },
          { pose: "attack", length: 8 },
          { pose: "attackwalk", length: 8 },
          { pose: "attackrun", length: 6 },
        ],
      },
    ].flatMap(({ status, poses }) => {
      return poses.flatMap(({ pose, length }) => {
        return ["front", "left", "right", "back"].flatMap((direction) => ({
          status,
          pose,
          direction,
          length: Array.isArray(length)
            ? direction !== "back"
              ? length[0]
              : length[1]
            : length,
        }));
      });
    });

    const keys = [];

    for (let index = 0; index < anims.length; index++) {
      const { direction, status, pose, length } = anims[index];
      const key = `${status}_${pose}_${direction}`;
      keys.push(key);

      this.anims.create({
        key,
        frames: this.anims.generateFrameNames("player", {
          start: index * 12,
          end: index * 12 + length - 1,
        }),
        frameRate: 12,
        repeat: 1,
      });
    }

    const sprite = this.add.sprite(100, 100, "idle").setScale(4);

    sprite.play('idle');
  }
}
