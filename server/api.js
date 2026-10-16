import { digest, token, validToken, equalToken, assertOrigin, sessionCookie, readSession } from './security.js';
import { parseContent } from './database.js';
import { validateEdits } from '../src/editable-content.js';
const failure=(status,message)=>Object.assign(new Error(message),{status});
async function body(req) {
  if(!String(req.headers['content-type']||'').startsWith('application/json')) throw failure(415,'JSON required');
  let length=0;const parts=[];
  for await(const part of req) {length+=part.length;if(length>140000)throw failure(413,'Content too large');parts.push(part);}
  try{return JSON.parse(Buffer.concat(parts).toString());}catch{throw failure(400,'Invalid JSON');}
}
export function createApi({db,sendLogin,origin,production=true,readGallery,backupContent,readContentBackup}) {
  const respond=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
  async function rate(key,limit) {
    const hash=digest(key);
    await db.execute('INSERT INTO mm_rates(bucket,hits,expires_at) VALUES(?,1,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 1 HOUR)) ON DUPLICATE KEY UPDATE hits=IF(expires_at<=UTC_TIMESTAMP(),1,hits+1),expires_at=IF(expires_at<=UTC_TIMESTAMP(),DATE_ADD(UTC_TIMESTAMP(),INTERVAL 1 HOUR),expires_at)',[hash]);
    const [[row]]=await db.execute('SELECT hits FROM mm_rates WHERE bucket=?',[hash]);
    if(row.hits>limit)throw failure(429,'Bandykite vėliau.');
  }
  async function session(req) {
    const raw=readSession(req,production);if(!raw)return null;
    const [[row]]=await db.execute('SELECT s.email,s.csrf,e.user_id FROM mm_sessions s JOIN mm_editors e ON s.email=e.email AND e.active=TRUE WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP()',[digest(raw)]);
    return row?{...row,hash:digest(raw)}:null;
  }
  return async function api(req,res) {
    try {
      const path=new URL(req.url,origin).pathname;
      if(!['GET','HEAD'].includes(req.method))assertOrigin(req,origin);
      if(path==='/api/instagram'&&req.method==='GET') return respond(res,200,[await readGallery()]);
      if(path==='/api/content'&&req.method==='GET') {
        let row;
        try { [[row]]=await db.execute("SELECT content,revision FROM mm_content WHERE slug='main'"); }
        catch(error) { if(readContentBackup) return respond(res,200,await readContentBackup()); throw error; }
        if(!row)throw failure(503,'Content migration is not complete');
        return respond(res,200,{content:parseContent(row),revision:row.revision});
      }
      if(path==='/api/auth/login'&&req.method==='POST') {
        const input=await body(req);const email=String(input.email||'').trim().toLowerCase();
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw failure(400,'Invalid email');
        await rate('email:'+email,5);await rate('ip:'+req.socket.remoteAddress,100);
        const [[editor]]=await db.execute('SELECT email FROM mm_editors WHERE email=? AND active=TRUE',[email]);
        if(editor) {
          const raw=token();await db.execute('DELETE FROM mm_login WHERE email=? OR expires_at<=UTC_TIMESTAMP()',[email]);
          await db.execute('INSERT INTO mm_login(token_hash,email,expires_at) VALUES(?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 15 MINUTE))',[digest(raw),email]);
          try {await sendLogin(email,`${origin}/gabija/#login=${raw}`);}catch(error){await db.execute('DELETE FROM mm_login WHERE token_hash=?',[digest(raw)]);throw failure(503,'Laiško išsiųsti nepavyko. Bandykite vėliau.');}
        }
        return respond(res,200,{ok:true});
      }
      if(path==='/api/auth/verify'&&req.method==='POST') {
        await rate('verify:'+req.socket.remoteAddress,100);
        const input=await body(req);if(!validToken(input.token))throw failure(400,'Invalid token');
        const conn=await db.getConnection();let email;
        try {
          await conn.beginTransaction();
          const [[row]]=await conn.execute('SELECT l.email FROM mm_login l JOIN mm_editors e ON l.email=e.email AND e.active=TRUE WHERE token_hash=? AND expires_at>UTC_TIMESTAMP() FOR UPDATE',[digest(input.token)]);
          if(!row)throw failure(401,'Nuoroda nebegalioja. Paprašykite naujos.');
          email=row.email;await conn.execute('DELETE FROM mm_login WHERE token_hash=?',[digest(input.token)]);
          const raw=token(),csrf=token();
          await conn.execute('INSERT INTO mm_sessions(token_hash,csrf,email,expires_at) VALUES(?,?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 12 HOUR))',[digest(raw),csrf,email]);
          await conn.commit();res.setHeader('Set-Cookie',sessionCookie(raw,production));
        }catch(error){await conn.rollback();throw error;}finally{conn.release();}
        return respond(res,200,{ok:true});
      }
      const current=await session(req);
      if(path==='/api/auth/session'&&req.method==='GET') return respond(res,200,current?{user:{id:current.user_id,email:current.email},csrf:current.csrf}: {user:null});
      if(!current)throw failure(401,'Prisijunkite iš naujo.');
      if(req.method!=='GET'&&!equalToken(req.headers['x-csrf-token'],current.csrf))throw failure(403,'Invalid CSRF token');
      if(path==='/api/auth/logout'&&req.method==='POST') {
        await db.execute('DELETE FROM mm_sessions WHERE token_hash=?',[current.hash]);res.setHeader('Set-Cookie',sessionCookie('',production,true));return respond(res,200,{ok:true});
      }
      if(path==='/api/content'&&req.method==='PUT') {
        const input=await body(req);if(!Number.isSafeInteger(input.revision)||input.revision<0)throw failure(400,'Invalid revision');
        const value=validateEdits(input.content);const serialized=JSON.stringify(value);
        const conn=await db.getConnection();
        try {
          await conn.beginTransaction();
          const [[old]]=await conn.execute("SELECT content,revision FROM mm_content WHERE slug='main' FOR UPDATE");
          if(!old||old.revision!==input.revision)throw failure(409,'Kitas redaktorius jau pakeitė tekstus. Perkraukite puslapį.');
          await conn.execute('INSERT INTO mm_content_history(content,revision,editor) VALUES(?,?,?)',[JSON.stringify(parseContent(old)),old.revision,current.email]);
          await conn.execute("UPDATE mm_content SET content=?,revision=revision+1 WHERE slug='main'",[serialized]);await conn.commit();
        }catch(error){await conn.rollback();throw error;}finally{conn.release();}
        if(backupContent)await backupContent(value,input.revision+1).catch(()=>console.warn('Content published; disk backup needs attention.'));
        return respond(res,200,{revision:input.revision+1});
      }
      throw failure(404,'Not found');
    }catch(error){respond(res,error.status||503,{error:error.status?error.message:'Paslauga laikinai nepasiekiama.'});}
  };
}
