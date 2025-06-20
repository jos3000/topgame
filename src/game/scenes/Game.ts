import { Scene } from "phaser";
import { Player } from "../actors/Player";
import { Controls } from "../Controls";

export class Game extends Scene {
  constructor() {
    super("Game");
  }

  private attackKey: Phaser.Input.Keyboard.Key | null = null;
  private player: Phaser.GameObjects.Sprite;
  private facing: "front" | "left" | "right" | "back" = "front";
  private status: "sword" | "unarmed" = "unarmed";
  private isAttacking: boolean = false;
  private currentAnim: string = "";
  private controls: Controls | null = null;
  private text: Phaser.GameObjects.Text;

  preload() {
    Player.preload(this);
    Controls.preload(this);
    this.load.setPath("assets");
    this.load.spritesheet("walls_floor", "walls_floor.png", {
      frameWidth: 64,
      frameHeight: 64,
      margin: 0,
      spacing: 100,
    });
  }

  create() {
    const map = this.make.tilemap({
      // data: tileIdxArray,  // [ [], [], ... ]
      tileWidth: 32,
      tileHeight: 32,
      width: 10,
      height: 10,
    });

    const tileset = map.addTilesetImage("tileset", "walls_floor");
    if (!tileset) {
      throw new Error("Failed to create layer");
    }
    const layer = map.createBlankLayer("base", tileset);
    if (!layer) {
      throw new Error("Failed to create layer");
    }

    layer.setCollisionByProperty({ collides: true });
    layer.setScale(4);
    // add four walls around the map
    layer.fill(1, 0, 0, map.width, 1); // top wall
    layer.fill(1, 0, map.height - 1, map.width, 1); // bottom wall
    layer.fill(1, 0, 0, 1, map.height); // left wall
    layer.fill(1, map.width - 1, 0, 1, map.height); // right wall

    // Remove collision for player (do not enable physics overlap/collision)
    // If physics was previously enabled, ensure player is not added to physics system

    this.attackKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE) || null;
    this.controls = new Controls(this);

    Player.createAnimations(this);

    this.player = new Player(this, 400, 300);

    this.player.setTint(0xff00ff, 0xffff00, 0x0000ff, 0x00ff00);
    this.player.play(`${this.status}_idle_${this.facing}`);

    this.cameras.main.setBounds(0, 0, layer.displayWidth, layer.displayHeight);
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

    this.text = this.add
      .text(10, 10, "", {
        font: "16px monospace",
        backgroundColor: "#000000",
      })
      .setScrollFactor(0);
  }

  static angleToFacing(angle: number): "front" | "left" | "right" | "back" {
    if (angle < 45 || angle >= 315) return "right";
    if (angle <= 135) return "front"; // priortise front for diagonals
    if (angle <= 225) return "left";
    return "back";
  }

  //joystick
  //buttons
  // collision

  // -> changes based on rules

  //position
  //facing
  //speed
  //state

  // -> makes animation

  //animation and position and sound

  update() {
    if (!this.player) return;
    let pose = "idle";
    const debug: string[] = [];

    const input = this.controls?.getInput();

    if (!input) return;

    const speed = input.force * 5;

    const newFacing = input.angle !== null ? Game.angleToFacing(input.angle) : this.facing;

    if (input.angle !== null) {
      this.player.x += Math.cos(Phaser.Math.DegToRad(input.angle)) * speed;
      this.player.y += Math.sin(Phaser.Math.DegToRad(input.angle)) * speed;
    }
    debug.push(`Position: (${this.player.x.toFixed(2)}, ${this.player.y.toFixed(2)})`);
    debug.push(`Speed: ${speed.toFixed(2)}`);
    debug.push(`Facing: ${newFacing} ${this.facing}`);
    debug.push(`Angle: ${input.angle}`);

    if (!this.isAttacking) {
      if (this.attackKey && Phaser.Input.Keyboard.JustDown(this.attackKey)) {
        this.isAttacking = true;
        pose = "attack";
        console.log("Attack initiated", `sword_attack_${newFacing}`);
        this.player.play(`sword_attack_${newFacing}`).on("animationcomplete", () => {
          console.log("Attack animation completed");
          this.isAttacking = false;
        });
        return;
      }

      if (speed > 1) {
        pose = speed > 3 ? "run" : "walk";
      } else {
        pose = "idle";
      }

      const anim = `${this.status}_${pose}_${newFacing}`;

      if (anim !== this.currentAnim) {
        this.player.play({ key: anim, repeat: -1 }, true);
        this.currentAnim = anim;
      }
      this.facing = newFacing || this.facing;
    }

    this.text.setText(debug.join("\n"));
  }
}
