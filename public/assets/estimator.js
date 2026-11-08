const estimator=document.querySelector('#estimate-form'),result=document.querySelector('#estimate-result');
if(estimator){
 const destination=estimator.elements.destination,datalist=document.querySelector('#suburb-options'),preset=estimator.elements.labourPreset,custom=document.querySelector('#custom-labour');
 let placesPromise;const places=()=>placesPromise??=fetch('/assets/victoria-suburbs.json').then(r=>{if(!r.ok)throw new Error('Suburb lookup is unavailable. Enter your approximate one-way distance instead.');return r.json();}).then(x=>x.places);
 const label=p=>`${p[0]} VIC ${p[1]}`;
 destination.addEventListener('input',async()=>{const q=destination.value.trim().toLowerCase();datalist.replaceChildren();if(q.length<2)return;try{const all=await places();if(destination.value.trim().toLowerCase()!==q)return;const found=all.filter(p=>p[0].toLowerCase().startsWith(q)||p[1].startsWith(q)).slice(0,12);for(const p of found){const o=document.createElement('option');o.value=label(p);datalist.append(o);}document.querySelector('#maps-distance-link').href='https://www.google.com/maps/dir/?api=1&origin=Croydon%20VIC%203136&destination='+encodeURIComponent(destination.value+' Australia')+'&travelmode=driving';}catch{}});
 destination.addEventListener('focus',()=>{places().catch(()=>{});},{once:true});
 preset.addEventListener('change',()=>{custom.hidden=preset.value!=='custom';});
 const toRadians=n=>n*Math.PI/180;
 function distanceTo(p){const a=toRadians(p[2]+37.8),b=toRadians(p[3]-145.2833),h=Math.sin(a/2)**2+Math.cos(toRadians(-37.8))*Math.cos(toRadians(p[2]))*Math.sin(b/2)**2;return Math.max(5,Math.round((6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h))*1.3)/5)*5);}
 const money=n=>new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD',minimumFractionDigits:Number.isInteger(n)?0:2,maximumFractionDigits:2}).format(n);
 function element(tag,text,cls){const x=document.createElement(tag);x.textContent=text;if(cls)x.className=cls;return x;}
 estimator.addEventListener('submit',async e=>{
  e.preventDefault();if(!estimator.reportValidity())return;const btn=estimator.querySelector('button'),manual=estimator.elements.oneWayKm.value.trim();btn.disabled=true;
  try{
   let oneWayKm,place,method;
   if(manual!==''){oneWayKm=Number(manual);place=destination.value.trim()||'your location';method='Distance supplied by you';}
   else{if(!destination.value.trim())throw new Error('Enter your suburb, or open “I know roughly how far it is” and add the one-way distance.');const all=await places(),q=destination.value.trim().toLowerCase(),exact=all.filter(p=>label(p).toLowerCase()===q||p[0].toLowerCase()===q);if(exact.length!==1)throw new Error('Choose a suburb from the suggestions so we use the right location. You can also enter the one-way kilometres instead.');place=label(exact[0]);oneWayKm=distanceTo(exact[0]);method='Approximate suburb-based distance, including a road allowance';}
   let people=2,hours=1;if(preset.value==='longer')hours=2;else if(preset.value==='extra'){people=3;hours=2;}else if(preset.value==='custom'){people=Number(estimator.elements.people.value);hours=Number(estimator.elements.hours.value);}
   const unsure=estimator.elements.lifts.value==='unsure',lifts=unsure?2:Number(estimator.elements.lifts.value),r=await fetch('/api/estimate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({oneWayKm,people,hours,lifts})}),x=await r.json();if(!r.ok)throw new Error(x.error||'We couldn’t calculate that. Please contact Mark.');
   result.replaceChildren();result.append(element('p','YOUR ROUGH ESTIMATE','eyebrow'));if(!x.configured)throw new Error(x.message);
   result.append(element('h2','Here’s your guide price.'),element('p',money(x.total),'estimate-total'),element('p','Including '+money(x.gst)+' GST','gst-label'));
   const trip=element('p',`Croydon → ${place} → Croydon`,'trip-summary');result.append(trip);
   const breakdown=element('div','','estimate-breakdown');for(const[k,v]of [[`Truck · ${x.totalKm} km return × ${money(x.truckRate)}/km`,x.transport],[`Crane · ${x.lifts} ${x.lifts===1?'lift':'lifts'} × ${money(x.craneRate)}`,x.lifting],[`Labour · ${x.people} people × ${x.hours} ${x.hours===1?'hour':'hours'} × ${money(x.labourRate)}`,x.labour],['Subtotal before GST',x.subtotal],['GST added',x.gst]]){breakdown.append(element('span',k),element('strong',money(v)));}result.append(breakdown);
   result.append(element('p',`${oneWayKm} km each way. ${method}.`,'fine'));if(unsure)result.append(element('p','Not sure about the crane? We’ve allowed two lifts so there’s a starting point. Mark will check what is needed.','fine'));result.append(element('p',x.message,'fine'));
   const link=element('a','Ask Mark to confirm this estimate ↗','button full');link.href='#quote';result.append(link);
   document.querySelector('#estimate-context').value=`Croydon → ${place} → Croydon. ${oneWayKm} km one way / ${x.totalKm} km return (${method}). ${x.lifts} crane lifts${unsure?' (customer unsure)':''}. ${x.people} people × ${x.hours} hours. Guide ${money(x.total)} including ${money(x.gst)} GST; subject to assessment.`;
   const quote=document.querySelector('#quote-form');if(!quote.elements.pickup.value)quote.elements.pickup.value='Croydon VIC 3136';if(destination.value.trim())quote.elements.delivery.value=place;
   result.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  }catch(err){result.replaceChildren(element('p','Let’s check one detail.','eyebrow'),element('h2','Almost there.'),element('p',err.message||'Please ask Mark for a quote.','fine'));}finally{btn.disabled=false;}
 });
}
