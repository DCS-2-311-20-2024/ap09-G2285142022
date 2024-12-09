//
// 応用プログラミング 自由課題 ランナーゲーム (ap0901.js)
// G285142022 村田周哉
//
"use strict"; // 厳格モード

// ライブラリをモジュールとして読み込む
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
  // ゲームの設定をオブジェクトとして定義
  const game = {
    speed: 0.1, // ゲーム内の移動速度
    jumpPower: 0.2, // ジャンプの初速度
    gravity: -0.01, // 重力の設定
    isJumping: false, // プレイヤーがジャンプ中かどうか
    life: 3, // 残りライフ数
    score: 0, // 現在のスコア
    gameOver: false, // ゲームオーバーの状態
    axes: true, // 座標軸の表示設定
    isPaused: false, // ゲームの一時停止設定
  };

  // GUIを作成し、ゲーム設定をコントロール可能にする
  const gui = new GUI();
  gui.add(game, "axes").name("座標軸表示"); // 座標軸表示の設定
  gui.add(game, "speed", 0.05, 0.5, 0.01).name("ゲームスピード"); // ゲームスピードの調整
  gui.add(game, "isPaused").name("一時停止"); // 一時停止の設定

  // スコアとライフの状態を更新する関数
  function updateStatus() {
    document.getElementById("score").innerText = game.score; // スコアの更新
    document.getElementById("lives").innerText = game.life > 0 ? game.life : "0"; // 残りライフの更新
  }

  // シーンを作成
  const scene = new THREE.Scene();

  // 背景色を水色に設定
  scene.background = new THREE.Color(0x87CEEB);

  // 座標軸の設定
  const axes = new THREE.AxesHelper(18);
  scene.add(axes);

  // カメラを作成し、位置と視点を設定
  const camera = new THREE.PerspectiveCamera(
    75,window.innerWidth / window.innerHeight,0.1,1000);
  camera.position.set(0, 2, 5);
  camera.lookAt(0, 0, 0); 

  //レンダラの設定
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight); 
  document.body.appendChild(renderer.domElement); 

  // 地面を作成し、シーンに追加
  const groundGeometry = new THREE.PlaneGeometry(10, 50); // 地面のサイズ
  const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x228b22 }); // 地面の色
  const ground = new THREE.Mesh(groundGeometry, groundMaterial); // 地面のメッシュを作成
  ground.rotation.x = -Math.PI / 2; // 地面を水平に回転
  ground.position.z = -25; // 地面の位置を設定
  scene.add(ground);

  // プレイヤーロボットを作成し、シーンに追加
  const player = makeMetalRobot();
  player.scale.set(0.4, 0.4, 0.4); // プレイヤーのサイズを調整
  player.position.set(0, 0.4, 0); // プレイヤーの初期位置を設定
  scene.add(player);

  // 障害物を格納する配列を定義
  const obstacles = [];

  // 障害物を作成する関数
  function createObstacle(zPosition) {
    const obstacleGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5); // 障害物のサイズ
    const obstacleMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff }); // 障害物の色
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial); // 障害物のメッシュを作成
    obstacle.position.set(0, 0.25, zPosition); // 障害物の初期位置を設定
    obstacles.push(obstacle); // 障害物を配列に追加
    scene.add(obstacle); // 障害物をシーンに追加
  }

  // ライトを作成し、シーンに追加
  const light = new THREE.DirectionalLight(0xffffff, 1); // 光源を作成
  light.position.set(5, 5, 5); // ライトの位置を設定
  scene.add(light);

  // 光を作成し、シーンに追加
  const ambientLight = new THREE.AmbientLight(0x404040); // 光を作成
  scene.add(ambientLight);

  // 初期状態で複数の障害物を作成
  for (let i = 0; i < 10; i++) {
    createObstacle(-5 * (i + 1)); // 障害物を一定間隔で配置
  }

  // プレイヤーのジャンプ速度を定義
  let playerVelocityY = 0;

  // ジャンプ処理を行う関数
  function handleJump() {
    if (!game.isPaused && !game.isJumping && !game.gameOver) {
      game.isJumping = true; // ジャンプ状態を設定
      playerVelocityY = game.jumpPower; // ジャンプの初速度を設定
    }
  }

  // クリックイベントでジャンプを実行
  window.addEventListener("click", handleJump);

  // ゲームの状態を更新する関数
  function update() {
    if (game.isPaused || game.gameOver) return; // 一時停止またはゲームオーバーなら何もしない

    axes.visible = game.axes; // 座標軸の表示を設定

    // ジャンプ処理
    if (game.isJumping) {
      player.position.y += playerVelocityY; // ジャンプの移動
      playerVelocityY += game.gravity; // 重力を適用

      if (player.position.y <= 0.4) { // 地面に到達したら
        player.position.y = 0.4; // 地面の位置に戻す
        game.isJumping = false; // ジャンプ状態を解除
      }
    }

    // 障害物の移動とスコア更新
    obstacles.forEach((obstacle) => {
      obstacle.position.z += game.speed; // 障害物を手前に移動

      if (obstacle.position.z > 5) { // 障害物が画面を通過したら
        obstacle.position.z = -50; // 障害物を初期位置に戻す
        game.score++; // スコアを加算
        updateStatus(); // スコアを更新
      }

      // 衝突判定
      if (
    Math.abs(obstacle.position.z - player.position.z) < 0.5 && // Z軸の距離
    Math.abs(obstacle.position.y - player.position.y) < 0.5 // Y軸の距離
       ) {
        game.life--; // ライフを減少
        updateStatus(); // 状態を更新
        if (game.life <= 0) { // ライフが0になったら
          game.gameOver = true; // ゲームオーバー状態に設定
          document.getElementById("game-over").style.display = "block"; // ゲームオーバー画面を表示
        } else {
          obstacle.position.z = -50; // 衝突した障害物を初期位置に戻す
        }
      }
    });

    // カメラをプレイヤーに追従させる
    camera.position.z = player.position.z + 5; // プレイヤーの位置に合わせる
    camera.lookAt(player.position); // プレイヤーを注視
  }

  // 描画関数
  function render() {
    update(); // ゲーム状態を更新
  //描画
    renderer.render(scene, camera);
  //次のフレームでの描画要請
    requestAnimationFrame(render);
  }

  // 描画を開始
  render();
}

init();
//https://kuroeveryday.blogspot.com/2018/06/object-jumps-on-canvas.html?m=1 //ジャンプの処理と重力





