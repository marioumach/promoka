import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { environment } from '../app.module';

@Injectable({
  providedIn: 'root'
})
export class FounisseurService {
  private app;
  private db;

  constructor() {
    // Initialize Firebase app
    this.app = initializeApp(environment.firebase);
    this.db = getFirestore(this.app); // Get Firestore instance
  }

  // Charger les fournisseurs depuis Firestore
  async chargerFournisseurs(): Promise<any[]> {
    const fournisseursCollection = collection(this.db, 'fournisseurs');
    const fournisseurSnapshot = await getDocs(fournisseursCollection);
    const fournisseursList = fournisseurSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return fournisseursList;
  }

  // Ajouter un fournisseur dans Firestore
  async ajouterFournisseur(fournisseur: any): Promise<any> {
    const fournisseursCollection = collection(this.db, 'fournisseurs');
    const docRef = await addDoc(fournisseursCollection, fournisseur);
    return docRef.id;  // Return the newly created document's ID
  }

  // Supprimer un fournisseur par ID de Firestore
  async supprimerFournisseur(id: any): Promise<void> {
    const fournisseurDoc = doc(this.db, 'fournisseurs', id);
    await deleteDoc(fournisseurDoc);
  }

  // Mettre à jour un fournisseur dans Firestore
  async modifierFournisseur(id: any, updatedData: Partial<any>): Promise<void> {
    const fournisseurDoc = doc(this.db, 'fournisseurs', id);
    await updateDoc(fournisseurDoc, updatedData);
  }
}