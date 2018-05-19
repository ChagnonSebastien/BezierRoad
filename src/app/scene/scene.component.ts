import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Scene, Mesh, Raycaster, WebGLRenderer, PlaneGeometry, MeshStandardMaterial, PointLight, AmbientLight, Vector3 } from 'three';
import { CameraControlService } from './camera-control.service';

enum DragType {
    CAMERA, ROAD_MOVE
}

@Component({
    selector: 'scene',
    templateUrl: './scene.component.html',
    styleUrls: ['./scene.component.css']
})
export class SceneComponent implements AfterViewInit {

    @ViewChild('canvas')
    private canvasRef: ElementRef;

    private renderer: WebGLRenderer;
    private scene: Scene;
    private plane: Mesh;
    private rayCaster: Raycaster;

    private get canvas(): HTMLCanvasElement {
        return this.canvasRef.nativeElement;
    }

    constructor(private cameraControlService: CameraControlService) {
        this.renderer = new WebGLRenderer();
        this.scene = new Scene();
        this.rayCaster = new Raycaster();
        
        const planegeometry = new PlaneGeometry(2000, 2000);
        planegeometry.rotateX(- Math.PI / 2);
        const planematerial = new MeshStandardMaterial({color: 0xffffff, metalness: 0, roughness: 1});
        this.plane = new Mesh(planegeometry, planematerial);
        this.scene.add(this.plane);

        const light = new PointLight('#105000', 2);
        light.position.set(-500, 1000, 500)
        this.scene.add(light);
        this.scene.add(new AmbientLight('#FFFFFF', 0.2));
    }

    ngAfterViewInit(): void {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.canvasRef.nativeElement.appendChild(this.renderer.domElement);
        this.animate();
    }

    private animate(): void {
        window.requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.cameraControlService.camera);
    }

    public onMouseMove(event: MouseEvent): void {
        const mouseLocation = this.getMouseLocation(event.clientX, event.clientY);
        this.cameraControlService.onMouseMove(event, mouseLocation);

    }

    private getMouseLocation(clientX: number, clientY: number): Vector3 {
        var vector = new Vector3((clientX / window.innerWidth) * 2 - 1, - (clientY / window.innerHeight) * 2 + 1, 0.5);
        this.rayCaster.setFromCamera(vector, this.cameraControlService.camera);
        const intersections = this.rayCaster.intersectObject(this.plane, false);
        return intersections.length === 0 ? undefined : intersections[0].point;
    }

    public onMouseUp(event: MouseEvent): void {
        if (event.button === 1) {
            this.cameraControlService.stopDragging();
        }
    }

    public onMouseDown(event: MouseEvent): void {
        switch (event.button) {
            case 0:
            
            break;
            case 1:
            this.cameraControlService.startDragging(event.clientX, event.clientY);
            break;
            case 2:
            
            break;
        }
    }

    public onWheelScrollEvent(event: WheelEvent): void {
        this.cameraControlService.zoom(event.deltaY);
    }
    
    @HostListener('window:resize', ['$event'])
    public onResize(event: Event): void {
        this.canvas.style.width = "100vw";
        this.canvas.style.height = "100vh";

        this.cameraControlService.resize();
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    }
}