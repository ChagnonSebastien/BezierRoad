import { AfterViewInit, Component, ElementRef, Input, ViewChild, HostListener } from '@angular/core';
import { PointLight, Mesh, Scene, WebGLRenderer, Renderer, PerspectiveCamera, BoxGeometry, MeshStandardMaterial, AmbientLight } from 'three';

@Component({
    selector: 'scene',
    templateUrl: './scene.component.html',
    styleUrls: ['./scene.component.css']
})
export class SceneComponent implements AfterViewInit {

    @ViewChild('canvas')
    private canvasRef: ElementRef;

    private renderer: Renderer;
    private scene: Scene;
    private camera: PerspectiveCamera;
    private mesh: Mesh;
    private light: PointLight;

    private get canvas(): HTMLCanvasElement {
        return this.canvasRef.nativeElement;
    }

    constructor() {
        this.renderer = new WebGLRenderer();
        this.scene = new Scene();

        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        this.camera.position.z = 1000;

        const geometry = new BoxGeometry(200, 200, 200);
        const material = new MeshStandardMaterial({color: 0xff0000, wireframe: false, metalness: 0, roughness: 0.5});
        this.mesh = new Mesh(geometry, material);

        this.scene.add(this.mesh);

        this.light = new PointLight('#5500FF');
        this.light.position.z = 1000;
        this.light.position.y = 200;
        this.light.intensity = 2;

        this.scene.add(this.light);
        this.scene.add(new AmbientLight('#FFFFFF', 0.2));
    }

    ngAfterViewInit(): void {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        console.log(window.innerWidth, window.innerHeight);
        this.canvasRef.nativeElement.appendChild(this.renderer.domElement);
        this.animate();
    }

    private get aspectRatio(): number {
        let height = this.canvas.clientHeight;
        if (height === 0) {
            return 0;
        }
        return this.canvas.clientWidth / this.canvas.clientHeight;
    }

    private animate(): void {
        window.requestAnimationFrame(() => this.animate());
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.02;
        this.renderer.render(this.scene, this.camera);
    }
    
    @HostListener('window:resize', ['$event'])
    public onResize(event: Event): void {
        this.canvas.style.width = "100vw";
        this.canvas.style.height = "100vh";

        this.camera.aspect = this.aspectRatio;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    }
}