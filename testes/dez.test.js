// O 10x10: 165 milhoes de posicoes visitadas, uns dois minutos e 212 MB de
// memoria. Roda UMA vez, no job das tabelas, e nao nos nove da matriz.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Jogo, vencedor, LOBO, OVELHAS } from '../js/lobo.js'

test('10x10: as ovelhas ganham de qualquer casa do lobo, em 72 ou 71 meio-lances', { timeout: 1200000 }, () => {
  const j = new Jogo(10, 10)
  for (const w of j.t.inicioLobo) {
    assert.deepEqual(vencedor(j.inicio(w, LOBO), LOBO), { lado: 'ovelhas', lances: 72 })
    assert.deepEqual(vencedor(j.inicio(w, OVELHAS), OVELHAS), { lado: 'ovelhas', lances: 71 })
  }
  assert.equal(j.visitas, 165200308)
})
