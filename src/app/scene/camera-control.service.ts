import { Injectable } from '@angular/core';
import { PerspectiveCamera, Vector3, Vector2, Raycaster, Mesh } from 'three';

@Injectable({
    providedIn: 'root'
})
export class CameraControlService {
  
    private _camera: PerspectiveCamera;
    private cameraFocus: Vector3;

    private dragging: boolean;
    private previousLocation: Vector3;
    private previousMouseLocation: Vector2;
    private previousCameraLocation: Vector3;
    private shiftPressed: boolean;

    public get camera() {
        return this._camera;
    }
    
    constructor() {
        this.shiftPressed = false;
        
        this.cameraFocus = new Vector3(0, 0, 0);

        this._camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        this._camera.position.set(100, 500, 200);
        this._camera.lookAt(this.cameraFocus);
    }

    public stopDragging(): void {
        this.dragging = false;
        this.previousMouseLocation = undefined;
        this.previousCameraLocation = undefined;
        this.previousLocation = undefined;
    }

    public startDragging(clientX: number, clientY: number): void {
        this.previousMouseLocation = new Vector2(clientX, clientY)
        this.previousCameraLocation = this.camera.position.clone();
        this.dragging = true;
    }

    public onMouseMove(event: MouseEvent, mouseLocation: Vector3): void {
        if (!this.dragging) {
            return;
        }

        if (event.shiftKey !== this.shiftPressed) {
            this.shiftPressed = event.shiftKey;
            this.previousMouseLocation = new Vector2(event.clientX, event.clientY)
            this.previousCameraLocation = this.camera.position.clone();
            this.previousLocation = undefined;
        }

        if (!event.shiftKey) {
            this.rotate(event.clientX, event.clientY);
            this.camera.lookAt(this.cameraFocus);
        } else {
            this.move(mouseLocation);
        }
    }

    private move(mouseLocation: Vector3): void {
        if (mouseLocation === undefined) {
            return;
        }

        if (this.previousLocation === undefined) {
            this.previousLocation = mouseLocation;
        }

        const shift = this.previousLocation.clone().sub(mouseLocation);


        if (this.cameraFocus.x + shift.x > 2000 / 2) {
            shift.x = 2000 / 2 - this.cameraFocus.x
        }
        if (this.cameraFocus.x + shift.x < -2000 / 2) {
            shift.x = -2000 / 2 - this.cameraFocus.x
        }
        if (this.cameraFocus.z + shift.z > 2000 / 2) {
            shift.z = 2000 / 2 - this.cameraFocus.z
        }
        if (this.cameraFocus.z + shift.z < -2000 / 2) {
            shift.z = -2000 / 2 - this.cameraFocus.z
        }

        this.camera.position.add(shift);
        this.cameraFocus.add(shift);
    }

    private rotate(clientX: number, clientY: number): void {
        let tethaAngle = this.getTethaAngle(this.cameraFocus, this.previousCameraLocation);
        tethaAngle += (clientX - this.previousMouseLocation.x) * 0.001 * Math.PI;
        const newPosition = new Vector3(Math.cos(tethaAngle), 0, Math.sin(tethaAngle));

        let phiAngle = this.getPhiAngle(this.cameraFocus, this.previousCameraLocation);
        phiAngle += (clientY - this.previousMouseLocation.y) * 0.001 * Math.PI;
        phiAngle = Math.min(Math.PI / 2.001, Math.max(Math.PI / 24, phiAngle));
        newPosition.y = Math.sqrt(Math.pow(newPosition.x, 2) + Math.pow(newPosition.z, 2)) * Math.tan(phiAngle);

        newPosition.setLength(this.previousCameraLocation.distanceTo(this.cameraFocus));
        this.camera.position.set(this.cameraFocus.x + newPosition.x, newPosition.y, this.cameraFocus.z + newPosition.z);
    }

    private getTethaAngle(fromPoint: Vector3, toPoint: Vector3): number {
        const rawAngle = Math.atan((toPoint.z - fromPoint.z) / (toPoint.x - fromPoint.x));
        return (toPoint.x - fromPoint.x >= 0) ? rawAngle : rawAngle + Math.PI;
    }

    private getPhiAngle(fromPoint: Vector3, toPoint: Vector3): number {
        return Math.atan((toPoint.y - fromPoint.y) / this.getFlatDistance(fromPoint, toPoint));
    }

    private getFlatDistance(fromPoint: Vector3, toPoint: Vector3): number {
        return Math.sqrt(Math.pow(fromPoint.x - toPoint.x, 2) + Math.pow(fromPoint.z - toPoint.z, 2));
    }

    public zoom(delta: number): void {
        const shift = this.camera.position.clone().sub(this.cameraFocus).multiplyScalar(delta * 0.001);
        const newPosition = this.camera.position.clone().add(shift);
        const newDistance = this.cameraFocus.distanceTo(newPosition);
        if (newDistance > 2000 || newDistance < 200) {
            return;
        }

        this.camera.position.add(shift);
    }

    public resize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}
