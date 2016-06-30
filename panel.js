var display = null;

var positionSpans = [];
positionSpans[ 0 ] = document.getElementById( 'position-x' );
positionSpans[ 1 ] = document.getElementById( 'position-y' );
positionSpans[ 2 ] = document.getElementById( 'position-z' );

var orientationSpans = [];
orientationSpans[ 0 ] = document.getElementById( 'orientation-x' );
orientationSpans[ 1 ] = document.getElementById( 'orientation-y' );
orientationSpans[ 2 ] = document.getElementById( 'orientation-z' );
orientationSpans[ 3 ] = document.getElementById( 'orientation-w' );

var container = document.getElementById( 'canvas-container' );

var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
renderer.setPixelRatio( window.devicePixelRatio );
container.appendChild( renderer.domElement );

var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera( 1 / - 2, 1 / 2, 1 / 2, 1 / - 2, - 5, 10 );
camera.position.set( 2, 2, 2 );
camera.lookAt( scene.position );

var textureLoader = new THREE.TextureLoader();
var chaperoneTexture = textureLoader.load( 'assets/chaperone-texture.png', invalidate );
chaperoneTexture.wrapS = chaperoneTexture.wrapT = THREE.RepeatWrapping;

var roomGeometry = new THREE.BoxGeometry( 5, 2, 3 );

var size = .4;
var w = 5.2, d = 3.1, h = 2;
var sw = Math.round( 2 * w );
var sd = Math.round( 2 * d );
var sh = Math.round( 2 * h );
roomGeometry.faceVertexUvs[ 0 ][ 0 ][ 0 ].y = sh;
roomGeometry.faceVertexUvs[ 0 ][ 0 ][ 2 ].y = sh;
roomGeometry.faceVertexUvs[ 0 ][ 0 ][ 2 ].x = sd;

roomGeometry.faceVertexUvs[ 0 ][ 1 ][ 1 ].x = sd;
roomGeometry.faceVertexUvs[ 0 ][ 1 ][ 2 ].x = sd;
roomGeometry.faceVertexUvs[ 0 ][ 1 ][ 2 ].y = sh;

roomGeometry.faceVertexUvs[ 0 ][ 2 ][ 0 ].y = sh;
roomGeometry.faceVertexUvs[ 0 ][ 2 ][ 2 ].y = sh;
roomGeometry.faceVertexUvs[ 0 ][ 2 ][ 2 ].x = sd;

roomGeometry.faceVertexUvs[ 0 ][ 3 ][ 1 ].x = sd;
roomGeometry.faceVertexUvs[ 0 ][ 3 ][ 2 ].x = sd;
roomGeometry.faceVertexUvs[ 0 ][ 3 ][ 2 ].y = sh;

roomGeometry.faceVertexUvs[ 0 ][ 8 ][ 0 ].y = sh;
roomGeometry.faceVertexUvs[ 0 ][ 8 ][ 2 ].y = sh;
roomGeometry.faceVertexUvs[ 0 ][ 8 ][ 2 ].x = sw;

roomGeometry.faceVertexUvs[ 0 ][ 9 ][ 1 ].x = sw;
roomGeometry.faceVertexUvs[ 0 ][ 9 ][ 2 ].x = sw;
roomGeometry.faceVertexUvs[ 0 ][ 9 ][ 2 ].y = sh;

roomGeometry.faceVertexUvs[ 0 ][ 10 ][ 0 ].y = sh;
roomGeometry.faceVertexUvs[ 0 ][ 10 ][ 2 ].y = sh;
roomGeometry.faceVertexUvs[ 0 ][ 10 ][ 2 ].x = sw;

roomGeometry.faceVertexUvs[ 0 ][ 11 ][ 1 ].x = sw;
roomGeometry.faceVertexUvs[ 0 ][ 11 ][ 2 ].x = sw;
roomGeometry.faceVertexUvs[ 0 ][ 11 ][ 2 ].y = sh;

roomGeometry.uvsNeedUpdate = true;

