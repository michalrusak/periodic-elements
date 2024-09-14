import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { startWith, Subscription, switchMap } from 'rxjs';
import { PeriodicElement } from '../../models/periodicElement.interface';
import { DataService } from '../../services/data.service';
import { EditPopupComponent } from '../edit-popup/edit-popup.component';
import { SpinnerComponent } from '../spinner/spinner.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    SpinnerComponent,
    CommonModule,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements AfterViewInit {
  sub = new Subscription();
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'edit'];
  dataSource!: MatTableDataSource<PeriodicElement>;
  isLoading = true;
  count = 0;

  readonly dialog = inject(MatDialog);

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dataService: DataService) {}

  fetchData() {
    this.sub.add(
      this.paginator.page
        .pipe(
          startWith({}),
          switchMap(() => {
            this.isLoading = true;
            return this.dataService.getPeriodicElements(
              this.paginator.pageIndex,
              this.paginator.pageSize
            );
          })
        )
        .subscribe((data) => {
          this.dataSource = new MatTableDataSource(data.paginatedData);
          this.count = data.count;
          this.isLoading = false;
        })
    );
  }

  ngAfterViewInit() {
    this.fetchData();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  openDialog(position: number, name: string): void {
    const dialogRef = this.dialog.open(EditPopupComponent, {
      data: { name },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        if (result === name) return;

        this.dataService.updatePeriodicElement(position, result);
        this.fetchData();
      }
    });
  }
}
