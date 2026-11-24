#!/usr/bin/env node
// O medidor. Roda as tabelas e cospe os numeros que vao para o README.
//
//   node ferramentas/medidor.js              as tabelas rapidas
//   node ferramentas/medidor.js quadrados    4x4, 6x6 e 8x8
//   node ferramentas/medidor.js retangulos   larguras 4, 6 e 8, varias alturas
//   node ferramentas/medidor.js precisao     quantas jogadas mantem a vitoria das ovelhas
//   node ferramentas/medidor.js juiz         o juiz contra o nucleo, e o controle negativo
//   node ferramentas/medidor.js dez          o 10x10 (uns minutos, fica fora do "todas")

import { inicios, retangulos, precisao, confronto } from '../js/medidas.js'

const n = (x) => x.toLocaleString('pt-BR')
const pc = (a, b) => (100 * a / b).toFixed(2).replace('.', ',') + '%'
const fmt = (r) => Array.isArray(r)
  ? r.map((x) => `${x.lado} em ${x.lances}`).join(' | ')
  : `${r.lado.padEnd(7)} em ${r.lances} meio-lances`

function tQuadrados (lista = [[4, 4], [6, 6], [8, 8]]) {
  console.log('\n== quem ganha, de qualquer casa de partida do lobo ==')
  for (const [L, A] of lista) {
    const r = inicios(L, A)
    console.log(`  ${L}x${A}  lobo comeca: ${fmt(r.loboComeca)}   ovelhas comecam: ${fmt(r.ovelhasComecam)}`)
  }
}

function tRetangulos () {
  console.log('\n== tabuleiros retangulos: L colunas (L/2 ovelhas) x A linhas ==')
  for (const r of retangulos()) {
    console.log(`  ${r.L}x${String(r.A).padEnd(2)}  lobo comeca: ${fmt(r.loboComeca)}   ovelhas comecam: ${fmt(r.ovelhasComecam)}`)
  }
}

function tPrecisao () {
  console.log('\n== a vitoria das ovelhas pede precisao ==')
  for (const [L, A] of [[4, 4], [6, 6], [8, 8]]) {
    const p = precisao(L, A)
    console.log(`  ${L}x${A}: ${n(p.alcancaveis)} posicoes alcancaveis; ${n(p.posicoes)} com a vez das ovelhas e as ovelhas ganhando`)
    console.log(`        ${n(p.jogadas)} jogadas, ${n(p.perdem)} jogam a vitoria fora (${pc(p.perdem, p.jogadas)})`)
    console.log(`        uma jogada so mantem a vitoria em ${n(p.unica)} (${pc(p.unica, p.posicoes)}); qualquer jogada serve em ${n(p.todasBoas)} (${pc(p.todasBoas, p.posicoes)})`)
  }
}

function tJuiz () {
  console.log('\n== o juiz (de tras para frente, por camadas) contra o nucleo (busca com memoria) ==')
  for (const [L, A] of [[4, 4], [6, 6], [6, 7], [6, 8], [8, 8]]) {
    const c = confronto(L, A)
    console.log(`  ${L}x${A}: ${n(c.estados)} posicoes, ${c.dif} divergencias`)
  }
  console.log('  controle negativo: o juiz SEM a regra de chegada na linha 0')
  for (const [L, A] of [[4, 4], [6, 6]]) {
    const c = confronto(L, A, { semChegada: true })
    console.log(`  ${L}x${A}: ${n(c.estados)} posicoes, ${n(c.dif)} divergencias`)
  }
}

function tDez () {
  const t = Date.now()
  tQuadrados([[10, 10]])
  console.log(`  (${Math.round((Date.now() - t) / 1000)} s)`)
}

const tabelas = { quadrados: () => tQuadrados(), retangulos: tRetangulos, precisao: tPrecisao, juiz: tJuiz, dez: tDez }
const pedidas = process.argv.slice(2)
for (const k of pedidas.length ? pedidas : ['quadrados', 'retangulos', 'precisao', 'juiz']) {
  if (!tabelas[k]) { console.error('tabela desconhecida: ' + k); process.exit(1) }
  tabelas[k]()
}
