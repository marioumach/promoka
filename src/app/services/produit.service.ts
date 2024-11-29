import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { environment } from '../app.module';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private db;

  constructor() {
    const app = initializeApp(environment.firebase);
    this.db = getFirestore(app); // Get Firestore instance
  }

  // Récupérer tous les produits depuis Firestore
  async getProduits(): Promise<any[]> {
    const produitsCollection = collection(this.db, 'produits');
    const produitSnapshot = await getDocs(produitsCollection);
    const produitsList = produitSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return produitsList;
  }

  // Ajouter un nouveau produit
  async addProduit(produit: any): Promise<any> {
    const produitsCollection = collection(this.db, 'produits');
    const docRef = await addDoc(produitsCollection, produit);
    return docRef.id; // Return the new document's ID
  }

  // Supprimer un produit par ID
  async deleteProduit(id: any): Promise<void> {
    const produitDoc = doc(this.db, 'produits', id);
    await deleteDoc(produitDoc);
  }

  // Mettre à jour un produit par ID
  async updateProduit(id: any, produit: any): Promise<void> {
    const produitDoc = doc(this.db, 'produits', id);
    await updateDoc(produitDoc, produit);
  }

  // Récupérer les fournisseurs depuis Firestore
  async getFournisseurs(): Promise<any[]> {
    const fournisseursCollection = collection(this.db, 'fournisseurs');
    const fournisseurSnapshot = await getDocs(fournisseursCollection);
    const fournisseursList = fournisseurSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return fournisseursList;
  }

  // Récupérer les produits d'un fournisseur spécifique depuis Firestore
  async getProduitsByFournisseur(fournisseurId: any): Promise<any[]> {
    try {
      // Reference to the 'produits' collection
      const produitsCollection = collection(this.db, 'produits');

      // Query to filter products where 'fournisseur' field equals the fournisseurId
      const produitsQuery = query(produitsCollection, where('fournisseur', '==', fournisseurId));

      // Fetch the documents matching the query
      const produitSnapshot = await getDocs(produitsQuery);
      
      // Map the data to a list of products
      const produitsList = produitSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      return produitsList;
    } catch (error) {
      console.error("Error fetching produits:", error);
      throw new Error();
    }
  }
}