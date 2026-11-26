// Procedural word problems for ages 11 to 13. Each generator returns { q, o: [4 strings], a: index of correct }.
const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
function mc(q, right, wrong) {
  const opts = [right];
  for (const w of wrong) if (!opts.includes(w) && opts.length < 4) opts.push(w);
  let n = 1; while (opts.length < 4) { const w = right + n * (n % 2 ? 1 : -1) * 2; if (!opts.includes(w) && w >= 0) opts.push(w); n++; }
  const shuffled = opts.map(v => ({ v, s: Math.random() })).sort((x, y) => x.s - y.s).map(x => x.v);
  return { q, o: shuffled.map(String), a: shuffled.indexOf(right) };
}

export const GEN = {
  percentOff() {
    const price = pick([40, 60, 80, 120, 160, 200]), pct = pick([10, 20, 25, 30, 50]);
    const right = price - price * pct / 100;
    return mc(`A Glow Lantern costs ${price} coins. The stall owner takes ${pct}% off. What is the new price?`, right, [price * pct / 100, price - pct, right + 10, price + price * pct / 100]);
  },
  interest() {
    const loan = pick([40, 60, 80, 120, 150]), back = loan + loan * pick([25, 50, 100]) / 100, extra = back - loan, pct = extra / loan * 100;
    return mc(`A trader lends you ${loan} coins and wants ${back} back. What percent extra is that?`, pct, [pct / 2, pct * 2, pct + 25, extra]);
  },
  multiStep() {
    const stalls = r(3, 6), charms = r(12, 18), price = r(4, 9), rent = pick([20, 30, 40]);
    const right = stalls * charms * price - rent;
    return mc(`${stalls} stalls each sell ${charms} charms at ${price} coins each. Together they pay ${rent} coins rent. What is the profit?`, right, [stalls * charms * price, right + rent, right - 10, (stalls + charms) * price - rent]);
  },
  fraction() {
    const d = pick([3, 4, 5, 8]), n = r(1, d - 1), total = d * r(6, 12);
    const right = total / d * n;
    return mc(`The crew has ${total} glow berries. They eat ${n}/${d} of them. How many did they eat?`, right, [total - right, total / d, right + n, total / n]);
  },
  shareRemainder() {
    const people = r(6, 9), total = people * r(7, 12) + r(1, people - 1), each = Math.floor(total / people), left = total % people;
    return mc(`${total} coins are split equally among ${people} people. How many coins are left over?`, left, [each, left + 1, people - left, left + 2]);
  },
  rate() {
    const speed = pick([45, 60, 75, 80]), mins = r(7, 15), right = speed * mins;
    return mc(`A sky car moves ${speed} meters every minute. How far does it go in ${mins} minutes?`, right, [right + speed, right - speed, speed + mins, right / 2]);
  },
  unitPrice() {
    const a = pick([[6, 21], [4, 14], [8, 26], [5, 18]]), b = pick([[10, 33], [10, 36], [12, 40], [9, 30]]);
    const pa = a[1] / a[0], pb = b[1] / b[0], bestPack = pa < pb ? 0 : 1;
    const q = `Pack A has ${a[0]} charms for ${a[1]} coins. Pack B has ${b[0]} charms for ${b[1]} coins. Which is the better deal per charm?`;
    const opts = ['Pack A', 'Pack B', 'They cost the same', 'Cannot tell'];
    return { q, o: opts, a: pa === pb ? 2 : bestPack };
  },
  orderOps() {
    const a = r(3, 9), b = r(2, 6), c = r(3, 8), d = r(2, 9), right = a + b * c - d;
    return mc(`What is ${a} + ${b} × ${c} − ${d}?`, right, [(a + b) * c - d, a + b * (c - d), a * b + c - d, right + 2]);
  },
  area() {
    const w = r(6, 14), h = r(5, 12), cut = r(2, 4), right = w * h - cut * cut;
    return mc(`A gate panel is ${w} by ${h} units. A square hole of ${cut} by ${cut} is cut out. What is the area left?`, right, [w * h, w * h - cut, 2 * (w + h), right + cut]);
  },
  change() {
    const n = r(3, 6), each = pick([7, 8, 9, 12, 15]), pay = Math.ceil(n * each / 50) * 50;
    return mc(`${n} drum charms cost ${each} coins each. A customer pays ${pay} coins. How much change?`, pay - n * each, [n * each, pay - each, pay - n * each + 5, pay - n * each - 5]);
  }
};

export function makeMath(names) {
  const list = names && names.length ? names : Object.keys(GEN);
  return GEN[pick(list)]();
}
