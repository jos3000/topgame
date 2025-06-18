import { Scene } from "phaser";
import { Player } from "../actors/Player";

export class Game extends Scene {
  constructor() {
    super("Game");
  }

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private attackKey: Phaser.Input.Keyboard.Key;
  private runKey: Phaser.Input.Keyboard.Key;
  private player: Phaser.GameObjects.Sprite;
  private facing: "front" | "left" | "right" | "back" = "front";
  private status: "sword" | "unarmed" = "unarmed";
  private isAttacking: boolean = false;
  private currentAnim: string = "";
  private clients: Peer.DataConnection[] = [];
  private host: Peer.DataConnection | null = null;

  preload() {
    Player.preload(this);
  }

  create() {
    const isHost = window.location.search.includes("host");

      const peer = new Peer(isHost? 'topgame-host-hello-world': null, {debug: 2});


      peer.on('open', function(id) {
          console.log('My peer ID is: ' + id);
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
      });

      peer.on('disconnected', () => {
        console.log('Disconnected from PeerServer');
      });

      peer.on('close', () => {
        console.log('Connection closed');
      });

      peer.on('connection', (conn) => {
        console.log('Connection established with a client');
        conn.on('open', () => {
          console.log('Connected to client:', conn.peer);
          if (isHost) {
            conn.send("Hello from host!");
          } else {
            conn.send("Hello from client!");
          }
        });
        
        conn.on('data', (data) => {
          console.log('Received data from client:', data);
        })
        conn.on('error', (err) => {
          console.error('Connection error:', err);
        });
        this.clients.push(conn);
      });

      if(!isHost) {
        setTimeout(() => {
          console.log('Connecting to PeerServer as a client');
          const conn = peer.connect('topgame-host-hello-world');
          conn.on('open', () => {
            console.log('Connected to PeerServer as ' + conn.peer);
          });
          conn.on('data', (data) => {
            console.log('Received data from ' + conn.peer, data);
          });
          conn.on('error', (err) => {
            console.error('Connection error:', err);
          });
          conn.on('close', () => {
            console.log('Connection closed with ' + conn.peer);
          });
          this.host = conn;
        },2000)
      }
    


    // on open will be launch when you successfully connect to PeerServer


    Player.createAnimations(this);

    this.player = new Player(this, 400, 300);

    this.player.setTint(0xff00ff, 0xffff00, 0x0000ff, 0x00ff00);
    this.player.play(`${this.status}_idle_${this.facing}`);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.attackKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.runKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SHIFT
    );


  }

  update() {
    if (!this.player) return;
    let moving = false;
    let newFacing = this.facing;
    let pose = "idle";

    let speed = 2;

    if (this.runKey.isDown) {
      speed = 5;
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


    if (!this.isAttacking) {
      if (this.cursors.left.isDown) {
        this.player.x -= speed;
        newFacing = "left";
        moving = true;
      } else if (this.cursors.right.isDown) {
        this.player.x += speed;
        newFacing = "right";
        moving = true;
      }
      if (this.cursors.up.isDown) {
        this.player.y -= speed;
        newFacing = "back";
        moving = true;
      } else if (this.cursors.down.isDown) {
        this.player.y += speed;
        newFacing = "front";
        moving = true;
      }


      if(this.facing !== newFacing) {
        if(this.host){
          console.log("Sending facing change to host", newFacing);
          this.host.send({
            type: "facing",
            data: {
              facing: newFacing,
            }
          });
        }
        this.clients.forEach((client) => {
          console.log("Sending facing change to client", client.peer, newFacing);
          client.send({
            type: "facing",
            data: {
              facing: newFacing,
            }
          });
        })
      }

      if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
        this.isAttacking = true;
        pose = "attack";
        console.log("Attack initiated", `sword_attack_${newFacing}`);
        this.player
          .play(`sword_attack_${newFacing}`)
          .on("animationcomplete", () => {
            console.log("Attack animation completed");
            this.isAttacking = false;
          });
        return;
      }

      if (moving) {
        pose = speed > 3 ? "run" : "walk";
      } else {
        pose = "idle";
      }

      const anim = `${this.status}_${pose}_${newFacing}`;

      if (anim !== this.currentAnim) {      
        this.player.play({ key: anim, repeat: -1 }, true);
      }
      this.currentAnim = anim;
      this.facing = newFacing;
    }
  }
}
