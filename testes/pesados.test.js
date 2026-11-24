// A largura 8 em todas as alturas, a precisao no 8x8 e o juiz no 8x8 inteiro.
// Passam de meio minuto juntos, entao ficam num arquivo separado.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { inicios, precisao, confronto } from '../js/medidas.js'

const T = { timeout: 600000 }

test('largura 8: as ovelhas sempre ganham, e a partida cresce exatamente 8 meio-lances por linha', T, () => {
  for (let A = 6; A <= 12; A++) {
    const r = inicios(8, A)
    assert.deepEqual(r.loboComeca, { lado: 'ovelhas', lances: 28 + 8 * (A - 6) }, '8x' + A)
    assert.deepEqual(r.ovelhasComecam, { lado: 'ovelhas', lances: 27 + 8 * (A - 6) }, '8x' + A)
  }
})

test('precisao no 8x8: 54,69% das jogadas jogam a vitoria fora, e em 34,35% das posicoes so uma serve', T, () => {
  const p = precisao(8, 8)
  assert.deepEqual(p, { alcancaveis: 1788326, posicoes: 76390, jogadas: 453036, perdem: 247778, unica: 26239, todasBoas: 3900 })
})

test('o juiz concorda nas 2.013.760 posicoes do 8x8 e nas 85.008 do 6x8', T, () => {
  assert.deepEqual(confronto(8, 8), { estados: 2013760, dif: 0 })
  assert.deepEqual(confronto(6, 8), { estados: 85008, dif: 0 })
})
