let handpose;
let video;
let hands = [];
let fistDetected = false; // 주먹 감지 여부
let victoryDetected = false; // 브이 감지 여부
let palmPoints = []; // 손바닥의 포인트들
let threshold = 50; // 주먹을 감지하기 위한 임계값
let lastPhotoTime = 0; // 마지막 사진 찍은 시간

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);

  handpose = ml5.handpose(video, modelReady);

  // 손 감지 이벤트 핸들러
  handpose.on("hand", results => {
    hands = results;
    detectGesture();
  });

  // 비디오를 숨김
  video.hide();
}

function modelReady() {
  console.log("Model ready!");
}

function draw() {
  image(video, 0, 0, width, height);
  drawKeypoints();
}

// 손바닥 포인트 그리기
function drawKeypoints() {
  for (let i = 0; i < hands.length; i++) {
    const landmarks = hands[i].landmarks;
    for (let j = 0; j < landmarks.length; j++) {
      const [x, y] = landmarks[j];
      fill(0, 255, 0);
      noStroke();
      ellipse(x, y, 10, 10);
    }
  }
}

// 주먹 또는 브이 감지
function detectGesture() {
  if (hands.length > 0) {
    const landmarks = hands[0].landmarks; // 첫 번째 손의 키포인트들

    // 손바닥 포인트를 찾기 위해 평균 y 좌표를 계산
    let sumY = 0;
    for (let i = 0; i < 5; i++) {
      sumY += landmarks[i][1]; // 손바닥 키포인트는 0에서 4까지의 인덱스를 가짐
    }
    const avgY = sumY / 5;

    // 손바닥 위의 모든 포인트들을 손바닥 포인트로 저장
    palmPoints = [];
    for (let i = 0; i < landmarks.length; i++) {
      if (landmarks[i][1] < avgY) {
        palmPoints.push(landmarks[i]);
      }
    }

    // 주먹을 감지하기 위해 손바닥 포인트들 간의 평균 거리를 계산
    let distSum = 0;
    for (let i = 0; i < palmPoints.length; i++) {
      for (let j = i + 1; j < palmPoints.length; j++) {
        const [x1, y1] = palmPoints[i];
        const [x2, y2] = palmPoints[j];
        const d = dist(x1, y1, x2, y2); // 두 점 사이의 거리 계산
        distSum += d;
      }
    }
    const avgDist = distSum / (palmPoints.length * (palmPoints.length - 1) / 2);

    // 임계값 이하로 거리가 가까워지면 주먹 또는 브이 감지
    if (avgDist < threshold) {
      if (!fistDetected) {
        fistDetected = true;
        a(); // 주먹 감지 시 함수 호출
      }
    } else {
      fistDetected = false;
    }

    // 브이를 감지하기 위한 추가 로직
    if (palmPoints.length === 14) {
      if (!victoryDetected) {
        victoryDetected = true;
        b(); // 브이 감지 시 함수 호출
      }
    } else {
      victoryDetected = false;
    }
  }
}

// 주먹 감지 시 실행될 함수
function a() {
  console.log("주먹 감지");
  const currentTime = millis(); // 현재 시간 가져오기
  if (currentTime - lastPhotoTime > 3000) { // 마지막 사진 찍은 시간과의 차이가 3초 이상인 경우에만 사진 찍기
    setTimeout(function() {
      saveCanvas('fist_detection', 'png');
    }, 5000);
    lastPhotoTime = currentTime; // 마지막 사진 찍은 시간 업데이트
  }
}

// 브이 감지 시 실행될 함수
function b() {
  console.log("브이 감지");
  window.close(); // 웹 페이지 닫기
}
