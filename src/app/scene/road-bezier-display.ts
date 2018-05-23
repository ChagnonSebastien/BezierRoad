import { Vector3, Mesh, Scene, LineCurve3, Line, BufferGeometry, LineBasicMaterial, CatmullRomCurve3, CylinderGeometry, MeshStandardMaterial } from "three";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn : 'root'
})
export class RoadBezierDisplay {
    private lastPositions: Vector3[];
    private wasClosed: boolean;

    private segments: Map<number, Line>;
    private curve: Line;
    private points: Mesh[];

    constructor() {
        this.wasClosed = false;
        this.lastPositions = [];
        this.segments = new Map<number, Line>();
        this.points = [];
    }

    public update(intersectionPositions: Vector3[], closed: boolean, scene: Scene) {
        this.removeSegments(this.checkForChanges(intersectionPositions.map(i => new Vector3(i.x, 1, i.z)), closed), scene);
        /* this.addMissingSegments(scene); */


        scene.remove(...this.points);
       /*  scene.remove(this.curve); */
        if (this.lastPositions.length > 1) {
            const catmull = new CatmullRomCurve3(this.lastPositions, this.wasClosed);
            if (catmull.getLength() !== 0) {
                var points = catmull.getSpacedPoints( Math.max(catmull.getLength() / 51) );
                /* if (this.wasClosed) {
                    points.push(points[0]);
                } else {
                    points.push(this.lastPositions[this.lastPositions.length - 1]);
                } */


                this.points = points.map((point, index) => {
                    if (this.points.length > index) {
                        this.points[index].position.set(point.x, point.y, point.z);
                        return this.points[index];
                    } else {
                        var geometry = new CylinderGeometry( 25, 25, 5, 24 );
                        var material = new MeshStandardMaterial( {color: 0x6F6E63, roughness: 0.9} );
                        var mesh = new Mesh( geometry, material );
                        mesh.position.set(point.x, point.y, point.z);
                        return mesh;
                    }
                })
                this.points.forEach((point, index, array) => {
                    point.material = new MeshStandardMaterial( {color: 0x6F6E63, roughness: 0.9} );
                    array.forEach((p, i) => {
                        if (p.position.distanceTo(point.position) < 50 && (Math.abs(index - i) > 1 && Math.abs(index - i) < points.length - 1)) {
                            point.material = new MeshStandardMaterial( {color: 0xFF0000, roughness: 0.9} );
                        } else if (p.position.distanceTo(point.position) < 75 && (Math.abs(index - i) > 1 && Math.abs(index - i) < points.length - 2)) {
                            point.material = new MeshStandardMaterial( {color: 0xFF0000, roughness: 0.9} );
                        }
                    })
                })
                scene.add(...this.points);

/* 
                var geometry = new BufferGeometry().setFromPoints( points );

                var material = new LineBasicMaterial( { color : 0xFFFFFF } );
                var curveObject = new Line( geometry, material );
                this.curve = curveObject;
                scene.add(curveObject); */
            }
        }
    }

    private checkForChanges(intersectionPositions: Vector3[], closed: boolean): number[] {
        let changes: number[] = [];
        if (closed !== this.wasClosed) {
            changes.push(0, -1, -2);
            this.wasClosed = closed;
        }

        for (let i = 0; i < Math.max(this.lastPositions.length, intersectionPositions.length); i++) {
            if (this.lastPositions[i] === undefined || intersectionPositions[i] === undefined) {
                changes.push(i, i-1, i-2);
            } else if (!intersectionPositions[i].equals(this.lastPositions[i])) {
                changes.push(i, i+1, i-1, i-2);
            }
        }

        if (changes.length > 0) {
            this.lastPositions = intersectionPositions;
        }

        return changes.map(number => ((number % this.lastPositions.length) + this.lastPositions.length) % this.lastPositions.length);
    }

    private removeSegments(segementsToUpdate: number[], scene: Scene) {
        segementsToUpdate.forEach(segmentNumber => {
            scene.remove(this.segments.get(segmentNumber));
            this.segments.delete(segmentNumber);
        });
    }

    private addMissingSegments(scene: Scene) {
        for (let i = 0; i < this.lastPositions.length - (this.wasClosed ? 0 : 1); i++) {
            if (!this.segments.has(i)) {

                const lineCurve = new LineCurve3(this.lastPositions[i], this.lastPositions[(i+1)%this.lastPositions.length]);
                const points = lineCurve.getPoints(10);

                var geometry = new BufferGeometry().setFromPoints(points);
                var material = new LineBasicMaterial({color: 0x0a5500, linewidth: 20});
                var curveObject = new Line(geometry, material);

                scene.add(curveObject);
                this.segments.set(i, curveObject);
            }
        }
    }
}
