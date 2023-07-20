import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CRUDAction, IPost } from '../models/IPost';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  combineLatest,
  concatMap,
  delay,
  map,
  merge,
  of,
  scan,
  share,
  shareReplay,
  tap,
  throwError,
  timer,
} from 'rxjs';
import { CategoryService } from './category.service';
import { DeclarativeCategoryService } from './declarative-category.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class DeclarativePostService {
  posts$ = this.http
    .get<{ [id: string]: IPost }>(
      `https://angular-rxjsreactive-default-rtdb.asia-southeast1.firebasedatabase.app/posts.json`
    )
    .pipe(
      tap((value) => {
        console.log('FIRST posts$ from database ran', value);
      }),
      map((posts) => {
        let postsData: IPost[] = [];
        for (let id in posts) {
          postsData.push({ ...posts[id], id });
        }
        return postsData;
      }),
      // delay(2000),
      catchError(this.handleError),
      shareReplay(1)
      // share()
    );

  postWithCategory$ = combineLatest([
    //can also be done with forkJoin
    this.posts$,
    this.categoryService.categories$,
  ]).pipe(
    tap((value) => {
      console.log('postWithCategory$ ran', value);
    }),

    map(([posts, categories]) => {
      console.log(posts, 'hehe');
      return posts.map((post) => {
        return {
          ...post,
          categoryName: categories.find(
            (category) => category.id === post.categoryId
          )?.title,
        } as IPost;
      });
    }),
    catchError(this.handleError),
    shareReplay(1)
  );

  private postCRUDSubject = new Subject<CRUDAction<IPost>>();
  postCRUDAction$ = this.postCRUDSubject.asObservable().pipe(
    tap((value) => {
      console.log('postCRUDAction$ ran', value);
    })
  );

  private postCRUDCompleteSubject = new Subject<boolean>();
  postCRUDCompleteAction$ = this.postCRUDSubject.asObservable();

  allPost$ = merge(
    this.postWithCategory$,
    this.postCRUDAction$.pipe(
      tap((value) => {
        console.log('POSTcrudaction$ ran', value);
      }),
      concatMap((postAction) =>
        this.savePosts(postAction).pipe(
          map((post) => {
            return {
              ...postAction,
              data: post,
            };
          })
        )
      ),
      catchError((err) => {
        console.log('peep');
        return this.handleError(err);
      })
    )
  ).pipe(
    tap((value) => {
      console.log('allposts$ ran');
    }),
    // tap(console.log),
    scan((posts, value: IPost[] | CRUDAction<IPost>) => {
      // return [...posts, ...value];
      return this.modifyPosts(posts, value);
    }, [] as IPost[]),
    catchError(this.handleError),
    shareReplay(1)
    // map(([value1, value2]) => {
    //   console.log('HEYYY', value1, value2);
    //   return [...value1, ...value2];
    // })
  );

  modifyPosts(posts: IPost[], value: IPost[] | CRUDAction<IPost>) {
    if (!(value instanceof Array)) {
      if (value.action === 'add') {
        return [...posts, value.data];
      }
      if (value.action === 'update') {
        return posts.map((post) =>
          post.id === value.data.id ? value.data : post
        );
      }
      if (value.action === 'delete') {
        return posts.filter((post) => post.id !== value.data.id);
      }
    } else {
      return value;
    }
    return posts;
  }

  savePosts(postAction: CRUDAction<IPost>) {
    let postDetails$!: Observable<IPost>;
    if (postAction.action === 'add') {
      postDetails$ = this.addPostToServer(postAction.data).pipe(
        tap(() => {
          this.notificationService.setSuccessMessage('Post added Successfully');
          this.postCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (postAction.action === 'update') {
      postDetails$ = this.updatePostToServer(postAction.data).pipe(
        tap(() => {
          console.log('TAP of updatePostToServer Executing');
          this.notificationService.setSuccessMessage(
            'Post updated Successfully'
          );
          this.postCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (postAction.action === 'delete') {
      return this.deletePostToServer(postAction.data).pipe(
        tap(() => {
          this.notificationService.setSuccessMessage(
            'Post deleted Successfully'
          );
          this.postCRUDCompleteSubject.next(true);
        }),
        map((_) => {
          return postAction.data;
        }),
        catchError(this.handleError)
      );
    }
    return postDetails$.pipe(
      concatMap((post) =>
        this.categoryService.categories$.pipe(
          map((categories) => {
            return {
              ...post,
              categoryName: categories.find(
                (category) => category.id === post.categoryId
              )?.title,
            };
          })
        )
      )
    );
  }

  deletePostToServer(post: IPost) {
    return this.http.delete(
      `https://angular-rxjsreactive-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${post.id}.json`
    );
  }

  updatePostToServer(post: IPost) {
    return this.http.patch<IPost>(
      `https://angularr-rxjsreactive-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${post.id}.json`,
      post
    );
  }

  addPostToServer(post: IPost) {
    return this.http
      .post<{ name: string }>(
        `https://angular-rxjsreactive-default-rtdb.asia-southeast1.firebasedatabase.app/posts.json`,
        post
      )
      .pipe(
        map((id) => {
          return {
            ...post,
            id: id.name,
          };
        })
      );
  }

  addPost(post: IPost) {
    this.postCRUDSubject.next({ action: 'add', data: post });
  }
  updatePost(post: IPost) {
    this.postCRUDSubject.next({ action: 'update', data: post });
  }

  deletePost(post: IPost) {
    this.postCRUDSubject.next({ action: 'delete', data: post });
  }

  private selectedPostSubject = new BehaviorSubject<string>('');
  selectedPostAction$ = this.selectedPostSubject.asObservable().pipe(
    tap((value) => {
      console.log('selectedPostAction$ ran', value);
    })
  );

  constructor(
    private http: HttpClient,
    private categoryService: DeclarativeCategoryService,
    private notificationService: NotificationService
  ) {}

  post$ = combineLatest([this.allPost$, this.selectedPostAction$]).pipe(
    tap((value) => {
      console.log(value, 'post$ ran');
    }),
    map(([posts, selectedPostId]) => {
      return posts.find((post) => post.id === selectedPostId);
    }),
    catchError((err) => {
      console.log('peep from post$');
      return this.handleError(err);
    }),
    shareReplay(1)
  );

  selectPost(postId: string) {
    console.log(postId, 'POSTID FROM SELECT POST METHOD');
    this.selectedPostSubject.next(postId);
  }

  handleError(error: Error) {
    console.log(error);
    return throwError(() => {
      return 'unknown error occurred. Please try again';
    });
  }
}
