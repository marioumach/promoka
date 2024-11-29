import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { environment } from '../app.module';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class FounisseurService {
  private app;
  private db;

  constructor(private spinner : NgxSpinnerService) {
    // Initialize Firebase app
    this.app = initializeApp(environment.firebase);
    this.db = getFirestore(this.app); // Get Firestore instance
  }

  // Charger les fournisseurs depuis Firestore
  async chargerFournisseurs(): Promise<any[]> {
    this.spinner.show()
    const fournisseursCollection = collection(this.db, 'fournisseurs');
    const fournisseurSnapshot = await getDocs(fournisseursCollection).finally(()=>this.spinner.hide());
    const fournisseursList = fournisseurSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return fournisseursList;
  }

  // Ajouter un fournisseur dans Firestore
  async ajouterFournisseur(fournisseur: any): Promise<any> {
    this.spinner.show()
    const fournisseursCollection = collection(this.db, 'fournisseurs');
    const docRef = await addDoc(fournisseursCollection, fournisseur).finally(()=>this.spinner.hide());
    return docRef.id;  // Return the newly created document's ID
  }

  // Supprimer un fournisseur par ID de Firestore
  async supprimerFournisseur(id: any): Promise<void> {
    this.spinner.show()
    const fournisseurDoc = doc(this.db, 'fournisseurs', id);
    return await deleteDoc(fournisseurDoc).finally(()=>this.spinner.hide());
  }

  // Mettre à jour un fournisseur dans Firestore
  async modifierFournisseur(id: any, updatedData: Partial<any>): Promise<void> {
    this.spinner.show()
    const fournisseurDoc = doc(this.db, 'fournisseurs', id);
    return await updateDoc(fournisseurDoc, updatedData).finally(()=>this.spinner.hide());
  }
}