// As tabelas do README, uma funcao por tabela. O medidor imprime, os testes
// prendem.

import { Jogo, vencedor, LOBO, OVELHAS } from './lobo.js'
import { juiz } from './juiz.js'

const jogos = new Map()
export function jogo (L, A) {
  const k = L + 'x' + A
  if (!jogos.has(k)) jogos.set(k, new Jogo(L, A))
  return jogos.get(k)
}

// Quem ganha a partida do comeco, para cada casa de partida do lobo e para
// cada lado comecando. Resumido: se todas as casas de partida dao o mesmo
// resultado, uma linha so.
export function inicios (L, A) {
  const j = jogo(L, A)
  const r = {}
  for (const [vez, nome] of [[LOBO, 'loboComeca'], [OVELHAS, 'ovelhasComecam']]) {
    const res = j.t.inicioLobo.map((w) => vencedor(j.inicio(w, vez), vez))
    const iguais = res.every((x) => x.lado === res[0].lado && x.lances === res[0].lances)
    r[nome] = iguais ? res[0] : res
  }
  return r
}

export const RETANGULOS = [
  [4, 4], [4, 5], [4, 6], [4, 7], [4, 8], [4, 9], [4, 10],
  [6, 4], [6, 5], [6, 6], [6, 7], [6, 8], [6, 9], [6, 10], [6, 11], [6, 12],
  [8, 6], [8, 7], [8, 8], [8, 9], [8, 10], [8, 11], [8, 12]
]

export function retangulos () {
  return RETANGULOS.map(([L, A]) => ({ L, A, ...inicios(L, A) }))
}

// A precisao que a vitoria das ovelhas exige. Percorre todas as posicoes que
// aparecem a partir dos inicios (qualquer casa do lobo, qualquer lado
// comecando, qualquer jogada dos dois), e nas que tem a vez das ovelhas e as
// ovelhas ganhando conta quantas jogadas mantem a vitoria.
export function precisao (L, A) {
  const j = jogo(L, A)
  const vistos = new Set()
  let fila = []
  for (const w of j.t.inicioLobo) for (const vez of [LOBO, OVELHAS]) fila.push([j.ini.slice(), w, vez])
  let posicoes = 0
  let jogadas = 0
  let perdem = 0
  let unica = 0
  let todasBoas = 0
  while (fila.length) {
    const prox = []
    for (const [ov, w, vez] of fila) {
      const k = j.chave(ov, w, vez)
      if (vistos.has(k)) continue
      vistos.add(k)
      if (vez === OVELHAS && j.t.casas[w][1] === 0) continue // o lobo ja chegou
      const js = j.jogadas(ov, w, vez)
      if (vez === OVELHAS && j.valor(ov, w, vez) > 0) {
        posicoes++
        const boas = j.boas(ov, w, vez).length
        // "mantem a vitoria" e qualquer jogada que deixa o lobo perdendo, nao
        // so as mais rapidas
        const mantem = js.filter(([o2, w2, v2]) => j.depois(o2, w2, v2) < 0).length
        void boas
        jogadas += js.length
        perdem += js.length - mantem
        if (mantem === 1) unica++
        if (mantem === js.length) todasBoas++
      }
      for (const x of js) prox.push(x)
    }
    fila = prox
  }
  return { alcancaveis: vistos.size, posicoes, jogadas, perdem, unica, todasBoas }
}

// O juiz contra o nucleo em todas as posicoes do tabuleiro.
export function confronto (L, A, opcoes) {
  const J = juiz(L, A, L / 2, opcoes)
  const g = jogo(L, A)
  let dif = 0
  let n = 0
  for (const [ov, w, vez, v] of J.todas()) {
    n++
    if (g.valor(ov, w, vez) !== v) dif++
  }
  return { estados: n, dif }
}
