export function estimate(input,env=process.env){
 const oneWayKm=input.oneWayKm!==undefined?Number(input.oneWayKm):Number(input.km)/2;
 const hours=Number(input.hours),people=Number(input.people??1),lifts=Number(input.lifts??2);
 if(!Number.isFinite(oneWayKm)||oneWayKm<0||oneWayKm>2500||!Number.isFinite(hours)||hours<0||hours>24||!Number.isInteger(people)||people<1||people>6||!Number.isInteger(lifts)||lifts<0||lifts>8)throw new Error('Check the distance, people, hours and lift count.');
 const truck=Number(env.TRUCK_RATE_PER_KM),labourRate=Number(env.LABOUR_RATE_PER_HOUR),crane=Number(env.CRANE_RATE_PER_LIFT),minimum=Number(env.MINIMUM_JOB_CHARGE??0);
 if(!(env.PRICING_CONFIRMED==='true'&&truck>0&&labourRate>0&&crane>=0&&['inclusive','exclusive'].includes(env.PRICING_GST)))return {configured:false,message:'Send your details to Mark for a confirmed quote.'};
 const totalKm=oneWayKm*2,transport=totalKm*truck,lifting=lifts*crane,labour=people*hours*labourRate,subtotal=Math.max(minimum,transport+lifting+labour),gst=env.PRICING_GST==='exclusive'?subtotal*.1:subtotal/11,total=env.PRICING_GST==='exclusive'?subtotal+gst:subtotal,round=n=>Math.round(n*100)/100;
 return {configured:true,oneWayKm,totalKm,people,hours,lifts,truckRate:truck,craneRate:crane,labourRate,transport:round(transport),lifting:round(lifting),labour:round(labour),subtotal:round(subtotal),gst:round(gst),total:round(total),currency:'AUD',gstBasis:env.PRICING_GST,message:'A rough guide, not a fixed quote. Travel starts and finishes in Croydon. Mark confirms the route, lifts, crew and time required; access and the final job details can change the price.'};
}
