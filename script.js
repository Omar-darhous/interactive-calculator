const mainDisplay = document.getElementById("main-display");
const expressionDisplay = document.getElementById("expression-display");
const keypad = document.querySelector(".keypad");
const operatorButtons = document.querySelectorAll(".btn-operator");

const ERROR_MESSAGE = "Cannot divide by 0";
const HIGHLIGHT_DURATION_MS = 150;
const highlightTimers = new WeakMap();

const KEY_TO_OPERATOR = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
};

const state = {
  currentInput: "0",
  previousValue: null,
  operator: null,
  waitingForSecondOperand: false,
  justEvaluated: false,
  hasError: false,
};

function formatNumberForDisplay(valueStr) {
  if (valueStr === ERROR_MESSAGE) {
    return ERROR_MESSAGE;
  }
  return valueStr;
}

function normalizeResult(value) {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  // Prevent floating point precision artifacts such as 0.1 + 0.2 = 0.30000000000000004
  // while safely handling very large numbers without NaN
  return String(Number(value.toPrecision(12)));
}

function calculate(firstOperand, secondOperand, operator) {
  const a = parseFloat(firstOperand);
  const b = parseFloat(secondOperand);

  switch (operator) {
    case "+":
      return normalizeResult(a + b);
    case "−":
    case "-":
      return normalizeResult(a - b);
    case "×":
    case "*":
      return normalizeResult(a * b);
    case "÷":
    case "/":
      if (b === 0) {
        return null;
      }
      return normalizeResult(a / b);
    default:
      return String(secondOperand);
  }
}

function updateActiveOperatorUI() {
  operatorButtons.forEach((button) => {
    const isActive =
      !state.hasError &&
      state.operator === button.dataset.operator &&
      state.waitingForSecondOperand;
    button.classList.toggle("is-active", isActive);
  });
}

function updateDisplay() {
  const formatted = formatNumberForDisplay(state.currentInput);
  mainDisplay.textContent = formatted;
  mainDisplay.classList.toggle("is-error", state.hasError);
  mainDisplay.classList.toggle("is-long", !state.hasError && formatted.length > 12);

  if (state.hasError) {
    expressionDisplay.textContent = "Press AC to reset";
  } else if (state.previousValue !== null && state.operator !== null && !state.justEvaluated) {
    expressionDisplay.textContent = `${state.previousValue} ${state.operator}`;
  } else if (!state.justEvaluated) {
    expressionDisplay.textContent = "";
  }

  updateActiveOperatorUI();
}

function resetCalculator() {
  state.currentInput = "0";
  state.previousValue = null;
  state.operator = null;
  state.waitingForSecondOperand = false;
  state.justEvaluated = false;
  state.hasError = false;
  expressionDisplay.textContent = "";
  updateDisplay();
}

function setDivisionByZeroError(expressionText) {
  state.currentInput = ERROR_MESSAGE;
  state.previousValue = null;
  state.operator = null;
  state.waitingForSecondOperand = false;
  state.justEvaluated = false;
  state.hasError = true;
  expressionDisplay.textContent = expressionText || "Press AC to reset";
  mainDisplay.textContent = ERROR_MESSAGE;
  mainDisplay.classList.add("is-error");
  mainDisplay.classList.remove("is-long");
  updateActiveOperatorUI();
}

function handleDigitInput(digit) {
  if (state.hasError) {
    return;
  }

  if (state.justEvaluated) {
    state.currentInput = digit;
    state.previousValue = null;
    state.operator = null;
    state.justEvaluated = false;
    state.waitingForSecondOperand = false;
    updateDisplay();
    return;
  }

  if (state.waitingForSecondOperand) {
    state.currentInput = digit;
    state.waitingForSecondOperand = false;
  } else {
    state.currentInput = state.currentInput === "0" ? digit : state.currentInput + digit;
  }

  updateDisplay();
}

function handleDecimalInput() {
  if (state.hasError) {
    return;
  }

  if (state.justEvaluated) {
    state.currentInput = "0.";
    state.previousValue = null;
    state.operator = null;
    state.justEvaluated = false;
    state.waitingForSecondOperand = false;
    updateDisplay();
    return;
  }

  if (state.waitingForSecondOperand) {
    state.currentInput = "0.";
    state.waitingForSecondOperand = false;
    updateDisplay();
    return;
  }

  if (!state.currentInput.includes(".")) {
    state.currentInput += ".";
    updateDisplay();
  }
}

