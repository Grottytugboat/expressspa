import {acceptEnquiry} from '../lib/enquiries.mjs';
const attempts=new Map();
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const origin=req.headers.origin;if(origin&&!['https://www.expressspa.com.au','https://expressspa.com.au',`https://${process.env.VERCEL_URL}`].includes(origin))return res.status(403).json({error:'Please use the quote form on our website.'});
 if(Number(req.headers['content-length']||0)>3500000)return res.status(413).json({error:'Please send smaller photos.'});
 if(req.body?.website)return res.status(400).json({error:'Please call 0418 329 430.'});
 const ip=String(req.headers['x-forwarded-for']||'unknown').split(',')[0],now=Date.now();for(const[k,v]of attempts)if(now-v.at>3600000)attempts.delete(k);const a=attempts.get(ip);if(a&&now-a.at<60000&&a.count>=5)return res.status(429).json({error:'Please wait a minute before trying again.'});attempts.set(ip,{at:a&&now-a.at<60000?a.at:now,count:a&&now-a.at<60000?a.count+1:1});
 try{const result=await acceptEnquiry(req.body||{});return res.status(200).json(result);}catch(e){const validation=/Please|Check|Photo/.test(e.message);console.error('enquiry_submit_failed',{error:e.message});return res.status(validation?400:503).json({error:validation?e.message:'We couldn’t confirm delivery of your request. Please retry or call 0418 329 430.'});}
}
