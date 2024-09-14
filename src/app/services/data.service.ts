import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ELEMENT_DATA } from '../data/elementData';
import { PeriodicElement } from '../models/periodicElement.interface';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor() {}

  periodicElements = signal<PeriodicElement[]>(ELEMENT_DATA);

  getPeriodicElements(
    pageIndex: number,
    itemsPerPage: number
  ): Observable<{ paginatedData: PeriodicElement[]; count: number }> {
    const startIndex = pageIndex * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const data = [...this.periodicElements()];

    const paginatedData = data.slice(startIndex, endIndex);
    const count = data.length;

    return of({ paginatedData, count }).pipe(delay(2000));
  }
}
