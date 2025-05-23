import { defined, Math as CesiumMath, getTimestamp, EventHelper, Transforms, SceneMode, Cartesian2, Cartesian3, Matrix4, BoundingSphere, HeadingPitchRange, knockout } from 'cesium/Cesium'
import loadView from '../core/loadView'
import ResetViewNavigationControl from './ResetViewNavigationControl'
import ZoomNavigationControl from './ZoomNavigationControl'
import svgCompassOuterRing from '../svgPaths/svgCompassOuterRing'
import svgCompassGyro from '../svgPaths/svgCompassGyro'
import svgCompassRotationMarker from '../svgPaths/svgCompassRotationMarker'
import Utils from '../core/Utils'
var Knockout = knockout;

var NavigationViewModel = function (options) {
  this.terria = options.terria
  this.eventHelper = new EventHelper()
  this.enableZoomControls = (defined(options.enableZoomControls)) ? options.enableZoomControls : true
  this.enableCompass = (defined(options.enableCompass)) ? options.enableCompass : true
  this.navigationLocked = false
  this.controls = options.controls
  if (!defined(this.controls)) {
    this.controls = [
      new ZoomNavigationControl(this.terria, true),
      new ResetViewNavigationControl(this.terria),
      new ZoomNavigationControl(this.terria, false)
    ]
  }

  this.svgCompassOuterRing = svgCompassOuterRing
  this.svgCompassGyro = svgCompassGyro
  this.svgCompassRotationMarker = svgCompassRotationMarker

  this.showCompass = defined(this.terria) && this.enableCompass
  this.heading = this.showCompass ? this.terria.scene.camera.heading : 0.0

  this.isOrbiting = false
  this.orbitCursorAngle = 0
  this.orbitCursorOpacity = 0.0
  this.orbitLastTimestamp = 0
  this.orbitFrame = undefined
  this.orbitIsLook = false
  this.orbitMouseMoveFunction = undefined
  this.orbitMouseUpFunction = undefined

  this.isRotating = false
  this.rotateInitialCursorAngle = undefined
  this.rotateFrame = undefined
  this.rotateIsLook = false
  this.rotateMouseMoveFunction = undefined
  this.rotateMouseUpFunction = undefined

  this._unsubcribeFromPostRender = undefined

  Knockout.track(this, ['controls', 'showCompass', 'heading', 'isOrbiting', 'orbitCursorAngle', 'isRotating'])

  var that = this

  NavigationViewModel.prototype.setNavigationLocked = function (locked) {
    this.navigationLocked = locked
    if (this.controls && this.controls.length > 1) {
      this.controls[1].setNavigationLocked(this.navigationLocked)
    }
  }

  function widgetChange() {
    if (defined(that.terria)) {
      if (that._unsubcribeFromPostRender) {
        that._unsubcribeFromPostRender()
        that._unsubcribeFromPostRender = undefined
      }

      that.showCompass = true && that.enableCompass

      that._unsubcribeFromPostRender = that.terria.scene.postRender.addEventListener(function () {
        that.heading = that.terria.scene.camera.heading
      })
    } else {
      if (that._unsubcribeFromPostRender) {
        that._unsubcribeFromPostRender()
        that._unsubcribeFromPostRender = undefined
      }
      that.showCompass = false
    }
  }

  this.eventHelper.add(this.terria.afterWidgetChanged, widgetChange, this)
  // this.terria.afterWidgetChanged.addEventListener(widgetChange);

  widgetChange()
}

NavigationViewModel.prototype.destroy = function () {
  this.eventHelper.removeAll()
}

