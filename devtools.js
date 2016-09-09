chrome.devtools.panels.create( "WebVR", "icon.png", "panel.html", initialise );

var port = chrome.runtime.connect( null, { name: `devtools` } );
var tabId = chrome.devtools.inspectedWindow.tabId

function post( msg ) {

	msg.tabId = tabId;
	port.postMessage( msg );

}

post( { action: 'start' } );

port.onDisconnect.addListener( function() {
	console.log( 'disconnect' );
} );

var settings = {};
var panelWindow = null;

port.onMessage.addListener( function( msg ) {

	switch( msg.action ) {
		case 'pose':
		if( panelWindow ) panelWindow.updatePose( msg.position, msg.rotation );
		break;
	}

} );

function initialise( panel ) {

	panel.onShown.addListener( function ( wnd ) {

		panelWindow = wnd;

	} );

}
