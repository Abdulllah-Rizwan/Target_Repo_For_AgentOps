/**
 * Basic calculator module.
 *
 * Exposes the four elementary arithmetic operations plus a small `calculate`
 * dispatcher that maps an operator symbol to the matching operation. The module
 * is intentionally free of side effects and dependencies so it can be reused by
 * the Telegram bot, the API layer, or unit tests.
 */

export type Operator = '+' | '-' | '*' | '/';

export type BinaryOperation = (a: number, b: number) => number;

/** Error thrown when an operation receives arguments it cannot handle. */
export class CalculatorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CalculatorError';
  }
}

function assertFinite(value: number, name: string): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new CalculatorError(`${name} must be a finite number, received: ${String(value)}`);
  }
}

/** Returns the sum of `a` and `b`. */
export function add(a: number, b: number): number {
  assertFinite(a, 'a');
  assertFinite(b, 'b');
  return a + b;
}

/** Returns the difference of `a` and `b`. */
export function subtract(a: number, b: number): number {
  assertFinite(a, 'a');
  assertFinite(b, 'b');
  return a - b;
}

/** Returns the product of `a` and `b`. */
export function multiply(a: number, b: number): number {
  assertFinite(a, 'a');
  assertFinite(b, 'b');
  return a * b;
}

/** Returns the quotient of `a` and `b`. Throws on division by zero. */
export function divide(a: number, b: number): number {
  assertFinite(a, 'a');
  assertFinite(b, 'b');
  if (b === 0) {
    throw new CalculatorError('Division by zero is not allowed.');
  }
  return a / b;
}

const OPERATIONS: Record<Operator, BinaryOperation> = {
  '+': add,
  '-': subtract,
  '*': multiply,
  '/': divide,
};

/** Type guard for the supported operator symbols. */
export function isOperator(value: string): value is Operator {
  return Object.prototype.hasOwnProperty.call(OPERATIONS, value);
}

/**
 * Applies `operator` to `a` and `b`.
 *
 * @example
 * calculate('+', 2, 3); // 5
 * calculate('/', 6, 0); // throws CalculatorError
 */
export function calculate(operator: Operator, a: number, b: number): number {
  if (!isOperator(operator)) {
    throw new CalculatorError(`Unsupported operator: ${String(operator)}`);
  }
  return OPERATIONS[operator](a, b);
}

export default { add, subtract, multiply, divide, calculate, isOperator, CalculatorError };