NavigationViewModel.prototype.show = function (container) {
  const closeStr = '</div>'
  const divCloseStr = '>'
  const hiddenStr = ' style="display: none;"'
  const enableCompassOuterRing = this.terria.options.enableCompassOuterRing !== undefined ? this.terria.options.enableCompassOuterRing : true

  const compassPre = '<div class="compass"'
  const compassPreAfter = enableCompassOuterRing ? 'title="" data-bind="visible: showCompass, event: { mousedown: handleMouseDown,touchstart:handleMouseDown, dblclick: handleDoubleClick }">' : 'title="" data-bind="visible: showCompass">'
  const compassOuterRingBackground = '<div class="compass-outer-ring-background"></div>'

  const compassRotationMarkerPre = ' <div class="compass-rotation-marker" data-bind="visible: isOrbiting, style: { transform: \'rotate(-\' + orbitCursorAngle + \'rad)\', \'-webkit-transform\': \'rotate(-\' + orbitCursorAngle + \'rad)\', opacity: orbitCursorOpacity }'
  const compassRotationMarkerDefaultSvg = compassRotationMarkerPre + ', cesiumSvgPath: { path: svgCompassRotationMarker, width: 145, height: 145 }"' + divCloseStr
  const compassRotationMarkerSelf = compassRotationMarkerPre + '"' + divCloseStr + this.terria.options.compassRotationMarkerSvg //self define svg
  const compassRotationMarker = (this.terria.options.compassRotationMarkerSvg ? compassRotationMarkerSelf : compassRotationMarkerDefaultSvg) + closeStr

  const compassOuterRingPre = ' <div class="compass-outer-ring" title="" data-bind="style: { transform: \'rotate(-\' + heading + \'rad)\', \'-webkit-transform\': \'rotate(-\' + heading + \'rad)\' }'
  const compassOuterRingDefaultSvg = compassOuterRingPre + ', cesiumSvgPath: { path: svgCompassOuterRing, width: 145, height: 145 }"' + divCloseStr
  const compassOuterRingSelf = compassOuterRingPre + '"' + divCloseStr + this.terria.options.compassOuterRingSvg //self define svg
  const compassOuterRing = (this.terria.options.compassOuterRingSvg ? compassOuterRingSelf : compassOuterRingDefaultSvg) + closeStr


  const compassGyroBackground = ' <div class="compass-gyro-background"></div>'
  const compassGyroPre = ' <div class="compass-gyro" data-bind="css: { \'compass-gyro-active\': isOrbiting }'
  const compassGyroDefaultSvg = compassGyroPre + ',cesiumSvgPath: { path: svgCompassGyro, width: 145, height: 145 } "' + divCloseStr
  const compassGyroSelf = compassGyroPre + '"' + divCloseStr + this.terria.options.compassGyroSvg
  const compassGyro = (this.terria.options.compassGyroSvg ? compassGyroSelf : compassGyroDefaultSvg) + closeStr

  const compassDivPublicStr = compassPreAfter +
    compassOuterRingBackground +
    compassRotationMarker +
    compassOuterRing +
    compassGyroBackground +
    compassGyro +
    closeStr
  const compassDivStr = compassPre + compassDivPublicStr
  const compassDivHiddenStr = compassPre + hiddenStr + compassDivPublicStr

  const navigationControlsPre = '<div class="navigation-controls"'
  const resetSvg = this.terria.options.resetSvg
  const zoomInSvg = this.terria.options.zoomInSvg
  const zoomOutSvg = this.terria.options.zoomOutSvg


  const navigationControlsDivPublicStr = divCloseStr + '<!-- ko foreach: controls -->' +
    '<div data-bind="click: activate, attr: { title: $data.name }, css: $root.isLastControl($data) ? \'navigation-control-last\' : \'navigation-control\' ">' +
    '   <!-- ko if: $data.hasText -->' +
    '   <div data-bind="text: $data.text, css: $data.isActive ?  \'navigation-control-icon-active \' + $data.cssClass : $data.cssClass"></div>' +
    '   <!-- /ko -->' +
    '  <!-- ko ifnot: $data.hasText -->' +
    '  <!-- ko if: $data.svgIcon -->' +
    '  <div data-bind="cesiumSvgPath: { path: $data.svgIcon, width: $data.svgWidth, height: $data.svgHeight }, css: $data.isActive ?  \'navigation-control-icon-active \' + $data.cssClass : $data.cssClass"></div>' +
    '  <!-- /ko -->' +
    '  <!-- ko ifnot: $data.svgIcon -->' +

    '  <!-- ko if: $data.resetSvg -->' +
    '  <div class="navigation-control-icon-svg reset" onclick="'+this.terria.options.reset+'">' + resetSvg + '</div>' +
    '  <!-- /ko -->' +

    '  <!-- ko ifnot: $data.resetSvg -->' +
    '  <!-- ko if: $data.zoomInSvg -->' +
    '  <div class="navigation-control-icon-svg" zoomin>' + zoomInSvg + '</div>' +
    '  <!-- /ko -->' +

    '  <!-- ko ifnot: $data.zoomInSvg -->' +
    '  <!-- ko if: $data.zoomOutSvg -->' +
    '  <div class="navigation-control-icon-svg zoomout">' + zoomOutSvg + '</div>' +
    '  <!-- /ko -->' +
    '  <!-- /ko -->' +
    '  <!-- /ko -->' +

    '  <!-- /ko -->' +
    '  <!-- /ko -->' +
    ' </div>' +
    ' <!-- /ko -->' +
    closeStr

  const navigationControlsDivStr = navigationControlsPre + navigationControlsDivPublicStr
  const navigationControlsDivHiddenStr = navigationControlsPre + hiddenStr + divCloseStr + navigationControlsDivPublicStr

  const testing = (this.enableCompass ? compassDivStr : compassDivHiddenStr) + (this.enableZoomControls ? navigationControlsDivStr : navigationControlsDivHiddenStr)
  loadView(testing, container, this)
}

