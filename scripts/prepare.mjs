import {cp,access} from 'node:fs/promises';
try{await access('images');await cp('images','public/images',{recursive:true,force:false,errorOnExist:false});}catch(e){if(e.code!=='ENOENT')throw e;}
console.log('Express Spa public site ready.');
