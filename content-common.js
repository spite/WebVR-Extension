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

function injectScript( source ) {

	var script = document.createElement('script');
	script.textContent = source;
	(document.head||document.documentElement).appendChild(script);
	script.parentNode.removeChild(script);

}