/**
 * Adds a control to this toolbar.
 * @param {NavControl} control The control to add.
 */
NavigationViewModel.prototype.add = function (control) {
  this.controls.push(control)
}

/**
 * Removes a control from this toolbar.
 * @param {NavControl} control The control to remove.
 */
NavigationViewModel.prototype.remove = function (control) {
  this.controls.remove(control)
}

/**
 * Checks if the control given is the last control in the control array.
 * @param {NavControl} control The control to remove.
 */
NavigationViewModel.prototype.isLastControl = function (control) {
  return (control === this.controls[this.controls.length - 1])
}

var vectorScratch = new Cartesian2()

const getClientXY = (e) => {
  let temp;
  if (e.touches) {
    temp = e.touches[0];
  } else {
    temp = e;
  }
  const { clientX, clientY } = temp;
  return { clientX, clientY }
}

NavigationViewModel.prototype.handleMouseDown = function (viewModel, e) {
  const { clientX, clientY } = getClientXY(e)
  var scene = this.terria.scene
  if (scene.mode === SceneMode.MORPHING) {
    return true
  }
  if (viewModel.navigationLocked) {
    return true
  }

  var compassElement = e.currentTarget
  var compassRectangle = e.currentTarget.getBoundingClientRect()
  var maxDistance = compassRectangle.width / 2.0
  var center = new Cartesian2((compassRectangle.right - compassRectangle.left) / 2.0, (compassRectangle.bottom - compassRectangle.top) / 2.0)
  var clickLocation = new Cartesian2(clientX - compassRectangle.left, clientY - compassRectangle.top)
  var vector = Cartesian2.subtract(clickLocation, center, vectorScratch)
  var distanceFromCenter = Cartesian2.magnitude(vector)

  var distanceFraction = distanceFromCenter / maxDistance

  var nominalTotalRadius = 145
  var norminalGyroRadius = 50

  if (distanceFraction < norminalGyroRadius / nominalTotalRadius) {
    orbit(this, compassElement, vector)
    //            return false;
  } else if (distanceFraction < 1.0) {
    rotate(this, compassElement, vector)
    //            return false;
  } else {
    return true
  }
}

var oldTransformScratch = new Matrix4()
var newTransformScratch = new Matrix4()
var centerScratch = new Cartesian3()

