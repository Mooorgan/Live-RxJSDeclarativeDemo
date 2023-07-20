import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, EMPTY, catchError, tap } from 'rxjs';
import { IPost } from 'src/app/models/IPost';
import { DeclarativePostService } from 'src/app/services/declarative-post.service';

@Component({
  selector: 'app-single-post',
  templateUrl: './single-post.component.html',
  styleUrls: ['./single-post.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SinglePostComponent {
  showUpdatePost = false;
  array: string[] = [];
  errorMessageSubject = new BehaviorSubject<string>('');
  errorMessage$ = this.errorMessageSubject.asObservable();
  // errorMessage = '';
  post$ = this.postService.post$.pipe(
    tap(() => {
      this.showUpdatePost = false;
    }),
    catchError((error: string) => {
      this.errorMessageSubject.next(error);
      console.log(error);
      return EMPTY;
    })
  );

  constructor(private postService: DeclarativePostService) {}

  // ngOnInit() {
  //   console.log(this.showUpdatePost, 'ngOnInit');
  //   this.showUpdatePost = true;
  //   this.array = ['hello', 'My', 'Name', 'is', 'Leela', 'Web', 'Dev'];
  //   console.log(this.showUpdatePost, 'ngOnInit1');
  // }

  onUpdatePost() {
    // console.log('Hello ');
    // console.log(this.showUpdatePost);
    this.showUpdatePost = true;
    // console.log(this.showUpdatePost);
  }

  onDeletePost(post: IPost) {
    if (confirm('Are you sure you want to delete?')) {
      this.postService.deletePost(post);
    }
  }
}
