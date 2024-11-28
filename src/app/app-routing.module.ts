import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProduitComponent } from './produit/produit.component';
import { FournisseurComponent } from './fournisseur/fournisseur.component';
import { HomeComponent } from './home/home.component';
import { CommandeComponent } from './commande/commande.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Redirection par défaut
  { path: 'home', component: HomeComponent },
  { path: 'produits', component: ProduitComponent },
  { path: 'fournisseurs', component: FournisseurComponent },
  { path: 'commandes', component: CommandeComponent },
  { path: '**', redirectTo: '/home' }, // Gère les routes non reconnues
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
