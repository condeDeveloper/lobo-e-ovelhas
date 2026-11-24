// O nucleo do Lobo e as Ovelhas. ESM puro, sem DOM.
//
// Tabuleiro de damas com L colunas e A linhas, so as casas escuras: (x + y)
// impar. As ovelhas, L/2 delas, comecam nas casas escuras da linha 0 e so andam
// para a frente (y + 1), uma casa na diagonal. O lobo comeca numa casa escura
// da ultima linha e anda uma casa na diagonal para qualquer lado. Ninguem come
// ninguem.
//
//   - O lobo ganha quando chega na linha 0, a casa de onde as ovelhas sairam.
//   - Quem nao tem jogada na sua vez perde. Para o lobo e isso que significa
//     ficar cercado; para as ovelhas e raro, mas acontece quando todas ficam
//     travadas.
//
// Toda jogada das ovelhas aumenta em 1 a soma das linhas delas, e entre duas
// jogadas das ovelhas o lobo joga uma vez so. Entao a partida nao tem ciclo e
// sempre acaba: a busca com memoria abaixo nao precisa detectar repeticao.

export const LOBO = 0
export const OVELHAS = 1

const binom = []
for (let a = 0; a <= 80; a++) {
  binom.push(new Float64Array(9))
  binom[a][0] = 1
  for (let b = 1; b <= Math.min(a, 8); b++) binom[a][b] = binom[a - 1][b - 1] + (b <= a - 1 ? binom[a - 1][b] : 0)
}
export const C = (a, b) => (b < 0 || b > a ? 0 : binom[a][b])

// As casas escuras, numeradas linha a linha, e quem vai para onde.
export function tabuleiro (L, A = L) {
  const casas = []
  const idx = new Map()
  for (let y = 0; y < A; y++) {
    for (let x = 0; x < L; x++) {
      if ((x + y) % 2 === 1) { idx.set(x + ',' + y, casas.length); casas.push([x, y]) }
    }
  }
  const viz = (lista) => casas.map(([x, y]) => lista
    .map(([dx, dy]) => idx.get((x + dx) + ',' + (y + dy))).filter((c) => c !== undefined))
  const lobo = viz([[-1, -1], [1, -1], [-1, 1], [1, 1]])
  const frente = viz([[-1, 1], [1, 1]])
  const naLinha = (l) => casas.map((c, i) => [c, i]).filter(([[, y]]) => y === l).map(([, i]) => i)
  return { L, A, casas, idx, lobo, frente, ovelhasIniciais: naLinha(0), inicioLobo: naLinha(A - 1), D: casas.length }
}

// O posto de um conjunto ordenado de casas no sistema combinatorio: um numero
// de 0 a C(D, k) - 1, sem buraco, para usar de indice num vetor.
export function posto (ov) {
  let r = 0
  for (let i = 0; i < ov.length; i++) r += C(ov[i], i + 1)
  return r
}

// O valor de uma posicao, do ponto de vista de quem esta na vez:
//   +d  quem joga ganha, e com o melhor jogo a partida acaba em d - 1 lances
//   -d  quem joga perde, e resiste no maximo d - 1 lances
// O deslocamento de 1 existe porque 0 no vetor de memoria quer dizer "ainda
// nao calculado": quem esta sem jogada perdeu em 0 lances, e isso vale -1.
// Lance aqui e meio-lance, uma jogada de um lado so. O vencedor apressa, o
// perdedor demora.
export class Jogo {
  constructor (L, A = L, ovelhas = null) {
    this.t = tabuleiro(L, A)
    this.ini = ovelhas ? ovelhas.slice().sort((a, b) => a - b) : this.t.ovelhasIniciais
    this.k = this.ini.length
    this.tam = C(this.t.D, this.k) * this.t.D * 2
    this.memo = new Int8Array(this.tam)
    this.visitas = 0
    // um vetor de trabalho por profundidade: a busca nao aloca nada
    this.pilha = []
    this.linha0 = new Uint8Array(this.t.D)
    for (let c = 0; c < this.t.D; c++) this.linha0[c] = this.t.casas[c][1] === 0 ? 1 : 0
  }

