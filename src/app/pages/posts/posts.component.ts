import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { IPost } from 'src/app/models/IPost';
import { PostService } from 'src/app/services/post.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostsComponent implements OnInit, OnDestroy {
  posts!: IPost[];
  // { categoryId: '123', id: '12', description: 'abc', title: 'haha' },
  postSubscription!: Subscription;
  intervalSubscription!: Subscription;
  constructor(
    private postService: PostService,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getPosts();
  }

  getPosts() {
    // this.intervalSubscription = interval(1000).subscribe({
    //   next: (data) => {
    //     console.log(data);
    //   },
    //   error: (err) => {
    //     console.log(`This is ${err}`);
    //   },
    //   complete: () => {
    //     console.log('interval completed');
    //   },
    // });
    this.postSubscription = this.postService.getPostsWithCategory().subscribe({
      next: (data) => {
        console.log(data);
        this.posts = data;
        console.log(this.posts);
        this.ref.detectChanges();
      },

      error: (err) => {
        console.log(`This is ${err}`);
      },
      complete: () => {
        console.log('http call completed');
      },
    });
  }

  ngOnDestroy(): void {
    this.postSubscription && this.postSubscription.unsubscribe();
    this.intervalSubscription && this.intervalSubscription.unsubscribe();
  }
}
