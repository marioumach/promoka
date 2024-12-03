import { Component } from '@angular/core';
import { ProduitService } from '../services/produit.service';
import { CommandeService } from '../services/commande.service';
import { Fournisseur } from '../models/fournisseur.model';
import { ToastService } from '../toast.service';
import { Produit } from '../models/produit.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-commande',
  templateUrl: './commande.component.html',
  styleUrls: ['./commande.component.scss']
})
export class CommandeComponent {
  fournisseurs: any[] = [];
  produits: any[] = [];
  selectedFournisseur: any = null;
  selectedProducts: any[] = [];
  totalAmount: number = 0;
  totalProduit: number = 0;
  totalCarton: number = 0;
  savedCommands: any[] = []; // Store all saved commands
  availableProducts: any[] = []; // Products available from the fournisseur

  constructor(private produitService: ProduitService, private commandeService: CommandeService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.getFournisseurs(); // Load fournisseurs on component initialization
    this.loadAllCommands(); // Load all saved commands from the backend
  }

  // Fetch the fournisseurs from the backend
  getFournisseurs() {
    this.produitService.getFournisseurs().then(data => {
      this.fournisseurs = data;
    });
  }

  // Fetch the products of the selected fournisseur from the backend
  onFournisseurSelected(e: any) {
    let id = e.target.value
    console.log(this.fournisseurs[0].id, id);

    this.selectedFournisseur = this.fournisseurs.find(f => (f.id) === (id));
    console.log(this.selectedFournisseur);

    this.produitService.getProduitsByFournisseur(id).then(data => {
      this.produits = data;
      this.filteredProduits = data
    });
  }

  // Add a product to the command list
  addProductToCommand(product: any, quantity: number) {
    this.toastService.showToast('Produit Ajouté!', 'success');

    const productInCommand = this.selectedProducts.find(p => p.id === product.id);
    if (productInCommand) {
      productInCommand.quantity = quantity;
    } else {
      this.selectedProducts.push({ ...product, quantity });
    }
    this.calculateTotalAmount(); // Recalculate the total amount
  }
  productExistsInSelectedProducts(product: any): boolean {
    return this.selectedProducts.some(existingProduct => existingProduct.id === product.id);
  }