var room = new THREE.Mesh( roomGeometry, new THREE.MeshBasicMaterial( { 
    map: chaperoneTexture, 
    side: THREE.BackSide,
    transparent: true
} ) );
room.position.y = 1;
room.renderOrder = -1;
scene.add( room );

var hmd = new THREE.Mesh( new THREE.BoxGeometry( .20, .11, .12 ), new THREE.MeshNormalMaterial() );
scene.add( hmd );

var invalidated = true;
function invalidate() {
    invalidated = true;
}

var controls = new THREE.OrbitControls( camera, container );
controls.addEventListener( 'change', invalidate );
controls.target.set( 0, 0, 0 ); 

var control = new THREE.TransformControls( camera, renderer.domElement );
control.addEventListener( 'change', invalidate );
control.attach( hmd );
control.setMode( "translate" );
control.setSpace( "local" );
scene.add( control );

function onWindowResize() {

    var w = container.clientWidth;
    var h = container.clientHeight;

    renderer.setSize( w, h );

    var a = w / h;
    w = 7;
    h = w / a;

    camera.left = w / - 2;
    camera.right = w / 2;
    camera.top = h / 2;
    camera.bottom = h / - 2;

    camera.updateProjectionMatrix();

    invalidate();

}

window.addEventListener( 'resize', onWindowResize );

function render() {

    var str = 'window.__extHMDResetPose';
    chrome.devtools.inspectedWindow.eval( str, function(result, isException) { 
        if( result === true ) {
            invalidate();
            hmd.position.set( 0, 0,0 );
            hmd.quaternion.set( 0, 0, 0, 0 );
            control.detach( hmd );
            control.attach( hmd );
            var str = 'window.__extHMDResetPose = false;';
            chrome.devtools.inspectedWindow.eval( str );
        }
    } );

    if( invalidated ) {

        positionSpans[ 0 ].textContent = hmd.position.x.toFixed( 2 );
        positionSpans[ 1 ].textContent = hmd.position.y.toFixed( 2 );
        positionSpans[ 2 ].textContent = hmd.position.z.toFixed( 2 );
        
        orientationSpans[ 0 ].textContent = hmd.quaternion.x.toFixed( 2 );
        orientationSpans[ 1 ].textContent = hmd.quaternion.y.toFixed( 2 );
        orientationSpans[ 2 ].textContent = hmd.quaternion.z.toFixed( 2 );
        orientationSpans[ 2 ].textContent = hmd.quaternion.w.toFixed( 2 );
        
        var str = 'window.__extHMDPosition = [' + 
            hmd.position.x + ', ' +
            hmd.position.y + ', ' +
            hmd.position.z + '];';
        str += 'window.__extHMDOrientation = [' +
            hmd.quaternion.x + ', ' +
            hmd.quaternion.y + ', ' +
            hmd.quaternion.z + ', ' +
            hmd.quaternion.w + '];';
            
        chrome.devtools.inspectedWindow.eval( str );

        control.scale.setScalar( 1.5 / camera.zoom );

        renderer.render( scene, camera );
        invalidated = false;
    }

    requestAnimationFrame( render );

}

window.addEventListener( 'keydown', function ( event ) {

    switch ( event.keyCode ) {

        case 81: // Q
        control.setSpace( control.space === "local" ? "world" : "local" );
        break;

        case 17: // Ctrl
        control.setTranslationSnap( 1 );
        control.setRotationSnap( THREE.Math.degToRad( 15 ) );
        break;

        case 87: // W
        control.setMode( "translate" );
        break;

        case 69: // E
        control.setMode( "rotate" );
        break;

        /*case 82: // R
        control.setMode( "scale" );
        break;*/

        case 187:
        case 107: // +, =, num+
        control.setSize( control.size + 0.01 );
        break;

        case 189:
        case 109: // -, _, num-
        control.setSize( Math.max( control.size - 0.01, 0.01 ) );
        break;

    }

});

onWindowResize();
render();
