console.log( 'polyfill' );

var source = '(' + function () {

	'use strict';

	function VRDisplayCapabilities () {

		this.canPresent = true;
		this.hasExternalDisplay = true;
		this.hasOrientation = true;
		this.hasPosition = true;
		this.maxLayers = 1

	}

	function VRStageParameters() {

		this.sittingToStandingTransform = [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];
		this.sizeX = 10;
		this.sizeZ = 10;

	}

	function VRPose() {

		this.timestamp = null;
		this.position = [ 0, 0, 0 ];
		this.linearVelocity = 0;
		this.linearAcceleration = 0;
		this.orientation = [ 0, 0, 0, 0 ];
		this.angularVelocity = 0;
		this.angularAcceleration = 0;

	}

	function VREyeParameters() {

		this.offset = 0;
		this.fieldOfView = 90;
		this.renderWidth = 512;
		this.renderHeight = 512;

	}

	function VRDisplay() {

		this.depthFar = 1000;
		this.depthNear = .1;
		this.displayId = 1337;
		this.displayName = 'Emulated Vive';
		this.isConnected = true;
		this.isPresenting = false;
		
		this.stageParameters = new VRStageParameters();

		this.capabilities = new VRDisplayCapabilities();

		this.pose = new VRPose();
		window.__extHMDResetPose = true;

	}

	VRDisplay.prototype.requestAnimationFrame = function( c ) {

		requestAnimationFrame( c );

	}

	VRDisplay.prototype.getEyeParameters = function( id ) {

		var p = new VREyeParameters();
		p.offset = -256;
		if( id === 'right' ) p.offset = 256;
		return p;
		
	}

	VRDisplay.prototype.getPose = function() {

		if( window.__extHMDPosition ) this.pose.position = __extHMDPosition;
		if( window.__extHMDOrientation ) this.pose.orientation = __extHMDOrientation;

		return this.pose;

	}

	VRDisplay.prototype.requestPresent = function() {

		return new Promise( function( resolve, reject ) {

			this.isPresenting = true;
			resolve();

		}.bind( this ) );

	}

	VRDisplay.prototype.submitFrame = function( pose ) {
	}

	VRDisplay.prototype.resetPose = function() {

		window.__extHMDPosition = [ 0, 0, 0 ]
		window.__extHMDOrientation = [ 0, 0, 0, 0 ]
		window.__extHMDResetPose = true;

	}

	window.VRDisplay = VRDisplay;

	navigator.getVRDisplays = function() {

		return new Promise( function( resolve, reject ) {

			resolve( [ new VRDisplay() ] );

		} );

	}

} + ')();';

var script = document.createElement('script');
script.textContent = source;
(document.head||document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

