import { Pipe, PipeTransform } from '@angular/core';
import { Fournisseur } from '../models/fournisseur.model';

@Pipe({
  name: 'fournisseur'
})
export class FournisseurPipe implements PipeTransform {

  transform( id: number ,fournisseurs: Fournisseur[]): string {
    const fournisseur = fournisseurs.find(f => f.id === id);
    return fournisseur ? fournisseur.nom : 'Fournisseur Inconnu';
  }

}