  chave (ov, w, vez) { return (posto(ov) * this.t.D + w) * 2 + vez }

  buf (d) {
    while (this.pilha.length <= d) this.pilha.push(new Int32Array(this.k))
    return this.pilha[d]
  }

  // As jogadas de quem esta na vez, como listas [ovelhas, lobo, vez seguinte].
  // Serve a pagina e os testes; a busca tem o seu laco proprio, sem alocar.
  jogadas (ov, w, vez) {
    const r = []
    const ocupado = (c) => c === w || ov.includes(c)
    if (vez === LOBO) {
      for (const c of this.t.lobo[w]) if (!ocupado(c)) r.push([ov.slice(), c, OVELHAS])
    } else {
      for (let i = 0; i < ov.length; i++) {
        for (const c of this.t.frente[ov[i]]) {
          if (ocupado(c)) continue
          const novo = Array.from(ov)
          novo[i] = c
          novo.sort((a, b) => a - b)
          r.push([novo, w, LOBO])
        }
      }
    }
    return r
  }

  valor (ov, w, vez) { return this._valor(Int32Array.from(ov), w, vez, 0) }

  _valor (ov, w, vez, d) {
    const k = this.chave(ov, w, vez)
    const m = this.memo[k]
    if (m !== 0) return m
    this.visitas++
    const K = this.k
    let melhorGanha = 999
    let piorPerde = 0
    let alguma = false
    if (vez === LOBO) {
      for (const c of this.t.lobo[w]) {
        let livre = true
        for (let i = 0; i < K; i++) if (ov[i] === c) { livre = false; break }
        if (!livre) continue
        alguma = true
        // o lobo chegou: quem joga depois ja perdeu, em 0 lances
        const f = this.linha0[c] ? -1 : this._valor(ov, c, OVELHAS, d + 1)
        if (f < 0) { if (-f + 1 < melhorGanha) melhorGanha = -f + 1 } else if (f + 1 > piorPerde) piorPerde = f + 1
      }
    } else {
      const novo = this.buf(d)
      for (let i = 0; i < K; i++) {
        for (const c of this.t.frente[ov[i]]) {
          if (c === w) continue
          let livre = true
          for (let j = 0; j < K; j++) if (ov[j] === c) { livre = false; break }
          if (!livre) continue
          alguma = true
          // copia, troca a ovelha i por c e devolve a ordem: c e maior que a
          // casa antiga, entao ela so pode andar para a direita
          for (let j = 0; j < K; j++) novo[j] = ov[j]
          let p = i
          novo[p] = c
          while (p + 1 < K && novo[p + 1] < novo[p]) { const t = novo[p]; novo[p] = novo[p + 1]; novo[p + 1] = t; p++ }
          const f = this._valor(novo, w, LOBO, d + 1)
          if (f < 0) { if (-f + 1 < melhorGanha) melhorGanha = -f + 1 } else if (f + 1 > piorPerde) piorPerde = f + 1
        }
      }
    }
    const r = !alguma ? -1 : melhorGanha < 999 ? melhorGanha : -piorPerde
    this.memo[k] = r
    return r
  }

  // A partida do comeco: ovelhas nas casas iniciais, lobo na casa w.
  inicio (w, vez) { return this.valor(this.ini, w, vez) }

  // O valor depois de uma jogada, do ponto de vista de quem joga DEPOIS dela.
  depois (o2, w2, v2) {
    return v2 === OVELHAS && this.linha0[w2] ? -1 : this.valor(o2, w2, v2)
  }

  // As jogadas que mantem o melhor resultado para quem joga.
  boas (ov, w, vez) {
    const v = this.valor(ov, w, vez)
    return this.jogadas(ov, w, vez).filter(([o2, w2, v2]) => {
      const f = this.depois(o2, w2, v2)
      return v > 0 ? (f < 0 && -f + 1 === v) : (f > 0 && f + 1 === -v)
    })
  }
}

// Le o valor: quem ganha a partida, e em quantos meio-lances.
export function vencedor (v, vez) {
  const lado = v > 0 ? vez : 1 - vez
  return { lado: lado === LOBO ? 'lobo' : 'ovelhas', lances: Math.abs(v) - 1 }
}
