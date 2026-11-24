// A pagina: so desenho e clique. As jogadas e o valor de cada posicao vem do
// nucleo, o mesmo arquivo que os testes varrem.

import { Jogo, vencedor, LOBO, OVELHAS } from './lobo.js'

const elTab = document.getElementById('tabuleiro')
const elEstado = document.getElementById('estado')
const elTamanho = document.getElementById('tamanho')
const elLado = document.getElementById('lado')
const elComeca = document.getElementById('comeca')

const jogos = new Map()
let j, ov, w, vez, humano, escolhida, historico, fim

function jogoDe (L, A) {
  const k = L + 'x' + A
  if (!jogos.has(k)) jogos.set(k, new Jogo(L, A))
  return jogos.get(k)
}

function comeca () {
  const [L, A] = elTamanho.value.split('x').map(Number)
  j = jogoDe(L, A)
  humano = elLado.value === 'lobo' ? LOBO : OVELHAS
  vez = Number(elComeca.value)
  ov = j.ini.slice()
  const ws = j.t.inicioLobo
  if (humano === LOBO) {
    w = ws[Math.floor(ws.length / 2)]
  } else {
    // a maquina escolhe a casa de partida que e melhor para o lobo
    let melhor = -Infinity
    for (const c of ws) {
      const v = j.valor(ov, c, vez)
      const paraLobo = vez === LOBO ? v : -v
      if (paraLobo > melhor) { melhor = paraLobo; w = c }
    }
  }
  escolhida = null
  historico = []
  fim = null
  desenha()
  maquina()
}

function acabou () {
  if (j.t.casas[w][1] === 0) return 'lobo'
  if (j.jogadas(ov, w, vez).length === 0) return vez === LOBO ? 'ovelhas' : 'lobo'
  return null
}

function joga ([o2, w2, v2]) {
  historico.push({ ov, w, vez })
  ov = o2
  w = w2
  vez = v2
  escolhida = null
  fim = acabou()
  desenha()
  maquina()
}

function maquina () {
  if (fim || vez === humano) return
  setTimeout(() => {
    const boas = j.boas(ov, w, vez)
    joga(boas[0])
  }, 350)
}

function clica (c) {
  if (fim || vez !== humano) return
  const minhas = j.jogadas(ov, w, vez)
  if (escolhida !== null) {
    const alvo = minhas.find(([o2, w2]) => vez === LOBO
      ? w2 === c
      : !o2.includes(escolhida) && o2.includes(c) && !ov.includes(c))
    if (alvo) { joga(alvo); return }
  }
  const minha = vez === LOBO ? c === w : ov.includes(c)
  escolhida = minha ? c : null
  desenha()
}

function desenha () {
  const { L, A, casas, idx } = j.t
  elTab.style.gridTemplateColumns = `repeat(${L}, 1fr)`
  elTab.style.width = `min(100%, ${Math.min(440, L * 54)}px)`
  elTab.innerHTML = ''
  const minhas = !fim && vez === humano ? j.jogadas(ov, w, vez) : []
  const alvos = new Set()
  if (escolhida !== null) {
    for (const [o2, w2] of minhas) {
      if (vez === LOBO) alvos.add(w2)
      else if (!o2.includes(escolhida)) for (const c of o2) if (!ov.includes(c)) alvos.add(c)
    }
  }
  for (let y = 0; y < A; y++) {
    for (let x = 0; x < L; x++) {
      const b = document.createElement('button')
      b.type = 'button'
      if ((x + y) % 2 === 0) {
        b.className = 'casa clara'
        b.disabled = true
      } else {
        const c = idx.get(x + ',' + y)
        b.className = 'casa escura' + (c === w ? ' lobo' : '') + (ov.includes(c) ? ' ovelha' : '') +
          (c === escolhida ? ' sel' : '') + (alvos.has(c) ? ' alvo' : '')
        b.setAttribute('aria-label', c === w ? 'lobo' : ov.includes(c) ? 'ovelha' : 'casa vazia')
        b.addEventListener('click', () => clica(c))
      }
      elTab.appendChild(b)
    }
  }
  void casas
  if (fim) {
    const voce = (fim === 'lobo') === (humano === LOBO)
    elEstado.innerHTML = `<span class="${voce ? 'ok' : 'aviso'}">${fim === 'lobo' ? 'O lobo ganhou' : 'As ovelhas ganharam'}.</span> ${voce ? 'Você ganhou.' : 'A máquina ganhou.'}`
    return
  }
  const r = vencedor(j.valor(ov, w, vez), vez)
  const quem = vez === humano ? 'Sua vez' : 'Vez da máquina'
  elEstado.textContent = `${quem}. Com jogo perfeito dos dois lados, ${r.lado === 'lobo' ? 'o lobo ganha' : 'as ovelhas ganham'} em ${r.lances} meio-lances.`
}

for (const el of [elTamanho, elLado, elComeca]) el.addEventListener('change', comeca)
document.getElementById('reiniciar').addEventListener('click', comeca)
document.getElementById('voltar').addEventListener('click', () => {
  // volta ate a ultima vez do humano
  while (historico.length) {
    const h = historico.pop()
    ;({ ov, w, vez } = h)
    if (vez === humano) break
  }
  escolhida = null
  fim = null
  desenha()
  maquina()
})

comeca()
