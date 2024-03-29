import { Game, Journey, Level, NextLevelAction } from ".././protos/level_pb.js";
import { MOUSEDOWN, TOTAL_NUM_STARS } from "./constants.js";
import { AppElement } from "./util.js";

export class ScoreBoard extends AppElement {
  private buttonContainer: HTMLElement = document.createElement("div");
  private game: Game;
  private journeyBoards: Map<number, JourneyBoard> = new Map<
    number,
    JourneyBoard
  >();

  constructor(game: Game) {
    super();
    this.game = game;
    this.build();
  }

  Update() {
    if (this.game.nextJourney === undefined) {
      throw Error("game.nextJourney is undefined");
    }
    if (!this.journeyBoards.has(this.game.nextJourney)) {
      throw Error("Journey not found: " + this.game.nextJourney);
    }
    this.journeyBoards.forEach((journeyBoard: JourneyBoard) => {
      journeyBoard.Update();
      journeyBoard.Hide();
    });
    this.journeyBoards.get(this.game.nextJourney)?.Show();
    this.element.appendChild(this.buttonContainer);
    this.buttonContainer.classList.add("horizontalChoices");
    this.buttonContainer.classList.add("bottomBar");
  }

  waitforUserSelection(): Promise<NextLevelAction> {
    this.buttonContainer.textContent = "";
    return new Promise<NextLevelAction>((resolve) => {
      const restartGame = this.generateButton("restart_alt");
      this.buttonContainer.appendChild(restartGame);
      restartGame.addEventListener(MOUSEDOWN, (event: MouseEvent) =>
        resolve(NextLevelAction.RESTART_GAME)
      );

      const restartJourney = this.generateButton("redo");
      this.buttonContainer.appendChild(restartJourney);
      restartJourney.addEventListener(MOUSEDOWN, (event: MouseEvent) =>
        resolve(NextLevelAction.RESTART_JOURNEY)
      );
      if (!this.game.nextJourney) {
        throw Error("No next journey");
      }
      if (!this.journeyBoards.has(this.game.nextJourney)) {
        throw Error("No current journey");
      }
      if (this.journeyBoards.get(this.game.nextJourney)?.CanAccessNextLevel()) {
        const nextLevelButton = this.generateButton("skip_next");
        this.buttonContainer.appendChild(nextLevelButton);
        nextLevelButton.addEventListener(MOUSEDOWN, (event: MouseEvent) =>
          resolve(NextLevelAction.TRIGGER_NEXT_LEVEL)
        );
      }
    });
  }

  private build() {
    this.element.setAttribute("id", "scoreboard");
    this.Hide();
    for (const journey of this.game.journeys) {
      if (journey.number === undefined) {
        throw Error("Journey number not defined: " + journey);
      }
      const journeyBoard = new JourneyBoard(journey);
      this.journeyBoards.set(journey.number, journeyBoard);
      this.element.appendChild(journeyBoard.GetAsElement());
    }
  }

  private generateButton(text: string): HTMLElement {
    var button = document.createElement("div");
    button.classList.add("selectable");
    button.classList.add("levelAction");
    button.textContent = text;
    return button;
  }
}

class JourneyBoard extends AppElement {
  journey: Journey;
  levels: Map<number, LevelBoard> = new Map<number, LevelBoard>();
  header = document.createElement("div");
  star = document.createElement("span");
  starNum: number = 0;

  constructor(journey: Journey) {
    super();
    this.journey = journey;
    this.Hide();
    this.element.classList.add("journeyBoard");
    this.header.textContent = this.journey.symbols[0];
    this.header.classList.add("journeyBoardHeader");
    this.star.setAttribute("id", "starCounter");
    this.header.appendChild(this.star);
    this.element.appendChild(this.header);
    for (const level of this.journey.levels) {
      if (level.number === undefined) {
        throw Error("Level number undefined " + level);
      }
      const levelBoard = new LevelBoard(level);
      this.levels.set(level.number, levelBoard);
      this.element.appendChild(levelBoard.GetAsElement());
    }
  }

  Update() {
    this.levels.forEach((levelBoard: LevelBoard) => levelBoard.Update());
    this.starNum = this.element.getElementsByClassName("filledStar").length;
    this.star.textContent =
      this.starNum.toString() + "/" + this.journey.minimumStarNumber;
  }

  CanAccessNextLevel(): boolean {
    if (this.journey.nextLevel === undefined) {
      throw Error("Next level not defined: " + this.journey.nextLevel);
    }
    const lastPlayedLevel = this.levels.get(this.journey.nextLevel);
    if (!lastPlayedLevel) {
      throw Error(
        "Level does not have LevelBoard: " +
          this.levels.get(this.journey.nextLevel)
      );
    }
    if (
      !lastPlayedLevel.GetAsElement().getElementsByClassName("filledStar")
        .length
    ) {
      // Last played level does not have at least one star
      return false;
    }
    if (this.journey.nextLevel !== this.journey.levels.length) {
      // At least one star and last played lavel is not the last of the journey
      return true;
    }
    if (this.starNum < this.journey.minimumStarNumber!) {
      return false;
    }
    return true;
  }
}

class LevelBoard extends AppElement {
  private level: Level;
  private levelNumber: HTMLElement = document.createElement("span");
  private levelScore: HTMLElement = document.createElement("span");

  constructor(level: Level) {
    super();
    this.level = level;
    this.levelNumber.classList.add("levelBoard-number");
    this.levelNumber.textContent = this.level.number?.toString() || "";
    this.element.appendChild(this.levelNumber);
    this.levelScore.classList.add("levelBoard-score");
    this.setLevelScore();
    this.element.appendChild(this.levelScore);
    this.Update();
  }

  Update() {
    const stars = this.levelScore.children;
    if (this.level.score === undefined) {
      for (var i = 0; i < TOTAL_NUM_STARS; i++) {
        stars[i].classList.remove("filledStar");
        stars[i].classList.add("emptyStar");
      }
      return;
    }
    for (var i = 0; i < TOTAL_NUM_STARS; i++) {
      if (i < this.level.score) {
        stars[i].classList.add("filledStar");
        stars[i].classList.remove("emptyStar");
      } else {
        stars[i].classList.remove("filledStar");
        stars[i].classList.add("emptyStar");
      }
    }
  }

  private setLevelScore() {
    for (var i = 0; i < TOTAL_NUM_STARS; i++) {
      const star = document.createElement("span");
      star.textContent = "star_rate";
      this.levelScore.appendChild(star);
    }
  }
}
