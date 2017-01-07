function injectedScript() {

	'use strict';

	var ViveData = {
		name: 'Emulated HTC Vive DVT',
		resolution: { width: 1512, height: 1680 },
		features: { canPresent: true, hasExternalDisplay: true, hasOrientation: true, hasPosition: true },
		leftEye: { offset: -0.032, up: 41.653, down: 48.008, left: 43.977, right: 35.575 },
		rightEye: { offset: 0.032, up: 41.653, down: 48.008, left: 35.575, right: 43.977 }
	}

	var RiftData = {
		name: 'Emulated Oculus Rift CV1',
		resolution: { width: 1332, height: 1586 },
		features: { canPresent: true, hasExternalDisplay: true, hasOrientation: true, hasPosition: true },
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

	var startDate = Date.now();
	var startPerfNow = performance.now();

	// WebVR 1.0

	function EmulatedVRDisplayCapabilities () {

		this.canPresent = true;
		this.hasExternalDisplay = true;
		this.hasOrientation = true;
		this.hasPosition = true;
		this.maxLayers = 1

	}

	function EmulatedVRStageParameters() {

		this.sittingToStandingTransform = new Float32Array( [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		] );

		this.sizeX = 5;
		this.sizeZ = 3;

	}

	function EmulatedVRPose() {

		this.timestamp = startDate + ( performance.now() - startPerfNow );
		this.position = new Float32Array( [ 0, 0, 0 ] );
		this.linearVelocity = new Float32Array( [ 0, 0, 0 ] );
		this.linearAcceleration = null;
		this.orientation = new Float32Array( [ 0, 0, 0, 1 ] );
		this.angularVelocity = new Float32Array( [ 0, 0, 0 ] );
		this.angularAcceleration = null;

	}

	function EmulatedVRFieldOfView() {

		this.upDegrees = 0;
		this.downDegrees = 0;
		this.leftDegrees = 0;
		this.rightDegrees = 0;

	}

	function EmulatedVREyeParameters() {

		this.offset = new Float32Array( [ 0, 0, 0 ] );
		this.fieldOfView = new EmulatedVRFieldOfView();
		this.renderWidth = 0;
		this.renderHeight = 0;

	}

	function EmulatedVRLayer() {

		this.leftBounds = null;
		this.rightBounds = null;
		this.source = null;

	}

	function EmulatedVRFrameData() {

		this.leftProjectionMatrix = new Float32Array( 16 );
		this.leftViewMatrix = new Float32Array( 16 );
		this.rightProjectionMatrix = new Float32Array( 16 );
		this.rightViewMatrix = new Float32Array( 16 );
		this.pose = null;

	}

	// from webvr-polyfill

	var frameDataFromPose = (function() {

		var piOver180 = Math.PI / 180.0;
		var rad45 = Math.PI * 0.25;

		// Borrowed from glMatrix.
		function mat4_perspectiveFromFieldOfView(out, fov, near, far) {

			var upTan = Math.tan(fov ? (fov.upDegrees * piOver180) : rad45),
			downTan = Math.tan(fov ? (fov.downDegrees * piOver180) : rad45),
			leftTan = Math.tan(fov ? (fov.leftDegrees * piOver180) : rad45),
			rightTan = Math.tan(fov ? (fov.rightDegrees * piOver180) : rad45),
			xScale = 2.0 / (leftTan + rightTan),
			yScale = 2.0 / (upTan + downTan);

			out[0] = xScale;
			out[1] = 0.0;
			out[2] = 0.0;
			out[3] = 0.0;
			out[4] = 0.0;
			out[5] = yScale;
			out[6] = 0.0;
			out[7] = 0.0;
			out[8] = -((leftTan - rightTan) * xScale * 0.5);
			out[9] = ((upTan - downTan) * yScale * 0.5);
			out[10] = far / (near - far);
			out[11] = -1.0;
			out[12] = 0.0;
			out[13] = 0.0;
			out[14] = (far * near) / (near - far);
			out[15] = 0.0;
			return out;

		}

		function mat4_fromRotationTranslation(out, q, v) {

			// Quaternion math
			var x = q[0], y = q[1], z = q[2], w = q[3],
			x2 = x + x,
			y2 = y + y,
			z2 = z + z,

			xx = x * x2,
			xy = x * y2,
			xz = x * z2,
			yy = y * y2,
			yz = y * z2,
			zz = z * z2,
			wx = w * x2,
			wy = w * y2,
			wz = w * z2;

			out[0] = 1 - (yy + zz);
			out[1] = xy + wz;
			out[2] = xz - wy;
			out[3] = 0;
			out[4] = xy - wz;
			out[5] = 1 - (xx + zz);
			out[6] = yz + wx;
			out[7] = 0;
			out[8] = xz + wy;
			out[9] = yz - wx;
			out[10] = 1 - (xx + yy);
			out[11] = 0;
			out[12] = v[0];
			out[13] = v[1];
			out[14] = v[2];
			out[15] = 1;

			return out;

		};

		function mat4_translate(out, a, v) {

			var x = v[0], y = v[1], z = v[2],
			a00, a01, a02, a03,
			a10, a11, a12, a13,
			a20, a21, a22, a23;

			if (a === out) {
				out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
				out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
				out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
				out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
			} else {
				a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
				a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
				a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

				out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
				out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
				out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

				out[12] = a00 * x + a10 * y + a20 * z + a[12];
				out[13] = a01 * x + a11 * y + a21 * z + a[13];
				out[14] = a02 * x + a12 * y + a22 * z + a[14];
				out[15] = a03 * x + a13 * y + a23 * z + a[15];
			}

			return out;

		};

		function mat4_invert(out, a) {

			var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
			a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
			a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
			a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

			b00 = a00 * a11 - a01 * a10,
			b01 = a00 * a12 - a02 * a10,
			b02 = a00 * a13 - a03 * a10,
			b03 = a01 * a12 - a02 * a11,
			b04 = a01 * a13 - a03 * a11,
			b05 = a02 * a13 - a03 * a12,
			b06 = a20 * a31 - a21 * a30,
			b07 = a20 * a32 - a22 * a30,
			b08 = a20 * a33 - a23 * a30,
			b09 = a21 * a32 - a22 * a31,
			b10 = a21 * a33 - a23 * a31,
			b11 = a22 * a33 - a23 * a32,

			// Calculate the determinant
			det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

			if (!det) {
				return null;
			}
			det = 1.0 / det;

			out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
			out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
			out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
			out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
			out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
			out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
			out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
			out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
			out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
			out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
			out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
			out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
			out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
			out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
			out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
			out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

			return out;

		};

		var defaultOrientation = new Float32Array([0, 0, 0, 1]);
		var defaultPosition = new Float32Array([0, 0, 0]);

		function updateEyeMatrices(projection, view, pose, parameters, vrDisplay) {

			mat4_perspectiveFromFieldOfView(projection, parameters ? parameters.fieldOfView : null, vrDisplay.depthNear, vrDisplay.depthFar);

			var orientation = pose.orientation || defaultOrientation;
			var position = pose.position || defaultPosition;

			mat4_fromRotationTranslation(view, orientation, position);
			if (parameters)
				mat4_translate(view, view, parameters.offset);
			mat4_invert(view, view);

		}

		return function(frameData, pose, vrDisplay) {

			if (!frameData || !pose)
				return false;

			if( !( frameData instanceof EmulatedVRFrameData ) ) {
				frameData = new EmulatedVRFrameData();
			}

			frameData.pose = pose;
			frameData.timestamp = pose.timestamp;

			updateEyeMatrices(
				frameData.leftProjectionMatrix, frameData.leftViewMatrix,
				pose, vrDisplay.getEyeParameters("left"), vrDisplay);
			updateEyeMatrices(
				frameData.rightProjectionMatrix, frameData.rightViewMatrix,
				pose, vrDisplay.getEyeParameters("right"), vrDisplay);

			return true;

		};

	})();

	function createVRDisplayEvent( type, display, reason ) {

		var event = new CustomEvent( type );
		event.display = display;
		event.reason = reason;

		return event;

	}

	function EmulatedVRDisplay( model ) {

		this.depthFar = 1000;
		this.depthNear = .1;
		this.displayId = 1;
		this.displayName = model.name;
		this.isConnected = true;
		this.isPresenting = false;

		this.layers = [];

		this.stageParameters = new EmulatedVRStageParameters();

		this.capabilities = new EmulatedVRDisplayCapabilities();
		this.capabilities.canPresent = model.features.canPresent;
		this.capabilities.hasExternalDisplay = model.features.hasExternalDisplay;
		this.capabilities.hasOrientation = model.features.hasOrientation;
		this.capabilities.hasPosition = model.features.hasPosition;

		this.pose = new EmulatedVRPose();

		this.leftEyeParameters = new EmulatedVREyeParameters();
		this.leftEyeParameters.fieldOfView.upDegrees = model.leftEye.up;
		this.leftEyeParameters.fieldOfView.downDegrees = model.leftEye.down;
		this.leftEyeParameters.fieldOfView.leftDegrees = model.leftEye.left;
		this.leftEyeParameters.fieldOfView.rightDegrees = model.leftEye.right;
		this.leftEyeParameters.renderWidth = model.resolution.width;
		this.leftEyeParameters.renderHeight = model.resolution.height;
		this.leftEyeParameters.offset[ 0 ] = model.leftEye.offset;

		this.rightEyeParameters = new EmulatedVREyeParameters();
		this.rightEyeParameters.fieldOfView.upDegrees = model.rightEye.up;
		this.rightEyeParameters.fieldOfView.downDegrees = model.rightEye.down;
		this.rightEyeParameters.fieldOfView.leftDegrees = model.rightEye.left;
		this.rightEyeParameters.fieldOfView.rightDegrees = model.rightEye.right;
		this.rightEyeParameters.renderWidth = model.resolution.width;
		this.rightEyeParameters.renderHeight = model.resolution.height;
		this.rightEyeParameters.offset[ 0 ] = model.rightEye.offset;

		window.addEventListener( 'webvr-pose', function( e ) {

			this.pose.linearVelocity[ 0 ] = e.detail.position.x - this.pose.position[ 0 ];
			this.pose.linearVelocity[ 1 ] = e.detail.position.y - this.pose.position[ 1 ];
			this.pose.linearVelocity[ 2 ] = e.detail.position.z - this.pose.position[ 2 ];

			this.pose.position[ 0 ] = e.detail.position.x;
			this.pose.position[ 1 ] = e.detail.position.y;
			this.pose.position[ 2 ] = e.detail.position.z;

			this.pose.orientation[ 0 ] = e.detail.rotation.x;
			this.pose.orientation[ 1 ] = e.detail.rotation.y;
			this.pose.orientation[ 2 ] = e.detail.rotation.z;
			this.pose.orientation[ 3 ] = e.detail.rotation.w;

		}.bind( this ) );

		window.addEventListener( 'webvr-hmd-activate', function( e ) {

			if( e.detail.state ){
				var event = createVRDisplayEvent( 'vrdisplayactivate', this, 'HMD activated' );
				window.dispatchEvent(event);
			} else {
				var event = createVRDisplayEvent( 'vrdisplaydeactivate', this, 'HMD deactivated' );
				window.dispatchEvent(event);
			}

		}.bind( this ) );

	}

	EmulatedVRDisplay.prototype.requestAnimationFrame = function( c ) {

		return requestAnimationFrame( c );

	}

	EmulatedVRDisplay.prototype.cancelAnimationFrame = function(handle) {

		cancelAnimationFrame(handle);

	}

	EmulatedVRDisplay.prototype.getEyeParameters = function( id ) {

		if( id === 'left' ) return this.leftEyeParameters;
		return this.rightEyeParameters;

	}

	EmulatedVRDisplay.prototype.getPose = function() {

		this.pose.timestamp = startDate + ( performance.now() - startPerfNow );

		return this.pose;

	}

	EmulatedVRDisplay.prototype.getFrameData = function( frameData ){

		return frameDataFromPose( frameData, this.getPose(), this );

	}

	EmulatedVRDisplay.prototype.requestPresent = function(layers) {

		return new Promise( function( resolve, reject ) {

			this.isPresenting = true;

			this.layers = [];
			layers.forEach( function( l ) {
				var layer = new EmulatedVRLayer();
				layer.source = l.source;
				if( l.leftBounds ) layer.leftBounds = l.leftBounds;
				if( l.rightBounds ) layer.rightBounds = l.rightBounds;
				this.layers.push( layer );
			}.bind(this));

			var event = createVRDisplayEvent( 'vrdisplaypresentchange', this, 'Presenting requested' );
			window.dispatchEvent(event);

			resolve();

		}.bind( this ) );

	}

	EmulatedVRDisplay.prototype.exitPresent = function() {

		return new Promise( function( resolve, reject ) {

			this.isPresenting = false;

			this.layers = [];

			var event = createVRDisplayEvent( 'vrdisplaypresentchange', this, 'Presenting exited' );
			window.dispatchEvent(event);

			resolve();

		}.bind( this ) );

	}

	EmulatedVRDisplay.prototype.submitFrame = function( pose ) {
	}

	EmulatedVRDisplay.prototype.resetPose = function() {

		var event = new Event( 'webvr-resetpose' );
		window.dispatchEvent( event );

	}

	EmulatedVRDisplay.prototype.getLayers = function() {

		return this.layers;

	}

	var vrD = new EmulatedVRDisplay( ViveData )

	if( 'getVRDisplays' in navigator ) {

		var originalVRFrameData = window.VRFrameData;
		var originalGetFrameData = VRDisplay.prototype.getFrameData;
		VRDisplay.prototype.getFrameData = function( frameData ) {
			if( trackingSource === 'hmd' ) {
				var fD = new originalVRFrameData();
				originalGetFrameData.apply( this, [ fD ] );
				for( var j in frameData ) frameData[ j ] = fD[ j ];
			} else {
				vrD.getFrameData( frameData );
			}
		}

		window.VRFrameData = EmulatedVRFrameData;

		var originalGetVRDisplays = navigator.getVRDisplays;

		navigator.getVRDisplays = function() {

			return originalGetVRDisplays.apply( navigator ).then( res => { res.push( vrD ); return res; } );

		}

	} else {

		window.VRFrameData = EmulatedVRFrameData;
		window.VRDisplay = EmulatedVRDisplay;
		window.VRPose = EmulatedVRPose;

		navigator.getVRDisplays = function() {

			return new Promise( function( resolve, reject ) {

				resolve( [ vrD ] );

			} );

		}

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

		this.state = new VRPositionState( model );

		window.addEventListener( 'webvr-pose', function( e ) {

			this.state.linearVelocity.x = e.detail.position.x - this.state.position.x;
			this.state.linearVelocity.y = e.detail.position.y - this.state.position.y;
			this.state.linearVelocity.z = e.detail.position.z - this.state.position.z;

			this.state.position.x = e.detail.position.x;
			this.state.position.y = e.detail.position.y;
			this.state.position.z = e.detail.position.z;

			this.state.orientation.x = e.detail.rotation.x;
			this.state.orientation.y = e.detail.rotation.y;
			this.state.orientation.z = e.detail.rotation.z;
			this.state.orientation.w = e.detail.rotation.w;

		}.bind( this ) );

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

		this.state.timestamp = startDate + ( performance.now() - startPerfNow );

		return this.state;

	}

	window.HMDVRDevice = HMDVRDevice;
	window.PositionSensorVRDevice = PositionSensorVRDevice;

	( function() {

		var vrD = new HMDVRDevice( ViveData );
		var vrP = new PositionSensorVRDevice( ViveData );

		navigator.getVRDevices = function() {

			return new Promise( function( resolve, reject ) {

				resolve( [ vrD, vrP ] );

			} );

		}

	} )();

	var trackingSource = 'hmd';

	window.addEventListener( 'webvr-hmd-tracking', function( e ) {

		trackingSource = e.detail.source;

	} );

	var event = new Event( 'webvr-ready' );
	window.dispatchEvent( event );

}
