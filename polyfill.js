console.log( 'polyfill' );

var source = '(' + function () {

	'use strict';

	var ViveData = {
		name: 'Emulated HTC Vive DVT',
		resolution: { width: 1512, height: 1680 },
		features: { canPresent: true, hasExternalDisplay: false, hasOrientation: true, hasPosition: true },
		leftEye: { offset: -0.032, up: 41.653, down: 48.008, left: 43.977, right: 35.575 },
		rightEye: { offset: 0.032, up: 41.653, down: 48.008, left: 35.575, right: 43.977 }
	}

	var RiftData = {
		name: 'Emulated Oculus Rift CV1',
		resolution: { width: 1332, height: 1586 },
		features: { canPresent: true, hasExternalDisplay: false, hasOrientation: true, hasPosition: true },
		leftEye: { offset: -0.032, up: 55.814, down: 55.728, left: 54.429, right: 51.288 },
		rightEye: { offset: 0.032, up: 55.687, down: 55.658, left: 51.110, right: 54.397 }
	}

	var CardboardData = {
		name: 'Emulated Google, Inc. Cardboard v1',
		resolution: { width: 960, height: 1080 },
		features: { canPresent: true, hasExternalDisplay: false, hasOrientation: true, hasPosition: false },
		leftEye: { offset: -0.030, up: 40, down: 40, left: 40, right: 40 },
		rightEye: { offset: 0.030, up: 40, down: 40, left: 40, right: 40 }
	}

	window.__extHMDPosition = new Float32Array( [ 0, 0, 0 ] );
	window.__extHMDOrientation = new Float32Array( [ 0, 0, 0, 1 ] );
	window.__extHMDResetPose = true;

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

		this.sittingToStandingTransform = new Float32Array( [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		] );

		this.sizeX = 5;
		this.sizeZ = 3;

	}

	function VRPose() {

		this.timestamp = startDate + ( performance.now() - startPerfNow );
		this.position = new Float32Array( [ 0, 0, 0 ] );
		this.linearVelocity = new Float32Array( [ 0, 0, 0 ] );
		this.linearAcceleration = null;
		this.orientation = new Float32Array( [ 0, 0, 0, 1 ] );
		this.angularVelocity = new Float32Array( [ 0, 0, 0 ] );
		this.angularAcceleration = null;

	}

	function VRFieldOfView() {

		this.upDegrees = 0;
		this.downDegrees = 0;
		this.leftDegrees = 0;
		this.rightDegrees = 0;

	}

	function VREyeParameters() {

		this.offset = new Float32Array( [ 0, 0, 0 ] );
		this.fieldOfView = new VRFieldOfView();
		this.renderWidth = 0;
		this.renderHeight = 0;

	}

	function VRDisplay( model ) {

		this.depthFar = 1000;
		this.depthNear = .1;
		this.displayId = 1;
		this.displayName = model.name;
		this.isConnected = true;
		this.isPresenting = false;

		this.stageParameters = new VRStageParameters();

		this.capabilities = new VRDisplayCapabilities();
		this.capabilities.canPresent = model.features.canPresent;
		this.capabilities.hasExternalDisplay = model.features.hasExternalDisplay;
		this.capabilities.hasOrientation = model.features.hasOrientation;
		this.capabilities.hasPosition = model.features.hasPosition;

		this.pose = new VRPose();

		this.leftEyeParameters = new VREyeParameters();
		this.leftEyeParameters.fieldOfView.upDegrees = model.leftEye.up;
		this.leftEyeParameters.fieldOfView.downDegrees = model.leftEye.down;
		this.leftEyeParameters.fieldOfView.leftDegrees = model.leftEye.left;
		this.leftEyeParameters.fieldOfView.rightDegrees = model.leftEye.right;
		this.leftEyeParameters.renderWidth = model.resolution.width;
		this.leftEyeParameters.renderHeight = model.resolution.height;
		this.leftEyeParameters.offset[ 0 ] = model.leftEye.offset;

		this.rightEyeParameters = new VREyeParameters();
		this.rightEyeParameters.fieldOfView.upDegrees = model.rightEye.up;
		this.rightEyeParameters.fieldOfView.downDegrees = model.rightEye.down;
		this.rightEyeParameters.fieldOfView.leftDegrees = model.rightEye.left;
		this.rightEyeParameters.fieldOfView.rightDegrees = model.rightEye.right;
		this.rightEyeParameters.renderWidth = model.resolution.width;
		this.rightEyeParameters.renderHeight = model.resolution.height;
		this.rightEyeParameters.offset[ 0 ] = model.rightEye.offset;

		window.__extHMDResetPose = true;

	}

	VRDisplay.prototype.requestAnimationFrame = function( c ) {

		return requestAnimationFrame( c );

	}

	VRDisplay.prototype.cancelAnimationFrame = function(handle) {

		cancelAnimationFrame(handle);

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

		if( window.__extHMDOrientation ) {

			this.pose.orientation[ 0 ] = __extHMDOrientation[ 0 ];
			this.pose.orientation[ 1 ] = __extHMDOrientation[ 1 ];
			this.pose.orientation[ 2 ] = __extHMDOrientation[ 2 ];
			this.pose.orientation[ 3 ] = __extHMDOrientation[ 3 ];

		}

		this.pose.timestamp = startDate + ( performance.now() - startPerfNow );

		return this.pose;

	}

	VRDisplay.prototype.requestPresent = function() {

		return new Promise( function( resolve, reject ) {

			this.isPresenting = true;

			var event = document.createEvent('Event');
			event.initEvent('vrdisplaypresentchange', false, false);
			window.dispatchEvent(event);

			resolve();

		}.bind( this ) );

	}

	VRDisplay.prototype.exitPresent = function() {

		return new Promise( function( resolve, reject ) {

			this.isPresenting = false;

			var event = document.createEvent('Event');
			event.initEvent('vrdisplaypresentchange', false, false);
			window.dispatchEvent(event);

			resolve();

		}.bind( this ) );

	}

	VRDisplay.prototype.submitFrame = function( pose ) {
	}

	VRDisplay.prototype.resetPose = function() {

		window.__extHMDPosition = new Float32Array( [ 0, 0, 0 ] );
		window.__extHMDOrientation = new Float32Array( [ 0, 0, 0, 1 ] );
		window.__extHMDResetPose = true;

	}

	window.VRDisplay = VRDisplay;

	navigator.getVRDisplays = function() {

		return new Promise( function( resolve, reject ) {

			resolve( [ new VRDisplay( ViveData ) ] );

		} );

	}

	// LEGACY

	function HMDVRDevice( model ) {

		this.deviceName = model.name;

		this.leftEyeParameters = new VREyeParameters();
		this.leftEyeParameters.fieldOfView.upDegrees = model.leftEye.up;
		this.leftEyeParameters.fieldOfView.downDegrees = model.leftEye.down;
		this.leftEyeParameters.fieldOfView.leftDegrees = model.leftEye.left;
		this.leftEyeParameters.fieldOfView.rightDegrees = model.leftEye.right;
		this.leftEyeParameters.renderWidth = model.resolution.width;
		this.leftEyeParameters.renderHeight = model.resolution.height;
		this.leftEyeParameters.offset[ 0 ] = model.leftEye.offset;

		this.rightEyeParameters = new VREyeParameters();
		this.rightEyeParameters.fieldOfView.upDegrees = model.rightEye.up;
		this.rightEyeParameters.fieldOfView.downDegrees = model.rightEye.down;
		this.rightEyeParameters.fieldOfView.leftDegrees = model.rightEye.left;
		this.rightEyeParameters.fieldOfView.rightDegrees = model.rightEye.right;
		this.rightEyeParameters.renderWidth = model.resolution.width;
		this.rightEyeParameters.renderHeight = model.resolution.height;
		this.rightEyeParameters.offset[ 0 ] = model.rightEye.offset;

		this.leftRecommendedFOV = new VREyeParameters();
		this.leftRecommendedFOV.fieldOfView.upDegrees = model.leftEye.up;
		this.leftRecommendedFOV.fieldOfView.downDegrees = model.leftEye.down;
		this.leftRecommendedFOV.fieldOfView.leftDegrees = model.leftEye.left;
		this.leftRecommendedFOV.fieldOfView.rightDegrees = model.leftEye.right;
		this.leftRecommendedFOV.renderWidth = model.resolution.width;
		this.leftRecommendedFOV.renderHeight = model.resolution.height;
		this.leftRecommendedFOV.offset[ 0 ] = model.leftEye.offset;

		this.rightRecommendedFOV = new VREyeParameters();
		this.rightRecommendedFOV.fieldOfView.upDegrees = model.rightEye.up;
		this.rightRecommendedFOV.fieldOfView.downDegrees = model.rightEye.down;
		this.rightRecommendedFOV.fieldOfView.leftDegrees = model.rightEye.left;
		this.rightRecommendedFOV.fieldOfView.rightDegrees = model.rightEye.right;
		this.rightRecommendedFOV.renderWidth = model.resolution.width;
		this.rightRecommendedFOV.renderHeight = model.resolution.height;
		this.rightRecommendedFOV.offset[ 0 ] = model.rightEye.offset;

		window.__extHMDResetPose = true;

	}

	HMDVRDevice.prototype.getEyeTranslation = function( eye ) {

		return 3;

	}

	HMDVRDevice.prototype.getRecommendedEyeFieldOfView = function( eye ) {

		if( eye === 'left' ) return this.leftRecommendedFOV;
		return this.rightRecommendedFOV;

	}

	function VRFieldOfView() {

		this.upDegrees = 0;
		this.downDegrees = 0;
		this.leftDegrees = 0;
		this.rightDegrees = 0;

	}

	function VREyeParameters() {

		this.eyeTranslation = 0;
		this.recommendedFieldOfView = new VRFieldOfView();
		this.offset = new Float32Array( [ 0, 0, 0 ] );
		this.fieldOfView = new VRFieldOfView();
		this.renderWidth = 0;
		this.renderHeight = 0;

	}

	HMDVRDevice.prototype.getEyeParameters = function( eye ) {

		if( eye === 'left' ) return this.leftEyeParameters;
		return this.rightEyeParameters;

	}

	function PositionSensorVRDevice( model ) {

		this.deviceName = model.name;

		this.state = new VRPositionState();

	}

	function VRPositionState( model ) {

		this.angularAcceleration = new DOMPoint();
		this.angularVelocity = new DOMPoint();
		this.linearAcceleration = new DOMPoint();
		this.linearVelocity = new DOMPoint();
		this.orientation = new DOMPoint();
		this.position = new DOMPoint();
		this.timestamp = null;

		this.hasPosition = model.features.hasPosition;
		this.hasOrientation = model.features.hasOrientation;

	}

	function DOMPoint() {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.w = 0;
	}

	PositionSensorVRDevice.prototype.getState = function() {

		if( window.__extHMDPosition ) {

			this.state.linearVelocity.x = window.__extHMDPosition[ 0 ] - this.state.position.x;
			this.state.linearVelocity.y = window.__extHMDPosition[ 1 ] - this.state.position.y;
			this.state.linearVelocity.z = window.__extHMDPosition[ 2 ] - this.state.position.z;

			this.state.position.x = window.__extHMDPosition[ 0 ];
			this.state.position.y = window.__extHMDPosition[ 1 ];
			this.state.position.z = window.__extHMDPosition[ 2 ];
		}

		if( window.__extHMDOrientation ) {

			this.state.orientation.x = __extHMDOrientation[ 0 ];
			this.state.orientation.y = __extHMDOrientation[ 1 ];
			this.state.orientation.z = __extHMDOrientation[ 2 ];
			this.state.orientation.w = __extHMDOrientation[ 3 ];

		}

		this.state.timestamp = startDate + ( performance.now() - startPerfNow );

		return this.state;

	}

	window.HMDVRDevice = HMDVRDevice;
	window.PositionSensorVRDevice = PositionSensorVRDevice;

	navigator.getVRDevices = function() {

		return new Promise( function( resolve, reject ) {

			resolve( [ new HMDVRDevice( ViveData ), new PositionSensorVRDevice( ViveData ) ] );

		} );

	}

} + ')();';

var script = document.createElement('script');
script.textContent = source;
(document.head||document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

