import { Camera } from "@react-three/fiber"
import { Euler, EventDispatcher, Object3D, Quaternion, Vector3 } from "three"

const _euler = new Euler(0, 0, 0, "YXZ")
const _vector = new Vector3()

const _changeEvent = { type: "change" }
const _lockEvent = { type: "lock" }
const _unlockEvent = { type: "unlock" }

const _PI_2 = Math.PI / 2
const quat = new Quaternion()

export class PointerLockControls extends EventDispatcher {
  isLocked = false
  // Set to constrain the pitch of the camera
  // Range is 0 to Math.PI radians
  minPolarAngle = 0 // radians
  maxPolarAngle = Math.PI // radians
  pointerSpeed = 0.5
  _orientation = new Quaternion()
  referenceObject = new Object3D()
  childReferenceObject = new Object3D()
  constructor(private camera: Camera, private domElement) {
    super()

    this.domElement = domElement
    // // Set to constrain the pitch of the camera
    // // Range is 0 to Math.PI radians
    this.referenceObject.add(this.childReferenceObject)
    this.connect()
  }

  set up(value: Quaternion) {
    this._orientation.copy(value)
    this.camera.setRotationFromQuaternion(value)
    this.referenceObject.quaternion.copy(this.up)
  }

  get up() {
    return this._orientation
  }

  onMouseMove(event: MouseEvent) {
    if (this.isLocked === false) return

    const movementX = event.movementX || 0
    const movementY = event.movementY || 0

    _euler.setFromQuaternion(this.childReferenceObject.quaternion)

    _euler.y -= movementX * 0.002 * this.pointerSpeed
    _euler.x -= movementY * 0.002 * this.pointerSpeed

    _euler.x = Math.max(
      _PI_2 - this.maxPolarAngle,
      Math.min(_PI_2 - this.minPolarAngle, _euler.x),
    )

    this.childReferenceObject.quaternion.setFromEuler(_euler)
    this.childReferenceObject.getWorldQuaternion(quat)
    this.camera.quaternion.copy(quat)

    this.dispatchEvent(_changeEvent)
  }

  onPointerlockChange() {
    if (this.domElement.ownerDocument.pointerLockElement === this.domElement) {
      this.dispatchEvent(_lockEvent)

      this.isLocked = true
    } else {
      this.dispatchEvent(_unlockEvent)

      this.isLocked = false
    }
  }

  onPointerlockError() {
    console.warn("THREE.PointerLockControls: Unable to use Pointer Lock API")
  }

  getDirection() {
    const direction = new Vector3(0, 0, -1)

    return function (v) {
      return v.copy(direction).applyQuaternion(this.camera.quaternion)
    }
  }

  moveForward(distance) {
    // move forward parallel to the xz-plane
    // assumes camera.up is y-up

    _vector.setFromMatrixColumn(this.camera.matrix, 0)

    _vector.crossVectors(this.camera.up, _vector)

    this.camera.position.addScaledVector(_vector, distance)
  }

  moveRight(distance) {
    _vector.setFromMatrixColumn(this.camera.matrix, 0)
    this.camera.position.addScaledVector(_vector, distance)
  }

  lock() {
    this.domElement.requestPointerLock()
  }

  unlock() {
    this.domElement.ownerDocument.exitPointerLock()
  }

  connect() {
    this.domElement.ownerDocument.addEventListener(
      "mousemove",
      this.onMouseMove.bind(this),
    )
    this.domElement.ownerDocument.addEventListener(
      "pointerlockchange",
      this.onPointerlockChange.bind(this),
    )
    this.domElement.ownerDocument.addEventListener(
      "pointerlockerror",
      this.onPointerlockError.bind(this),
    )
  }

  disconnect() {
    this.domElement.ownerDocument.removeEventListener(
      "mousemove",
      this.onMouseMove.bind(this),
    )
    this.domElement.ownerDocument.removeEventListener(
      "pointerlockchange",
      this.onPointerlockChange.bind(this),
    )
    this.domElement.ownerDocument.removeEventListener(
      "pointerlockerror",
      this.onPointerlockError.bind(this),
    )
  }

  dispose() {
    this.disconnect()
  }
}