NavigationViewModel.prototype.handleDoubleClick = function (viewModel, e) {
  var scene = viewModel.terria.scene
  var camera = scene.camera

  var sscc = scene.screenSpaceCameraController

  if (scene.mode === SceneMode.MORPHING || !sscc.enableInputs) {
    return true
  }
  if (viewModel.navigationLocked) {
    return true
  }
  if (scene.mode === SceneMode.COLUMBUS_VIEW && !sscc.enableTranslate) {
    return
  }
  if (scene.mode === SceneMode.SCENE3D || scene.mode === SceneMode.COLUMBUS_VIEW) {
    if (!sscc.enableLook) {
      return
    }

    if (scene.mode === SceneMode.SCENE3D) {
      if (!sscc.enableRotate) {
        return
      }
    }
  }

  var center = Utils.getCameraFocus(viewModel.terria, true, centerScratch)

  if (!defined(center)) {
    // Globe is barely visible, so reset to home view.

    this.controls[1].resetView()
    return
  }

  var cameraPosition = scene.globe.ellipsoid.cartographicToCartesian(camera.positionCartographic, new Cartesian3())

  var surfaceNormal = scene.globe.ellipsoid.geodeticSurfaceNormal(center)

  var focusBoundingSphere = new BoundingSphere(center, 0)

  camera.flyToBoundingSphere(focusBoundingSphere, {
    offset: new HeadingPitchRange(0,
      // do not use camera.pitch since the pitch at the center/target is required
      CesiumMath.PI_OVER_TWO - Cartesian3.angleBetween(
        surfaceNormal,
        camera.directionWC
      ),
      // distanceToBoundingSphere returns wrong values when in 2D or Columbus view so do not use
      // camera.distanceToBoundingSphere(focusBoundingSphere)
      // instead calculate distance manually
      Cartesian3.distance(cameraPosition, center)
    ),
    duration: 1.5
  })
}

NavigationViewModel.create = function (options) {
  var result = new NavigationViewModel(options)
  result.show(options.container)
  return result
}
const addOrbitEventListener = (viewModel) => {
  document.addEventListener('mousemove', viewModel.orbitMouseMoveFunction, false)
  document.addEventListener('touchmove', viewModel.orbitMouseMoveFunction, false)

  document.addEventListener('mouseup', viewModel.orbitMouseUpFunction, false)
  document.addEventListener('touchend', viewModel.orbitMouseUpFunction, false)
}
const addRotateEventListener = (viewModel) => {
  document.addEventListener('mousemove', viewModel.rotateMouseMoveFunction, false)
  document.addEventListener('touchmove', viewModel.rotateMouseMoveFunction, false)

  document.addEventListener('mouseup', viewModel.rotateMouseUpFunction, false)
  document.addEventListener('touchend', viewModel.rotateMouseUpFunction, false)
}

