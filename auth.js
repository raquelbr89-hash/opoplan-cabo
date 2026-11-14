import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-config.js';
const mount=document.getElementById('opoplan-auth');
const KEY='opoplan-cabo-local-v1';
const configured=/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(SUPABASE_URL.trim()) && SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_');
const style=document.createElement('style');style.textContent=`#opoplan-auth{margin:12px 0 18px;padding:14px;border:1px solid #cbd5d1;border-radius:12px;background:#f8faf9;color:#17372b}#opoplan-auth .auth-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px}#opoplan-auth input{min-width:160px;max-width:100%;padding:9px;border:1px solid #a9b9b1;border-radius:8px}#opoplan-auth button{padding:9px 12px;border:0;border-radius:8px;background:#123b2b;color:white;cursor:pointer}#opoplan-auth button:disabled{opacity:.55}#opoplan-auth small{display:block;margin-top:7px}#opoplan-auth .auth-error{color:#9b2525}#opoplan-auth .auth-warn{color:#8a5100}`;document.head.append(style);
const title=document.createElement('strong');title.textContent='Cuenta de OpoPlan · sincronización de pruebas';
const msg=document.createElement('div');msg.setAttribute('role','status');mount.append(title,msg);
const note=document.createElement('small');note.textContent='Los datos se conservan en este dispositivo. Los conflictos requieren confirmación.';mount.append(note);
const row=document.createElement('div');row.className='auth-row';mount.append(row);
const add=(tag,label,type)=>{const e=document.createElement(tag);if(tag==='button'){e.type='button';e.textContent=label;}else{e.type=type;e.placeholder=label;}row.append(e);return e;};
const email=add('input','Correo electrónico','email');const password=add('input','Contraseña','password');password.autocomplete='current-password';email.autocomplete='email';
const login=add('button','Entrar');const register=add('button','Crear cuenta');const logout=add('button','Cerrar sesión');const check=add('button','Sincronizar ahora');const useCloud=add('button','Usar copia de la nube');const useLocal=add('button','Enviar copia de este dispositivo');
const buttons=[login,register,logout,check,useCloud,useLocal];
const status=(s,kind='')=>{msg.textContent=s;msg.className=kind?'auth-'+kind:'';};
const setBusy=v=>buttons.forEach(b=>b.disabled=v);
const normalize=v=>JSON.stringify(v,(_,x)=>x && !Array.isArray(x) && typeof x==='object'?Object.fromEntries(Object.entries(x).sort(([a],[b])=>a.localeCompare(b))):x);
const local=()=>{const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw):null;};
const valid=d=>d&&Array.isArray(d.temas)&&d.temas.length===17&&Array.isArray(d.sesiones)&&Array.isArray(d.eventos)&&Array.isArray(d.categorias);
const backup=(d,tag)=>{const a=document.createElement('a');const u=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));a.href=u;a.download=`OpoPlan_respaldo_${tag}_${new Date().toISOString().replace(/[:.]/g,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(u),3000);};
let sb,user=null,working=false,mode='none',baseline=null,stamp=null,pendingTimer=null,needsRetry=false,applyingCloud=false;
const baselineKey=()=>`opoplan-sync-base-v1:${user.id}`;
const sessionKey=()=>`opoplan-sync-session-v1:${user.id}`;
const readSavedBase=()=>{for(const storage of [localStorage,sessionStorage]){try{const v=JSON.parse(storage.getItem(baselineKey())||'null');if(v&&typeof v.baseline==='string'&&typeof v.stamp==='string')return v;}catch(e){}}return null;};
const saveBase=(data,ts)=>{baseline=normalize(data);stamp=ts;const value=JSON.stringify({baseline,stamp});localStorage.setItem(baselineKey(),value);try{sessionStorage.setItem(baselineKey(),value);}catch(e){}};
const clearBase=()=>{baseline=null;stamp=null;};
const ui=()=>{const logged=!!user;[email,password,login,register].forEach(e=>e.hidden=logged);logout.hidden=!logged;check.hidden=!logged;useCloud.hidden=!(logged&&mode==='conflict');useLocal.hidden=!(logged&&mode==='conflict');};
const readRemote=async()=>{const {data,error}=await sb.from('opoplan_datos').select('datos,actualizado_en').eq('user_id',user.id).maybeSingle();if(error)throw error;return data;};
const applyCloud=d=>{applyingCloud=true;try{if(!valid(d))throw Error('Los datos de la nube no tienen el formato esperado.');if(typeof window.opoplanApplyCloudData!=='function')throw Error('La aplicación aún no está preparada.');window.opoplanApplyCloudData(d);}finally{applyingCloud=false;}};
const resolveConflict=(text='')=>{mode='conflict';window.opoplanOpenSettings?.();ui();status(`${text} Hay datos distintos en este dispositivo y en la nube. Elige qué copia conservar. Se descargará un respaldo antes de sustituir datos.`,'warn');};
async function synchronize(){
 if(!user||mode==='conflict'||!window.opoplanReady||!navigator.onLine)return;
 if(working){needsRetry=true;return;}
 working=true;setBusy(true);
 try{
  const here=local();if(!valid(here))throw Error('Datos locales no válidos; no se ha sincronizado.');
  const remote=await readRemote();
  if(!remote){mode='conflict';window.opoplanOpenSettings?.();ui();status('La nube está vacía. No se subirá nada automáticamente. Puedes elegir «Enviar copia de este dispositivo» tras comprobar tus datos.','warn');return;}
  if(!valid(remote.datos))throw Error('Copia de nube incompatible; no se ha cambiado nada.');
  const localStr=normalize(here),cloudStr=normalize(remote.datos);
  if(baseline===null){
   const stored=readSavedBase();
   if(stored&&typeof stored.baseline==='string'&&typeof stored.stamp==='string'){baseline=stored.baseline;stamp=stored.stamp;}
  }
  if(baseline===null){if(localStr===cloudStr){saveBase(remote.datos,remote.actualizado_en);mode='ready';status('Datos iguales en este dispositivo y la nube. Sincronización automática activa.');}else resolveConflict('No hay una referencia local fiable de la última sincronización:');return;}
  if(localStr===cloudStr){saveBase(remote.datos,remote.actualizado_en);mode='ready';status('Sincronizado. Los datos están actualizados.');return;}
  if(localStr===baseline){
   // A save may have happened while the cloud request was in flight. Never overwrite it.
   if(normalize(local())!==localStr){needsRetry=true;return;}
   backup(here,'antes_de_recibir_nube');applyCloud(remote.datos);saveBase(remote.datos,remote.actualizado_en);mode='ready';status('Cambios de la nube recibidos. Sincronización activa.');return;}
  if(cloudStr!==baseline){resolveConflict('Se han modificado datos en dos dispositivos:');return;}
  // Compare-and-swap atomically on the server: never overwrite newer remote data.
  if(normalize(local())!==localStr){needsRetry=true;return;}
  const {data,error}=await sb.rpc('opoplan_guardar_si_coincide',{p_esperado:stamp,p_datos:here});
  if(error)throw Error(`No se pudo guardar de forma segura (${error.message}). Comprueba que instalaste la función SQL incluida.`);
  if(!data?.guardado){resolveConflict('La nube cambió durante la subida:');return;}
  saveBase(here,data.actualizado_en);mode='ready';status('Cambios guardados en Supabase. Sincronización automática activa.');
 }catch(err){status('Sincronización pendiente: '+err.message,'warn');}
 finally{working=false;setBusy(false);ui();if(needsRetry){needsRetry=false;queueMicrotask(()=>synchronize());}}
}
async function choose(source){if(!user||working||!confirm(source==='cloud'?'Se descargará una copia de tus datos locales y después se sustituirán por los de Supabase. ¿Continuar?':'Se descargará una copia de los datos de Supabase y después se sustituirán por los de este dispositivo. ¿Continuar?'))return;
 working=true;setBusy(true);
 try{
  const remote=await readRemote(),here=local();if(!valid(here))throw Error('Datos locales no válidos.');
  if(source==='cloud'){
   if(!remote||!valid(remote.datos))throw Error('No existe una copia válida en la nube.');
   backup(here,'local_antes_de_reemplazar');applyCloud(remote.datos);saveBase(remote.datos,remote.actualizado_en);
  }else{
   if(remote){if(!valid(remote.datos))throw Error('Copia remota incompatible.');backup(remote.datos,'nube_antes_de_reemplazar');
    const {data,error}=await sb.rpc('opoplan_guardar_si_coincide',{p_esperado:remote.actualizado_en,p_datos:here});if(error)throw error;if(!data?.guardado)throw Error('La nube cambió; vuelve a comprobar antes de intentar subir.');saveBase(here,data.actualizado_en);
   }else{const {error}=await sb.from('opoplan_datos').insert({user_id:user.id,datos:here});if(error)throw error;const latest=await readRemote();saveBase(here,latest.actualizado_en);}
  }
  mode='ready';status('Copia elegida y sincronizada. Se ha descargado un respaldo de la copia sustituida.');
 }catch(err){mode='conflict';status('No se sustituyó nada: '+err.message,'warn');}
 finally{working=false;setBusy(false);ui();}
}
if(!configured){status('Configura Project URL y Publishable key en supabase-config.js.','error');ui();}
else try{
 const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2');sb=createClient(SUPABASE_URL.trim(),SUPABASE_PUBLISHABLE_KEY.trim(),{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const session=(await sb.auth.getSession()).data.session;
 const change=async s=>{const id=s?.user?.id;if(id!==user?.id){user=s?.user||null;clearBase();mode='none';if(user){const saved=readSavedBase();if(saved){baseline=saved.baseline;stamp=saved.stamp;}}}ui();if(user){if(mode!=='conflict')status('Cuenta conectada. Comprobando sincronización…');await synchronize();}else status('Sin sesión. Entra para sincronizar.');};
 await change(session);
 sb.auth.onAuthStateChange((_event,s)=>{queueMicrotask(()=>change(s));});
 login.onclick=async()=>{setBusy(true);const {error}=await sb.auth.signInWithPassword({email:email.value.trim(),password:password.value});if(error)status(error.message,'error');setBusy(false);};
 register.onclick=async()=>{setBusy(true);const {data,error}=await sb.auth.signUp({email:email.value.trim(),password:password.value});status(error?error.message:data.session?'Cuenta creada.':'Comprueba tu correo para confirmar la cuenta.',error?'error':'');setBusy(false);};
 logout.onclick=async()=>{setBusy(true);const {error}=await sb.auth.signOut();if(error)status(error.message,'error');setBusy(false);};
 check.onclick=()=>synchronize();useCloud.onclick=()=>choose('cloud');useLocal.onclick=()=>choose('local');
 window.addEventListener('opoplan-local-change',()=>{if(applyingCloud||!user||mode==='conflict')return;needsRetry=working||needsRetry;clearTimeout(pendingTimer);pendingTimer=setTimeout(synchronize,1500);});
 window.addEventListener('opoplan-ready',()=>synchronize());window.addEventListener('online',()=>synchronize());window.addEventListener('focus',()=>{if(!working)synchronize();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!working)synchronize();});setInterval(()=>{if(!document.hidden)synchronize();},20000);
}catch(err){status('No se pudo iniciar Supabase: '+err.message,'error');}
