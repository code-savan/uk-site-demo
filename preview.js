import {clean,demo} from './model.js';
let d=demo;
if(location.hash.startsWith('#p=')){try{d=clean(Object.fromEntries(new URLSearchParams(location.hash.slice(3))))}catch{document.body.textContent='This preview link is incomplete. Please request a fresh link.';throw Error('Invalid preview')}}
const original=location.href;
document.title=d.name+' · Boiler installation in '+d.area;
for(const key of ['name','area'])document.querySelectorAll('[data-'+key+']').forEach(el=>el.textContent=d[key]);
document.querySelector('#phone').textContent=d.phone;
if(d.offer)document.querySelector('#pitch').textContent=d.offer;
document.documentElement.style.setProperty('--accent',d.colour);
const rgb=d.colour.slice(1).match(/../g).map(c=>parseInt(c,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
document.documentElement.style.setProperty('--buttontext',rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722>.179?'#091810':'white');
if(d.logo){const logo=document.querySelector('#logo');logo.onload=()=>{logo.hidden=false;document.querySelector('#mark').hidden=true};logo.src=d.logo}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.onclick=e=>{e.preventDefault();document.querySelector(a.getAttribute('href'))?.scrollIntoView()});
document.querySelector('#copy').onclick=async e=>{const button=e.currentTarget;try{await navigator.clipboard.writeText(original);button.textContent='Link copied ✓'}catch{prompt('Copy preview link',original)}};
const dialog=document.querySelector('dialog'),form=document.querySelector('#quoteform'),success=document.querySelector('#success');
document.querySelectorAll('[data-quote]').forEach(b=>b.onclick=()=>{form.reset();form.hidden=false;success.hidden=true;form.elements.service.value=b.dataset.quote||'New installation';dialog.showModal()});
document.querySelectorAll('.close,.closeok').forEach(b=>b.onclick=()=>dialog.close());
form.onsubmit=e=>{e.preventDefault();form.reset();form.hidden=true;success.hidden=false;success.querySelector('button').focus()};
