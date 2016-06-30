var display = null;

var container = document.getElementById( 'canvas-container' );

var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
renderer.setPixelRatio( window.devicePixelRatio );
container.appendChild( renderer.domElement );

var scene = new THREE.Scene();
//var camera = new THREE.PerspectiveCamera( 75, 1, .01, 100 );
//camera.position.set( 1, 1, 1 );
var camera = new THREE.OrthographicCamera( 1 / - 2, 1 / 2, 1 / 2, 1 / - 2, - 5, 10 );
camera.position.set( 2, 2, 2 );
camera.lookAt( scene.position );

var room = new THREE.Mesh( new THREE.BoxGeometry( 5, 2, 3 ), new THREE.MeshNormalMaterial( { side: THREE.BackSide }) );
room.position.y = 1;
scene.add( room );

var hmd = new THREE.Mesh( new THREE.BoxGeometry( .20, .11, .12 ), new THREE.MeshNormalMaterial() );
scene.add( hmd );

var controls = new THREE.OrbitControls( camera, container );
controls.addEventListener( 'change', render );
controls.target.set( 0, 0, 0 ); 

var control = new THREE.TransformControls( camera, renderer.domElement );
control.addEventListener( 'change', render );
control.attach( hmd );
control.setSize( .5 );
scene.add( control );

function onWindowResize() {

    var w = container.clientWidth;
    var h = container.clientHeight;

    renderer.setSize( w, h );

    //camera.aspect = w / h;
    //camera.updateProjectionMatrix();

    camera.left = w / - 2;
    camera.right = w / 2;
    camera.top = h / 2;
    camera.bottom = h / - 2;

    camera.updateProjectionMatrix();

    render();

}

window.addEventListener( 'resize', onWindowResize );

function render() {

    var str = 'window.__extHMDResetPose';
    chrome.devtools.inspectedWindow.eval( str, function(result, isException) { 
        if( result === true ) {
            hmd.position.set( 0, 0,0 );
            hmd.quaternion.set( 0, 0, 0, 0 );
            var str = 'window.__extHMDResetPose = false;';
            chrome.devtools.inspectedWindow.eval( str );
        }
    } );
        
    control.update();

    var str = 'window.__extHMDPosition = [' + 
        hmd.position.x + ', ' +
        hmd.position.y + ', ' +
        hmd.position.z + '];';
    str += 'window.__extHMDOrientation = [' +
        hmd.quaternion.x + ', ' +
        hmd.quaternion.y + ', ' +
        hmd.quaternion.z + ', ' +
        hmd.quaternion.w + '];';
        
    chrome.devtools.inspectedWindow.eval( str, function(result, isException) { } );

    renderer.render( scene, camera );
   // requestAnimationFrame( render );

}

window.addEventListener( 'keydown', function ( event ) {

    switch ( event.keyCode ) {

        case 81: // Q
        control.setSpace( control.space === "local" ? "world" : "local" );
        break;

        case 17: // Ctrl
        control.setTranslationSnap( 100 );
        control.setRotationSnap( THREE.Math.degToRad( 15 ) );
        break;

        case 87: // W
        control.setMode( "translate" );
        break;

        case 69: // E
        control.setMode( "rotate" );
        break;

        case 82: // R
        control.setMode( "scale" );
        break;

        case 187:
        case 107: // +, =, num+
        control.setSize( control.size + 0.1 );
        break;

        case 189:
        case 109: // -, _, num-
        control.setSize( Math.max( control.size - 0.1, 0.1 ) );
        break;

    }

});


onWindowResize();
render();

