import { Scene } from "phaser";
import { Player } from "../actors/Player";
import { Controls } from "../Controls";

export class Game extends Scene {
  constructor() {
    super("Game");
  }

  private player: Phaser.GameObjects.Sprite;
  private controls: Controls | null = null;
  private text: Phaser.GameObjects.Text;

  preload() {
    Player.preload(this);
    Controls.preload(this);
    // generate a texture with grey, black and white for tiles without loading a png
    const canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }
    ctx.fillStyle = "#808080"; // grey
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#000000"; // black
    ctx.fillRect(32, 0, 64, 32);
    ctx.fillStyle = "#ffffff"; // white
    ctx.fillRect(64, 0, 96, 32);

    const texture = this.textures.addCanvas("walls_floor", canvas);

    document.body.appendChild(canvas);

    texture?.refresh();
  }

  create() {
    const map = this.make.tilemap({
      // data: tileIdxArray,  // [ [], [], ... ]
      tileWidth: 32,
      tileHeight: 32,
      width: 10,
      height: 10,
    });

    const tileset = map.addTilesetImage("tileset", "walls_floor", 32, 32, 0, 0);
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
    layer.fill(1, 0, Math.floor(map.height / 2), Math.floor(map.width / 2), 1); // bottom wall

    // set index 1 tiles to be collidable
    layer.setCollisionBetween(1, 1);

    // Enable physics for player and constrain to layer
    this.physics.world.setBounds(0, 0, layer.displayWidth, layer.displayHeight);

    this.controls = new Controls(this);

    Player.createAnimations(this);

    this.player = new Player(this, 400, 300);
    this.physics.add.collider(this.player, layer);

    this.cameras.main.setBounds(0, 0, layer.displayWidth, layer.displayHeight);
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

    this.text = this.add
      .text(10, 10, "", {
        font: "16px monospace",
        backgroundColor: "#000000",
      })
      .setScrollFactor(0);

    this.physics.world.createDebugGraphic();
  }

  update() {
    if (!this.player) return;
    const debug: string[] = [];
    const input = this.controls?.getInput();
    const body = this.player.body;
    this.player.update();

    if (input && body instanceof Phaser.Physics.Arcade.Body) {
      debug.push(`Body Velocity: (${body.velocity.x.toFixed(2)}, ${body.velocity.y.toFixed(2)})`);

      const speed = input.force * 400; // Arcade physics uses pixels/second

      if (input.angle !== null && speed > 0) {
        body.setVelocity(
          Math.cos(Phaser.Math.DegToRad(input.angle)) * speed,
          Math.sin(Phaser.Math.DegToRad(input.angle)) * speed
        );
      } else {
        body.setVelocity(0, 0);
      }

      debug.push(`Position: (${this.player.x.toFixed(2)}, ${this.player.y.toFixed(2)})`);
      debug.push(`Force: ${input.force.toFixed(2)}`);
      debug.push(`Angle: ${input.angle}`);
      debug.push(`Input Velocity: (${body.velocity.x.toFixed(2)}, ${body.velocity.y.toFixed(2)})`);
    }

    this.text.setText(debug.join("\n"));
  }
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
