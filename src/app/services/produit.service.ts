import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {

  private apiUrl = 'http://192.168.1.11/produits'; // L'URL de l'API backend pour les produits

  constructor(private http: HttpClient) {}

  // Récupérer tous les produits
  getProduits(): Promise<any[]> {
    return lastValueFrom(this.http.get<any[]>(this.apiUrl));
  }

  // Ajouter un nouveau produit
  addProduit(produit: any): Promise<any> {
    return lastValueFrom(this.http.post<any>(this.apiUrl, produit));
  }

  // Supprimer un produit par ID
  deleteProduit(id: number): Promise<any> {
    return lastValueFrom(this.http.delete<any>(`${this.apiUrl}/${id}`));
  }

  // Mettre à jour un produit par ID
  updateProduit(id: number, produit: any): Promise<any> {
    return lastValueFrom(this.http.put<any>(`${this.apiUrl}/${id}`, produit));
  }

  // Récupérer les fournisseurs (si nécessaire pour le produit)
  getFournisseurs(): Promise<any[]> {
    return lastValueFrom(this.http.get<any[]>('http://192.168.1.11:3000/fournisseurs')); // Changez cette URL en fonction de votre API
  }
    // Fetch the list of products for a specific fournisseur
    getProduitsByFournisseur(fournisseurId: number): Promise<any[]> {
      return lastValueFrom(this.http.get<any[]>(`http://localhost:3000/fournisseurs/${fournisseurId}/produits`));
    }
    
}