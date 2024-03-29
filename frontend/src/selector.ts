import { AppElement } from "./util.js";
import {
  Journey,
  Level,
  Move,
  MoveDirection,
  MoveGrow,
  MoveSpin,
} from ".././protos/level_pb.js";
import { MOUSEDOWN } from "./constants.js";

// Map between MoveDirection and Material Icon name.
export const DirectionIcons: Map<MoveDirection, string> = new Map([
  [MoveDirection.NO_MOVE, "block"],
  [MoveDirection.NORTH, "north"],
  [MoveDirection.SOUTH, "south"],
  [MoveDirection.WEST, "west"],
  [MoveDirection.EAST, "east"],
  [MoveDirection.SOUTH_EAST, "south_east"],
  [MoveDirection.SOUTH_WEST, "south_west"],
  [MoveDirection.NORTH_WEST, "north_west"],
  [MoveDirection.NORTH_EAST, "north_east"],
  [MoveDirection.DOUBLE_NORTH, "keyboard_double_arrow_up"],
  [MoveDirection.DOUBLE_SOUTH, "keyboard_double_arrow_down"],
  [MoveDirection.DOUBLE_WEST, "keyboard_double_arrow_left"],
  [MoveDirection.DOUBLE_EAST, "keyboard_double_arrow_right"],
  [MoveDirection.UNSPECIFIED, "question_mark"],
]);

export const SpinIcons: Map<MoveSpin, string> = new Map([
  [MoveSpin.NO_SPIN, "block"],
  [MoveSpin.HALF_CLOCKWISE, "rotate_right"],
  [MoveSpin.HALF_COUNTER_CLOCKWISE, "rotate_left"],
]);

export const GrowIcons: Map<MoveGrow, string> = new Map([
  [MoveGrow.NO_GROW, "block"],
  [MoveGrow.ENLARGE, "open_in_full"],
  [MoveGrow.SHRINK, "close_fullscreen"],

])

// A selector is the part of the app where the user can input their
// selection of movements. It generally includes one Option (see below)
// for each direction (e.g. UP, DOWN, ...).
export class Selector extends AppElement {
  protected journey: Journey;
  protected level: Level;
  protected options: Array<Option> = new Array<Option>();
  protected optionsContainer: HTMLElement = document.createElement("div");
  private acceptsFurtherSelections: boolean = true;

  constructor(journey: Journey, level: Level) {
    super();
    this.journey = journey;
    this.level = level;
    this.element.setAttribute("id", "selector");
    this.optionsContainer.setAttribute("id", "optionsContainer");
    this.GenerateOptions();
  }

  protected GenerateOptions() {
    this.element.appendChild(this.optionsContainer);
    for (const move of this.journey.allowedMoves) {
      const option = new ExplicitOption(move);
      this.options.push(option);
      this.optionsContainer.appendChild(option.GetAsElement());
    }
  }

  // Handles the user selection event:
  //   - Registers selection to the App
  //   - Makes this and/or option selectable or not
  WaitAndRegisterSelections(): Array<Promise<Option>> {
    const promises: Array<Promise<Option>> = [];
    for (const option of this.options) {
      promises.push(
        new Promise<Option>((resolve, reject) => {
          option.initAndWaitForUserSelection().then(() => {
            if (this.acceptsFurtherSelections) {
              option.MakeUnselectable();
              var atLeastOneSelectable = false;
              for (const option of this.options) {
                if (option.IsSelectable()) {
                  atLeastOneSelectable = true;
                }
              }
              if (!atLeastOneSelectable) {
                for (const option of this.options) {
                  option.MakeSelectable();
                }
              }
              resolve(option);
            } else {
              reject();
            }
          });
        })
      );
    }
    return promises;
  }

  // Makes all options unselectable.
  // Intended to be called once the entire trajectory has been decided.
  MakeAllOptionsUnselectable() {
    this.acceptsFurtherSelections = false;
    for (const option of this.options) {
      if (option.IsSelectable()) {
        option.MakeUnselectable();
      }
    }
  }
}

// Instead of the user clicking on several options, a RandomSelector is
// one where an Option is selected at random as the user clicks on it.
export class RandomSelector extends Selector {
  protected GenerateOptions() {
    const option = new RandomOption(this.journey.allowedMoves);
    this.optionsContainer.appendChild(option.GetAsElement());
    this.element.appendChild(this.optionsContainer);
    this.options.push(option);
  }

  WaitAndRegisterSelections(): Array<Promise<Option>> {
    return [
      new Promise<Option>((resolve) => {
        const option = this.options[0]!;
        option.initAndWaitForUserSelection().then(() => {
          resolve(option);
        });
      }),
    ];
  }
}

export class Option extends AppElement {
  move: Move = new Move();
  protected text: string = "";

  constructor() {
    super();
    this.element.classList.add("option");
    this.element.classList.add("selectable");
    this.element.setAttribute("tabindex", "0");
  }

  initAndWaitForUserSelection(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.element.addEventListener(MOUSEDOWN, (event: Event) => {
        resolve();
      });
    });
  }

  MakeSelectable() {
    this.element.classList.add("selectable");
    this.element.classList.remove("notSelectable");
  }

  MakeUnselectable() {
    this.element.classList.add("notSelectable");
    this.element.classList.remove("selectable");
  }

  IsSelectable(): boolean {
    return this.element.classList.contains("selectable");
  }
}

export class ExplicitOption extends Option {
  constructor(move: Move) {
    super();
    this.move = move;
    if (this.move.direction) {
      this.text += MoveDirection[move?.direction!];
      this.element.setAttribute("alt", this.text);
      this.element.textContent += DirectionIcons.get(this.move.direction)!;
    }
    if (this.move.spin) {
      this.text +=
        (this.move.direction ? " " : "") + MoveDirection[move?.spin!];
      this.element.setAttribute("alt", this.text);
      this.element.textContent = SpinIcons.get(this.move.spin)!;
    }
    if (this.move.grow) {
      this.text += (this.move.grow ? " " : "") + MoveGrow[move?.grow!];
      this.element.setAttribute("alt", this.text);
      this.element.textContent = GrowIcons.get(this.move.grow)!;
    }
  }
}

export class RandomOption extends Option {
  private moves: Array<Move>;
  private timerId: ReturnType<typeof setInterval> | undefined = undefined;

  constructor(moves: Array<Move>) {
    super();
    this.moves = moves;
    this.timerId = setInterval(this.updateText, 100, this.moves, this);
  }

  updateText(moves: Array<Move>, option: RandomOption) {
    const nextMove = moves.shift();
    if (nextMove) {
      option.move = nextMove;
      option.element.textContent = "";
      if (nextMove.direction) {
        option.element.textContent += DirectionIcons.get(nextMove.direction)!;
        option.element.setAttribute("alt", MoveDirection[nextMove.direction]);
      }
      if (nextMove.spin) {
        option.element.textContent +=
          (nextMove.direction ? " " : "") + SpinIcons.get(nextMove.spin)!;
        option.element.setAttribute("alt", MoveSpin[nextMove.spin]);
      }
      if (nextMove.grow) {
        option.element.textContent +=
          (nextMove.direction ? " " : "") + GrowIcons.get(nextMove.grow)!;
        option.element.setAttribute("alt", MoveGrow[nextMove.grow]);
      }
      moves.push(nextMove);
    } else {
      console.log("No next move: " + moves);
    }
  }

  MakeUnselectable() {
    this.element.classList.remove("selectable");
    this.element.classList.add("notSelectable");
    this.move = new Move();
    this.element.textContent = "";
    this.element.removeAttribute("alt");
    clearInterval(this.timerId);
  }
}
