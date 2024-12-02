import { Component } from '@angular/core';
import { Client } from '../models/client.model';
import { ClientService } from '../services/client.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastService } from '../toast.service';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent {
  Clients: Client[] = [];
  filteredClients: Client[] = [];
  newClient: Client = { nom: '', email: '', adresse: '', telephone: '' , matricule:''};
  updateData: Partial<Client> = {};  // Données à mettre à jour
  selectedClient: Client | null = null;
  filterName: string = '';  // Filtrage par nom
  ClientForm!: FormGroup;

  constructor(private ClientService: ClientService, private fb: FormBuilder, private toastService: ToastService) { }

  ngOnInit(): void {
    // Charger les Clients depuis le service
    this.getClients()
    this.ClientForm = this.fb.group({
      nom: ['', [Validators.required]],
      matricule: ['', [Validators.required]],
      adresse: ['', [Validators.required]],
      telephone: ['', [Validators.required, Validators.pattern(/^(7|9|2|5|4)\d{7,10}$/)]]
    });
  }
  getClients() {
    this.ClientService.chargerClients().then((data) => {
      this.Clients = [...data];
      this.filteredClients = [...data];  // Initialiser la liste filtrée    
    })

  }
  // Ajouter un Client
  addClient(): void {
    if (this.ClientForm.valid) {
      let form = this.ClientForm.value
      form.timestamp = new Date().getTime()
      form.lastupdate_timestamp = form.timestamp
      form.nom_lowercase = form.nom.trim().toLowerCase();
      this.ClientService.ajouterClient(form).finally(() => {
        this.toastService.showToast('Client Ajouté', 'success');
        this.getClients()
        this.ClientForm.reset()
      });
    } else {
      console.log("formulaire invalid");
      this.ClientForm.markAllAsTouched();
      this.toastService.showToast('Formulaire invalide', 'warning');
    }

  }

  // Supprimer un Client
  deleteClient(id: number): void {
    if (confirm('Etes vous sur de vouloir supprimer ce Client')) {
      this.ClientService.supprimerClient(id).finally(() => {
        this.toastService.showToast('Client Supprimé', 'success');
        this.getClients()
      });
    }
  }

  // Sélectionner un Client pour modification
  editClient(Client: Client): void {
    this.selectedClient = Client;
    this.updateData = Client  // Pré-remplir les données de mise à jour
  }

  // Mettre à jour un Client
  updateClient(id: number, updatedData: Partial<Client>): void {
    this.ClientService.modifierClient(id, updatedData).finally(() => {
      this.getClients()
      this.selectedClient = null
      this.updateData = {}
    });
  }

  // Filtrer les Clients par nom
  filterClients(): void {
    if (this.filterName) {
      this.filteredClients = this.Clients.filter(f => f.nom.toLowerCase().includes(this.filterName.toLowerCase()));
    } else {
      this.filteredClients = [...this.Clients];
    }
  }
}