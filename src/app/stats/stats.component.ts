import { Component, OnInit } from '@angular/core';
import { FactureService } from '../services/facture.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit{
  savedfactures: any[] = []
  filteredFactures: any[] = [];
  startDate: string = new Date('2025-01-01T01:00:00.000').toISOString().substring(0, 10); 
  endDate: string = new Date().toISOString().substring(0, 10);
  password: string = '';
  showTable: boolean = false;
  constructor(private factureService : FactureService){

  }
  ngOnInit(): void {
    this.loadAllfactures() 
   }

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
      });
  }
  unlockTable() {
    if (this.password === 'MMK13032022') {
      this.filterFacturesByDate();
      this.showTable = true;
    } else {
      alert('Incorrect password');
    }
  }

  filterFacturesByDate() {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    end.setHours(23, 59, 59, 999);  // include the full day

    this.filteredFactures = this.savedfactures.filter(facture => {
      const factureDate = new Date(facture.timestamp);
      return factureDate >= start && factureDate <= end;
    });
  }

  calculateTotalVente(facture: any): number {
    return facture.products.reduce((total: number, product: any) => total + (product.quantity * product.prixVente), 0);
  }

  calculateTotalBenefice(facture: any): number {
    return facture.products.reduce((total: number, product: any) => total + (product.quantity * (product.prixVente - product.prixAchat)), 0);
  }

  get totalVenteAll(): number {
    return this.filteredFactures.reduce((sum, f) => sum + this.calculateTotalVente(f), 0);
  }

  get totalBeneficeAll(): number {
    return this.filteredFactures.reduce((sum, f) => sum + this.calculateTotalBenefice(f), 0);
  }
}
