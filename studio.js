import {previewUrl} from './model.js';
const builder=document.querySelector('#builder'),status=document.querySelector('#status');
builder.onsubmit=e=>{e.preventDefault();try{location.assign(previewUrl(Object.fromEntries(new FormData(builder))))}catch(err){alert(err.message)}};
function parseCSV(text){
 const rows=[];let row=[],cell='',quoted=false;
 text=text.replace(/^\uFEFF/,'');
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}
 else if(c===','&&!quoted){row.push(cell);cell=''}else if(/[\r\n]/.test(c)&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell=''}else cell+=c}
 if(quoted)throw Error('Unclosed quote in CSV.');row.push(cell);if(row.some(Boolean))rows.push(row);return rows;
}
document.querySelector('#import').onclick=async()=>{try{const file=document.querySelector('#csv').files[0];if(!file)throw Error('Select a CSV file first.');
 const [headers,...rows]=parseCSV(await file.text());if(!rows.length||!['name','phone','area'].every(h=>headers?.includes(h)))throw Error('Use the template headers: name, area, phone.');
 const output=[[...headers,'preview_url']];for(const [i,row] of rows.entries()){try{const data=Object.fromEntries(headers.map((h,k)=>[h,row[k]]));output.push([...headers.map((_,k)=>row[k]||''),previewUrl(data)])}catch(err){throw Error('Row '+(i+2)+': '+err.message)}}
 const csv=output.map(row=>row.map(cell=>'"'+cell.replaceAll('"','""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='installer-previews.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);status.textContent=rows.length+' preview links exported.';
 }catch(err){status.textContent=err.message}};
