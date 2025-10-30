// firebase-messaging-sw.js
// 이 파일은 public 폴더 등 루트에 배치해야 합니다.

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

// 이 부분에 여러분의 Firebase Config 정보를 입력합니다.
const firebaseConfig = {
  // 환경 변수를 사용할 수 없으므로, 하드코딩하거나 빌드 시 대체해야 합니다.
  // 가장 안전한 방법은 VAPID 키가 등록된 상태에서 이 파일을 비워두거나
  // Firebase Hosting을 사용하는 경우 자동 생성된 파일을 사용하는 것입니다.
  // 또는 다음과 같이 최소한의 설정만 넣어줍니다.
  messagingSenderId: "1015527884228",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// 선택적: 백그라운드에서 알림을 수신했을 때의 처리 로직
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || "/images/favicon.png", // 적절한 아이콘 경로
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
