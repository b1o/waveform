import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WaveformComponent } from './waveform/waveform.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatSliderModule}  from '@angular/material/slider'
import {MatButtonModule}  from '@angular/material/button'
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    WaveformComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSliderModule,
    MatButtonModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
