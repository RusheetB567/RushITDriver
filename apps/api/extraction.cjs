const {Worker}=require('node:worker_threads');
const path=require('node:path');
const labels={awb:'AWB|Air Waybill',mawb:'MAWB|Master AWB',hawb:'HAWB|House AWB',consignmentNumber:'Consignment(?: Number)?',bookingNumber:'Booking(?: Number)?',customerReference:'Customer Reference|Reference',purchaseOrder:'Purchase Order|PO',client:'Client',hostFreightCompany:'Freight Forwarder|Host Freight Company',shipper:'Shipper|Sender',consignee:'Consignee|Receiver',carrier:'Carrier',handlingAgent:'Handling Agent',originAirport:'Origin(?: Airport)?|Departure Airport',destinationAirport:'Destination(?: Airport)?|Arrival Airport',originAddress:'Pickup Address|Collection Address',destinationAddress:'Delivery Address',airline:'Airline',flightNumber:'Flight(?: Number)?',eta:'ETA',pieces:'Pieces|Item Count|Packages',weightKg:'Gross Weight|Weight',chargeableWeight:'Chargeable Weight',description:'Description|Nature of Goods',specialHandling:'Special Instructions|Handling',dimensions:'Dimensions'};
function extract(text,quality=null){
  const fields={};
  for(const [key,label]of Object.entries(labels)){
    const regex=new RegExp(`^\\s*(?:${label})\\s*[:#]\\s*(.+)$`,'im');const match=text.match(regex);
    fields[key]={value:match?match[1].trim():'',quality:match?Math.min(quality??90,90):0,verified:false,source:match?match[0].trim():''};
  }
  return fields;
}
function recognise(bytes,mime){return new Promise((resolve,reject)=>{
  const worker=new Worker(path.join(__dirname,'document-reader.cjs'),{workerData:{bytes,mime},resourceLimits:{maxOldGenerationSizeMb:256}});
  const timer=setTimeout(()=>{worker.terminate();reject(new Error('Document processing timed out. Try a smaller document.'));},90000);
  const finish=()=>clearTimeout(timer);
  worker.once('message',message=>{finish();worker.terminate();if(message.error)reject(new Error(message.error));else resolve({...message.result,fields:extract(message.result.text,message.result.quality)});});
  worker.once('error',()=>{finish();reject(new Error('Document recognition is unavailable.'));});
  worker.once('exit',code=>{if(code!==0){finish();reject(new Error('Document processing stopped.'));}});
});}
module.exports={extract,recognise,labels};
