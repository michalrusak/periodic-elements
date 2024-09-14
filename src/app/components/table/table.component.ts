import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { debounceTime, of, startWith, Subscription, switchMap } from 'rxjs';
import { PeriodicElement } from '../../models/periodicElement.interface';
import { DataService } from '../../services/data.service';
import { EditPopupComponent } from '../edit-popup/edit-popup.component';
import { SpinnerComponent } from '../spinner/spinner.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSort } from '@angular/material/sort';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    SpinnerComponent,
    CommonModule,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements OnInit, AfterViewInit {
  sub = new Subscription();
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'edit'];
  dataSource!: MatTableDataSource<PeriodicElement>;
  isLoading = true;
  count = 0;

  readonly dialog = inject(MatDialog);

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dataService: DataService) {}

  form = new FormGroup({
    filter: new FormControl('', {
      nonNullable: true,
    }),
  });

  ngOnInit(): void {
    this.getFilterData();
  }

  getFilterData() {
    this.sub.add(
      this.form.controls.filter.valueChanges
        .pipe(debounceTime(500))
        .subscribe((value) => {
          this.fetchData(value);
        })
    );
  }

  fetchData(filterValue = ''): void {
    this.sub.add(
      this.paginator.page
        .pipe(
          startWith({}),
          switchMap(() => {
            this.isLoading = true;
            return this.dataService.getPeriodicElements(
              this.paginator.pageIndex,
              this.paginator.pageSize,
              filterValue
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
