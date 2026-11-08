import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
export const BASE='https://www.expressspa.com.au', MARK='mark@mrspa.com.au';
export const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=(v,n=1000)=>typeof v==='string'?v.trim().slice(0,n):'';
export function validate(data){
 const name=text(data.name,100),phone=text(data.phone,40),email=text(data.email,254),pickup=text(data.pickup,120),delivery=text(data.delivery,120);
 if(!name||!/^[-+()\d\s.]{8,40}$/.test(phone)||email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!pickup||!delivery)throw new Error('Please add your name, phone and both suburbs. Check your email if supplied.');
 const photos=Array.isArray(data.photos)?data.photos:[];if(photos.length>3)throw new Error('Please attach up to three photos.');
 const cleaned=photos.map((p,i)=>{if(!p||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(p.data)||p.data.length>1000000)throw new Error('Please use smaller JPEG photos.');const content=p.data.split(',')[1],b=Buffer.from(content,'base64');if(b[0]!==255||b[1]!==216||b[2]!==255)throw new Error('Photo format is invalid.');return {filename:`access-${i+1}.jpg`,content};});
 const requestedId=text(data.requestId,50),id=/^[a-f\d-]{36}$/.test(requestedId)?requestedId:randomUUID();
 return {id,name,phone,email,pickup,delivery,service:text(data.service,100),spa:text(data.spa,200),date:text(data.date,80),access:text(data.access,1000),message:text(data.message,2000),estimate:text(data.estimate,1000),source:text(data.source,400),photos:cleaned,consent:data.consent===true};
}
export function signAction(id,expires,secret){if(!secret)throw new Error('Action signing not configured');return createHmac('sha256',secret).update(`${id}:${expires}`).digest('hex');}
export function validAction(id,expires,signature,secret,now=Date.now()){if(!/^[a-f\d-]{36}$/.test(id||'')||!/^\d{13}$/.test(String(expires))||Number(expires)<now||!secret||!/^\w{64}$/.test(signature||''))return false;return timingSafeEqual(Buffer.from(signAction(id,expires,secret)),Buffer.from(signature));}
export function actionLink(lead,env=process.env){const expires=Date.now()+30*86400000;return `${BASE}/api/enquiry-action?id=${lead.id}&expires=${expires}&sig=${signAction(lead.id,expires,env.LEAD_ACTION_SECRET)}`;}
export async function storeRead(path){const {get}=await import('@vercel/blob');const r=await get(path,{access:'private',useCache:false});if(!r||r.statusCode!==200)return null;return JSON.parse(await new Response(r.stream).text());}
export async function storeWrite(path,data){const {put}=await import('@vercel/blob');return put(path,JSON.stringify(data),{access:'private',addRandomSuffix:false,allowOverwrite:true,contentType:'application/json'});}
export async function storeCreate(path,data){const {put}=await import('@vercel/blob');return put(path,JSON.stringify(data),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'});}
export async function listLeads(cursor){const {list}=await import('@vercel/blob');return list({prefix:'enquiries/',limit:100,cursor});}
export async function mail({to,subject,html,key,replyTo,attachments},env=process.env){if(!env.RESEND_API_KEY)throw new Error('Email is not configured');const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({from:'Express Spa Deliveries <tim@sondersites.com>',to:[to],subject,html,...(replyTo?{reply_to:replyTo}:{}),...(attachments?.length?{attachments}:{})})});if(!r.ok)throw new Error(`Email provider returned ${r.status}`);return r.json();}
export function leadHtml(lead,link){const rows=[['Name',lead.name],['Phone',lead.phone],['Email',lead.email||'Not supplied'],['Service',lead.service],['Pickup',lead.pickup],['Delivery',lead.delivery],['Spa',lead.spa],['Preferred date',lead.date],['Access',lead.access],['Message',lead.message],['Estimate inputs',lead.estimate],['Page',lead.source]];return `<h2>New Express Spa enquiry</h2><p>Reference ${escapeHtml(lead.id.slice(0,8))}</p>${rows.map(([k,v])=>`<p><strong>${k}:</strong> ${escapeHtml(v||'Not specified').replace(/\n/g,'<br>')}</p>`).join('')}<p><a href="tel:${escapeHtml(lead.phone)}">Call customer</a></p><p><a href="${escapeHtml(link)}">Update enquiry: contacted / quoted / closed</a></p><p>Access photos are attached when supplied. This enquiry is also saved privately.</p>`;}
export async function acceptEnquiry(data,deps={}){
 const env=deps.env||process.env,read=deps.read||storeRead,write=deps.write||storeWrite,send=deps.send||mail;
 const lead=validate(data);if(!lead.consent)throw new Error('Please confirm we can contact you about this enquiry.');
 const path=`enquiries/${lead.id}.json`,old=await read(path);if(old?.notificationSent)return {success:true,reference:lead.id.slice(0,8),duplicate:true};
 const saved=old||{...lead,createdAt:new Date().toISOString(),status:'new',notificationSent:false,acknowledgementSent:false,reminders:[]};
 await write(path,saved);
 await send({to:MARK,subject:`Spa enquiry: ${saved.pickup} → ${saved.delivery} [${saved.id.slice(0,8)}]`,html:leadHtml(saved,actionLink(saved,env)),key:`enquiry-${saved.id}`,replyTo:saved.email||undefined,attachments:saved.photos},env);
 saved.notificationSent=true;await write(path,saved);
 if(saved.email&&!saved.acknowledgementSent){try{await send({to:saved.email,subject:'We’ve received your spa move enquiry',html:`<p>Hi ${escapeHtml(saved.name)},</p><p>Thanks for contacting Express Spa Deliveries. We’ve received your enquiry for ${escapeHtml(saved.pickup)} to ${escapeHtml(saved.delivery)}.</p><p>Mark will check the route, access and availability before confirming a quote. Your request is not a booking yet.</p><p>If you need to add anything, reply to this email or call <a href="tel:+61418329430">0418 329 430</a>.</p><p>Reference: ${escapeHtml(saved.id.slice(0,8))}</p>`,replyTo:MARK,key:`ack-${saved.id}`},env);saved.acknowledgementSent=true;await write(path,saved);}catch(e){console.error('enquiry_ack_failed',{reference:saved.id.slice(0,8),error:e.message});}}
 return {success:true,reference:lead.id.slice(0,8)};
}
export function dueReminder(lead,now=Date.now()){if(['contacted','closed'].includes(lead.status))return null;const base=Date.parse(lead.status==='quoted'?lead.statusAt:lead.createdAt),days=(now-base)/86400000;return [1,3].find(d=>days>=d&&!(lead.reminders||[]).includes(`${lead.status}-${d}`))??null;}
