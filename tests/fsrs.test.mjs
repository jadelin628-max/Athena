import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FDR, FW, FSRS_DECAY, FSRS_FACTOR, FSRS_S_MIN, FSRS_S_MAX, FSRS_HALFLIFE_K,
  fsrsClamp, fsrsRetention, fsrsInterval, fsrsInitStability, fsrsInitDifficulty,
  fsrsInitDifficulty4, fsrsLinearDamping, fsrsDifficulty, fsrsSuccessStability,
  fsrsLapseStability, fsrsShortTermStability, fsrsHalflife
} from '../src/fsrs-core.mjs';

function approx(actual, expected, msg, rel = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= rel * Math.max(1, Math.abs(expected)),
    `${msg}: actual=${actual} expected=${expected}`);
}

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const retention = (days, S) => Math.pow(1 + FSRS_FACTOR * Math.max(0, days) / Math.max(FSRS_S_MIN, S), FSRS_DECAY);
const interval = (S) => Math.max(1, Math.round(Math.max(FSRS_S_MIN, S) * ((Math.pow(FDR, 1 / FSRS_DECAY) - 1) / FSRS_FACTOR)));
const initStab = (G) => Math.max(FW[G - 1], 0.1);
const initDiff = (G) => clamp(FW[4] - Math.exp((G - 1) * FW[5]) + 1, 1, 10);
const successStab = (D, S, R, G) => {
  const hard = G === 2 ? FW[15] : 1;
  const easy = G === 4 ? FW[16] : 1;
  const growth = Math.exp(FW[8]) * (11 - D) * Math.pow(Math.max(FSRS_S_MIN, S), -FW[9]) * (Math.exp(FW[10] * (1 - R)) - 1) * hard * easy;
  return clamp(Math.max(FSRS_S_MIN, S) * (1 + growth), FSRS_S_MIN, FSRS_S_MAX);
};
const shortStab = (S, G) => {
  const sinc = Math.pow(Math.max(FSRS_S_MIN, S), -FW[19]) * Math.exp(FW[17] * (G - 3 + FW[18]));
  const masked = G >= 2 ? Math.max(sinc, 1) : sinc;
  return clamp(Math.max(FSRS_S_MIN, S) * masked, FSRS_S_MIN, FSRS_S_MAX);
};

test('constants match FSRS-6 defaults', () => {
  assert.equal(FDR, 0.9);
  assert.deepEqual(FW, [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542]);
  approx(FSRS_DECAY, -0.1542, 'decay');
  approx(FSRS_FACTOR, Math.exp(Math.log(0.9) / -0.1542) - 1, 'factor');
  approx(FSRS_HALFLIFE_K, (Math.pow(0.5, 1 / -0.1542) - 1) / FSRS_FACTOR, 'halflife K');
});

test('fsrsRetention matches the official forgetting curve', () => {
  const cases = [[0, 1], [1, 1], [1, 10], [10, 10], [30, 90], [90, 90], [365, 365]];
  for (const [d, S] of cases) approx(fsrsRetention(d, S), retention(d, S), `R(${d},${S})`);
});

test('fsrsInterval matches the 90% desired-retention interval', () => {
  for (const S of [0.1, 1, 2.31, 10, 90, 365]) approx(fsrsInterval(S), interval(S), `I(${S})`);
});

test('initial stability and difficulty match the four grades', () => {
  for (const G of [1, 2, 3, 4]) {
    approx(fsrsInitStability(G), initStab(G), `S0(${G})`);
    approx(fsrsInitDifficulty(G), initDiff(G), `D0(${G})`);
  }
  approx(fsrsInitDifficulty4(), initDiff(4), 'D0(Easy)');
});

test('success stability update matches the official formula', () => {
  const cases = [[5, 1, 0.9, 3], [7, 10, 0.85, 2], [3, 30, 0.95, 4], [8, 90, 0.7, 1]];
  for (const [D, S, R, G] of cases) approx(fsrsSuccessStability(D, S, R, G), successStab(D, S, R, G), `S+(${D},${S},${R},${G})`);
});

test('short-term stability update matches the official formula', () => {
  const cases = [[0.5, 1], [1, 2], [5, 3], [30, 4]];
  for (const [S, G] of cases) approx(fsrsShortTermStability(S, G), shortStab(S, G), `Sst(${S},${G})`);
});

test('lapse stability is capped by S/e^(w17·w18)', () => {
  const capFor = (S) => Math.max(FSRS_S_MIN, S) / Math.exp(FW[17] * FW[18]);
  const sForget = (D, S, R) => clamp(FW[11] * Math.pow(Math.max(1, D), -FW[12]) * (Math.pow(Math.max(FSRS_S_MIN, S) + 1, FW[13]) - 1) * Math.exp(FW[14] * (1 - R)), FSRS_S_MIN, FSRS_S_MAX);
  const cases = [[5, 20, 0.9], [9, 2, 0.2], [7, 100, 0.6]];
  for (const [D, S, R] of cases) {
    const expected = Math.min(sForget(D, S, R), capFor(S));
    approx(fsrsLapseStability(D, S, R), expected, `lapse(${D},${S},${R})`);
  }
});

test('halflife is K·S and clamped at S_MIN', () => {
  approx(fsrsHalflife(10), Math.max(FSRS_S_MIN, 10) * FSRS_HALFLIFE_K, 'h(10)');
  approx(fsrsHalflife(0), FSRS_S_MIN * FSRS_HALFLIFE_K, 'h(0) clamps');
});