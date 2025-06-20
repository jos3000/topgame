import { Scene } from "phaser";
import { Player } from "../actors/Player";
import { Peer } from "peerjs";
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
  private clients: Peer.DataConnection[] = [];
  private host: Peer.DataConnection | null = null;
  private controls: Controls | null = null;
  private text: Phaser.GameObjects.Text;

  preload() {
    Player.preload(this);
    this.load.plugin("rexvirtualjoystickplugin", "virtualjoystick.js", true);

    Controls.preload(this);
  }

  create() {
    this.text = this.add
      .text(10, 10, "", {
        font: "16px monospace",
        backgroundColor: "#000000",
      })
      .setScrollFactor(0);

    this.attackKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE) || null;
    this.controls = new Controls(this);
    const hostId = window.location.hash?.substring(1) || null;

    const peerId = localStorage.getItem("peerId") || "";

    const peer = new Peer(peerId, { debug: 2 });

    peer.on("open", function (id) {
      console.log("My peer ID is: " + id);
      localStorage.setItem("peerId", id); // Store the peer ID in localStorage
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
    });

    peer.on("disconnected", () => {
      console.log("Disconnected from PeerServer");
    });

    peer.on("close", () => {
      console.log("Connection closed");
    });

    peer.on("connection", (conn) => {
      console.log("Connection established with a client");
      conn.on("open", () => {
        console.log("Connected to client:", conn.peer);
        if (!hostId) {
          conn.send("Hello from host!");
        } else {
          conn.send("Hello from client!");
        }
      });

      conn.on("data", (data) => {
        console.log("Received data from client:", data);
      });
      conn.on("error", (err) => {
        console.error("Connection error:", err);
      });
      this.clients.push(conn);
    });

    if (hostId) {
      setTimeout(() => {
        console.log("Connecting to PeerServer as a client");
        const conn = peer.connect(hostId);
        conn.on("open", () => {
          console.log("Connected to PeerServer as " + conn.peer);
        });
        conn.on("data", (data) => {
          console.log("Received data from " + conn.peer, data);
        });
        conn.on("error", (err) => {
          console.error("Connection error:", err);
        });
        conn.on("close", () => {
          console.log("Connection closed with " + conn.peer);
        });
        this.host = conn;
      }, 2000);
    }

    Player.createAnimations(this);

    this.player = new Player(this, 400, 300);

    this.player.setTint(0xff00ff, 0xffff00, 0x0000ff, 0x00ff00);
    this.player.play(`${this.status}_idle_${this.facing}`);
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
