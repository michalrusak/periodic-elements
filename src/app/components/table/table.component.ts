import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { startWith, Subscription, switchMap } from 'rxjs';
import { PeriodicElement } from '../../models/periodicElement.interface';
import { DataService } from '../../services/data.service';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, SpinnerComponent, CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements AfterViewInit {
  sub = new Subscription();
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource!: MatTableDataSource<PeriodicElement>;
  isLoading = true;
  count = 0;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  constructor(private dataService: DataService) {}

  ngAfterViewInit() {
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

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
