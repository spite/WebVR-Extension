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

post( { action: 'script-ready' } );

var cloneInto = cloneInto || null;

function createCustomEvent(type, detail) {
	// Use cloneInto on Firefox (which prevents the security
	// sandbox from raising exception when the javascript
	// code in the webpage content is going to access to the
	// event properties).
	detail = cloneInto ? cloneInto(detail, window) : detail;
	return new CustomEvent( type, { detail });
}

port.onMessage.addListener( function( msg ) {

	switch( msg.action ) {
		case 'pose':
		var e = createCustomEvent( 'webvr-pose', {
			position: msg.position,
			rotation: msg.rotation
		} );
		window.dispatchEvent( e );
		break;
		case 'hmd-activate':
		var e = createCustomEvent( 'webvr-hmd-activate', {
			state: msg.value
		} );
		window.dispatchEvent( e );
		break;
		case 'hmd-tracking':
		var e = createCustomEvent( 'webvr-hmd-tracking', {
			source: msg.value
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
