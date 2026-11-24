import {clean,demo} from './model.js';
const business=location.hash.startsWith('#p=')?clean(Object.fromEntries(new URLSearchParams(location.hash.slice(3)))):demo;
const content={
  installation:{
    title:'A new boiler, planned around your home.',
    description:'A new installation starts with the property. Discuss available space, hot water needs and your existing heating before choosing a specification.',
    photo:'boiler-premium.jpg',
    points:['Which boiler type suits the property and household demand.','Where the boiler, flue and associated pipework will be positioned.','Whether controls, radiators or other system components need attention.','What the written quote covers and how variations are handled.','Commissioning, handover and documentation included in the work.']
  },
  replacement:{
    title:'A fresh start for your heating.',
    description:'Explore a replacement for an ageing boiler. Review the current installation, the work required and the options for your home.',
    photo:'team-premium.jpg',
    points:['The current system and reasons for considering a replacement.','A direct replacement versus changes to the system or boiler position.','Removal of the old appliance and any associated waste.','Any pipework, controls or system preparation included in the price.','Installation timing and the expected interruption to heating and hot water.']
  },
  controls:{
    title:'Heating that fits your routine.',
    description:'Discuss scheduling, temperature settings and control options. Compatibility with the current boiler and system comes first.',
    photo:'controls-premium.jpg',
    points:['The existing boiler, thermostat and wiring configuration.','How you use different rooms throughout the day.','Scheduling, zoning and remote control requirements.','Equipment compatibility and any additional installation work.','Setup, demonstration and support information at handover.']
  }
};
const service=content[new URLSearchParams(location.search).get('service')]||content.installation;
document.title=business.name+' · '+service.title;
for(const key of ['name','area'])document.querySelectorAll('[data-'+key+']').forEach(node=>node.textContent=business[key]);
document.querySelectorAll('.home-link').forEach(link=>link.href='/preview.html'+location.hash);
const phone=document.querySelector('#service-phone');
phone.textContent=business.phone;phone.href='tel:'+business.phone.replace(/[^+0-9]/g,'');
document.querySelector('#detail-title').textContent=service.title;
document.querySelector('#detail-description').textContent=service.description;
const photo=document.querySelector('#detail-photo');photo.src='/assets/'+service.photo;photo.alt=service.title;
document.querySelector('#detail-list').replaceChildren(...service.points.map(text=>{const item=document.createElement('li');item.textContent=text;return item}));
document.documentElement.style.setProperty('--accent',business.colour);
