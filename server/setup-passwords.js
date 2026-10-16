import { validToken } from './security.js';
// Provision each one-time setup capability once, never re-arm it after use/restarts.
export async function provisionPasswordSetup(db,raw=process.env.MM_SETUP_TOKENS){
  if(!raw)return;
  const entries=JSON.parse(raw);if(!Array.isArray(entries)||entries.length>20)throw new Error('Invalid setup import');
  for(const entry of entries){
    if(!validToken(entry.hash)||typeof entry.email!=='string')throw new Error('Invalid setup import');
    const conn=await db.getConnection();
    try{
      await conn.beginTransaction();
      const [[editor]]=await conn.execute('SELECT email FROM mm_editors WHERE email=? AND active=TRUE FOR UPDATE',[entry.email]);
      if(!editor)throw new Error('Unknown editor');
      const [insert]=await conn.execute('INSERT IGNORE INTO mm_setup_provisioned(token_hash) VALUES(?)',[entry.hash]);
      if(insert.affectedRows)await conn.execute('INSERT INTO mm_password_setup(token_hash,email,expires_at) VALUES(?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 24 HOUR))',[entry.hash,entry.email]);
      await conn.commit();
    }catch(error){await conn.rollback();throw error;}finally{conn.release();}
  }
}
