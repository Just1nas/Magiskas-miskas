import {parseContent} from './database.js';
import {updateConfirmedEnglish} from '../src/confirmed-english.js';
// Transaction + revision history prevent a concurrent editor save from being lost.
export async function migrateConfirmedEnglish(db,backup) {
 const conn=await db.getConnection();let saved;
 try {
  await conn.beginTransaction();
  const [[row]]=await conn.execute("SELECT content,revision FROM mm_content WHERE slug='main' FOR UPDATE");
  if(row) {
   const before=parseContent(row),after=updateConfirmedEnglish(before);
   if(JSON.stringify(before)!==JSON.stringify(after)) {
    await conn.execute('INSERT INTO mm_content_history(content,revision,editor) VALUES(?,?,?)',[JSON.stringify(before),row.revision,'system:confirmed-english']);
    await conn.execute("UPDATE mm_content SET content=?,revision=revision+1 WHERE slug='main'",[JSON.stringify(after)]);
    saved={content:after,revision:row.revision+1};
   }
  }
  await conn.commit();
 }catch(error){await conn.rollback();throw error;}finally{conn.release();}
 if(saved&&backup)await backup(saved.content,saved.revision).catch(()=>console.warn('English copy saved; disk backup needs attention.'));
}
