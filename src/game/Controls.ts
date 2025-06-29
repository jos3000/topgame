export class Controls {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private attackKey: Phaser.Input.Keyboard.Key | null = null;
  private runKey: Phaser.Input.Keyboard.Key | null = null;
  private joyStick: { angle: number; force: number } | null = null;
  private attackButton: Phaser.GameObjects.Arc | null = null;
  private attackButtonPressed: boolean = false;

  static preload(scene: Phaser.Scene) {
    scene.load.plugin("rexvirtualjoystickplugin", "virtualjoystick.js", true);
  }

  constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (keyboard) {
      this.cursors = keyboard.createCursorKeys();
      this.attackKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.runKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    }

    const plugin = scene.plugins?.get("rexvirtualjoystickplugin") as any | null;

    if (plugin) {
      this.joyStick = plugin.add(scene, {
        x: 200,
        y: 650,
        radius: 100,
        forceMin: 30,
        forceMax: 100,
        base: scene.add.circle(0, 0, 100, 0x888888),
        thumb: scene.add.circle(0, 0, 50, 0xcccccc),
      });
    }

    // Add attack button (right side)
    this.attackButton = scene.add
      .circle(scene.cameras.main.width - 150, scene.cameras.main.height - 150, 60, 0xff4444)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    scene.add
      .text(scene.cameras.main.width - 150, scene.cameras.main.height - 150, "⚔", {
        font: "48px sans-serif",
        color: "#fff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.attackButton.on("pointerdown", () => {
      this.attackButtonPressed = true;
    });
    this.attackButton.on("pointerup", () => {
      this.attackButtonPressed = false;
    });
    this.attackButton.on("pointerout", () => {
      this.attackButtonPressed = false;
    });
  }

  getInput() {
    // angle from plugin as clockwise degrees with right as 0 degrees
    const joyStickAngle = (this.joyStick?.angle ? (360 + this.joyStick.angle) % 360 : null) || null;
    // force from plugin as a value between 0 and 100
    const joyStickForce = Math.min(this.joyStick?.force || 0, 100) || null;

    // calculate the angle of the cursor keys in the 8 directions
    const up = this.cursors?.up.isDown || false;
    const down = this.cursors?.down.isDown || false;
    const left = this.cursors?.left.isDown || false;
    const right = this.cursors?.right.isDown || false;

    const cursorAngle =
      up && !down && !left && !right
        ? 270
        : down && !up && !left && !right
        ? 90
        : left && !right && !up && !down
        ? 180
        : right && !left && !up && !down
        ? 0
        : up && left && !down && !right
        ? 225
        : up && right && !down && !left
        ? 315
        : down && left && !up && !right
        ? 135
        : down && right && !up && !left
        ? 45
        : null;

    const cursorForce = cursorAngle !== null ? (this.runKey?.isDown ? 100 : 60) : null;

    const angle = joyStickAngle ?? cursorAngle ?? null;
    const force = (joyStickForce ?? cursorForce ?? 0) / 100;
    const attack = this.attackKey?.isDown || this.attackButtonPressed || false;

    return {
      angle,
      force,
      attack,
    };
  }
}
