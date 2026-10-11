/* Bella Beauty Studio — Manual de marca · IsGo!
   Todas as peças do logo vêm de window.MARCA (gerado por scripts/gerar-marca.py)
   e são montadas aqui como SVG para poderem ser animadas uma a uma. */
(() => {
  "use strict";

  const M = window.MARCA;
  const NS = "http://www.w3.org/2000/svg";
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const temGsap = typeof window.gsap !== "undefined";
  if (temGsap) gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase);

  const COR = { floresta: "#18261C", oliva: "#2A402F", champagne: "#F2EBDC", dourado: "#D9B07E", caramelo: "#8C5E35" };
  const S = M.simbolo, L = M.logotipo;
  const [sx0, sy0, sw, sh] = S.box;
  const [lx0, ly0, lw, lh] = L.box;
  const meio = S.meio, cy = sy0 + sh / 2;

  /* ---------------- construção de SVG ---------------- */
  let uid = 0;
  function el(tag, attrs = {}, pai) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (pai) pai.appendChild(e);
    return e;
  }
  function gradiente(svg, x, y, w, h) {
    const id = "ouro" + ++uid;
    const defs = svg.querySelector("defs") || el("defs", {}, svg);
    const g = el("linearGradient", { id, gradientUnits: "userSpaceOnUse", x1: x, y1: y, x2: x + w, y2: y + h }, defs);
    [[0, M.gradiente[0]], [0.45, M.gradiente[1]], [1, M.gradiente[2]]]
      .forEach(([o, c]) => el("stop", { offset: o, "stop-color": c }, g));
    return `url(#${id})`;
  }
  function pecasSimbolo(pai, cor, ouro) {
    const g = el("g", { class: "sim" }, pai), p = { g };
    for (const k of ["asaE", "asaD"]) p[k] = el("path", { d: S[k], fill: cor, "fill-rule": "evenodd" }, g);
    for (const k of ["corpo", "cabeca", "anteE", "anteD", "folhaE", "folhaD"]) p[k] = el("path", { d: S[k], fill: ouro, "fill-rule": "evenodd" }, g);
    p.asas = [p.asaE, p.asaD];
    p.ouro = [p.corpo, p.cabeca, p.anteE, p.anteD, p.folhaE, p.folhaD];
    return p;
  }
  function pecasLogotipo(pai, cor, ouro) {
    const g = el("g", { class: "log" }, pai);
    const letras = L.letras.map(d => el("path", { d, fill: cor, "fill-rule": "evenodd" }, g));
    const st = el("g", { class: "studio" }, g);
    const linha = el("path", { d: L.linha, fill: ouro }, st);
    const studio = el("path", { d: L.studio, fill: ouro, "fill-rule": "evenodd" }, st);
    return { g, letras, st, linha, studio };
  }
  function simbolo(svg, { cor = COR.champagne, ouro, pad = 12 } = {}) {
    svg.setAttribute("viewBox", `${sx0 - pad} ${sy0 - pad} ${sw + 2 * pad} ${sh + 2 * pad}`);
    return pecasSimbolo(svg, cor, ouro || gradiente(svg, sx0, sy0, sw, sh));
  }
  function logotipo(svg, { cor = COR.champagne, ouro, pad = 6 } = {}) {
    svg.setAttribute("viewBox", `${lx0 - pad} ${ly0 - pad} ${lw + 2 * pad} ${lh + 2 * pad}`);
    return pecasLogotipo(svg, cor, ouro || gradiente(svg, lx0, ly0, lw, lh));
  }
  // as asas giram em torno do eixo do corpo
  const eixo = `${meio} ${cy}`;
  function bater(asas, vezes = 1, forca = 0.38, dur = 0.2) {
    return gsap.timeline().to(asas, { scaleX: forca, duration: dur, ease: "sine.inOut", yoyo: true, repeat: vezes * 2 - 1, svgOrigin: eixo });
  }

  /* ---------------- utilidades ---------------- */
  const aviso = qs(".aviso");
  let avisoTimer;
  function avisar(txt) {
    aviso.textContent = txt;
    aviso.classList.add("ver");
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => aviso.classList.remove("ver"), 1800);
  }
  async function copiar(texto, rotulo) {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      const t = el("textarea");
      t.value = texto; document.body.appendChild(t); t.select();
      document.execCommand("copy"); t.remove();
    }
    avisar(`${rotulo || texto} copiado`);
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-copiar]");
    if (b) copiar(b.dataset.copiar, b.dataset.rotulo);
  });

  /* ---------------- montagem estática (vale com ou sem animação) ---------------- */
  const abertura = { s: simbolo(qs('[data-simbolo="abertura"]'), { pad: 4 }), l: logotipo(qs('[data-logotipo="abertura"]')) };
  const mini = simbolo(qs('[data-simbolo="mini"]'), { pad: 30 });
  const pacote = simbolo(qs('[data-simbolo="pacote"]'), { cor: COR.floresta, ouro: COR.floresta, pad: 30 });
  const rodape = simbolo(qs('[data-simbolo="rodape"]'), { cor: COR.floresta });

  // Símbolo + guias de construção
  const svgAna = qs('[data-simbolo="anatomia"]');
  const PADA = 70;
  svgAna.setAttribute("viewBox", `${sx0 - PADA} ${sy0 - PADA} ${sw + 2 * PADA} ${sh + 2 * PADA}`);
  const guias = el("g", { class: "guias" }, svgAna);
  const ana = pecasSimbolo(svgAna, COR.floresta, gradiente(svgAna, sx0, sy0, sw, sh));
  const espelho = x => 2 * meio - x;
  const linhasGuia = [
    el("line", { class: "guia guia-tracejada", x1: meio, y1: sy0 - 50, x2: meio, y2: sy0 + sh + 50 }, guias),
    el("line", { class: "guia", x1: sx0 - 50, y1: 70, x2: sx0 + sw + 50, y2: 70 }, guias),
    el("line", { class: "guia", x1: sx0 - 50, y1: 411, x2: sx0 + sw + 50, y2: 411 }, guias),
    el("line", { class: "guia guia-tracejada", x1: sx0 - 50, y1: 226, x2: sx0 + sw + 50, y2: 226 }, guias),
  ];
  const bojos = [[162, 158, 72, 82], [167, 316, 94, 85]].flatMap(([x, y, rx, ry]) => [
    el("ellipse", { class: "guia", cx: x, cy: y, rx, ry }, guias),
    el("ellipse", { class: "guia", cx: espelho(x), cy: y, rx, ry }, guias),
  ]);
  const cotas = [
    el("text", { class: "cota", x: meio + 10, y: sy0 - 34 }, guias),
    el("text", { class: "cota", x: sx0 - 50, y: 62 }, guias),
    el("text", { class: "cota", x: sx0 - 50, y: 218 }, guias),
  ];
  ["EIXO DE SIMETRIA", "TOPO DAS ASAS", "CINTURA"].forEach((t, i) => (cotas[i].textContent = t));

  // Glifo "B" de Bella, em destaque na tipografia
  const svgGlifo = qs("[data-glifo]");
  const glifo = el("path", { d: L.letras[0], fill: COR.champagne, "fill-rule": "evenodd" }, svgGlifo);
  const bb = glifo.getBBox();
  svgGlifo.setAttribute("viewBox", `${bb.x - 6} ${bb.y - 6} ${bb.width + 12} ${bb.height + 12}`);

  /* ---------------- 03 assinatura viva ---------------- */
  const svgAss = qs("[data-assinatura]");
  const ouroAss = gradiente(svgAss, 0, 0, 2040, 600);
  const prot = el("g", { class: "protecao" }, svgAss);
  const protFora = el("rect", {}, prot), protDentro = el("rect", {}, prot);
  const protX = [0, 1, 2, 3].map(() => el("rect", { class: "x" }, prot));
  const protTxt = el("text", {}, prot); protTxt.textContent = "½B";
  const assSim = pecasSimbolo(el("g", {}, svgAss), COR.champagne, ouroAss);
  const assLog = pecasLogotipo(el("g", {}, svgAss), COR.champagne, ouroAss);
  const meiaB = L.alturaB / 2;

  const LAYOUTS = {
    horizontal() {
      const top = Math.min(sy0, ly0 + 100);
      return { sx: -sx0, sy: -top, ss: 1, lx: 760 - sx0, ly: 100 - top, lo: 1, dy: 0,
        w: 760 + lx0 + lw - sx0, h: Math.max(sy0 + sh, ly0 + lh + 100) - top, m: meiaB };
    },
    vertical() {
      const s = 0.45 * lw / sw, alt = sh * s, topo = L.topoLetras;
      return { sx: (lw - sw * s) / 2 - sx0 * s, sy: -sy0 * s, ss: s, lx: -lx0, ly: alt + 65 - topo, lo: 1, dy: L.desceStudio,
        w: lw, h: alt + 65 + (ly0 + lh - topo), m: meiaB };
    },
    simbolo() {
      return { sx: -sx0, sy: -sy0, ss: 1, lx: -lx0, ly: sh + 160, lo: 0, dy: 0, w: sw, h: sh, m: sh / 4 };
    },
  };
  const REGRAS = {
    horizontal: ["120 px · 30 mm", "Fachadas, assinaturas de e-mail, cabeçalhos e peças horizontais."],
    vertical: ["80 px · 22 mm", "Perfis, embalagens, cartões, quadros e peças verticais ou quadradas."],
    simbolo: ["24 px · 8 mm", "Avatar, favicon, selos e padronagens — quando a marca já foi apresentada."],
  };
  const FUNDOS = {
    floresta: { bg: COR.floresta, cor: COR.champagne, ouro: null, guia: COR.dourado },
    oliva: { bg: COR.oliva, cor: COR.dourado, ouro: COR.dourado, guia: COR.champagne },
    champagne: { bg: COR.champagne, cor: COR.oliva, ouro: COR.oliva, guia: COR.caramelo },
    dourado: { bg: COR.dourado, cor: COR.champagne, ouro: COR.champagne, guia: COR.floresta },
  };
  const estado = { ...LAYOUTS.horizontal() };
  function desenhaAssinatura() {
    const e = estado, pad = 8;
    svgAss.setAttribute("viewBox", `${-e.m - pad} ${-e.m - pad} ${e.w + 2 * e.m + 2 * pad} ${e.h + 2 * e.m + 2 * pad}`);
    assSim.g.parentNode.setAttribute("transform", `translate(${e.sx} ${e.sy}) scale(${e.ss})`);
    assLog.g.parentNode.setAttribute("transform", `translate(${e.lx} ${e.ly})`);
    assLog.g.parentNode.setAttribute("opacity", e.lo);
    assLog.st.setAttribute("transform", `translate(0 ${e.dy})`);
    const r = (n, x, y, w, h) => { n.setAttribute("x", x); n.setAttribute("y", y); n.setAttribute("width", Math.max(w, 0)); n.setAttribute("height", Math.max(h, 0)); };
    r(protFora, -e.m, -e.m, e.w + 2 * e.m, e.h + 2 * e.m);
    r(protDentro, 0, 0, e.w, e.h);
    r(protX[0], -e.m, -e.m, e.m, e.m); r(protX[1], e.w, -e.m, e.m, e.m);
    r(protX[2], -e.m, e.h, e.m, e.m); r(protX[3], e.w, e.h, e.m, e.m);
    protTxt.setAttribute("x", -e.m + 10); protTxt.setAttribute("y", -e.m + 30);
  }
  desenhaAssinatura();
  let layoutAtual = "horizontal", fundoAtual = "floresta";
  function trocaLayout(nome) {
    layoutAtual = nome;
    qsa("[data-layout]").forEach(b => b.setAttribute("aria-selected", b.dataset.layout === nome));
    qs("[data-minimo]").textContent = REGRAS[nome][0];
    qs("[data-quando]").textContent = REGRAS[nome][1];
    const alvo = LAYOUTS[nome]();
    if (!temGsap || reduzido()) { Object.assign(estado, alvo); desenhaAssinatura(); return; }
    gsap.to(estado, { ...alvo, duration: 1.3, ease: "expo.inOut", onUpdate: desenhaAssinatura });
    gsap.fromTo(assSim.asas, { scaleX: 1 }, { scaleX: 0.4, duration: 0.25, yoyo: true, repeat: 3, ease: "sine.inOut", svgOrigin: eixo, delay: 0.5 });
  }
  function trocaFundo(nome) {
    fundoAtual = nome;
    const f = FUNDOS[nome];
    qsa("[data-fundo]").forEach(b => b.setAttribute("aria-checked", b.dataset.fundo === nome));
    qs(".assinaturas-palco").style.background = f.bg;
    const pecasCor = [...assSim.asas, ...assLog.letras];
    const pecasOuro = [...assSim.ouro, assLog.linha, assLog.studio];
    const dur = temGsap && !reduzido() ? 0.7 : 0;
    const set = (els, cor) => temGsap ? gsap.to(els, { fill: cor, duration: dur, ease: "power2.inOut" }) : els.forEach(n => (n.style.fill = cor));
    set(pecasCor, f.cor);
    if (f.ouro) set(pecasOuro, f.ouro);
    else if (temGsap) gsap.to(pecasOuro, { fill: COR.dourado, duration: dur, onComplete: () => pecasOuro.forEach(n => (n.style.fill = ouroAss)) });
    else pecasOuro.forEach(n => (n.style.fill = ouroAss));
    prot.style.setProperty("--g", f.guia);
    [protFora, protDentro, ...protX].forEach(n => (n.style.stroke = f.guia));
    protTxt.style.fill = f.guia;
  }
  qsa("[data-layout]").forEach(b => b.addEventListener("click", () => trocaLayout(b.dataset.layout)));
  qsa("[data-fundo]").forEach(b => b.addEventListener("click", () => trocaFundo(b.dataset.fundo)));
  qs("[data-protecao]").addEventListener("change", e => {
    if (temGsap) gsap.to(prot, { opacity: e.target.checked ? 1 : 0, duration: 0.5 });
    else prot.style.opacity = e.target.checked ? 1 : 0;
  });

  /* ---------------- 04 faixas de cor ---------------- */
  const claras = new Set(["#F2EBDC", "#D9B07E"]);
  function rgb(h) { return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); }
  function cmyk(h) {
    const [r, g, b] = rgb(h).map(v => v / 255), k = 1 - Math.max(r, g, b);
    if (k >= 1) return [0, 0, 0, 100];
    return [r, g, b].map(v => Math.round(100 * (1 - v - k) / (1 - k))).concat(Math.round(100 * k));
  }
  qs("[data-faixas]").innerHTML = M.paleta.map((c, i) => {
    const r = rgb(c.hex).join(", "), k = cmyk(c.hex).join(", ");
    const texto = claras.has(c.hex) ? COR.floresta : COR.champagne;
    return `<article class="faixa" style="--cor:${c.hex};--texto:${texto}">
      <div class="faixa-topo"><span class="faixa-numero">0${i + 1} / 05</span></div>
      <h3>${c.nome}</h3>
      <p class="faixa-uso">${c.uso}</p>
      <div class="faixa-codigos">
        <button data-copiar="${c.hex}" data-rotulo="HEX ${c.hex}">${c.hex}</button>
        <button data-copiar="rgb(${r})" data-rotulo="RGB"><small>RGB</small>${r}</button>
        <button data-copiar="${k}" data-rotulo="CMYK"><small>CMYK</small>${k}</button>
      </div></article>`;
  }).join("");

  /* ---------------- 05 testador de fonte ---------------- */
  const nomesPeso = { 200: "ExtraLight", 300: "Light", 400: "Regular", 500: "Medium", 600: "SemiBold" };
  const testador = qs("[data-testador]");
  qs("[data-peso]").addEventListener("input", e => {
    testador.style.fontWeight = e.target.value;
    qs("[data-peso-valor]").textContent = `${nomesPeso[e.target.value]} ${e.target.value}`;
  });
  qs("[data-tamanho]").addEventListener("input", e => {
    testador.style.fontSize = e.target.value + "px";
    qs("[data-tamanho-valor]").textContent = e.target.value + " px";
  });

  /* ---------------- 08 downloads ---------------- */
  const NOMES_VERSAO = {
    principal: "Principal — champagne e dourado, para fundos escuros",
    champagne: "Champagne — monocromática, para fundos escuros",
    dourado: "Dourado — monocromática, para fundos verdes",
    oliva: "Oliva — monocromática, para fundos claros",
    floresta: "Floresta — a mais escura da paleta, para fundos claros",
    preto: "Preto — impressão em uma cor, carimbos e documentos",
    branco: "Branco — vazados, gravações e fundos fotográficos",
  };
  const LAYOUTS_ARQ = [["horizontal", "Horizontal"], ["vertical", "Vertical"], ["simbolo", "Símbolo"], ["logotipo", "Logotipo"]];
  function listaArquivos(versao) {
    qs("[data-versao-nome]").textContent = NOMES_VERSAO[versao];
    qs("[data-arquivos-logo]").innerHTML = LAYOUTS_ARQ.map(([arq, nome]) => {
      const base = `downloads/logo/${versao}/bella-beauty-${arq}`;
      return `<li class="arquivo-linha"><span>${nome}</span><span class="formatos">`
        + ["svg", "png", "pdf"].map(f => `<a href="${base}.${f}" download aria-label="${nome} em ${f.toUpperCase()}">${f.toUpperCase()}</a>`).join("")
        + `</span></li>`;
    }).join("");
  }
  qsa("[data-versao]").forEach(b => b.addEventListener("click", () => {
    qsa("[data-versao]").forEach(x => x.setAttribute("aria-checked", x === b));
    listaArquivos(b.dataset.versao);
  }));
  listaArquivos("principal");

  /* ---------------- índice (celular) ---------------- */
  const menu = qs(".nav-menu"), indice = qs("#indice");
  function abreIndice(abrir) {
    indice.hidden = !abrir;
    menu.setAttribute("aria-expanded", abrir);
    menu.textContent = abrir ? "Fechar" : "Índice";
    document.body.style.overflow = abrir ? "hidden" : "";
  }
  menu.addEventListener("click", () => abreIndice(indice.hidden));
  qsa("#indice a").forEach(a => a.addEventListener("click", () => abreIndice(false)));

  if (!temGsap) return;

  /* ================================================================
     ANIMAÇÕES
     ================================================================ */
  function reduzido() { return matchMedia("(prefers-reduced-motion: reduce)").matches; }
  CustomEase.create("seda", "M0,0 C0.16,1 0.3,1 1,1");

  // barra de progresso e navegação sólida
  gsap.to(".progresso span", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
  ScrollTrigger.create({ start: 60, end: "max", toggleClass: { targets: ".nav", className: "solida" } });
  function marcaMenu() {
    qsa(".nav-links a").forEach(a => {
      const sec = qs(a.getAttribute("href"));
      if (sec) ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", toggleClass: { targets: a, className: "atual" } });
    });
  }

  // cursor
  const cursor = qs(".cursor");
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const cx = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
    const cyq = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
    addEventListener("pointermove", e => { cx(e.clientX); cyq(e.clientY); cursor.classList.add("vivo"); });
    document.addEventListener("pointerover", e => cursor.classList.toggle("sobre", !!e.target.closest("a, button, [data-copiar], input, [contenteditable]")));
  }

  const mm = gsap.matchMedia();
  document.fonts.ready.then(() => {
    mm.add({ mov: "(prefers-reduced-motion: no-preference)", red: "(prefers-reduced-motion: reduce)", larga: "(min-width: 900px)" }, ctx => {
      const { mov, larga } = ctx.conditions;
      if (!mov) { estatico(); marcaMenu(); return; }

      /* ---------- abertura: a borboleta se desenha ---------- */
      const { s, l } = abertura;
      gsap.set(s.asas, { fillOpacity: 0, stroke: COR.champagne, strokeWidth: 1.6, drawSVG: 0 });
      gsap.set(s.asaD, { scaleX: -1, svgOrigin: eixo });
      gsap.set(s.corpo, { scaleY: 0, transformOrigin: "50% 0%" });
      gsap.set(s.cabeca, { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(s.anteE, { scale: 0, transformOrigin: "100% 100%" });
      gsap.set(s.anteD, { scale: 0, transformOrigin: "0% 100%" });
      gsap.set(s.folhaE, { scale: 0, rotate: -40, transformOrigin: "100% 10%" });
      gsap.set(s.folhaD, { scale: 0, rotate: 40, transformOrigin: "0% 10%" });
      gsap.set(l.letras, { y: 90, opacity: 0 });
      gsap.set(l.linha, { scaleX: 0, transformOrigin: "100% 50%" });
      gsap.set(l.studio, { opacity: 0, x: -20 });
      gsap.set(".abertura-rotulo, .abertura-assina, .rolar", { opacity: 0, y: 16 });
      gsap.set(".abertura-luz", { opacity: 0, scale: 0.6 });

      gsap.timeline({ delay: 0.25, defaults: { ease: "power3.out" } })
        .to(s.asaE, { drawSVG: "100%", duration: 1.8, ease: "power2.inOut" })
        .to(s.asaD, { drawSVG: "100%", duration: 1.8, ease: "power2.inOut" }, 0.15)
        .to(s.asaD, { scaleX: 1, duration: 1.4, ease: "expo.inOut", svgOrigin: eixo }, 1.2)
        .to(".abertura-luz", { opacity: 1, scale: 1, duration: 2.4, ease: "seda" }, 1.3)
        .to(s.asas, { fillOpacity: 1, duration: 1 }, 2.1)
        .to(s.asas, { strokeOpacity: 0, duration: 0.8 }, 2.5)
        .to(s.corpo, { scaleY: 1, duration: 0.9 }, 2.2)
        .to(s.cabeca, { scale: 1, duration: 0.7, ease: "back.out(3)" }, 2.5)
        .to([s.anteE, s.anteD], { scale: 1, duration: 1, ease: "elastic.out(1, .55)" }, 2.6)
        .to([s.folhaE, s.folhaD], { scale: 1, rotate: 0, duration: 1.2, ease: "back.out(1.4)" }, 2.6)
        .add(bater(s.asas, 2, 0.45, 0.22), 3.3)
        .to(l.letras, { y: 0, opacity: 1, duration: 1.2, stagger: 0.05, ease: "expo.out" }, 3.4)
        .to(l.linha, { scaleX: 1, duration: 1, ease: "expo.inOut" }, 4)
        .to(l.studio, { opacity: 1, x: 0, duration: 0.8 }, 4.5)
        .to(".abertura-rotulo, .abertura-assina, .rolar", { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 4.4);

      // ao rolar, a abertura se afasta
      gsap.to(".abertura-logo", { yPercent: -18, scale: 0.9, opacity: 0, ease: "none",
        scrollTrigger: { trigger: ".abertura", start: "top top", end: "bottom top", scrub: true } });

      /* ---------- borboleta da navegação bate as asas com a rolagem ---------- */
      gsap.set(mini.asas, { svgOrigin: eixo });
      const ocioso = gsap.timeline({ repeat: -1, repeatDelay: 3.2, delay: 5 }).add(bater(mini.asas, 2, 0.45, 0.16));
      let voo = null;
      ScrollTrigger.create({
        onUpdate(self) {
          if (Math.abs(self.getVelocity()) > 300 && !(voo && voo.isActive())) {
            voo = bater(mini.asas, 1, 0.3, 0.12);
          }
        },
      });

      /* ---------- títulos aparecem linha a linha ---------- */
      qsa("[data-dividir]").forEach(t => {
        SplitText.create(t, {
          type: "lines", mask: "lines", autoSplit: true, linesClass: "linha",
          onSplit: self => gsap.from(self.lines, { yPercent: 115, duration: 1.4, stagger: 0.1, ease: "expo.out",
            scrollTrigger: { trigger: t, start: "top 85%", once: true } }),
        });
      });
      qsa(".rotulo .traco").forEach(t => gsap.from(t, { scaleX: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: t, start: "top 90%", once: true } }));

      // manifesto: as palavras acendem com a rolagem
      const man = qs("[data-rolar-palavras]");
      SplitText.create(man, {
        type: "words", autoSplit: true,
        onSplit: self => gsap.fromTo(self.words, { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: "none",
          scrollTrigger: { trigger: man, start: "top 80%", end: "bottom 45%", scrub: true } }),
      });
      gsap.from(".valores li", { y: 30, opacity: 0, scale: 0.8, duration: 0.9, stagger: 0.08, ease: "back.out(2)",
        scrollTrigger: { trigger: ".valores", start: "top 88%", once: true } });

      // fotos: a moldura abre e a imagem desliza por dentro
      qsa(".essencia-foto .moldura, .cores-foto .moldura").forEach(m => {
        gsap.fromTo(m, { clipPath: "inset(14% 10% round 28px)" }, { clipPath: "inset(0% 0% round 28px)", ease: "none",
          scrollTrigger: { trigger: m, start: "top 95%", end: "top 25%", scrub: true } });
        gsap.fromTo(m.querySelector("img"), { yPercent: -7, scale: 1.18 }, { yPercent: 7, scale: 1.05, ease: "none",
          scrollTrigger: { trigger: m, start: "top bottom", end: "bottom top", scrub: true } });
      });
      gsap.from(".cores-foto figcaption", { y: 40, opacity: 0, duration: 1.2, ease: "expo.out",
        scrollTrigger: { trigger: ".cores-foto", start: "top 55%", once: true } });

      /* ---------- 02 símbolo: anatomia em 5 passos, presa na tela ---------- */
      const passos = qsa(".passos li"), contador = qs(".simbolo-contador span");
      let passoAtual = 0;
      function mostraPasso(i) {
        if (i === passoAtual) return;
        const de = passos[passoAtual], para = passos[i];
        passoAtual = i;
        contador.textContent = String(i + 1).padStart(2, "0");
        gsap.to(de, { autoAlpha: 0, y: -24, duration: 0.4, ease: "power2.in", overwrite: true });
        gsap.fromTo(para, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.7, delay: 0.2, ease: "expo.out", overwrite: true });
      }
      passos.forEach((p, i) => p.classList.toggle("ativo", i === 0));
      gsap.set(ana.asaE, { fillOpacity: 0, stroke: COR.floresta, strokeWidth: 1.4, drawSVG: 0 });
      gsap.set(ana.asaD, { opacity: 0, scaleX: -1, svgOrigin: eixo });
      gsap.set([ana.corpo, ana.cabeca, ana.anteE, ana.anteD, ana.folhaE, ana.folhaD], { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" });
      gsap.set([...linhasGuia, ...bojos], { drawSVG: 0 });
      gsap.set(cotas, { opacity: 0 });
      gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: ".simbolo", pin: ".simbolo-fixo", start: "top top", end: "+=420%", scrub: 1,
          onUpdate: self => mostraPasso(Math.min(4, Math.floor(self.progress * 5 * 0.999))),
        },
      })
        .to(ana.asaE, { drawSVG: "100%", duration: 0.6 }, 0.05)
        .to(ana.asaE, { fillOpacity: 1, strokeOpacity: 0, duration: 0.3 }, 0.6)
        .to(ana.asaD, { opacity: 1, duration: 0.15 }, 1.05)
        .to(ana.asaD, { scaleX: 1, duration: 0.75, ease: "expo.inOut", svgOrigin: eixo }, 1.15)
        .to([ana.corpo, ana.cabeca], { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(2)" }, 2.1)
        .to([ana.anteE, ana.anteD], { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, 2.35)
        .to([ana.folhaE, ana.folhaD], { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.6)" }, 3.1)
        .to([...linhasGuia, ...bojos], { drawSVG: "100%", duration: 0.6, stagger: 0.04 }, 4.05)
        .to(cotas, { opacity: 1, duration: 0.3, stagger: 0.1 }, 4.4)
        .to({}, { duration: 0.3 });

      /* ---------- 03 assinaturas ---------- */
      gsap.from(".assinaturas-palco", { y: 60, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".assinaturas-palco", start: "top 85%", once: true } });
      gsap.from(".regras div", { y: 24, opacity: 0, duration: 0.9, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: ".regras", start: "top 92%", once: true } });

      /* ---------- 04 cores ---------- */
      qsa(".faixa").forEach(f => {
        gsap.from(f.querySelectorAll("h3, .faixa-uso, .faixa-codigos button"), { y: 40, opacity: 0, duration: 1, stagger: 0.06, ease: "expo.out",
          scrollTrigger: { trigger: f, start: "top 70%", once: true } });
      });

      /* ---------- 05 tipografia: o "B" se desenha ---------- */
      gsap.set(glifo, { fillOpacity: 0, stroke: COR.dourado, strokeWidth: 1.2, drawSVG: 0 });
      gsap.timeline({ scrollTrigger: { trigger: ".fonte-glifo", start: "top 75%", once: true } })
        .to(glifo, { drawSVG: "100%", duration: 2.2, ease: "power2.inOut" })
        .to(glifo, { fillOpacity: 1, duration: 1 }, "-=0.5")
        .to(glifo, { strokeOpacity: 0, duration: 0.6 }, "-=0.5");
      gsap.from(".alfabeto img", { clipPath: "inset(0 100% 0 0)", duration: 1.8, ease: "expo.inOut", scrollTrigger: { trigger: ".alfabeto", start: "top 85%", once: true } });

      /* ---------- 06 aplicações ---------- */
      const trilho = qs(".aplicacoes-trilho");
      if (larga) {
        const dist = () => trilho.scrollWidth - innerWidth;
        const corre = gsap.to(trilho, { x: () => -dist(), ease: "none",
          scrollTrigger: { trigger: ".aplicacoes", pin: true, scrub: 1, end: () => "+=" + dist(), invalidateOnRefresh: true } });
        qsa(".aplicacao").forEach(a => {
          gsap.fromTo(a.querySelector("img"), { xPercent: -6, scale: 1.16 }, { xPercent: 6, scale: 1.16, ease: "none",
            scrollTrigger: { trigger: a, containerAnimation: corre, start: "left right", end: "right left", scrub: true } });
        });
      } else {
        qsa(".aplicacao").forEach(a => {
          gsap.fromTo(a.querySelector("img"), { yPercent: -6, scale: 1.16 }, { yPercent: 6, ease: "none",
            scrollTrigger: { trigger: a, start: "top bottom", end: "bottom top", scrub: true } });
          gsap.from(a, { y: 50, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: a, start: "top 90%", once: true } });
        });
      }

      /* ---------- 07 usos incorretos ---------- */
      ScrollTrigger.batch(".usos-grade li", {
        start: "top 90%", once: true,
        onEnter: b => gsap.from(b, { y: 50, opacity: 0, rotate: 2, duration: 1, stagger: 0.08, ease: "expo.out" }),
      });

      /* ---------- 08 downloads ---------- */
      gsap.from(".pacote", { y: 60, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".pacote", start: "top 88%", once: true } });
      gsap.from(".baixar", { y: 50, opacity: 0, duration: 1, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: ".baixar-grade", start: "top 88%", once: true } });
      gsap.set(pacote.asas, { svgOrigin: eixo });
      const pacoteEl = qs(".pacote");
      pacoteEl.addEventListener("mouseenter", () => bater(pacote.asas, 2, 0.35, 0.14));

      /* ---------- rodapé: a borboleta pousa ---------- */
      gsap.set(rodape.asas, { svgOrigin: eixo, scaleX: 0.1 });
      gsap.set(rodape.ouro, { opacity: 0 });
      gsap.timeline({ scrollTrigger: { trigger: ".rodape", start: "top 70%", once: true } })
        .to(rodape.asas, { scaleX: 1, duration: 1.4, ease: "elastic.out(1, .5)", svgOrigin: eixo })
        .to(rodape.ouro, { opacity: 1, duration: 0.8, stagger: 0.06 }, "-=1")
        .add(bater(rodape.asas, 1, 0.5, 0.25));

      marcaMenu();
      return () => { ocioso.kill(); };
    });
  });

  // sem animação: tudo no estado final
  function estatico() {
    qs(".simbolo").classList.add("estatico");
    gsap.set([...linhasGuia, ...bojos, ...cotas], { clearProps: "all" });
  }

  // ao trocar de aba do índice, recalcula as medidas depois que imagens carregam
  addEventListener("load", () => ScrollTrigger.refresh());
})();
