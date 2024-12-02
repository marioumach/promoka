import { Component } from '@angular/core';
import { ProduitService } from '../services/produit.service';
import { Fournisseur } from '../models/fournisseur.model';
import { QueryDocumentSnapshot } from 'firebase/firestore';

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
  pageSize = 10; // Taille de la page
  lastDoc: any= null; // Dernier document pour pagination
  hasMoreData: boolean = true; // Flag to track if more data is available

  constructor(private produitService: ProduitService) {}

  ngOnInit(): void {
    this.getProduits();
    this.getFournisseurs();
  }


  async getProduits(): Promise<void> {
    try {
      const { produits, lastDoc } = await this.produitService.getProduits(this.pageSize, this.lastDoc);
      this.produits = [...this.produits, ...produits]; // Ajouter les nouveaux produits à la liste existante
      this.filteredProduits = [...this.produits]; // Mettre à jour les produits filtrés
      this.lastDoc = lastDoc; // Mettre à jour le dernier document pour la pagination
      console.log(produits , lastDoc);
      this.hasMoreData = !!lastDoc;
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    }
  }
  getFournisseurs() {
    this.produitService.getFournisseurs().then(data => {
      this.fournisseurs = data;
    });
  }
  nextPage(): void {
    this.filterName ?this.getProduits() : this.applyFilters(); // Charger la page suivante
  }
  addProduit() {
    this.newProduit.nom_lowercase = this.newProduit.nom.trim().toLowerCase();
    this.newProduit.timestamp = new Date().getTime();
    this.newProduit.lastupdate_timestamp =  this.newProduit.timestamp;

    this.produitService.addProduit(this.newProduit).finally(() => {
      this.newProduit= {};
      this.getProduits();
    });
  }

  deleteProduit(id: number) {
    if (confirm('Etes vous sur de vouloir supprimer ce produit')) {
    this.produitService.deleteProduit(id).finally(() => {
      this.getProduits();
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
    data.nom_lowercase = data.nom.trim().toLowerCase();
    data.lastupdate_timestamp = new Date().getTime();
    console.log('update Product ',data);
    
    this.produitService.updateProduit(id, data).finally(() => {
      console.log("updated Successfully");
      
      this.getProduits();
      this.selectedProduit = null;
    });
  }
  // Champs de filtrage
  filterName: string = '';
  filterFournisseur: string = '';
  filterCodeBarre: string = '';
  // Filtrer les produits en fonction des critères
  async applyFilters(): Promise<void> {
    try {
      const filters = {
        name: this.filterName,
        codeBarre: this.filterCodeBarre,
        fournisseur: this.filterFournisseur,
      };

      const { produits, lastDoc } = await this.produitService.getFilteredProduits(this.pageSize, this.lastDoc, filters);

      this.filteredProduits = produits;
      this.lastDoc = lastDoc;
      this.hasMoreData = !!lastDoc;
    } catch (error) {
      console.error('Erreur lors de l\'application des filtres:', error);
    }
  }
  filterProduits() {
    this.filteredProduits = this.produits.filter(produit => {
      const fournisseur = this.fournisseurs.find(f => f.id === produit.fournisseur) as Fournisseur;
  
      // Check if fournisseur exists and compare the filter with relevant fields
      const isFournisseurMatch = this.filterFournisseur === '' || 
                                 (fournisseur && 
                                  (fournisseur.nom.toLowerCase().includes(this.filterFournisseur.toLowerCase()) ||
                                   (fournisseur.telephone.toString().includes(this.filterFournisseur))));
  
      return (
        (this.filterName === '' || produit.nom.toLowerCase().includes(this.filterName.toLowerCase())) &&
        isFournisseurMatch &&
        (this.filterCodeBarre === '' || produit.codeBarre.includes(this.filterCodeBarre))
      );
    });
  }
}