import { validateEdits } from '../editable-content.js';
export const draftKey = user => `mm-editor-draft-v1:${user}`;
export function encodeDraft(content, revision) {
  return JSON.stringify({version:1,content:validateEdits(content),revision,updatedAt:new Date().toISOString()});
}
export function decodeDraft(raw) {
  if(!raw||raw.length>150000)return null;
  try {const d=JSON.parse(raw);if(d.version!==1||!Number.isInteger(d.revision)||typeof d.updatedAt!=='string')return null;return {...d,content:validateEdits(d.content)};}catch{return null;}
}
