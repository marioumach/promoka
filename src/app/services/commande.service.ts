import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { environment } from '../app.module';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private db;

  constructor(private spinner : NgxSpinnerService) {
    // Initialize Firebase app
    const app = initializeApp(environment.firebase);
    this.db = getFirestore(app); // Get Firestore instance
  }

  // Save the command (order) to Firestore
  async saveCommand(command: any): Promise<any> {
    try {
      this.spinner.show()
      const commandsCollection = collection(this.db, 'commandes');
      const docRef = await addDoc(commandsCollection, command).finally(()=>this.spinner.hide());
      console.log("Command saved with ID:", docRef.id);
      return docRef.id;  // Return the ID of the newly created document
    } catch (error) {
      console.error("Error adding command:", error);
      this.spinner.hide()
      throw new Error();
    }
  }

  // Get all commands from Firestore
  async getAllCommands(): Promise<any[]> {
    try {
      this.spinner.show()
      const commandesCollection = collection(this.db, 'commandes');
      const commandesSnapshot = await getDocs(commandesCollection).finally(()=>this.spinner.hide());
      const commandesList = commandesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return commandesList;
    } catch (error) {
      console.error("Error fetching commands:", error);
      this.spinner.hide()
      throw new Error();
    }
  }

  // Delete a command by ID from Firestore
  async deleteCommand(commandId: any): Promise<void> {
    try {
      this.spinner.show()
      const commandDoc = doc(this.db, 'commandes', commandId);
      await deleteDoc(commandDoc).finally(()=>this.spinner.hide());
      console.log("Command deleted with ID:", commandId);
    } catch (error) {
      console.error("Error deleting command:", error);
      this.spinner.hide()
      throw new Error();
    }
  }

  // Update a command in Firestore
  async updateCommand(commandId: any, updatedData: any): Promise<void> {
    try {
      this.spinner.show()
      const commandDoc = doc(this.db, 'commandes', commandId);
      await updateDoc(commandDoc, updatedData).finally(()=>this.spinner.hide());
      console.log("Command updated with ID:", commandId);
    } catch (error) {
      console.error("Error updating command:", error);
      this.spinner.hide()
      throw new Error();
    }
  }
}