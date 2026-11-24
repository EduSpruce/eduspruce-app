/* 1.169 — Leitor de PDF da ajuda: os manuais abrem numa janela por cima do site (sem sair dele), com os controlos
   habituais (páginas, zoom, ajustar à largura, ecrã inteiro) e um botão para descarregar. O mesmo código serve a
   eduspruce.pt (usa o pdf.js já incluído na app) e a eduspruce.app (carrega o pdf.js quando é preciso). */
(function(){
  if(window.esVisorPdf)return;
  /* pdf.js 4.10.38 (compilação legacy) alojado no próprio site: sem CDN externo e sem a falha CVE-2024-4367 da 3.11 */
  const PDFJS_DIR=new URL('/vendor/pdfjs/',location.href).href;
  let libP=null;
  const carregaScript=src=>new Promise((ok,ko)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=ko;document.head.appendChild(s)});
  function lib(){
    if(libP)return libP;
    libP=(async()=>{
      if(typeof getPdfLib==='function'){try{return await getPdfLib()}catch(_){}}
      const L=window.pdfjsLib||(window.pdfjsLib=await import(PDFJS_DIR+'pdf.min.mjs'));
      if(!L.GlobalWorkerOptions.workerSrc)L.GlobalWorkerOptions.workerSrc=PDFJS_DIR+'pdf.worker.min.mjs';
      return L})();
    libP.catch(()=>{libP=null});return libP}
  const SVG={
    ant:'<path d="M15 18l-6-6 6-6"/>',seg:'<path d="M9 18l6-6-6-6"/>',menos:'<path d="M5 12h14"/>',mais:'<path d="M12 5v14M5 12h14"/>',
    larg:'<path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/>',ecra:'<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
    desc:'<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',fecha:'<path d="M6 6l12 12M18 6L6 18"/>'};
  const ico=n=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SVG[n]}</svg>`;
  function estilos(){
    if(document.getElementById('esvp-css'))return;const st=document.createElement('style');st.id='esvp-css';st.textContent=`
