import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where, orderBy, startAfter, limit, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { environment } from '../app.module';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private db;

  constructor(private spinner: NgxSpinnerService) {
    const app = initializeApp(environment.firebase);
    this.db = getFirestore(app); // Get Firestore instance
  }

  // Récupérer tous les produits depuis Firestore
  async getProduits(pageSize: number, lastDoc?: QueryDocumentSnapshot): Promise<{ produits: any[]; lastDoc: any }> {
    this.spinner.show(); // Affiche le spinner au début
    try {
      const produitsCollection = collection(this.db, 'produits');
      let produitsQuery;

      // Construire la requête avec ou sans pagination
      if (lastDoc) {
        produitsQuery = query(produitsCollection, orderBy('nom'), startAfter(lastDoc), limit(pageSize));
      } else {
        produitsQuery = query(produitsCollection, orderBy('nom'), limit(pageSize));
      }

      const produitSnapshot = await getDocs(produitsQuery);
      const produitsList = produitSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const newLastDoc = produitSnapshot.docs[produitSnapshot.docs.length - 1] || null;

      return { produits: produitsList, lastDoc: newLastDoc };
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      return { produits: [], lastDoc: null };
    } finally {
      this.spinner.hide(); // Cache le spinner à la fin, même en cas d'erreur
    }
  }

  // Ajouter un nouveau produit
  async addProduit(produit: any): Promise<any> {
    this.spinner.show()
    const produitsCollection = collection(this.db, 'produits');
    const docRef = await addDoc(produitsCollection, produit).finally(() => this.spinner.hide());
    return docRef.id; // Return the new document's ID
  }

  // Supprimer un produit par ID
  async deleteProduit(id: any): Promise<void> {
    this.spinner.show()
    const produitDoc = doc(this.db, 'produits', id);
    return await deleteDoc(produitDoc).finally(() => this.spinner.hide());
  }

  // Mettre à jour un produit par ID
  async updateProduit(id: any, produit: any): Promise<void> {
    this.spinner.show()
    const produitDoc = doc(this.db, 'produits', id);
    return await updateDoc(produitDoc, produit).finally(() => this.spinner.hide());
  }

  getFilteredProduits(
    pageSize: number,
    lastDoc: QueryDocumentSnapshot<DocumentData> | null,
    filters: any
  ): Promise<{ produits: any[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
    const produitsCollection = collection(this.db, 'produits');
    let queryRef = produitsCollection as any;
    // Apply filters
    if (filters.name && filters.name!='') {
      const searchTerm = filters.name.trim().toLowerCase();
      queryRef = query(queryRef, where('nom_lowercase', '>=', searchTerm), where('nom_lowercase', '<=', searchTerm + '\uf8ff'));
    }
     if (filters.codeBarre && filters.codeBarre!='') {
       queryRef = query(queryRef, where('codeBarre', '==', filters.codeBarre));
     }
     if (filters.fournisseur && filters.fournisseur!='') {
       queryRef = query(queryRef, where('fournisseur', '==', filters.fournisseur));
     }
    // Pagination
     if (lastDoc) {
       queryRef = query(queryRef, startAfter(lastDoc), limit(pageSize));
     } else {
      queryRef = query(queryRef, limit(pageSize));
     }
  
    return getDocs(queryRef).then((querySnapshot) => {
      // Explicitly type doc.data() as a generic object type
      const produits = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Record<string, any>; // Cast to a generic object
        return { id: doc.id, ...data };
      });
      console.log(produits);
      
  
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] as QueryDocumentSnapshot<DocumentData> | null;
      return { produits, lastDoc: lastVisible };
    });
  }
  // Récupérer les fournisseurs depuis Firestore
  async getFournisseurs(): Promise<any[]> {
    const fournisseursCollection = collection(this.db, 'fournisseurs');
    const fournisseurSnapshot = await getDocs(fournisseursCollection).finally(() => this.spinner.hide());
    const fournisseursList = fournisseurSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return fournisseursList;
  }

  // Récupérer les produits d'un fournisseur spécifique depuis Firestore
  async getProduitsByFournisseur(fournisseurId: any): Promise<any[]> {
    try {
      const produitsCollection = collection(this.db, 'produits');
      const produitsQuery = query(produitsCollection, where('fournisseur', '==', fournisseurId));
      const produitSnapshot = await getDocs(produitsQuery).finally(() => this.spinner.hide());
      const produitsList = produitSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return produitsList;
    } catch (error) {
      console.error("Error fetching produits:", error);
      this.spinner.hide()
      throw new Error();
    }
  }
}