// Diagrams for final.md, from the whole system down to one record.
// f: a light green, b green, g grey, o dark grey, w white, y yellow (highlight)

const row = (xs, y, w, h, items, f = 'a') =>
  items.map((it, i) => ({ x: xs[i], y, w, h, f, ...it }))
const chain = (xs, w, y) => xs.slice(0, -1).map((x, i) => [x + w + 2, y, xs[i + 1] - 4, y])

// L0: two commands
const X0 = [20, 345, 670, 995, 1318]
const overview = {
  w: 1600, h: 400,
  nodes: [
    { x: 4, y: 70, w: 638, h: 300, f: 'w', dash: true },
    ...row(X0, 140, 280, 160, [
      { t: '你的 MPI 程式', s: '不改、不重編', f: 'g' },
      { t: 'ibtrace record', s: '1 錄製', s2: '2 就地校準', f: 'a' },
      { t: '執行目錄', s: 'trace · counter', s2: '設定 · 懲罰', f: 'g' },
      { t: 'ibtrace suggest', s: '3 找迴圈', s2: '4 算 ΔT', f: 'b' },
      { t: '排序的建議', s: '每個動作的 ΔT', s2: '與要改的設定', f: 'b' },
    ]),
  ],
  edges: [...chain(X0, 280, 220)],
  texts: [
    { x: 323, y: 50, t: '同一個 Slurm job、同一組節點', c: 'zg' },
    { x: 1135, y: 360, t: '只讀執行目錄', c: 'zs' },
  ],
}

// L1: record across nodes
const nodeBox = (y, name) => {
  const ry = [y + 60, y + 170]
  return {
    nodes: [
      { x: 360, y, w: 860, h: 290, f: 'o', L: [name], top: true },
      { x: 390, y: ry[0], w: 230, h: 90, t: 'rank 0', s: '+ libibtrace', f: 'a' },
      { x: 390, y: ry[1], w: 230, h: 90, t: 'rank 1', s: '+ libibtrace', f: 'a' },
      { x: 670, y: ry[0], w: 200, h: 90, t: 'ring', s: '/dev/shm', f: 'g' },
      { x: 670, y: ry[1], w: 200, h: 90, t: 'ring', s: '/dev/shm', f: 'g' },
      { x: 920, y: ry[0], w: 270, h: 200, t: 'ibmon', s: '讀出 ring', s2: '取樣 counter', f: 'b' },
    ],
    edges: [
      [622, ry[0] + 45, 666, ry[0] + 45], [622, ry[1] + 45, 666, ry[1] + 45],
      [872, ry[0] + 45, 916, ry[0] + 45], [872, ry[1] + 45, 916, ry[1] + 45],
    ],
  }
}
const nA = nodeBox(20, '節點 A'), nB = nodeBox(350, '節點 B')
const record = {
  w: 1600, h: 660,
  nodes: [
    { x: 0, y: 270, w: 300, h: 120, t: 'srun … ibtrace', s: 'record -- ./prog', mono: true, f: 'a' },
    ...nA.nodes, ...nB.nodes,
    { x: 1260, y: 170, w: 330, h: 320, f: 'w', top: true,
      L: ['runs/x（共用檔案系統）', 'rank<N>.csv  trace', 'rank<N>.json 設定', 'rank<N>.out  輸出', '網卡 counter', '校準的懲罰'] },
  ],
  edges: [
    [302, 330, 330, 330, 330, 165, 356, 165],
    [302, 330, 330, 330, 330, 495, 356, 495],
    ...nA.edges, ...nB.edges,
    [1192, 180, 1225, 180, 1225, 260, 1256, 260],
    [1192, 510, 1225, 510, 1225, 400, 1256, 400],
  ],
  texts: [{ x: 150, y: 440, t: '每個 rank 一個 ring', c: 'zs' }],
}

