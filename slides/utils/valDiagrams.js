// Diagrams for validation.md
const ranks = [
  { y: 30, s: 300, e: 1360 },
  { y: 130, s: 420, e: 1400 },
  { y: 230, s: 360, e: 1340 },
  { y: 330, s: 560, e: 1450 },
]
const INIT = 700
const vline = (x) => ({ x: x - 1, y: 10, w: 2, h: 470, f: 'o' })
const T = {
  w: 1600, h: 720,
  nodes: [
    ...ranks.flatMap((r) => [
      { x: r.s, y: r.y, w: INIT - r.s, h: 70, f: 'g', t: '' },
      { x: INIT, y: r.y, w: r.e - INIT, h: 70, f: 'a', t: '' },
    ]),
    vline(300), vline(560), vline(1450),
    { x: 300, y: 650, w: 40, h: 40, f: 'g', t: '' },
    { x: 850, y: 650, w: 40, h: 40, f: 'a', t: '' },
  ],
  edges: [
    ['both', 564, 560, 1446, 560],
  ],
  texts: [
    ...ranks.map((r, i) => ({ x: 270, y: r.y + 45, t: `rank ${i}`, a: 'end', c: 'zc' })),
    { x: 300, y: 515, t: '最早開始', c: 'zs' },
    { x: 560, y: 515, t: '最晚開始', c: 'zs' },
    { x: 1450, y: 515, t: '最晚結束', c: 'zs' },
    { x: 1005, y: 545, t: 'T', c: 'zt' },
    { x: 360, y: 600, t: '最早開始到最晚開始：srun 啟動的等待，不算', c: 'zg', a: 'start' },
    { x: 355, y: 678, t: '已啟動，在 MPI_Init 等其他 rank', c: 'zs', a: 'start' },
    { x: 905, y: 678, t: '程式真正在跑', c: 'zs', a: 'start' },
  ],
}


// A 3D grid cut into blocks, one per rank; neighbours exchange their faces
const cell = (x, y, t) => ({ x, y, w: 300, h: 220, f: 'a', t, s: '自己那一塊網格' })
const grid = {
  w: 1600, h: 600,
  nodes: [
    { x: 0, y: 0, w: 760, h: 580, f: 'o', L: ['整個模擬空間（例：64 × 64 × 64 格）'], top: true },
    cell(40, 70, 'rank 0'), cell(420, 70, 'rank 1'),
    cell(40, 330, 'rank 2'), cell(420, 330, 'rank 3'),
    { x: 860, y: 170, w: 740, h: 290, f: 'w', top: true,
      L: ['每次迭代', '1. 算自己那一塊的每一格', '2. 和相鄰的 rank 交換邊界', '3. 必要時全部 rank 一起加總', '', '網格越大：計算越多、邊界越大', '迭代越多：主迴圈的圈數越多'] },
  ],
  edges: [
    ['both', 344, 180, 416, 180],
    ['both', 344, 440, 416, 440],
    ['both', 190, 294, 190, 326],
    ['both', 570, 294, 570, 326],
  ],
  texts: [],
}
export default { T, grid }
