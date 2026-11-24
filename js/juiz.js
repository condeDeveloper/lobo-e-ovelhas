// O juiz. Nao importa nada do nucleo e nao usa recursao.
//
// O nucleo desce a arvore do jogo com memoria. O juiz sobe: enumera TODOS os
// conjuntos de ovelhas, agrupa pela soma das linhas (que so cresce) e resolve
// de tras para frente, camada por camada. Dentro de uma camada, primeiro as
// posicoes com a vez das ovelhas (que dependem da camada seguinte, ja pronta),
// depois as com a vez do lobo (que dependem das das ovelhas na mesma camada).
//
// As ovelhas sao uma mascara de bits, e o valor fica num Map. O formato do
// valor e o mesmo do nucleo, para dar para comparar posicao por posicao:
// +d ganha quem joga em d - 1 meio-lances, -d perde resistindo d - 1.

function casasEscuras (L, A) {
  const cs = []
  for (let y = 0; y < A; y++) for (let x = 0; x < L; x++) if ((x + y) & 1) cs.push({ x, y })
  return cs
}

// semChegada desliga a regra de o lobo ganhar na linha 0. Existe so para o
// controle negativo: um juiz que concorda com tudo nao prova nada, entao o
// teste confere tambem que sem a regra ele DISCORDA do nucleo.
export function juiz (L, A, k, { semChegada = false } = {}) {
  const cs = casasEscuras(L, A)
  const D = cs.length
  if (D > 44) throw new Error('mascara grande demais para o juiz')
  const pos = new Map(cs.map((c, i) => [c.x + ',' + c.y, i]))
  const em = (x, y) => pos.get(x + ',' + y)
  const diag = cs.map(({ x, y }) => [em(x - 1, y - 1), em(x + 1, y - 1), em(x - 1, y + 1), em(x + 1, y + 1)].filter((v) => v !== undefined))
  const avante = cs.map(({ x, y }) => [em(x - 1, y + 1), em(x + 1, y + 1)].filter((v) => v !== undefined))
  const bit = (i) => 2 ** i
  const tem = (m, i) => Math.floor(m / bit(i)) % 2 === 1

  // todos os conjuntos de k casas, com a soma das linhas
  const camadas = new Map()
  const escolhe = (de, falta, m, soma) => {
    if (falta === 0) {
      if (!camadas.has(soma)) camadas.set(soma, [])
      camadas.get(soma).push(m)
      return
    }
    for (let i = de; i <= D - falta; i++) escolhe(i + 1, falta - 1, m + bit(i), soma + cs[i].y)
  }
  escolhe(0, k, 0, 0)

  const val = new Map() // chave -> valor
  const ch = (m, w, vez) => (m * 64 + w) * 2 + vez
  const somas = [...camadas.keys()].sort((a, b) => b - a)
  for (const s of somas) {
    for (const m of camadas.get(s)) {
      // vez das ovelhas (vez = 1)
      for (let w = 0; w < D; w++) {
        if (tem(m, w)) continue
        let ganha = Infinity
        let perde = -1
        for (let i = 0; i < D; i++) {
          if (!tem(m, i)) continue
          for (const c of avante[i]) {
            if (c === w || tem(m, c)) continue
            const f = val.get(ch(m - bit(i) + bit(c), w, 0))
            if (f < 0) ganha = Math.min(ganha, 1 - f)
            else perde = Math.max(perde, f + 1)
          }
        }
        val.set(ch(m, w, 1), ganha < Infinity ? ganha : perde >= 0 ? -perde : -1)
      }
      // vez do lobo (vez = 0)
      for (let w = 0; w < D; w++) {
        if (tem(m, w)) continue
        let ganha = Infinity
        let perde = -1
        for (const c of diag[w]) {
          if (tem(m, c)) continue
          const f = cs[c].y === 0 && !semChegada ? -1 : val.get(ch(m, c, 1))
          if (f < 0) ganha = Math.min(ganha, 1 - f)
          else perde = Math.max(perde, f + 1)
        }
        val.set(ch(m, w, 0), ganha < Infinity ? ganha : perde >= 0 ? -perde : -1)
      }
    }
  }
  return {
    D,
    total: val.size,
    // o valor de uma posicao dada pelas casas das ovelhas
    valor (ovelhas, w, vez) {
      let m = 0
      for (const i of ovelhas) m += bit(i)
      return val.get(ch(m, w, vez))
    },
    * todas () {
      for (const [key, v] of val) {
        const vez = key % 2
        const w = Math.floor(key / 2) % 64
        const m = Math.floor(key / 128)
        const ov = []
        for (let i = 0; i < D; i++) if (tem(m, i)) ov.push(i)
        yield [ov, w, vez, v]
      }
    }
  }
}
