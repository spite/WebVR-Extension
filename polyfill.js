console.log( 'polyfill' );

var source = '(' + function () {

	'use strict';

	var startDate = Date.now();
	var startPerfNow = performance.now();

	function VRDisplayCapabilities () {

		this.canPresent = true;
		this.hasExternalDisplay = true;
		this.hasOrientation = true;
		this.hasPosition = true;
		this.maxLayers = 1

	}

	function VRStageParameters() {

		this.sittingToStandingTransform = new Float32Array( [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ] );
		this.sizeX = 5;
		this.sizeZ = 3;

	}

	function VRPose() {

		this.timestamp = startDate + ( performance.now() - startPerfNow );
		this.position = new Float32Array( [ 0, 0, 0 ] );
		this.linearVelocity = new Float32Array( [ 0, 0, 0 ] );
		this.linearAcceleration = null;
		this.orientation = new Float32Array( [ 0, 0, 0, 0 ] );
		this.angularVelocity = new Float32Array( [ 0, 0, 0 ] );
		this.angularAcceleration = null;

	}

	function VRFieldOfView() {

		this.upDegrees = 55.814;
		this.downDegrees = 55.728;
		this.leftDegrees = 54.429;
		this.rightDegrees = 51.288;

	}

	function VREyeParameters() {

		this.offset = new Float32Array( [ 0.032, 0, 0 ] );
		this.fieldOfView = new VRFieldOfView();
		this.renderWidth = 1512;
		this.renderHeight = 1680;

	}

	function VRDisplay() {

		this.depthFar = 1000;
		this.depthNear = .1;
		this.displayId = 1;
		this.displayName = 'Emulated HTC Vive DVT';
		this.isConnected = true;
		this.isPresenting = false;
		
		this.stageParameters = new VRStageParameters();

		this.capabilities = new VRDisplayCapabilities();

		this.pose = new VRPose();

		this.leftEyeParameters = new VREyeParameters();
		this.leftEyeParameters.offset[ 0 ] *= -1;

		this.rightEyeParameters = new VREyeParameters();
		this.rightEyeParameters.fieldOfView.upDegrees = 55.687;
		this.rightEyeParameters.fieldOfView.downDegrees = 55.658;
		this.rightEyeParameters.fieldOfView.leftDegrees = 51.110;
		this.rightEyeParameters.fieldOfView.rightDegrees = 54.397;
		
		window.__extHMDResetPose = true;

	}

	VRDisplay.prototype.requestAnimationFrame = function( c ) {

		requestAnimationFrame( c );

	}

	VRDisplay.prototype.getEyeParameters = function( id ) {

		if( id === 'left' ) return this.leftEyeParameters;
		return this.rightEyeParameters;
		
	}

	VRDisplay.prototype.getPose = function() {

		if( window.__extHMDPosition ) {
			
			this.pose.linearVelocity[ 0 ] = window.__extHMDPosition[ 0 ] - this.pose.position[ 0 ];
			this.pose.linearVelocity[ 1 ] = window.__extHMDPosition[ 1 ] - this.pose.position[ 1 ];
			this.pose.linearVelocity[ 2 ] = window.__extHMDPosition[ 2 ] - this.pose.position[ 2 ];
			
			this.pose.position[ 0 ] = window.__extHMDPosition[ 0 ];
			this.pose.position[ 1 ] = window.__extHMDPosition[ 1 ];
			this.pose.position[ 2 ] = window.__extHMDPosition[ 2 ];
		}

		if( window.__extHMDOrientation ) this.pose.orientation = new Float32Array( __extHMDOrientation );

		this.pose.timestamp = startDate + ( performance.now() - startPerfNow );

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

		window.__extHMDPosition = new Float32Array( [ 0, 0, 0 ] );
		window.__extHMDOrientation = new Float32Array( [ 0, 0, 0, 0 ] );
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

