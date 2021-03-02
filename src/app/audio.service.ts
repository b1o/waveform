import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  public audioContext = new AudioContext();

  constructor() {}

  public fetchAudio(url: string): Observable<AudioBuffer> {
    return from(fetch(url)).pipe(
      switchMap((response) => response.arrayBuffer()),
      switchMap((buffer) => this.audioContext.decodeAudioData(buffer))
    );
  }
}
