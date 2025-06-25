import { Scene, GameObjects, Physics } from "phaser";

export class Bot extends Physics.Arcade.Sprite {
  private speed: number = 80;
  private target: GameObjects.Sprite | null = null;
  private facing: "front" | "left" | "right" | "back" = "front";
  private isAttacking: boolean = false;
  private currentAnim: string = "";
  private attackRange: number = 60;
  private attackCooldown: number = 1000; // ms
  private lastAttack: number = 0;
  private health: number = 3;

  constructor(scene: Scene, x: number, y: number, target?: GameObjects.Sprite) {
    super(scene, x, y, "player");
    this.target = target || null;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    (this.body as Physics.Arcade.Body).setCollideWorldBounds(true);
    this.setScale(4);
    this.setTint(0xff0000, 0xff0000, 0xff0000, 0xff0000);
    this.play("unarmed_idle_front");
  }

  setTarget(target: GameObjects.Sprite) {
    this.target = target;
  }

  public takeDamage(amount: number = 1) {
    this.health -= amount;
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => this.clearTint(), [], this);
    if (this.health <= 0) {
      this.destroy();
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.target) return;
    if (this.isAttacking) return;

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Facing logic
    let angle = Phaser.Math.RadToDeg(Math.atan2(dy, dx));
    if (angle < 0) angle += 360;
    if (angle < 45 || angle >= 315) this.facing = "right";
    else if (angle <= 135) this.facing = "front";
    else if (angle <= 225) this.facing = "left";
    else this.facing = "back";

    if (dist > this.attackRange) {
      // Move toward player
      const vx = (dx / dist) * this.speed;
      const vy = (dy / dist) * this.speed;
      (this.body as Physics.Arcade.Body).setVelocity(vx, vy);
      const anim = `unarmed_walk_${this.facing}`;
      if (anim !== this.currentAnim) {
        this.play({ key: anim, repeat: -1 }, true);
        this.currentAnim = anim;
      }
    } else {
      // Attack
      (this.body as Physics.Arcade.Body).setVelocity(0, 0);
      if (time - this.lastAttack > this.attackCooldown) {
        this.isAttacking = true;
        this.play(`sword_attack_${this.facing}`).once("animationcomplete", () => {
          this.isAttacking = false;
          this.lastAttack = time;
        });
      } else {
        const anim = `unarmed_idle_${this.facing}`;
        if (anim !== this.currentAnim) {
          this.play({ key: anim, repeat: -1 }, true);
          this.currentAnim = anim;
        }
      }
    }
  }
}
