self.addEventListener("install",function(){self.skipWaiting()});
self.addEventListener("activate",function(e){e.waitUntil(clients.claim())});
self.addEventListener("fetch",function(){});
self.addEventListener("push",function(e){
 var d={};try{d=e.data.json()}catch(x){}
 e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(function(l){
  var vis=l.some(function(c){return c.visibilityState==="visible"});
  return self.registration.showNotification(d.title||"Chatly",{body:d.body||"",tag:d.call?"call":"m"+(d.from||""),renotify:true,requireInteraction:!!d.call,silent:vis,
   vibrate:d.call?[500,200,500,200,500,200,500]:[200],data:d,icon:"icon-192.png",badge:"icon-192.png"}).then(function(){
    if(vis)return new Promise(function(r){setTimeout(function(){self.registration.getNotifications().then(function(n){n.forEach(function(x){x.close()});r()})},3000)})})}))});
self.addEventListener("notificationclick",function(e){var d=e.notification.data||{};e.notification.close();
 e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(function(l){
  for(var i=0;i<l.length;i++){if("focus" in l[i]){l[i].postMessage({open:d.from});return l[i].focus()}}
  return clients.openWindow("./?open="+encodeURIComponent(d.from||""))}))});
