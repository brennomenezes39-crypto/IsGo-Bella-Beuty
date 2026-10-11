"""Gera, a partir de marca/vetores.json:

- assets/js/marca-dados.js   peças do logo para o site animar
- downloads/logo/<versao>/<layout>.svg   todas as versões do logo
- downloads/paleta/*   paleta em .ase (Adobe), .css, .json e .txt

Uso: python3 scripts/gerar-marca.py
"""
import json
import os
import struct

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = json.load(open(os.path.join(RAIZ, "marca", "vetores.json")))

PALETA = [
    # nome, hex, papel
    ("Verde Floresta Profundo", "#18261C", "Fundo principal, base de toda a comunicação"),
    ("Verde Oliva", "#2A402F", "Fundos secundários, blocos e logo positivo"),
    ("Champagne Claro", "#F2EBDC", "Logo sobre escuro, fundos claros e respiros"),
    ("Dourado Areia", "#D9B07E", "Destaques, detalhes e logo sobre verde"),
    ("Caramelo Bronze", "#8C5E35", "Profundidade do dourado e acentos quentes"),
]
GRADIENTE = ("#EFD28A", "#D9B07E", "#8C5E35")

VERSOES = {
    # nome: (cor principal, cor de destaque) — None no destaque = monocromática
    "principal": ("#F2EBDC", "gradiente"),
    "champagne": ("#F2EBDC", None),
    "dourado": ("#D9B07E", None),
    "oliva": ("#2A402F", None),
    "floresta": ("#18261C", None),
    "preto": ("#000000", None),
    "branco": ("#FFFFFF", None),
}


def caixa(grupos):
    xs0, ys0, xs1, ys1 = zip(*(g["bbox"] for g in grupos))
    return min(xs0), min(ys0), max(xs1), max(ys1)


SIM, LOG = V["simbolo"], V["logotipo"]
CX_SIM = caixa(SIM["tinta"])
CX_LOG = caixa(LOG["tinta"])
DESCE_STUDIO = 214


def eh_studio(g):
    """A linha e a palavra "studio" ficam no alto, à direita do logotipo."""
    return g["bbox"][3] < 70 and g["bbox"][0] > 690


def camadas(peca, cor, destaque, desce_studio=0):
    """Lista de (cor, d, deslocamento vertical). Na assinatura vertical o
    "studio" desce para baixo do nome, como na prancha original."""
    if destaque is None:
        grupos = [(cor, g) for g in peca["tinta"]]
    else:
        grupos = [(cor, g) for g in peca["champagne"]] + [("url(#ouro)", g) for g in peca["dourado"]]
    saida = {}
    for c, g in grupos:
        dy = desce_studio if eh_studio(g) else 0
        saida.setdefault((c, dy), []).append(g["d"])
    return [(c, "".join(ds), dy) for (c, dy), ds in saida.items()]