// L2: inside one process
const SX = 40, SW = 330
const stack = ['MPI 程式', 'Open MPI', 'UCP', 'UCT', 'verbs']
const process = {
  w: 1600, h: 700,
  nodes: [
    ...stack.map((t, i) => ({ x: SX, y: 20 + i * 105, w: SW, h: 70, t, f: i >= 2 ? 'a' : 'g' })),
    { x: SX, y: 600, w: 1100, h: 80, t: '網卡（port counter）', f: 'o' },
    { x: 470, y: 230, w: 300, h: 270, t: 'libibtrace', s: 'LD_PRELOAD', s2: '一次呼叫 = 1 個 span', f: 'b' },
    { x: 840, y: 300, w: 260, h: 130, t: 'ring', s: '共享記憶體 128 MiB', f: 'g' },
    { x: 1180, y: 300, w: 400, h: 130, t: 'ibmon', s: '讀出 span，寫成 csv', f: 'b' },
    { x: 1180, y: 20, w: 400, h: 200, f: 'w', top: true,
      L: ['寫進執行目錄', 'rank0.csv   每個 span', 'rank0.json  UCX 設定', 'counter     每張網卡'] },
    { x: 840, y: 480, w: 300, h: 90, t: '/proc/…/schedstat', s: '排隊等 CPU 的時間', f: 'g' },
  ],
  edges: [
    ...[0, 1, 2, 3].map((i) => [SX + SW / 2, 90 + i * 105, SX + SW / 2, 123 + i * 105]),
    [SX + SW / 2, 510, SX + SW / 2, 596],
    [372, 265, 466, 265], [372, 370, 466, 370], [372, 475, 466, 475],
    [772, 365, 836, 365], [1102, 365, 1176, 365],
    [1380, 298, 1380, 224],
    [1142, 525, 1300, 525, 1300, 434],
    [1142, 640, 1480, 640, 1480, 434],
  ],
  texts: [
    { x: 420, y: 255, t: '攔截', c: 'zs' },
    { x: 1220, y: 512, t: '每 1 ms', c: 'zg' },
    { x: 1310, y: 628, t: '取樣', c: 'zg' },
  ],
}

// L3: one span
const span = {
  w: 1600, h: 520,
  nodes: [
    { x: 160, y: 40, w: 760, h: 60, t: 'MPI_Allreduce（不攔截）', f: 'w', dash: true },
    { x: 200, y: 140, w: 300, h: 60, t: 'UCP', f: 'a' },
    { x: 560, y: 140, w: 320, h: 60, t: 'UCP', f: 'a' },
    { x: 240, y: 240, w: 160, h: 60, t: 'UCT', f: 'a' },
    { x: 600, y: 240, w: 120, h: 60, t: 'UCT', f: 'a' },
    { x: 760, y: 240, w: 100, h: 60, t: 'UCT', f: 'a' },
    { x: 270, y: 340, w: 100, h: 60, t: '', f: 'y' },
    { x: 620, y: 340, w: 70, h: 60, t: '', f: 'a' },
    { x: 1060, y: 60, w: 520, h: 340, f: 'w', top: true,
      L: ['一筆記錄（128 B）', '函式與所在的層', '進入時間（ns）', '離開時間（ns）', '位址、大小', '…'] },
  ],
  edges: [
    [100, 450, 940, 450],
    [372, 370, 1056, 370],
  ],
  texts: [
    { x: 90, y: 180, t: 'UCP', a: 'end', c: 'zc' },
    { x: 90, y: 280, t: 'UCT', a: 'end', c: 'zc' },
    { x: 90, y: 380, t: 'verbs', a: 'end', c: 'zc' },
    { x: 320, y: 330, t: 'ibv_post_send', c: 'zc' },
    { x: 520, y: 495, t: '時間（CLOCK_MONOTONIC）', c: 'zs' },
    { x: 700, y: 360, t: '一個 span：進入 → 離開', c: 'zg', a: 'start' },
  ],
}

