import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SceneComponent } from './scene/scene.component';
import { CameraControlService } from './scene/camera-control.service';
import { RoadBuilderService } from './scene/road-builder.service';
import { RoadBezierDisplay } from './scene/road-bezier-display';

@NgModule({
  declarations: [
    AppComponent,
    SceneComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    CameraControlService,
    RoadBuilderService,
    RoadBezierDisplay
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
