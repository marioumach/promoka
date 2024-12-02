import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../app.module';

@Injectable({
  providedIn: 'root'
})
export class FactureService {
  private db;

  constructor(private spinner : NgxSpinnerService) {
    // Initialize Firebase app
    const app = initializeApp(environment.firebase);
    this.db = getFirestore(app); // Get Firestore instance
  }

  // Save the facture (order) to Firestore
  async savefacture(facture: any): Promise<any> {
    try {
      this.spinner.show()
      const facturesCollection = collection(this.db, 'factures');
      const docRef = await addDoc(facturesCollection, facture).finally(()=>this.spinner.hide());
      console.log("facture saved with ID:", docRef.id);
      return docRef.id;  // Return the ID of the newly created document
    } catch (error) {
      console.error("Error adding facture:", error);
      this.spinner.hide()
      throw new Error();
    }
  }

  // Get all factures from Firestore
  async getAllfactures(): Promise<any[]> {
    try {
      this.spinner.show()
      const facturesCollection = collection(this.db, 'factures');
      const facturesSnapshot = await getDocs(facturesCollection).finally(()=>this.spinner.hide());
      const facturesList = facturesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return facturesList;
    } catch (error) {
      console.error("Error fetching factures:", error);
      this.spinner.hide()
      throw new Error();
    }
  }

  // Delete a facture by ID from Firestore
  async deletefacture(facturId: any): Promise<void> {
    try {
      this.spinner.show()
      const facturDoc = doc(this.db, 'factures', facturId);
      await deleteDoc(facturDoc).finally(()=>this.spinner.hide());
      console.log("facture deleted with ID:", facturId);
    } catch (error) {
      console.error("Error deleting facture:", error);
      this.spinner.hide()
      throw new Error();
    }
  }

  // Update a facture in Firestore
  async updatefacture(facturId: any, updatedData: any): Promise<void> {
    try {
      this.spinner.show()
      const facturDoc = doc(this.db, 'factures', facturId);
      await updateDoc(facturDoc, updatedData).finally(()=>this.spinner.hide());
      console.log("facture updated with ID:", facturId);
    } catch (error) {
      console.error("Error updating facture:", error);
      this.spinner.hide()
      throw new Error();
    }
  }
}