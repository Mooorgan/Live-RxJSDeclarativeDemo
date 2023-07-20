import { Component } from '@angular/core';
import { combineLatest, map, tap } from 'rxjs';
import { IPost } from 'src/app/models/IPost';
import { DeclarativePostService } from 'src/app/services/declarative-post.service';

@Component({
  selector: 'app-alt-posts',
  templateUrl: './alt-posts.component.html',
  styleUrls: ['./alt-posts.component.scss'],
})
export class AltPostsComponent {
  showAddPost = false;
  posts$ = this.postService.allPost$.pipe(
    tap((posts) => {
      console.log('from inside allpost');
      posts[0].id && this.postService.selectPost(posts[0].id);
    })
  );
  selectedPost$ = this.postService.post$;

  vm$ = combineLatest([this.posts$, this.selectedPost$]).pipe(
    map(([posts, selectedPost]) => {
      console.log('from alt post combine latest');
      return { posts, selectedPost };
    })
  );
  constructor(private postService: DeclarativePostService) {}

  onSelectPost(post: IPost, event: Event) {
    event.preventDefault();
    console.log(post);
    this.showAddPost = false;

    this.postService.selectPost(post.id);
  }

  onAddPost() {
    this.showAddPost = true;
  }
}
