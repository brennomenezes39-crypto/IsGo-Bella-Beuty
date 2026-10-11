"""Vetoriza o símbolo e o logotipo da Bella Beauty Studio a partir da prancha
"assinatura horizontal" do manual (imagem 2400x1697).

As duas cores da marca são separadas por saturação: o champagne é quase
neutro e o dourado é bem saturado. Cada cor vira uma camada traçada com
potrace (pacote `potracer`, Python puro). As curvas são agrupadas — contorno
externo + os furos dele — para que cada peça (asa, folha, letra) possa ser
animada sozinha sem perder os miolos.

Uso:
    pip install potracer pillow numpy
    python3 scripts/vetorizar.py fonte/assinatura-horizontal.webp marca/vetores.json
"""
import json
import sys

import numpy as np
import potrace
from PIL import Image, ImageFilter

ESCALA = 3  # amplia antes de traçar: curvas bem mais lisas

# Recortes na prancha original de 2400x1697
RECORTES = {
    "simbolo": (180, 630, 850, 1060),
    "logotipo": (940, 730, 2220, 1030),
}


def mascaras(recorte):
    grande = recorte.resize((recorte.width * ESCALA, recorte.height * ESCALA), Image.LANCZOS)
    grande = grande.filter(ImageFilter.GaussianBlur(1.2))
    a = np.asarray(grande).astype(float)
    lum = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
    tinta = lum > 75  # tudo que não é o fundo verde
    mx = np.max(a, 2)
    sat = (mx - np.min(a, 2)) / np.maximum(mx, 1)
    dourado = tinta & (sat > 0.30)
    return {"tinta": tinta, "dourado": dourado, "champagne": tinta & ~dourado}


def curvas(mascara):
    # potracer traça o lado False do bitmap, por isso a inversão
    bm = potrace.Bitmap(~mascara)
    lista = bm.trace(turdsize=60, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY,
                     alphamax=1.0, opticurve=True, opttolerance=0.25)
    saida = []
    for c in lista:
        pts = [c.start_point]
        d = [f"M{c.start_point.x / ESCALA:.2f} {c.start_point.y / ESCALA:.2f}"]
        for s in c.segments:
            if s.is_corner:
                d.append(f"L{s.c.x / ESCALA:.2f} {s.c.y / ESCALA:.2f}"
                         f"L{s.end_point.x / ESCALA:.2f} {s.end_point.y / ESCALA:.2f}")
                pts += [s.c, s.end_point]
            else:
                d.append(f"C{s.c1.x / ESCALA:.2f} {s.c1.y / ESCALA:.2f} "
                         f"{s.c2.x / ESCALA:.2f} {s.c2.y / ESCALA:.2f} "
                         f"{s.end_point.x / ESCALA:.2f} {s.end_point.y / ESCALA:.2f}")
                pts += [s.c1, s.c2, s.end_point]
        d.append("Z")
        xs = [p.x / ESCALA for p in pts]
        ys = [p.y / ESCALA for p in pts]
        saida.append({"d": "".join(d), "bbox": [min(xs), min(ys), max(xs), max(ys)]})
    return saida


def area(b):
    return (b[2] - b[0]) * (b[3] - b[1])


def dentro(a, b):
    return a[0] >= b[0] and a[1] >= b[1] and a[2] <= b[2] and a[3] <= b[3]


def agrupar(lista):
    """Junta cada furo (e ilha dentro do furo) ao contorno que o contém."""
    grupos = []
    for c in sorted(lista, key=lambda c: -area(c["bbox"])):
        pai = next((g for g in grupos if dentro(c["bbox"], g["bbox"])), None)
        if pai:
            pai["d"] += c["d"]
        else:
            grupos.append({"d": c["d"], "bbox": c["bbox"]})
    return sorted(grupos, key=lambda g: g["bbox"][0])


def main(origem, destino):
    img = Image.open(origem).convert("RGB")
    resultado = {}
    for nome, caixa in RECORTES.items():
        rec = img.crop(caixa)
        camadas = {k: agrupar(curvas(m)) for k, m in mascaras(rec).items()}
        # A borda antisserrilhada do dourado sobre o verde sai pouco saturada e
        # vira lascas finíssimas na camada champagne; descarta essas sobras.
        camadas["champagne"] = [g for g in camadas["champagne"] if area(g["bbox"]) > 300]
        resultado[nome] = {"w": rec.width, "h": rec.height, **camadas}
        print(nome, rec.size, {k: len(v) for k, v in camadas.items()})
    with open(destino, "w") as fh:
        json.dump(resultado, fh)


if __name__ == "__main__":
    main(*sys.argv[1:3])
