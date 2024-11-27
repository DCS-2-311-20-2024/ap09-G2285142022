//
// 応用プログラミング 第9,10回 自由課題 (ap0901.js)
// G38400-2023 拓殖太郎
//
//障害物を避けるゲーム
"use strict"; // 厳格モード

// ライブラリをモジュールとして読み込む
import * as THREE from "three";
import { GUI } from "ili-gui";

// ３Ｄページ作成関数の定義
function init() {
  // 制御変数の定義
  const param = {
    axes: true, // 座標軸
  };

  // GUIコントローラの設定
  const gui = new GUI();
  gui.add(param, "axes").name("座標軸");

  // シーン作成
  const scene = new THREE.Scene();

  // 座標軸の設定
  const axes = new THREE.AxesHelper(18);
  scene.add(axes);

  // カメラの作成
  const camera = new THREE.PerspectiveCamera(
    50, window.innerWidth / window.innerHeight, 0.1, 1000
  );
  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);

  // レンダラの設定
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("output").appendChild(renderer.domElement);

  const textureLoader = new THREE.TextureLoader();
  const skyTexture = textureLoader.load("sky.ico", () => {
    scene.background = skyTexture;
  });

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 10),
    new THREE.MeshBasicMaterial({ color: 0x228b22 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const player = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x0000ff })
  );
  player.position.set(0, 0.5, 0);
  scene.add(player);

  // 描画関数
  function render() {
    // 座標軸の表示
    axes.visible = param.axes;
    // 描画
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  // 描画開始
  render();
}

init();