import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProduitService } from '../services/produit.service';
import { FactureService } from '../services/facture.service';
import { ToastService } from '../toast.service';
import { ClientService } from '../services/client.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-facture',
  templateUrl: './facture.component.html',
  styleUrls: ['./facture.component.scss']
})
export class FactureComponent implements OnInit {
  selectedClient: any = null; // Client sélectionné
  produits: any[] = []; // Liste des produits
  filteredProduits: any[] = []; // Produits filtrés
  selectedProducts: any[] = []; // Produits sélectionnés
  filterName = ''; // Filtre par nom de produit
  totalAmount = 0; // Montant total
  totalProduit = 0; // Nombre total de produits
  factureDate: string = new Date().toISOString().split('T')[0]; // Date actuelle (format YYYY-MM-DD)
  clients : any[]=[]
  onClientsSelected(e: any) {
    let id = e.target.value
    this.selectedClient = this.clients.find(f => (f.id) === (id));
    console.log(this.selectedClient);
  }

  constructor(private factureService: FactureService , private produitService : ProduitService,private toastService : ToastService,private clientService : ClientService) {}

  ngOnInit(): void {
    this.getProduits();
    this.getClients();
    this.loadAllfactures()
    // Load Clientss on component initialization

  }
  
  // Fetch the Clientss from the backend
  getClients() {
    this.clientService.chargerClients().then(data => {
      this.clients = data;
    });
  }

