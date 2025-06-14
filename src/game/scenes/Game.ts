import { Scene } from 'phaser';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    preload() {
        this.load.setPath('assets');
        this.load.spritesheet('example', 'example/Unarmed_Walk_full.png', { frameWidth: 30, frameHeight: 30, margin: 16, spacing: 34, startFrame: 2, endFrame: 1 });

    }

    create() {
        const animation = this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('example'),
            frameRate: 8
        });

        const sprite = this.add.sprite(100, 100, 'example').setScale(2);

        sprite.play({ key: 'walk', repeat: 100 });


    }
}