function handleOperatorInput(nextOperator) {
  if (state.hasError) {
    return;
  }

  if (state.operator && state.waitingForSecondOperand) {
    state.operator = nextOperator;
    updateDisplay();
    return;
  }

  if (state.previousValue === null) {
    state.previousValue = state.currentInput;
  } else if (state.operator) {
    const result = calculate(state.previousValue, state.currentInput, state.operator);
    if (result === null) {
      setDivisionByZeroError(`${state.previousValue} ${state.operator} ${state.currentInput} =`);
      return;
    }
    state.currentInput = result;
    state.previousValue = result;
  }

  state.operator = nextOperator;
  state.waitingForSecondOperand = true;
  state.justEvaluated = false;
  updateDisplay();
}

function handleEqualsInput() {
  if (state.hasError) {
    return;
  }

  if (state.operator === null || state.previousValue === null) {
    return;
  }

  const firstOperand = state.previousValue;
  const secondOperand = state.currentInput;
  const activeOperator = state.operator;

  const result = calculate(firstOperand, secondOperand, activeOperator);
  if (result === null) {
    setDivisionByZeroError(`${firstOperand} ${activeOperator} ${secondOperand} =`);
    return;
  }

  expressionDisplay.textContent = `${firstOperand} ${activeOperator} ${secondOperand} =`;
  state.currentInput = result;
  state.previousValue = null;
  state.operator = null;
  state.waitingForSecondOperand = false;
  state.justEvaluated = true;
  updateDisplay();
}

function handleBackspaceInput() {
  if (state.hasError) {
    return;
  }

  if (state.waitingForSecondOperand) {
    return;
  }

  if (state.justEvaluated) {
    state.justEvaluated = false;
    expressionDisplay.textContent = "";
  }

  if (state.currentInput.length > 1) {
    state.currentInput = state.currentInput.slice(0, -1);
    if (state.currentInput === "-" || state.currentInput === "") {
      state.currentInput = "0";
    }
  } else {
    state.currentInput = "0";
  }

  updateDisplay();
}

function triggerButtonAction(button) {
  if (!button) {
    return;
  }

  const { digit, decimal, operator, action } = button.dataset;

  if (digit !== undefined) {
    handleDigitInput(digit);
  } else if (decimal !== undefined) {
    handleDecimalInput();
  } else if (operator !== undefined) {
    handleOperatorInput(operator);
  } else if (action === "equals") {
    handleEqualsInput();
  } else if (action === "clear") {
    resetCalculator();
  } else if (action === "backspace") {
    handleBackspaceInput();
  }
}

function flashButtonHighlight(button) {
  if (!button) {
    return;
  }

  const existingTimer = highlightTimers.get(button);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  button.classList.add("is-pressed");
  const timerId = setTimeout(() => {
    button.classList.remove("is-pressed");
    highlightTimers.delete(button);
  }, HIGHLIGHT_DURATION_MS);

  highlightTimers.set(button, timerId);
}

function getButtonForKey(key) {
  if (/^[0-9]$/.test(key)) {
    return keypad.querySelector(`[data-digit="${key}"]`);
  }

  if (key === ".") {
    return keypad.querySelector('[data-decimal="."]');
  }

  if (Object.prototype.hasOwnProperty.call(KEY_TO_OPERATOR, key)) {
    const mappedOperator = KEY_TO_OPERATOR[key];
    return keypad.querySelector(`[data-operator="${mappedOperator}"]`);
  }

  if (key === "Enter" || key === "=") {
    return keypad.querySelector('[data-action="equals"]');
  }

  if (key === "Backspace") {
    return keypad.querySelector('[data-action="backspace"]');
  }

  if (key === "Escape") {
    return keypad.querySelector('[data-action="clear"]');
  }

  return null;
}

function handleKeydownInput(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  const matchingButton = getButtonForKey(event.key);
  if (!matchingButton) {
    return;
  }

  event.preventDefault();
  flashButtonHighlight(matchingButton);
  triggerButtonAction(matchingButton);
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  triggerButtonAction(button);
});

window.addEventListener("keydown", handleKeydownInput);

updateDisplay();