.esvp{position:fixed;inset:0;z-index:2147483000;background:rgba(10,18,28,.72);display:flex;align-items:center;justify-content:center;padding:max(12px,2vh) max(12px,2vw);box-sizing:border-box;font-family:inherit;animation:esvpIn .18s ease}
@keyframes esvpIn{from{opacity:0}to{opacity:1}}
.esvp *{box-sizing:border-box}
.esvp-j{width:min(1200px,100%);height:100%;display:flex;flex-direction:column;background:var(--panel,#fff);color:var(--ink,#1f2937);border-radius:14px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.45)}
.esvp-b{display:flex;align-items:center;gap:6px;padding:8px 10px;border-bottom:1px solid var(--line,#e5e7eb);flex-wrap:wrap;background:var(--panel,#fff)}
.esvp-t{font-weight:700;font-size:15px;margin-right:auto;min-width:0;max-width:40%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-left:4px}
.esvp-g{display:inline-flex;align-items:center;gap:2px;padding:2px;border:1px solid var(--line,#e5e7eb);border-radius:10px}
.esvp button,.esvp a.esvp-d{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:36px;height:36px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:inherit;font:inherit;font-size:14px;cursor:pointer;text-decoration:none}
.esvp button:hover{background:color-mix(in srgb,var(--acc,#1b93c6) 12%,transparent)}
.esvp button:focus-visible,.esvp a:focus-visible,.esvp input:focus-visible{outline:2px solid var(--acc,#1b93c6);outline-offset:1px}
.esvp button:disabled{opacity:.35;cursor:default;background:transparent}
.esvp-p{display:inline-flex;align-items:center;gap:6px;font-size:14px;padding:0 4px;white-space:nowrap}
.esvp-p input{width:52px;height:30px;text-align:center;border:1px solid var(--line,#d1d5db);border-radius:6px;font:inherit;font-size:14px;background:var(--bg,#fff);color:inherit}
.esvp-z{min-width:52px;text-align:center;font-size:13px;font-variant-numeric:tabular-nums}
.esvp a.esvp-d{background:var(--acc,#1b93c6);color:#fff;font-weight:600;padding:0 14px}
.esvp a.esvp-d:hover{filter:brightness(1.08)}
.esvp-c{flex:1;overflow:auto;background:color-mix(in srgb,var(--ink,#1f2937) 9%,var(--bg,#eef2f6));padding:16px;outline:0;-webkit-overflow-scrolling:touch}
.esvp-pg{position:relative;margin:0 auto 16px;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.18)}
.esvp-pg canvas{display:block;width:100%;height:100%}
.esvp-pg .esvp-n{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:13px}
.esvp-m{margin:auto;padding:40px 20px;text-align:center;color:var(--mut,#6b7280);font-size:15px}
.esvp-m a{color:var(--acc,#1b93c6);font-weight:600}
.esvp:fullscreen{padding:0}.esvp:fullscreen .esvp-j{width:100%;border-radius:0}
@media (max-width:700px){.esvp{padding:0}.esvp-j{border-radius:0}.esvp-t{max-width:none;flex:1 1 calc(100% - 52px);margin:0;order:0}.esvp-b>[data-a="fecha"]{order:1}.esvp-b>.esvp-g,.esvp-b>a.esvp-d{order:2}.esvp-oc{display:none!important}.esvp-c{padding:8px}.esvp a.esvp-d span{display:none}.esvp a.esvp-d{padding:0 10px}}
html body.est-sge .esvp :is(.esvp-j,.esvp-g,button,a,input,.esvp-pg){border-radius:0!important}`;document.head.appendChild(st)}
  function nomeFicheiro(url){try{return decodeURIComponent(new URL(url,location.href).pathname.split('/').pop())||'documento.pdf'}catch(_){return 'documento.pdf'}}
  window.esVisorPdf=function(url,titulo){
    estilos();const abs=new URL(url,location.href).href;const nome=nomeFicheiro(abs);titulo=titulo||nome.replace(/\.pdf$/i,'').replace(/[-_]+/g,' ');
    const antes=document.activeElement;const ov=document.createElement('div');ov.className='esvp';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label',titulo);
    ov.innerHTML=`<div class="esvp-j"><div class="esvp-b"><span class="esvp-t" title="${titulo.replace(/"/g,'&quot;')}"></span>
      <span class="esvp-g"><button type="button" data-a="ant" title="Página anterior" aria-label="Página anterior">${ico('ant')}</button><span class="esvp-p"><input type="text" inputmode="numeric" value="1" aria-label="Página"> <span>de <b data-tot>…</b></span></span><button type="button" data-a="seg" title="Página seguinte" aria-label="Página seguinte">${ico('seg')}</button></span>
      <span class="esvp-g"><button type="button" data-a="menos" title="Reduzir (−)" aria-label="Reduzir">${ico('menos')}</button><span class="esvp-z" data-z>100%</span><button type="button" data-a="mais" title="Ampliar (+)" aria-label="Ampliar">${ico('mais')}</button><button type="button" class="esvp-oc" data-a="larg" title="Ajustar à largura" aria-label="Ajustar à largura">${ico('larg')}</button></span>
      <button type="button" class="esvp-oc" data-a="ecra" title="Ecrã inteiro" aria-label="Ecrã inteiro">${ico('ecra')}</button>
      <a class="esvp-d" href="${abs}" download="${nome}" title="Descarregar o PDF">${ico('desc')}<span>Descarregar</span></a>
      <button type="button" data-a="fecha" title="Fechar (Esc)" aria-label="Fechar">${ico('fecha')}</button></div>
      <div class="esvp-c" tabindex="0"><div class="esvp-m">A abrir o documento…</div></div></div>`;
    ov.querySelector('.esvp-t').textContent=titulo;
    document.body.appendChild(ov);const ovAnt=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';
    const C=ov.querySelector('.esvp-c'),inp=ov.querySelector('.esvp-p input'),tot=ov.querySelector('[data-tot]'),zl=ov.querySelector('[data-z]');
    let pdf=null,P=[],escala=1,modo='larg',atual=1,io=null,vivo=true,tarefa=null;
    const fechar=()=>{if(!vivo)return;vivo=false;try{io&&io.disconnect()}catch(_){}try{pdf&&pdf.destroy()}catch(_){}if(document.fullscreenElement===ov)document.exitFullscreen().catch(()=>{});document.removeEventListener('keydown',tecla,true);ov.remove();document.documentElement.style.overflow=ovAnt;try{antes&&antes.focus&&antes.focus()}catch(_){}};
    const larg=()=>Math.max(200,C.clientWidth-(innerWidth<=700?16:32));
    function medidas(){if(modo==='larg')escala=larg()/P[0].w;escala=Math.min(4,Math.max(.25,escala));zl.textContent=Math.round(escala*100)+'%';
      P.forEach(p=>{p.el.style.width=Math.round(p.w*escala)+'px';p.el.style.height=Math.round(p.h*escala)+'px'})}
    async function desenha(p){if(!vivo||p.feito===escala||p.aDesenhar)return;p.aDesenhar=true;const e=escala;
      try{const pg=await pdf.getPage(p.n);const dpr=Math.min(2,window.devicePixelRatio||1);const vp=pg.getViewport({scale:e*dpr});
        const cv=document.createElement('canvas');cv.width=Math.floor(vp.width);cv.height=Math.floor(vp.height);
        await pg.render({canvasContext:cv.getContext('2d',{alpha:false}),viewport:vp}).promise;if(!vivo)return;
        p.el.innerHTML='';p.el.appendChild(cv);p.feito=e}catch(_){}finally{p.aDesenhar=false;if(vivo&&p.feito!==escala&&p.visivel)desenha(p)}}
    function vigia(){try{io&&io.disconnect()}catch(_){}io=new IntersectionObserver(es=>es.forEach(x=>{const p=P[+x.target.dataset.i];p.visivel=x.isIntersecting;if(x.isIntersecting)desenha(p)}),{root:C,rootMargin:'800px 0px'});P.forEach(p=>io.observe(p.el))}
    function vaiPara(n,suave){n=Math.min(P.length,Math.max(1,n|0));const p=P[n-1];if(!p)return;atual=n;C.scrollTop=p.el.offsetTop-(innerWidth<=700?8:16);botoes()}
    function botoes(){inp.value=atual;ov.querySelector('[data-a="ant"]').disabled=atual<=1;ov.querySelector('[data-a="seg"]').disabled=atual>=P.length}
    function aoRolar(){const y=C.scrollTop+C.clientHeight*.35;let n=1;for(const p of P){if(p.el.offsetTop<=y)n=p.n;else break}if(n!==atual){atual=n;if(document.activeElement!==inp)botoes()}}
    function zoom(nova,nm){const n=atual;modo=nm||'livre';if(nova)escala=nova;medidas();P.forEach(p=>{p.feito=p.feito===escala?p.feito:null});vigia();vaiPara(n)}
    const passos=[.5,.67,.75,.9,1,1.1,1.25,1.5,1.75,2,2.5,3,4];
    const mais=d=>{const s=escala;const L=d>0?passos.filter(x=>x>s+.01):passos.filter(x=>x<s-.01).reverse();zoom(L[0]||s)};
    function tecla(e){if(!vivo)return;if(e.key==='Escape'){if(document.fullscreenElement)return;e.preventDefault();e.stopPropagation();fechar();return}
      if(e.target===inp)return;if(e.key==='ArrowRight'||e.key==='PageDown'&&e.altKey){e.preventDefault();vaiPara(atual+1,true)}else if(e.key==='ArrowLeft'){e.preventDefault();vaiPara(atual-1,true)}
      else if(e.key==='Home'&&!e.target.closest('input')){e.preventDefault();vaiPara(1)}else if(e.key==='End'&&!e.target.closest('input')){e.preventDefault();vaiPara(P.length)}
      else if((e.key==='+'||e.key==='=')&&!e.metaKey){e.preventDefault();mais(1)}else if(e.key==='-'&&!e.metaKey){e.preventDefault();mais(-1)}
      else if(e.key==='Tab'){const f=[...ov.querySelectorAll('button:not(:disabled),a,input,.esvp-c')];const i=f.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}}}
    document.addEventListener('keydown',tecla,true);
    ov.addEventListener('click',e=>{if(e.target===ov){fechar();return}const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
      if(a==='fecha')fechar();else if(!P.length)return;else if(a==='ant')vaiPara(atual-1,true);else if(a==='seg')vaiPara(atual+1,true);else if(a==='mais')mais(1);else if(a==='menos')mais(-1);else if(a==='larg')zoom(0,'larg');
      else if(a==='ecra'){if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else if(ov.requestFullscreen)ov.requestFullscreen().catch(()=>{})}});
    inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();vaiPara(parseInt(inp.value,10)||1);C.focus()}});inp.addEventListener('blur',botoes);inp.addEventListener('focus',()=>inp.select());
    C.addEventListener('scroll',()=>{cancelAnimationFrame(tarefa);tarefa=requestAnimationFrame(aoRolar)},{passive:true});
    C.addEventListener('wheel',e=>{if(!(e.ctrlKey||e.metaKey)||!P.length)return;e.preventDefault();mais(e.deltaY<0?1:-1)},{passive:false});
    let rz=0;const aoRedim=()=>{if(!vivo){removeEventListener('resize',aoRedim);return}clearTimeout(rz);rz=setTimeout(()=>{if(modo==='larg'&&P.length)zoom(0,'larg')},150)};addEventListener('resize',aoRedim);
    ov.querySelector('[data-a="fecha"]').focus();
    (async()=>{try{const L=await lib();if(!vivo)return;
        pdf=await L.getDocument({url:abs,isEvalSupported:false}).promise;if(!vivo){pdf.destroy();return}
        const p1=(await pdf.getPage(1)).getViewport({scale:1});tot.textContent=pdf.numPages;C.innerHTML='';
        for(let n=1;n<=pdf.numPages;n++){const el=document.createElement('div');el.className='esvp-pg';el.dataset.i=n-1;el.setAttribute('aria-label','Página '+n);el.innerHTML=`<span class="esvp-n">Página ${n}</span>`;C.appendChild(el);P.push({n,el,w:p1.width,h:p1.height,feito:null})}
        medidas();vigia();botoes();C.focus({preventScroll:true});
        /* páginas com tamanhos diferentes da primeira: acerta as medidas em segundo plano */
        for(let n=2;n<=pdf.numPages&&vivo;n++){const v=(await pdf.getPage(n)).getViewport({scale:1});const p=P[n-1];if(Math.abs(v.width-p.w)>1||Math.abs(v.height-p.h)>1){p.w=v.width;p.h=v.height;p.el.style.width=Math.round(p.w*escala)+'px';p.el.style.height=Math.round(p.h*escala)+'px'}}
      }catch(e){if(!vivo)return;C.innerHTML=`<div class="esvp-m">Não foi possível mostrar o documento aqui.<br><br><a href="${abs}" target="_blank" rel="noopener">Abrir o PDF</a> · <a href="${abs}" download="${nome}">Descarregar</a></div>`}})();
    return fechar};
  /* liga todas as ligações para PDF da ajuda/manual (no mesmo site) ao leitor */
  document.addEventListener('click',e=>{
    if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    const a=e.target.closest&&e.target.closest('a[href]');if(!a||a.hasAttribute('data-sem-visor')||a.closest('.esvp'))return;
    const h=a.getAttribute('href')||'';if(!/\.pdf(?:[?#].*)?$/i.test(h)||/^(blob|data):/i.test(h))return;
    let u;try{u=new URL(h,location.href)}catch(_){return}
    if(u.origin!==location.origin&&!/(^|\.)eduspruce\.(pt|app)$|^eduspruce\.github\.io$/i.test(u.hostname))return;
    e.preventDefault();e.stopPropagation();
    const t=a.getAttribute('data-pdf-titulo')||(/EduSpruce-Manual/i.test(u.pathname)?'Manual de Instruções da EduSpruce':'');
    window.esVisorPdf(u.href,t)},true);
})();