def svg(layout, versao):
    cor, destaque = VERSOES[versao]
    corpo = []

    def coloca(peca, dx, dy, s=1.0, desce_studio=0):
        for c, d, extra in camadas(peca, cor, destaque, desce_studio):
            corpo.append(f'<path fill="{c}" fill-rule="evenodd" '
                         f'transform="translate({dx:.2f} {dy + extra * s:.2f}) scale({s:.4f})" d="{d}"/>')

    if layout == "simbolo":
        x0, y0, x1, y1 = CX_SIM
        coloca(SIM, -x0, -y0)
        w, h = x1 - x0, y1 - y0
    elif layout == "logotipo":
        x0, y0, x1, y1 = CX_LOG
        coloca(LOG, -x0, -y0)
        w, h = x1 - x0, y1 - y0
    elif layout == "horizontal":
        # Mesma relação da prancha original: logotipo 760 à direita, 100 abaixo
        sx0, sy0, sx1, sy1 = CX_SIM
        lx0, ly0, lx1, ly1 = CX_LOG
        top = min(sy0, ly0 + 100)
        coloca(SIM, -sx0, -top)
        coloca(LOG, 760 - sx0, 100 - top)
        w = 760 + lx1 - sx0
        h = max(sy1, ly1 + 100) - top
    elif layout == "vertical":
        # Medidas tiradas da prancha "Vertical": símbolo com 45% da largura do
        # logotipo, respiro de 65 e "studio" 214 abaixo da posição horizontal.
        sx0, sy0, sx1, sy1 = CX_SIM
        lw = CX_LOG[2] - CX_LOG[0]
        sw = sx1 - sx0
        s = 0.45 * lw / sw
        sh = (sy1 - sy0) * s
        topo = min(g["bbox"][1] for g in LOG["tinta"] if not eh_studio(g))
        coloca(SIM, (lw - sw * s) / 2 - sx0 * s, -sy0 * s, s)
        coloca(LOG, -CX_LOG[0], sh + 65 - topo, desce_studio=DESCE_STUDIO)
        w, h = lw, sh + 65 + (CX_LOG[3] - topo)
    defs = ""
    if destaque == "gradiente":
        defs = ('<defs><linearGradient id="ouro" gradientUnits="userSpaceOnUse" '
                f'x1="0" y1="0" x2="{w:.0f}" y2="{h:.0f}">'
                f'<stop offset="0" stop-color="{GRADIENTE[0]}"/>'
                f'<stop offset=".45" stop-color="{GRADIENTE[1]}"/>'
                f'<stop offset="1" stop-color="{GRADIENTE[2]}"/></linearGradient></defs>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.2f} {h:.2f}" '
            f'width="{w:.0f}" height="{h:.0f}">'
            f'<title>Bella Beauty Studio — {layout} ({versao})</title>{defs}{"".join(corpo)}</svg>')


def dados_site():
    """Peças nomeadas para as animações do site."""
    x0, y0, x1, y1 = CX_SIM
    meio = (x0 + x1) / 2
    asas = sorted(SIM["champagne"], key=lambda g: g["bbox"][0])
    ouro = SIM["dourado"]
    folhas = sorted([g for g in ouro if g["bbox"][1] > 250 and g["bbox"][2] - g["bbox"][0] > 80],
                    key=lambda g: g["bbox"][0])
    antenas = sorted([g for g in ouro if g["bbox"][3] < 150], key=lambda g: g["bbox"][0])
    centro = sorted([g for g in ouro if g not in folhas and g not in antenas],
                    key=lambda g: g["bbox"][1])
    lx0, ly0, lx1, ly1 = CX_LOG
    linha = max(LOG["dourado"], key=lambda g: g["bbox"][2] - g["bbox"][0])
    studio = [g for g in LOG["dourado"] if g is not linha]
    return {
        "simbolo": {
            "box": [x0, y0, x1 - x0, y1 - y0], "meio": meio,
            "asaE": asas[0]["d"], "asaD": asas[1]["d"],
            "folhaE": folhas[0]["d"], "folhaD": folhas[1]["d"],
            "anteE": antenas[0]["d"], "anteD": antenas[1]["d"],
            "cabeca": centro[0]["d"], "corpo": centro[1]["d"],
        },
        "logotipo": {
            "box": [lx0, ly0, lx1 - lx0, ly1 - ly0],
            "letras": [g["d"] for g in LOG["champagne"]],
            "linha": linha["d"], "linhaBox": linha["bbox"],
            "studio": "".join(g["d"] for g in studio),
            "desceStudio": DESCE_STUDIO,
            "topoLetras": min(g["bbox"][1] for g in LOG["champagne"]),
            "alturaB": LOG["champagne"][0]["bbox"][3] - LOG["champagne"][0]["bbox"][1],
        },
        "paleta": [{"nome": n, "hex": h, "uso": u} for n, h, u in PALETA],
        "gradiente": GRADIENTE,
    }


def rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def cmyk(h):
    r, g, b = (c / 255 for c in rgb(h))
    k = 1 - max(r, g, b)
    if k >= 1:
        return 0, 0, 0, 100
    return tuple(round(100 * v) for v in ((1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k))


def ase(cores):
    """Adobe Swatch Exchange 1.0 — abre no Illustrator, Photoshop e InDesign."""
    def bloco_cor(nome, h):
        n = (nome + "\0").encode("utf-16-be")
        corpo = struct.pack(">H", len(n) // 2) + n + b"RGB " + struct.pack(">fff", *(c / 255 for c in rgb(h))) + struct.pack(">H", 2)
        return struct.pack(">HI", 0x0001, len(corpo)) + corpo

    grupo = ("Bella Beauty Studio\0").encode("utf-16-be")
    ini = struct.pack(">HI", 0xC001, 2 + len(grupo)) + struct.pack(">H", len(grupo) // 2) + grupo
    fim = struct.pack(">HI", 0xC002, 0)
    blocos = [ini] + [bloco_cor(n, h) for n, h, _ in cores] + [fim]
    return b"ASEF" + struct.pack(">HHI", 1, 0, len(blocos)) + b"".join(blocos)


def main():
    out = os.path.join(RAIZ, "downloads", "logo")
    for versao in VERSOES:
        os.makedirs(os.path.join(out, versao), exist_ok=True)
        for layout in ("horizontal", "vertical", "simbolo", "logotipo"):
            with open(os.path.join(out, versao, f"bella-beauty-{layout}.svg"), "w") as fh:
                fh.write(svg(layout, versao))

    js = os.path.join(RAIZ, "assets", "js")
    os.makedirs(js, exist_ok=True)
    with open(os.path.join(js, "marca-dados.js"), "w") as fh:
        fh.write("// Gerado por scripts/gerar-marca.py — não editar à mão.\n")
        fh.write("window.MARCA = " + json.dumps(dados_site(), separators=(",", ":")) + ";\n")

    pal = os.path.join(RAIZ, "downloads", "paleta")
    os.makedirs(pal, exist_ok=True)
    with open(os.path.join(pal, "bella-beauty-paleta.ase"), "wb") as fh:
        fh.write(ase(PALETA))
    linhas_txt, linhas_css, dados = [], [":root {"], []
    for nome, h, uso in PALETA:
        r, g, b = rgb(h)
        c, m, y, k = cmyk(h)
        linhas_txt.append(f"{nome}\n  HEX  {h}\n  RGB  {r}, {g}, {b}\n  CMYK {c}, {m}, {y}, {k} (conversão aproximada)\n  Uso  {uso}\n")
        var = nome.lower().replace(" ", "-").replace("ç", "c")
        linhas_css.append(f"  --{var}: {h};")
        dados.append({"nome": nome, "hex": h, "rgb": [r, g, b], "cmyk": [c, m, y, k], "uso": uso})
    linhas_css.append(f"  --gradiente-dourado: linear-gradient(135deg, {GRADIENTE[0]}, {GRADIENTE[1]} 45%, {GRADIENTE[2]});")
    linhas_css.append("}")
    with open(os.path.join(pal, "bella-beauty-paleta.txt"), "w") as fh:
        fh.write("BELLA BEAUTY STUDIO — PALETA OFICIAL\n\n" + "\n".join(linhas_txt)
                 + f"\nGradiente dourado: {' → '.join(GRADIENTE)}\n\nIdentidade por IsGo! — isgodigital.com.br\n")
    with open(os.path.join(pal, "bella-beauty-paleta.css"), "w") as fh:
        fh.write("\n".join(linhas_css) + "\n")
    with open(os.path.join(pal, "bella-beauty-paleta.json"), "w") as fh:
        json.dump({"marca": "Bella Beauty Studio", "cores": dados, "gradiente": GRADIENTE}, fh, ensure_ascii=False, indent=2)
    print("ok")


if __name__ == "__main__":
    main()
