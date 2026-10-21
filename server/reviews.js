import { token,digest,validToken } from './security.js';
const error=(status,message)=>Object.assign(new Error(message),{status});
const idPattern=/^[1-9]\d{0,19}$/;
export function validateReview(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw error(400,'Patikrink atsiliepimo laukelius.');
 if(input.website)throw error(400,'Nepavyko pateikti atsiliepimo.');
 const name=typeof input.name==='string'?input.name.trim().replace(/\s+/g,' '):'';
 const text=typeof input.text==='string'?input.text.trim().replace(/\r\n?/g,'\n'):'';
 if(!name||name.length>40||/[<>\u0000-\u001f\u007f]/.test(name))throw error(400,'Įrašyk vardą (iki 40 simbolių).');
 if(text.length<5||text.length>800||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text))throw error(400,'Atsiliepimui skirk nuo 5 iki 800 simbolių.');
 if(/https?:\/\/|www\.|\b[\p{L}\d][\p{L}\d.-]*\.(?:lt|com|net|org|ru|xyz|io|info|eu)\b/iu.test(name+' '+text))throw error(400,'Atsiliepimą parašyk be reklaminių nuorodų.');
 return {name,text};
}
function dto(row,mine=false){return {id:String(row.id),name:row.display_name,text:row.review_text,createdAt:new Date(row.created_at).toISOString(),mine};}
export function createReviews({db,body,rate,respond,production}){
 const cookieName=production?'__Host-mm_review_visitor':'mm_review_visitor';
 function visitor(req){const raw=(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(cookieName+'='))?.slice(cookieName.length+1);return validToken(raw)?digest(raw):null;}
 function establish(req,res){let hash=visitor(req);if(!hash){const raw=token();hash=digest(raw);res.setHeader('Set-Cookie',`${cookieName}=${raw}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000${production?'; Secure':''}`);}return hash;}
 async function publicRoute(req,res,path){
  if(path==='/api/reviews'&&req.method==='GET'){
   const url=new URL(req.url,'https://local.invalid');const limit=Math.min(100,Math.max(1,Number(url.searchParams.get('limit'))||20));
   if(!Number.isInteger(limit))throw error(400,'Netinkamas puslapio dydis.');
   const before=url.searchParams.get('before');if(before&&!idPattern.test(before))throw error(400,'Netinkamas puslapis.');
   const [rows]=await db.execute(`SELECT id,display_name,review_text,created_at,visitor_hash FROM mm_reviews WHERE status='published'${before?' AND id<?':''} ORDER BY id DESC LIMIT ${limit+1}`,before?[before]:[]);
   const [[count]]=await db.execute("SELECT COUNT(*) total FROM mm_reviews WHERE status='published'");
   const page=rows.slice(0,limit),hash=visitor(req);
   respond(res,200,{reviews:page.map(r=>dto(r,Boolean(hash&&hash===r.visitor_hash))),total:Number(count.total),nextCursor:rows.length>limit?String(page.at(-1).id):null});return true;
  }
  if(path==='/api/reviews/form'&&req.method==='GET'){
   const hash=establish(req,res);await rate('review-form-global',1200);await rate('review-form:'+hash,30);
   await db.execute('DELETE FROM mm_review_forms WHERE expires_at<UTC_TIMESTAMP()');
   const raw=token();await db.execute('INSERT INTO mm_review_forms(token_hash,visitor_hash,expires_at) VALUES(?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 30 MINUTE))',[digest(raw),hash]);
   respond(res,200,{token:raw});return true;
  }
  if(path==='/api/reviews'&&req.method==='POST'){
   const input=await body(req,5000);const value=validateReview(input),hash=visitor(req);
   if(!hash||!validToken(input.token))throw error(400,'Perkrauk formą ir bandyk dar kartą.');
   const conn=await db.getConnection();let review;
   try{
    await conn.beginTransaction();
    const [[form]]=await conn.execute('SELECT visitor_hash,review_id,TIMESTAMPDIFF(SECOND,created_at,UTC_TIMESTAMP()) age,expires_at>UTC_TIMESTAMP() valid FROM mm_review_forms WHERE token_hash=? FOR UPDATE',[digest(input.token)]);
    if(!form||form.visitor_hash!==hash||!form.valid)throw error(410,'Forma nebegalioja. Bandyk dar kartą.');
    if(form.review_id){const [[old]]=await conn.execute("SELECT * FROM mm_reviews WHERE id=? AND status='published'",[form.review_id]);if(!old||old.display_name!==value.name||old.review_text!==value.text)throw error(409,'Ši forma jau panaudota.');review=old;}
    else{
     if(form.age<3)throw error(429,'Skirk akimirką atsiliepimui ir bandyk dar kartą.');
     await rate('review-post:'+hash,3,conn);await rate('review-post-global',500,conn);
     const fingerprint=digest(value.text.toLocaleLowerCase('lt-LT').replace(/\s+/g,' '));
     const [[existing]]=await conn.execute("SELECT * FROM mm_reviews WHERE visitor_hash=? AND content_hash=? AND status='published' AND created_at>DATE_SUB(UTC_TIMESTAMP(),INTERVAL 1 DAY) LIMIT 1",[hash,fingerprint]);
     if(existing)review=existing;
     else{
      const [created]=await conn.execute('INSERT INTO mm_reviews(display_name,review_text,visitor_hash,content_hash) VALUES(?,?,?,?)',[value.name,value.text,hash,fingerprint]);
      [[review]]=await conn.execute('SELECT * FROM mm_reviews WHERE id=?',[created.insertId]);
     }
     await conn.execute('UPDATE mm_review_forms SET review_id=? WHERE token_hash=?',[review.id,digest(input.token)]);
    }
    await conn.commit();
   }catch(e){await conn.rollback();throw e;}finally{conn.release();}
   respond(res,201,{review:dto(review,true)});return true;
  }
  const withdraw=path.match(/^\/api\/reviews\/([1-9]\d{0,19})\/withdraw$/);
  if(withdraw&&req.method==='POST'){
   const hash=visitor(req);if(!hash)throw error(403,'Šį atsiliepimą gali pašalinti tik jo autorius.');
   await body(req,1000);
   await db.execute("UPDATE mm_reviews SET status='withdrawn',moderated_at=UTC_TIMESTAMP() WHERE id=? AND visitor_hash=? AND status='published'",[withdraw[1],hash]);
   respond(res,200,{ok:true});return true;
  }
  return false;
 }
 async function adminRoute(req,res,path,current){
  if(path==='/api/admin/reviews'&&req.method==='GET'){
   const [rows]=await db.execute('SELECT id,display_name,review_text,created_at,status FROM mm_reviews ORDER BY id DESC LIMIT 200');
   respond(res,200,{reviews:rows.map(r=>({...dto(r),status:r.status}))});return true;
  }
  const visibility=path.match(/^\/api\/admin\/reviews\/([1-9]\d{0,19})\/visibility$/);
  if(visibility&&req.method==='POST'){
   const input=await body(req,1000);if(typeof input?.visible!=='boolean')throw error(400,'Netinkama būsena.');
   await db.execute("UPDATE mm_reviews SET status=?,moderated_by=?,moderated_at=UTC_TIMESTAMP() WHERE id=? AND status<>'withdrawn'",[input.visible?'published':'hidden',current.email,visibility[1]]);
   respond(res,200,{ok:true});return true;
  }
  return false;
 }
 return {publicRoute,adminRoute};
}
