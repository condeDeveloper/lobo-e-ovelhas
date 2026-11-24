// Os numeros do README presos. Se o codigo mudar e um numero mudar, quebra.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { inicios, precisao, confronto } from '../js/medidas.js'

const g = (lado, lances) => ({ lado, lances })

test('8x8: as ovelhas ganham de qualquer casa do lobo, comece quem comecar', () => {
  const r = inicios(8, 8)
  assert.deepEqual(r.loboComeca, g('ovelhas', 44))
  assert.deepEqual(r.ovelhasComecam, g('ovelhas', 43))
})

test('4x4: as ovelhas ganham em 8 ou 7 meio-lances', () => {
  const r = inicios(4, 4)
  assert.deepEqual(r.loboComeca, g('ovelhas', 8))
  assert.deepEqual(r.ovelhasComecam, g('ovelhas', 7))
})

test('6x6: ganha quem comeca', () => {
  const r = inicios(6, 6)
  assert.deepEqual(r.loboComeca, g('lobo', 25))
  assert.deepEqual(r.ovelhasComecam, g('ovelhas', 21))
})

test('largura 6: a partir da altura 6 o vencedor vira com a paridade da altura', () => {
  const esperado = {
    4: ['ovelhas', 'ovelhas'],
    5: ['ovelhas', 'ovelhas'],
    6: ['lobo', 'ovelhas'],
    7: ['ovelhas', 'lobo'],
    8: ['lobo', 'ovelhas'],
    9: ['ovelhas', 'lobo'],
    10: ['lobo', 'ovelhas'],
    11: ['ovelhas', 'lobo'],
    12: ['lobo', 'ovelhas']
  }
  for (const [A, [a, b]] of Object.entries(esperado)) {
    const r = inicios(6, Number(A))
    assert.equal(r.loboComeca.lado, a, '6x' + A + ' lobo comeca')
    assert.equal(r.ovelhasComecam.lado, b, '6x' + A + ' ovelhas comecam')
  }
  // as alturas pares: ganha quem comeca; as impares: ganha quem NAO comeca
  assert.deepEqual(inicios(6, 7).ovelhasComecam, g('lobo', 32))
  assert.deepEqual(inicios(6, 12).ovelhasComecam, g('ovelhas', 57))
})

test('largura 4: a partida perfeita cresce exatamente 4 meio-lances por linha', () => {
  for (let A = 4; A <= 10; A++) {
    const r = inicios(4, A)
    assert.deepEqual(r.loboComeca, g('ovelhas', 8 + 4 * (A - 4)), '4x' + A)
    assert.deepEqual(r.ovelhasComecam, g('ovelhas', 7 + 4 * (A - 4)), '4x' + A)
  }
})

test('precisao no 6x6: 51,76% das jogadas das ovelhas jogam a vitoria fora', () => {
  const p = precisao(6, 6)
  assert.deepEqual(p, { alcancaveis: 20598, posicoes: 1626, jogadas: 6598, perdem: 3415, unica: 711, todasBoas: 89 })
})

test('precisao no 4x4: em 28 das 32 posicoes so uma jogada mantem a vitoria', () => {
  const p = precisao(4, 4)
  assert.deepEqual(p, { alcancaveis: 231, posicoes: 32, jogadas: 71, perdem: 35, unica: 28, todasBoas: 5 })
})

test('o juiz concorda nos tabuleiros pequenos', () => {
  assert.deepEqual(confronto(4, 4), { estados: 336, dif: 0 })
  assert.deepEqual(confronto(6, 6), { estados: 24480, dif: 0 })
  assert.deepEqual(confronto(6, 7), { estados: 47880, dif: 0 })
})

test('controle negativo: sem a regra de chegada o juiz discorda', () => {
  assert.deepEqual(confronto(4, 4, { semChegada: true }), { estados: 336, dif: 140 })
  assert.deepEqual(confronto(6, 6, { semChegada: true }), { estados: 24480, dif: 19209 })
})
