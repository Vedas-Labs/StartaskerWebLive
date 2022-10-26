importScripts('https://www.gstatic.com/firebasejs/7.6.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.6.0/firebase-messaging.js');
firebase.initializeApp({
    apiKey: "AIzaSyB8Uz6KtnsFLSnqf8pnM0g19NxXV3PEGZ0",
    authDomain: "star-tasker-1576141277610.firebaseapp.com",
    databaseURL: "https://star-tasker-1576141277610.firebaseio.com",
    projectId: "star-tasker-1576141277610",
    storageBucket: "star-tasker-1576141277610.appspot.com",
    messagingSenderId: "10724526113",
    appId: "1:10724526113:web:acc3f646b08d489bcd7b60",
    measurementId: "G-9MLQBJYKB4"
});
 
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
    alert(payload.data.type);

    console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
    const notificationTitle = payload.data.title;
    const notificationOptions = {
      body: payload.data.body,
      icon: '/firebase-logo.png',
      data: payload.data
    };
  
    return self.registration.showNotification(notificationTitle,notificationOptions);
  });
  
  self.addEventListener('notificationclick', function (event) {
    event.notification.close();
  
    let navigateUrl = event.notification.data.click_action;
  
    event.waitUntil(
      clients.openWindow(navigateUrl)
    );
  });