log( 'Polyfill', window.location.toString() );

var port = chrome.runtime.connect( { name: 'contentScript' } );

function post( msg ) {

	port.postMessage( msg );

}

post( { method: 'script-ready' } );

port.onMessage.addListener( function( msg ) {

	switch( msg.action ) {
		case 'pose':
		var e = new CustomEvent( 'webvr-pose', {
			detail: {
				position: msg.position,
				rotation: msg.rotation
			}
		} );
		window.dispatchEvent( e );
		break;
		case 'hmd-activate':
		var e = new CustomEvent( 'webvr-hmd-activate', {
			detail: {
				state: msg.value
			}
		} );
		window.dispatchEvent( e );
		break;
	}

} );

window.addEventListener( 'webvr-ready', function() {

	post( { action: 'page-ready' } );

} );

window.addEventListener( 'webvr-resetpose', function() {

	post( { action: 'reset-pose' } );

} );

injectScript( '(' + injectUtils + ')();' + "\r\n" + '(' + injectedScript + ')();' );