
function showPage(id,btn){
 document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
 document.getElementById(id).classList.add('active');
 document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
 btn.classList.add('active');
 if(id==='gis') { const m=ensureMap(); if(m) setTimeout(()=>m.invalidateSize(),120); }
 window.scrollTo({top:0,behavior:'smooth'});
}

const stateNames=['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'];
const regions=[
 ['Jammu & Kashmir',420,105,.46],['Himachal Pradesh',485,130,.58],['Punjab',400,165,.32],['Haryana',455,185,.36],['Rajasthan',320,255,.28],['Uttarakhand',525,175,.55],['Uttar Pradesh',545,255,.62],['Bihar',650,270,.73],['Sikkim',735,245,.69],['West Bengal',720,335,.77],['Assam',825,265,.82],['Arunachal Pradesh',855,205,.64],['Nagaland',885,285,.71],['Meghalaya',800,330,.74],['Tripura',800,390,.63],['Mizoram',850,400,.59],['Jharkhand',655,360,.66],['Chhattisgarh',575,380,.55],['Odisha',690,425,.72],['Gujarat',300,385,.38],['Madhya Pradesh',470,365,.45],['Maharashtra',440,465,.51],['Goa',405,535,.34],['Karnataka',485,545,.48],['Telangana',570,500,.56],['Andhra Pradesh',625,535,.61],['Tamil Nadu',585,605,.57],['Kerala',430,605,.44]
];
let layerState={risk:true,river:true,flood:true,places:true};
let selectedMapRegion='India Overview';
let mapInstance=null, riskOverlay=null, riverOverlay=null, placeLayer=null, selectedMarker=null, searchedPlace=null, glBase=null, offlineBase=null, mapFallbackTimer=null;
const stateCenters={
 'India Overview':[22.5,79.0,5], 'Andhra Pradesh':[15.9,79.7,7], 'Arunachal Pradesh':[28.2,94.7,7], Assam:[26.2,92.9,7], Bihar:[25.9,85.3,7], Chhattisgarh:[21.3,81.9,7], Goa:[15.4,74.1,9], Gujarat:[22.3,71.6,7], Haryana:[29.1,76.1,8], 'Himachal Pradesh':[31.8,77.2,7], Jharkhand:[23.6,85.3,7], Karnataka:[15.3,75.7,7], Kerala:[10.4,76.3,8], 'Madhya Pradesh':[23.5,78.6,7], Maharashtra:[19.7,75.7,7], Manipur:[24.8,93.9,8], Meghalaya:[25.5,91.4,8], Mizoram:[23.3,92.8,8], Nagaland:[26.1,94.6,8], Odisha:[20.3,84.4,7], Punjab:[31.0,75.3,8], Rajasthan:[27.0,74.2,6], Sikkim:[27.5,88.5,9], 'Tamil Nadu':[11.1,78.6,7], Telangana:[17.9,79.4,7], Tripura:[23.8,91.3,8], 'Uttar Pradesh':[26.8,80.9,7], Uttarakhand:[30.1,79.2,8], 'West Bengal':[23.0,87.9,7], 'Andaman and Nicobar Islands':[11.7,92.7,7], Chandigarh:[30.7,76.8,11], Delhi:[28.6,77.2,10], 'Jammu and Kashmir':[33.8,76.0,7], Ladakh:[34.2,77.6,7], Lakshadweep:[10.5,72.6,8], Puducherry:[11.9,79.8,10]
};
function demoRisk(lat,lng){
 const x=Math.abs(Math.sin(lat*12.9898+lng*78.233))*0.62+Math.abs(Math.cos((lat-lng)*3.17))*0.18;
 return Math.max(.12,Math.min(.92,x));
}
function riskColor(v){return v<.25?'#2e9b62':v<.45?'#e5b62f':v<.68?'#e77928':'#d94b4b'}
function riskClass(v){return v<.25?'Low':v<.45?'Moderate':v<.68?'High':'Very High'}
function hideMapLoading(){const el=document.getElementById('mapLoading');if(el)el.style.display='none';}
function showMapLoading(msg){const el=document.getElementById('mapLoading');if(el){el.textContent=msg||'Loading interactive map…';el.style.display='flex';}}
function enableOfflineMap(){
 if(!mapInstance)return;
 if(glBase){try{mapInstance.removeLayer(glBase);}catch(e){} glBase=null;}
 if(offlineBase)return;
 offlineBase=L.imageOverlay('FLOODSAFE_offline_world_map.svg',[[-60,-180],[85,180]],{opacity:1,interactive:false,alt:'Offline geographic world map'}).addTo(mapInstance);
 mapInstance.setView([22.5,79],5);
 hideMapLoading();
 const info=document.getElementById('mapinfo'); if(info)info.innerHTML='<b>Interactive map ready.</b> Offline geographic basemap is active. Click anywhere to inspect a location, or search a place by name.';
}
function ensureMap(){
 if(mapInstance) return mapInstance;
 if(!window.L){document.getElementById('mapinfo').innerHTML='<b>Map library could not load.</b>';return null;}
 mapInstance=L.map('leafletMap',{zoomControl:true,scrollWheelZoom:true,minZoom:2,maxZoom:18}).setView([22.5,79],5);
 riskOverlay=L.layerGroup().addTo(mapInstance); riverOverlay=L.layerGroup().addTo(mapInstance); placeLayer=L.layerGroup().addTo(mapInstance);
 mapInstance.on('click',function(e){selectMapPoint(e.latlng.lat,e.latlng.lng,null,true);});
 if(window.L.maplibreGL && window.maplibregl){
   try{
    glBase=L.maplibreGL({style:'https://tiles.openfreemap.org/styles/liberty',interactive:false,padding:0.05}).addTo(mapInstance);
    const gl=glBase.getMaplibreMap();
    let loaded=false;
    gl.once('load',()=>{loaded=true;clearTimeout(mapFallbackTimer);hideMapLoading();});
    gl.on('error',()=>{if(!loaded){clearTimeout(mapFallbackTimer);enableOfflineMap();}});
    mapFallbackTimer=setTimeout(()=>{if(!loaded)enableOfflineMap();},9000);
   }catch(e){enableOfflineMap();}
 }else{enableOfflineMap();}
 setTimeout(()=>mapInstance.invalidateSize(),120);
 return mapInstance;
}
function stateFocus(state){
 const m=ensureMap(); if(!m)return;
 const c=stateCenters[state]||stateCenters['India Overview'];
 m.setView([c[0],c[1]],c[2]);
 drawRiskOverlay();
 document.getElementById('mapinfo').innerHTML=`<b>${state}</b> selected.</b> Click anywhere on the map to inspect that location, or search a place by name.`;
}
function changeMapRegion(){selectedMapRegion=document.getElementById('mapState').value||'India Overview';stateFocus(selectedMapRegion);}
function drawRiskOverlay(){
 const m=ensureMap(); if(!m)return;
 riskOverlay.clearLayers(); riverOverlay.clearLayers();
 const c=stateCenters[selectedMapRegion]||stateCenters['India Overview'];
 // Demonstration susceptibility cells around the current map focus. They are visual overlays, not official model output.
 const offsets=[[-.65,-.9],[-.45,.1],[-.55,.95],[.1,-.8],[.15,.2],[.2,1.0],[.72,-.45],[.68,.55]];
 offsets.forEach((o,i)=>{const lat=c[0]+o[0],lng=c[1]+o[1];const r=demoRisk(lat,lng);L.circle([lat,lng],{radius:26000,color:riskColor(r),fillColor:riskColor(r),fillOpacity:.24,weight:1.5}).bindTooltip(`${riskClass(r)} • ${(r*100).toFixed(0)}% demo susceptibility`,{sticky:true}).addTo(riskOverlay);});
 const pts=[]; for(let i=-2;i<=2;i++) pts.push([c[0]+i*.35,c[1]+Math.sin(i)*.55]);
 L.polyline(pts,{color:'#25a5c1',weight:5,opacity:.6}).addTo(riverOverlay);
}
function selectMapPoint(lat,lng,displayName,fromClick){
 const m=ensureMap(); if(!m)return;
 const p=demoRisk(lat,lng);
 placeLayer.clearLayers();
 if(selectedMarker)selectedMarker.remove();
 selectedMarker=L.marker([lat,lng]).addTo(placeLayer);
 selectedMarker.bindPopup(`<b>${displayName||'Selected location'}</b><br>${lat.toFixed(4)}, ${lng.toFixed(4)}<br><strong style="color:${riskColor(p)}">${riskClass(p)} • ${(p*100).toFixed(0)}% demo susceptibility</strong>`).openPopup();
 searchedPlace={name:displayName||'Selected map location',state:selectedMapRegion,p,lat,lng};
 document.getElementById('mapinfo').innerHTML=`<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><b>${displayName||'Selected map location'}</b><br><span class="muted">${lat.toFixed(4)}, ${lng.toFixed(4)} • Demo susceptibility: <b>${(p*100).toFixed(0)}%</b> • ${riskClass(p)}</span></div><button class="btn" type="button" onclick="openRiskFromMap(${p.toFixed(3)},'${(displayName||'Selected map location').replace(/'/g,"\\'")}')">CHECK THIS AREA →</button></div><div class="muted" style="margin-top:8px;font-size:12px">Prototype indicator only. Final deployment will read the verified model raster and GIS layers at this exact location.</div>`;
 if(fromClick) reverseGeocode(lat,lng);
}
async function reverseGeocode(lat,lng){
 try{
  const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=12&addressdetails=1`,{headers:{'Accept':'application/json'}});
  if(!r.ok)return; const d=await r.json(); const name=d.display_name||'Selected map location';
  selectMapPoint(lat,lng,name,false);
 }catch(e){/* coordinates remain a valid selection if reverse geocoding is unavailable */}
}
const localPlaces={
 'mumbai':[19.076,72.8777,'Mumbai, Maharashtra'],'pune':[18.5204,73.8567,'Pune, Maharashtra'],'nagpur':[21.1458,79.0882,'Nagpur, Maharashtra'],'nashik':[19.9975,73.7898,'Nashik, Maharashtra'],'aurangabad':[19.8762,75.3433,'Chhatrapati Sambhajinagar, Maharashtra'],'kolhapur':[16.705,74.2433,'Kolhapur, Maharashtra'],
 'delhi':[28.6139,77.209,'Delhi'],'new delhi':[28.6139,77.209,'New Delhi, Delhi'],'jaipur':[26.9124,75.7873,'Jaipur, Rajasthan'],'jodhpur':[26.2389,73.0243,'Jodhpur, Rajasthan'],'udaipur':[24.5854,73.7125,'Udaipur, Rajasthan'],
 'ahmedabad':[23.0225,72.5714,'Ahmedabad, Gujarat'],'surat':[21.1702,72.8311,'Surat, Gujarat'],'vadodara':[22.3072,73.1812,'Vadodara, Gujarat'],'bhopal':[23.2599,77.4126,'Bhopal, Madhya Pradesh'],'indore':[22.7196,75.8577,'Indore, Madhya Pradesh'],
 'patna':[25.5941,85.1376,'Patna, Bihar'],'gaya':[24.7914,85.0002,'Gaya, Bihar'],'muzaffarpur':[26.1209,85.3647,'Muzaffarpur, Bihar'],'bhagalpur':[25.2425,86.9842,'Bhagalpur, Bihar'],'darbhanga':[26.1542,85.8918,'Darbhanga, Bihar'],
 'lucknow':[26.8467,80.9462,'Lucknow, Uttar Pradesh'],'kanpur':[26.4499,80.3319,'Kanpur, Uttar Pradesh'],'varanasi':[25.3176,82.9739,'Varanasi, Uttar Pradesh'],'agra':[27.1767,78.0081,'Agra, Uttar Pradesh'],'prayagraj':[25.4358,81.8463,'Prayagraj, Uttar Pradesh'],
 'kolkata':[22.5726,88.3639,'Kolkata, West Bengal'],'siliguri':[26.7271,88.3953,'Siliguri, West Bengal'],'guwahati':[26.1445,91.7362,'Guwahati, Assam'],'nagaon':[26.35,92.6833,'Nagaon, Assam'],'dibrugarh':[27.4728,94.912,'Dibrugarh, Assam'],'jorhat':[26.7509,94.2037,'Jorhat, Assam'],
 'bhubaneswar':[20.2961,85.8245,'Bhubaneswar, Odisha'],'cuttack':[20.4625,85.883,'Cuttack, Odisha'],'ranchi':[23.3441,85.3096,'Ranchi, Jharkhand'],'kochi':[9.9312,76.2673,'Kochi, Kerala'],'thiruvananthapuram':[8.5241,76.9366,'Thiruvananthapuram, Kerala'],
 'bengaluru':[12.9716,77.5946,'Bengaluru, Karnataka'],'hyderabad':[17.385,78.4867,'Hyderabad, Telangana'],'chennai':[13.0827,80.2707,'Chennai, Tamil Nadu'],'visakhapatnam':[17.6868,83.2185,'Visakhapatnam, Andhra Pradesh'],'vijayawada':[16.5062,80.648,'Vijayawada, Andhra Pradesh']
};
function localPlaceLookup(q){const k=q.toLowerCase().trim(); if(localPlaces[k])return localPlaces[k]; const hit=Object.keys(localPlaces).find(x=>x.includes(k)||k.includes(x)); return hit?localPlaces[hit]:null;}
async function searchPlaceOnMap(){
 const q=(document.getElementById('placeSearch')?.value||'').trim();
 if(!q){document.getElementById('mapinfo').innerHTML='<b>Enter a place name.</b> Try Pune, Patna, Kochi, Nagaon or any city/district/area.';return;}
 const info=document.getElementById('mapinfo'); info.innerHTML='<b>Finding location…</b> Searching '+q+' on the map.';
 try{
  const r=await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(q)}`,{headers:{'Accept':'application/json'}});
  if(!r.ok)throw new Error('search'); const arr=await r.json(); if(!arr.length)throw new Error('notfound');
  const x=arr[0],lat=+x.lat,lng=+x.lon; const m=ensureMap(); if(m){m.setView([lat,lng],12); drawRiskOverlay(); selectMapPoint(lat,lng,x.display_name,false);}
 }catch(e){
  const x=localPlaceLookup(q);
  if(x){const [lat,lng,name]=x;const m=ensureMap();if(m){m.setView([lat,lng],12);drawRiskOverlay();selectMapPoint(lat,lng,name,false);}return;}
  info.innerHTML='<b>Could not find that place.</b> Try a city/district name or click directly on the map. The map itself remains fully interactive.';
 }
}
function toggleMapLayer(k){
 if(k==='risk'&&riskOverlay){if(document.getElementById('layerRisk').checked)riskOverlay.addTo(mapInstance);else mapInstance.removeLayer(riskOverlay);}
 if(k==='river'&&riverOverlay){if(document.getElementById('layerRiver').checked)riverOverlay.addTo(mapInstance);else mapInstance.removeLayer(riverOverlay);}
 if(k==='places'&&placeLayer){if(document.getElementById('layerPlaces').checked)placeLayer.addTo(mapInstance);else mapInstance.removeLayer(placeLayer);}
}
function resetInteractiveMap(){
 selectedMapRegion='India Overview'; const sel=document.getElementById('mapState');if(sel)sel.value='India Overview';const q=document.getElementById('placeSearch');if(q)q.value=''; if(selectedMarker)selectedMarker.remove(); selectedMarker=null; const m=ensureMap(); if(m){m.setView([22.5,79],5);drawRiskOverlay();} document.getElementById('mapinfo').innerHTML='<b>National overview restored.</b> Click anywhere on the map or search a place by name.';
}
function showMapInfo(d){if(d?.lat&&d?.lng)selectMapPoint(+d.lat,+d.lng,d.name||'Selected map location',false)}

