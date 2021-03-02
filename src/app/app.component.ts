import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'waveform';

  url = '/assets/audio.mp3';


  audioContext = new AudioContext();

  constructor() {}
}