  // Calculate the total amount of the order
  calculateTotalAmount() {
    this.totalAmount = this.selectedProducts.reduce((total, product) => {
      return total + (product.quantity * product.prixAchat);
    }, 0);
    this.totalProduit = this.selectedProducts.length
    this.totalCarton = this.selectedProducts.reduce((sum: number, product: any) => sum + product.quantity, 0);

  }
  addProduct(product: any) {
    if (product.selectedQuantity > 0) {
      this.toastService.showToast('Produit Ajouté!', 'success');

      const newProduct = {
        ...product,
        quantity: product.selectedQuantity,
      };
      this.selectedCommand.products.push(newProduct); // Add to the products list
      product.selectedQuantity = 0; // Reset the quantity input

      this.updateTotalAmount();
    } else {
      alert('Please enter a valid quantity.');
    }
  }
  updateQuantity(product: any, quantity: number): void {
    this.calculateTotalAmount(); // Recalculate the total amount
  }
  deleteProduct(index: number): void {
    this.selectedProducts.splice(index, 1);
    this.toastService.showToast('Produit supprimé', 'success');
    this.calculateTotalAmount(); // Recalculate the total amount
  }
  areAllSelected: boolean = false;

  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.areAllSelected = isChecked;
    this.selectedCommand.products.forEach((product: any) => product.isSelected = isChecked);
  }

  updateSelectionState(): void {
    this.areAllSelected = this.selectedCommand.products.every((product: any) => product.isSelected);
  }

  get totalProducts() {
    return this.selectedCommand.products.length
  }
  get totalCartons() {
    return this.selectedCommand.products.reduce((sum: number, product: any) => sum + product.quantity, 0);
  }
  // Save the order to the backend
  saveCommand() {
    const command = {
      fournisseur: this.selectedFournisseur,
      products: this.selectedProducts,
      totalAmount: this.totalAmount,
      timestamp : new Date().getTime()
    };

    this.commandeService.saveCommand(command).then(response => {
      this.toastService.showToast('Commande sauvegardée avec succès!', 'success');

      this.loadAllCommands(); // Reload the commands after saving a new one
      this.selectedFournisseur = null
      this.selectedProducts = []
      this.totalAmount = 0
    });
  }

  // Load all saved commands from the backend
  loadAllCommands() {
    this.commandeService.getAllCommands().then(commands => {
      this.savedCommands = commands;
    });
  }
  // Variable to store selected fournisseur
  selectedCommand: any = null;

  // Toggle the details visibility
  viewDetails(command: any): void {
    this.selectedCommand = { ...command }; // Clone the command to avoid modifying the original until save
    this.selectedCommand.isEditing = false; // Start with non-editing state
    this.loadAvailableProducts(command.fournisseur.id); // Load available products for this fournisseur

  }
  // Load available products from fournisseur, excluding products already in the command
  loadAvailableProducts(fournisseurId: number) {
    this.produitService.getProduitsByFournisseur(fournisseurId).then((products) => {
      // Filter products that are already in the selected command
      this.availableProducts = products.filter(
        (product) => !this.selectedCommand.products.some((p: any) => p.id === product.id)
      );

      // Initialize selectedQuantity for each available product
      this.availableProducts.forEach(product => {
        product.selectedQuantity = 0; // Start with quantity 0
      });
    });
  }
  deleteCommand(commandId: number) {
    // Logic to delete a command based on commandId
    console.log(`Deleting command with ID: ${commandId}`);
    // Call your API service to delete the command
    this.commandeService.deleteCommand(commandId).then(
      () => {
        this.loadAllCommands()
        alert('Commande supprimée avec succès');
      },
      (error) => {
        console.error('Error deleting command:', error);
        alert('Erreur lors de la suppression de la commande');
      }
    );
  }
  cancelEdit() {
    this.selectedCommand = null; // Deselect the command
  }
  // Remove a product from the list
  removeProduct(index: number) {
    if (confirm('Are you sure you want to remove this product?')) {
      this.selectedCommand.products.splice(index, 1);
      this.updateTotalAmount(); // Remove the product from the array
    }
  }
  editCommand() {
    this.selectedCommand.isEditing = true; // Enable editing mode
  }
  updateTotalAmount() {
    let totalAmount = 0;
    this.selectedCommand.products.forEach((product: any) => {
      totalAmount += product.quantity * product.prixAchat; // Assuming each product has a prixAchat field
    });
    this.selectedCommand.totalAmount = totalAmount; // Update the totalAmount field in the selected command

  }
  updateCommand() {
    this.commandeService.updateCommand(this.selectedCommand.id, this.selectedCommand).then(
      (updatedCommand: any) => {
        // Update the local list of commands after successful save
        const index = this.savedCommands.findIndex(cmd => (cmd.id) === (updatedCommand.id));
        this.savedCommands[index] = updatedCommand;
        this.selectedCommand = null; // Deselect the command after saving
        alert('Commande mise à jour avec succès');
        this.loadAllCommands()
      },
      (error) => {
        console.error('Error updating command:', error);
        alert('Erreur lors de la mise à jour de la commande');
      }
    );
  }
  filterName = ''
  filteredProduits: any[] = []
  filterProduits() {
    this.filteredProduits = this.produits.filter(produit => {
      // Find the fournisseur details using the fournisseur ID
      const fournisseur = this.fournisseurs.find(f => f.id === produit.fournisseur) as Fournisseur;

      // Check if fournisseur exists and compare the filter with relevant fields


      return (
        (this.filterName === '' || produit.nom.toLowerCase().includes(this.filterName.toLowerCase())));
    });
  }
  generatePDF(command: any): void {
    const doc = new jsPDF();

    // Title - Centered
    const title = 'Détails de la Commande';
    doc.setFontSize(16);
    const pageWidth = doc.internal.pageSize.getWidth();
    const titleWidth = doc.getTextWidth(title);
    const titleX = (pageWidth - titleWidth) / 2; // Center the title
    doc.text(title, titleX, 20); // Centered title at Y = 20

    // Date and Fournisseur Name on the Same Row
    const currentDate = new Date().toLocaleDateString('fr-FR'); // Format date to DD/MM/YYYY
    const fournisseurName = command.fournisseur.nom || 'Fournisseur Inconnu'; // Assuming fournisseur exists in the selectedCommand object
    doc.setFontSize(12);

    // Add Fournisseur Name to the Left
    doc.text(`Fournisseur: ${fournisseurName}`, 14, 30); // Left-aligned at X = 14, Y = 30

    // Add Date to the Right
    doc.text(`Date: ${currentDate}`, pageWidth - 14, 30, { align: 'right' }); // Right-aligned at X = pageWidth - 14, Y = 30

    // Products Table
    const productData = command.products.map((product: any, index: number) => [
      index + 1,
      product.nom,
      product.quantity,
      product.prixAchat.toFixed(3),
      (product.quantity * product.prixAchat).toFixed(3),
    ]);

    // Calculate totals
    const totalCartons = command.products.reduce(
      (sum: number, product: any) => sum + product.quantity,
      0
    );
    const totalAmount = command.products.reduce(
      (sum: number, product: any) => sum + product.quantity * product.prixAchat,
      0
    );

    autoTable(doc, {
      startY: 40,
      head: [['#', 'Nom du Produit', 'Quantité', 'Prix Unitaire (Dt)', 'Sous-Total (Dt)']],
      body: productData,
      foot: [[
        'Total',
        command.products.length + ' produits', // Empty column for #
       
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
    doc.save(`commande-${command.id || new Date().toISOString()}.pdf`);
  }
}