// Calibration L1
const X5 = [0, 330, 660, 990, 1320]
const calib = {
  w: 1600, h: 560,
  nodes: [
    ...row(X5, 40, 280, 120, [
      { t: 'trace 與設定', f: 'g' },
      { t: '找出觸發的瓶頸' },
      { t: '選兩條路徑' },
      { t: '在同組節點量' },
      { t: '懲罰', f: 'b' },
    ]),
    ...row(X5, 230, 280, 300, [
      { L: ['錄到的', '訊息大小', '同時在途數', '對象 rank', 'CPU 與網卡位置'] },
      { L: ['條件', '外來流量 > 1 Gb/s', 'CPU 在網卡對側', '用到多張網卡'] },
      { L: ['每種瓶頸', '受影響：原狀', '對照：去掉這個因素', '其他條件不變'] },
      { L: ['時間點', '程式一結束', '同一個 job', '只量觸發的項目'] },
      { L: ['寫進執行目錄', '每則訊息多幾 µs', '網卡設定另記：', '每次迭代與固定成本'] },
    ], 'w').map((n) => ({ ...n, top: true, dash: true })),
  ],
  edges: [...chain(X5, 280, 100), ...X5.map((x) => [x + 140, 162, x + 140, 226])],
  texts: [],
}

// Calibration L2: node topology, affected vs control
const nic = (x, t, f = 'g') => ({ x, y: 440, w: 160, h: 90, t, f, mono: true })
const topo = {
  w: 1600, h: 640,
  nodes: [
    { x: 0, y: 0, w: 1600, h: 630, f: 'o', L: ['一個節點：兩顆 CPU，各接 4 張網卡'], top: true },
    { x: 30, y: 70, w: 740, h: 530, f: 'g', L: ['NUMA 0'], top: true },
    { x: 830, y: 70, w: 740, h: 530, f: 'g', L: ['NUMA 1'], top: true },
    { x: 250, y: 130, w: 300, h: 100, t: 'CPU 0', s: 'rank 在這一側', f: 'a' },
    { x: 1050, y: 130, w: 300, h: 100, t: 'CPU 1', f: 'w' },
    nic(50, 'mlx5_0', 'y'), nic(230, 'mlx5_3', 'b'), nic(410, 'mlx5_4', 'w'), nic(590, 'mlx5_5', 'w'),
    nic(850, 'mlx5_6', 'w'), nic(1030, 'mlx5_7', 'w'), nic(1210, 'mlx5_8', 'w'), nic(1390, 'mlx5_9', 'w'),
  ],
  edges: [
    [330, 232, 140, 436],
    [470, 232, 310, 436],
    [1100, 232, 175, 436],
  ],
  texts: [
    { x: 60, y: 300, t: '受影響', c: 'zg', a: 'start' },
    { x: 60, y: 332, t: '有外來流量', c: 'zs', a: 'start' },
    { x: 440, y: 330, t: '對照', c: 'zg', a: 'start' },
    { x: 440, y: 362, t: '同側、沒有流量', c: 'zs', a: 'start' },
    { x: 860, y: 400, t: 'NUMA 錯置：從對側送', c: 'zg', a: 'start' },
    { x: 130, y: 570, t: '他人流量', c: 'zs' },
  ],
}

// Calibration L2: NIC configuration
const nicCal = {
  w: 1600, h: 520,
  nodes: [
    { x: 0, y: 190, w: 250, h: 120, t: 'trace', s: '呼叫的型態', f: 'g' },
    { x: 330, y: 40, w: 360, h: 120, t: 'collective', s: '直接跑程式本身', f: 'a' },
    { x: 330, y: 340, w: 360, h: 120, t: '點對點', s: '依 trace 重播訊息', f: 'a' },
    { x: 780, y: 120, w: 400, h: 280, f: 'w', top: true, dash: true,
      L: ['4 個候選，各量一次', '目前的設定', '同側 2 張', '同側 4 張', '全部 8 張'] },
    { x: 1260, y: 120, w: 330, h: 280, t: '每個候選', s: '每次迭代 µs', s2: '固定成本 ms', f: 'b' },
  ],
  edges: [
    [252, 250, 290, 250, 290, 100, 326, 100],
    [252, 250, 290, 250, 290, 400, 326, 400],
    [692, 100, 735, 100, 735, 260, 776, 260],
    [692, 400, 735, 400, 735, 260, 776, 260],
    [1182, 260, 1256, 260],
  ],
  texts: [{ x: 980, y: 460, t: '所有 rank 同時跑，才看得到互相拖慢', c: 'zg' }],
}

