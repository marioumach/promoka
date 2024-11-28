import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {

  private apiUrl = 'http://192.168.1.11:3000/commandes'; // L'URL de l'API backend pour les produits

  constructor(private http: HttpClient) {}
  // Save the command (order) to the backend
  saveCommand(command: any): Promise<any> {
    return lastValueFrom(this.http.post(`${this.apiUrl}`, command)); // Replace with the correct endpoint
  }

  getAllCommands(): Promise<any[]> {
    return lastValueFrom(this.http.get<any[]>(`${this.apiUrl}`)); // This returns a list of commands
  }
  deleteCommand(commandId: number): Promise<any> {
    return lastValueFrom(this.http.delete(`${this.apiUrl}/${commandId}`));
  }
  updateCommand(command: any) {
    return lastValueFrom(this.http.put(`${this.apiUrl}/${command.id}`, command));
  }
}
