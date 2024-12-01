import { Component } from '@angular/core';
import { ProduitService } from '../services/produit.service';
import { CommandeService } from '../services/commande.service';
import { Fournisseur } from '../models/fournisseur.model';

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
  savedCommands: any[] = []; // Store all saved commands
  availableProducts: any[] = []; // Products available from the fournisseur

  constructor(private produitService: ProduitService, private commandeService: CommandeService) { }

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
  }
  addProduct(product: any) {
    if (product.selectedQuantity > 0) {
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
    this.calculateTotalAmount(); // Recalculate the total amount
  }
  // Save the order to the backend
  saveCommand() {
    const command = {
      fournisseur: this.selectedFournisseur,
      products: this.selectedProducts,
      totalAmount: this.totalAmount
    };

    this.commandeService.saveCommand(command).then(response => {
      alert('Commande sauvegardée avec succès!');
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
    this.commandeService.updateCommand(this.selectedCommand.id,this.selectedCommand).then(
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
  filterName =''
  filteredProduits:any[]=[]
  filterProduits() {
    this.filteredProduits = this.produits.filter(produit => {
      // Find the fournisseur details using the fournisseur ID
      const fournisseur = this.fournisseurs.find(f => f.id === produit.fournisseur) as Fournisseur;
  
      // Check if fournisseur exists and compare the filter with relevant fields
      
  
      return (
        (this.filterName === '' || produit.nom.toLowerCase().includes(this.filterName.toLowerCase())));
    });
  }
}