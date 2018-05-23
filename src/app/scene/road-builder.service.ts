import { Injectable } from '@angular/core';
import { Vector3, Mesh, CylinderGeometry, MeshStandardMaterial, Scene, Raycaster, Intersection, Object3D } from 'three';
import { CameraControlService } from './camera-control.service';

@Injectable({
    providedIn: 'root'
})
export class RoadBuilderService {

    private _closed: boolean;
    private rayCaster: Raycaster;
    
    private _intersections: Object3D[];
    private movingIntersection: Object3D;
    private hoverIntersections: {object: Object3D}[];

    public get intersections() {
        const intersectionPositions = this._intersections.map(intersection => intersection.position.clone());
        if (this.movingIntersection !== undefined && !this._closed) {
            intersectionPositions.push(this.movingIntersection.position.clone())
        }
        return intersectionPositions;
    }

    public get closed() {
        return this._closed;
    }

    constructor(private cameraControlService: CameraControlService) {
        this._closed = false;
        this._intersections = [];
        this.rayCaster = new Raycaster();
    }

    private generateIntersection(): Mesh {
        var geometry = new CylinderGeometry( 40, 40, 1, 24 );
        var material = new MeshStandardMaterial( {color: 0xFFFFFF, roughness: 0.9} );
        return new Mesh( geometry, material );
    }

    public onMouseMove(event: MouseEvent, mouseLocation: Vector3, scene: Scene) {
        if (mouseLocation === undefined) {
            return;
        }

        if (!this._closed && this.movingIntersection === undefined) {
            this.movingIntersection = this.generateIntersection();
            scene.add(this.movingIntersection);
        }

        if (this.movingIntersection !== undefined) {
            this.movingIntersection.position.set(mouseLocation.x, mouseLocation.y, mouseLocation.z);
        }
        
        var vector = new Vector3((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1, 0.5);
        this.rayCaster.setFromCamera(vector, this.cameraControlService.camera);
        this.hoverIntersections = this.rayCaster.intersectObjects(this._intersections, false);
    }

    public onMouseDown(mouseButton: number) {
        if (mouseButton === 0 && this._closed && this.hoverIntersections.length > 0) {
            this.movingIntersection = this.hoverIntersections[0].object;
        }
    }

    public onMouseUp(mouseButton: number, scene: Scene) {
        if (mouseButton === 0) {
            if (this._closed) {
                this.movingIntersection = undefined;
            } else {
                this.newIntersection(scene);
            }
        }

        if (mouseButton === 2) {
            if (this._closed) {
                this._closed = false;
            } else {
                scene.remove(this._intersections.pop());
            }
        }
    }

    private newIntersection(scene: Scene) {
        if (this.hoverIntersections.map(intersection => intersection.object).indexOf(this._intersections[0]) !== -1) {
            this._closed = true;
            scene.remove(this.movingIntersection);
            this.movingIntersection = undefined;
        } else if (this.hoverIntersections.length === 0) {
            this._intersections.push(this.movingIntersection);
            this.hoverIntersections.push({object: this.movingIntersection});
            this.movingIntersection = this.movingIntersection.clone();
            scene.add(this.movingIntersection);
        }
    }
}
