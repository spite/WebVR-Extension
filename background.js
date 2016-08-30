var extensionId = chrome.runtime.id;
log( 'Background', extensionId );

var settings = {};
var script = '';

var defaultSettings = {

	persist: true

}

loadSettings().then( res => {
	settings = res;
	//notifySettings();
	log( 'Script and settings loaded', settings );
} );

function notifySettings() {

	log( 'settings', settings );

	Object.keys( connections ).forEach( tab => {
		var port = connections[ tab ].devtools;
		port.postMessage( {
			action: 'settings',
			settings: settings
		} );
		inject( port );
	} );

}

var connections = {};

// Post back to Devtools from content
chrome.runtime.onMessage.addListener( function (message, sender, sendResponse) {

	//log( 'onMessage', message, sender );
	if ( sender.tab && connections[ sender.tab.id ] ) {
		var port = connections[ sender.tab.id ].devtools;
		port.postMessage( { action: 'fromScript', data: message } );
	}

	return true;

} );

chrome.runtime.onConnect.addListener( function( port ) {

	log( 'New connection (chrome.runtime.onConnect) from', port.name, port.sender.frameId, port );

	var name = port.name;

	function listener( msg, sender, reply ) {

		var tabId;

		if( msg.tabId ) tabId = msg.tabId
		else tabId = sender.sender.tab.id;

		if( !connections[ tabId ] ) connections[ tabId ] = {};
		connections[ tabId ][ name ] = port;

		//log( sender );
		log( 'port.onMessage', port.name, msg );

	}

	port.onMessage.addListener( listener );

	port.onDisconnect.addListener( function() {

		port.onMessage.removeListener( listener );

		log( name, 'disconnect (chrome.runtime.onDisconnect)' );

		Object.keys( connections ).forEach( c => {
			if( connections[ c ][ name ] === port ) {
				connections[ c ][ name ] = null;
				delete connections[ c ][ name ];
			}
			if ( Object.keys( connections[ c ] ).length === 0 ) {
				connections[ c ] = null;
				delete connections[ c ];
			}
		} )


	} );

	port.postMessage( { action: 'ack' } );

	return true;

});
