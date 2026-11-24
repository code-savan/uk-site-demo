import {clean,demo} from './model.js';

let business=demo;
if(location.hash.startsWith('#p=')){
  try {
    business=clean(Object.fromEntries(new URLSearchParams(location.hash.slice(3))));
  } catch {
    document.body.textContent='This preview link is incomplete. Please request a fresh link.';
    throw Error('Invalid preview');
  }
}
const previewLink=location.href;
document.title=business.name+' · Heating in '+business.area;
for(const key of ['name','area','phone']){
  document.querySelectorAll('[data-'+key+']').forEach(element=>element.textContent=business[key]);
}
document.querySelectorAll('[data-call]').forEach(link=>{
  link.href='tel:'+business.phone.replace(/[^+0-9]/g,'');
});
if(business.offer)document.querySelector('#pitch').textContent=business.offer;
document.documentElement.style.setProperty('--accent',business.colour);
const channels=business.colour.slice(1).match(/../g).map(channel=>parseInt(channel,16)/255);
const linear=channels.map(channel=>channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4);
const luminance=linear[0]*.2126+linear[1]*.7152+linear[2]*.0722;
document.documentElement.style.setProperty('--buttontext',luminance>.179?'#091810':'white');
if(business.logo){
  const logo=document.querySelector('#logo');
  logo.onload=()=>{logo.hidden=false;document.querySelector('#mark').hidden=true};
  logo.src=business.logo;
}
if(business.address){
  const address=document.querySelector('#address-line');
  address.textContent=business.address;
  address.hidden=false;
}
document.querySelector('#map-link').href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(business.address||business.area);
document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.onclick=event=>{
    event.preventDefault();
    document.querySelector(link.getAttribute('href'))?.scrollIntoView();
  };
});
document.querySelector('#copy').onclick=async event=>{
  const button=event.currentTarget;
  try {
    await navigator.clipboard.writeText(previewLink);
    button.textContent='Link copied ✓';
  } catch {
    prompt('Copy preview link',previewLink);
  }
};

const services={
  'New installation':{
    title:'The right boiler. For your kind of home.',
    kicker:'FOR NEW SPACES & CHANGING NEEDS',
    description:'Bedrooms, bathrooms, water use and available space all shape the right setup. Start with your home and build the plan around it.',
    points:['Discuss combi, system and regular boiler options','Review the installation position and pipework','Agree the specification before booking'],
    image:'boiler-premium.jpg',alt:'White boiler with neat copper pipework',tag:'A NEW START',cta:'Plan my installation ↗'
  },
  'Boiler replacement':{
    title:'Time for a fresh start?',
    kicker:'FOR AN AGEING OR UNRELIABLE BOILER',
    description:'Repeated faults, uneven heating or changing hot water needs? Discuss a replacement that suits your existing system and your plans for the home.',
    points:['Review the current boiler and heating system','Discuss the replacement and any pipework changes','Agree removal, installation and handover details'],
    image:'team-premium.jpg',alt:'Engineer discussing a heating project with a homeowner',tag:'RETHINK YOUR HEATING',cta:'Discuss my replacement ↗'
  },
  'Heating controls':{
    title:'Comfort, on your schedule.',
    kicker:'FOR MORE CONTROL AT HOME',
    description:'Explore heating schedules and thermostat options that suit your routine. The installer will check compatibility with your existing setup.',
    points:['Review your current thermostat and controls','Discuss scheduling and room temperature needs','Check compatibility before choosing equipment'],
    image:'controls-premium.jpg',alt:'Round thermostat on a sage green wall',tag:'EVERYDAY COMFORT',cta:'Explore heating controls ↗'
  }
};
let selectedService='New installation';
const tabs=[...document.querySelectorAll('[data-service]')];
function selectService(button){
  selectedService=button.dataset.service;
  const service=services[selectedService];
  tabs.forEach(tab=>{
    tab.setAttribute('aria-selected',String(tab===button));
    tab.tabIndex=tab===button?0:-1;
  });
  document.querySelector('#service-panel').setAttribute('aria-labelledby',button.id);
  for(const key of ['title','kicker','description','tag','cta']){
    document.querySelector('#service-'+key).textContent=service[key];
  }
  const image=document.querySelector('#service-image');
  image.src='/assets/'+service.image;
  image.alt=service.alt;
  document.querySelector('#service-points').replaceChildren(...service.points.map(text=>{
    const item=document.createElement('li');item.textContent=text;return item;
  }));
}
tabs.forEach((button,index)=>{
  button.tabIndex=index===0?0:-1;
  button.onclick=()=>selectService(button);
  button.onkeydown=event=>{
    const directions={ArrowRight:1,ArrowLeft:-1};
    if(!(event.key in directions))return;
    event.preventDefault();
    const target=tabs[(index+directions[event.key]+tabs.length)%tabs.length];
    selectService(target);target.focus();
  };
});