  nextPage(): void {
    this.filterName ?this.getProduits() : this.applyFilters(); // Charger la page suivante
  }
  // Add a product to the facture list
  addProductTofacture(product: any, quantity: number) {
    this.toastService.showToast('Produit Ajouté!', 'success');

    const productInfacture = this.selectedProducts.find(p => p.id === product.id);
    if (productInfacture) {
      productInfacture.quantity = quantity;
    } else {
      this.selectedProducts.push({ ...product, quantity });
    }
    this.calculateTotalAmount(); // Recalculate the total amount
  }
    pageSize = 10; // Taille de la page
    lastDoc: any= null; // Dernier document pour pagination
    hasMoreData: boolean = true; // Flag to track if more data is available
    // Filtrer les produits en fonction des critères
    async applyFilters(): Promise<void> {
      try {
        const filters = {
          name: this.filterName,
        };
  
        const { produits, lastDoc } = await this.produitService.getFilteredProduits(this.pageSize, this.lastDoc, filters);
  
        this.filteredProduits = produits;
        this.lastDoc = lastDoc;
        this.hasMoreData = !!lastDoc;
      } catch (error) {
        console.error('Erreur lors de l\'application des filtres:', error);
      }
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
  

  // Filtrer les produits par nom
  filterProduits(): void {
    const filter = this.filterName.toLowerCase();
    this.filteredProduits = this.produits.filter((product) =>
      product.nom.toLowerCase().includes(filter)
    );
  }

  // Vérifier si un produit est déjà dans la liste sélectionnée
  productExistsInSelectedProducts(product: any): boolean {
    return this.selectedProducts.some((p) => p.id === product.id);
  }

  // Ajouter un produit à la facture
  addProductToFacture(product: any, quantity: number): void {
    const existingProduct = this.selectedProducts.find((p) => p.id === product.id);
    if (existingProduct) {
      existingProduct.quantity = quantity;
    } else {
      this.selectedProducts.push({ ...product, quantity });
    }
    this.calculateTotals();
  }

  // Mettre à jour la quantité d'un produit
  updateQuantity(product: any, quantity: number): void {
    product.quantity = quantity;
    this.calculateTotals();
  }
  calculateTotalAmount() {
    this.totalAmount = this.selectedProducts.reduce((total, product) => {
      return total + (product.quantity * product.prixAchat);
    }, 0);
    this.totalProduit = this.selectedProducts.length

  }

  // Supprimer un produit de la liste sélectionnée
  deleteProduct(index: number): void {
    this.selectedProducts.splice(index, 1);
    this.calculateTotals();
  }

  // Calculer les totaux
  calculateTotals(): void {
    this.totalAmount = this.selectedProducts.reduce(
      (sum, product) => sum + product.quantity * product.prixAchat,
      0
    );
    this.totalProduit = this.selectedProducts.reduce((sum, product) => sum + product.quantity, 0);
  }

  // Sauvegarder la facture dans Firestore
  // Save the order to the backend
  saveFacture() {
    const command = {
      client: this.selectedClient,
      products: this.selectedProducts,
      totalAmount: this.totalAmount
    };

    this.factureService.savefacture(command).then(response => {
      this.toastService.showToast('Commande sauvegardée avec succès!', 'success');

      this.loadAllfactures(); // Reload the commands after saving a new one
      this.selectedClient = null
      this.selectedProducts = []
      this.totalAmount = 0
    });
  }

  // Réinitialiser le formulaire
  resetForm(): void {
    this.selectedClient = null;
    this.selectedProducts = [];
    this.totalAmount = 0;
    this.totalProduit = 0;
    this.factureDate = new Date().toISOString().split('T')[0];
  }
  savedfactures:any[]=[]
    // Load all saved factures from the backend
    loadAllfactures() {
      this.factureService.getAllfactures().then(factures => {
        this.savedfactures = factures;
      });
    }
    // Variable to store selected fournisseur
    selectedfacture: any = null;
  
    // Toggle the details visibility
    viewDetails(facture: any): void {
      this.selectedfacture = { ...facture }; // Clone the facture to avoid modifying the original until save
      this.selectedfacture.isEditing = false; // Start with non-editing state
  
    }
    deletefacture(factureId: number) {
      // Logic to delete a facture based on factureId
      console.log(`Deleting facture with ID: ${factureId}`);
      // Call your API service to delete the facture
      this.factureService.deletefacture(factureId).then(
        () => {
          this.loadAllfactures()
          alert('facturee supprimée avec succès');
        },
        (error) => {
          console.error('Error deleting facture:', error);
          alert('Erreur lors de la suppression de la facturee');
        }
      );
    }
    droit = 1
    generatePDF(facture: any): void {
      const doc = new jsPDF();
  
      // Title - Centered
      const title = 'Détails de la facturee';
      doc.setFontSize(16);
      const pageWidth = doc.internal.pageSize.getWidth();
      const titleWidth = doc.getTextWidth(title);
      const titleX = (pageWidth - titleWidth) / 2; // Center the title
      doc.text(title, titleX, 20); // Centered title at Y = 20
  
      // Date and Fournisseur Name on the Same Row
      const currentDate = new Date().toLocaleDateString('fr-FR'); // Format date to DD/MM/YYYY
      const clientName = facture.client.nom || 'Client Inconnu'; // Assuming fournisseur exists in the selectedfacture object
      doc.setFontSize(12);
  
      // Add Fournisseur Name to the Left
      doc.text(`Client: ${clientName}`, 14, 30); // Left-aligned at X = 14, Y = 30
  
      // Add Date to the Right
      doc.text(`Date: ${currentDate}`, pageWidth - 14, 30, { align: 'right' }); // Right-aligned at X = pageWidth - 14, Y = 30
  
      // Products Table
      const productData = facture.products.map((product: any, index: number) => [
        index + 1,
        product.nom,
        product.quantity,
        product.prixAchat.toFixed(3),
        (product.quantity * product.prixAchat).toFixed(3),
      ]);
  
      // Calculate totals
      const totalCartons = facture.products.reduce(
        (sum: number, product: any) => sum + product.quantity,
        0
      );
      const totalAmount = facture.products.reduce(
        (sum: number, product: any) => sum + product.quantity * product.prixAchat,
        0
      );
  
      autoTable(doc, {
        startY: 40,
        head: [['#', 'Nom du Produit', 'Quantité', 'Prix Unitaire (Dt)', 'Sous-Total (Dt)']],
        body: productData,
        foot: [[
          'Total',
          facture.products.length + ' produits', // Empty column for #
         
          totalCartons.toString()+ ' cartons',
          '', // Empty column for Prix Unitaire
          totalAmount.toFixed(3) + ' dinars', // Total sous-total
        ]],
        footStyles: {
          fillColor: [220, 220, 220],
          textColor:[0,0,0],
          fontStyle: 'bold',
        },
      });
  
      // Save PDF
      doc.save(`facturee-${facture.id || new Date().toISOString()}.pdf`);
    }
}