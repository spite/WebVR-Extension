var port = chrome.runtime.connect( null, { name: `panel` } );
var tabId = chrome.devtools.inspectedWindow.tabId

function post( msg ) {

	msg.tabId = tabId;
	port.postMessage( msg );

}

var settings = {}
var display = null;

var positionSpans = [];
positionSpans[ 0 ] = ge( 'position-x' );
positionSpans[ 1 ] = ge( 'position-y' );
positionSpans[ 2 ] = ge( 'position-z' );

var orientationSpans = [];
orientationSpans[ 0 ] = ge( 'orientation-x' );
orientationSpans[ 1 ] = ge( 'orientation-y' );
orientationSpans[ 2 ] = ge( 'orientation-z' );
orientationSpans[ 3 ] = ge( 'orientation-w' );

var container = ge( 'canvas-container' );

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
control.addEventListener( 'change', onPoseChange );
control.attach( hmd );
control.setMode( 'translate' );
control.setSpace( 'local' );
scene.add( control );

function onPoseChange() {

	post( {
		action: 'pose',
		position: { x: hmd.position.x, y: hmd.position.y, z: hmd.position.z },
		rotation: { x: hmd.quaternion.x, y: hmd.quaternion.y, z: hmd.quaternion.z, w: hmd.quaternion.w }
	} );

	invalidate();

}

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

	if( invalidated ) {

		positionSpans[ 0 ].textContent = hmd.position.x.toFixed( 2 );
		positionSpans[ 1 ].textContent = hmd.position.y.toFixed( 2 );
		positionSpans[ 2 ].textContent = hmd.position.z.toFixed( 2 );

		orientationSpans[ 0 ].textContent = hmd.quaternion.x.toFixed( 2 );
		orientationSpans[ 1 ].textContent = hmd.quaternion.y.toFixed( 2 );
		orientationSpans[ 2 ].textContent = hmd.quaternion.z.toFixed( 2 );
		orientationSpans[ 2 ].textContent = hmd.quaternion.w.toFixed( 2 );

		control.scale.setScalar( 1.5 / camera.zoom );
		control.update();

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

window.updatePose = function( position, rotation ) {

	hmd.position.set( position.x, position.y, position.z );
	hmd.quaternion.set( rotation.x, rotation.y, rotation.z, rotation.w );
	control.update();
	invalidate();

}

ge( 'reset-room-btn' ).addEventListener( 'click', function() {

	camera.position.set( 2, 2, 2 );
	camera.lookAt( scene.position );
	controls.reset();
	controls.center.set( 0, 0, 0 );
	controls.zoom = 1;
	controls.update();

	invalidate();

} );

ge( 'reset-pose-btn' ).addEventListener( 'click', function() {

	post( { action: 'reset-pose' } );

} );

ge( 'save-pose-btn' ).addEventListener( 'click', function() {

	post( {
		action: 'save-pose',
		pose: {
			position: { x: hmd.position.x, y: hmd.position.y, z: hmd.position.z },
			rotation: { x: hmd.quaternion.x, y: hmd.quaternion.y, z: hmd.quaternion.z, w: hmd.quaternion.w }
		}
	} );

} );

function updateSettings( s ) {

	settings = s;
	ge( 'persist-pose-option' ).checked = settings.persist;
	ge( 'individual-pose-option' ).checked = settings.individualPose;

	while( ge( 'saved-poses' ).firstChild ) {
		ge( 'saved-poses' ).removeChild( ge( 'saved-poses' ).firstChild );
	}

	settings.poses.forEach( ( pose, i ) => {
		var p = document.createElement( 'p' );
		var op = document.createElement( 'span' );
		op.textContent = pose.name;
		op.addEventListener( 'click', function( e ) {
			updatePose( pose.position, pose.rotation );
			control.detach();
			control.attach( hmd );
			control.update();
			onPoseChange();
		} );
		/*var ren = document.createElement( 'span' );
		ren.textContent = 'Rename';
		ren.addEventListener( 'click', function( e ) {
		} );*/
		var del = document.createElement( 'object' );
		del.className = 'remove-entry';
		del.setAttribute( 'type', 'image/svg+xml' );
		del.setAttribute( 'data', 'assets/delete.svg' );
		del.addEventListener( 'click', function( e ) {
			post( {
				action: 'remove-pose',
				id: i
			} );
			e.stopPropagation();
			e.preventDefault();
			return false;
		} );
		p.appendChild( op );
		//p.appendChild( ren );
		p.appendChild( del );
		ge( 'saved-poses' ).appendChild( p );
	})

}

ge( 'persist-pose-option' ).addEventListener( 'change', saveSettings );
ge( 'individual-pose-option' ).addEventListener( 'change', saveSettings );

function saveSettings() {

	settings.persist = ge( 'persist-pose-option' ).checked;
	settings.individualPose = ge( 'individual-pose-option' ).checked;

	post( { action: 'save-settings', settings: settings } );

}

ge( 'select-pose-btn' ).addEventListener( 'click', e => {
	ge( 'saved-poses' ).classList.toggle( 'collapsed' );
	e.stopPropagation();
	e.preventDefault();
	return false;
} );

ge( 'disclaimer' ).addEventListener( 'click', e => {
	ge( 'disclaimer-content' ).classList.toggle( 'collapsed' );
})

window.addEventListener( 'click', e => {

	ge( 'saved-poses' ).classList.add( 'collapsed' );

} );

onWindowResize();
render();
