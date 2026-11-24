# Lobo e Ovelhas

O Lobo e as Ovelhas resolvido por busca completa, em JavaScript puro, sem dependência nenhuma.

Um lobo contra quatro ovelhas, nas casas escuras de um tabuleiro de damas. As ovelhas começam na linha 0 e só andam para a frente, uma casa na diagonal. O lobo começa numa casa escura da última linha e anda uma casa na diagonal para qualquer lado. Ninguém come ninguém.

- O lobo ganha quando chega à linha 0, de onde as ovelhas saíram.
- Quem não tem jogada na sua vez perde. Para o lobo, isso é estar cercado.

**Página jogável:** <https://condedeveloper.github.io/lobo-e-ovelhas/>

---

## Os quatro achados

**1. No 8×8 as ovelhas ganham de qualquer jeito, e no 10×10 também.** De qualquer uma das quatro casas de partida do lobo, comece quem começar. Com o lobo começando, a partida perfeita dura **44 meio-lances**; com as ovelhas começando, **43**. No 10×10, que visitou **165.200.308 posições**, são 72 e 71.

**2. No tabuleiro de seis colunas, o vencedor vira com a paridade da altura.** Com três ovelhas e altura a partir de 6, quem ganha depende de a altura ser par ou ímpar e de quem começa. No **6×6 ganha quem começa**: o lobo começando, ganha o lobo; as ovelhas começando, ganham as ovelhas. No **6×7 ganha quem não começa**. E assim alterna até o 6×12, o último medido.

**3. Nas larguras 4 e 8 a partida perfeita cresce exatamente uma largura por linha.** As ovelhas ganham sempre, e cada linha a mais no tabuleiro acrescenta exatamente **4 meio-lances na largura 4** (alturas 4 a 10) e **8 na largura 8** (alturas 6 a 12), sem uma exceção.

**4. A vitória das ovelhas pede precisão.** No 8×8, nas **76.390** posições alcançáveis em que as ovelhas estão na vez e ganhando, **54,69%** das jogadas jogam a vitória fora, e em **34,35%** dessas posições só uma jogada a mantém.

---

## As tabelas

Todos os números abaixo saem de `node ferramentas/medidor.js` e estão presos em `testes/`. Nenhum foi digitado à mão. "Meio-lance" é a jogada de um lado só; o vencedor apressa e o perdedor demora. Quando todas as casas de partida do lobo dão o mesmo resultado, a tabela mostra uma linha só, e em todos os tabuleiros medidos foi assim.

### Os tabuleiros quadrados

| tabuleiro | ovelhas | o lobo começa | as ovelhas começam |
| --- | --- | --- | --- |
| 4×4 | 2 | ovelhas em 8 | ovelhas em 7 |
| 6×6 | 3 | **lobo em 25** | ovelhas em 21 |
| 8×8 | 4 | ovelhas em 44 | ovelhas em 43 |
| 10×10 | 5 | ovelhas em 72 | ovelhas em 71 |

### Seis colunas, três ovelhas

| altura | o lobo começa | as ovelhas começam |
| --- | --- | --- |
| 4 | ovelhas em 8 | ovelhas em 9 |
| 5 | ovelhas em 16 | ovelhas em 13 |
| 6 | **lobo em 25** | ovelhas em 21 |
| 7 | ovelhas em 28 | **lobo em 32** |
| 8 | **lobo em 33** | ovelhas em 33 |
| 9 | ovelhas em 40 | **lobo em 40** |
| 10 | **lobo em 41** | ovelhas em 45 |
| 11 | ovelhas em 52 | **lobo em 40** |
| 12 | **lobo em 41** | ovelhas em 57 |

### Quatro e oito colunas

| largura | alturas | o lobo começa | as ovelhas começam |
| --- | --- | --- | --- |
| 4 | 4 a 10 | ovelhas em 8, 12, 16, …, 32 | ovelhas em 7, 11, 15, …, 31 |
| 8 | 6 a 12 | ovelhas em 28, 36, 44, …, 76 | ovelhas em 27, 35, 43, …, 75 |

