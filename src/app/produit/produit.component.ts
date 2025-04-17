import { Component } from '@angular/core';
import { ProduitService } from '../services/produit.service';
import { Fournisseur } from '../models/fournisseur.model';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { ToastService } from '../toast.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-produit',
  templateUrl: './produit.component.html',
  styleUrls: ['./produit.component.scss']
})
export class ProduitComponent {
  produits: any[] = [];
  fournisseurs: any[] = [];
  newProduit: any = {};
  selectedProduit: any;
  updateData: any = {};
  filteredProduits: any[] = [];
  paginatedProduits: any[] = [];
  pageSize = 10; // Taille de la page
  lastDoc: any = null; // Dernier document pour pagination
  hasMoreData: boolean = true; // Flag to track if more data is available
  produitForm: FormGroup;

  constructor(private produitService: ProduitService, private toastService: ToastService, private fb: FormBuilder, private titleCasePipe: TitleCasePipe) {
    this.produitForm = this.fb.group({
      nom: ['', [Validators.required]],
      fournisseur: ['', [Validators.required]],
      codeBarre: [''],
      quantite: ['', [Validators.required, Validators.min(1)]],
      prixAchat: ['', [Validators.required, Validators.min(0)]],
      prixVente: ['', [Validators.required, Validators.min(0)]]
    });
    this.produitForm.get('nom')?.valueChanges.subscribe(value => {
      const titleCasedValue = titleCasePipe.transform(value);
      this.produitForm.get('nom')?.setValue(titleCasedValue, { emitEvent: false });
    });
  }

  ngOnInit(): void {
    this.getProduits();
    this.getFournisseurs();
  }
  async getProduits(): Promise<void> {
    try {
      this.produits = await this.produitService.getProducts();
      this.filteredProduits = [...this.produits]; // Mettre à jour les produits filtrés
      this.changePageSize()
      this.updatePaginatedData(); // Initialize pagination
      this.calculatePages(); // If using custom paginator
      this.hasMoreData = false;
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    }
  }
  getFournisseurs() {
    this.produitService.getFournisseurs().then(data => {
      this.fournisseurs = data;
    });
  }

  addProduit() {
    if (this.produitForm.valid) {
      this.newProduit = this.produitForm.value
      this.newProduit.nom = this.titleCasePipe.transform(this.newProduit.nom);
      this.newProduit.nom_lowercase = this.newProduit.nom.trim().toLowerCase();
      this.newProduit.timestamp = new Date().getTime();
      this.newProduit.lastupdate_timestamp = this.newProduit.timestamp;
      this.produitService.addProduit(this.newProduit)
        .finally(() => {
          this.toastService.showToast('produit ajouté', 'success')
          this.getProduits();
          this.produitForm.reset()
          this.newProduit = {};

        });
    } else {
      this.toastService.showToast('Formulaire Invalide', 'warning')
    }
  }

  deleteProduit(id: number) {
    if (confirm('Etes vous sur de vouloir supprimer ce produit')) {
      this.produitService.deleteProduit(id).finally(() => {
        this.getProduits();
        this.toastService.showToast('Produit Supprimé', 'success')

      });
    }
  }

  editProduit(produit: any) {
    this.selectedProduit = produit;
    this.updateData = { ...produit };
    setTimeout(() => {
      const updateProductDiv = document.getElementById('update-product');
      if (updateProductDiv) {
        updateProductDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500);

  }

  updateProduit(id: number, data: any) {
    data.nom = this.titleCasePipe.transform(data.nom);
    data.nom_lowercase = data.nom.trim().toLowerCase();
    data.lastupdate_timestamp = new Date().getTime();

    this.produitService.updateProduit(id, data).finally(() => {
      this.toastService.showToast('Produit Modifié', 'success')
      this.getProduits();
      this.selectedProduit = null;
    });
  }
  // Champs de filtrage
  filterName: string = '';
  filterFournisseur: string = '';
  filterCodeBarre: string = '';
  // Filtrer les produits en fonction des critères

  async applyFilters(last: any = null): Promise<void> {
    try {
      let f = this.fournisseurs.find((f) => this.filterFournisseur && f.nom.toLowerCase().trim().includes(this.filterFournisseur.toLowerCase().trim()))
      const filters = {
        name: this.filterName,
        codeBarre: this.filterCodeBarre,
        fournisseur: f ? f.id : this.filterFournisseur,
      };
      const { produits, lastDoc } = await this.produitService.getFilteredProduits(this.pageSize, last, filters);
      this.filteredProduits = produits;
      this.lastDoc = lastDoc;
      this.hasMoreData = !!lastDoc;
    } catch (error) {
      console.error('Erreur lors de l\'application des filtres:', error);
    }
  }
  filterProduits() {
    const fournisseur = this.fournisseurs.find(f => f.id === this.filterFournisseur);
    
    this.filteredProduits = this.produits.filter(produit => {
      console.log(produit);
      
      const matchesName = this.filterName === '' || (produit.nom || '').toLowerCase().includes(this.filterName.toLowerCase());
      const matchesFournisseur = !this.filterFournisseur || (fournisseur && (produit.fournisseur==fournisseur.id));
      const matchesCodeBarre = this.filterCodeBarre === '' || (produit.codeBarre || '').includes(this.filterCodeBarre);
  
      return matchesName && matchesFournisseur && matchesCodeBarre;
    });
 
    this.changePageSize()
    this.updatePaginatedData(); // Initialize pagination
    this.calculatePages(); // If using custom paginator
  }
  totalPages = 0;

  currentPage = 0
  calculatePages() {
    this.totalPages = Math.ceil(this.filteredProduits.length / this.pageSize);
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePaginatedData();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.updatePaginatedData();
    }
  }

  changePageSize() {
    this.currentPage = 0;
    this.updatePaginatedData();
  }

  // Update your existing updatePaginatedData
  updatePaginatedData() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedProduits = this.filteredProduits.slice(startIndex, endIndex);
    this.calculatePages();
  }
}