"""Monta downloads/bella-beauty-identidade-completa.zip com todos os arquivos
da marca. Roda por último, depois de gerar-marca.py e renderizar.js.

Uso: python3 scripts/empacotar.py
"""
import os
import zipfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, "downloads", "bella-beauty-identidade-completa.zip")
PASTA = "Bella Beauty Studio - Identidade"

LEIA_ME = """BELLA BEAUTY STUDIO — IDENTIDADE VISUAL
Manual de marca online: https://bellabeauty.isgodigital.com.br

01 Logo/
   Uma pasta por versão de cor. Em cada uma: horizontal, vertical,
   símbolo e logotipo, em SVG (vetor), PDF (vetor) e PNG (2400 px,
   fundo transparente).

   principal  champagne + dourado, para fundos escuros (versão oficial)
   champagne  monocromática, fundos escuros
   dourado    monocromática, fundos verdes
   oliva      monocromática, fundos claros
   floresta   monocromática, fundos claros
   preto      impressão em uma cor
   branco     vazados e fotos

02 Paleta/
   .ase  abre direto no Illustrator, Photoshop e InDesign
   .png  amostras com todos os códigos
   .txt  HEX, RGB e CMYK
   .css / .json  para sites e sistemas

03 Aplicações/
   Simulações da marca aplicada.

TIPOGRAFIA
   Buljirya Regular (títulos e nome da marca) — gratuita só para uso
   pessoal. Para uso comercial, adquira a licença com a Hishand Studio:
   https://www.fontspace.com/buljirya-font-f63797
   Montserrat (textos de apoio) — licença livre:
   https://fonts.google.com/specimen/Montserrat

REGRAS RÁPIDAS
   Área de proteção: metade da altura do "B" do logotipo em volta da marca.
   Tamanho mínimo: horizontal 120 px / 30 mm · vertical 80 px / 22 mm ·
   símbolo 24 px / 8 mm.
   Não distorcer, girar, trocar cores, aplicar sombras ou usar sem contraste.

Identidade visual por IsGo! Mídia & Marketing — https://isgodigital.com.br
"""


def main():
    with zipfile.ZipFile(DESTINO, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.writestr(f"{PASTA}/LEIA-ME.txt", LEIA_ME)
        for base, _, arquivos in os.walk(os.path.join(RAIZ, "downloads", "logo")):
            for a in sorted(arquivos):
                caminho = os.path.join(base, a)
                versao = os.path.basename(base)
                z.write(caminho, f"{PASTA}/01 Logo/{versao}/{a}")
        pal = os.path.join(RAIZ, "downloads", "paleta")
        for a in sorted(os.listdir(pal)):
            z.write(os.path.join(pal, a), f"{PASTA}/02 Paleta/{a}")
        for a in ("aplicacao-fachada.webp", "aplicacao-instagram.webp", "aplicacao-quadro.webp", "variacoes-de-cor.webp"):
            z.write(os.path.join(RAIZ, "img", a), f"{PASTA}/03 Aplicações/{a}")
    print(DESTINO, round(os.path.getsize(DESTINO) / 1e6, 1), "MB")


if __name__ == "__main__":
    main()
