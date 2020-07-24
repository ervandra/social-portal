
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const myPromise = new Promise(function(resolve, reject) {
    if(event.notification && event.notification.data) {
      self.clients.openWindow(event.notification.data);
    } else {
      self.clients.openWindow(`https://social.lifelearnplatform.com`)
    }
    resolve();
  });
  event.waitUntil(myPromise);
});

importScripts("https://www.gstatic.com/firebasejs/5.9.4/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/5.9.4/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyAtfjoIXUAv51YajA9rWTV-kq-2Gm5uAww",
  authDomain: "lifelearn-production.firebaseapp.com",
  databaseURL: "https://lifelearn-production.firebaseio.com",
  projectId: "lifelearn-production",
  storageBucket: "lifelearn-production.appspot.com",
  messagingSenderId: "473526365322",
  appId: "1:473526365322:web:e1e5ca48f79e37028c5173"
});

const messaging = firebase.messaging.isSupported() ? firebase.messaging() : null;

if (messaging) {
  messaging.setBackgroundMessageHandler(function (payload) {
    const promiseChain = clients
      .matchAll({
        type: "window",
        includeUncontrolled: true
      })
      .then(windowClients => {
        for (let i = 0; i < windowClients.length; i++) {
          const windowClient = windowClients[i];
          windowClient.postMessage(payload);
        }
      })
      .then(() => {
        const baseUrl = "https://social.lifelearnplatform.com";
        if(payload.data){
          const newLink = payload.data.targetType !== 'new_openquestion_block' ? `${baseUrl}/view/${payload.data.path_id}/${payload.data.contextId}` : `${baseUrl}/path/${payload.data.path_id}`;
          return registration.showNotification(payload.data.title, {
            body: payload.data.body,
            data: newLink
          })
        }
        return registration.showNotification(payload.notification.title, {
          body: payload.notification.body,
          data: baseUrl
        }); 
      });
    return promiseChain;
  });
};