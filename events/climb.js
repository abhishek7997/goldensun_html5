import { maps } from '../maps/maps.js';
import { main_char_list } from '../chars/main_char_list.js';
import * as collision from '../events/collision.js';

export function climbing_event(data) {
    game.physics.p2.pause();
    if (data.current_event.change_to_collision_layer !== null) {
        collision.change_map_body(data, data.current_event.change_to_collision_layer);
    }
    if (!data.climbing) {
        if (data.current_event.activation_direction === "down") {
            data.on_event = true;
            data.event_activation_process = false;
            data.hero.loadTexture(data.hero_name + "_climb");
            main_char_list[data.hero_name].setAnimation(data.hero, "climb");
            data.hero.animations.play("climb_start", 9, false, true);
        } else if (data.current_event.activation_direction === "up") {
            data.on_event = true;
            data.event_activation_process = false;
            data.hero.loadTexture(data.hero_name + "_climb");
            main_char_list[data.hero_name].setAnimation(data.hero, "climb");
            data.hero.animations.play("climb_idle");
            const out_time = Phaser.Timer.QUARTER/3;
            const x_tween = maps[data.map_name].sprite.tileWidth*(parseFloat(data.current_event.x) + 1/2);
            const y_tween = data.hero.y - 15;
            game.add.tween(data.hero.body).to(
                { x: x_tween, y: y_tween },
                out_time,
                Phaser.Easing.Linear.None,
                true
            );
            game.time.events.add(out_time + 50, () => {
                game.physics.p2.resume();
                data.on_event = false;
                data.climbing = true;
                data.current_event = null;
            }, this);
            data.shadow.visible = false;
            data.actual_action = "climb";
            data.actual_direction = "idle";
        }
    } else if (data.climbing) {
        if (data.current_event.activation_direction === "up") {
            data.on_event = true;
            data.event_activation_process = false;
            data.hero.animations.play("climb_end", 8, false, false);
            data.shadow.visible = false;
            const time = Phaser.Timer.QUARTER;
            game.add.tween(data.hero.body).to(
                { y: data.hero.y - 12 },
                time,
                Phaser.Easing.Linear.None,
                true
            );
        } else if (data.current_event.activation_direction === "down") {
            data.on_event = true;
            data.event_activation_process = false;
            data.hero.loadTexture(data.hero_name + "_idle");
            main_char_list[data.hero_name].setAnimation(data.hero, "idle");
            data.hero.animations.play("idle_up");
            const out_time = Phaser.Timer.QUARTER/3;
            game.add.tween(data.hero.body).to(
                { y: data.hero.y + 15 },
                out_time,
                Phaser.Easing.Linear.None,
                true
            );
            game.time.events.add(out_time + 50, () => {
                game.physics.p2.resume();
                data.on_event = false;
                data.climbing = false;
                data.current_event = null;
            }, this);
            data.shadow.y = data.hero.y;
            data.shadow.visible = true;
            data.actual_action = "idle";
            data.actual_direction = "up";
        }
    }
}

export function climb_event_animation_steps(data) {
    if (data.hero.animations.frameName === "climb/start/03") {
        data.shadow.visible = false;
        const x_tween = maps[data.map_name].sprite.tileWidth*(parseFloat(data.current_event.x) + 1/2);
        const y_tween = data.hero.y + 25;
        game.add.tween(data.hero.body).to(
            { x: x_tween, y: y_tween },
            500,
            Phaser.Easing.Linear.None,
            true
        );
    } else if (data.hero.animations.frameName === "climb/start/06") {
        data.hero.animations.play("climb_idle", 9);
        data.on_event = false;
        data.climbing = true;
        data.actual_action = "climb";
        data.current_event = null;
        game.physics.p2.resume();
    } else if (data.hero.animations.frameName === "climb/end/02") {
        game.time.events.add(150, () => {
            game.add.tween(data.hero.body).to(
                { y: data.hero.y - 6 },
                70,
                Phaser.Easing.Linear.None,
                true
            );
            data.hero.loadTexture(data.hero_name + "_idle");
            main_char_list[data.hero_name].setAnimation(data.hero, "idle");
            data.hero.animations.play("idle_up");
            game.time.events.add(120, () => {
                data.shadow.y = data.hero.y;
                data.shadow.visible = true;
                data.on_event = false;
                data.climbing = false;
                data.actual_action = "idle";
                data.actual_direction = "up";
                data.current_event = null;
                game.physics.p2.resume();
            }, this);
        }, this);
    }
}