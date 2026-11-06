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
export default { T }