// Suggest L1
const sug = {
  w: 1600, h: 560,
  nodes: [
    ...row(X5, 40, 280, 120, [
      { t: 'rank<N>.csv', f: 'g', mono: true },
      { t: '找出主迴圈' },
      { t: '各 rank 對齊' },
      { t: '每次呼叫取最慢' },
      { t: '套用懲罰', f: 'b' },
    ]),
    ...row(X5, 230, 280, 300, [
      { L: ['輸入', '每個 rank 的 span', '懲罰', 'UCX 設定'] },
      { L: ['方法', '呼叫序列裡', '重複的週期'] },
      { L: ['方法', '用第幾個週期', '對齊，不用時鐘'] },
      { L: ['原因', 'collective 等最慢的', '只有它變快才有用'] },
      { L: ['輸出', '每個動作的 ΔT', '依 ΔT 排序'] },
    ], 'w').map((n) => ({ ...n, top: true, dash: true })),
  ],
  edges: [...chain(X5, 280, 100), ...X5.map((x) => [x + 140, 162, x + 140, 226])],
  texts: [],
}

// Suggest L2: per-call max over ranks
const lens = [
  [260, 330, 200], [300, 260, 380], [220, 400, 240], [380, 300, 260],
]
const cx = [200, 680, 1160]
const maxOf = (c) => Math.max(...lens.map((r) => r[c]))
const perCall = {
  w: 1600, h: 560,
  nodes: lens.flatMap((r, i) => r.map((L, c) => ({
    x: cx[c], y: 70 + i * 90, w: L, h: 60, t: '', f: L === maxOf(c) ? 'b' : 'a',
  }))),
  edges: [],
  texts: [
    ...lens.map((_, i) => ({ x: 170, y: 110 + i * 90, t: `rank ${i}`, a: 'end', c: 'zc' })),
    ...cx.map((x, c) => ({ x: x + 200, y: 45, t: `第 ${c + 1} 次呼叫`, c: 'zs' })),
    ...cx.map((x, c) => ({ x, y: 470, t: `取 rank ${lens.findIndex((r) => r[c] === maxOf(c))}`, a: 'start', c: 'zg' })),
    { x: 800, y: 540, t: 'ΔT = 每次呼叫「最慢 rank 的變化」加總', c: 'zt' },
  ],
}

// Suggest L2: ΔT composition, with the reduce_scatter example
const X3 = [0, 560, 1120]
const dtParts = {
  w: 1600, h: 520,
  nodes: [
    ...row(X3, 40, 480, 170, [
      { t: '迴圈內', s: '懲罰 × 受影響的訊息數', f: 'a' },
      { t: '迴圈外', s: '只算一次', f: 'a' },
      { t: '固定成本', s: '建立連線、登記記憶體', f: 'a' },
    ]),
    ...row(X3, 300, 480, 170, [
      { t: '164 µs × 44,000 次', s: '≈ 7,216 ms', mono: true },
      { t: '約 0 ms', s: '幾乎都在迴圈內', mono: true },
      { t: '517 ms', s: '校準量到', mono: true },
    ], 'w'),
  ],
  edges: [],
  texts: [
    { x: 520, y: 140, t: '+', c: 'zt' }, { x: 1080, y: 140, t: '+', c: 'zt' },
    { x: 520, y: 400, t: '+', c: 'zt' }, { x: 1080, y: 400, t: '+', c: 'zt' },
    { x: 20, y: 275, t: '例：osu_reduce_scatter，8 張 → 同側 4 張', c: 'zg', a: 'start' },
    { x: 800, y: 510, t: '預測 7,715 ms；實測 7,951 ms', c: 'zt' },
  ],
}