const removeOrbitEventListener = (viewModel) => {
  document.removeEventListener('mousemove', viewModel.orbitMouseMoveFunction, false)
  document.removeEventListener('touchmove', viewModel.orbitMouseMoveFunction, false)

  document.removeEventListener('mouseup', viewModel.orbitMouseUpFunction, false)
  document.removeEventListener('touchend', viewModel.orbitMouseUpFunction, false)
}
const removeRotateEventListener = (viewModel) => {
  document.removeEventListener('mousemove', viewModel.rotateMouseMoveFunction, false)
  document.removeEventListener('touchmove', viewModel.rotateMouseMoveFunction, false)

  document.removeEventListener('mouseup', viewModel.rotateMouseUpFunction, false)
  document.removeEventListener('touchend', viewModel.rotateMouseUpFunction, false)
}
function orbit(viewModel, compassElement, cursorVector) {
  var scene = viewModel.terria.scene

  var sscc = scene.screenSpaceCameraController

  // do not orbit if it is disabled
  if (scene.mode === SceneMode.MORPHING || !sscc.enableInputs) {
    return
  }
  if (viewModel.navigationLocked) {
    return true
  }

  switch (scene.mode) {
    case SceneMode.COLUMBUS_VIEW:
      if (sscc.enableLook) {
        break
      }

      if (!sscc.enableTranslate || !sscc.enableTilt) {
        return
      }
      break
    case SceneMode.SCENE3D:
      if (sscc.enableLook) {
        break
      }

      if (!sscc.enableTilt || !sscc.enableRotate) {
        return
      }
      break
    case SceneMode.SCENE2D:
      if (!sscc.enableTranslate) {
        return
      }
      break
  }

  // Remove existing event handlers, if any.
  removeOrbitEventListener(viewModel)

  if (defined(viewModel.orbitTickFunction)) {
    viewModel.terria.clock.onTick.removeEventListener(viewModel.orbitTickFunction)
  }

  viewModel.orbitMouseMoveFunction = undefined
  viewModel.orbitMouseUpFunction = undefined
  viewModel.orbitTickFunction = undefined

  viewModel.isOrbiting = true
  viewModel.orbitLastTimestamp = getTimestamp()

  var camera = scene.camera

  if (defined(viewModel.terria.trackedEntity)) {
    // when tracking an entity simply use that reference frame
    viewModel.orbitFrame = undefined
    viewModel.orbitIsLook = false
  } else {
    var center = Utils.getCameraFocus(viewModel.terria, true, centerScratch)

    if (!defined(center)) {
      viewModel.orbitFrame = Transforms.eastNorthUpToFixedFrame(camera.positionWC, scene.globe.ellipsoid, newTransformScratch)
      viewModel.orbitIsLook = true
    } else {
      viewModel.orbitFrame = Transforms.eastNorthUpToFixedFrame(center, scene.globe.ellipsoid, newTransformScratch)
      viewModel.orbitIsLook = false
    }
  }

  viewModel.orbitTickFunction = function (e) {
    var timestamp = getTimestamp()
    var deltaT = timestamp - viewModel.orbitLastTimestamp
    var rate = (viewModel.orbitCursorOpacity - 0.5) * 2.5 / 1000
    var distance = deltaT * rate

    var angle = viewModel.orbitCursorAngle + CesiumMath.PI_OVER_TWO
    var x = Math.cos(angle) * distance
    var y = Math.sin(angle) * distance

    var oldTransform

    if (viewModel.navigationLocked) {
      return true
    }

    if (defined(viewModel.orbitFrame)) {
      oldTransform = Matrix4.clone(camera.transform, oldTransformScratch)

      camera.lookAtTransform(viewModel.orbitFrame)
    }

    // do not look up/down or rotate in 2D mode
    if (scene.mode === SceneMode.SCENE2D) {
      camera.move(new Cartesian3(x, y, 0), Math.max(scene.canvas.clientWidth, scene.canvas.clientHeight) / 100 * camera.positionCartographic.height * distance)
    } else {
      if (viewModel.orbitIsLook) {
        camera.look(Cartesian3.UNIT_Z, -x)
        camera.look(camera.right, -y)
      } else {
        camera.rotateLeft(x)
        camera.rotateUp(y)
      }
    }

    if (defined(viewModel.orbitFrame)) {
      camera.lookAtTransform(oldTransform)
    }

    // viewModel.terria.cesium.notifyRepaintRequired();

    viewModel.orbitLastTimestamp = timestamp
  }

  function updateAngleAndOpacity(vector, compassWidth) {
    var angle = Math.atan2(-vector.y, vector.x)
    viewModel.orbitCursorAngle = CesiumMath.zeroToTwoPi(angle - CesiumMath.PI_OVER_TWO)

    var distance = Cartesian2.magnitude(vector)
    var maxDistance = compassWidth / 2.0
    var distanceFraction = Math.min(distance / maxDistance, 1.0)
    var easedOpacity = 0.5 * distanceFraction * distanceFraction + 0.5
    viewModel.orbitCursorOpacity = easedOpacity

    // viewModel.terria.cesium.notifyRepaintRequired();
  }

  viewModel.orbitMouseMoveFunction = function (e) {
    const { clientX, clientY } = getClientXY(e)
    var compassRectangle = compassElement.getBoundingClientRect()
    var center = new Cartesian2((compassRectangle.right - compassRectangle.left) / 2.0, (compassRectangle.bottom - compassRectangle.top) / 2.0)
    var clickLocation = new Cartesian2(clientX - compassRectangle.left, clientY - compassRectangle.top)
    var vector = Cartesian2.subtract(clickLocation, center, vectorScratch)
    updateAngleAndOpacity(vector, compassRectangle.width)
  }

  viewModel.orbitMouseUpFunction = function (e) {
    // TODO: if mouse didn't move, reset view to looking down, north is up?

    viewModel.isOrbiting = false
    removeOrbitEventListener(viewModel)
    if (defined(viewModel.orbitTickFunction)) {
      viewModel.terria.clock.onTick.removeEventListener(viewModel.orbitTickFunction)
    }

    viewModel.orbitMouseMoveFunction = undefined
    viewModel.orbitMouseUpFunction = undefined
    viewModel.orbitTickFunction = undefined
  }

  addOrbitEventListener(viewModel)
  viewModel.terria.clock.onTick.addEventListener(viewModel.orbitTickFunction)

  updateAngleAndOpacity(cursorVector, compassElement.getBoundingClientRect().width)
}

