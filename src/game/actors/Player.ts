export class Player extends Phaser.GameObjects.Sprite {
  static preload(scene: Phaser.Scene) {
    scene.load.setPath("assets");
    scene.load.spritesheet("player", "spritesheet.png", {
      frameWidth: 30,
      frameHeight: 30,
      margin: 16,
      spacing: 34,
    });
  }

  static createAnimations(scene: Phaser.Scene) {
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

    for (let index = 0; index < anims.length; index++) {
      const { direction, status, pose, length } = anims[index];
      const key = `${status}_${pose}_${direction}`;

      if (!scene.anims.exists(key)) {
        scene.anims.create({
          key,
          frames: scene.anims.generateFrameNames("player", {
            start: index * 12,
            end: index * 12 + length - 1,
          }),
          frameRate: 12,
          repeat: 0,
        });
      }
    }
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "unarmed_idle_front");
    this.scene.add.existing(this);
    this.setOrigin(0.5, 0.5);
    this.setScale(2);
    this.play("unarmed_idle_front");
  }
}