// Validation L1
const X4 = [0, 410, 820, 1230]
const valid = {
  w: 1600, h: 470,
  nodes: [
    ...row(X4, 30, 360, 140, [
      { t: '模型定版', s: '打 git tag', f: 'g' },
      { t: '計分規則', s: '收資料前 commit', f: 'g' },
      { t: '節點檢查', s: '不合格就重送' },
      { t: '對照組關卡', s: 'ΔT 要接近 0' },
    ]),
    ...row(X4, 290, 360, 140, [
      { t: '製造瓶頸', s: 'busy loop、numactl…' },
      { t: '每個狀態', s: '10 次不開 tracer' },
      { t: '實測 ΔT', s: '兩狀態中位數相減', f: 'b' },
      { t: '和預測比', s: '誤差、方向、名次', f: 'b' },
    ]),
  ],
  edges: [
    ...chain(X4, 360, 100), ...chain(X4, 360, 360),
    [1410, 172, 1410, 220, 180, 220, 180, 286],
  ],
  texts: [],
}

// Suggest L2: what the main loop looks like in one rank's trace
const ops = ['isend', 'irecv', 'wait']
const loopRow = (y, x0, initW, endX, name) => {
  const ps = x0 + initW + 20
  return {
    nodes: [
      { x: x0, y, w: initW, h: 64, t: 'connect', s: 'reg_mr', f: 'g', mono: true },
      ...[0, 1, 2, 3].flatMap((k) => ops.map((o, j) => ({ x: ps + k * 250 + j * 76, y, w: 70, h: 64, t: o, f: k % 2 ? 'b' : 'a', mono: true }))),
      { x: endX, y, w: 1580 - endX, h: 64, t: 'finalize', f: 'g', mono: true },
    ],
    texts: [
      { x: x0 - 20, y: y + 40, t: name, a: 'end', c: 'zc' },
      { x: ps + 4 * 250 + 20, y: y + 40, t: '…', c: 'zt' },
    ],
    ps,
  }
}
const L0 = loopRow(100, 130, 170, 1400, 'rank 0'), L1 = loopRow(290, 130, 230, 1440, 'rank 1')
const loop = {
  w: 1600, h: 600,
  nodes: [...L0.nodes, ...L1.nodes],
  edges: [
    ...[0, 1, 2, 3].map((k) => ['both', L0.ps + k * 250 + 110, 168, L1.ps + k * 250 + 110, 286]),
    [130, 420, 130, 400, 300, 400, 300, 420].length ? [] : [],
  ].filter((e) => e.length),
  texts: [
    ...L0.texts, ...L1.texts,
    ...[0, 1, 2, 3].map((k) => ({ x: L0.ps + k * 250 + 110, y: 80, t: `第 ${k + 1} 圈`, c: 'zs' })),
    { x: 230, y: 420, t: '開頭與結尾', c: 'zg' },
    { x: 230, y: 452, t: '只做一次', c: 'zs' },
    { x: 230, y: 484, t: '→ 迴圈外、固定成本', c: 'zs' },
    { x: 860, y: 420, t: '主迴圈：同一段呼叫序列一直重複', c: 'zg' },
    { x: 860, y: 452, t: '每圈的差 × 圈數', c: 'zs' },
    { x: 860, y: 484, t: '第 k 圈對第 k 圈，不用時鐘對齊', c: 'zs' },
    { x: 860, y: 560, t: 'T ≈ 固定成本 + 迴圈外 + 圈數 × 每次迭代', c: 'zt' },
  ],
}

export default { overview, record, process, span, calib, topo, nicCal, sug, loop, perCall, dtParts, valid }
