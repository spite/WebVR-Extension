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

} );

function initialise( panel ) {

	panel.onShown.addListener( function ( wnd ) {

		wnd.notifyPose = notifyPose

	} );

}

function notifyPose( position, rotation ) {

	//chrome.devtools.inspectedWindow.eval( 'console.log(' + JSON.stringify( position ) + ', ' + JSON.stringify( rotation ) + ')' );
	var str = 'function __set( wnd ){' +
    'wnd.__extHMDPosition = [' +
        position.x + ', ' +
        position.y + ', ' +
        position.z + '];' +
    'wnd.__extHMDOrientation = [' +
        rotation.x + ', ' +
        rotation.y + ', ' +
        rotation.z + ', ' +
        rotation.w + '];' +
    '}; __set( window ); [].forEach.call( window.document.querySelectorAll( \'iframe\' ), function( w ) { __set( w.contentWindow ) } );';

    chrome.devtools.inspectedWindow.eval( str );

}

