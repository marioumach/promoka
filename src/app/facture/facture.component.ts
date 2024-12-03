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
  clients: any[] = []
  onClientsSelected(e: any) {
    let id = e.target.value
    this.selectedClient = this.clients.find(f => (f.id) === (id));
  }

  constructor(private factureService: FactureService, private produitService: ProduitService, private toastService: ToastService, private clientService: ClientService) { }

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
    this.filterName ? this.getProduits() : this.applyFilters(); // Charger la page suivante
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
  lastDoc: any = null; // Dernier document pour pagination
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
      this.produits = [...produits]; // Ajouter les nouveaux produits à la liste existante
      this.filteredProduits = [...this.produits]; // Mettre à jour les produits filtrés
      this.lastDoc = lastDoc; // Mettre à jour le dernier document pour la pagination
      console.log(produits, lastDoc);
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
      return total + (product.quantity * product.prixVente);
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
      (sum, product) => sum + product.quantity * product.prixTotal,
      0
    );
    this.totalProduit = this.selectedProducts.length
  }

  // Sauvegarder la facture dans Firestore
  // Save the order to the backend
  saveFacture() {
    const command = {
      client: this.selectedClient,
      products: this.selectedProducts,
      totalAmount: this.totalAmount,
      timestamp : new Date().getTime()
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
  savedfactures: any[] = []
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
  loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (error) => reject(error);
    });
  }
  async generatePDF(facture: any) {
    const doc = new jsPDF('p', 'mm', 'a4', true);
    let factureDate = new Date()
    facture.timestamp ? factureDate.setTime(facture.timestamp) :''
    doc.setFont('helvetica', 'bold'); // Appliquer le gras

    const logo = await this.loadImage('/assets/images/logo1.png');
    let factureNumber = (this.savedfactures.length+300).toString() + "/" + factureDate.getFullYear().toString()
    // Titre principal
    doc.addImage(logo, 'PNG', 15, 10, 60, 30); // Position (x, y) et taille (width, height)

    // Informations de l'entreprise en haut à droite
    doc.setFontSize(11);
    doc.text(`Sousse le ${factureDate.toLocaleDateString('fr-FR')}`, 130, 16);
    doc.text('PROMOKA SHOP', 130, 24,);
    doc.text('ADRESSE : Rue 2 mars Akouda', 130, 32);
    doc.text('MF : 185560Y/N/M000', 130, 40);

    // Date et numéro de facture centré
    doc.setFontSize(16);
    doc.text(`FACTURE N° ${factureNumber}`, 105, 56, { align: 'center' });
    doc.setFontSize(11);

    // Informations du client
    doc.text('CLIENT : ', 14, 72);
    doc.text(facture.client.nom, 40, 72);
    doc.text('ADRESSE : ', 14, 80);
    doc.text(facture.client.adresse, 40, 80);
    doc.text('MF : ', 14, 88);
    doc.text(facture.client.matricule, 40, 88);
    let totalAmount = facture.products.reduce((total: any, product: any) => {
      return total + (product.quantity * product.prixVente);
    }, 0);
    let rows = facture.products.map((p: any) => [
      p.nom,
      p.quantity.toString(),
      p.prixVente.toFixed(3),
      (p.prixVente * p.quantity).toFixed(3)
    ])
    // Ajouter des lignes vides pour atteindre 24 lignes
    const totalRows = 16; // Nombre total de lignes souhaité
    while (rows.length < totalRows - 4) { // Réserver 4 lignes pour les totaux
      rows.push(['', '', '', '']);
    }

    // Ajouter les lignes pour les totaux
    rows.push(
      ['', '', 'Total HT', totalAmount.toFixed(3)],
      ['', '', 'TVA', '0.000'],
      ['', '', 'Droit de Timbre', this.droit.toFixed(3)],
      ['', '', 'Total TTC', (totalAmount + this.droit).toFixed(3)]
    );
    autoTable(doc, {
      startY: 104,
      head: [['Désignation', 'Quantité / SAC', 'Prix Unitaire HT', 'Prix Total HT']],
      body: rows,
      styles: {
        halign: 'center', // Alignement horizontal des cellules
        fontSize: 10, // Taille de la police pour tout le tableau
        textColor: [0, 0, 0], // Couleur du texte : noir
        fillColor: [255, 255, 255], // Couleur de fond : blanc
        lineColor: [0, 0, 0], // Couleur des bordures : noir
        lineWidth: 0.1 // Épaisseur des bordures
      },
      headStyles: {
        fillColor: [19, 20, 77], // Couleur de fond de l'en-tête : gris
        textColor: [255, 255, 255], // Couleur du texte de l'en-tête : blanc
        fontSize: 12, // Taille de la police pour l'en-tête
        halign: 'center' // Alignement horizontal de l'en-tête
      },
      bodyStyles: {
        fillColor: [255, 255, 255], // Couleur de fond des lignes : blanc
        textColor: [0, 0, 0], // Couleur du texte des lignes : noir
        fontSize: 11, // Taille de la police pour l'en-tête

      },
    
      columnStyles: {
        0: { halign: 'left' }, // Alignement à gauche pour la désignation
        3: { fontStyle: 'bold' } // Mettre en gras la colonne des totaux
      },
      alternateRowStyles : {
        fillColor: [255, 255, 255], // Couleur de fond des lignes : blanc
        textColor: [0, 0, 0] // Couleur du texte des lignes : noir
      },
     
    });

    // Cachet et signature en bas à droite de la page
    const pageHeight = doc.internal.pageSize.height; // Hauteur de la page
    const pageWidth = doc.internal.pageSize.width; // Largeur de la page

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold'); // Appliquer le gras

    doc.text('Cachet et Signature', pageWidth - 70, pageHeight - 50); // Texte positionné en bas à droite
    // Sauvegarder le PDF
    doc.save(`Facture_${factureNumber}.pdf`);
  }
}