function openRiskFromMap(p,name){
 showPage('risk',document.querySelectorAll('nav button')[2]);
 const state=document.getElementById('mapState')?.value||'';
 if(state && state!=='India Overview') document.getElementById('state').value=state;
 if(name && name!=='Selected map location') document.getElementById('district').value=name.split(',')[0];
 document.getElementById('elev').value=Math.round(55-(p*25));
 document.getElementById('slope').value=Math.max(1,(4.8-p*3.2).toFixed(1));
 document.getElementById('twi').value=(7+p*4).toFixed(1);
 document.getElementById('ndvi').value=(.48-p*.22).toFixed(2);
 document.getElementById('river').value=Math.round(1200-p*850);
 document.getElementById('rain').value=Math.round(1200+p*1000);
 calculateRisk();
}
function renderAround(p){
 const grid=document.getElementById('aroundGrid'); if(!grid)return;
 const vals=[Math.max(.08,p-.22),Math.max(.08,p-.10),Math.min(.95,p+.08),Math.min(.95,p+.18)];
 const names=['North zone','East zone','South zone','West zone'];
 grid.innerHTML=names.map((n,i)=>`<div class="around-zone"><b>${n}</b><span style="display:block;margin-top:5px"><strong style="color:${riskColor(vals[i])}">${riskClass(vals[i])}</strong> • ${(vals[i]*100).toFixed(0)}% demo</span></div>`).join('');
}
function viewAroundOnMap(){
 const state=document.getElementById('state')?.value||'India Overview';
 selectedMapRegion=state; const sel=document.getElementById('mapState'); if(sel && state!=='India Overview')sel.value=state;
 showPage('gis',document.querySelectorAll('nav button')[1]);
 const m=ensureMap(); if(m){stateFocus(state); if(searchedPlace?.lat&&searchedPlace?.lng)m.setView([searchedPlace.lat,searchedPlace.lng],12);}
 document.getElementById('mapinfo').innerHTML='<b>Surrounding risk view ready.</b> Click anywhere on the map to inspect a nearby location or search a place by name.';
}