const panel=document.querySelector('#chat-panel');
const body=document.querySelector('#chat-body');
const controls=document.querySelector('#chat-controls');
const launcher=document.querySelector('#chat-launch');
let enquiry={};
let returnFocus;
function say(text,answer=false){
  const message=document.createElement('p');
  message.className=answer?'bubble answer':'bubble';
  message.textContent=text;
  body.append(message);
  body.scrollTop=body.scrollHeight;
}
function choices(options,callback){
  controls.replaceChildren(...options.map(text=>{
    const button=document.createElement('button');
    button.textContent=text;
    button.onclick=()=>{say(text,true);callback(text)};
    return button;
  }));
}
function start(){
  enquiry={};body.replaceChildren();
  say('Hello! What would you like help with at your home in '+business.area+'?');
  choices(['New installation','Boiler replacement','Heating controls','Check my area'],chooseService);
}
function chooseService(service){
  enquiry.service=service;
  say('What is the postcode for the property? The team will confirm coverage.');
  const form=document.createElement('form');
  const input=document.createElement('input');
  input.placeholder='e.g. M1 1AA';
  input.setAttribute('aria-label','Property postcode');
  input.autocomplete='postal-code';
  input.required=true;input.maxLength=10;
  input.pattern='[A-Za-z]{1,2}[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2}|GIR ?0AA';
  input.title='Enter a full UK postcode, for example M1 1AA';
  const button=document.createElement('button');button.textContent='Next →';
  form.append(input,button);controls.replaceChildren(form);
  input.focus();
  form.onsubmit=event=>{
    event.preventDefault();
    enquiry.postcode=input.value.trim().toUpperCase();
    say(enquiry.postcode,true);
    say('When are you looking to get started?');
    choices(['As soon as possible','Within a month','Planning ahead'],timing=>{
      enquiry.timing=timing;showHandoff();
    });
  };
}
function showHandoff(){
  const message='Hi '+business.name+', I am interested in '+enquiry.service.toLowerCase()+'. My postcode is '+enquiry.postcode+'. Preferred timing: '+enquiry.timing+'. Please confirm coverage and the next steps.';
  say('Your enquiry is ready. Review it below and choose how to continue.');
  say(message);
  controls.replaceChildren();
  if(business.whatsapp){
    let number=business.whatsapp.replace(/\D/g,'');
    if(number.startsWith('00'))number=number.slice(2);
    if(number.startsWith('0'))number='44'+number.slice(1);
    const link=document.createElement('a');
    link.className='btn';link.textContent='Continue in WhatsApp ↗';
    link.href='https://wa.me/'+number+'?text='+encodeURIComponent(message);
    link.target='_blank';link.rel='noopener noreferrer';
    controls.append(link);
  }else{
    const note=document.createElement('small');
    note.textContent='Demo handoff. Add the installer’s WhatsApp number in Preview Studio to enable direct messaging.';
    controls.append(note);
  }
  const copy=document.createElement('button');copy.textContent='Copy enquiry';
  copy.onclick=async()=>{
    try{await navigator.clipboard.writeText(message);copy.textContent='Enquiry copied ✓'}
    catch{prompt('Copy enquiry',message)}
  };
  controls.append(copy);
}
function openChat(service){
  returnFocus=document.activeElement;
  panel.hidden=false;launcher.setAttribute('aria-expanded','true');
  document.querySelector('#chat-nudge').hidden=true;
  start();
  if(service){say(service,true);chooseService(service)}
  else controls.querySelector('button')?.focus();
}
function closeChat(){
  panel.hidden=true;launcher.setAttribute('aria-expanded','false');
  returnFocus?.focus();
}
launcher.onclick=()=>panel.hidden?openChat():closeChat();
document.querySelector('#chat-close').onclick=closeChat;
document.querySelector('#chat-restart').onclick=()=>{start();controls.querySelector('button').focus()};
document.querySelectorAll('[data-start]').forEach(button=>button.onclick=()=>openChat());
document.querySelector('[data-location]').onclick=()=>openChat('Check my area');
document.querySelector('#service-cta').onclick=()=>openChat(selectedService);
document.querySelector('.nudge-close').onclick=()=>document.querySelector('#chat-nudge').hidden=true;
panel.onkeydown=event=>{if(event.key==='Escape')closeChat()};

// Loading another preview in the same tab must refresh its business details.
window.addEventListener('hashchange',()=>{
  if(location.hash.startsWith('#p=')&&location.href!==previewLink)location.reload();
});
