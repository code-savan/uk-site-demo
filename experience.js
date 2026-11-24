import {clean,demo} from './model.js';

const data=location.hash.startsWith('#p=')?clean(Object.fromEntries(new URLSearchParams(location.hash.slice(3)))):demo;
const detailKeys={'New installation':'installation','Boiler replacement':'replacement','Heating controls':'controls'};
const detailLink=document.querySelector('#service-details');
function updateDetailLink(service){
  if(detailLink)detailLink.href='/service.html?service='+detailKeys[service]+location.hash;
}
updateDetailLink('New installation');
document.querySelectorAll('[data-service]').forEach(button=>{
  button.addEventListener('click',()=>updateDetailLink(button.dataset.service));
  button.addEventListener('keyup',()=>{
    const selected=document.querySelector('[data-service][aria-selected="true"]');
    updateDetailLink(selected.dataset.service);
  });
});
const credential=document.querySelector('#credential');
if(credential&&data.registration){
  credential.hidden=false;
  credential.append(document.createTextNode('Gas Safe registration '+data.registration+' · '));
  const link=document.createElement('a');
  link.href='https://www.gassaferegister.co.uk/find-an-engineer-or-check-the-register/';
  link.target='_blank';link.rel='noopener';
  link.textContent='Check the register ↗';credential.append(link);
}
if(data.teamImage){
  const team=document.querySelector('.approach-photo img');
  if(team){
    team.addEventListener('error',()=>{team.src='/assets/team-premium.jpg'},{once:true});
    team.src=data.teamImage;
    team.alt=data.name+' team';
  }
}
if(data.review&&data.reviewAuthor&&data.reviewUrl&&document.querySelector('#review-section')){
  document.querySelector('#review-section').hidden=false;
  document.querySelector('#review-text').textContent='“'+data.review+'”';
  document.querySelector('#review-author').textContent=data.reviewAuthor;
  document.querySelector('#review-source').href=data.reviewUrl;
}