function calculateRisk(){
 const state=document.getElementById('state')?.value||'';
 const district=document.getElementById('district')?.value.trim()||'';
 const region=state?(district?district+', '+state:state):'';
 document.getElementById('selectedRegion').textContent=region?'Selected: '+region:'Please select a state / UT'; if(state && document.getElementById('mapState')){document.getElementById('mapState').value=state; selectedMapRegion=state; stateFocus(state);}
 let e=+document.getElementById('elev').value,s=+document.getElementById('slope').value,t=+document.getElementById('twi').value,n=+document.getElementById('ndvi').value,r=+document.getElementById('river').value,ra=+document.getElementById('rain').value,l=+document.getElementById('lulc').value;
 let p=.35 + Math.max(0,45-e)*.004 + Math.max(0,5-s)*.025 + Math.max(0,t-6)*.04 + Math.max(0,.5-n)*.35 + Math.max(0,2000-r)*.00010 + Math.max(0,ra-1500)*.00018;
 if(l===3)p+=.18;if(l===1)p+=.05;p=Math.max(.03,Math.min(.97,p));
 let cls=p<.25?'LOW':p<.5?'MODERATE':p<.75?'HIGH':'VERY HIGH';
 document.getElementById('score').textContent=(p*100).toFixed(1)+'%';document.getElementById('class').textContent=cls+' SUSCEPTIBILITY';document.getElementById('fill').style.width=(p*100)+'%';renderAround(p);
}
