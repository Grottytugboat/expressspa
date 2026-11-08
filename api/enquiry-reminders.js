import {listLeads,storeRead,storeWrite,storeCreate,dueReminder,mail,actionLink,leadHtml,MARK} from '../lib/enquiries.mjs';
export default async function handler(req,res){
 if(!process.env.CRON_SECRET||req.headers.authorization!==`Bearer ${process.env.CRON_SECRET}`)return res.status(401).json({error:'Unauthorized'});
 res.setHeader('Cache-Control','no-store');let cursor,checked=0,sent=0,failures=0;
 do{const batch=await listLeads(cursor);for(const b of batch.blobs){const lead=await storeRead(b.pathname);checked++;if(!lead)continue;const day=dueReminder(lead);if(day===null)continue;const key=`${lead.status}-${day}`,claim=`claims/${lead.id}-${key}.json`;
 try{await storeCreate(claim,{at:new Date().toISOString()});}catch(e){if(/already exists|already_exists|409/i.test(e.message))continue;failures++;continue;}
 try{await mail({to:MARK,subject:`Follow up ${lead.status==='quoted'?'quote':'enquiry'}: ${lead.pickup} → ${lead.delivery}`,html:`<p>This ${lead.status==='quoted'?'quote':'enquiry'} needs a follow-up (${day}-day reminder).</p>${leadHtml(lead,actionLink(lead))}`,key:`remind-${lead.id}-${key}`});lead.reminders=[...(lead.reminders||[]),key];await storeWrite(b.pathname,lead);sent++;}catch(e){console.error('reminder_failed',{reference:lead.id.slice(0,8),error:e.message});const{del}=await import('@vercel/blob');await del(claim);failures++;}
 }cursor=batch.hasMore?batch.cursor:undefined;}while(cursor&&checked<2000);
 return res.status(failures?500:200).json({checked,sent,failures});
}
