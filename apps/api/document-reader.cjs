const {parentPort,workerData}=require('node:worker_threads');
const path=require('node:path');
async function read(){
  const {PDFParse}=require('pdf-parse');
  const bytes=Buffer.from(workerData.bytes);
  let parser,worker;
  try{
    if(workerData.mime==='application/pdf'){
      parser=new PDFParse({data:bytes});
      const text=await parser.getText({first:10});
      if(text.total>10)throw new Error('Documents are limited to ten pages.');
      if(text.text.replace(/\s/g,'').length>50)return {text:text.text,method:'PDF text',quality:null};
    }
    const {createWorker}=require('tesseract.js');
    const lang=require('@tesseract.js-data/eng');
    worker=await createWorker('eng',1,{langPath:lang.langPath,cacheMethod:'none',gzip:true});
    let images=[bytes];
    if(parser){const result=await parser.getScreenshot({scale:1.5});images=result.pages.map(p=>p.data);}
    let text='',quality=100;
    for(const image of images){const result=await worker.recognize(image);text+='\n'+result.data.text;quality=Math.min(quality,result.data.confidence);}
    return {text,method:'Local Tesseract OCR',quality};
  }finally{if(worker)await worker.terminate();if(parser)await parser.destroy();}
}
read().then(result=>parentPort.postMessage({result})).catch(()=>parentPort.postMessage({error:'Document recognition failed. Use a clear PDF or image, or enter verified cargo manually.'}));
