import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProduitComponent } from './produit/produit.component';
import { FournisseurComponent } from './fournisseur/fournisseur.component';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { CommandeComponent } from './commande/commande.component';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InterceptorService } from './services/interceptor.service';

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyDo33RsdPMlCc7enXChdNfRbKURaDBnyLk",
    authDomain: "promoka-494d0.firebaseapp.com",
    projectId: "promoka-494d0",
    storageBucket: "promoka-494d0.firebasestorage.app",
    messagingSenderId: "246367716974",
    appId: "1:246367716974:web:4fe05146ffa816bbb0c87f",
    measurementId: "G-G42ELKQ2JB"
  },
};
@NgModule({
  declarations: [
    HomeComponent,
    AppComponent,
    ProduitComponent,
    FournisseurComponent,
    CommandeComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxSpinnerModule.forRoot({type: 'ball-spin'}),
  ],
  providers: [  {
    provide: HTTP_INTERCEPTORS,
    useClass: InterceptorService,
    multi: true,
  },],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
  }
 }
