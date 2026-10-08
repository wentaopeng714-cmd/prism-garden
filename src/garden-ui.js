import {gardenLesson,lightName} from './sim.js';
const COLORS={1:'#ef4d35',2:'#2479dd',4:'#d98800'};
export function mountGardenUI(mode){
 if(mode!==1)return;
 document.getElementById('tickets').insertAdjacentHTML('afterend','<div id="flower-goals" class="flower-goals" aria-label="Flowers to wake"></div>');
 document.getElementById('hint').insertAdjacentHTML('afterend','<span id="garden-lesson" class="garden-lesson"></span>');
 document.getElementById('controls').insertAdjacentHTML('beforeend','<button id="garden-undo" class="garden-undo" aria-label="Undo last move">↶<span>UNDO</span></button>');
 const reset=document.getElementById('retry');reset.textContent='↻ RESET';reset.setAttribute('aria-label','Reset garden');
 document.querySelector('.clock small').textContent='NO';
 document.getElementById('scene').setAttribute('aria-label','Garden puzzle board. Tap numbered mirrors to guide light to lettered flowers.');
}
export function updateGardenUI(game){
 const $=id=>document.getElementById(id),a=game.advice;
 $('timer').textContent='TIMER';$('timer').parentElement.classList.remove('urgent');
 $('hud-game').textContent='WAKE EVERY FLOWER';
 const chips=game.garden.goals.map(q=>{const lit=game.trace.lit.has(q.id),name=String.fromCharCode(65+q.id);return `<span class="flower-goal ${lit?'lit':''}" style="--flower:${COLORS[q.color]}" aria-label="Flower ${name}, needs ${lightName(q.color)}, ${lit?'blooming':'not lit'}"><b>${name}</b><i></i>${lightName(q.color)}<em>${lit?'✓':'○'}</em></span>`;}).join('');
 if($('flower-goals').innerHTML!==chips)$('flower-goals').innerHTML=chips;
 $('garden-lesson').textContent=gardenLesson(game.index);
 $('garden-undo').disabled=!game.history.length||game.paused;
 $('light').innerHTML='◉ LIGHT<small>'+lightName(game.light)+'</small>';
 $('light').setAttribute('aria-label','Change light color. Current: '+lightName(game.light));
 $('light').style.setProperty('--light',COLORS[game.light]);
 $('gate-switch').innerHTML='☀ SUN<small>'+(game.shutterOpen?'OPEN':'CLOSED')+'</small>';
 $('gate-switch').setAttribute('aria-label','Sun shutter: '+(game.shutterOpen?'open':'closed')+'. Tap to toggle');
 $('light').classList.toggle('hinted',a?.kind==='source');$('gate-switch').classList.toggle('hinted',a?.kind==='switch');
 $('action-name').textContent='HINT';$('action').setAttribute('aria-label','Show one next step');
}
