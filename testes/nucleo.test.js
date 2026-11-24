import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Jogo, tabuleiro, posto, C, vencedor, LOBO, OVELHAS } from '../js/lobo.js'

test('o 8x8 tem 32 casas escuras, 4 ovelhas na linha 0 e 4 casas de partida do lobo', () => {
  const t = tabuleiro(8)
  assert.equal(t.D, 32)
  assert.deepEqual(t.ovelhasIniciais.map((i) => t.casas[i]), [[1, 0], [3, 0], [5, 0], [7, 0]])
  assert.deepEqual(t.inicioLobo.map((i) => t.casas[i]), [[0, 7], [2, 7], [4, 7], [6, 7]])
})

test('altura impar: o lobo parte das colunas impares', () => {
  const t = tabuleiro(6, 7)
  assert.deepEqual(t.inicioLobo.map((i) => t.casas[i][0]), [1, 3, 5])
})

test('a ovelha so anda para a frente e o lobo anda para os quatro lados', () => {
  const t = tabuleiro(8)
  const c = t.idx.get('3,4')
  assert.deepEqual(t.frente[c].map((i) => t.casas[i]).sort(), [[2, 5], [4, 5]])
  assert.equal(t.lobo[c].length, 4)
  // na borda o lobo tem duas
  assert.equal(t.lobo[t.idx.get('0,3')].length, 2)
})

test('o posto e um numero de 0 a C(D,k)-1, sem repetir', () => {
  const vistos = new Set()
  for (let a = 0; a < 10; a++) for (let b = a + 1; b < 10; b++) for (let c = b + 1; c < 10; c++) vistos.add(posto([a, b, c]))
  assert.equal(vistos.size, C(10, 3))
  assert.equal(Math.max(...vistos), C(10, 3) - 1)
})

test('C confere com o triangulo de Pascal', () => {
  assert.equal(C(32, 4), 35960)
  assert.equal(C(50, 5), 2118760)
  assert.equal(C(5, 7), 0)
})

test('lobo cercado na vez dele perde ja, em zero lances', () => {
  const j = new Jogo(4, 4)
  const t = j.t
  // lobo no canto (0,3): os dois vizinhos dele sao (1,2) e... so (1,2) existe
  const w = t.idx.get('0,3')
  const ov = [t.idx.get('1,2'), t.idx.get('3,0')].sort((a, b) => a - b)
  assert.equal(t.lobo[w].length, 1)
  assert.equal(j.valor(ov, w, LOBO), -1)
  assert.deepEqual(vencedor(-1, LOBO), { lado: 'ovelhas', lances: 0 })
})

test('lobo a um passo da linha 0 ganha em um lance', () => {
  const j = new Jogo(4, 4)
  const t = j.t
  const w = t.idx.get('2,1')
  const ov = [t.idx.get('1,2'), t.idx.get('3,2')].sort((a, b) => a - b)
  const v = j.valor(ov, w, LOBO)
  assert.deepEqual(vencedor(v, LOBO), { lado: 'lobo', lances: 1 })
})

test('as jogadas das ovelhas devolvem o conjunto ordenado e nunca pisam no lobo', () => {
  const j = new Jogo(8)
  const ov = j.ini
  const w = j.t.idx.get('2,1')
  for (const [o2, w2, v2] of j.jogadas(ov, w, OVELHAS)) {
    assert.equal(v2, LOBO)
    assert.equal(w2, w)
    assert.ok(!o2.includes(w))
    assert.deepEqual(o2, o2.slice().sort((a, b) => a - b))
  }
})

test('boas: toda jogada boa realiza o valor prometido', () => {
  const j = new Jogo(6)
  const w = j.t.inicioLobo[1]
  const v = j.valor(j.ini, w, LOBO)
  const boas = j.boas(j.ini, w, LOBO)
  assert.ok(boas.length >= 1)
  for (const [o2, w2, v2] of boas) {
    const f = j.depois(o2, w2, v2)
    assert.equal(v > 0 ? 1 - f : -(f + 1), v)
  }
})

test('o valor nao depende do caminho: perguntar duas vezes da o mesmo, e sem -0', () => {
  const j = new Jogo(6, 7)
  const a = j.inicio(j.t.inicioLobo[0], OVELHAS)
  const b = j.inicio(j.t.inicioLobo[0], OVELHAS)
  assert.equal(a, b)
  assert.ok(!Object.is(a, -0))
})

test('as ovelhas de partida podem ser outras: tres ovelhas no 8x8 perdem', () => {
  const t = tabuleiro(8)
  const j = new Jogo(8, 8, t.ovelhasIniciais.slice(0, 3))
  assert.equal(j.k, 3)
  for (const w of t.inicioLobo) assert.equal(vencedor(j.inicio(w, LOBO), LOBO).lado, 'lobo')
})
