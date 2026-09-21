#!/usr/bin/env node
/**
 * tip.js — a tiny, dependency-free tip calculator.
 *
 * Command line:
 *   node tip.js <bill> [tipPercent] [people] [--round]
 *
 *   node tip.js 84.50            -> 15% tip on an $84.50 bill
 *   node tip.js 84.50 20 3       -> 20% tip split 3 ways
 *   node tip.js 84.50 20 3 -r    -> same, rounded to whole dollars
 *
 * As a module:
 *   const { calculateTip } = require("./tip");
 *   calculateTip(50, 18, 2);
 */

"use strict";

const DEFAULT_TIP_PERCENT = 15;

const USAGE = `Tip calculator

Usage:
  node tip.js <bill> [tipPercent] [people] [--round]

Arguments:
  bill         Bill amount before tip (required, non-negative number).
  tipPercent   Tip percentage (optional, defaults to ${DEFAULT_TIP_PERCENT}).
  people       Number of people splitting the bill (optional, defaults to 1).

Options:
  -r, --round  Round the final total to the nearest whole dollar.
  -h, --help   Show this help message.

Examples:
  node tip.js 84.50
  node tip.js 84.50 20 3
  node tip.js 84.50 20 3 --round`;

/** Coerce a value to a finite number or throw a descriptive error. */
function toNumber(value, name) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new TypeError(`${name} must be a number, received: ${JSON.stringify(value)}`);
  }
  return n;
}

/** Round to two decimal places, avoiding classic float drift (0.1 + 0.2). */
function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Calculate tip, total and per-person amounts for a bill.
 *
 * @param {number|string} bill         Bill amount before tip.
 * @param {number|string} [tipPercent] Tip percentage, e.g. 18 for 18%.
 * @param {number}        [people]     Number of people splitting the bill.
 * @param {object}        [options]
 * @param {boolean}       [options.round] Round the total to a whole dollar.
 * @returns {{bill:number, tipPercent:number, people:number, tipAmount:number,
 *            total:number, tipPerPerson:number, totalPerPerson:number}}
 */
function calculateTip(bill, tipPercent = DEFAULT_TIP_PERCENT, people = 1, options = {}) {
  const { round = false } = options;

  const billAmount = toNumber(bill, "bill");
  const percent = toNumber(tipPercent, "tipPercent");
  const partySize = toNumber(people, "people");

  if (billAmount < 0) throw new RangeError("bill must be greater than or equal to 0");
  if (percent < 0) throw new RangeError("tipPercent must be greater than or equal to 0");
  if (!Number.isInteger(partySize) || partySize < 1) {
    throw new RangeError("people must be a whole number greater than or equal to 1");
  }

  let tipAmount = billAmount * (percent / 100);
  let total = billAmount + tipAmount;

  if (round) {
    total = Math.round(total);
    tipAmount = total - billAmount;
  }

  return {
    bill: round2(billAmount),
    tipPercent: percent,
    people: partySize,
    tipAmount: round2(tipAmount),
    total: round2(total),
    tipPerPerson: round2(tipAmount / partySize),
    totalPerPerson: round2(total / partySize),
  };
}

/** Format a number as US dollars. */
function formatMoney(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

/** Render a calculation result as a readable receipt. */
function formatReceipt(result) {
  const { bill, tipPercent, people, tipAmount, total, totalPerPerson } = result;
  const lines = [
    `Bill:        ${formatMoney(bill)}`,
    `Tip (${tipPercent}%):   ${formatMoney(tipAmount)}`,
    `Total:       ${formatMoney(total)}`,
  ];

  if (people > 1) {
    lines.push(`Split ${people} ways: ${formatMoney(totalPerPerson)} each`);
  }

  return lines.join("\n");
}

/** Parse CLI arguments into positional values plus flags. */
function parseArgs(argv) {
  const positional = [];
  let round = false;
  let help = false;

  for (const arg of argv) {
    if (arg === "--round" || arg === "-r") round = true;
    else if (arg === "--help" || arg === "-h") help = true;
    else positional.push(arg);
  }

  return { positional, round, help };
}

/** Entry point for command-line use. Returns the process exit code. */
function main(argv) {
  const { positional, round, help } = parseArgs(argv);

  if (help || positional.length === 0) {
    console.log(USAGE);
    return 0;
  }

  const [bill, tipPercent, people] = positional;

  try {
    const result = calculateTip(
      bill,
      tipPercent === undefined ? DEFAULT_TIP_PERCENT : tipPercent,
      people === undefined ? 1 : people,
      { round }
    );
    console.log(formatReceipt(result));
    return 0;
  } catch (err) {
    console.error(`Error: ${err.message}`);
    return 1;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    calculateTip,
    formatMoney,
    formatReceipt,
    DEFAULT_TIP_PERCENT,
  };
}

if (typeof require !== "undefined" && typeof module !== "undefined" && require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}
