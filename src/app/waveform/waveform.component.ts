import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { merge, Subject } from 'rxjs';
import { filter, map, mergeAll, tap } from 'rxjs/operators';
import { AudioService } from '../audio.service';

@Component({
  selector: 'app-waveform',
  templateUrl: './waveform.component.html',
  styleUrls: ['./waveform.component.scss'],
})
export class WaveformComponent implements OnInit {
  @Input() url: string;

  @ViewChild('canvas', { static: true })
  canvasRef: ElementRef<HTMLCanvasElement>;

  public dpr = window.devicePixelRatio || 1;
  public redraw = new Subject();
  public samples = 2000;
  private padding = 20;
  private ctx: CanvasRenderingContext2D;

  private buffer;
  private samplesPercent = 1;
  public maxSamples;

  constructor(
    private audioService: AudioService,
    private cd: ChangeDetectorRef
  ) {}

  public get canvas() {
    return this.canvasRef.nativeElement;
  }

  public onNewFile(event) {
    const file = event.target.files[0];
    this.audioService
      .fetchAudio(URL.createObjectURL(file))
      .subscribe((buffer) => {
        this.clearCanvas();
        this.redraw.next(buffer);
      });
  }

  private clearCanvas() {
    this.ctx.translate(0, -(this.canvas.offsetHeight / 2 + this.padding));
    this.cd.detectChanges();
    this.ctx.clearRect(
      0,
      0,
      this.canvas.offsetWidth,
      this.canvas.offsetHeight * 2
    );
    this.ctx.translate(0, this.canvas.offsetHeight / 2 + this.padding);
  }

  public onSlider() {
    this.clearCanvas();

    this.redraw.next(this.buffer);
  }

  ngOnInit(): void {
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height =
      (this.canvas.offsetHeight + this.padding * 2) * this.dpr;
    this.cd.detectChanges();
    this.ctx.scale(this.dpr, this.dpr);
    this.ctx.translate(0, this.canvas.offsetHeight / 2 + this.padding);

    const fetch$ = this.audioService.fetchAudio(this.url);

    merge(fetch$, this.redraw)
      .pipe(
        tap((data) => (this.buffer = data)),
        map(this.filterData.bind(this)),
        map(this.normalizeData),
        map(this.draw.bind(this))
      )
      .subscribe((data) => {});
  }

  private draw(data) {
    const width = this.canvas.offsetWidth / data.length;

    for (let i = 0; i < data.length; i++) {
      let x = i * width;
      let height: any = data[i] * this.canvas.offsetHeight - this.padding;
      if (height < 0) {
        height = 0;
      } else if (height > this.canvas.offsetHeight / 2) {
        height = this.canvas.offsetHeight / 2;
      }
      this.drawLineSegment(x, height, width, (i + 1) % 2);
    }
  }

  private drawLineSegment(x, y, width, isEven) {
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    y = isEven ? y : -y;
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, y);
    this.ctx.arc(x + width / 2, y, width / 2, Math.PI, 0, isEven);
    this.ctx.lineTo(x + width, 0);
    this.ctx.stroke();
  }

  private normalizeData(data: number[]): number[] {
    const multiplier = Math.pow(Math.max(...data), -1);
    return data.map((n) => n * multiplier);
  }

  private filterData(audioBuffer: AudioBuffer): number[] {
    const rawData = audioBuffer.getChannelData(0);
    this.maxSamples = audioBuffer.length / audioBuffer.duration;
    const blockSize = Math.floor(rawData.length / this.samples);
    console.log(blockSize);
    const filteredData = [];
    for (let i = 0; i < this.samples; i++) {
      let blockStart = blockSize * i;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[blockStart + j]);
      }
      filteredData.push(sum / blockSize);
    }

    return filteredData;
  }
}