const wizard=document.querySelector('#quote-wizard');
const content=document.querySelector('#wizard-content');
let answers={};
let step=0;
let returnFocus;
const questions=[
  {title:'What can we help with?',key:'service',options:['Replace my boiler','New boiler installation','Heating controls','I need advice']},
  {title:'What kind of home is it?',key:'property',options:['Flat or apartment','Terraced house','Semi-detached house','Detached house']},
  {title:'How many bathrooms?',key:'bathrooms',options:['1 bathroom','2 bathrooms','3 or more bathrooms']},
  {title:'What boiler do you have now?',key:'boiler',options:['Combi boiler','System boiler','Regular boiler','Not sure']},
  {title:'When would you like the work done?',key:'timing',options:['As soon as possible','Within a month','Planning ahead']}
];
function element(tag,text,className){
  const node=document.createElement(tag);
  if(text)node.textContent=text;
  if(className)node.className=className;
  return node;
}
function backButton(){
  const back=element('button','← Back','wizard-back');
  back.onclick=()=>{step--;render()};
  content.append(back);
}
function render(){
  content.replaceChildren();
  const progress=element('div',null,'wizard-progress');
  const fill=element('span');fill.style.width=((step+1)/7*100)+'%';progress.append(fill);
  content.append(element('p','YOUR BOILER ENQUIRY · '+(step+1)+' OF 7','eyebrow'),progress);
  if(step<questions.length){
    const question=questions[step];
    content.append(element('h2',question.title),element('p','A few details help '+data.name+' understand your project.','wizard-desc'));
    const options=element('div',null,'wizard-options');
    question.options.forEach(text=>{
      const button=element('button',text);
      button.onclick=()=>{answers[question.key]=text;step++;render()};
      options.append(button);
    });
    content.append(options);
    if(step>0)backButton();
    options.querySelector('button').focus();
    return;
  }
  if(step===5){renderContact();return}
  renderSummary();
}
function renderContact(){
  content.append(element('h2','Where is the project?'),element('p','Review your request next. You choose how to send it to the installer.','wizard-desc'));
  const form=document.createElement('form');
  const fields=[
    {key:'postcode',label:'Full UK postcode',type:'text',required:true,pattern:'[A-Za-z]{1,2}[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2}|GIR ?0AA',limit:10},
    {key:'name',label:'Your name',type:'text',required:true,limit:90},
    {key:'contact',label:'Phone or email for a reply',type:'text',required:true,limit:100},
    {key:'notes',label:'Anything else? (optional)',type:'textarea',limit:500}
  ];
  fields.forEach(field=>{
    const label=element('label',field.label);
    const input=document.createElement(field.type==='textarea'?'textarea':'input');
    input.name=field.key;input.required=!!field.required;input.maxLength=field.limit;
    if(field.type!=='textarea')input.type=field.type;
    if(field.pattern)input.pattern=field.pattern;
    input.value=answers[field.key]||'';
    input.addEventListener('input',()=>{answers[field.key]=input.value});
    label.append(input);form.append(label);
  });
  form.append(element('button','Review my enquiry ↗','btn'));
  form.onsubmit=event=>{
    event.preventDefault();
    answers.postcode=answers.postcode.trim().toUpperCase();
    step++;render();
  };
  content.append(form);backButton();
  form.querySelector('input').focus();
}
function renderSummary(){
  content.append(element('h2','Ready for the next step.'),element('p','Check your details, then continue to the installer. Final pricing and availability are confirmed by the team.','wizard-desc'));
  const lines=[
    'Hi '+data.name+', I would like to discuss a heating project.',
    'Service: '+answers.service,
    'Home: '+answers.property,
    'Bathrooms: '+answers.bathrooms,
    'Current boiler: '+answers.boiler,
    'Timing: '+answers.timing,
    'Postcode: '+answers.postcode,
    'Name: '+answers.name,
    'Reply to: '+answers.contact
  ];
  if(answers.interest)lines.push('Interested in: '+answers.interest+' boiler');
  if(answers.notes)lines.push('Notes: '+answers.notes);
  const message=lines.join('\n');
  content.append(element('div',message,'enquiry-summary'));
  const actions=element('div',null,'handoff-actions');
  if(data.whatsapp){
    let number=data.whatsapp.replace(/\D/g,'').replace(/^00/,'');
    if(number.startsWith('0'))number='44'+number.slice(1);
    const link=element('a','Send via WhatsApp ↗','btn');
    link.href='https://wa.me/'+number+'?text='+encodeURIComponent(message);
    link.target='_blank';link.rel='noopener noreferrer';actions.append(link);
  }
  if(data.email){
    const link=element('a','Send by email ↗','btn');
    link.href='mailto:'+data.email+'?subject='+encodeURIComponent('Heating enquiry · '+answers.postcode)+'&body='+encodeURIComponent(message);
    actions.append(link);
  }
  const copy=element('button','Copy enquiry','btn dark');
  copy.onclick=async()=>{
    try{await navigator.clipboard.writeText(message);copy.textContent='Copied ✓'}
    catch{prompt('Copy your enquiry',message)}
  };
  actions.append(copy);content.append(actions);
  if(!data.whatsapp&&!data.email)content.append(element('p','Demo mode. Add a business WhatsApp number or email in Preview Studio to connect enquiries.','wizard-demo'));
  backButton();
}
function openQuote(interest){
  returnFocus=document.activeElement;
  answers=interest?{interest}:{};
  step=0;
  document.querySelector('#chat-panel')?.setAttribute('hidden','');
  document.querySelector('#chat-launch')?.setAttribute('aria-expanded','false');
  wizard.showModal();render();
}
document.querySelectorAll('[data-quote]').forEach(button=>button.onclick=()=>openQuote());
document.querySelectorAll('[data-type]').forEach(button=>button.onclick=()=>openQuote(button.dataset.type));
document.querySelector('#wizard-close').onclick=()=>wizard.close();
wizard.addEventListener('close',()=>returnFocus?.focus());
