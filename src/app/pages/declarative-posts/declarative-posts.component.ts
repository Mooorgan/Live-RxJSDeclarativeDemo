import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  BehaviorSubject,
  Subject,
  combineLatest,
  filter,
  from,
  map,
  mergeMap,
  tap,
} from 'rxjs';
import { DeclarativeCategoryService } from 'src/app/services/declarative-category.service';
import { DeclarativePostService } from 'src/app/services/declarative-post.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-declarative-posts',
  templateUrl: './declarative-posts.component.html',
  styleUrls: ['./declarative-posts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeclarativePostsComponent implements OnInit {
  // posts$ = this.postService.posts$;
  posts$ = this.postService.allPost$;
  categories$ = this.categoryService.categories$;

  selectedCategorySubject = new BehaviorSubject<string>('');
  selectedCategoryAction$ = this.selectedCategorySubject.asObservable();
  selectedCategoryId = '';

  filteredPost$ = combineLatest([
    this.posts$,
    this.selectedCategoryAction$,
  ]).pipe(
    tap(() => {
      this.loaderService.hideLoader();
    }),
    map(([posts, selectedCategory]) => {
      return posts.filter((post) => {
        return selectedCategory ? post.categoryId === selectedCategory : true;
      });
    })
  );

  // .pipe(
  //   mergeMap((post) => {
  //     return post;
  //   }),
  //   filter((post) => {
  //     return this.selectedCategoryId
  //       ? post.categoryId === this.selectedCategoryId
  //       : true;
  //   })
  // );

  ngOnInit(): void {
    // setTimeout(() => {
    //   this.loaderService.showLoader();
    // }, 0);
    this.loaderService.showLoader();
  }

  constructor(
    private postService: DeclarativePostService,
    private categoryService: DeclarativeCategoryService,
    private loaderService: LoaderService
  ) {}

  onCategoryChange(event: Event) {
    const selectedCategoryId = (event.target as HTMLSelectElement).value;
    // console.log('hello');
    console.log(selectedCategoryId);
    // this.selectedCategoryId = selectedCategoryId;
    this.selectedCategorySubject.next(selectedCategoryId);
  }
}
