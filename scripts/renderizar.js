// Gera os arquivos que precisam de um navegador para nascer:
//   downloads/logo/<versao>/*.png  (2400 px de largura, fundo transparente)
//   downloads/logo/<versao>/*.pdf  (vetorial)
//   downloads/paleta/bella-beauty-paleta.png
//   img/og.jpg (miniatura de compartilhamento) e img/favicon.svg
//
// Uso: npm i -D playwright && node scripts/renderizar.js
// (roda depois de scripts/gerar-marca.py)
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const RAIZ = path.resolve(__dirname, "..");
const LOGO = path.join(RAIZ, "downloads", "logo");
const url = p => "file://" + p;

(async () => {
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage();

  for (const versao of fs.readdirSync(LOGO)) {
    for (const arq of fs.readdirSync(path.join(LOGO, versao)).filter(f => f.endsWith(".svg"))) {
      const svg = path.join(LOGO, versao, arq);
      const [, w, h] = fs.readFileSync(svg, "utf8").match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number);
      const largura = 2400, altura = Math.round((largura * h) / w);
      await pagina.setViewportSize({ width: largura, height: altura });
      await pagina.setContent(`<style>html,body{margin:0;background:transparent}img{display:block;width:${largura}px;height:${altura}px}</style><img src="${url(svg)}">`);
      await pagina.waitForFunction(() => document.images[0].complete);
      await pagina.screenshot({ path: svg.replace(/\.svg$/, ".png"), omitBackground: true });
      // PDF vetorial: o SVG vai embutido na página, do tamanho exato do desenho
      const pw = 1000, ph = Math.round((pw * h) / w);
      await pagina.setContent(`<style>@page{size:${pw}px ${ph}px;margin:0}html,body{margin:0}svg{display:block;width:${pw}px;height:${ph}px}</style>${fs.readFileSync(svg, "utf8")}`);
      await pagina.pdf({ path: svg.replace(/\.svg$/, ".pdf"), width: pw + "px", height: ph + "px", printBackground: false });
    }
    console.log("logo", versao);
  }

  // Paleta em imagem
  const dados = JSON.parse(fs.readFileSync(path.join(RAIZ, "downloads", "paleta", "bella-beauty-paleta.json"), "utf8"));
  const claras = new Set(["#F2EBDC", "#D9B07E"]);
  await pagina.setViewportSize({ width: 2400, height: 1500 });
  await pagina.setContent(`
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;500&display=swap" rel="stylesheet">
    <style>
      body{margin:0;font-family:Montserrat,sans-serif;display:grid;grid-template-rows:repeat(5,1fr) 160px;height:1500px}
      .f{display:flex;align-items:center;justify-content:space-between;padding:0 120px}
      h2{font-weight:300;font-size:64px;margin:0}
      p{margin:0;font-size:30px;font-weight:300;text-align:right;line-height:1.5}
      b{font-weight:500}
      .g{background:linear-gradient(90deg,${dados.gradiente.join(",")});display:flex;align-items:center;padding:0 120px;font-size:30px;color:#18261C}
    </style>
    ${dados.cores.map(c => `<div class="f" style="background:${c.hex};color:${claras.has(c.hex) ? "#18261C" : "#F2EBDC"}">
      <h2>${c.nome}</h2><p><b>${c.hex}</b> · RGB ${c.rgb.join(", ")}<br>CMYK ${c.cmyk.join(", ")}</p></div>`).join("")}
    <div class="g"><b>Gradiente dourado</b>&nbsp;&nbsp;${dados.gradiente.join(" → ")}</div>`);
  await pagina.waitForLoadState("networkidle");
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.screenshot({ path: path.join(RAIZ, "downloads", "paleta", "bella-beauty-paleta.png") });
  console.log("paleta");

  // Miniatura para WhatsApp/Instagram (1200x630)
  const horizontal = fs.readFileSync(path.join(LOGO, "principal", "bella-beauty-horizontal.svg"), "utf8");
  await pagina.setViewportSize({ width: 1200, height: 630 });
  await pagina.setContent(`
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;500&display=swap" rel="stylesheet">
    <style>
      body{margin:0;width:1200px;height:630px;background:#18261C;color:#F2EBDC;font-family:Montserrat,sans-serif;
        display:grid;place-items:center;align-content:center;gap:56px;position:relative;overflow:hidden}
      body::before{content:"";position:absolute;inset:0;background:radial-gradient(45% 50% at 50% 45%,rgba(217,176,126,.18),transparent 70%)}
      svg{width:860px;height:auto;position:relative}
      p{margin:0;font-size:20px;letter-spacing:.3em;text-transform:uppercase;position:relative;display:flex;gap:18px;align-items:center}
      p span{color:#D9B07E}
      p i{width:80px;height:1px;background:#D9B07E}
    </style>
    ${horizontal}
    <p><i></i>Manual de marca <span>·</span> IsGo!<i></i></p>`);
  await pagina.waitForLoadState("networkidle");
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.screenshot({ path: path.join(RAIZ, "img", "og.jpg"), type: "jpeg", quality: 90 });
  console.log("og");

  // Favicon: símbolo principal sobre o verde floresta
  const simbolo = fs.readFileSync(path.join(LOGO, "principal", "bella-beauty-simbolo.svg"), "utf8")
    .replace(/ width="\d+" height="\d+"/, "")
    .replace("<svg ", '<svg x="8" y="20" width="84" height="60" ');
  fs.writeFileSync(path.join(RAIZ, "img", "favicon.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#18261C"/>${simbolo}</svg>`);
  console.log("favicon");

  await navegador.close();
})();
