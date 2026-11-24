export const demo={name:'Hearth Heating',area:'Greater Manchester',phone:'0161 496 0123',offer:'',logo:'',colour:'#ad4d2e'};
export function clean(raw){
 const data={};
 for(const key of Object.keys(demo)) data[key]=String(raw[key]??'').trim();
 if(!data.name||!data.area||data.name.length>90||data.area.length>90)throw Error('Enter a business name and service area, each under 91 characters.');
 if(!/^[+0-9 ()-]{7,24}$/.test(data.phone)||data.phone.replace(/\D/g,'').length<7)throw Error('Check the business phone number.');
 if(data.logo&&(!/^https:\/\//i.test(data.logo)||data.logo.length>500))throw Error('Use an HTTPS logo URL.');
 if(data.offer.length>160)throw Error('Keep the offer under 161 characters.');
 data.colour=data.colour||demo.colour;
 if(!/^#[a-f0-9]{6}$/i.test(data.colour))throw Error('Use a six-digit hex colour.');
 return data;
}
export function previewUrl(data){return new URL('/preview.html',location.origin).href+'#p='+new URLSearchParams(clean(data)).toString()}
