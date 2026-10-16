import published from './published-content.json' with {type:'json'};
import { validateEdits } from '../src/editable-content.js';
import { backupContent } from './backups.js';
// Explicit, private, one-time allowlist. Never create public signup or overwrite an existing CMS.
export async function bootstrapImport(db,rawEditors=process.env.MM_IMPORT_EDITORS) {
  if(!rawEditors)return;
  const editors=JSON.parse(rawEditors);
  if(!Array.isArray(editors)||!editors.length||editors.length>20)throw new Error('Invalid editor import');
  for(const e of editors)if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email)||!/^[-a-f0-9]{36}$/i.test(e.user_id))throw new Error('Invalid editor import');
  const content=validateEdits(published.content);const conn=await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[exists]]=await conn.execute("SELECT revision FROM mm_content WHERE slug='main' FOR UPDATE");
    if(exists){await conn.rollback();return;}
    await conn.execute('INSERT INTO mm_content(slug,content,revision) VALUES(?,?,?)',['main',JSON.stringify(content),published.revision]);
    for(const e of editors)await conn.execute('INSERT INTO mm_editors(email,user_id) VALUES(?,?)',[e.email.trim().toLowerCase(),e.user_id]);
    await conn.commit();await backupContent(content,published.revision);console.log('Verified published content and existing editors imported.');
  }catch(error){await conn.rollback();throw error;}finally{conn.release();}
}
