'use strict';
const KEY='opoplan-cabo-local-v1';let db,view='inicio',topicId=1,selectedDate=new Date().toLocaleDateString('sv-SE'),month=new Date().getMonth(),year=new Date().getFullYear(),cardIndex=0,showAnswer=false,deckTopic=null,deckMode='all';
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),dateLocal=s=>{if(!s)return '';let d=new Date(s);return isNaN(d)?String(s).slice(0,10):new Intl.DateTimeFormat('sv-SE',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Europe/Madrid'}).format(d)},today=()=>new Date().toLocaleDateString('sv-SE'),stamp=()=>new Date().toISOString(),minutes=arr=>arr.reduce((a,s)=>a+(+s.duracion||0),0),fmt=m=>`${Math.floor(m/60)} h ${m%60} min`,topic=n=>db.temas.find(t=>t.numero===+n),uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`,notify=m=>{let x=$('#toast');x.textContent=m;x.style.display='block';setTimeout(()=>x.style.display='none',2800)};

const COLORES_TEMAS=["#2563EB", "#F97316", "#16A34A", "#EC4899", "#EAB308", "#4F46E5", "#DC2626", "#06B6D4", "#92400E", "#A855F7", "#0F766E", "#BE123C", "#84CC16", "#0284C7", "#9333EA", "#475569", "#14B8A6"];
function colorTema(n){return COLORES_TEMAS[Number(n)-1]||'#64748B'}
function save(){localStorage.setItem(KEY,JSON.stringify(db));window.dispatchEvent(new Event('opoplan-local-change'))}function go(v){view=v;render()}function setTopic(n){topicId=+n;view='detalle';render()}
const pages=[['inicio','⌂ Inicio'],['calendario','▦ Calendario'],['temario','▤ Temario'],['tarjetas','▣ Tarjetas'],['estadisticas','◫ Estadísticas'],['ajustes','⚙ Ajustes']];
function render(){ montarNavegacionInferior(); $('#nav').innerHTML=pages.map(([id,t])=>`<button class="${view===id||(view==='detalle'&&id==='temario')?'active':''}" data-go="${id}">${t}</button>`).join('');$('#heading').textContent=view==='detalle'?`Tema ${topicId}`:pages.find(x=>x[0]===view)?.[1].replace(/^[^ ]+ /,'')||'Inicio';const cuenta=document.getElementById('opoplan-auth');const aparcamiento=document.getElementById('opoplan-auth-parking');if(cuenta&&aparcamiento)aparcamiento.appendChild(cuenta);$('#app').innerHTML=({inicio,calendario,temario,detalle,tarjetas,estadisticas,tests,ajustes}[view]||inicio)();if(view==='ajustes'&&cuenta){const lugar=document.getElementById('opoplan-account-slot');if(lugar)lugar.appendChild(cuenta);}}
window.opoplanOpenSettings=()=>go('ajustes');

function montarNavegacionInferior(){
 if(!document.getElementById('op-bottom-style')){
  const style=document.createElement('style');
  style.id='op-bottom-style';
  style.textContent=`
   /* OPOPLAN BARRA PERLA DEFINITIVA */
   .op-bottom-nav { display: none; }
   .op-home-header .op-galones { display: none !important; }

   @media (max-width: 800px) {
     aside { display: none !important; }
     #nav { display: none !important; }

     .op-bottom-nav {
       display: grid !important;
       grid-template-columns: repeat(6, minmax(0, 1fr));
       gap: 2px;

       position: fixed;
       left: 50%;
       right: auto;
       bottom: calc(12px + env(safe-area-inset-bottom, 0px));
       transform: translateX(-50%);

       width: calc(100% - 24px);
       max-width: 500px;
       z-index: 9999;

       padding: 7px;
       background: rgba(255,255,255,.97);
       border: 1px solid #E5E7EB;
       border-radius: 24px;

       box-shadow:
         0 8px 30px rgba(30,41,59,.10),
         0 2px 8px rgba(30,41,59,.04);

       -webkit-backdrop-filter: blur(16px);
       backdrop-filter: blur(16px);
     }

     .op-bottom-nav button {
       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;
       gap: 4px;

       min-width: 0;
       min-height: 58px;
       padding: 7px 1px !important;

       background: transparent !important;
       border: 0 !important;
       border-radius: 17px !important;
       box-shadow: none !important;

       color: #66717C !important;
       font-size: clamp(9px, 2.2vw, 11px) !important;
       font-weight: 600 !important;
       line-height: 1.15;
       cursor: pointer;
       -webkit-tap-highlight-color: transparent;
     }

     .op-bottom-nav button.active {
       background: #E4E7EB !important;
       color: #354351 !important;
       font-weight: 750 !important;
       box-shadow: inset 0 0 0 1px #DCE0E5 !important;
     }

     .op-bottom-nav button svg {
       width: 22px;
       height: 22px;
       flex-shrink: 0;
       stroke: currentColor;
       stroke-width: 1.7;
       fill: none;
       stroke-linecap: round;
       stroke-linejoin: round;
     }

     .op-bottom-nav button.active svg {
       stroke-width: 2;
     }

     .op-bottom-nav button span {
       display: block;
       max-width: 100%;
       overflow: hidden;
       text-overflow: clip;
       white-space: nowrap;
       letter-spacing: -.3px;
     }

     .op-bottom-nav button:focus-visible {
       outline: 2px solid #8A96A3;
       outline-offset: -2px;
     }

     body {
       padding-bottom:
         calc(110px + env(safe-area-inset-bottom, 0px)) !important;
     }

     main {
       padding-bottom:
         calc(110px + env(safe-area-inset-bottom, 0px)) !important;
     }

     #toast {
       bottom: calc(105px + env(safe-area-inset-bottom, 0px));
     }
   }
`;
  document.head.appendChild(style);
 }

 let nav=document.getElementById('op-bottom-nav');
 if(!nav){
  nav=document.createElement('nav');
  nav.id='op-bottom-nav';
  nav.className='op-bottom-nav';
  nav.setAttribute('aria-label','Navegación inferior');
  document.body.appendChild(nav);
 }

 const icons={
  inicio:'<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3z"/>',
  calendario:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
  temario:'<path d="M12 6c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1zM12 6v15"/>',
  tarjetas:'<rect x="5" y="4" width="16" height="16" rx="2"/><path d="M3 8v13h14"/>',
  estadisticas:'<path d="M4 21v-7M10 21V9M16 21V4M22 21v-12"/>',
  ajustes:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l-1.8 1.8a1.7 1.7 0 0 0-1.9-.3l-1.3.5-.5 2.1h-2.5l-.5-2.1-1.3-.5a1.7 1.7 0 0 0-1.9.3l-1.8-1.8a1.7 1.7 0 0 0 .3-1.9L6 13.7l-2.1-.5v-2.5l2.1-.5L6.5 9a1.7 1.7 0 0 0-.3-1.9l1.8-1.8a1.7 1.7 0 0 0 1.9.3l1.3-.5.5-2.1h2.5l.5 2.1 1.3.5a1.7 1.7 0 0 0 1.9-.3l1.8 1.8a1.7 1.7 0 0 0-.3 1.9l.5 1.3 2.1.5v2.5l-2.1.5z"/>'
 };

 const items=[
  ['inicio','Inicio'],
  ['calendario','Calendario'],
  ['temario','Temario'],
  ['tarjetas','Tarjetas'],
  ['estadisticas','Estadísticas'],
  ['ajustes','Ajustes']
 ];

 const actual=view==='detalle'?'temario':view;

 nav.innerHTML=items.map(([id,label])=>`
  <button type="button" data-go="${id}"
   class="${actual===id?'active':''}"
   aria-label="${label}"
   ${actual===id?'aria-current="page"':''}>
   <svg viewBox="0 0 24 24" aria-hidden="true">${icons[id]}</svg>
   <span>${label}</span>
  </button>
 `).join('');
}

function countCards(){return db.temas.reduce((a,t)=>a+t.fichas.length,0)}function metric(name,value){return `<div class="card"><div class="muted">${name}</div><div class="metric">${value}</div></div>`}


function inicio(){
 const proximos=db.eventos.filter(e=>dateLocal(e.fecha)>=today())
  .sort((a,b)=>dateLocal(a.fecha).localeCompare(dateLocal(b.fecha)))
  .slice(0,3);

 return `
 <header class="op-home-header">
   <div class="op-hero-inner">
     <div class="op-insignia">
       <div>
         <div class="op-name">OpoPlan</div>
         <span class="op-cabo">CABO</span>
       </div>
     </div>
     <p>Tu preparación, a tu ritmo.</p>
   </div>
 </header>
 <section class="op-hero" aria-label="Fotografía de cabecera"></section>

 <section class="op-home-panel">
   <div class="op-upcoming">
     <div class="row">
       <h3>Próximos eventos</h3>
       <button class="secondary" data-go="calendario">Calendario</button>
     </div>
     ${proximos.map(e=>`
       <div class="op-event">
         <strong>${esc(e.titulo)}</strong>
         <small>${esc(dateLocal(e.fecha))}</small>
       </div>
     `).join('') || '<p class="muted">No hay próximos eventos.</p>'}
   </div>
 </section>`;
}

function temario(){
 const labels={
   dominado:'Dominado',
   enProgreso:'En estudio',
   sinEmpezar:'Pendiente'
 };
 return `
 <section class="op-syllabus">
   <div class="op-syllabus-title">
     <div><h2>Temario</h2><p>17 temas de Cabo</p></div>
     <span class="op-book">▤</span>
   </div>
   <div class="op-topic-list">
     ${db.temas.map(t=>{
       const estado=t.estado||'sinEmpezar';
       const clase=estado==='dominado'?'done':
         estado==='enProgreso'?'working':'pending';
       return `
       <button class="op-topic-item" data-topic="${t.numero}" style="border-left:5px solid ${colorTema(t.numero)}">
         <span class="op-topic-icon" style="color:${colorTema(t.numero)}">▤</span>
         <span class="op-topic-content">
           <strong>Tema ${t.numero}</strong>
           <small>${esc(t.titulo)}</small>
         </span>
         <span class="op-topic-state ${clase}">
           ${labels[estado]||esc(estado)}
         </span>
         <span class="op-chevron">›</span>
       </button>
       <div class="op-review-controls" style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px 12px;border-left:5px solid ${colorTema(t.numero)};margin-top:-3px;margin-bottom:10px;background:#fff;border-radius:0 0 12px 12px">
         <span style="font-size:13px;font-weight:600">↻ Repasos: ${Math.max(0,Math.floor(Number(t.repasos)||0))}</span>
         <span style="display:flex;gap:8px">
           <button type="button" data-repaso="${t.numero}" data-cambio="-1" aria-label="Restar repaso al tema ${t.numero}" style="width:36px;height:36px;padding:0;border:1px solid #cbd5e1;background:#fff;color:#243041;border-radius:9px;font-size:21px">−</button>
           <button type="button" data-repaso="${t.numero}" data-cambio="1" aria-label="Sumar repaso al tema ${t.numero}" style="width:36px;height:36px;padding:0;border:1px solid ${colorTema(t.numero)};background:${colorTema(t.numero)};color:#fff;border-radius:9px;font-size:21px">+</button>
         </span>
       </div>`;
     }).join('')}
   </div>
 </section>`;
}
function detalle(){let t=topic(topicId),sessions=db.sesiones.filter(s=>s.temaNumero===topicId).sort((a,b)=>b.fecha.localeCompare(a.fecha));return `<div class="card"><h2>${esc(t.titulo)}</h2><label>Estado</label><select id="estado"><option value="sinEmpezar" ${t.estado==='sinEmpezar'?'selected':''}>Sin empezar</option><option value="enProgreso" ${t.estado==='enProgreso'?'selected':''}>En progreso</option><option value="dominado" ${t.estado==='dominado'?'selected':''}>Dominado</option></select><label>Notas del tema</label><textarea id="notas">${esc(t.notas)}</textarea><div class="actions"><button class="primary" id="saveTopic">Guardar tema</button><button class="secondary" data-go="temario">Volver</button></div></div><div class="card"><h2>Pomodoro 50 / 10</h2><p class="muted">El tiempo de descanso no se contabiliza. Mantén esta pestaña abierta durante la sesión.</p><div class="center"><span id="phase" class="pill">Estudio</span><div id="clock" class="timer">50:00</div><div class="actions" style="justify-content:center"><button class="primary" id="startTimer">Iniciar / reanudar</button><button class="secondary" id="pauseTimer">Pausar</button><button class="secondary" id="finishTimer">Guardar tiempo y terminar</button><button class="secondary" id="resetTimer">Reiniciar</button></div></div></div><div class="card"><h2>Añadir sesión manual</h2><div class="fields"><div><label>Fecha</label><input id="studyDate" type="date" value="${today()}"></div><div><label>Minutos de estudio</label><input id="studyMins" type="number" min="0" value="50"></div></div><label>Notas de la sesión</label><textarea id="studyNotes" placeholder="Qué has estudiado"></textarea><button class="primary" id="addSession">Guardar sesión</button></div><div class="card"><h2>Historial de estudio</h2>${sessions.map(s=>`<div class="listline row"><div>${esc(dateLocal(s.fecha))} · ${fmt(+s.duracion||0)}<div class="muted">${esc(s.notas)}</div></div><button class="danger" data-del-session="${esc(s.id)}">Eliminar</button></div>`).join('')||'<p class="muted">Sin sesiones</p>'}</div><div class="card"><h2>Tarjetas (${t.fichas.length})</h2>${t.fichas.map((f,i)=>`<div class="listline"><b>${esc(f.pregunta)}</b><p>${esc(f.respuesta)}</p><button class="danger" data-del-card="${i}">Eliminar</button></div>`).join('')}<label>Pregunta</label><textarea id="question"></textarea><label>Respuesta</label><textarea id="answer"></textarea><button class="primary" id="addCard">Añadir tarjeta</button></div>`}
let timer={topic:null,phase:'study',left:3000,running:false,last:0,elapsed:0};function tick(){if(!timer.running)return;let now=Date.now(),delta=Math.floor((now-timer.last)/1000);if(delta<1)return;timer.last+=delta*1000;while(delta>0){let n=Math.min(delta,timer.left);timer.left-=n;if(timer.phase==='study')timer.elapsed+=n;delta-=n;if(timer.left<=0){timer.phase=timer.phase==='study'?'break':'study';timer.left=timer.phase==='study'?3000:600;notify(timer.phase==='break'?'Estudio terminado. Descanso de 10 minutos':'Descanso terminado. Vuelve a estudiar')}}updateClock()}function updateClock(){let c=$('#clock');if(c)c.textContent=`${String(Math.floor(timer.left/60)).padStart(2,'0')}:${String(timer.left%60).padStart(2,'0')}`;let p=$('#phase');if(p)p.textContent=timer.phase==='study'?'Estudio':'Descanso'}setInterval(tick,500);
function upcoming(){
 return db.temas.flatMap(t=>t.fichas
  .filter(f=>!f.proximoRepaso||f.proximoRepaso<=today())
  .map(f=>({t,f})));
}

function deckCards(t,mode=deckMode){
 return t.fichas.filter(f=>{
  if(mode==='failed')return f.ultimoResultado==='fallada';
  if(mode==='due')return !f.proximoRepaso||f.proximoRepaso<=today();
  return true;
 });
}

function tarjetas(){
 const selected=deckTopic===null?null:topic(deckTopic);
 if(!selected)return `
  <div class="card">
   <h2>Elige un tema para estudiar</h2>
   <p class="muted">Puedes estudiar todas las tarjetas, las pendientes o las falladas de cada tema.</p>
   <div class="deck-grid">
    ${db.temas.map(t=>`
     <button class="deck-tile" data-deck="${t.numero}">
      <span class="deck-num" style="background:${colorTema(t.numero)}!important;border-color:${colorTema(t.numero)}">${String(t.numero).padStart(2,'0')}</span>
      <strong>${esc(t.titulo)}</strong>
      <span class="muted">${t.fichas.length} tarjetas · ${deckCards(t,'due').length} pendientes · ${deckCards(t,'failed').length} falladas</span>
      <span class="deck-arrow">Abrir tema →</span>
     </button>
    `).join('')}
   </div>
  </div>`;

 const all=selected.fichas;
 const list=deckCards(selected);
 cardIndex=Math.max(0,Math.min(cardIndex,list.length-1));
 const current=list[cardIndex];

 return `
  <div class="card">
   <div class="row">
    <button class="secondary" id="backDecks">← Todos los temas</button>
    <span class="pill" style="border-color:${colorTema(selected.numero)};border-left:5px solid ${colorTema(selected.numero)}">Tema ${selected.numero}</span>
   </div>
   <h2>${esc(selected.titulo)}</h2>
   <div class="actions">
    <button class="${deckMode==='all'?'primary':'secondary'}" data-deck-mode="all">Todas (${all.length})</button>
    <button class="${deckMode==='due'?'primary':'secondary'}" data-deck-mode="due">Pendientes (${deckCards(selected,'due').length})</button>
    <button class="${deckMode==='failed'?'primary':'secondary'}" data-deck-mode="failed">Falladas (${deckCards(selected,'failed').length})</button>
    <button class="secondary" data-topic="${selected.numero}">Crear / editar tarjetas</button>
   </div>
   ${current?`
    <p class="muted">Tarjeta ${cardIndex+1} de ${list.length}</p>
    <button type="button" id="flipCard" class="op-flip-card ${showAnswer?'op-flip-answer':'op-flip-question'}" style="--deck-color:${colorTema(selected.numero)}" aria-label="${showAnswer?'Volver a la pregunta':'Mostrar respuesta'}">
     <span class="op-flip-label">${showAnswer?'RESPUESTA':'PREGUNTA'}</span>
     <span class="op-flip-content">${showAnswer?esc(current.respuesta):esc(current.pregunta)}</span>
     <span class="op-flip-hint">↻ Toca para girar</span>
    </button>
    ${showAnswer?`
     <div class="actions">
      <button class="secondary" data-rate="1">Fallé · mañana</button>
      <button class="secondary" data-rate="3">Regular · 3 días</button>
      <button class="primary" data-rate="7">Fácil · 7 días</button>
     </div>`:
     '<button class="primary" id="reveal">Mostrar respuesta</button>'}
    <div class="actions">
     <button class="secondary" id="prevCard">← Anterior</button>
     <button class="secondary" id="nextCard">Siguiente →</button>
    </div>`:`
    <p class="notice">${!all.length?
     'Este tema todavía no tiene tarjetas. Puedes crearlas desde el detalle del tema.':
     deckMode==='failed'?
     'No hay tarjetas marcadas como falladas en este tema.':
     'No hay tarjetas pendientes en este tema. Puedes elegir «Todas» para seguir practicando.'}</p>`}
  </div>`;
}
function calendarTopics(date){return [...new Set(db.sesiones.filter(s=>dateLocal(s.fecha)===date).map(s=>s.temaNumero))].sort((a,b)=>a-b)}function categoryColor(name){let c=db.categorias.find(c=>c.nombre===name);return /^([0-9a-f]{6})$/i.test(c?.colorHex||'')?'#'+c.colorHex:'#81978a'}
function calendario(){let first=new Date(year,month,1),offset=(first.getDay()+6)%7,days=new Date(year,month+1,0).getDate(),cells=[];for(let i=0;i<offset;i++)cells.push('<div class="day-spacer"></div>');for(let d=1;d<=days;d++){let day=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`,ev=db.eventos.filter(e=>dateLocal(e.fecha)===day),ts=calendarTopics(day);cells.push(`<button class="day ${day===today()?'today':''} ${day===selectedDate?'selected':''}" data-date="${day}"><b>${d}</b>${ts.map(n=>`<small class="calendar-chip study-chip" style="--chip:${colorTema(n)};background:${colorTema(n)}22;color:${colorTema(n)};border:1px solid ${colorTema(n)}55">Tema ${n}</small>`).join('')}${ev.slice(0,3).map(e=>`<small class="calendar-chip" style="--chip:${categoryColor(e.categoriaNombre)};background:${categoryColor(e.categoriaNombre)}22;color:#243041;border:1px solid ${categoryColor(e.categoriaNombre)}55">${esc(e.titulo)}</small>`).join('')}${ev.length>3?`<small class="more-events">+${ev.length-3} más</small>`:''}</button>`)}let ev=db.eventos.filter(e=>dateLocal(e.fecha)===selectedDate),ts=calendarTopics(selectedDate);return `<div class="card op-calendar-main"><div class="row op-calendar-month"><button class="secondary" id="prevMonth">‹</button><h2>${new Intl.DateTimeFormat('es-ES',{month:'long',year:'numeric'}).format(first)}</h2><button class="secondary" id="nextMonth">›</button></div><div class="category-legend">${db.categorias.map(c=>`<span class="legend-item"><i style="background:${categoryColor(c.nombre)}"></i>${esc(c.nombre)}</span>`).join('')}</div><div class="calendar">${['L','M','X','J','V','S','D'].map(x=>`<div class="weekday">${x}</div>`).join('')}${cells.join('')}</div></div><div class="card op-calendar-detail"><h2 class="op-calendar-date">${new Intl.DateTimeFormat('es-ES',{weekday:'long',day:'numeric',month:'long'}).format(new Date(`${selectedDate}T12:00:00`))}</h2>${ts.map(n=>`<div class="event-entry study-entry" style="--chip:${colorTema(n)};border-left:5px solid ${colorTema(n)};background:${colorTema(n)}1C"><b>Tema ${n}${topic(n)?.titulo?' · '+esc(topic(n).titulo):''}</b><span class="muted">Registro automático de estudio</span></div>`).join('')}${ev.map(e=>`<div class="event-entry" style="--chip:${categoryColor(e.categoriaNombre)};border-left:5px solid ${categoryColor(e.categoriaNombre)};background:${categoryColor(e.categoriaNombre)}1C"><div><b>${esc(e.titulo)}</b><div class="muted">${esc(e.categoriaNombre)} ${e.notas?'· '+esc(e.notas):''}</div></div><div class="actions"><button class="secondary" data-edit-event="${esc(e.id)}">Editar</button><button class="danger" data-del-event="${esc(e.id)}">Eliminar</button></div></div>`).join('')||(!ts.length?'<p class="muted">Sin registros para este día</p>':'')}<h3 id="eventFormHeading">Nuevo evento manual</h3><input id="eventEditId" type="hidden"><label>Título</label><input id="eventTitle" placeholder="Ej. Test de inglés"><div class="fields"><div><label>Categoría</label><select id="eventCat">${db.categorias.map(c=>`<option>${esc(c.nombre)}</option>`).join('')}</select></div><div><label>Fecha</label><input id="eventDate" type="date" value="${selectedDate}"></div></div><label>Notas</label><textarea id="eventNotes"></textarea><button class="primary" id="addEvent">Guardar evento</button></div><div class="card"><h2>Categorías personalizadas</h2><p class="muted">Cada categoría tiene su propio color. Puedes modificarlo cuando quieras.</p>${db.categorias.map(c=>`<div class="category-editor"><input aria-label="Color de ${esc(c.nombre)}" type="color" value="${categoryColor(c.nombre)}" data-cat-color="${esc(c.nombre)}"><span>${esc(c.nombre)}</span><button class="danger" data-del-cat="${esc(c.nombre)}">Eliminar</button></div>`).join('')}<div class="fields"><div><label>Nueva categoría</label><input id="catName" placeholder="Nombre"></div><div><label>Color</label><input id="catColor" type="color" value="#34835b"></div></div><button class="primary" id="addCat">Crear categoría</button></div>`}

/* OPOPLAN: PREGUNTAS TIPO TEST */
let opExam = null;
let opEdit = null;

function opQuestions(){
  if(!Array.isArray(db.preguntasTest)) db.preguntasTest=[];
  return db.preguntasTest;
}

function opTestsUI(){
  const qs=opQuestions();
  const temas=db.temas.map(t=>
    `<option value="${t.numero}">Tema ${t.numero} · ${esc(t.titulo)}</option>`
  ).join('');

  if(opExam){
    const e=opExam,q=e.questions[e.pos];
    const respuesta=e.answers[e.pos];
    const corregida=respuesta!==undefined;

    return `<div class="card">
      <h2>${esc(e.name)}</h2>
      <p class="muted">Pregunta ${e.pos+1} de ${e.questions.length} · Tema ${q.tema}</p>
      <h3>${esc(q.texto)}</h3>
      <div class="op-options">
        ${q.opciones.map((a,i)=>`
          <button class="op-option ${
            corregida?(i===q.correcta?'op-right':
            i===respuesta?'op-wrong':''):''
          }" data-op-answer="${i}" ${corregida?'disabled':''}>
            <b>${'ABCD'[i]}.</b> ${esc(a)}
          </button>`).join('')}
      </div>
      ${corregida?`
        <div class="notice">
          <b>${respuesta===q.correcta?'✓ Correcto':'✗ Incorrecto'}</b>
          <p>Respuesta correcta: ${'ABCD'[q.correcta]}. ${esc(q.opciones[q.correcta])}</p>
          ${q.explicacion?`<p>${esc(q.explicacion)}</p>`:''}
        </div>
        <button class="primary" id="opNextQuestion">
          ${e.pos+1===e.questions.length?'Finalizar y guardar':'Siguiente pregunta'}
        </button>`:
        '<p class="muted">Elige una respuesta para ver la corrección.</p>'}
      <p><button id="opAbortExam">Salir sin guardar</button></p>
    </div>`;
  }

  return `<div class="card">
    <h2>Tests y simulacros</h2>
    <p class="muted">Corrección inmediata después de cada pregunta.</p>
    <div class="fields">
      <div><label>Modalidad</label>
        <select id="opMode">
          <option value="topic">Test por tema</option>
          <option value="mixed">Test mixto</option>
          <option value="sim">Simulacro</option>
        </select></div>
      <div><label>Tema</label><select id="opTestTopic">${temas}</select></div>
      <div><label>Número de preguntas</label>
        <input id="opTestCount" type="number" min="1" max="200" value="10"></div>
    </div>
    <button class="primary" id="opStartExam">Comenzar test</button>
    <p class="muted">Preguntas disponibles: ${qs.length}. Se usarán sin repetir.</p>
  </div>

  <div class="card">
    <h2 id="opFormTitle">Crear pregunta tipo test</h2>
    <label>Tema</label><select id="opTopic">${temas}</select>
    <label>Enunciado</label>
    <textarea id="opQuestion" placeholder="Escribe la pregunta"></textarea>
    ${['A','B','C','D'].map((x,i)=>`
      <label>Respuesta ${x}</label>
      <input id="opAnswer${i}" placeholder="Opción ${x}">`).join('')}
    <label>Respuesta correcta</label>
    <select id="opCorrect">
      <option value="0">A</option><option value="1">B</option>
      <option value="2">C</option><option value="3">D</option>
    </select>
    <label>Explicación (opcional)</label>
    <textarea id="opExplain" placeholder="Norma, artículo o aclaración"></textarea>
    <div class="actions">
      <button class="primary" id="opSaveQuestion">Guardar pregunta</button>
      <button id="opCancelEdit" style="display:none">Cancelar edición</button>
    </div>
  </div>

  <div class="card">
    <h2>Mis preguntas (${qs.length})</h2>
    ${qs.map(q=>`<div class="listline row">
      <div><b>Tema ${q.tema}</b><p>${esc(q.texto)}</p></div>
      <div class="actions">
        <button data-op-edit="${esc(q.id)}">Editar</button>
        <button class="danger" data-op-delete="${esc(q.id)}">Eliminar</button>
      </div>
    </div>`).join('')||'<p class="muted">Todavía no has creado preguntas.</p>'}
  </div>

  <details class="card">
    <summary>Registro manual e historial anterior</summary>
    ${testsLegacy()}
  </details>`;
}

function tests(){return opTestsUI()}

function opTestClick(ev){
  const b=ev.target.closest('button');
  if(!b)return;
  const id=b.id||'',d=b.dataset;
  if(!id.startsWith('op') &&
     !Object.keys(d).some(k=>k.startsWith('op')))return;

  ev.stopImmediatePropagation();
  ev.preventDefault();

  const qs=opQuestions();

  if(id==='opSaveQuestion'){
    const tema=Number($('#opTopic').value);
    const texto=$('#opQuestion').value.trim();
    const opciones=[0,1,2,3].map(i=>$('#opAnswer'+i).value.trim());
    const correcta=Number($('#opCorrect').value);
    const explicacion=$('#opExplain').value.trim();

    if(!texto||opciones.some(x=>!x))
      return notify('Completa la pregunta y las cuatro respuestas');

    const q={id:opEdit||uid(),tema,texto,opciones,correcta,explicacion};
    const i=qs.findIndex(x=>x.id===opEdit);
    if(i>=0)qs[i]=q;
    else qs.push(q);
    opEdit=null;
    save();render();notify('Pregunta guardada');
    return;
  }

  if(id==='opCancelEdit'){
    opEdit=null;render();return;
  }

  if(d.opEdit){
    const q=qs.find(x=>x.id===d.opEdit);
    if(!q)return;
    opEdit=q.id;
    render();
    $('#opTopic').value=q.tema;
    $('#opQuestion').value=q.texto;
    q.opciones.forEach((x,i)=>$('#opAnswer'+i).value=x);
    $('#opCorrect').value=q.correcta;
    $('#opExplain').value=q.explicacion||'';
    $('#opFormTitle').textContent='Editar pregunta';
    $('#opCancelEdit').style.display='inline-block';
    $('#opQuestion').focus();
    return;
  }

  if(d.opDelete){
    if(confirm('¿Eliminar esta pregunta?')){
      db.preguntasTest=qs.filter(q=>q.id!==d.opDelete);
      if(opEdit===d.opDelete)opEdit=null;
      save();render();
    }
    return;
  }

  if(id==='opStartExam'){
    const mode=$('#opMode').value;
    const tema=Number($('#opTestTopic').value);
    const n=Number($('#opTestCount').value);
    const pool=qs.filter(q=>mode!=='topic'||q.tema===tema);

    if(!pool.length)return notify('No hay preguntas para esta modalidad');
    if(!Number.isInteger(n)||n<1||n>200)
      return notify('Indica entre 1 y 200 preguntas');

    const mezcladas=[...pool];
    for(let i=mezcladas.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [mezcladas[i],mezcladas[j]]=[mezcladas[j],mezcladas[i]];
    }

    opExam={
      name:mode==='sim'?'Simulacro':
           mode==='mixed'?'Test mixto':`Test tema ${tema}`,
      questions:mezcladas.slice(0,n),
      pos:0,answers:[]
    };
    render();return;
  }

  if(d.opAnswer!==undefined){
    if(!opExam||opExam.answers[opExam.pos]!==undefined)return;
    opExam.answers[opExam.pos]=Number(d.opAnswer);
    render();return;
  }

  if(id==='opNextQuestion'){
    if(!opExam||opExam.answers[opExam.pos]===undefined)return;

    if(opExam.pos<opExam.questions.length-1){
      opExam.pos++;render();return;
    }

    const e=opExam,total=e.questions.length;
    const aciertos=e.questions.filter(
      (q,i)=>q.correcta===e.answers[i]
    ).length;

    db.simulacros.unshift({
      id:uid(),nombre:e.name,fecha:today(),
      total,aciertos,errores:total-aciertos,blanco:0,
      notas:'Corrección inmediata · '+Math.round(aciertos/total*100)+'%'
    });
    save();
    opExam=null;
    render();
    notify(`Resultado guardado: ${aciertos}/${total} aciertos`);
    return;
  }

  if(id==='opAbortExam'){
    if(confirm('¿Salir sin guardar este test?')){
      opExam=null;render();
    }
  }
}

document.addEventListener('click',opTestClick,true);

function testsLegacy(){return `<div class="card"><h2>Tests y simulacros</h2><p class="muted">Registra los resultados de tus pruebas. Las preguntas en blanco no se cuentan como fallos.</p><div class="fields"><div><label>Nombre</label><input id="testName" placeholder="Test tema 1"></div><div><label>Fecha</label><input id="testDate" type="date" value="${today()}"></div><div><label>Preguntas</label><input id="testTotal" type="number" min="0" value="100"></div><div><label>Aciertos</label><input id="testOk" type="number" min="0" value="0"></div><div><label>Errores</label><input id="testBad" type="number" min="0" value="0"></div><div><label>En blanco</label><input id="testBlank" type="number" min="0" value="0"></div></div><label>Temas a reforzar / notas</label><textarea id="testNotes"></textarea><button class="primary" id="addTest">Guardar resultado</button></div><div class="card"><h2>Historial</h2>${db.simulacros.map(s=>`<div class="listline row"><div><b>${esc(s.nombre)}</b><div class="muted">${esc(s.fecha)} · ${s.aciertos}/${s.total} aciertos · ${s.errores} errores · ${s.blanco} en blanco</div><p>${esc(s.notas)}</p></div><button class="danger" data-del-test="${esc(s.id)}">Eliminar</button></div>`).join('')||'<p class="muted">No hay pruebas registradas</p>'}</div>`}

function estadisticas(){
 const sesiones=Array.isArray(db.sesiones)?db.sesiones:[];
 const pruebas=Array.isArray(db.simulacros)?db.simulacros:[];
 const mins=minutes(sesiones);
 const total=pruebas.reduce((n,p)=>n+(Number(p.total)||0),0);
 const ok=pruebas.reduce((n,p)=>n+(Number(p.aciertos)||0),0);
 const bad=pruebas.reduce((n,p)=>n+(Number(p.errores)||0),0);
 const blank=pruebas.reduce((n,p)=>n+(Number(p.blanco)||0),0);
 const pct=total?Math.round(ok/total*100):0;
 const cards=db.temas.reduce((n,t)=>n+(t.fichas||[]).length,0);
 const due=db.temas.reduce((n,t)=>n+(t.fichas||[]).filter(f=>!f.proximoRepaso||f.proximoRepaso<=today()).length,0);
 const repasos=db.temas.reduce((n,t)=>n+Math.max(0,Number(t.repasos)||0),0);
 const metric2=(label,value,detail)=>`<div class="card" style="margin:0"><div class="muted">${label}</div><div style="font-size:27px;font-weight:750;margin:6px 0">${value}</div><small class="muted">${detail}</small></div>`;
 const pOk=total?ok/total*100:0;
 const pBad=total?bad/total*100:0;
 const pBlank=total?blank/total*100:0;
 const donut=total?`<div role="img" aria-label="${pct}% aciertos, ${bad} errores, ${blank} en blanco" style="width:190px;height:190px;border-radius:50%;background:conic-gradient(#164a37 0% ${pOk}%,#c94c4c ${pOk}% ${pOk+pBad}%,#e4b13e ${pOk+pBad}% ${pOk+pBad+pBlank}%,#e7ebef ${pOk+pBad+pBlank}% 100%);display:grid;place-items:center;margin:auto"><div style="width:137px;height:137px;border-radius:50%;background:white;display:flex;flex-direction:column;align-items:center;justify-content:center"><strong style="font-size:31px">${pct}%</strong><span class="muted">Aciertos</span></div></div>`:'<p class="muted">Todavía no hay preguntas registradas.</p>';
 return `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:12px;margin-bottom:16px">
 ${metric2('Tiempo estudiado',fmt(mins),sesiones.length+' sesiones')}
 ${metric2('Tests realizados',pruebas.length,total+' preguntas registradas')}
 ${metric2('Aciertos globales',total?pct+' %':'—',ok+' aciertos')}
 ${metric2('Tarjetas creadas',cards,due+' pendientes de repaso')}
 </div>
 <div class="card"><h2>Resultados de tests y simulacros</h2>
 <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:25px;padding:14px 0">
 ${donut}
 <div style="min-width:150px;line-height:2.2">
 <div><span style="color:#164a37">●</span> Aciertos: <b>${ok}</b></div>
 <div><span style="color:#c94c4c">●</span> Errores: <b>${bad}</b></div>
 <div><span style="color:#e4b13e">●</span> En blanco: <b>${blank}</b></div>
 </div></div>
 <p class="muted">Resultados acumulados, incluidos los introducidos manualmente.</p></div>
 <div class="card"><h2>Progreso por temas</h2>
 <p class="muted">Tiempo estudiado, estado, tarjetas y repasos manuales.</p>
 ${db.temas.map(t=>{
 const m=minutes(sesiones.filter(x=>Number(x.temaNumero)===Number(t.numero)));
 const estado=t.estado==='dominado'?'Dominado':t.estado==='enProgreso'?'En estudio':'Pendiente';
 return `<div class="listline" style="border-left:4px solid ${colorTema(t.numero)};padding-left:12px">
 <b>Tema ${t.numero} · ${esc(t.titulo)}</b>
 <div class="muted">${estado} · ${fmt(m)} · ${(t.fichas||[]).length} tarjetas · ${Math.max(0,Number(t.repasos)||0)} repasos</div>
 ${mins?`<div class="bar"><span style="width:${Math.round(m/mins*100)}%;background:${colorTema(t.numero)}"></span></div>`:''}
 </div>`}).join('')}</div>
 <div class="card"><h2>Historial de tests y simulacros</h2>
 ${[...pruebas].sort((a,b)=>String(b.fecha||'').localeCompare(String(a.fecha||''))).map(p=>{
 const n=Number(p.total)||0;
 return `<div class="listline"><b>${esc(p.nombre||'Test')}</b>
 <div class="muted">${esc(p.fecha||'Sin fecha')} · ${p.aciertos||0}/${n} aciertos · ${p.errores||0} errores · ${p.blanco||0} en blanco · ${n?Math.round((Number(p.aciertos)||0)/n*100)+' %':'Sin porcentaje'}</div>
 ${p.notas?`<p>${esc(p.notas)}</p>`:''}</div>`}).join('')||'<p class="muted">Aún no hay pruebas registradas.</p>'}</div>
 <div class="card"><h2>Repasos y tarjetas</h2>
 <p><b>${repasos}</b> repasos manuales anotados en Temario.</p>
 <p><b>${due}</b> tarjetas pendientes de repaso, de <b>${cards}</b> creadas.</p>
 <p class="muted">No se muestra un total de tarjetas repasadas porque aún no existe un historial completo de cada respuesta.</p></div>`;
}


function ajustes(){
 const temas=Array.isArray(db.temas)?db.temas:[];
 const sesiones=Array.isArray(db.sesiones)?db.sesiones:[];
 const pruebas=Array.isArray(db.simulacros)?db.simulacros:[];
 const eventos=Array.isArray(db.eventos)?db.eventos:[];
 const tarjetas=temas.reduce((n,t)=>n+(Array.isArray(t.fichas)?t.fichas.length:0),0);
 const preguntas=Array.isArray(db.preguntasTest)?db.preguntasTest.length:0;
 const totalMin=minutes(sesiones);

 const dato=(nombre,valor)=>`
   <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid #e9edf0">
     <span>${nombre}</span>
     <strong>${valor}</strong>
   </div>`;

 return `<div class="card"><h2>Cuenta y sincronización</h2><div id="opoplan-account-slot"></div></div>
 <div class="card">
   <h2>Copias de seguridad</h2>
   <p class="muted">Protege tus datos de estudio guardando una copia periódicamente.</p>

   <div class="notice">
     OpoPlan guarda tus datos en este navegador.
     La sincronización entre dispositivos está disponible al iniciar sesión. Los conflictos requieren confirmación.
   </div>

   <div class="actions" style="margin-top:16px">
     <button class="primary" id="export">Exportar datos</button>

     <label class="btn" style="margin:0;cursor:pointer">
       Importar copia
       <input id="import" type="file"
              accept="application/json,.json" hidden>
     </label>
   </div>

   <p class="muted" style="font-size:13px;margin-top:12px">
     Exportar crea un archivo JSON con tus datos.
     Importar sustituye los datos actuales después de pedirte confirmación.
     Exporta una copia antes de importar.
   </p>
 </div>

 <div class="card">
   <h2>Temporizador de estudio</h2>
   <p class="muted">Configuración fija de tu método de estudio.</p>

   <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px">
     <div style="background:#edf5ef;border-radius:14px;padding:17px;text-align:center">
       <div style="font-size:29px;font-weight:750;color:#164a37">50</div>
       <strong>minutos</strong>
       <div class="muted" style="font-size:13px;margin-top:5px">Concentración</div>
     </div>
     <div style="background:#fff6df;border-radius:14px;padding:17px;text-align:center">
       <div style="font-size:29px;font-weight:750;color:#8b640d">10</div>
       <strong>minutos</strong>
       <div class="muted" style="font-size:13px;margin-top:5px">Descanso</div>
     </div>
   </div>

   <p class="muted" style="font-size:13px;margin-top:12px">
     Los tiempos se mantienen fijos y no se modifican desde Ajustes.
   </p>
 </div>

 <div class="card">
   <h2>Mis datos</h2>
   <p class="muted">Resumen de la información guardada en OpoPlan.</p>

   ${dato('Temas',temas.length)}
   ${dato('Tiempo estudiado',fmt(totalMin))}
   ${dato('Sesiones de estudio',sesiones.length)}
   ${dato('Tarjetas creadas',tarjetas)}
   ${dato('Preguntas tipo test',preguntas)}
   ${dato('Tests y simulacros registrados',pruebas.length)}
   ${dato('Eventos del calendario',eventos.length)}
 </div>

 <div class="card">
   <h2>Acerca de OpoPlan</h2>
   <div style="font-size:21px;font-weight:750;color:#164a37;margin-bottom:5px">
     OpoPlan Cabo
   </div>
   <p><em>Tu preparación, a tu ritmo.</em></p>
   <p class="muted">
     Aplicación personal de preparación para la promoción a Cabo
     de la Guardia Civil.
   </p>
   <p class="muted" style="font-size:13px">
     Versión local · Datos guardados en tu navegador.
   </p>
 </div>`;
}

function addSession(n,date,notes){if(!Number.isFinite(n)||n<0)return notify('Minutos no válidos');db.sesiones.push({id:uid(),duracion:Math.round(n),fecha:new Date(`${date}T12:00:00`).toISOString(),notas,temaNumero:topicId,temaOposicion:'cabo',tipo:'estudio'});save();render();notify('Sesión guardada')}
function download(){let a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)],{type:'application/json'}));a.href=url;a.download=`OpoPlan_Cabo_${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),500)}
function ensureIds(){
 for(let k of ['sesiones','eventos','simulacros']){
  (db[k] ||= []).forEach(x=>x.id ||=uid());
 }
 db.revisiones ||= [];
 db.temas.forEach(t=>{
  t.fichas ||= [];
  t.notas ||= '';
  t.estado ||= 'sinEmpezar';
 });
}function delegate(e){let b=e.target.closest('button');if(b?.dataset.repaso){let t=topic(b.dataset.repaso);if(!t)return;let n=Math.max(0,Math.floor(Number(t.repasos)||0));t.repasos=Math.max(0,n+Number(b.dataset.cambio));save();render();return;}if(b?.dataset.go){go(b.dataset.go);return}if(b?.dataset.topic){setTopic(b.dataset.topic);return}if(b?.dataset.deck){deckTopic=+b.dataset.deck;cardIndex=0;showAnswer=false;render();return}if(b?.dataset.deckMode){deckMode=b.dataset.deckMode;cardIndex=0;showAnswer=false;render();return}if(b?.dataset.editEvent){let e=db.eventos.find(x=>x.id===b.dataset.editEvent);if(e){$('#eventEditId').value=e.id;$('#eventTitle').value=e.titulo;$('#eventDate').value=dateLocal(e.fecha);$('#eventCat').value=e.categoriaNombre;$('#eventNotes').value=e.notas||'';$('#eventFormHeading').textContent='Editar evento';$('#eventTitle').focus()}return}if(b?.dataset.date){selectedDate=b.dataset.date;render();return}if(b?.dataset.delSession){if(confirm('¿Eliminar esta sesión?')){db.sesiones=db.sesiones.filter(s=>s.id!==b.dataset.delSession);save();render()}return}if(b?.dataset.delEvent){if(confirm('¿Eliminar este evento?')){db.eventos=db.eventos.filter(s=>s.id!==b.dataset.delEvent);save();render()}return}if(b?.dataset.delCat){let name=b.dataset.delCat;if(db.eventos.some(x=>x.categoriaNombre===name))return notify('La categoría tiene eventos; no se puede eliminar');db.categorias=db.categorias.filter(x=>x.nombre!==name);save();render();return}if(b?.dataset.delTest){db.simulacros=db.simulacros.filter(s=>s.id!==b.dataset.delTest);save();render();return}if(b?.dataset.delCard!==undefined){topic(topicId).fichas.splice(+b.dataset.delCard,1);save();render();return}if(b?.dataset.rate){let t=topic(deckTopic),arr=deckCards(t),f=arr[cardIndex];if(!f)return;let d=new Date();d.setDate(d.getDate()+Number(b.dataset.rate));f.proximoRepaso=d.toLocaleDateString('sv-SE');f.ultimoRepaso=today();f.ultimoResultado=b.dataset.rate==='1'?'fallada':b.dataset.rate==='3'?'regular':'facil';save();showAnswer=false;cardIndex=0;render();return}switch(b?.id){case 'saveTopic':{let t=topic(topicId);t.estado=$('#estado').value;t.notas=$('#notas').value;save();notify('Tema guardado');break}case 'addSession':addSession(+$(' #studyMins'.trim()).value,$('#studyDate').value,$('#studyNotes').value);break;case 'addCard':{let q=$('#question').value.trim(),a=$('#answer').value.trim();if(!q||!a)return notify('Escribe pregunta y respuesta');topic(topicId).fichas.push({pregunta:q,respuesta:a});save();render();notify('Tarjeta añadida');break}case 'startTimer':if(timer.topic!==topicId){timer={topic:topicId,phase:'study',left:3000,running:false,last:0,elapsed:0}}timer.running=true;timer.last=Date.now();updateClock();break;case 'pauseTimer':tick();timer.running=false;break;case 'resetTimer':if(timer.elapsed&&!confirm('¿Descartar tiempo no guardado?'))return;timer={topic:topicId,phase:'study',left:3000,running:false,last:0,elapsed:0};updateClock();break;case 'finishTimer':tick();timer.running=false;if(timer.elapsed>0){let n=Math.max(1,Math.round(timer.elapsed/60));let t=timer.topic||topicId;topicId=t;addSession(n,today(),'Pomodoro');}timer={topic:topicId,phase:'study',left:3000,running:false,last:0,elapsed:0};updateClock();break;case 'flipCard':showAnswer=!showAnswer;render();break;case 'reveal':showAnswer=true;render();break;case 'nextCard':cardIndex=(cardIndex+1)%Math.max(1,topic(deckTopic).fichas.filter(f=>deckMode==='all'||!f.proximoRepaso||f.proximoRepaso<=today()).length);showAnswer=false;render();break;case 'prevCard':cardIndex=Math.max(0,cardIndex-1);showAnswer=false;render();break;case 'backDecks':deckTopic=null;cardIndex=0;showAnswer=false;render();break;case 'prevMonth':month--;if(month<0){month=11;year--}render();break;case 'nextMonth':month++;if(month>11){month=0;year++}render();break;case 'addEvent':{let title=$('#eventTitle').value.trim();if(!title)return notify('Escribe un título');let dt=$('#eventDate').value;let existing=db.eventos.find(e=>e.id===$('#eventEditId').value);let data={titulo:title,fecha:new Date(`${dt}T12:00:00`).toISOString(),categoriaNombre:$('#eventCat').value,notas:$('#eventNotes').value,diaCompleto:true};if(existing)Object.assign(existing,data);else db.eventos.push({id:uid(),...data});selectedDate=dt;save();render();break}case 'addCat':{let n=$('#catName').value.trim();if(!n||db.categorias.some(c=>c.nombre===n))return notify('Nombre vacío o repetido');db.categorias.push({nombre:n,colorHex:$('#catColor').value.slice(1).toUpperCase(),icono:'calendar',orden:db.categorias.length});save();render();break}case 'addTest':{let total=+$(' #testTotal'.trim()).value,aciertos=+$(' #testOk'.trim()).value,errores=+$(' #testBad'.trim()).value,blanco=+$(' #testBlank'.trim()).value;if([total,aciertos,errores,blanco].some(n=>n<0)||total!==aciertos+errores+blanco)return notify('Las respuestas deben sumar el total');db.simulacros.unshift({id:uid(),nombre:$('#testName').value.trim()||'Test',fecha:$('#testDate').value,total,aciertos,errores,blanco,notas:$('#testNotes').value});save();render();break}case 'export':download();break}}
document.addEventListener('click',delegate);
document.addEventListener('change',async e=>{
 if(e.target.dataset.catColor){
  let c=db.categorias.find(c=>c.nombre===e.target.dataset.catColor);
  if(c){
   c.colorHex=e.target.value.slice(1).toUpperCase();
   save();
   render();
  }
  return;
 }
 if(e.target.id!=='import')return;
 try{
  let d=JSON.parse(await e.target.files[0].text());
  if(!Array.isArray(d.temas)||
     !Array.isArray(d.sesiones)||
     !Array.isArray(d.eventos)||
     !Array.isArray(d.categorias)){
   throw Error('Formato incompatible');
  }
  if(!confirm('¿Sustituir los datos locales por los del archivo? Exporta antes una copia.'))return;
  const next={
   ...d,
   temas:d.temas
    .filter(t=>t.oposicion==='cabo'||!t.oposicion)
    .sort((a,b)=>a.numero-b.numero),
   sesiones:d.sesiones.filter(s=>s.temaOposicion==='cabo'||!s.temaOposicion),
   simulacros:d.simulacros||[]
  };
  if(next.temas.length!==17){
   throw Error('La importación debe contener 17 temas de Cabo');
  }
  window.opoplanApplyCloudData(next);
  go('inicio');
  notify('Importación completada');
 }catch(err){
  notify(`No se importó: ${err.message}`);
 }
});window.opoplanApplyCloudData=function(data){
 if(!data||
    !Array.isArray(data.temas)||
    data.temas.length!==17||
    !Array.isArray(data.sesiones)||
    !Array.isArray(data.eventos)||
    !Array.isArray(data.categorias)){
  throw Error('Copia de nube incompatible');
 }
 const previous=db;
 try{
  db=structuredClone(data);
  ensureIds();
  save();
 }catch(err){
  db=previous;
  throw err;
 }
 render();
};(async()=>{try{db=JSON.parse(localStorage.getItem(KEY)||'null');if(!db){db=await(await fetch('datos_iniciales.json')).json();ensureIds();save()}else {const before=JSON.stringify(db);ensureIds();if(JSON.stringify(db)!==before)localStorage.setItem(KEY,JSON.stringify(db));}render();window.opoplanReady=true;window.dispatchEvent(new Event('opoplan-ready'));if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{})}catch(err){$('#app').innerHTML=`<div class="card"><h2>No se pudieron cargar los datos</h2><p>${esc(err.message)}</p><p>Abre la aplicación mediante el servidor local indicado en README.txt.</p></div>`}})();
