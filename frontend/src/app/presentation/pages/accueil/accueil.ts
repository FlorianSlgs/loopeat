import { Component } from '@angular/core';

import { Header } from '../../shared/header/header';
import { Carousel } from '../../features/carousel/carousel';
import { Map } from '../../features/map/map';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-accueil',
  imports: [Header, Carousel, Map, Footer],
  templateUrl: './accueil.html',
  styleUrl: './accueil.css'
})
export class Accueil {

}
