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
  paginatedProduits: any[] = []; // Produits filtrés
  selectedProducts: any[] = []; // Produits sélectionnés
  filterName = ''; // Filtre par nom de produit
  totalAmount = 0; // Montant total
  totalProduit = 0; // Nombre total de produits
  factureDate: string = new Date().toISOString().split('T')[0]; // Date actuelle (format YYYY-MM-DD)
  factureNumber : any
  clients: any[] = []
  year = new Date().getFullYear()
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
      this.produits = await this.produitService.getProducts();
      this.filteredProduits = [...this.produits]; // Mettre à jour les produits filtrés
      this.hasMoreData = false; 
      this.changePageSize()
      this.updatePaginatedData(); // Initialize pagination
      this.calculatePages(); // If using custom paginator
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    }
  }

  changeQuantity(product: any, change: number) {
    const newQuantity = (product.quantity || 0) + change;
    product.quantity = Math.max(1, newQuantity);
    this.calculateTotalAmount()  }
  // Filtrer les produits par nom
  filterProduits(): void {
    const filter = this.filterName.toLowerCase();
    this.filteredProduits = this.produits.filter((product) =>
      product.nom.toLowerCase().includes(filter)
    );
    this.changePageSize()
    this.updatePaginatedData(); // Initialize pagination
    this.calculatePages(); // If using custom paginator
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
      timestamp : new Date(this.factureDate).getTime(),
      numero : this.factureNumber
    };
    this.factureService.savefacture(command).then(response => {
      this.toastService.showToast('Facture sauvegardée avec succès!', 'success');
      this.loadAllfactures(); 
      this.selectedClient = null
      this.selectedProducts = []
      this.totalAmount = 0
    });
  }

  resetForm(): void {
    this.selectedClient = null;
    this.selectedProducts = [];
    this.totalAmount = 0;
    this.totalProduit = 0;
    this.factureDate = new Date().toISOString().split('T')[0];
  }
  savedfactures: any[] = []
  loadAllfactures() {
    this.factureService.getAllfactures().then(factures => {
      this.savedfactures = factures.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
  
        if (dateB !== dateA) {
          return dateB - dateA;  
        }
          const numeroA = parseInt((a.numero || '0').split('/')[0], 10);
        const numeroB = parseInt((b.numero || '0').split('/')[0], 10);
        return numeroB - numeroA; 
      });
  
      this.factureNumber = (factures.length + 1) + '/' + this.year;
    });
  }
  selectedfacture: any = null;
  availableProducts : any[]=[]
  viewDetails(facture: any): void {
    this.selectedfacture = { ...facture }; 
    this.selectedfacture.isEditing = true; 
    this.availableProducts = this.produits.filter(
      (product) => !this.selectedfacture.products.some((p: any) => p.id === product.id)
    );

    this.availableProducts.forEach(product => {
      product.selectedQuantity = 0;
    });

  }
  deletefacture(factureId: number) {
    console.log(`Deleting facture with ID: ${factureId}`);
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
  editedProductId : any
  editPrice = false
  updatePrixVente(product: any, newPrix: number) {
    product.prixVente = parseFloat(newPrix.toFixed(3));
    this.calculateTotalAmount()   }
  updateTotalAmount() {
    let totalAmount = 0;
    this.selectedfacture.products.forEach((product: any) => {
      totalAmount += product.quantity * product.prixVente; 
    });
    this.selectedfacture.totalAmount = totalAmount + this.droit; 

  }
  updateFacture() {
    this.updateTotalAmount()
    this.factureService.updatefacture(this.selectedfacture.id, this.selectedfacture).then(
      (updatedCommand: any) => {
        const index = this.savedfactures.findIndex(cmd => (cmd.id) === (updatedCommand.id));
        this.savedfactures[index] = updatedCommand;
        this.selectedfacture = null; 
        alert('Commande mise à jour avec succès');
        this.loadAllfactures()
      },
      (error) => {
        console.error('Error updating command:', error);
        alert('Erreur lors de la mise à jour de la commande');
      }
    );
  }
  cancelEdit() {
    this.selectedfacture = null; 
  }
  removeProduct(index: number) {
    if (confirm('Are you sure you want to remove this product?')) {
      this.selectedfacture.products.splice(index, 1);
      this.updateTotalAmount();
    }
  }
  editFacture() {
    this.selectedfacture.isEditing = true; 
  }
  addProduct(product: any) {
    if (product.selectedQuantity > 0) {
      this.toastService.showToast('Produit Ajouté!', 'success');

      const newProduct = {
        ...product,
        quantity: product.selectedQuantity,
      };
      this.selectedfacture.products.push(newProduct);
      product.selectedQuantity = 0; 

      this.updateTotalAmount();
    } else {
      alert('Please enter a valid quantity.');
    }
  }
  areAllSelected: boolean = false;
  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.areAllSelected = isChecked;
    this.selectedfacture.products.forEach((product: any) => product.isSelected = isChecked);
  }

  updateSelectionState(): void {
    this.areAllSelected = this.selectedfacture.products.every((product: any) => product.isSelected);
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
  async generatePDF(facture: any ,i:any) {
    const doc = new jsPDF('p', 'mm', 'a4', true);
    let factureDate = new Date()
    facture.timestamp ? factureDate.setTime(facture.timestamp) :''
    doc.setFont('helvetica', 'bold');
    const logo = await this.loadImage('/assets/images/logo1.png');
    let factureNumber = facture.numero || (i+1)+'/'+this.year
    doc.addImage(logo, 'PNG', 15, 10, 60, 30);

    doc.setFontSize(11);
    doc.text(`Sousse le ${factureDate.toLocaleDateString('fr-FR')}`, 130, 16);
    doc.text('PROMOKA SHOP', 130, 24,);
    doc.text('ADRESSE : Rue 2 mars Akouda', 130, 32);
    doc.text('MF : 185560Y/N/M000', 130, 40);

    doc.setFontSize(16);
    doc.text(`FACTURE N° ${factureNumber}`, 105, 56, { align: 'center' });
    doc.setFontSize(11);

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
    const totalRows = 16; 
    while (rows.length < totalRows - 4) {
      rows.push(['', '', '', '']);
    }

    rows.push(
      ['', '', 'Total HT', totalAmount.toFixed(3)],
      ['', '', 'TVA', '0.000'],
      ['', '', 'Droit de Timbre', this.droit.toFixed(3)],
      ['', '', 'Total TTC', (totalAmount + this.droit).toFixed(3)]
    );
    autoTable(doc, {
      startY: 104,
      head: [['Désignation', 'Quantité ', 'Prix HT', 'Prix TTC']],
      body: rows,
      styles: {
        halign: 'center', 
        fontSize: 10, 
        textColor: [0, 0, 0], 
        fillColor: [255, 255, 255], 
        lineColor: [0, 0, 0], 
        lineWidth: 0.1 
      },
      headStyles: {
        fillColor: [19, 20, 77], 
        textColor: [255, 255, 255], 
        fontSize: 12, 
        halign: 'center' 
      },
      bodyStyles: {
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0], 
        fontSize: 11, 

      },
    
      columnStyles: {
        0: { halign: 'left' }, 
        3: { fontStyle: 'bold' } 
      },
      alternateRowStyles : {
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0] 
      },
     
    });

    const pageHeight = doc.internal.pageSize.height; 
    const pageWidth = doc.internal.pageSize.width; 

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');

    doc.text('Cachet et Signature', pageWidth - 70, pageHeight - 50); 
    doc.save(`Facture_${factureNumber}_${facture.client.id}.pdf`);
  }
  invoice : any
  currentDate: string = new Date().toLocaleDateString('fr-FR');
  totalHT: number = 0;
  totalTTC: number = 0;
  calculateTotal(): void {
    this.totalHT = this.invoice.products.reduce(
        (sum: number, product: any) => sum + product.quantity * product.prixVente,
        0
    );
    this.totalTTC = this.totalHT + this.invoice.droit;
  }
  printTicket(invoice:any): void {
    this.invoice = invoice
    this.calculateTotal()
    setTimeout(()=>{
    const ticketContent = document.getElementById('ticket')?.outerHTML;
    if (!ticketContent) return;
    const newWindow = window.open('', '_blank');
    newWindow?.document.write(`
      <html>
      <head>
        <title>Print Ticket</title>
        <style>
          /* Add your styles here if not using global styles */
          #ticket {
            width: 100mm;
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            margin: 0;
            padding: 10px;
            line-height: 1;
          }
          #ticket .header {
            text-align: center;
          }
          #ticket .footer {
            text-align: right;
          }
          #ticket .details {
            margin-top: 10px;
          }
          #ticket .items {
            width: 100%;
            border-collapse: collapse;
          }
          #ticket .items th, #ticket .items td {
            text-align: left;
            padding: 4px 0;
          }
          #ticket .items th {
            font-weight: bold;
            font-size: 12px;
            border-bottom: 1px dashed black;
          }
          #ticket .items td {
            font-size: 10px;
          }
          #ticket .totals {
            margin-top: 10px;
            text-align: right;
          }
          #ticket .totals div {
            margin: 4px 0;
          }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        ${ticketContent}
      </body>
      </html>
    `);
    newWindow?.document.close();},500)
  }
  sliceProductName(name: string): string {
    name = name.toUpperCase()
    if (name.length > 20) {
      return name.slice(0, 20) + '.';
    }
    return name;
  }
  async generateTicket(facture: any , i:any) {
    const doc =  new jsPDF('p', 'mm', [210, 3200]);
    let factureDate = new Date()
    facture.timestamp ? factureDate.setTime(facture.timestamp) :''
    // doc.setFont('helvetica', 'bold');
    const logo = await this.loadImage('/assets/images/logo1.png');
    const drawDashedLine = (yPos: number,start?:number,end?:number) => {
      yPos += 5;
      const startX = start||10;
      const endX = end||200; // You can adjust the line length here
      const dashLength = 2; // Length of each dash
      const gapLength = 1; // Gap between dashes
      for (let i = startX; i < endX; i += dashLength + gapLength) {
        doc.line(i, yPos, i + dashLength, yPos);
      }
      return yPos += 8
    };
    let font='Helvetica'    
    let factureNumber = facture.numero || (i+1)+'/'+this.year    // doc.addImage(logo, 'PNG', 130, 10, 60, 30);
    doc.setFont(font, 'bold');    
  
    doc.setFontSize(20);
    doc.text(`Ticket/B.L N° ${factureNumber}`, 15, 20);
    doc.text(`Date ${factureDate.toLocaleString('fr-FR')}`, 15, 30);
    drawDashedLine(30)
    doc.text('STE PROMOKA SHOP', 15, 45);
    doc.text('ADRESSE : Rue 2 mars Akouda', 15, 55);
    doc.text('MF : 185560Y/N/M000', 15, 65);
    drawDashedLine(65)
    doc.text('CLIENT : '+facture.client.nom, 15, 80);
    doc.text('ADRESSE : '+facture.client.adresse, 15, 90);
    doc.text('MF : '+facture.client.matricule, 15, 100);
    let totalAmount = facture.products.reduce((total: any, product: any) => {
      return total + (product.quantity * product.prixVente);
    }, 0);
    drawDashedLine(100)
    let yPosition = 130;
    doc.setFont(font, 'bold');
    doc.text('Designation', 10, yPosition);
    doc.text('Qté', 100, yPosition); // Adjusted x-position for Qté
    doc.text('P.U HT', 120, yPosition); // Adjusted x-position for P.U HT
    doc.text('Total', 160, yPosition); // Adjusted x-position for Total
    drawDashedLine(yPosition);
    yPosition=drawDashedLine(yPosition+1);
    // Table body
    doc.setFont(font, '');

    facture.products.forEach((product:any) => {
      doc.text(this.sliceProductName(product.nom), 10, yPosition);
      doc.text(String(product.quantity), 100, yPosition);
      doc.text(product.prixVente.toFixed(3), 120, yPosition);
      doc.text((product.quantity * product.prixVente).toFixed(3), 160, yPosition);
      yPosition=drawDashedLine(yPosition);
    });

    yPosition+=10
    yPosition=drawDashedLine(yPosition)
    doc.setFont(font, 'bold');

    doc.text('Total TTC:', 15, yPosition);
    doc.text((totalAmount ).toFixed(3), 50, yPosition);
    yPosition=drawDashedLine(yPosition);
    doc.save(`Facture_${factureNumber}_${facture.client.id}.pdf`);
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