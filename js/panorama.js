//[simplified from threejs panorama video example]
//- http://threejs.org/examples/webgl_video_panorama_equirectangular.html
window.addEventListener("load", function () {
    "use strict";
    
    var w = 1440, h = 650;
    //[prepare screen]
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(w, h);
    var view = document.getElementById("view");
    view.appendChild(renderer.domElement);
    
    //[prepare controllable camera]
    var camera = new THREE.PerspectiveCamera(75, w / h, 1, 1000);
    camera.position.set(0, 0, 0);
    camera.up.set(0, 1, 0);
    camera.lookAt(new THREE.Vector3(0, 0, -1));
    
    var lon = 0;
    var lat = 0;
    var gyroMouse = function (ev) {
        var mx = ev.movementX || ev.mozMovementX || ev.webkitMovementX || 0;
        var my = ev.movementY || ev.mozMovementY || ev.webkitMovementY || 0;
        lat = Math.min(Math.max(-Math.PI / 2, lat - my * 0.01), Math.PI / 2);
        lon = lon - mx * 0.01;
        
        var rotm = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(lat, lon, 0, "YXZ"));
        camera.quaternion.copy(rotm);
    };
    view.addEventListener("mousedown", function (ev) {
        view.addEventListener("mousemove", gyroMouse, false);
    }, false);
    view.addEventListener("mouseup", function (ev) {
        view.removeEventListener("mousemove", gyroMouse, false);
    }, false);
    
    var texture = THREE.ImageUtils.loadTexture('img/panorama.jpg', new THREE.UVMapping(), function() {
        init();
    });
    //[panorama video texture]
    // (download) curl -O http://threejs.org/examples/textures/pano.webm
    var video = document.createElement("video");
    video.src = "img/pano.webm";
    video.crossOrigin = "anonymous"; // required for run on file:/
    video.autoplay = true;
    video.loop = true;
    var tex = new THREE.Texture(video);
    var mat = new THREE.MeshBasicMaterial({map: tex});
    
    function init() {
        renderer.setSize(w, h);
        onWindowResized(null);
    }
    function onWindowResized(event) {
       renderer.setSize(window.innerWidth, window.innerHeight);
    //    camera.projectionMatrix.makePerspective(fov, window.innerWidth / window.innerHeight, 1, 1100);
        // renderer.setSize(width, height);
        camera.projectionMatrix.makePerspective(fov, ratio, 1, 1100);
    }

    //[panorama space matched with the style of panorama image]
    var geom = new THREE.SphereGeometry(500, 32, 32); // sphere type
    //var geom = new THREE.SphereGeometry(
    //    500, 64, 32, 0, 2*Math.PI, 0, 0.5*Math.PI); // dome type
    //var geom = new THREE.CylinderGeometry(500, 500, 500, 64); // tube type
    geom.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1)); //surface inside
    
    var obj = new THREE.Mesh(geom, mat);
    
    //[create scene]
    var scene = new THREE.Scene();
    scene.add(obj);
    
    //[play animation]
    var loop = function loop() {
        //[important: video texture update]
        if(video.readyState === video.HAVE_ENOUGH_DATA) tex.needsUpdate = true;
        
        requestAnimationFrame(loop);
        renderer.clear();
        renderer.render(scene, camera);
    };
    loop();
}, false);
