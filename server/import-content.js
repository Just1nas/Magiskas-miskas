// Run on Hostinger with the protected export file path. Never expose this operation over HTTP.
import { backupContent } from './backups.js';
import { readFile } from 'node:fs/promises';
import { connectDatabase, schema } from './database.js';
import { validateEdits } from '../src/editable-content.js';
const input=JSON.parse(await readFile(process.argv[2],'utf8'));
if(!input.content || !Number.isSafeInteger(input.revision) || !Array.isArray(input.editors) || input.editors.length===0)throw new Error('A verified content + revision + editor export is required');
const content=validateEdits(input.content);
for(const editor of input.editors) if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editor.email)||!editor.user_id)throw new Error('Invalid editor');
const db=connectDatabase();await schema(db);const conn=await db.getConnection();
try {
  await conn.beginTransaction();
  const [[old]]=await conn.execute("SELECT revision FROM mm_content WHERE slug='main' FOR UPDATE");
  if(old)throw new Error('Content already imported; refusing to overwrite it');
  await conn.execute('INSERT INTO mm_content(slug,content,revision) VALUES(?,?,?)',['main',JSON.stringify(content),input.revision]);
  for(const editor of input.editors)await conn.execute('INSERT INTO mm_editors(email,user_id) VALUES(?,?)',[editor.email.trim().toLowerCase(),editor.user_id]);
  await conn.commit();await backupContent(content,input.revision);console.log(`Imported revision ${input.revision}; ${input.editors.length} editors.`);
}catch(error){await conn.rollback();throw error;}finally{conn.release();await db.end();}
