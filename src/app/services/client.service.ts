import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../app.module';
import { initializeApp } from 'firebase/app';
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private app;
  private db;

  constructor(private spinner : NgxSpinnerService) {
    // Initialize Firebase app
    this.app = initializeApp(environment.firebase);
    this.db = getFirestore(this.app); // Get Firestore instance
  }

  // Charger les clients depuis Firestore
  async chargerClients(): Promise<any[]> {
    this.spinner.show()
    const clientsCollection = collection(this.db, 'clients');
    const clientSnapshot = await getDocs(clientsCollection).finally(()=>this.spinner.hide());
    const clientsList = clientSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return clientsList;
  }

  // Ajouter un client dans Firestore
  async ajouterClient(client: any): Promise<any> {
    this.spinner.show()
    const clientsCollection = collection(this.db, 'clients');
    const docRef = await addDoc(clientsCollection, client).finally(()=>this.spinner.hide());
    return docRef.id;  // Return the newly created document's ID
  }

  // Supprimer un client par ID de Firestore
  async supprimerClient(id: any): Promise<void> {
    this.spinner.show()
    const clientDoc = doc(this.db, 'clients', id);
    return await deleteDoc(clientDoc).finally(()=>this.spinner.hide());
  }

  // Mettre à jour un client dans Firestore
  async modifierClient(id: any, updatedData: Partial<any>): Promise<void> {
    this.spinner.show()
    const clientDoc = doc(this.db, 'clients', id);
    return await updateDoc(clientDoc, updatedData).finally(()=>this.spinner.hide());
  }
}