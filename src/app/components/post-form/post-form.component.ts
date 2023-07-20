import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, catchError, combineLatest, map, startWith, tap } from 'rxjs';
import { DeclarativeCategoryService } from 'src/app/services/declarative-category.service';
import { DeclarativePostService } from 'src/app/services/declarative-post.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostFormComponent {
  postId = '';
  postForm = new UntypedFormGroup({
    title: new UntypedFormControl(''),
    description: new UntypedFormControl(''),
    categoryId: new UntypedFormControl(''),
  });
  selectedPostId$ = this.route.paramMap.pipe(
    map((paramMap) => {
      const id = paramMap.get('id')!;
      id && (this.postId = id);
      this.postService.selectPost(id);
      console.log(id);
      return id;
    })
  );

  post$ = this.postService.post$.pipe(
    tap((post) => {
      console.log(post, 'hehe');
      post &&
        this.postForm.setValue({
          title: post?.title,
          description: post?.description,
          categoryId: post?.categoryId,
        });
    }),
    catchError((error) => {
      console.log(`error is ${error}`);
      this.notificationService.setErrorMessage(error);
      return EMPTY;
    })
  );
  categories$ = this.categoryService.categories$;

  // ngOnInit() {
  //   console.log(this.route);
  // }

  // notification$ = this.notificationService.successMessageAction$.pipe(
  //   startWith(''),
  //   tap((message) => {
  //     if (message) {
  //       this.router.navigateByUrl('/declarativeposts');
  //     }
  //   })
  // );
  notification$ = this.postService.postCRUDCompleteAction$.pipe(
    startWith(false),
    tap((message) => {
      console.log('tap tap activated', message);
      if (message) {
        console.log(message, 'wooooo');
        this.router.navigateByUrl('/declarativeposts');
      }
    })
  );
  vm$ = combineLatest([
    this.selectedPostId$.pipe(
      tap((value) => {
        console.log(value, 'selectedpost');
      })
    ),
    this.post$.pipe(
      tap((value) => {
        console.log(value, 'post$');
      })
    ),
    this.notification$.pipe(
      tap((value) => {
        console.log(value, 'notification');
      })
    ),
  ]).pipe(
    tap((value) => {
      console.log('combine latest vm$', value);
    })
  );

  constructor(
    private categoryService: DeclarativeCategoryService,
    private route: ActivatedRoute, // private ref: ChangeDetectorRef
    private postService: DeclarativePostService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  onPostSubmit() {
    // console.log(this.postForm.value);
    let postDetails = this.postForm.value;
    if (this.postId) {
      // console.log('update post');
      postDetails = { ...postDetails, id: this.postId };
      this.postService.updatePost(postDetails);
    } else {
      // console.log('add post');
      this.postService.addPost(postDetails);
    }
  }
}
