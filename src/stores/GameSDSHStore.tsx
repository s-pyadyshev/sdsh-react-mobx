import { observable, action } from "mobx";
import { shuffle } from "../utils";
import { UserCodeInterface } from "../interfaces/user-code";
import { ALLOWED_DIGITS } from "../constants";
import { dec, equals } from "ramda";
import { cond, T } from "ramda";

const minValue: number = 0;
const maxValue: number = 9;

class GameSDSHStore {
  rootStore: any;

  constructor(rootStore: any) {
    this.rootStore = rootStore;
  }

  // settings
  attemptsInitial: number = 6;
  initialUserCodeState: UserCodeInterface[] = [
    {
      value: 0,
      isExist: false,
      isValid: false,
    },
    {
      value: 0,
      isExist: false,
      isValid: false,
    },
    {
      value: 0,
      isExist: false,
      isValid: false,
    },
    {
      value: 0,
      isExist: false,
      isValid: false,
    },
  ];

  @observable
  code: number[] = [];

  @observable
  userCode: any = this.initialUserCodeState;

  @observable
  attempts: number = this.attemptsInitial;

  attemptsUsed: number = 0;

  // counter for submit form
  @observable
  counter: number = 0;

  @observable
  isUnlocked: boolean = false;

  @observable
  isGameOver: boolean = false;

  @observable
  isGameStarted: boolean = false;

  @observable
  wins: number = 0;

  @observable
  lost: number = 0;

  // Generate full secret code, shuffle it (no repeated digits) and cut first 4 digits
  @action
  generateSecretCode() {
    this.code = shuffle(ALLOWED_DIGITS).slice(
      0,
      this.initialUserCodeState.length
    );
    // this.code = [0, 1, 2, 3];
  }

  @action
  decreaseAttempts() {
    this.attempts = dec(this.attempts);
  }

  @action
  calculateAttemptsUsed() {
    this.attemptsUsed = this.attemptsInitial - this.attempts;
  }

  @action
  checkCodeValidity() {
    const buttonsIds = [0, 1, 2, 3]; // TODO constant
    const userCodeArray = this.userCode.map(
      (item: { value: number }) => item.value
    );
    const isEqualCodes = equals(this.code, userCodeArray);

    const setGameUnlocked = () => {
      this.isGameStarted = false;
      this.isUnlocked = true;
      this.userCode.map((code: UserCodeInterface) => {
        code.isExist = true;
        code.isValid = true;
        return null; // array-callback-return
      });
    };

    buttonsIds.map((id: number) => {
      const isUserValueExist = this.code.includes(this.userCode[id].value);
      const isUserValueValid = this.code[id] === this.userCode[id].value;

      const setPartialValidPlacement = () => {
        this.userCode[id].isExist = true;
        this.userCode[id].isValid = false;
      };

      const setValidPlacement = () => {
        this.userCode[id].isExist = true;
        this.userCode[id].isValid = true;
      };

      const setInvalidPlacement = () => {
        this.userCode[id].isValid = false;
        this.userCode[id].isExist = false;
      };

      const setDigitStates = cond([
        [() => isEqualCodes, setGameUnlocked],
        [() => isUserValueExist && !isUserValueValid, setPartialValidPlacement],
        [() => isUserValueExist && isUserValueValid, setValidPlacement],
        [T, setInvalidPlacement],
      ]);

      setDigitStates();

      return null; // array-callback-return
    });
  }

  @action
  incrementCodeNumber(id: number) {
    if (this.userCode[id].value === maxValue) {
      this.userCode[id].value = 0;
    } else {
      this.userCode[id].value += 1;
    }
  }

  @action
  decrementCodeNumber(id: number) {
    if (this.userCode[id].value === minValue) {
      this.userCode[id].value = maxValue;
    } else {
      this.userCode[id].value -= 1;
    }
  }

  // state - gameStarted
  @action
  gameStart() {
    this.generateSecretCode();
    this.isGameOver = false;
    this.isUnlocked = false;
    this.isGameStarted = true;
    this.userCode = this.initialUserCodeState;
    this.attempts = this.attemptsInitial;
  }
}

export default GameSDSHStore;
