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
    itemsPerPage: number,
    filterValue: string
  ): Observable<{ paginatedData: PeriodicElement[]; count: number }> {
    const startIndex = pageIndex * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    let paginatedData = this.periodicElements().slice(startIndex, endIndex);
    const count = this.periodicElements().length;

    if (filterValue) {
      const filteredData = this.periodicElements().filter((element) =>
        Object.values(element).some((val) =>
          val.toString().toLowerCase().includes(filterValue.toLowerCase())
        )
      );

      paginatedData = filteredData.slice(startIndex, endIndex);
    }

    return of({ paginatedData, count }).pipe(delay(2000));
  }

  updatePeriodicElement(id: number, name: string): void {
    const index = this.periodicElements().findIndex(
      (element) => element.position === id
    );

    const data = this.periodicElements();

    if (index !== -1) {
      const updatedData = [...data];
      updatedData[index] = { ...updatedData[index], name };

      this.periodicElements.set(updatedData);
    }
  }
}
