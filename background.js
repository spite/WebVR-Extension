var extensionId = chrome.runtime.id;
log( 'Background', extensionId );

var settings = {};
var script = '';

var defaultSettings = {

	persist: true

}

loadSettings().then( res => {
	settings = res;
	log( 'Script and settings loaded', settings );
} );

function notifyPose( msg ) {

	Object.keys( connections ).forEach( tab => {
		var port = connections[ tab ].contentScript;
		if( port ) port.postMessage( msg );
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

		if( name === 'panel' ) {
			switch( msg.action ) {
				case 'pose':
				notifyPose( msg );
				//connections[ tabId ].contentScript.postMessage( msg );
				break;
			}
		}
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
