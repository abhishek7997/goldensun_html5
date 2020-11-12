import {StatusComponent} from "./StatusComponent";
import {Window} from "../Window";
import {GoldenSun} from "../GoldenSun";
import {CursorManager, PointVariants} from "../utils/CursorManager";
import {BattleStatusWindow} from "../windows/battle/BattleStatusWindow";
import {Ability} from "../Ability";
import {PageIndicatorModes} from "./PageIndicator";
import {StatusItems} from "./StatusItems";

export class StatusPsynergy extends StatusComponent {
    private static readonly CURSOR = {
        X: 0,
        Y: 79,
    };
    private static readonly HIGHLIGHT = {
        X: 8,
        Y: 72,
        WIDTH: 160,
        HEIGHT: 8,
    };
    private static readonly PSYNERGY = {
        ICON_X: 9,
        ICON_Y: 70,
        NAME_X: 24,
        NAME_Y: 72,
        PP_LABEL_X: 96,
        PP_LABEL_Y: 72,
        PP_VALUE_END_X: 125,
        PP_VALUE_Y: 72,
        STAR_X: 129,
        STAR_Y: 73,
        RANGE_CENTER_X: 148,
        RANGE_Y: 72,
    };
    private static readonly PAGE_INDICATOR_ANCHOR = {
        X: 171,
        Y: 64,
    };

    private static readonly MAX_LINES = 4;
    private static readonly SHIFT = 16;

    private battle_abilities: Ability[][];

    public constructor(
        game: Phaser.Game,
        data: GoldenSun,
        window: Window,
        manager: BattleStatusWindow,
        pos?: {line: number; col: number}
    ) {
        super(game, data, window, manager, pos);
    }

    public select_option() {
        const highlight = {
            x: StatusPsynergy.HIGHLIGHT.X,
            y: StatusPsynergy.HIGHLIGHT.Y + StatusPsynergy.SHIFT * this.current_line,
            width: StatusPsynergy.HIGHLIGHT.WIDTH,
            height: StatusPsynergy.HIGHLIGHT.HEIGHT,
        };
        this.update_highlight(highlight);

        const cursor_x = StatusPsynergy.CURSOR.X;
        const cursor_y = StatusPsynergy.CURSOR.Y + StatusPsynergy.SHIFT * this.current_line;

        const cursor_tween = {type: CursorManager.CursorTweens.POINT, variant: PointVariants.SHORT};
        this.data.cursor_manager.move_to({x: cursor_x, y: cursor_y}, {animate: false, tween_config: cursor_tween});

        this.window.page_indicator.select_page(this.current_col);
    }

    public on_change() {
        this.select_option();

        const chosen_ability = this.battle_abilities[this.current_col][this.current_line];
        this.manager.update_description(chosen_ability.description);
    }

    public on_left() {
        if (this.battle_abilities.length <= 1) return;

        const pages = this.battle_abilities.length;
        this.current_col = (this.current_col + pages - 1) % pages;

        if (!this.battle_abilities[this.current_col][this.current_line])
            this.current_line = this.battle_abilities[this.current_col].length - 1;

        this.reset();
    }

    public on_right() {
        if (this.battle_abilities.length <= 1) return;

        const pages = this.battle_abilities.length;
        this.current_col = (this.current_col + 1) % pages;

        if (!this.battle_abilities[this.current_col][this.current_line])
            this.current_line = this.battle_abilities[this.current_col].length - 1;

        this.reset();
    }

    public on_up() {
        if (this.battle_abilities[this.current_col].length <= 1) return;

        if (this.current_line === 0) {
            if (this.current_col === 0) {
                this.current_col = this.battle_abilities.length - 1;
                this.current_line = this.battle_abilities[this.battle_abilities.length - 1].length - 1;
            } else {
                this.current_col = this.current_col - 1;
                this.current_line = this.battle_abilities[this.current_col].length - 1;
            }
            this.reset();
        } else {
            this.current_line--;
            this.on_change();
        }
    }

    public on_down() {
        if (this.battle_abilities[this.current_col].length <= 1) return;

        if (this.current_line + 1 === this.battle_abilities[this.current_col].length) {
            if (this.current_col === this.battle_abilities.length - 1) {
                this.current_col = 0;
                this.current_line = 0;
            } else {
                this.current_col = this.current_col + 1;
                this.current_line = 0;
            }
            this.reset();
        } else {
            this.current_line++;
            this.on_change();
        }
    }

