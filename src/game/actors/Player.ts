export class Player extends Phaser.GameObjects.Sprite {
  // private isAttacking: boolean = false;
  private facing: "front" | "left" | "right" | "back" = "front";
  private status: "sword" | "unarmed" = "unarmed";

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
          length: Array.isArray(length) ? (direction !== "back" ? length[0] : length[1]) : length,
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
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setScale(4);
    this.play("unarmed_idle_front");

    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      const playerWidth = this.width;
      const playerHeight = this.height;

      const shadowWidth = playerWidth / 2;
      const shadowHeight = 10;

      const offsetX = (playerWidth - shadowWidth) / 2;
      const offsetY = playerHeight - shadowHeight;

      // Set the physics body size and offset
      this.body.setCollideWorldBounds(true);
      this.body.setSize(shadowWidth, shadowHeight, true); // The 'true' here is important for using custom offsets
      this.body.setOffset(offsetX, offsetY);
    }
  }

  update() {
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      const vx = this.body.velocity.x;
      const vy = this.body.velocity.y;

      const speed = Math.sqrt(vx * vx + vy * vy);

      const facing =
        speed < 20
          ? this.facing
          : vx > vy && vx > -vy
          ? "right"
          : vx < vy && vx < -vy
          ? "left"
          : vy > vx && vy > -vx
          ? "front"
          : "back";

      const pose = speed > 300 ? "run" : speed > 20 ? "walk" : "idle";
      const anim = `${this.status}_${pose}_${facing}`;
      this.facing = facing || this.facing;
      this.play({ key: anim, repeat: -1 }, true);
    }
  }
}

// if (this.attackKey && Phaser.Input.Keyboard.JustDown(this.attackKey)) {
//   this.isAttacking = true;
//   pose = "attack";
//   console.log("Attack initiated", `sword_attack_${newFacing}`);
//   this.player.play(`sword_attack_${newFacing}`).on("animationcomplete", () => {
//     console.log("Attack animation completed");
//     this.isAttacking = false;
//   });
//   if (body) body.setVelocity(0, 0); // Stop movement during attack
//   return;
// }
