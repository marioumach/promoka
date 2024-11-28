import { Component } from '@angular/core';
import { Fournisseur } from '../models/fournisseur.model';
import { FounisseurService } from '../services/founisseur.service';

@Component({
  selector: 'app-fournisseur',
  templateUrl: './fournisseur.component.html',
  styleUrls: ['./fournisseur.component.scss']
})
export class FournisseurComponent {
  fournisseurs: Fournisseur[] = [];
  filteredFournisseurs: Fournisseur[] = [];
  newFournisseur: Fournisseur = { id: 0, nom: '', email: '', adresse: '', telephone: '' };
  updateData: Partial<Fournisseur> = {};  // Données à mettre à jour
  selectedFournisseur: Fournisseur | null = null;
  filterName: string = '';  // Filtrage par nom

  constructor(private fournisseurService: FounisseurService) { }

  ngOnInit(): void {
    // Charger les fournisseurs depuis le service
    this.getFournisseurs()
  }
  getFournisseurs() {
    this.fournisseurService.chargerFournisseurs().then((data) => {
      this.fournisseurs = data;
      this.filteredFournisseurs = data;  // Initialiser la liste filtrée    
    })

  }
  // Ajouter un fournisseur
  addFournisseur(): void {
    if (this.newFournisseur.nom && this.newFournisseur.email) {
      this.fournisseurService.ajouterFournisseur(this.newFournisseur).finally(() => {
       this.getFournisseurs()
        this.newFournisseur = { id: 0, nom: '', email: '', adresse: '', telephone: '' };  // Réinitialiser le formulaire
      });
    }
  }

  // Supprimer un fournisseur
  deleteFournisseur(id: number): void {
    if (confirm('Etes vous sur de vouloir supprimer ce fournisseur')) {
      this.fournisseurService.supprimerFournisseur(id).finally(() => {
        this.getFournisseurs()
      });
    }
  }

  // Sélectionner un fournisseur pour modification
  editFournisseur(fournisseur: Fournisseur): void {
    this.selectedFournisseur = fournisseur;
    this.updateData = fournisseur  // Pré-remplir les données de mise à jour
  }

  // Mettre à jour un fournisseur
  updateFournisseur(id: number, updatedData: Partial<Fournisseur>): void {
    this.fournisseurService.modifierFournisseur(id, updatedData).finally(() => {
      this.getFournisseurs()
    });
  }

  // Filtrer les fournisseurs par nom
  filterFournisseurs(): void {
    if (this.filterName) {
      this.filteredFournisseurs = this.fournisseurs.filter(f => f.nom.toLowerCase().includes(this.filterName.toLowerCase()));
    } else {
      this.filteredFournisseurs = [...this.fournisseurs];
    }
  }
}