    public initialize() {
        const page_indicator_anchor = {
            x: StatusPsynergy.PAGE_INDICATOR_ANCHOR.X,
            y: StatusPsynergy.PAGE_INDICATOR_ANCHOR.Y,
        };
        this.update_abilities();

        const abilities = this.battle_abilities[this.current_col];

        abilities.forEach((ability, index) => {
            const icon_key = ability.key_name;
            const name = ability.name;
            const pp_cost = ability.pp_cost;
            const star_key = ability.element + "_star";
            const range = String(ability.range);

            let x_pos = StatusPsynergy.PSYNERGY.ICON_X;
            let y_pos = StatusPsynergy.PSYNERGY.ICON_Y + index * StatusPsynergy.SHIFT;

            const icon = this.window.create_at_group(
                x_pos,
                y_pos,
                "abilities_icons",
                undefined,
                icon_key,
                StatusPsynergy.GROUP_KEY
            );
            this.state_sprites.push(icon);

            x_pos = StatusPsynergy.PSYNERGY.NAME_X;
            y_pos = StatusPsynergy.PSYNERGY.NAME_Y + index * StatusPsynergy.SHIFT;

            const name_text = this.window.set_text_in_position(
                name,
                x_pos,
                y_pos,
                false,
                false,
                undefined,
                false,
                StatusPsynergy.GROUP_KEY
            );
            this.state_sprites.push(name_text.text, name_text.shadow);

            x_pos = StatusPsynergy.PSYNERGY.PP_LABEL_X;
            y_pos = StatusPsynergy.PSYNERGY.PP_LABEL_Y + index * StatusPsynergy.SHIFT;

            const pp_label = this.window.set_text_in_position(
                "PP",
                x_pos,
                y_pos,
                false,
                false,
                undefined,
                false,
                StatusPsynergy.GROUP_KEY
            );
            this.state_sprites.push(pp_label.text, pp_label.shadow);

            x_pos = StatusPsynergy.PSYNERGY.PP_VALUE_END_X;
            y_pos = StatusPsynergy.PSYNERGY.PP_VALUE_Y + index * StatusPsynergy.SHIFT;

            const pp_value = this.window.set_text_in_position(
                pp_cost,
                x_pos,
                y_pos,
                true,
                false,
                undefined,
                false,
                StatusPsynergy.GROUP_KEY
            );
            this.state_sprites.push(pp_value.text, pp_value.shadow);

            x_pos = StatusPsynergy.PSYNERGY.STAR_X;
            y_pos = StatusPsynergy.PSYNERGY.STAR_Y + index * StatusPsynergy.SHIFT;

            const star = this.window.create_at_group(
                x_pos,
                y_pos,
                star_key,
                undefined,
                undefined,
                StatusPsynergy.GROUP_KEY
            );
            this.state_sprites.push(star);

            x_pos = StatusPsynergy.PSYNERGY.RANGE_CENTER_X;
            y_pos = StatusPsynergy.PSYNERGY.RANGE_Y + index * StatusPsynergy.SHIFT;

            const range_icon = this.window.create_at_group(
                x_pos,
                y_pos,
                "ranges",
                undefined,
                range,
                StatusPsynergy.GROUP_KEY
            );
            range_icon.x -= (range_icon.width / 2) | 0;
            this.state_sprites.push(range_icon);
        });

        this.window.page_indicator.position = page_indicator_anchor;
        this.window.page_indicator.initialize(
            this.battle_abilities.length,
            this.current_line,
            PageIndicatorModes.FLASH
        );
        this.select_option();
    }

    private update_abilities() {
        const all_abilities = this.manager.selected_character.abilities;

        let page_abilities = [];
        this.battle_abilities = [];

        let count = 0;
        all_abilities.forEach(key_name => {
            if (count === StatusPsynergy.MAX_LINES) {
                this.battle_abilities.push(page_abilities);
                page_abilities = [];
                count = 0;
            }
            if (this.data.info.abilities_list[key_name].is_battle_ability) {
                page_abilities.push(this.data.info.abilities_list[key_name]);
                count++;
            }
        });
        if (page_abilities.length > 0) this.battle_abilities.push(page_abilities);
    }
}