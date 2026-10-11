# Bella Beauty Studio — Manual de marca interativo

Manual de marca da Bella Beauty Studio em formato de site, no lugar do PDF.
Identidade visual e site por **IsGo! Mídia & Marketing**.

Endereço planejado: <https://bellabeauty.isgodigital.com.br>

É um site estático: HTML, CSS e JS sem etapa de build. As animações usam
GSAP 3.13 (ScrollTrigger, SplitText, DrawSVG e CustomEase, todos gratuitos),
que fica em `assets/vendor/` para não depender de CDN.

## O que tem no site

| Seção | O que faz |
| --- | --- |
| Abertura | A borboleta se desenha: os dois "B" são traçados, o segundo se espelha, nascem corpo, antenas e folhas, e o nome entra letra a letra. |
| 01 Essência | Conceito da marca; as palavras do manifesto acendem com a rolagem. |
| 02 Símbolo | Seção presa na tela que monta o símbolo em 5 passos, até as guias de construção. |
| 03 Assinaturas | Horizontal, vertical e símbolo animando entre si, nos 4 fundos aprovados, com área de proteção. |
| 04 Cores | As 5 cores oficiais em faixas que se empilham; tocar no código copia. |
| 05 Tipografia | "B" desenhado ao vivo, alfabeto da Buljirya e testador da Montserrat. |
| 06 Aplicações | Galeria com rolagem horizontal (no celular, vertical). |
| 07 Usos incorretos | Seis exemplos do que não fazer. |
| 08 Downloads | Logo em 7 versões × 4 assinaturas × SVG/PNG/PDF, paleta (.ase, .png, .txt, .css, .json) e o ZIP completo. |

Quem prefere menos movimento (`prefers-reduced-motion`) vê tudo no estado
final, sem animação.

## Arquivos

| Caminho | Para que serve |
| --- | --- |
| `index.html` | A página. |
| `assets/css/estilo.css` | Todo o visual. |
| `assets/js/site.js` | Montagem do logo em SVG e todas as animações. |
| `assets/js/marca-dados.js` | Peças do logo (asas, folhas, letras…) e paleta. **Gerado**, não editar à mão. |
| `img/` | Fotos e simulações do manual, favicon e `og.jpg` (miniatura do link). |
| `downloads/` | Tudo o que o site oferece para baixar. **Gerado** pelos scripts. |
| `fonte/assinatura-horizontal.webp` | Prancha do manual de onde o logo foi vetorizado. |
| `marca/vetores.json` | Resultado da vetorização. |
| `scripts/` | Os quatro passos que geram os arquivos da marca. |

## De onde veio o vetor do logo

Não havia arquivo vetorial original, então o logo foi **vetorizado a partir da
prancha "assinatura horizontal"** do manual (2400 px), separando o champagne e
o dourado por cor e traçando com potrace. O resultado é fiel, mas não é o
arquivo de origem do Illustrator. **Quando o vetor original existir, troque por
ele**: basta substituir os caminhos em `marca/vetores.json` (ou gerar os SVGs a
partir dele) e rodar os passos 2 a 4 abaixo.

## Como regenerar os arquivos da marca

```bash
pip install potracer pillow numpy
python3 scripts/vetorizar.py fonte/assinatura-horizontal.webp marca/vetores.json   # 1. vetoriza (só se mudar a prancha)
python3 scripts/gerar-marca.py                                                     # 2. SVGs, paleta e dados do site
npm i -D playwright && node scripts/renderizar.js                                  # 3. PNG, PDF, og.jpg, favicon
python3 scripts/empacotar.py                                                       # 4. ZIP completo
```

## Publicar na Cloudflare Pages (sem a marca da Vercel no endereço)

1. Em <https://dash.cloudflare.com>, entre em **Workers & Pages → Create →
   Pages → Connect to Git** e escolha o repositório `IsGo-Bella-Beuty`.
2. Configuração do build:
   - **Framework preset:** None
   - **Build command:** deixe vazio
   - **Build output directory:** `/`
3. **Save and Deploy.** O site sobe em um endereço `*.pages.dev`.
4. No projeto, abra **Custom domains → Set up a custom domain** e digite
   `bellabeauty.isgodigital.com.br`.
   - Se o DNS de `isgodigital.com.br` já está na Cloudflare, ela cria o
     registro sozinha.
   - Se o DNS está em outro lugar (registro.br, Vercel, Hostinger…), crie lá
     um registro **CNAME** com nome `bellabeauty` apontando para o endereço
     `*.pages.dev` do projeto. O HTTPS sai automático em alguns minutos.

Depois disso, todo `git push` na `main` republica o site sozinho.

## Pontos para a IsGo! validar

- **Licença da fonte Buljirya.** Ela é gratuita só para uso pessoal; o uso
  comercial (logo, fachada, posts) exige comprar a licença com a Hishand
  Studio. O site não distribui a fonte, só aponta onde comprar.
- **Regras que não estavam no manual em PDF** e foram propostas aqui: área de
  proteção (½ da altura do "B"), tamanhos mínimos, versões monocromáticas
  extras (floresta, preto, branco) e os usos incorretos. Ajuste se a IsGo!
  definir outros valores.
- **CMYK** é conversão matemática do RGB. Para impressão crítica, confirme com
  a gráfica.
