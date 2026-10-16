// Feature-gated until the content export, mail sender and Hostinger server have been verified.
export const hostingerCms = import.meta.env?.VITE_CMS_BACKEND === 'hostinger';
export const passwordSetupToken = hostingerCms && typeof location!=='undefined' ? new URLSearchParams(location.hash.slice(1)).get('setup') : null;
if(passwordSetupToken)history.replaceState(null,'',location.pathname+location.search);
let csrf='';
export async function cmsRequest(path, {method='GET',body,signal}={}) {
  const response=await fetch(`/api/${path}`,{method,signal,credentials:'same-origin',cache:'no-store',headers:{...(body?{'Content-Type':'application/json'}:{}),...(csrf?{'X-CSRF-Token':csrf}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const result=await response.json();
  if(!response.ok)throw Object.assign(new Error(result.error||'Paslauga nepasiekiama.'),{status:response.status});
  if(result.csrf)csrf=result.csrf;
  return result;
}
export const loadHostingerContent=signal=>cmsRequest('content',{signal});
export async function hostingerSession(){
  const params=new URLSearchParams(location.hash.slice(1));const token=params.get('login');
  if(token){history.replaceState(null,'',location.pathname+location.search);await cmsRequest('auth/verify',{method:'POST',body:{token}});}
  return cmsRequest('auth/session');
}
export function createHostingerClient() {
  const listeners=new Set();let current=null;
  const result=(data,error=null)=>({data,error});
  const notify=()=>listeners.forEach(callback=>callback('SIGNED_IN',current));
  return {
    auth:{
      async getSession(){try{const data=await hostingerSession();current=data.user?{user:data.user}:null;return result({session:current});}catch(error){return result({session:null},error);}},
      onAuthStateChange(callback){listeners.add(callback);return {data:{subscription:{unsubscribe:()=>listeners.delete(callback)}}};},
      async signInWithOtp({email}){try{await cmsRequest('auth/login',{method:'POST',body:{email}});return result(null);}catch(error){return result(null,error);}},
      async signInWithPassword({email,password,setupToken}){try{
        await cmsRequest(setupToken?'auth/setup':'auth/login',{method:'POST',body:setupToken?{token:setupToken,password}:{email,password}});
        const data=await hostingerSession();current=data.user?{user:data.user}:null;notify();return result({session:current});
      }catch(error){return result(null,error);}},
      async signOut(){try{await cmsRequest('auth/logout',{method:'POST',body:{}});current=null;notify();return result(null);}catch(error){return result(null,error);}},
    },
    from(table){
      const filters={};let update;
      const chain={select(){return chain;},eq(key,value){filters[key]=value;return chain;},update(value){update=value;return chain;},
        async single(){return chain.maybeSingle();},
        async maybeSingle(){try{
          if(table==='site_editors')return result(current?{user_id:current.user.id}:null);
          if(table!=='site_content')throw new Error('Unknown resource');
          if(update){const row=await cmsRequest('content',{method:'PUT',body:{content:update.content,revision:filters.revision}});return result(row);}
          return result(await loadHostingerContent());
        }catch(error){if(error.status===409)return result(null);return result(null,error);}},
      };return chain;
    },
  };
}
