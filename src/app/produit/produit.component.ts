import { Component } from '@angular/core';
import { ProduitService } from '../services/produit.service';

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

  constructor(private produitService: ProduitService) {}

  ngOnInit(): void {
    this.getProduits();
    this.getFournisseurs();
  }

  getProduits() {
    this.produitService.getProduits().then(data => {
      this.produits = data;
      this.filteredProduits = data;
    });
  }

  getFournisseurs() {
    this.produitService.getFournisseurs().then(data => {
      this.fournisseurs = data;
    });
  }

  addProduit() {
    this.produitService.addProduit(this.newProduit).finally(() => {
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
  }

  updateProduit(id: number, data: any) {
    this.produitService.updateProduit(id, data).finally(() => {
      this.getProduits();
      this.selectedProduit = null;
    });
  }
  // Champs de filtrage
  filterName: string = '';
  filterFournisseur: string = '';
  filterCodeBarre: string = '';
  // Filtrer les produits en fonction des critères
  filterProduits() {
    this.filteredProduits = this.produits.filter(produit => {
      // Find the fournisseur details using the fournisseur ID
      const fournisseur = this.fournisseurs.find(f => f.id === produit.fournisseur);
  
      // Check if fournisseur exists and compare the filter with relevant fields
      const isFournisseurMatch = this.filterFournisseur === '' || 
                                 (fournisseur && 
                                  (fournisseur.name.toLowerCase().includes(this.filterFournisseur.toLowerCase()) ||
                                   fournisseur.phone.includes(this.filterFournisseur)));
  
      return (
        (this.filterName === '' || produit.nom.toLowerCase().includes(this.filterName.toLowerCase())) &&
        isFournisseurMatch &&
        (this.filterCodeBarre === '' || produit.codeBarre.includes(this.filterCodeBarre))
      );
    });
  }
}