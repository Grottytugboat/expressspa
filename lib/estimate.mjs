export function estimate(input, env=process.env){
 const km=Number(input.km),hours=Number(input.hours),lifts=Number(input.lifts??0);
 if(!Number.isFinite(km)||km<0||km>5000||!Number.isFinite(hours)||hours<0||hours>100||!Number.isInteger(lifts)||lifts<0||lifts>8)throw new Error('Check the distance, hours and lift count.');
 const truck=Number(env.TRUCK_RATE_PER_KM),labour=Number(env.LABOUR_RATE_PER_HOUR),crane=Number(env.CRANE_RATE_PER_LIFT??55),minimum=Number(env.MINIMUM_JOB_CHARGE??0);
 if(!(env.PRICING_CONFIRMED==='true'&&truck>0&&labour>0&&crane>=0&&['inclusive','exclusive'].includes(env.PRICING_GST)))return {configured:false,formula:'Truck kilometres + crane lifts + labour',message:'Send your route and access details. We’ll confirm the kilometres, lifting and labour before pricing your move.'};
 const transport=km*truck,lifting=lifts*crane,work=hours*labour,subtotal=Math.max(minimum,transport+lifting+work),total=env.PRICING_GST==='exclusive'?subtotal*1.1:subtotal;
 return {configured:true,transport:Math.round(transport*100)/100,lifting:Math.round(lifting*100)/100,labour:Math.round(work*100)/100,total:Math.round(total*100)/100,gst:'Includes GST',currency:'AUD',message:'Planning estimate only. Mark confirms billable kilometres, crew hours, access and availability before booking. Additional services are quoted separately.'};
}
