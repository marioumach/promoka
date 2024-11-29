import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProduitComponent } from './produit/produit.component';
import { FournisseurComponent } from './fournisseur/fournisseur.component';
import { HomeComponent } from './home/home.component';
import { CommandeComponent } from './commande/commande.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent , children :[
    { path: '', component: CommandeComponent  },
    { path: 'produits', component: ProduitComponent  },
    { path: 'fournisseurs', component: FournisseurComponent  },
    { path: 'commandes', component: CommandeComponent  },
  ] },
  { path: '**', redirectTo: '/login' }, // Gère les routes non reconnues
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