### A precisão das ovelhas

Todas as posições alcançáveis a partir dos inícios (qualquer casa do lobo, qualquer lado começando, qualquer jogada dos dois), e entre elas as que têm a vez das ovelhas e as ovelhas ganhando.

| tabuleiro | posições alcançáveis | ovelhas na vez e ganhando | jogadas | jogam a vitória fora | uma jogada só serve | qualquer jogada serve |
| --- | --- | --- | --- | --- | --- | --- |
| 4×4 | 231 | 32 | 71 | 35 (49,30%) | 28 (87,50%) | 5 (15,63%) |
| 6×6 | 20.598 | 1.626 | 6.598 | 3.415 (51,76%) | 711 (43,73%) | 89 (5,47%) |
| 8×8 | 1.788.326 | 76.390 | 453.036 | 247.778 (54,69%) | 26.239 (34,35%) | 3.900 (5,11%) |

### O juiz contra o núcleo

| tabuleiro | posições | divergências |
| --- | --- | --- |
| 4×4 | 336 | 0 |
| 6×6 | 24.480 | 0 |
| 6×7 | 47.880 | 0 |
| 6×8 | 85.008 | 0 |
| 8×8 | 2.013.760 | 0 |
| 4×4, juiz sem a regra da linha 0 | 336 | **140** |
| 6×6, juiz sem a regra da linha 0 | 24.480 | **19.209** |

As duas últimas linhas são o controle negativo: um juiz que concorda com tudo não prova nada, então o teste confere também que, sem a regra de chegada, ele discorda.

---

## Como funciona

**A partida não tem ciclo.** Toda jogada das ovelhas aumenta em 1 a soma das linhas delas, e entre duas jogadas das ovelhas o lobo joga uma vez só. Então nenhuma posição se repete e a partida sempre acaba. A busca não precisa detectar repetição, e o valor de cada posição é exato: vitória ou derrota, e em quantos meio-lances.

**O núcleo** (`js/lobo.js`) desce a árvore com memória. As ovelhas são um conjunto ordenado de casas, numerado pelo sistema combinatório (um número de 0 a C(D, k) − 1, sem buraco), e o valor de cada posição fica num `Int8Array`. A busca não aloca nada: cada profundidade tem o seu vetor de trabalho.

**O juiz** (`js/juiz.js`) não importa nada do núcleo e não usa recursão. Ele enumera **todos** os conjuntos de ovelhas, agrupa pela soma das linhas e resolve de trás para frente, camada por camada: primeiro a vez das ovelhas, que depende da camada seguinte, já pronta; depois a vez do lobo, que depende da vez das ovelhas na mesma camada. As ovelhas são uma máscara de bits e os valores ficam num `Map`.

---

## O que as medidas me corrigiram

- **O 10×10 levou 10 minutos na primeira versão.** A busca alocava uma lista nova a cada jogada (`slice`, `sort`, um vetor por filho), e foram 165 milhões de posições. Trocar por um vetor de trabalho por profundidade e ordenar só a ovelha que andou levou o 10×10 para pouco mais de 2 minutos e o 8×8 de 783 ms para 179 ms, com exatamente o mesmo número de posições visitadas e as mesmas respostas.
- **A mensagem de fim de jogo dizia "O lobo ganharam."** O teste de navegador, jogando ao acaso com as ovelhas, foi quem chegou ao fim da partida e mostrou a frase. A concordância agora vem inteira de um lado só.

---

## Como rodar

Precisa de Node 20 ou mais novo. Sem dependência nenhuma.

```bash
npm test                                # a suíte inteira, com o 10x10 (uns minutos)
npm run medir                           # as tabelas rápidas
node ferramentas/medidor.js retangulos  # uma tabela só
node ferramentas/medidor.js dez         # o 10x10
```

## Licença

MIT
