  // 期望保留率：FSRS 论文标准默认值（0.9，即「到期复习时回忆概率」），不再做自定校准
  const FDR = 0.9;
  const FW = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542];
  const FSRS_DECAY = -FW[20];               // 遗忘曲线指数 decay = -w20 = -0.1542
  const FSRS_FACTOR = Math.exp(Math.log(0.9) / FSRS_DECAY) - 1; // factor = e^{ln0.9/decay} - 1 ≈ 0.98
  const FSRS_S_MIN = 0.001;
  const FSRS_S_MAX = 36500.0;
  const FSRS_HALFLIFE_K = (Math.pow(0.5, 1 / FSRS_DECAY) - 1) / FSRS_FACTOR; // 半衰期 h = K·S（FSRS-6 曲线，K≈90）
  function fsrsClamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }
  // 可提取性（遗忘曲线）R(t,S) = (1 + factor·t/S)^{decay}
  function fsrsRetention(daysSince, S) {
    S = Math.max(FSRS_S_MIN, S);
    return Math.pow(1 + FSRS_FACTOR * Math.max(0, daysSince) / S, FSRS_DECAY);
  }
  // 期望保留率(DR) → 下次复习间隔（天）：I(r,s) = (r^{1/decay} − 1)/factor × s，DR=0.9 时 I=S
  function fsrsInterval(S) {
    const mod = (Math.pow(FDR, 1 / FSRS_DECAY) - 1) / FSRS_FACTOR;
    return Math.max(1, Math.round(Math.max(FSRS_S_MIN, S) * mod));
  }
  // 初始稳定性 S0(G) = max(w[G-1], 0.1)，G=1..4
  function fsrsInitStability(G) { return Math.max(FW[G - 1], 0.1); }
  // 初始难度 D0(G) = w4 − e^{(G−1)·w5} + 1，钳 1..10
  function fsrsInitDifficulty(G) {
    return fsrsClamp(FW[4] - Math.exp((G - 1) * FW[5]) + 1, 1, 10);
  }
  function fsrsInitDifficulty4() { return fsrsInitDifficulty(4); } // 均值回归锚点 D0(Easy)
  // 线性阻尼：难度越接近 10，每次变化越小
  function fsrsLinearDamping(delta_d, oldD) { return (delta_d * (10 - oldD)) / 9; }
  // 难度更新：delta = -w6·(G-3) → 线性阻尼 → 均值回归到 D0(Easy)
  function fsrsDifficulty(D, G) {
    D = (typeof D === 'number' && D >= 1 && D <= 10) ? D : 7;
    const delta_d = -FW[6] * (G - 3);
    const next_d = D + fsrsLinearDamping(delta_d, D);
    const reverted = FW[7] * fsrsInitDifficulty4() + (1 - FW[7]) * next_d;
    return fsrsClamp(reverted, 1, 10);
  }
  // 成功回忆的稳定性更新（Hard 有 w15 惩罚、Easy 有 w16 加成）
  function fsrsSuccessStability(D, S, R, G) {
    const hardPenalty = (G === 2) ? FW[15] : 1;
    const easyBound = (G === 4) ? FW[16] : 1;
    const growth = Math.exp(FW[8]) * (11 - D) * Math.pow(Math.max(FSRS_S_MIN, S), -FW[9]) * (Math.exp(FW[10] * (1 - R)) - 1) * hardPenalty * easyBound;
    return fsrsClamp(Math.max(FSRS_S_MIN, S) * (1 + growth), FSRS_S_MIN, FSRS_S_MAX);
  }
  // 遗忘的稳定性更新：sForget 与「短时记忆封顶 s/e^{w17·w18}」取小（稳定性不高于遗忘前）
  function fsrsLapseStability(D, S, R) {
    const sForget = fsrsClamp(FW[11] * Math.pow(Math.max(1, D), -FW[12]) * (Math.pow(Math.max(FSRS_S_MIN, S) + 1, FW[13]) - 1) * Math.exp(FW[14] * (1 - R)), FSRS_S_MIN, FSRS_S_MAX);
    const newSMin = Math.max(FSRS_S_MIN, S) / Math.exp(FW[17] * FW[18]);
    return fsrsClamp(newSMin, FSRS_S_MIN, sForget);
  }
  // 短时记忆稳定度（同日学习步进，t≈0）：Again 可降、Hard/Good/Easy 不低于原值
  function fsrsShortTermStability(S, G) {
    const sinc = Math.pow(Math.max(FSRS_S_MIN, S), -FW[19]) * Math.exp(FW[17] * (G - 3 + FW[18]));
    const maskedSinc = (G >= 2) ? Math.max(sinc, 1) : sinc;
    return fsrsClamp(Math.max(FSRS_S_MIN, S) * maskedSinc, FSRS_S_MIN, FSRS_S_MAX);
  }

  // 半衰期 h：可提取性 R 降到 50% 的时间间隔。由 FSRS-6 曲线 R(t,S)=(1+factor·t/S)^{decay} 解 R=0.5 → h=K·S
  // h 反映「记忆强度」（仅作展示参考，不作毕业/掌握度分母——因 K≈90 放大导致目标数值失真）
  function fsrsHalflife(S) { return Math.max(FSRS_S_MIN, S) * FSRS_HALFLIFE_K; }

export { FDR, FW, FSRS_DECAY, FSRS_FACTOR, FSRS_S_MIN, FSRS_S_MAX, FSRS_HALFLIFE_K, fsrsClamp, fsrsRetention, fsrsInterval, fsrsInitStability, fsrsInitDifficulty, fsrsInitDifficulty4, fsrsLinearDamping, fsrsDifficulty, fsrsSuccessStability, fsrsLapseStability, fsrsShortTermStability, fsrsHalflife };
