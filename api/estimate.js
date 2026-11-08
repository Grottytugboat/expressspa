import {estimate} from '../lib/estimate.mjs';
export default function handler(req,res){res.setHeader('Cache-Control','no-store');if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});try{return res.status(200).json(estimate(req.body||{}));}catch{return res.status(400).json({error:'Check the distance, labour hours and crane lifts.'});}}