function rotate(viewModel, compassElement, cursorVector) {
  var scene = viewModel.terria.scene
  var camera = scene.camera

  var sscc = scene.screenSpaceCameraController
  // do not rotate in 2D mode or if rotating is disabled
  if (scene.mode === SceneMode.MORPHING || scene.mode === SceneMode.SCENE2D || !sscc.enableInputs) {
    return
  }
  if (viewModel.navigationLocked) {
    return true
  }

  if (!sscc.enableLook && (scene.mode === SceneMode.COLUMBUS_VIEW || (scene.mode === SceneMode.SCENE3D && !sscc.enableRotate))) {
    return
  }

  // Remove existing event handlers, if any.
  removeRotateEventListener(viewModel)
  viewModel.rotateMouseMoveFunction = undefined
  viewModel.rotateMouseUpFunction = undefined

  viewModel.isRotating = true
  viewModel.rotateInitialCursorAngle = Math.atan2(-cursorVector.y, cursorVector.x)

  if (defined(viewModel.terria.trackedEntity)) {
    // when tracking an entity simply use that reference frame
    viewModel.rotateFrame = undefined
    viewModel.rotateIsLook = false
  } else {
    var viewCenter = Utils.getCameraFocus(viewModel.terria, true, centerScratch)

    if (!defined(viewCenter) || (scene.mode === SceneMode.COLUMBUS_VIEW && !sscc.enableLook && !sscc.enableTranslate)) {
      viewModel.rotateFrame = Transforms.eastNorthUpToFixedFrame(camera.positionWC, scene.globe.ellipsoid, newTransformScratch)
      viewModel.rotateIsLook = true
    } else {
      viewModel.rotateFrame = Transforms.eastNorthUpToFixedFrame(viewCenter, scene.globe.ellipsoid, newTransformScratch)
      viewModel.rotateIsLook = false
    }
  }

  var oldTransform
  if (defined(viewModel.rotateFrame)) {
    oldTransform = Matrix4.clone(camera.transform, oldTransformScratch)
    camera.lookAtTransform(viewModel.rotateFrame)
  }

  viewModel.rotateInitialCameraAngle = -camera.heading

  if (defined(viewModel.rotateFrame)) {
    camera.lookAtTransform(oldTransform)
  }

  viewModel.rotateMouseMoveFunction = function (e) {
    const { clientX, clientY } = getClientXY(e)
    var compassRectangle = compassElement.getBoundingClientRect()
    var center = new Cartesian2((compassRectangle.right - compassRectangle.left) / 2.0, (compassRectangle.bottom - compassRectangle.top) / 2.0)
    var clickLocation = new Cartesian2(clientX - compassRectangle.left, clientY - compassRectangle.top)
    var vector = Cartesian2.subtract(clickLocation, center, vectorScratch)
    var angle = Math.atan2(-vector.y, vector.x)

    var angleDifference = angle - viewModel.rotateInitialCursorAngle
    var newCameraAngle = CesiumMath.zeroToTwoPi(viewModel.rotateInitialCameraAngle - angleDifference)

    var camera = viewModel.terria.scene.camera

    var oldTransform
    if (defined(viewModel.rotateFrame)) {
      oldTransform = Matrix4.clone(camera.transform, oldTransformScratch)
      camera.lookAtTransform(viewModel.rotateFrame)
    }

    var currentCameraAngle = -camera.heading
    camera.rotateRight(newCameraAngle - currentCameraAngle)

    if (defined(viewModel.rotateFrame)) {
      camera.lookAtTransform(oldTransform)
    }

    // viewModel.terria.cesium.notifyRepaintRequired();
  }

  viewModel.rotateMouseUpFunction = function (e) {
    viewModel.isRotating = false
    removeRotateEventListener(viewModel)
    viewModel.rotateMouseMoveFunction = undefined
    viewModel.rotateMouseUpFunction = undefined
  }

  addRotateEventListener(viewModel)
}

export default NavigationViewModel
