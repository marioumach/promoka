import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProduitComponent } from './produit/produit.component';
import { FournisseurComponent } from './fournisseur/fournisseur.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from "@angular/common/http";
import { CommandeComponent } from './commande/commande.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
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
    AppComponent,
    ProduitComponent,
    FournisseurComponent,
    CommandeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
