import { Injectable } from '@angular/core';
import { Observable, lastValueFrom, map } from 'rxjs';
import { Fournisseur } from '../models/fournisseur.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FounisseurService {
  private apiUrl = 'http://192.168.1.11:3000/fournisseurs';

  constructor(private http: HttpClient) {}

  // Charger les fournisseurs depuis le backend
  chargerFournisseurs(): Promise<Fournisseur[]> {
    return lastValueFrom(this.http.get<Fournisseur[]>(this.apiUrl));
  }

  // Ajouter un fournisseur
  ajouterFournisseur(fournisseur: Fournisseur): Promise<Fournisseur> {
    return lastValueFrom(this.http.post<Fournisseur>(this.apiUrl, fournisseur));
  }

  // Supprimer un fournisseur
  supprimerFournisseur(id: number): Promise<any> {
    return lastValueFrom( this.http.delete(`${this.apiUrl}/${id}`));
  }
    // Mettre à jour un fournisseur
    modifierFournisseur(id: number, updatedData: Partial<Fournisseur>): Promise<Fournisseur> {
      return lastValueFrom(this.http.patch<Fournisseur>(`${this.apiUrl}/${id}`, updatedData))
    }
}