import test from 'node:test';
import assert from 'node:assert/strict';
import {encodeDraft,decodeDraft,draftKey} from '../src/admin/draft.js';
import {editableDefaults} from '../src/editable-content.js';
test('draft preserves content and base revision without changing published defaults',()=>{const base=editableDefaults();const draft=structuredClone(base);draft.tagline='Draft only';const restored=decodeDraft(encodeDraft(draft,12));assert.equal(restored.content.tagline,'Draft only');assert.equal(restored.revision,12);assert.notEqual(base.tagline,'Draft only');assert.notEqual(draftKey('a'),draftKey('b'));});
test('malformed, oversized and invalid drafts are rejected',()=>{for(const raw of ['{','x'.repeat(150001),JSON.stringify({version:2}),JSON.stringify({version:1,revision:0,updatedAt:'now',content:{evil:'invalid'}})])assert.equal(decodeDraft(raw),null);});
