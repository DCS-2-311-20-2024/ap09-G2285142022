//
// 応用プログラミング 自由課題 ランナーゲーム (ap0901.js)
// G285142022 村田周哉
//
"use strict";//厳格モード

// Thライブラリをモジュールとして読み込む
import * as THREE from "three";
import GUI from "ili-gui"; 
// ロボット作成関数
function makeMetalRobot() {
  const metalRobot = new THREE.Group();
  const metalMaterial = new THREE.MeshPhongMaterial({
    color: 0x707777,
    shininess: 60,
    specular: 0x222222,
  });
  const redMaterial = new THREE.MeshBasicMaterial({ color: 0xc00000 });
  const legRad = 0.2;
  const legLen = 0.6;
  const legSep = 0.4;
  const bodyW = 0.6;
  const bodyH = 0.6;
  const bodyD = 0.4;
  const armRad = 0.1;
  const armLen = 0.7;
  const headRad = 0.3;
  const eyeRad = 0.05;
  const eyeSep = 0.2;
  const seg = 16;

  // 脚
  const legGeometry = new THREE.CylinderGeometry(legRad, legRad, legLen, seg);
  const legR = new THREE.Mesh(legGeometry, metalMaterial);
  legR.position.set(-legSep / 2, legLen / 2, 0);
  metalRobot.add(legR);

  const legL = new THREE.Mesh(legGeometry, metalMaterial);
  legL.position.set(legSep / 2, legLen / 2, 0);
  metalRobot.add(legL);

  // 胴体
  const bodyGeometry = new THREE.BoxGeometry(bodyW, bodyH, bodyD);
  const body = new THREE.Mesh(bodyGeometry, metalMaterial);
  body.position.y = legLen + bodyH / 2;
  metalRobot.add(body);

  // 頭
  const headGeometry = new THREE.SphereGeometry(headRad, seg, seg);
  const head = new THREE.Mesh(headGeometry, metalMaterial);
  head.position.y = legLen + bodyH + headRad;
  metalRobot.add(head);

  // 目
  const eyeGeometry = new THREE.CircleGeometry(eyeRad, seg);
  const eyeL = new THREE.Mesh(eyeGeometry, redMaterial);
  eyeL.position.set(-eyeSep / 2, headRad / 3, headRad - 0.05);
  head.add(eyeL);

  const eyeR = new THREE.Mesh(eyeGeometry, redMaterial);
  eyeR.position.set(eyeSep / 2, headRad / 3, headRad - 0.05);
  head.add(eyeR);

  // 腕
  const armGeometry = new THREE.CylinderGeometry(armRad, armRad, armLen, seg);
  const armR = new THREE.Mesh(armGeometry, metalMaterial);
  armR.position.set(-(bodyW / 2 + armRad), legLen + bodyH - armLen / 2, 0);
  metalRobot.add(armR);

  const armL = new THREE.Mesh(armGeometry, metalMaterial);
  armL.position.set(bodyW / 2 + armRad, legLen + bodyH - armLen / 2, 0);
  metalRobot.add(armL);

  return metalRobot;
}


function init() {
  const game = {
    speed: 0.1,
    jumpPower: 0.2,
    gravity: -0.01,
    isJumping: false,
    life: 3,
    score: 0,
    gameOver: false,
    axes: true,
    isPaused: false, 
  };


  const gui = new GUI();
  gui.add(game, "axes").name("座標軸表示");
  gui.add(game, "speed", 0.05, 0.5, 0.01).name("ゲームスピード");
  gui.add(game, "isPaused").name("一時停止"); 

  function updateStatus() {
    document.getElementById("score").innerText = game.score;
    document.getElementById("lives").innerText = game.life > 0 ? game.life : "0";
  }

  // シーンの作成
  const scene = new THREE.Scene();

  // 座標軸の作成
  const axes = new THREE.AxesHelper(5);
  scene.add(axes);

  // カメラの作成
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 2, 5);
  camera.lookAt(0, 1, 0);

  // レンダラの作成
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const groundGeometry = new THREE.PlaneGeometry(10, 50);
  const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x228b22 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.z = -25;
  scene.add(ground);

  const player = makeMetalRobot();
  player.scale.set(0.4, 0.4, 0.4);
  player.position.set(0, 0.4, 0); 
  scene.add(player);

  const obstacles = [];
  function createObstacle(zPosition) {
    const obstacleGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const obstacleMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacle.position.set(0, 0.25, zPosition);
    obstacles.push(obstacle);
    scene.add(obstacle);
  }


  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  for (let i = 0; i < 10; i++) {
    createObstacle(-5 * (i + 1));
  }

 
  let playerVelocityY = 0;

  function handleJump() {
    if (!game.isPaused && !game.isJumping && !game.gameOver) {
      game.isJumping = true;
      playerVelocityY = game.jumpPower;
    }
  }

  window.addEventListener("click", handleJump);


  function update() {
    if (game.isPaused || game.gameOver) return;

    axes.visible = game.axes;

    if (game.isJumping) {
      player.position.y += playerVelocityY;
      playerVelocityY += game.gravity;

      if (player.position.y <= 0.4) {
        player.position.y = 0.4;
        game.isJumping = false;
      }
    }

    obstacles.forEach((obstacle) => {
      obstacle.position.z += game.speed;

      if (obstacle.position.z > 5) {
        obstacle.position.z = -50;
        game.score++; 
        updateStatus();
      }

      // 衝突判定
      if (
        Math.abs(obstacle.position.z - player.position.z) < 0.5 &&
        Math.abs(obstacle.position.y - player.position.y) < 0.5
      ) {
        game.life--;
        updateStatus();
        if (game.life <= 0) {
          game.gameOver = true;
          document.getElementById("game-over").style.display = "block";
        } else {
          obstacle.position.z = -50; 
        }
      }
    });

  
    camera.position.z = player.position.z + 5;
    camera.lookAt(player.position);
  }

  // 描画関数
  function render() {
    update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

//描画開始
  render();
}

init();