import { Component } from '@angular/core';
import { Fournisseur } from '../models/fournisseur.model';
import { FounisseurService } from '../services/founisseur.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../toast.service';

@Component({
  selector: 'app-fournisseur',
  templateUrl: './fournisseur.component.html',
  styleUrls: ['./fournisseur.component.scss']
})
export class FournisseurComponent {
  fournisseurs: Fournisseur[] = [];
  filteredFournisseurs: Fournisseur[] = [];
  newFournisseur: Fournisseur = { nom: '', email: '', adresse: '', telephone: '' };
  updateData: Partial<Fournisseur> = {};  // Données à mettre à jour
  selectedFournisseur: Fournisseur | null = null;
  filterName: string = '';  // Filtrage par nom
  fournisseurForm!: FormGroup;

  constructor(private fournisseurService: FounisseurService, private fb: FormBuilder, private toastService: ToastService) { }

  ngOnInit(): void {
    // Charger les fournisseurs depuis le service
    this.getFournisseurs()
    this.fournisseurForm = this.fb.group({
      nom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      adresse: ['', [Validators.required]],
      telephone: ['']
    });
  }
  getFournisseurs() {
    this.fournisseurService.chargerFournisseurs().then((data) => {
      this.fournisseurs = [...data];
      this.filteredFournisseurs = [...data];  // Initialiser la liste filtrée    
    })

  }
  // Ajouter un fournisseur
  addFournisseur(): void {
    if (this.fournisseurForm.valid) {
      let form = this.fournisseurForm.value
      form.timestamp = new Date().getTime()
      form.lastupdate_timestamp = form.timestamp
      form.nom_lowercase = form.nom.trim().toLowerCase();
      this.fournisseurService.ajouterFournisseur(form).finally(() => {
        this.toastService.showToast('Fournisseur Ajouté', 'success');
        this.getFournisseurs()
        this.fournisseurForm.reset()
      });
    } else {
      console.log("formulaire invalid");
      this.fournisseurForm.markAllAsTouched();
      this.toastService.showToast('Formulaire invalide', 'warning');
    }

  }

  // Supprimer un fournisseur
  deleteFournisseur(id: number): void {
    if (confirm('Etes vous sur de vouloir supprimer ce fournisseur')) {
      this.fournisseurService.supprimerFournisseur(id).finally(() => {
        this.toastService.showToast('Fournisseur Supprimé', 'success');
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
      this.selectedFournisseur = null
      this.updateData = {}
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