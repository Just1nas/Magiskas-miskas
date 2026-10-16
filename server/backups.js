import { readFile,mkdir,writeFile,rename } from 'node:fs/promises';
import { dirname,join } from 'node:path';
import { homedir } from 'node:os';
const file=process.env.MM_CONTENT_BACKUP||join(homedir(),'mm-data','published-content.json');
export async function backupContent(content,revision){
  await mkdir(dirname(file),{recursive:true});
  await writeFile(file+'.tmp',JSON.stringify({content,revision}),{mode:0o600});await rename(file+'.tmp',file);
}
export async function readContentBackup(){return JSON.parse(await readFile(file,'utf8'));}
