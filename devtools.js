var verbose = false;

chrome.devtools.panels.create( "WebVR", "icon.png", "panel.html", initialise );

function log( ...args ) {

	if( !verbose ) return;

	var strArgs = [
		'"%c WebVREmu | DevTools "',
		'"background: #007AA3; color: #ffffff; text-shadow: 0 -1px #000; padding: 4px 0 4px 0; line-height: 0;"',
		...args.map( v => JSON.stringify( v ) )
	];

	chrome.devtools.inspectedWindow.eval(
		`console.log(${strArgs});`,
		( result, isException ) => { if( isException ) { console.log( result, isException ) } }
	);

}

log( 'Ready' );

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
		case 'settings':
		settings = msg.settings;
		if( panelWindow ) panelWindow.updateSettings( settings );
		break;
		case 'pose':
		if( panelWindow ) panelWindow.updatePose( msg.position, msg.rotation );
		break;
	}

} );

function initialise( panel ) {

	panel.onShown.addListener( function ( wnd ) {

		panelWindow = wnd;
		panelWindow.updateSettings( settings );

	} );

}
