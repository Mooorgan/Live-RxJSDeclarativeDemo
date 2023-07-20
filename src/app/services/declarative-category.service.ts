import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICategory } from '../models/ICategory';
import { map, share, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeclarativeCategoryService {
  categories$ = this.http
    .get<{ [id: string]: ICategory }>(
      `https://angular-rxjsreactive-default-rtdb.asia-southeast1.firebasedatabase.app/categories.json`
    )
    .pipe(
      map((categories) => {
        const categoriesData: ICategory[] = [];
        for (const id in categories) {
          // console.log(id, categories[id]);
          categoriesData.push({ ...categories[id], id });
        }
        // console.log(categoriesData);
        return categoriesData;
      }),
      shareReplay(1)
      // share()
    );
  constructor(private http: HttpClient) {}
}
