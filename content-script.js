var verbose = true;

function log() {

	if( !verbose ) return;

	console.log.apply(
		console, [
			`%c WebVREmu `,
			'background: #007AA3; color: #ffffff; text-shadow: 0 -1px #000; padding: 4px 0 4px 0; line-height: 0',
			...arguments
		]
	);

}

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

var source = '(' + injectedScript + ')();';

var script = document.createElement('script');
script.textContent = source;
(document.head||document.documentElement).appendChild(script);
script.parentNode.removeChild(script);
